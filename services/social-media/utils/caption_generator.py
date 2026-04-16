import os
import json
from pydantic import BaseModel
from typing import List

class CaptionSet(BaseModel):
    variant1: str
    variant2: str
    variant3: str
    hashtags: List[str]
    full_text: str
    keyword: str

def generate_captions(highlights, output_dir: str, job_id: str, openai_client) -> list:
    """
    Generate 3 caption variants per highlight using OpenAI gpt-4o-mini.
    Saves each as a .txt file and returns list of file paths.
    """
    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/captions.txt")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    caption_files = []

    for i, h in enumerate(highlights[:5]):
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Du bist ein Social-Media-Experte für Kirchen. Antworte nur mit JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt_template + f"\nClip-Inhalt: {h.summary}\nKeyword: {h.keyword}"
                    }
                ],
                temperature=0.7,
                max_tokens=300,
            )

            raw = response.choices[0].message.content.strip()
            # Strip markdown code block if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                # Fallback: use raw as variant1
                data = {
                    "variant1": raw[:140],
                    "variant2": h.summary[:100],
                    "variant3": f"Was denkst du darüber? – {h.keyword}",
                    "hashtags": ["#GlaubeLeben", "#PredigtClip", "#KircheDigital", "#JesusLebt", "#Gemeinde"]
                }

            caption = CaptionSet(
                variant1=data.get("variant1", "")[:140],
                variant2=data.get("variant2", "")[:140],
                variant3=data.get("variant3", "")[:140],
                hashtags=data.get("hashtags", ["#Kirche"])[:5],
                full_text=h.summary,
                keyword=h.keyword,
            )

            safe_kw = h.keyword.replace("/", "-").replace(" ", "_")
            txt_path = os.path.join(output_dir, f"{job_id}_caption_{i+1:02d}_{safe_kw}.txt")

            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(f"=== Caption für Clip {i+1}: {h.title} ===\n\n")
                f.write(f"Variant 1 (emotional):\n{caption.variant1}\n\n")
                f.write(f"Variant 2 (kurz & direkt):\n{caption.variant2}\n\n")
                f.write(f"Variant 3 (mit Frage):\n{caption.variant3}\n\n")
                f.write(f"Hashtags:\n{' '.join(caption.hashtags)}\n\n")
                f.write(f"---\nOriginaltext:\n{caption.full_text}\n")

            caption_files.append(txt_path)
            print(f"[Caption {i+1}] Gespeichert: {txt_path}")

        except Exception as e:
            print(f"[Caption {i+1}] Fehler für {h.keyword}: {e}")
            continue

    return caption_files
