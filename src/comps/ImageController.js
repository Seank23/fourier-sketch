import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { AppStateCtx, ImageDataCtx, ProgressCtx, SketchPathCtx } from '../Contexts';
import ImageViewer from './ImageViewer';
import useFirestore from '../hooks/useFirestore';

const FFT = require('fft.js');
var processor = new Worker("./ImageProcessor.js", { type: "module" });

const ImageController = () => {

    const { appState, setAppState } = useContext(AppStateCtx);
    const { setSketchPath } = useContext(SketchPathCtx);
    const { setProgress } = useContext(ProgressCtx);
    const [prevUrl, setPrevUrl] = useState(null);
    const [img, setImg] = useState(null);
    const isProcessing = useRef(false);

    const [imageData, setImageData] = useState(null);
    const imageDataProvider = useMemo(() => ({ imageData, setImageData }), [imageData, setImageData]);

    const { doc } = useFirestore('images');

    function GetPathDFT(path) {

        let inputX = [];
        let inputY = [];
        for(let i = 0; i < path.length; i++) {
            inputX.push(path[i][1]);
            inputY.push(path[i][0]);
        }
        let dftX = GetFourier(inputX).sort((a, b) => b.amp - a.amp);
        let dftY = GetFourier(inputY).sort((a, b) => b.amp - a.amp);
        return [dftX, dftY];
    }
    
    function GetFourier(x) {
        
        let numPow = 2;
        while(numPow < x.length) {
            numPow *= 2;
        }
        let padding = numPow - x.length;
        for(let i = 0; i < padding; i++) {
            x.push(0);
        }
        const f = new FFT(numPow);
        const out = f.createComplexArray();
        f.transform(out, f.toComplexArray(x));
        let X = [];
        for(let k = 0; k < out.length; k += 2) {
            let re = out[k] / (out.length / 2);
            let im = out[k + 1] / (out.length / 2);
            X[k / 2] = {
                re: re,
                im: im,
                freq: k / 2,
                amp: Math.sqrt(re ** 2 + im ** 2),
                phase: Math.atan2(im, re)
            }
        }
        return X;
    }

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

        if(appState === 0) {
            if(processor) {
                processor.terminate();
                processor = undefined;
                isProcessing.current = false;
            }
        }
        if(appState === 2 && !isProcessing.current) {
            isProcessing.current = true;
            if(processor === undefined) {
                processor = new Worker("./ImageProcessor.js", { type: "module" });
            }
            processor.postMessage({ stage: 0, imageData: imageData, denoiseThreshold: 100 });
            processor.onmessage = (e) => {

                var outputData = e.data;
                switch(outputData[0]) {
                    case "state":
                        setAppState(outputData[1]);
                        break;
                    case "output":
                        setImageData(outputData[1]);
                        setAppState(5);
                        isProcessing.current = false;
                        break;
                    default:
                }
            };
        }
        else if(appState === 6 && !isProcessing.current) {
            isProcessing.current = true;
            processor.postMessage({ stage: 1, imageData: imageData, sampleInterval: 2 });
            processor.onmessage = (e) => {

                var outputData = e.data;
                switch(outputData[0]) {
                    case "state":
                        setAppState(outputData[1]);
                        break;
                    case "progress":
                        setProgress(outputData[1]);
                        break;
                    case "pathDFT":
                        let pathDFT = GetPathDFT(outputData[1]);
                        processor.postMessage({ stage: 2, pathDFT: pathDFT });
                        break;
                    case "output":
                        setImageData(outputData[1][0]);
                        setSketchPath(outputData[1][1]);
                        setAppState(8);
                        isProcessing.current = false;
                        break;
                    default:
                }
            };
        }
    }, [appState]);

    return (
        <ImageDataCtx.Provider value={imageDataProvider}>
            {appState > 0 && <ImageViewer img={img} /> }
        </ImageDataCtx.Provider> 
     );
}
 
export default ImageController;