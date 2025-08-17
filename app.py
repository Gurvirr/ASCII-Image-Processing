from flask import Flask, render_template
from PIL import Image, ImageEnhance

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run(debug=True)
