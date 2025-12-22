import os
from PIL import Image

def compress_images(directory):
    files = [f for f in os.listdir(directory) if f.endswith('.png')]
    print(f"Found {len(files)} PNG images to process.")
    
    for filename in files:
        filepath = os.path.join(directory, filename)
        # Define output filename
        webp_filename = filename.replace('.png', '.webp')
        webp_filepath = os.path.join(directory, webp_filename)
        
        try:
            with Image.open(filepath) as img:
                # Convert to WebP with 80% quality
                img.save(webp_filepath, 'WEBP', quality=80)
                
                original_size = os.path.getsize(filepath) / 1024
                new_size = os.path.getsize(webp_filepath) / 1024
                reduction = (1 - new_size / original_size) * 100
                print(f"Compressed {filename}: {original_size:.1f}KB -> {new_size:.1f}KB ({reduction:.1f}% reduction)")
                
                # Optionally remove the original PNG if everything is okay
                # os.remove(filepath)
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    target_dir = "deities"
    compress_images(target_dir)
