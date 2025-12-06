import sys
import io

# Set UTF-8 encoding for output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

file_path = r'c:\Users\viswa2004\Downloads\yathes-sign-galaxy (1)\frontend\src\pages\Admin.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Search for the price pattern - looking for the table cell
# The pattern should be something like: <td ...>₹{p.pdfPrice}</td>

# Let's find where pdfPrice appears in a <td> context
import re

# Find all table cells containing pdfPrice
matches = list(re.finditer(r'<td[^>]*>.*?p\.pdfPrice.*?</td>', content, re.DOTALL))

print(f"Found {len(matches)} table cells with p.pdfPrice")

for i, match in enumerate(matches):
    matched_text = match.group(0)
    # Only show if it's a short match (the price cell, not a long input field)
    if len(matched_text) < 200:
        print(f"\n=== Match {i+1} ===")
        print(matched_text)
        print(f"Position: {match.start()}-{match.end()}")
        
        # This is likely our target - do the replacement
        if i == 0:  # Replace the first short match
            old_text = matched_text
            # Extract the className
            class_match = re.search(r'className="([^"]*)"', old_text)
            if class_match:
                class_name = class_match.group(1)
                new_text = f'<td className="{class_name}">{{p.discount ? (<div><div className="text-gray-400 line-through text-xs">₹{{p.pdfPrice}}</div><div className="font-bold text-green-600">₹{{Math.round(p.pdfPrice * (1 - p.discount / 100))}}</div></div>) : (<div className="font-bold">₹{{p.pdfPrice}}</div>)}}</td>'
                
                content = content.replace(old_text, new_text, 1)  # Replace only first occurrence
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"\n✅ SUCCESS! Replaced price cell to show discounted price")
                print(f"Old: {old_text[:100]}...")
                print(f"New: {new_text[:100]}...")
