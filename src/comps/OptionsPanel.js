import React, { useContext, useEffect, useState } from 'react';
import { AppStateCtx, SketchOptionsCtx } from '../Contexts';

const OptionsPanel = () => {

    const { appState, setAppState } = useContext(AppStateCtx);
    const { sketchOptions, setSketchOptions } = useContext(SketchOptionsCtx);
    const [denoiseDisabled, setDenoiseDisabled] = useState(true);
    const [sampleDisabled, setSampleDisabled] = useState(true);
    const [updatePage, setUpdatePage] = useState(true);

    const onDenoiseChange = (e) => {
        updateOptions('denoiseThreshold', e.target.value);
        if(appState === 5 && updatePage) {
            setUpdatePage(false);
            setTimeout(() => {
                setAppState(2);
                setUpdatePage(true);
            }, 1000);
        }
    }

    const onSampleChange = (e) => {
        updateOptions('sampleInterval', e.target.value);
    }

    const onCoefficientsChange = (e) => {
        updateOptions('coefficients', e.target.value);
    }

    const onSpeedChange = (e) => {
        updateOptions('sketchSpeed', e.target.value);
    }

    const updateOptions = (key, val) => {

        let options = Object.assign({}, sketchOptions);
        options[key] = parseInt(val);
        setSketchOptions(options);
    }

    useEffect(() => {
        if(appState === 1 || appState === 5) {
            setDenoiseDisabled(false);
        }
        else {
            setDenoiseDisabled(true);
        }
        if(appState === 5) {
            setSampleDisabled(false);
        }
        else {
            setSampleDisabled(true);
        }
    }, [appState])

    return (
        ( (appState > 0 && appState < 8 &&
            <div className="flex-row optionPanel"> 
                <div className="optionEntry">
                    <label htmlFor="denoiseSlider">Edge Denoise: {sketchOptions['denoiseThreshold']}</label>
                    <input type="range" className="custom-range optionSlider" id="denoiseSlider" onChange={onDenoiseChange} min={0} max={255} value={sketchOptions['denoiseThreshold']} disabled={denoiseDisabled} />
                </div>
                <div className="optionEntry">
                    <label htmlFor="sampleSlider">Sample Ratio: {sketchOptions['sampleInterval']}</label>
                    <input type="range" className="custom-range optionSlider" id="sampleSlider" onChange={onSampleChange} min={1} max={5} value={sketchOptions['sampleInterval']} disabled={sampleDisabled} />
                </div>
            </div>)
        || (appState === 8 &&
            <div className="flex-row optionPanel">
                <div className="optionEntry">
                    <label htmlFor="denoiseSlider">Fourier Coefficients: {sketchOptions['coefficients']}</label>
                    <input type="range" className="custom-range optionSlider" id="coefficientsSlider" onChange={onCoefficientsChange} min={0} max={1000} value={sketchOptions['coefficients']} />
                </div>
                <div className="optionEntry">
                    <label htmlFor="sampleSlider">Sketch Speed: {sketchOptions['sketchSpeed']}</label>
                    <input type="range" className="custom-range optionSlider" id="speedSlider" onChange={onSpeedChange} min={1} max={100} value={sketchOptions['sketchSpeed']} />
                </div>
            </div>)
        )
    );
}

export default OptionsPanel;