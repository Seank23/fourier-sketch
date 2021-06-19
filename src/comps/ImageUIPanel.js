import React, { useContext } from 'react';
import { Card } from 'react-bootstrap';
import { AppStateCtx, ProgressCtx } from '../Contexts';
import ClearImage from './ClearImage';
import DropdownMenu from './DropdownMenu';
import GenerateSketch from './GenerateSketch';
import OptionsPanel from './OptionsPanel';

const ImageUIPanel = () => {

    const { appState } = useContext(AppStateCtx);
    const { progress } = useContext(ProgressCtx);

    return ( 
        <Card className="ImageUIPanel">
            <Card.Header>
            { appState === 0  && <span id="welcomeText">Welcome to FourierSketch, upload an image to start!</span> }
            { ((appState > 0 && appState < 7) || appState === 8) && <div className="flex-row"><OptionsPanel/><div className="buttonContainer"><GenerateSketch/><ClearImage/></div><DropdownMenu/></div> }
            { appState === 7 && 
            <div className="flex-row">
                <span id="headerProgress">Producing Sketch... {progress && Math.round(progress) + "%"}</span>
                <div className="buttonContainer"><GenerateSketch/><ClearImage/></div>
                <DropdownMenu/>
            </div> }
            </Card.Header>
        </Card>
    );
}
 
export default ImageUIPanel;