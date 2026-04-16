import os
import uuid
import shutil
import json
import sqlite3
import threading
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

from models.whisper_model import transcribe_audio
from utils.clip_generator import extract_highlights_from_llm, extract_highlights_keyword, generate_clips
from utils.image_generator import generate_zitat_bilder
from utils.caption_generator import generate_captions
from utils.zip_exporter import create_result_zip

app = FastAPI(
    title="KirchenKI Marketing – Predigt-to-Social API",
    description="Predigt hochladen → Clips, Zitat-Bilder & Captions in Minuten",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "./data/uploads"
OUTPUT_DIR = "./data/outputs"
DB_PATH = "./data/jobs.db"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("./data", exist_ok=True)

ALLOWED_EXTENSIONS = {".mp4", ".mp3", ".m4a", ".mov", ".wav"}
MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024  # 2 GB

# Thread-local SQLite connections
_local = threading.local()


def get_db():
    if not hasattr(_local, "conn") or _local.conn is None:
        _local.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row
    return _local.conn


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            job_id TEXT PRIMARY KEY,
            data   TEXT NOT NULL,
            updated_at REAL DEFAULT (unixepoch())
        )
    """)
    conn.commit()
    conn.close()


init_db()


def set_job_status(job_id: str, data: dict):
    conn = get_db()
    conn.execute(
        "INSERT OR REPLACE INTO jobs (job_id, data, updated_at) VALUES (?, ?, unixepoch())",
        (job_id, json.dumps(data)),
    )
    conn.commit()


def get_job_status(job_id: str):
    conn = get_db()
    row = conn.execute("SELECT data FROM jobs WHERE job_id = ?", (job_id,)).fetchone()
    if row is None:
        return None
    return json.loads(row["data"])


openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def process_video_job(job_id: str, input_path: str):
    """Background task: full pipeline for one upload."""
    job_dir = os.path.join(OUTPUT_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    try:
        # Step 1: Transcription
        set_job_status(job_id, {"status": "transcribing", "progress": 10})
        result = transcribe_audio(input_path)
        transcript_text = result["text"]
        segments = result["segments"]

        # Step 2: Find highlights
        set_job_status(job_id, {"status": "analyzing", "progress": 30})
        highlights = extract_highlights_from_llm(transcript_text, segments, openai_client)
        if not highlights:
            highlights = extract_highlights_keyword(segments)

        if not highlights:
            set_job_status(job_id, {"status": "error", "message": "Keine Highlights gefunden"})
            return

        # Step 3: Cut clips
        set_job_status(job_id, {"status": "cutting_clips", "progress": 50})
        clips = generate_clips(input_path, highlights, job_dir, job_id)

        # Step 4: Generate quote images
        set_job_status(job_id, {"status": "generating_images", "progress": 65})
        bilder = []
        if os.getenv("REPLICATE_API_TOKEN"):
            bilder = generate_zitat_bilder(highlights, job_dir, job_id)
        else:
            print("[Bilder] REPLICATE_API_TOKEN fehlt – überspringe Bildgenerierung")

        # Step 5: Generate captions
        set_job_status(job_id, {"status": "generating_captions", "progress": 80})
        captions = []
        if os.getenv("OPENAI_API_KEY"):
            captions = generate_captions(highlights, job_dir, job_id, openai_client)

        # Step 6: Create ZIP
        set_job_status(job_id, {"status": "zipping", "progress": 95})
        zip_path = create_result_zip(job_id, job_dir, clips, bilder, captions)

        set_job_status(job_id, {
            "status": "done",
            "progress": 100,
            "clips": len(clips),
            "bilder": len(bilder),
            "captions": len(captions),
            "download_url": f"/download/{job_id}",
            "highlights": [
                {"title": h.title, "keyword": h.keyword, "summary": h.summary}
                for h in highlights
            ],
        })

    except Exception as e:
        print(f"[Job {job_id}] Fehler: {e}")
        set_job_status(job_id, {"status": "error", "message": str(e)})
    finally:
        if os.path.exists(input_path):
            os.remove(input_path)


@app.post("/upload", summary="Predigt hochladen & verarbeiten")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Dateiformat nicht unterstützt. Erlaubt: {', '.join(ALLOWED_EXTENSIONS)}")

    job_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")

    with open(input_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_size = os.path.getsize(input_path)
    if file_size > MAX_FILE_SIZE_BYTES:
        os.remove(input_path)
        raise HTTPException(413, "Datei zu groß (max 2 GB)")

    set_job_status(job_id, {"status": "queued", "progress": 0})
    background_tasks.add_task(process_video_job, job_id, input_path)

    return {
        "job_id": job_id,
        "message": "Upload erfolgreich – Verarbeitung läuft im Hintergrund",
        "status_url": f"/status/{job_id}",
    }


@app.get("/status/{job_id}", summary="Job-Status abfragen")
async def get_status(job_id: str):
    status = get_job_status(job_id)
    if status is None:
        raise HTTPException(404, "Job nicht gefunden")
    return status


@app.get("/download/{job_id}", summary="Ergebnisse als ZIP herunterladen")
async def download_results(job_id: str):
    job_dir = os.path.join(OUTPUT_DIR, job_id)
    zip_path = os.path.join(job_dir, f"{job_id}_results.zip")
    if not os.path.exists(zip_path):
        raise HTTPException(404, "ZIP nicht gefunden – noch in Bearbeitung oder Job existiert nicht")
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=f"kirchenki_marketing_{job_id[:8]}.zip",
    )


@app.post("/feedback/{job_id}", summary="Feedback speichern")
async def submit_feedback(job_id: str, feedback: dict):
    print(f"[Feedback] Job {job_id}: {feedback}")
    return {"message": "Feedback gespeichert – danke!"}


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.2.0"}
