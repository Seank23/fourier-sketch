import React, { useContext, useEffect, useState } from 'react';
import { AppStateCtx } from '../Contexts';
import useFirestore from '../hooks/useFirestore';

const ImageViewer = () => {
    
    const { appState } = useContext(AppStateCtx);
    const { doc } = useFirestore('images');
    const [imageData, setImageData] = useState(null);
    const canvasRef = React.useRef(null);

    useEffect(() => {

        const canvas = canvasRef.current;
        if(canvas != null) {
            const ctx = canvas.getContext("2d");

            if(appState === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                var img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = doc.url;

                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                    setImageData(ctx.getImageData(0, 0, img.width, img.height));
                };
            }
        }
    }, [appState, doc]);

    return (
        <div className="img-viewer">
            {doc && (
                <canvas className="img-container" width={1200} height={700} ref={canvasRef}>
                </canvas>
            )}
        </div>
    )
}

export default ImageViewer;