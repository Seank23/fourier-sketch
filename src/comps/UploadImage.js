import React, { useContext, useState } from 'react';
import ProgressBar from './ProgressBar';
import { Button } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';

const UploadImage = () => {
    
    //const { appState, setAppState } = useContext(AppStateCtx);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);

    const types = ['image/png', 'image/jpeg', 'image/jpg'];

    const uploadHandler = (e) => {

        let selected = e.target.files[0];
        if(selected && types.includes(selected.type)) {
            setFile(selected);
            setError('');
        } else {
            setFile(null);
            setError('Please select an image file (.png or .jpg)')
        }
    }

    return (
        <form>
            <Button variant="outline-primary" disabled={file}>
                <label>
                    <input type="file" onChange={uploadHandler} />
                    <span>Upload</span>
                </label>
            </Button>
            <div className="output">
                { error && <div className="error">{ error }</div> }
                { file && <div className="file">{ file.name }</div> }
                { file && <ProgressBar file={file} setFile={setFile} /> }
            </div>
        </form>
    )
}

export default UploadImage;