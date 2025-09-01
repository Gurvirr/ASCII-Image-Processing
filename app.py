from flask import Flask, render_template, request, jsonify
from PIL import Image, ImageEnhance
from colours import nearest_colour
import os, tempfile

app = Flask(__name__)
UPLOAD_PATH = os.path.join(tempfile.gettempdir(), "upload_path.png")

# Palette definitions
PALETTE_CHARS = {
    "default": "MNFVI*:.",
    "complex": "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'.",
    "custom": "MNFVI*:."
}

# Function to escape HTML characters
def escape_html_char(char):
    if char == '<':
        return '&lt;'
    elif char == '>':
        return '&gt;'
    elif char == '&':
        return '&amp;'
    else:
        return char

# Function to get ASCII character set
def get_ascii_chars(inverted = False, palette=None):
    if palette is None:
        palette = "MNFVI*:."

    if inverted:
        return palette[::-1]
    return palette

# Function to convert an image to ASCII grayscale
def ascii_grayscale(file_path, width, inverted=False, palette=None):
    ascii_chars = get_ascii_chars(inverted, palette)
    output = []

    img = Image.open(file_path)
    original_width, original_height = img.width, img.height
    is_portrait = original_height > original_width
    
    img = img.convert("L")
    img = ImageEnhance.Contrast(img).enhance(3.0)

    w0, h0 = img.width, img.height
    aspect = h0 / w0
    height = int(aspect*width*0.5)
    img = img.resize((width, height))

    data = img.getdata()

    for row in range(height):
        row_chars = []
        for col in range(width):
            pixel = (row * width) + col
            
            luminance = data[pixel]
            char_index = int(luminance/255 * (len(ascii_chars) - 1))
            
            char = escape_html_char(ascii_chars[char_index])
            row_chars.append(char)
        
        output.append("".join(row_chars))
    return "\n".join(output), is_portrait



# Function to convert an image to ASCII RGB
def ascii_rgb(file_path, width, inverted=False, palette=None):
    ascii_chars = get_ascii_chars(inverted, palette)
    output = []

    img = Image.open(file_path)
    original_width, original_height = img.width, img.height
    is_portrait = original_height > original_width
    
    # Convert to RGBA to handle transparency
    img = img.convert("RGBA")
    img = ImageEnhance.Color(img).enhance(1.75)

    w0, h0 = img.width, img.height
    aspect = h0 / w0
    height = int(aspect*width*0.5)
    img = img.resize((width, height))

    data = img.getdata()

    for row in range(height):
        row_chars = []
        for col in range(width):
            pixel = (row * width) + col
            r, g, b, a = data[pixel]
            
            # Skip transparent pixels
            if a == 0:
                row_chars.append(" ")
                continue
            
            luminance = int( (0.299 * r) + (0.587 * g) + (0.114 * b) )
            char_index = int(luminance/255 * (len(ascii_chars) - 1))
            
            char = escape_html_char(ascii_chars[char_index])
            row_chars.append(f'<span style="color:rgb({r},{g},{b})">{char}</span>')

        output.append("".join(row_chars))
    return "\n".join(output), is_portrait



# Function to convert an image to ASCII ANSI
def ascii_ansi(file_path, width, inverted=False, palette=None):
    ascii_chars = get_ascii_chars(inverted, palette)
    output = []

    img = Image.open(file_path)
    original_width, original_height = img.width, img.height
    is_portrait = original_height > original_width
    
    # Convert to RGBA to handle transparency
    img = img.convert("RGBA")
    img = ImageEnhance.Color(img).enhance(1.75)

    w0, h0 = img.width, img.height
    aspect = h0 / w0
    height = int(aspect*width*0.5)
    img = img.resize((width, height))

    data = img.getdata()

    for row in range(height):
        row_chars = []
        for col in range(width):
            pixel = (row * width) + col
            r, g, b, a = data[pixel]
            
            # Skip transparent pixels
            if a == 0:
                row_chars.append(" ")
                continue
            
            luminance = int( (0.299 * r) + (0.587 * g) + (0.114 * b) )
            char_index = int(luminance/255 * (len(ascii_chars) - 1))
            
            colour_index = nearest_colour(r, g, b)
            char = escape_html_char(ascii_chars[char_index])
            row_chars.append(f'<span class="c{colour_index}">{char}</span>')

        output.append("".join(row_chars))
    return "\n".join(output), is_portrait



@app.route("/")
def home():
    return render_template("index.html")



@app.route("/upload", methods=["POST"])
def upload():
    file = request.files["file"]
    file.save(UPLOAD_PATH)
    
    return 'Uploaded successfully ✓', 200  # return string + status code



@app.route("/ascii", methods=["GET"])
def ascii_convert():
    if not os.path.exists(UPLOAD_PATH):
        return "No file uploaded yet. Please use ?upload first.", 400

    width = request.args.get("width", default=256, type=int)
    mode = request.args.get("mode", default="grayscale")
    inverted = request.args.get("invert", default="false").lower() == "true"
    palette_name = request.args.get("palette", default="default")
    custom_chars = request.args.get("custom_chars", default="")
    
    # Look up the actual characters for the palette name
    if palette_name == "custom" and custom_chars:
        palette = custom_chars
    else:
        palette = PALETTE_CHARS.get(palette_name, "MNFVI*:.")

    if mode == "grayscale":
        ascii_art, is_portrait = ascii_grayscale(UPLOAD_PATH, width, inverted, palette)
    elif mode == "rgb":
        ascii_art, is_portrait = ascii_rgb(UPLOAD_PATH, width, inverted, palette)
    elif mode == "ansi":
        ascii_art, is_portrait = ascii_ansi(UPLOAD_PATH, width, inverted, palette)
    else:
        return "Invalid mode. Options: grayscale, rgb, ansi", 400

    return jsonify({
        "ascii": ascii_art,
        "is_portrait": is_portrait,
        "mode": mode,
        "inverted": inverted
    }), 200



if __name__ == "__main__":
    app.run(debug=True)
