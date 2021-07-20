# FourierSketch
URL: https://fouriersketch.web.app/

![FourierSketch](https://github.com/Seank23/fourier-sketch/blob/master/public/images/FourierSketch.PNG)

## What is FourierSketch?
FourierSketch is a web app that uses the principles of Fourier analysis to construct an interactive sketch of any image. This [video by 3Blue1Brown](https://www.youtube.com/embed/r6sGWTCMz2k) illustrates the intuition behind the process and has served as the main source of inspiration for this app.

## How does it work?
First, an edge-isolated outline is obtained from the image, this contains all of the information required to construct the sketch. A denoise filter is then applied to remove small details that will not be properly resolved by the sketching algorithm. The outline image is sampled and its pixel coordinates are passed to a custom pathing algorithm. This algorithm attempts to find the best path through each pixel such that the features of the image are preserved. Once completed, the Fourier Transform of the sketch path is obtained using the FFT algorithm, the Fourier coefficients that result are then used to produce the sketch.

## Issues & Limitations
- Due to the nature of how the processing is performed, the time it takes to generate a sketch is highly dependent on the complexity of the source image, the quality settings chosen, and the processing power of the user's device. Thus, long processing times may occur.
- Since sketches must be drawn as a single continuous line, unwanted lines or streaks may be produced as the drawing head repositions to sketch another part of the image. Optimisations were made to the pathing algorithm to eliminate this as much as possible, however, it can still occur.
