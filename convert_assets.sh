#!/usr/bin/env bash
# convert_assets.sh — Full asset conversion pipeline for Bhaukal
# Run: bash convert_assets.sh
set -euo pipefail
cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Bhaukal — Asset Conversion Pipeline        ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

mkdir -p assets

# ─── 1. OBJ → GLB ──────────────────────────────────────────────────────────
echo "── OBJ → GLB (obj2gltf) ──────────────────────"
npx -y obj2gltf@latest "Bel patta.obj"  -o assets/bel_patta.glb && echo "  ✓ bel_patta.glb" || echo "  ✗ Bel patta.obj failed"
npx -y obj2gltf@latest  Damroo.obj      -o assets/damroo.glb    && echo "  ✓ damroo.glb"    || echo "  ✗ Damroo.obj failed"
npx -y obj2gltf@latest  Diya.obj        -o assets/diya.glb      && echo "  ✓ diya.glb"      || echo "  ✗ Diya.obj failed"

# ─── 2. STL → GLB (Python / trimesh) ───────────────────────────────────────
echo ""
echo "── STL → GLB (Python trimesh) ────────────────"
python3 convert_assets.py

# ─── 3. Copy temple model ──────────────────────────────────────────────────
echo ""
echo "── Temple model ──────────────────────────────"
if [ -f "VT_corridor.glb" ]; then
  cp "VT_corridor.glb" assets/vt_corridor.glb
  echo "  ✓ vt_corridor.glb copied"
else
  echo "  ✗ VT_corridor.glb not found!"
fi

# ─── 4. Draco compression on all GLBs ─────────────────────────────────────
echo ""
echo "── Draco compression (gltf-pipeline) ─────────"
for f in assets/bel_patta.glb assets/damroo.glb assets/diya.glb \
          assets/kamandal.glb  assets/trishool.glb assets/vt_corridor.glb; do
  if [ -f "$f" ]; then
    before=$(du -sh "$f" | cut -f1)
    npx -y gltf-pipeline@latest -i "$f" -o "$f" --draco.compressionLevel 7 --quiet 2>/dev/null || \
    npx -y gltf-pipeline@latest -i "$f" -o "$f" --draco.compressionLevel 7
    after=$(du -sh "$f" | cut -f1)
    echo "  ✓ $(basename "$f")  $before → $after"
  else
    echo "  - Skipping $(basename "$f") (not found)"
  fi
done

# ─── Summary ───────────────────────────────────────────────────────────────
echo ""
echo "── Final asset sizes ─────────────────────────"
ls -lh assets/*.glb 2>/dev/null || echo "  No GLB files in assets/"
echo ""
echo "✅ Done."
