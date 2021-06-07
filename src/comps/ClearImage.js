import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { AppStateCtx, SketchPathCtx } from '../Contexts';
import Cookies from 'universal-cookie';

const ClearImage = () => {

    const cookies = new Cookies();
    const { appState, setAppState } = useContext(AppStateCtx);
    const { setSketchPath } = useContext(SketchPathCtx);
    const [ text, setText ] = useState("");

    const onClear = () => {
        setSketchPath([]);
        cookies.set('imageId', '', { path: '/', maxAge: 1800 });
        setAppState(0);
    }

    useEffect(() => {
        if(appState === 1 || appState === 5 || appState === 8) {
            setText("Clear");
        }
        else {
            setText("Cancel");
        }
    }, [appState]);

    return (
        <Button className="sketchButton" variant="outline-danger" onClick={onClear}>{text}</Button>
     );
}
 
export default ClearImage;