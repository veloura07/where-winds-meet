import shutil
import os

src = r"C:\Users\namir\.gemini\antigravity-ide\brain\f8bdcbbe-ab80-4e2c-a7de-c475c369ca9a\nature_valley_1784035357783.png"
dest_dir = r"c:\Users\namir\OneDrive\Documents\where winds meet 2\assets"
dest = os.path.join(dest_dir, "nature_valley.png")

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

if os.path.exists(src):
    shutil.copy2(src, dest)
    print("Successfully copied nature_valley.png to assets!")
else:
    print(f"Error: Source image not found at {src}")
