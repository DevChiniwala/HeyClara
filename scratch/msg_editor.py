import sys
import re

file_path = sys.argv[1]
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('niahere→clara rename, ', 'internal naming cleanup, ')
content = content.replace('rewrite of niahere as', 'rewrite of the codebase as')
content = content.replace('NiaTool', 'ClaraTool')
content = content.replace('nia/niahere references', 'legacy references')
content = re.sub(r'(?i)\bnia(here)?\b', 'clara', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
