import os
import re
from pathlib import Path

def get_correct_import_path(file_path):
    """Calculate the correct relative import path based on file depth"""
    # Count the number of directories from app/ to the file
    parts = Path(file_path).parts
    depth = len(parts) - 1  # -1 for the filename
    
    # Build the correct relative path
    return '../' * depth + 'lib'

def fix_imports_in_file(file_path):
    """Fix imports in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Calculate correct path
    lib_path = get_correct_import_path(file_path)
    
    # Replace any rbac-admin import with rbac-admin-b24
    patterns = [
        (r"from\s+['\"].*?/rbac-admin['\"]", f"from '{lib_path}/rbac-admin-b24'"),
        (r"from\s+['\"].*?/rbac-admin-b24['\"]", f"from '{lib_path}/rbac-admin-b24'"),
    ]
    
    changed = False
    for pattern, replacement in patterns:
        new_content, count = re.subn(pattern, replacement, content)
        if count > 0:
            content = new_content
            changed = True
    
    if changed:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {file_path}")
        print(f"   Import: from '{lib_path}/rbac-admin-b24'")
        return True
    return False

# Find all route.ts files in app/api/admin
route_files = []
for root, dirs, files in os.walk('app/api/admin'):
    for file in files:
        if file == 'route.ts' and 'route-complex' not in root:
            route_files.append(os.path.join(root, file))

print(f"Found {len(route_files)} route files to check\n")

fixed_count = 0
for file_path in route_files:
    if fix_imports_in_file(file_path):
        fixed_count += 1

print(f"\nFixed {fixed_count} files!")