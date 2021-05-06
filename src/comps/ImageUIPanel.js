import React, { useContext } from 'react';
import { Card } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';
import ClearImage from './ClearImage';
import UploadImage from './UploadImage';

const ImageUIPanel = () => {

    const { appState } = useContext(AppStateCtx);

    return ( 
        <Card className="ImageUIPanel">
            <Card.Header>
            { appState === 0  && <UploadImage/>}
            { appState > 0  && <ClearImage/>}
            </Card.Header>
        </Card>
    );
}
 
export default ImageUIPanel;