import React, { useContext, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ProgressBar from './ProgressBar';
import { Card } from 'react-bootstrap';
import { AppStateCtx } from '../Contexts';
import useStorage from '../hooks/useStorage';
import { FaFileUpload } from 'react-icons/fa';

const UploadImage = () => {

    const { setAppState } = useContext(AppStateCtx);
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const { url, progress } = useStorage(file);

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            setFile(acceptedFiles[0]);
        }
    });

    const onDrag = (isDragging) => {
        if(dragging !== isDragging) {
            setDragging(isDragging);
        }
    }

    useEffect(() => {
        if(url) {
            setFile(null);
            setAppState(1);
        }
    }, [url, setFile, setAppState])

    return (
        <Card body className="viewer-container shadow">
            { !file && 
            <div {...getRootProps()} style={{height: "100%"}}>
                <div className={`drag-area ${dragging ? "active" : "" } `} onDragOver={() => onDrag(true)} onDrop={() => onDrag(false)}>
                    <input {...getInputProps()}/>
                    <div className="icon"><FaFileUpload/></div>
                    <header>Drag & Drop to Upload File</header>
                    <span>OR</span>
                    <button>Browse File</button>
                </div>
            </div> }
            { file && <ProgressBar message={"Uploading Image..."} progress={progress} /> }
        </Card>
    )
}

export default UploadImage;