import os
import zipfile
import json
from typing import List

def create_result_zip(
    job_id: str,
    output_dir: str,
    clips: List[str],
    bilder: list,
    captions: List[str],
) -> str:
    """
    Pack all results into a ZIP file.
    Returns the path to the ZIP.
    """
    zip_path = os.path.join(output_dir, f"{job_id}_results.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        # 1. Clips
        for clip_path in clips:
            if os.path.exists(clip_path):
                zipf.write(clip_path, arcname=f"clips/{os.path.basename(clip_path)}")

        # 2. Zitat-Bilder
        for bild in bilder:
            if os.path.exists(bild.file_path):
                zipf.write(bild.file_path, arcname=f"bilder/{os.path.basename(bild.file_path)}")

        # 3. Captions
        for cap_path in captions:
            if os.path.exists(cap_path):
                zipf.write(cap_path, arcname=f"captions/{os.path.basename(cap_path)}")

        # 4. Info JSON
        info = {
            "job_id": job_id,
            "clips_count": len(clips),
            "clips": [os.path.basename(c) for c in clips],
            "bilder_count": len(bilder),
            "bilder": [{"zitat": b.zitat, "keyword": b.keyword} for b in bilder],
            "captions_count": len(captions),
            "captions": [os.path.basename(c) for c in captions],
        }
        info_json = json.dumps(info, indent=2, ensure_ascii=False)
        zipf.writestr("info.json", info_json)

    print(f"[ZIP] Erstellt: {zip_path}")
    return zip_path
