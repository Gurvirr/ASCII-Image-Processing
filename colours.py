# ANSI colour palette 
ANSI_COLOURS = [
    (0, 0, 0),         # c0 - Black
    (128, 0, 0),       # c1 - Dark Red
    (0, 128, 0),       # c2 - Dark Green
    (128, 128, 0),     # c3 - Dark Yellow
    (0, 0, 128),       # c4 - Dark Blue
    (128, 0, 128),     # c5 - Dark Magenta
    (0, 128, 128),     # c6 - Dark Cyan
    (192, 192, 192),   # c7 - Light Gray
    (128, 128, 128),   # c8 - Dark Gray
    (255, 0, 0),       # c9 - Bright Red
    (0, 255, 0),       # c10 - Bright Green
    (255, 255, 0),     # c11 - Bright Yellow
    (0, 0, 255),       # c12 - Bright Blue
    (255, 0, 255),     # c13 - Bright Magenta
    (0, 255, 255),     # c14 - Bright Cyan
    (255, 255, 255),   # c15 - White
]



# Function to find the nearest ANSI colour given RGB values
def nearest_colour(r, g, b):
    
    min_distance = float("inf")
    nearest_index = 0
    
    for i, (ar, ag, ab) in enumerate(ANSI_COLOURS):
        distance = ((r - ar)**2 + (g - ag)**2 + (b - ab)**2)**0.5
        
        if distance < min_distance:
            min_distance = distance
            nearest_index = i
    
    return nearest_index
