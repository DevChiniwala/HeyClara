import os
import re

TARGET_DIR = r"c:\Users\devch\Downloads\heyclara"
EXCLUDE_DIRS = {".git", "node_modules", "scratch"}
EXCLUDE_EXTS = {".webp", ".png", ".jpg", ".lock"}

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return # Skip binary files
        
    original = content
    
    # Specific URL/username replacements first
    content = content.replace("amankumar.ai", "devchiniwala.com")
    content = content.replace("clara.amankumar.ai", "clara.devchiniwala.com")
    content = content.replace("github.com/onlyoneaman", "github.com/DevChiniwala")
    content = content.replace("/Users/aman/", "/Users/devch/")
    
    # Then name replacements (word boundary, case sensitive for exact matches first)
    content = re.sub(r'\bAman\b', 'Dev Chiniwala', content)
    content = re.sub(r'\baman\b', 'devchiniwala', content)
    
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(TARGET_DIR):
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
    for file in files:
        if any(file.endswith(ext) for ext in EXCLUDE_EXTS):
            continue
        process_file(os.path.join(root, file))
