import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { AppStateCtx, SketchPathCtx } from '../Contexts';
import Cookies from 'universal-cookie';

const ClearImage = () => {

    const cookies = new Cookies();
    const { setAppState } = useContext(AppStateCtx);
    const { setSketchPath } = useContext(SketchPathCtx);

    const onClear = () => {
        setAppState(0);
        setSketchPath([]);
        cookies.set('imageId', '', { path: '/', maxAge: 1800 });
    }

    return (
        <Button variant="outline-danger" onClick={onClear}>Clear</Button>
     );
}
 
export default ClearImage;