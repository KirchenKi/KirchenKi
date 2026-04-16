from faster_whisper import WhisperModel
import os

_model = None

def get_model(model_size: str = None):
    """Lazy-load Faster-Whisper model (singleton)."""
    global _model
    if _model is None:
        size = model_size or os.getenv("WHISPER_MODEL", "base")
        print(f"[Whisper] Loading model: {size}")
        _model = WhisperModel(size, device="cpu", compute_type="int8")
    return _model

def transcribe_audio(file_path: str, language: str = "de") -> dict:
    """
    Transcribe audio/video file with Faster-Whisper.
    Returns dict with 'text' and 'segments' (with timestamps).
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    model = get_model()
    print(f"[Whisper] Transcribing: {file_path}")

    segments_gen, info = model.transcribe(
        file_path,
        language=language,
        beam_size=5,
        vad_filter=True,  # skip silent parts automatically
    )

    # Convert generator to list
    segments = []
    full_text = ""
    for seg in segments_gen:
        segments.append({
            "id": seg.id,
            "start": seg.start,
            "end": seg.end,
            "text": seg.text,
        })
        full_text += seg.text + " "

    return {
        "text": full_text.strip(),
        "segments": segments,
        "language": info.language,
    }
