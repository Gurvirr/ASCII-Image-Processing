from flask import Flask, render_template, request
from PIL import Image, ImageEnhance

app = Flask(__name__)
UPLOAD_PATH = "uploads/upload_path.png"

def image_to_ascii(file, w1):
    ascii_chars = "MNFVI*:."

    output = []

    img = Image.open("static/images/" + file)
    img = img.convert("L")

    img = ImageEnhance.Contrast(img).enhance(3.0)

    w0, h0 = img.width, img.height
    aspect = h0 / w0

    h1 = int(aspect*w1*0.5)

    img = img.resize((w1, h1))

    data = img.getdata()

    for row in range(h1):
        row_str = ""
        for col in range(w1):
            pixel = (row * w1) + col
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
    
    return f'File "{file.filename}" uploaded successfully.', 200  # return string + status code

if __name__ == "__main__":
    app.run(debug=True)
