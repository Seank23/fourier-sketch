import React, { useContext, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';

const GenerateSketch = () => {

    const { appState, setAppState } = useContext(AppStateCtx);
    const textRef = useRef("Obtain Outline");
    const disabledRef = useRef(false);

    useEffect(() => {
        if(appState === 0) {
            disabledRef.current = false;
            textRef.current = "Obtain Outline";
        }
        else if (appState === 4) {
            disabledRef.current = false;
            textRef.current = "Generate Sketch";
        }
    }, [appState]);

    const onClick = () => {
        if(appState === 1) {
            setAppState(2);
            disabledRef.current = true;
        }
        else if(appState === 5) {
            setAppState(6);
            disabledRef.current = true;
        }
    }

    return ( 
        <Button variant="outline-primary" onClick={onClick} disabled={disabledRef.current}>{textRef.current}</Button>
     );
}
 
export default GenerateSketch;