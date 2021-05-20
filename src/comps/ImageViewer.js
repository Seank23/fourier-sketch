import React, { useContext, useEffect, useState, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { AppStateCtx, ImageDataCtx, ProgressCtx } from '../Contexts';
import ProgressBar from './ProgressBar';
import SketchHandler from './SketchHandler';

const ImageViewer = (img) => {
    
    const CANVAS_WIDTH = 1280;
    const CANVAS_HEIGHT = 720;

    var imgElem = img['img'];
    const { appState } = useContext(AppStateCtx);
    const { progress } = useContext(ProgressCtx);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [message, setMessage] = useState(""); 
    const [coords, setCoords] = useState([0, 0]);
    const [dim, setDim] = useState(0, 0);

    const { imageData, setImageData } = useContext(ImageDataCtx);

    const canvasRef = useRef(null);
    const measureRef = useRef(null);

    const getImageDimensions = (img, measureDiv, canvas) => {
        
        measureDiv.appendChild(img);
        var wrh = img.width / img.height;
        var newWidth = canvas.width;
        var newHeight = newWidth / wrh;
        if (newHeight > canvas.height) {
            newHeight = canvas.height;
            newWidth = newHeight * wrh;
        }
        measureDiv.removeChild(img);
        return [newWidth, newHeight];
    }

    useEffect(() => {
        
        const canvas = canvasRef.current;
        if(canvas) {
            setMessage("Loading Image...");
            setImageLoaded(false);
            const ctx = canvas.getContext("2d");
            if(imgElem) {
                // Get image data (native size)
                var fullSize = document.createElement('canvas');
                var fullSizeCtx = fullSize.getContext("2d");
                fullSize.width = imgElem.width;
                fullSize.height = imgElem.height;
                fullSizeCtx.drawImage(imgElem, 0, 0, imgElem.width, imgElem.height);
                setImageData(fullSizeCtx.getImageData(0, 0, imgElem.width, imgElem.height));

                // Fit image to canvas
                var dim = getImageDimensions(imgElem, measureRef.current, canvas);
                setDim(dim);
                var coords = [(canvas.width - dim[0]) / 2, (canvas.height - dim[1]) / 2];
                setCoords(coords);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(imgElem, coords[0], coords[1], dim[0], dim[1]);
                setImageLoaded(true);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setImageData(null);
            }
        }
    }, [imgElem, setImageData]);

    useEffect(() => {

        const canvas = canvasRef.current;
        if(canvas && appState > 2) {
            const ctx = canvas.getContext("2d");
            if(imageData) {
                createImageBitmap(imageData).then(renderer => ctx.drawImage(renderer, coords[0], coords[1], dim[0], dim[1]));
            }
        }
    }, [appState, coords, dim, imageData]);

    useEffect(() => {

        switch(appState) {
            case 3:
                setImageLoaded(false);
                setMessage("Preprocessing Image...");
                break;
            case 4:
                setImageLoaded(false);
                setMessage("Extracting Edges...");
                break;
            case 5:
                setImageLoaded(false);
                setMessage("Tracing Path...");
                break;
            case 6:
                setImageLoaded(false);
                setMessage("Calculating Sketch Path...");
                break;
            case 7:
                setImageLoaded(true);
                break;
            default:
        }
    }, [appState]);

    return (
        <div>
            <div className="measure" ref={measureRef}></div>
            <Card body className="viewer-container shadow">
                { !imageLoaded && <ProgressBar message={message} progress={progress} /> }
                { appState < 7 && <canvas className="img-container" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={canvasRef} hidden={!imageLoaded}></canvas> }
                { appState === 7 && <SketchHandler width={CANVAS_WIDTH} height={CANVAS_HEIGHT} /> }
            </Card>
        </div>
    )
}

export default ImageViewer;