file_path = r'c:\Users\viswa2004\Downloads\yathes-sign-galaxy (1)\frontend\src\pages\Admin.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the specific pattern in the table
# Looking for the price cell in the inventory table
search_pattern = 'className="px-6 py-4">₹{p.pdfPrice}</td>'

if search_pattern in content:
    idx = content.find(search_pattern)
    context_before = content[max(0, idx-200):idx]
    context_after = content[idx:min(len(content), idx+300)]
    
    with open('price_context.txt', 'w', encoding='utf-8') as f:
        f.write("FOUND THE PATTERN!\n\n")
        f.write("Context before:\n")
        f.write(context_before)
        f.write("\n\n>>> MATCH HERE <<<\n\n")
        f.write("Context after:\n")
        f.write(context_after)
    
    print("✅ Found the pattern! Check price_context.txt for details")
    
    # Now do the replacement
    new_pattern = 'className="px-6 py-4">{p.discount ? (<div><div className="text-gray-400 line-through text-xs">₹{p.pdfPrice}</div><div className="font-bold text-green-600">₹{Math.round(p.pdfPrice * (1 - p.discount / 100))}</div></div>) : (<div className="font-bold">₹{p.pdfPrice}</div>)}</td>'
    
    updated_content = content.replace(search_pattern, new_pattern)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("✅ Successfully updated Admin.tsx!")
else:
    print("❌ Pattern not found")
    # Try alternative pattern
    alt_pattern = 'py-4">₹{p.pdfPrice}</td>'
    if alt_pattern in content:
        print(f"✅ Found alternative pattern: {alt_pattern}")
    else:
        print("❌ Alternative pattern also not found")
