import os
import json
from pydantic import BaseModel
from typing import List

class Highlight(BaseModel):
    start: float
    end: float
    title: str
    keyword: str
    summary: str

KEYWORDS = [
    "Gnade", "Hoffnung", "Kreuz", "Auferstehung", "Liebe",
    "Erlösung", "Glaube", "Vergebung", "Frieden", "Freude",
]

def extract_highlights_from_llm(transcript_text: str, segments: list, openai_client) -> List[Highlight]:
    """
    Use OpenAI GPT to find the best highlight moments from the transcript.
    Falls back to keyword-based detection if LLM call fails.
    """
    try:
        prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/highlights.txt")
        with open(prompt_path, "r", encoding="utf-8") as f:
            prompt_template = f.read()

        # Build segment map for context
        segment_map = "\n".join(
            [f"[{seg['start']:.1f}s - {seg['end']:.1f}s]: {seg['text'].strip()}" for seg in segments[:200]]
        )
        full_prompt = prompt_template + f"\n\nTranskript mit Zeitstempeln:\n{segment_map}"

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Du bist ein Predigt-Experte. Antworte nur mit JSON."},
                {"role": "user", "content": full_prompt},
            ],
            temperature=0.3,
            max_tokens=1000,
        )

        raw = response.choices[0].message.content.strip()
        # Strip markdown code block if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)

        highlights = []
        for item in data:
            try:
                h = Highlight(
                    start=float(item.get("start_sec", item.get("start", 0))),
                    end=float(item.get("end_sec", item.get("end", 0))),
                    title=str(item.get("title", ""))[:20],
                    keyword=str(item.get("keyword", "Glaube")),
                    summary=str(item.get("summary", "")),
                )
                if h.end > h.start:
                    highlights.append(h)
            except Exception:
                continue

        return highlights[:8]

    except Exception as e:
        print(f"[LLM Highlights] Fehler, fallback auf Keywords: {e}")
        return extract_highlights_keyword(segments)


def extract_highlights_keyword(segments: list) -> List[Highlight]:
    """Keyword-based fallback highlight detection."""
    highlights = []
    for seg in segments:
        text = seg.get("text", "").strip()
        start = seg.get("start", 0)
        end = seg.get("end", 0)

        if end - start < 5:
            continue  # skip short/silent segments

        matched_kw = next((kw for kw in KEYWORDS if kw.lower() in text.lower()), None)
        if matched_kw:
            title = text[:20] + "..." if len(text) > 20 else text
            highlights.append(Highlight(
                start=start,
                end=end,
                title=title,
                keyword=matched_kw,
                summary=text[:150],
            ))

    highlights.sort(key=lambda h: (h.end - h.start), reverse=True)
    return highlights[:8]


def generate_clips(input_path: str, highlights: List[Highlight], output_dir: str, job_id: str) -> list:
    """
    Cut video clips from highlights using moviepy.
    Returns list of clip file paths.
    """
    from moviepy.editor import VideoFileClip

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Video nicht gefunden: {input_path}")

    clips = []
    video = VideoFileClip(input_path)
    total_duration = video.duration

    for i, h in enumerate(highlights):
        try:
            start = max(0, h.start)
            end = min(total_duration, h.end)

            if end - start < 5:
                print(f"[Clip {i+1}] Zu kurz ({end - start:.1f}s), skip")
                continue
            if end - start > 60:
                end = start + 60  # cap at 60s for Reels/TikTok

            clip = video.subclip(start, end)
            clip = clip.fadein(0.5).fadeout(0.5)

            safe_kw = h.keyword.replace("/", "-").replace(" ", "_")
            clip_path = os.path.join(output_dir, f"{job_id}_clip_{i+1:02d}_{safe_kw}.mp4")

            clip.write_videofile(
                clip_path,
                codec="libx264",
                audio_codec="aac",
                preset="ultrafast",
                threads=4,
                logger=None,
            )
            clips.append(clip_path)
            print(f"[Clip {i+1}] Gespeichert: {clip_path}")

        except Exception as e:
            print(f"[Clip {i+1}] Fehler: {e}")
            continue

    video.close()
    return clips
