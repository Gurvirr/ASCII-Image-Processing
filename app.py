from flask import Flask, render_template, request
from PIL import Image, ImageEnhance
import os, tempfile

app = Flask(__name__)
UPLOAD_PATH = os.path.join(tempfile.gettempdir(), "upload_path.png")

def image_to_ascii(file_path, width):
    ascii_chars = "MNFVI*:."

    output = []

    img = Image.open(file_path)
    img = img.convert("L")

    img = ImageEnhance.Contrast(img).enhance(3.0)

    w0, h0 = img.width, img.height
    aspect = h0 / w0

    height = int(aspect*width*0.5)

    img = img.resize((width, height))

    data = img.getdata()

    for row in range(height):
        row_str = ""
        for col in range(width):
            pixel = (row * width) + col
            luminance = data[pixel]
            index = int(luminance/255 * (len(ascii_chars) - 1))
            row_str += ascii_chars[index]
        
        output.append(row_str)
    return "\n".join(output)

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
    ascii_art = image_to_ascii(UPLOAD_PATH, width=width)
    return ascii_art, 200

if __name__ == "__main__":
    app.run(debug=True)
