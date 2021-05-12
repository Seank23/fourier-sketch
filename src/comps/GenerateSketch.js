import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';

const GenerateSketch = () => {

    const { setAppState } = useContext(AppStateCtx);

    const onClick = () => {
        setAppState(2);
    }

    return ( 
        <Button variant="outline-primary" onClick={onClick}>Generate Sketch</Button>
     );
}
 
export default GenerateSketch;