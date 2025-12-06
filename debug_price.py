file_path = r'c:\Users\viswa2004\Downloads\yathes-sign-galaxy (1)\frontend\src\pages\Admin.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of pdfPrice
import re
matches = [(m.start(), m.end()) for m in re.finditer(r'.{0,100}pdfPrice.{0,100}', content)]

print(f"Found {len(matches)} occurrences of 'pdfPrice'")
for i, (start, end) in enumerate(matches[:5]):  # Show first 5
    print(f"\n--- Match {i+1} ---")
    print(content[start:end])
