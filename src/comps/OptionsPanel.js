import React, { useContext, useEffect, useState } from 'react';
import { AppStateCtx, SketchOptionsCtx } from '../Contexts';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Tooltip } from '@material-ui/core';

const OptionsPanel = () => {

    const qualitySettingUI = { 1: "Very Low", 2: "Low", 3: "Medium", 4: "High", 5: "Very High", 6: "Ultra" };

    const { appState, setAppState } = useContext(AppStateCtx);
    const { sketchOptions, setSketchOptions } = useContext(SketchOptionsCtx);
    const [denoiseDisabled, setDenoiseDisabled] = useState(true);
    const [sampleDisabled, setSampleDisabled] = useState(true);
    const [updatePage, setUpdatePage] = useState(true);

    const HtmlTooltip = withStyles((theme) => ({
        tooltip: {
          backgroundColor: '#f5f5f9',
          color: 'rgba(0, 0, 0, 0.87)',
          maxWidth: 220,
          fontSize: theme.typography.pxToRem(12),
          border: '1px solid #dadde9',
        },
      }))(Tooltip);

      const useStyles = makeStyles((theme) => ({
        customWidth: {
          maxWidth: 500,
        },
      }));

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
        updateOptions('qualitySetting', e.target.value);
    }

    const onCoefficientsChange = (e) => {
        updateOptions('selectedResLevel', e.target.value);
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

    const classes = useStyles();

    return (
        ( (appState > 0 && appState < 7 &&
            <div className="flex-row optionPanel"> 
                <div className="optionEntry">
                    <label htmlFor="denoiseSlider">Edge Denoise: {sketchOptions['denoiseThreshold']}</label>
                    <HtmlTooltip  enterDelay={800} classes={{ tooltip: classes.customWidth }} title={
                        <React.Fragment>
                            <Typography color="inherit">Edge Denoise</Typography>
                            <ul><li>{"Denoise reduces the complexity of edges."}</li><li>{"High values may result in lost details."}</li><li>{"Values between 75 and 150 are recommended."}</li></ul>
                        </React.Fragment>
                    }>
                        <input type="range" className="custom-range optionSlider" id="denoiseSlider" onChange={onDenoiseChange} min={0} max={255} value={sketchOptions['denoiseThreshold']} disabled={denoiseDisabled} />
                    </HtmlTooltip>
                </div>
                <div className="optionEntry">
                    <label htmlFor="sampleSlider">Sketch Quality: {qualitySettingUI[sketchOptions['qualitySetting']]}</label>
                    <HtmlTooltip enterDelay={800} classes={{ tooltip: classes.customWidth }} title={
                        <React.Fragment>
                            <Typography color="inherit">Sketch Quality</Typography>
                            <ul><li>{"Tweaks sketch parameters such as the sample resolution and interpolation amount."}</li><li>{"Higher settings will produce a more detailed and accurate sketch but will take longer to process."}</li><li>{"Medium or High is recommended."}</li></ul>
                        </React.Fragment>
                    }>
                        <input type="range" className="custom-range optionSlider" id="sampleSlider" onChange={onSampleChange} min={1} max={6} value={sketchOptions['qualitySetting']} disabled={sampleDisabled} />
                    </HtmlTooltip>
                </div>
            </div>)
        || (appState >= 7 &&
            <div className="flex-row optionPanel">
                <div className="optionEntry">
                    <label htmlFor="denoiseSlider">Fourier Coefficients: {sketchOptions['selectedResLevel'] === sketchOptions['resLevels'] - 1 ? "Max" : Math.pow(2, sketchOptions['selectedResLevel'] + 1)}</label>
                    <HtmlTooltip enterDelay={800} classes={{ tooltip: classes.customWidth }} title={
                        <React.Fragment>
                            <Typography color="inherit">Fourier Coefficients</Typography>
                            <ul><li>{"Determines the number of Fourier coefficients used to draw the sketch."}</li><li>{"Lower values construct the sketch using fewer data points meaning details are lost."}</li><li>{"Illustrates how Fourier analysis is used to draw an increasingly detailed sketch."}</li></ul>
                        </React.Fragment>
                    }>
                        <input type="range" className="custom-range optionSlider" id="coefficientsSlider" onChange={onCoefficientsChange} min={0} max={sketchOptions['resLevels'] - 1} value={sketchOptions['selectedResLevel']} disabled={appState === 8 ? false : true} />
                    </HtmlTooltip>
                </div>
                <div className="optionEntry">
                    <label htmlFor="sampleSlider">Sketch Speed: {sketchOptions['sketchSpeed']}</label>
                    <HtmlTooltip enterDelay={800} classes={{ tooltip: classes.customWidth }} title={
                        <React.Fragment>
                            <Typography color="inherit">Sketch Speed</Typography>
                            <ul><li>{"Determines how quickly the sketch is drawn."}</li></ul>
                        </React.Fragment>
                    }>
                        <input type="range" className="custom-range optionSlider" id="speedSlider" onChange={onSpeedChange} min={1} max={100} value={sketchOptions['sketchSpeed']} disabled={appState === 8 ? false : true} />
                    </HtmlTooltip>
                </div>
            </div>)
        )
    );
}

export default OptionsPanel;