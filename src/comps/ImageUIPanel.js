import React, { useContext } from 'react';
import { AppStateCtx } from '../Contexts';
import ClearImage from './ClearImage';
import UploadImage from './UploadImage';

const ImageUIPanel = () => {

    const { appState, setAppState } = useContext(AppStateCtx);

    return ( 
        <div className="ImageUIPanel">
            { appState === 0  && <UploadImage/>}
            { appState > 0  && <ClearImage/>}
        </div>
    );
}
 
export default ImageUIPanel;