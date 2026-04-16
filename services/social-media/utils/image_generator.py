import os
import requests
import httpx
import json
import time
from pydantic import BaseModel
from typing import List

class ZitatBild(BaseModel):
    zitat: str
    bild_url: str
    file_path: str
    keyword: str

def generate_zitat_bilder(highlights, output_dir: str, job_id: str) -> List[ZitatBild]:
    """
    Generate quote images using Replicate Flux.1-dev via direct HTTP API (no SDK).
    """
    api_token = os.getenv("REPLICATE_API_TOKEN")
    if not api_token:
        print("[Bilder] REPLICATE_API_TOKEN fehlt – überspringe Bildgenerierung")
        return []

    prompt_path = os.path.join(os.path.dirname(__file__), "../prompts/image_prompt.txt")
    with open(prompt_path, "r", encoding="utf-8") as f:
        prompt_template = f.read()

    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
        "Prefer": "wait",  # wait for result directly
    }

    bilder: List[ZitatBild] = []

    for i, h in enumerate(highlights[:5]):
        zitat = h.summary[:80] + "..." if len(h.summary) > 80 else h.summary
        full_prompt = prompt_template.replace('" "', f'"{zitat}"')
        full_prompt += f"\nKeyword-Stimmung: {h.keyword}"

        try:
            # Start prediction
            payload = {
                "input": {
                    "prompt": full_prompt,
                    "aspect_ratio": "1:1",
                    "output_format": "png",
                    "num_outputs": 1,
                    "safety_tolerance": 2,
                    "guidance": 3.5,
                }
            }

            response = httpx.post(
                "https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions",
                headers=headers,
                json=payload,
                timeout=120,
            )

            result = response.json()

            # Poll if not done yet
            if result.get("status") not in ("succeeded", "failed"):
                prediction_id = result.get("id")
                for _ in range(30):  # max 60s polling
                    time.sleep(2)
                    poll = httpx.get(
                        f"https://api.replicate.com/v1/predictions/{prediction_id}",
                        headers=headers,
                        timeout=30,
                    )
                    result = poll.json()
                    if result.get("status") in ("succeeded", "failed"):
                        break

            if result.get("status") != "succeeded":
                print(f"[Bild {i+1}] Fehlgeschlagen: {result.get('error', 'unknown')}")
                continue

            output = result.get("output", [])
            img_url = output[0] if isinstance(output, list) and output else None

            if not img_url:
                print(f"[Bild {i+1}] Kein Output URL")
                continue

            # Download image
            safe_kw = h.keyword.replace("/", "-").replace(" ", "_")
            img_path = os.path.join(output_dir, f"{job_id}_zitat_{i+1:02d}_{safe_kw}.png")

            img_response = requests.get(img_url, timeout=30)
            if img_response.status_code == 200:
                with open(img_path, "wb") as f:
                    f.write(img_response.content)
                bilder.append(ZitatBild(
                    zitat=zitat,
                    bild_url=img_url,
                    file_path=img_path,
                    keyword=h.keyword,
                ))
                print(f"[Bild {i+1}] Gespeichert: {img_path}")
            else:
                print(f"[Bild {i+1}] Download fehlgeschlagen: {img_response.status_code}")

        except Exception as e:
            print(f"[Bild {i+1}] Fehler: {e}")
            continue

    return bilder
