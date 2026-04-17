"""
Option C: Thin frames (every 2nd) + convert to WebP
  Source:  frames_jpg/out_0001.jpg … out_8511.jpg  (8511 frames)
  Keep:    every 2nd → frames 1, 3, 5 … 8511       (4256 frames)
  Output:  frames_webp/out_0001.webp … out_4256.webp
  Quality: 78 (good balance of size vs visual quality)
"""

import os, sys, time
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

SRC_DIR   = "frames_jpg"
DST_DIR   = "frames_webp"
QUALITY   = 78          # WebP quality (0–100)
N_WORKERS = 8           # parallel threads
STEP      = 2           # keep every Nth source frame

os.makedirs(DST_DIR, exist_ok=True)

# Build list of (dst_index, src_filename) pairs
src_indices = range(1, 8512, STEP)   # 1, 3, 5 … 8511
pairs = [
    (dst_i, f"{SRC_DIR}/out_{src_i:04d}.jpg")
    for dst_i, src_i in enumerate(src_indices, start=1)
]
total = len(pairs)
print(f"Total frames to produce: {total}  (every {STEP}nd source frame)")
print(f"Output dir: {DST_DIR}/  quality={QUALITY}  workers={N_WORKERS}")
print("-" * 50)

done_count = 0
skipped    = 0
t0         = time.time()

def convert_one(args):
    dst_idx, src_path = args
    dst_path = f"{DST_DIR}/out_{dst_idx:04d}.webp"

    # Skip already-converted
    if os.path.exists(dst_path):
        return "skip"

    if not os.path.exists(src_path):
        return "missing"

    try:
        with Image.open(src_path) as img:
            img.save(dst_path, "WEBP", quality=QUALITY, method=4)
        return "ok"
    except Exception as e:
        return f"error:{e}"

with ThreadPoolExecutor(max_workers=N_WORKERS) as ex:
    futures = {ex.submit(convert_one, p): p for p in pairs}
    for future in as_completed(futures):
        result = future.result()
        done_count += 1
        if result == "skip":
            skipped += 1

        if done_count % 100 == 0 or done_count == total:
            elapsed = time.time() - t0
            rate    = done_count / elapsed if elapsed > 0 else 0
            eta     = (total - done_count) / rate if rate > 0 else 0
            pct     = done_count / total * 100
            print(f"  [{pct:5.1f}%]  {done_count}/{total}  "
                  f"{rate:.1f} fps  ETA {eta/60:.1f} min", flush=True)

elapsed = time.time() - t0
print("-" * 50)
print(f"Done in {elapsed/60:.1f} min.  {skipped} skipped (already existed).")
print(f"Output: {DST_DIR}/  — {total} WebP frames ready.")
