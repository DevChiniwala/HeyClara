import sys
import re

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace pick with reword for the specific commits
content = re.sub(r'(?m)^pick (7b8e269|587a51f|ea3c7d8)', r'reword \1', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
