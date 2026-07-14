import os
import shutil

src_dir = r"C:\Users\namir\Downloads\Resume"
dest_dir = r"C:\Users\namir\OneDrive\Documents\where winds meet 2"

# 1. Copy .github directory
src_github = os.path.join(src_dir, ".github")
dest_github = os.path.join(dest_dir, ".github")
if os.path.exists(src_github):
    if os.path.exists(dest_github):
        shutil.rmtree(dest_github)
    shutil.copytree(src_github, dest_github)
    print("Copied .github directory.")

# 2. Copy assets directory
src_assets = os.path.join(src_dir, "assets")
dest_assets = os.path.join(dest_dir, "assets")
if os.path.exists(src_assets):
    if not os.path.exists(dest_assets):
        os.makedirs(dest_assets)
    for file in os.listdir(src_assets):
        src_file = os.path.join(src_assets, file)
        dest_file = os.path.join(dest_assets, file)
        shutil.copy2(src_file, dest_file)
        print(f"Copied asset: {file}")

# 3. Copy other core code files
files_to_copy = [
    "index.html",
    "style.css",
    "script.js",
    "engine.js",
    "README.md",
    "copy_assets.bat",
    "decode_image.bat",
    "decode_image.py",
    "run_server.bat",
    "run_server.ipynb"
]

for file in files_to_copy:
    src_file = os.path.join(src_dir, file)
    dest_file = os.path.join(dest_dir, file)
    if os.path.exists(src_file):
        shutil.copy2(src_file, dest_file)
        print(f"Copied: {file}")

# 4. Modify style.css in dest to add prefers-reduced-motion if not present
dest_style_path = os.path.join(dest_dir, "style.css")
if os.path.exists(dest_style_path):
    with open(dest_style_path, "r", encoding="utf-8") as f:
        style_content = f.read()
    
    if "prefers-reduced-motion" not in style_content:
        reduced_motion_css = """
/* --- ACCESSIBILITY: REDUCED MOTION --- */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
    }
    #tree-left-sway, #tree-right-sway {
        animation: none !important;
    }
    #custom-cursor {
        display: none !important;
    }
    body {
        cursor: auto !important;
    }
}
"""
        with open(dest_style_path, "a", encoding="utf-8") as f:
            f.write(reduced_motion_css)
        print("Appended prefers-reduced-motion media query to style.css")

print("\nAll files successfully synced to workspace!")
