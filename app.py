from flask import Flask, render_template
from PIL import Image, ImageEnhance

app = Flask(__name__)

def image_to_ascii():
    ascii_chars = "MNFVI*:."

    output = []
    file = "Great Wave.jpg"

    img = Image.open("static/images/" + file)
    img = img.convert("L")

    img = ImageEnhance.Contrast(img).enhance(3.0)

    w0, h0 = img.width, img.height
    aspect = h0 / w0

    w1 = 256
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

@app.route("/ascii")
def home():
    ascii_home = image_to_ascii()
    return render_template("index.html", ascii_home=ascii_home)

if __name__ == "__main__":
    app.run()
