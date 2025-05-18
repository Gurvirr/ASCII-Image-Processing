from PIL import Image

# ascii = "@%#*+=-:. "
ascii = "MNFVI*:."

output = []
file = "Great Wave.jpg"

img = Image.open("assets/" + file)
img = img.convert("L")

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
        index = int(luminance/255 * (len(ascii) - 1))
        row_str += ascii[index]
    
    output.append(row_str)

for row in output:
    print(row)

with open("output.txt", "w", encoding="utf-8") as f:
    for line in output:
        f.write(line + "\n")