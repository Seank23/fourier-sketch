import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AppStateCtx, ImageDataCtx } from '../Contexts';
import ImageViewer from './ImageViewer';
import useFirestore from '../hooks/useFirestore';

const ImageController = () => {

    const { appState, setAppState } = useContext(AppStateCtx);
    const [prevUrl, setPrevUrl] = useState(null);
    const [img, setImg] = useState(null);

    const [imageData, setImageData] = useState(null);
    const imageDataProvider = useMemo(() => ({ imageData, setImageData }), [imageData, setImageData]);

    const { doc } = useFirestore('images');

    useEffect(() => {

        if(doc) {
            if(appState === 0) {
                setImg(null)
            } else {
                var imgElem = new Image();
                imgElem.crossOrigin = "Anonymous";
                if(doc.url !== prevUrl) {
                    imgElem.src = doc.url;
                    setPrevUrl(doc.url);
                }
                imgElem.onload = () => {
                    setImg(imgElem);
                };
            }
        }
    }, [appState, doc, prevUrl]);

    useEffect(() => {

        if(appState === 2) {
            const processor = new window.Worker("./ImageProcessor.js");
            processor.postMessage({ imageData, denoiseThreshold: 100 });
            processor.onmessage = (e) => {

                var outputData = e.data;
                if(typeof(outputData) === "number") {
                    setAppState(outputData);
                }
                else if(outputData) {
                    setImageData(outputData);
                    setAppState(5);
                }
            };
        }
    }, [appState, imageData, setAppState]);

    return (
        <ImageDataCtx.Provider value={imageDataProvider}>
            <ImageViewer img={img} />
        </ImageDataCtx.Provider> 
     );
}
 
export default ImageController;