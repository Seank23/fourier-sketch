import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { AppStateCtx, ImageDataCtx, ProgressCtx, SketchOptionsCtx, SketchPathCtx, ImgStateCtx, ImageURLCtx } from '../Contexts';
import ImageViewer from './ImageViewer';

const FFT = require('fft.js');
var processor = new Worker("./ImageProcessor.js", { type: "module" });

const ImageController = () => {

    const qualityToRes = { 1: 2, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1 };
    const { appState, setAppState } = useContext(AppStateCtx);
    const { imageURL } = useContext(ImageURLCtx);
    const { setSketchPath } = useContext(SketchPathCtx);
    const { setProgress } = useContext(ProgressCtx);
    const { sketchOptions } = useContext(SketchOptionsCtx);
    const [prevUrl, setPrevUrl] = useState(null);
    const [img, setImg] = useState(null);
    const isProcessing = useRef(false);

    const [imgState, setImgState] = useState(0);
    const imgStateProvider = useMemo(() => ({ imgState, setImgState }), [imgState, setImgState]);
    const [imageData, setImageData] = useState({0: null, 1: null});
    const imageDataProvider = useMemo(() => ({ imageData, setImageData }), [imageData, setImageData]);

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

    const updateImageData = (key, val) => {

        let data = Object.assign({}, imageData);
        data[key] = val;
        setImageData(data);
    }

    useEffect(() => {
        if(imageURL) {
            var imgElem = new Image();
            imgElem.crossOrigin = "Anonymous";
            if(imageURL !== prevUrl) {
                imgElem.src = imageURL;
                setPrevUrl(imageURL);
            }
            imgElem.onload = () => {
                setAppState(1);
                setImg(imgElem);
            };
        }
    }, [imageURL]);

    useEffect(() => {

        if(appState === 9) { // Reset state
            setImg(null);
            setImgState(0);
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
            processor.postMessage({ stage: 0, imageData: imageData[0], denoiseThreshold: sketchOptions['denoiseThreshold'] });
            processor.onmessage = (e) => {

                var outputData = e.data;
                switch(outputData[0]) {
                    case "state":
                        setAppState(outputData[1]);
                        break;
                    case "output":
                        updateImageData(1, outputData[1]);
                        setImgState(1);
                        setAppState(5);
                        isProcessing.current = false;
                        break;
                    default:
                }
            };
        }
        else if(appState === 6 && !isProcessing.current) {
            isProcessing.current = true;
            processor.postMessage({ stage: 1, imageData: imageData[1], sampleInterval: qualityToRes[sketchOptions['qualitySetting']], pathDepth: sketchOptions['pathDepth'] });
            processor.onmessage = (e) => {

                var outputData = e.data;
                switch(outputData[0]) {
                    case "state":
                        setAppState(outputData[1]);
                        break;
                    case "progress":
                        setProgress(outputData[1]);
                        break;
                    case "output":
                        let pathDFT = GetPathDFT(outputData[1][0]);
                        setAppState(7);
                        setImgState(2);
                        setSketchPath([pathDFT, outputData[1][0].length, outputData[1][1]]);
                        isProcessing.current = false;
                        break;
                    default:
                }
            };
        }
        else if(appState === 7) {
            setImgState(2);
        }
    }, [appState]);

    return (
        <ImageDataCtx.Provider value={imageDataProvider}>
            <ImgStateCtx.Provider value={imgStateProvider}>
                { appState > 0 && <ImageViewer img={img} /> }
            </ImgStateCtx.Provider>
        </ImageDataCtx.Provider> 
     );
}
 
export default ImageController;