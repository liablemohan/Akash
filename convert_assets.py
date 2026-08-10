#!/usr/bin/env python3
"""
Convert STL files to GLB format using trimesh.
Run: python3 convert_assets.py
"""
import subprocess
import sys
import os

def ensure_trimesh():
    try:
        import trimesh
        print("✓ trimesh already installed")
        return trimesh
    except ImportError:
        print("Installing trimesh (this may take a minute)...")
        subprocess.check_call(
            [sys.executable, '-m', 'pip', 'install', 'trimesh[easy]', '--quiet']
        )
        import trimesh
        return trimesh

def convert(tm, src, dst):
    if not os.path.exists(src):
        print(f"  ✗ Not found: {src}")
        return False
    try:
        print(f"  Converting {src} …", end='', flush=True)
        mesh = tm.load(src, force='mesh')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        mesh.export(dst)
        size_mb = os.path.getsize(dst) / 1024 / 1024
        print(f" ✓  →  {dst}  ({size_mb:.1f} MB)")
        return True
    except Exception as e:
        print(f" ✗  Error: {e}")
        return False

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    tm = ensure_trimesh()

    print("\n=== STL → GLB Conversions ===")
    jobs = [
        ('Kamandal.stl',  'assets/kamandal.glb'),
        ('Trishool.stl',  'assets/trishool.glb'),
        # Diya_.stl is a fallback; Diya.obj preferred (handled in shell script)
    ]
    ok = sum(convert(tm, src, dst) for src, dst in jobs)
    print(f"\n{ok}/{len(jobs)} conversions succeeded.")

if __name__ == '__main__':
    main()
