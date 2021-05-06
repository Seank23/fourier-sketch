import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';
import Cookies from 'universal-cookie';

const ClearImage = () => {

    const cookies = new Cookies();
    const { setAppState } = useContext(AppStateCtx);

    const onClear = () => {
        setAppState(0);
        cookies.set('imageId', '', { path: '/', maxAge: 1800 });
        console.log(cookies.get('imageId'));
    }

    return (
        <Button variant="outline-danger" onClick={onClear}>Clear</Button>
     );
}
 
export default ClearImage;