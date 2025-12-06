file_path = r'c:\Users\viswa2004\Downloads\yathes-sign-galaxy (1)\frontend\src\pages\Admin.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Search for patterns around the price in the table
patterns_to_try = [
    'py-4">{p.pdfPrice}</td>',
    '{p.pdfPrice}</td>',
    'pdfPrice}</td><td',
]

for pattern in patterns_to_try:
    if pattern in content:
        print(f"✅ FOUND: {pattern}")
        idx = content.find(pattern)
        print(f"Context: ...{content[idx-50:idx+100]}...")
        break
else:
    print("None of the patterns found. Searching for 'pdfPrice' in table context...")
    # Find all pdfPrice occurrences
    idx = 0
    count = 0
    while True:
        idx = content.find('pdfPrice', idx)
        if idx == -1:
            break
        # Check if it's in a table row context
        context = content[max(0, idx-100):min(len(content), idx+100)]
        if '<td' in context and '</td>' in context:
            print(f"\n--- Table context {count+1} ---")
            print(context)
            count += 1
        idx += 1
