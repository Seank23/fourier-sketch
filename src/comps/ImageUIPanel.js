import React, { useContext } from 'react';
import { Card } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';
import ClearImage from './ClearImage';
import GenerateSketch from './GenerateSketch';
import OptionsPanel from './OptionsPanel';

const ImageUIPanel = () => {

    const { appState } = useContext(AppStateCtx);

    return ( 
        <Card className="ImageUIPanel">
            <Card.Header>
            { appState === 0  && <span id="welcomeText">Welcome to FourierSketch, upload an image to start!</span> }
            { appState > 0  && <div className="flex-row"><OptionsPanel/><div className="buttonContainer"><GenerateSketch/><ClearImage/></div></div> }
            </Card.Header>
        </Card>
    );
}
 
export default ImageUIPanel;