import imagesize
from split_image import split_image
import os

def split_tileset(sheetname, foldername, rows, cols):
    sheet_path = f"static/images/{sheetname}"
    folder_path = f"static/images/{foldername}"
    width, height = imagesize.get(sheet_path)
    # os.makedirs(folder_path, exist_ok=True)
    # split_image(sheet_path, height // 16, width // 16, False, False, output_dir=folder_path)
    split_image(sheet_path, rows, cols, False, False, output_dir=folder_path)
    for img in os.listdir(folder_path):
        if os.path.getsize(folder_path + "/" + img) <= 76:
            os.remove(folder_path + "/" + img)

# split_tileset("paths.png", "test")
# split_tileset("furniture.png", "furniture")
split_tileset("fishing/fishes.png", "fishing", 1, 11)
split_tileset("fishing/festival_fish.png", "fishing", 1, 3)
# split_tileset("portraits/Willy.png", "portraits")
