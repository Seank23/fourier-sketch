import React, { useContext, useEffect } from 'react';
import { AppStateCtx } from '../Contexts';
import useStorage from '../hooks/useStorage';

const ProgressBar = ({ file, setFile }) => {

    const { setAppState } = useContext(AppStateCtx);
    const { url, progress } = useStorage(file);

    useEffect(() => {
        if(url) {
            setFile(null);
            setAppState(1);
        }
    }, [url, setFile, setAppState])

    return (
        <div className="progress-bar" style={{ width: progress + '%'}}></div>
    )
}

export default ProgressBar;