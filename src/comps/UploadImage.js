import React, { useContext, useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import { Button } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';
import useStorage from '../hooks/useStorage';

const UploadImage = () => {
    
    const types = ['image/png', 'image/jpeg', 'image/jpg'];

    const { setAppState } = useContext(AppStateCtx);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const { url, progress } = useStorage(file);

    useEffect(() => {
        if(url) {
            setFile(null);
            setAppState(1);
        }
    }, [url, setFile, setAppState])

    const uploadHandler = (e) => {

        let selected = e.target.files[0];
        if(selected) {
            if(types.includes(selected.type)) {
                setFile(selected);
                setError('');
            } else {
                setFile(null);
                setError('Please select an image file (.png or .jpg)')
            } 
        }
    }

    return (
        <form>
            <Button variant="outline-primary" disabled={file}>
                <label>
                    <input type="file" onChange={uploadHandler} disabled={file} />
                    <span>Upload</span>
                </label>
            </Button>
            <div className="output">
                { error && <div className="error">{ error }</div> }
                { file && <div className="file">{ file.name }</div> }
                { file && <ProgressBar progress={progress} /> }
            </div>
        </form>
    )
}

export default UploadImage;