import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { AppStateCtx, SketchOptionsCtx } from '../Contexts';

const GenerateSketch = () => {

    const { appState, setAppState } = useContext(AppStateCtx);
    const { sketchOptions, setSketchOptions } = useContext(SketchOptionsCtx);
    const [text, setText] = useState("");
    const [disabled, setDisabled] = useState(false);

    useEffect(() => {
        if(appState === 1) {
            setDisabled(false);
            setText("Obtain Outline");
        }
        else if (appState === 5) {
            setDisabled(false);
            setText("Generate Sketch");
        }
    }, [appState]);

    const onClick = () => {
        if(appState === 1) {
            setAppState(2);
            setDisabled(true);
        }
        else if(appState === 5) {
            setAppState(6);
            setDisabled(true);
        }
    }

    const onRestart = () => {
        let options = Object.assign({}, sketchOptions);
        options['restartDrawing'] = 1;
        setSketchOptions(options);
    }

    return ( 
        ( (appState < 7 && <Button className="sketchButton" variant="outline-primary" onClick={onClick} disabled={disabled}>{text}</Button>)
        || (appState >= 7 && <Button className="sketchButton" variant="outline-success" onClick={onRestart} disabled={appState === 8 ? false : true}>Restart Sketch</Button>) )
     );
}
 
export default GenerateSketch;