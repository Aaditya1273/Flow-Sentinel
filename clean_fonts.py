import os
import re

def clean_file(path):
    with open(path, 'r') as f:
        content = f.read()

    original = content

    # Replace specific massive headings
    content = re.sub(r'text-[45]xl font-black[ a-zA-Z0-9\[\]\-\/]*uppercase\s*', 'text-display-md font-bold text-white ', content)
    
    # Replace other uppercase + tracking stuff
    content = re.sub(r'\buppercase\b', '', content)
    content = content.replace('font-black', 'font-medium')
    content = re.sub(r'tracking-\[[0-9\.]+em\]', '', content)
    content = content.replace('tracking-widest', '')
    content = content.replace('tracking-tighter', 'tracking-tight')
    
    # Fix double spaces left behind
    content = re.sub(r' {2,}', ' ', content)
    
    # Replace class=" " with class=""
    content = content.replace('className=" ', 'className="')
    content = content.replace(' "', '"')

    if original != content:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Cleaned {path}")

clean_file('app/dashboard/page.tsx')
clean_file('components/dashboard/VaultCard.tsx')
clean_file('app/portfolio/page.tsx')
clean_file('app/vaults/page.tsx')
clean_file('app/analytics/page.tsx')
