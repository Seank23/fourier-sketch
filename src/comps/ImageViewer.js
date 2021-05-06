import React, { useContext, useEffect, useState } from 'react';
import { AppStateCtx } from '../Contexts';
import { Card } from 'react-bootstrap';
import useFirestore from '../hooks/useFirestore';

const ImageViewer = () => {
    
    const { appState } = useContext(AppStateCtx);
    const { doc } = useFirestore('images');
    const [imageData, setImageData] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);

    const canvasRef = React.useRef(null);
    const measureRef = React.useRef(null);

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
        if(canvas && doc) {

            const ctx = canvas.getContext("2d");
            if(appState === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setImageData(null);
            } else {
                var img = new Image();
                img.crossOrigin = "Anonymous";
                if(doc.url !== prevUrl) {
                    img.src = doc.url;
                    setPrevUrl(doc.url);
                }
                img.onload = () => {
                    var dim = getImageDimensions(img, measureRef.current, canvas);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, (canvas.width - dim[0]) / 2, 0, dim[0], dim[1]);
                    setImageData(ctx.getImageData(0, 0, img.width, img.height));
                };
            }
        }
    }, [appState, doc, prevUrl]);

    return (
        <div className="img-viewer">
            <div className="measure" ref={measureRef}></div>
            <Card body className="shadow">
                <canvas className="img-container" width={1280} height={720} ref={canvasRef}></canvas>
            </Card>
        </div>
    )
}

export default ImageViewer;