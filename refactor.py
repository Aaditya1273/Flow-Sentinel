import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Replace "text-4xl font-black uppercase tracking-tighter" with "text-display-lg"
    content = re.sub(r'text-[456]xl font-black[ a-zA-Z0-9\[\]\-\/]*uppercase[ a-zA-Z0-9\[\]\-\/]*', 'text-display-lg font-medium tracking-tight text-[var(--w-tusk)] ', content)
    
    # Replace "font-black" with "font-medium"
    content = content.replace('font-black', 'font-medium')
    
    # Remove "uppercase" 
    content = re.sub(r'\buppercase\b', '', content)
    
    # Remove tracking variations
    content = re.sub(r'tracking-\[0\.[23]em\]', 'tracking-normal', content)
    content = content.replace('tracking-widest', 'tracking-normal')
    content = content.replace('tracking-tighter', 'tracking-tight')
    
    # Change "text-[10px]" to "text-sm text-muted-foreground"
    content = content.replace('text-[10px]', 'text-sm')

    if original != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('app'):
    if 'landing' in root: continue
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

for root, dirs, files in os.walk('components/dashboard'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
