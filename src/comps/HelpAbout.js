const HelpAbout = () => {

    return (
        <div className="modal-contents">
            <img src="./images/FourierSketch.PNG" width="700px" alt="FourierSketch"/>
            <h5>What is FourierSketch?</h5>
            <p>FourierSketch is a web app that uses the principles of Fourier analysis to construct an interactive sketch of any image. The following video by 3Blue1Brown illustrates the intuition behind the task and has served as the main source of inspiration for this project.</p>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/r6sGWTCMz2k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <h5>How does it work?</h5>
            <p>First, an edge-isolated outline is obtained from the image, this contains all of the information required to construct the sketch. A denoise filter is then applied to remove small details that will not be properly resolved by the sketching algorithm. The outline image is sampled and its pixel coordinates are passed to a custom pathing algorithm. This algorithm attempts to find the best path through each pixel such that the features of the image are preserved. Once completed, the Fourier Transform of the sketch path is obtained using the FFT algorithm, the Fourier coefficients that result are then used to produce the sketch.</p>
            <h5>Issues & Limitations</h5>
            <ul>
                <il><p>Due to the nature of how the processing is performed, the time it takes to generate a sketch is highly dependent on the complexity of the source image, the quality settings chosen, and the processing power of the user's device. Thus, long processing times may occur.</p></il>
                <il><p>Since sketches must be drawn as a single continuous line, unwanted lines or streaks may be produced as the drawing head repositions to sketch another part of the image. Optimisations were made to the pathing algorithm to eliminate this as much as possible, however, it can still occur.</p></il>
            </ul>
            <h5>Credits</h5>
            <p>Created by Sean King &copy; 2021</p>
            <p>Source code available at <a href="https://github.com/Seank23/fourier-sketch">Github</a></p>
        </div>
    )
}

export default HelpAbout