"""
Standalone script: Gzip-compress web assets from src/web/ into data/.
Run this before 'pio run -t uploadfs' to refresh the filesystem image.
"""
from pathlib import Path
import shutil
import subprocess
import sys

try:
    import zopfli.gzip as zopfli_gzip
except ImportError:
    print("Installing zopfli...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "zopfli", "-q"])
    import zopfli.gzip as zopfli_gzip

SRC_DIR = Path("src/web")
DATA_DIR = Path("data")
BUILD_DIR = SRC_DIR / "build"
SUPPORTED_EXTENSIONS = {".html", ".css", ".js", ".svg", ".mp3"}

def is_nogz(filename):
    return ".nogz." in filename

if DATA_DIR.exists():
    shutil.rmtree(DATA_DIR)
DATA_DIR.mkdir()

count = 0
for f in sorted(SRC_DIR.rglob("*")):
    if not f.is_file():
        continue
    try:
        f.relative_to(BUILD_DIR)
        continue
    except ValueError:
        pass
    if f.suffix.lower() not in SUPPORTED_EXTENSIONS:
        continue
    rel = f.relative_to(SRC_DIR)
    clean_name = str(rel).replace("\\", "/").replace(".nogz", "")
    if is_nogz(f.name):
        out = DATA_DIR / clean_name
        out.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(f, out)
    else:
        out = DATA_DIR / (clean_name + ".gz")
        out.parent.mkdir(parents=True, exist_ok=True)
        raw = f.read_bytes()
        compressed = zopfli_gzip.compress(raw, numiterations=15)
        compressed = (compressed[:4] + b"\x00\x00\x00\x00" +
                      compressed[8:9] + b"\x03" + compressed[10:])
        out.write_bytes(compressed)
    count += 1

print(f"Prepared {count} web assets in data/")
