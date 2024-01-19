import matplotlib.pyplot as plt
import matplotlib.animation as animation
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import os
import random

LEFTSTATIC = True
left_circles=[]
right_circles=[]
lines=[]
alpha= 0
alpha_dir_up= False
index=10

## COLOR MAP

help_colors = [
    (0.5, 0, 1),  # Blueish purple
    (0, 0, 1),    # Blue
    (0, 0.6, 0)   # Green
]

# Create a LinearSegmentedColormap
custom_cmap = LinearSegmentedColormap.from_list('blueish_purple_to_blue_to_green', help_colors, N=256)

# Generate ten evenly spaced values from the colormap
gradient_values = np.linspace(0, 1, 10)

# Use the colormap to obtain the colors corresponding to the gradient values
colors = [custom_cmap(value) for value in gradient_values]

# Display the ten colors
for color in colors:
    print(color)

#plt.imshow([colors], aspect='auto')
#plt.axis('off')
#plt.show()

def draw_circles_and_lines():
    global left_circles, right_circles, lines
    global fig, axes
    global num_left, num_right
    

    ax.clear()
    ax.set_xlim(0, 70)
    ax.set_ylim(0, 120)#max(num_left,(num_left+1)*2))
    ax.set_aspect('equal', adjustable='box')
    ax.axis('off')


    left_circles=[]
    right_circles=[]
    lines=[]
    # Draw circles on the left
    for i in range(num_left):
        circle = plt.Circle((0.1, i*2+0.5), 0.6, color='black', fill=False)
        ax.add_artist(circle)
        left_circles.append(circle)


    # Centering the right circles vertically
    start_y = (num_left*2 - 8*(num_right-1)) / 2
    for i in range(num_right):
        circle = plt.Circle((50, (start_y + i*8 + 0.5)), 1, color='black', fill=True)
        ax.add_artist(circle)
        right_circles.append(circle)
    """
    for lc in left_circles:
        if (random.randint(1,2) %2 == 0):
            rc= random.choice(right_circles)
            plot= ax.plot([lc.center[0], rc.center[0]],[lc.center[1], rc.center[1]], color = "green")
            lines.append(plot[0])
            print(plot)
    """
    return ax,


def update(frame):
    global left_circles, right_circles, lines
    global fig, axes
    global num_left, num_right, alpha, alpha_dir_up
    global LEFTSTATIC
    global colors, index
    
    print(f"Update: Frame {frame}; alpha {alpha}; alpha Direction {alpha_dir_up}")
    if alpha<=0 and alpha_dir_up ==False:

        for line in ax.lines:
                line.remove()
        
        if not LEFTSTATIC:
            print("LEFTSTATC")
            circle = left_circles[num_left-(frame%num_left)-1]
            circleList = left_circles if LEFTSTATIC else right_circles
            
            for j, i in enumerate(circleList):
                plot= ax.plot([i.center[0], circle.center[0]],[i.center[1], circle.center[1]], color = colors[j])#
                plot[0].set_alpha(0.1)
                lines.append(plot[0])
        else:
            print("right")
            index= (index-1) % num_right
            circle = right_circles[index]
            circleList = left_circles
            
            for i in circleList:
                plot= ax.plot([i.center[0], circle.center[0]],[i.center[1], circle.center[1]], color = colors[index])
                plot[0].set_alpha(0.1)
                lines.append(plot[0])
        alpha= 0.1
        alpha_dir_up = True
        return ax.lines
    
    if not alpha<1:
        alpha_dir_up= False    
    alpha_adjustment = 0.1 if alpha_dir_up else -0.1
    alpha+= alpha_adjustment
    
    if alpha >1:
        alpha=1
    if alpha<0:
        alpha=0
    
    for line in ax.lines:
        line.set_alpha(alpha)
    return ax.lines
    
# Draw circles and save as an image

# Parameters
num_left = 60
num_right = 10

# Set up plot
fig, ax = plt.subplots()
fig.set_size_inches(5,10)

ax.set_xlim(0, 100)
ax.set_ylim(0, 100) #max(num_left,(num_left+1)*2))
ax.set_aspect('equal', adjustable='box')
ax.axis('off')

# Create animation
ani = animation.FuncAnimation(fig, update, frames=220, init_func=draw_circles_and_lines, repeat= False)

#plt.show()
# '
# with open("LL_viz_test.html", "x") as f:
#     f.write(ani.to_jshtml())'


ani.save("test.gif", writer= "pillow", fps=60)
