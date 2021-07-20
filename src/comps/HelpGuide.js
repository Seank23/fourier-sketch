const HelpGuide = () => {

    return (
        <div className="modal-contents">
            <p>Welcome! This guide will help you get up to speed with using and understanding FourierSketch.</p>
            <h5>Step 1 - Upload an image</h5>
            <p>The first step is to upload an image to the FourierSketch app. Click anywhere within the blue upload area to show a file dialog. From here, navigate to your chosen image and click Open. Drag and drop is also supported allowing you to drag an already selected image from another window and drop it into the upload area to load the image.</p>
            <p>Note that large images are automatically resized to a maximum of 1600px in either dimension. This ensures that sketches will not take excessive amounts of time to process due to the native resolution of the source image being too large.</p>
            <p>Once uploaded, the image will be viewable on the main image window. A number of options are presented in the header above the image window. There are two sliders - Edge Denoise and Sketch Quality - and two buttons - Obtain Outline and Clear.</p>
            <h5>Step 2 - Obtain an outline</h5>
            <p>Click the Obtain Outline button to progress.</p>
            <p>This applies an edge-isolating filter to the image, the results of which can be seen in the image window. By isolating the edges in the image, a sketch can be more easily produced. However, more complex edges that represent fine details in the image tend not to translate well to a sketch and can require additional time to process so a denoising filter is applied to remove these finer edges.</p>
            <p>Use the Edge Denoise slider to adjust the strength of this filter, the edge-isolated image will update to reflect the changes.</p>
            <h5>Step 3 - Set up the sketch</h5>
            <p>Next, turn your attention to the Sketch Quality slider. This determines how closely the sketching algorithm will attempt to match the edge-isolated image. For a usable experience, it is important to use a sketch quality setting that your system can handle since all processing is performed locally and higher a sketch quality requires more time and system resources to process.</p>
            <p>In most cases, the Medium or High setting will provide the best trade-off between quality and processing time. However, mobile users or users with low-end systems may want to use Low or Very Low.</p>
            <h5>Step 4 - Generate the sketch</h5>
            <p>Once you are satisfied with the options selected, you are ready to let the app sketch the image. Click Generate Sketch to proceed.</p>
            <p>First, the app will trace out a path from the edge-isolated image in such a way that the lines and features in the image are preserved. A custom algorithm performs this, which can take some time to complete, especially for images with a lot of edges. A progress indicator is displayed in the centre of the image window.</p>
            <p>Once this has completed, the app will obtain the Fourier Transform of the traced path using the FFT algorithm and will start to sketch the image. To obtain the pixel coordinates needed to produce the final sketch, the Fourier coefficients of the traced path must be summed at each time point. This can be quite time consuming, so the current progress of the sketch is shown in the sketch window while it is being produced.</p>
            <h5>Step 5 - Interact with the sketch</h5>
            <p>Upon completion of the sketch calculation, the final sketch rendering is displayed in the sketch window, while several new options are selectable in the sketch window's header. These include two sliders - Fourier Coefficients and Sketch Speed - and a burger-style dropdown menu.</p>
            <p>The Fourier Coefficients slider allows you to view a rendering of the sketch where only a limited number of Fourier coefficients are summed to obtain the sketch pixel coordinates, with the slider selecting the limit. The Sketch Speed slider simply selects the animation speed of the sketch when it is being drawn. The sketch drawing animation can be restarted by clicking the Restart Sketch button.</p>
            <p>The dropdown menu contains three options: A toggle to show/hide the epicycles, an option to save the Fourier coefficients for a sketch as a CSV file which can be loaded back into the app at a later time, and an option to save an image of the sketch canvas.</p>
            <p>The epicycles are the collection of rotating lines and circles that follow the sketch as it is being drawn. Each represents the contribution of an individual Fourier coefficient to the final sketch, and when combined, the epicycles provide an illustration of how an image can be drawn from summed up Fourier coefficients. Note: for practicality, only a subset of the coefficients are represented with epicycles as the number of coefficients needed to sketch an image could be thousands.</p>
            <h5>Additional notes</h5>
            <p>To load a previously saved sketch CSV file, click within the blue upload area on the upload window and navigate to the CSV file in the file dialog. Once opened, the app will bypass the initial sketch setup and sketch path generation, however, the sketch coordinate data will still need to be generated as the CSV file only stores the Fourier coefficients of the traced path.</p>
        </div>
    )
}

export default HelpGuide