from PIL import Image
import os

# Paths
logo_path = "assets/images/unikl-logo.png"
bg_path = "assets/images/unikl-background.png"

# Fix logo
try:
    img = Image.open(logo_path)
    # Convert to RGB if needed, then save as clean PNG
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGBA')
    img.save(logo_path, 'PNG', optimize=True)
    print(f"✓ Fixed {logo_path}")
except Exception as e:
    print(f"✗ Error fixing logo: {e}")

# Fix background
try:
    img = Image.open(bg_path)
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGBA')
    img.save(bg_path, 'PNG', optimize=True)
    print(f"✓ Fixed {bg_path}")
except Exception as e:
    print(f"✗ Error fixing background: {e}")

print("\nDone! PNG files have been re-encoded.")
