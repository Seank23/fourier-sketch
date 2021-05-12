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

    var dataURLToBlob = function(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) === -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = parts[1];
            return new Blob([raw], {type: contentType});
        }
        parts = dataURL.split(BASE64_MARKER);
        contentType = parts[0].split(':')[1];
        raw = window.atob(parts[1]);
        var rawLength = raw.length;
        var uInt8Array = new Uint8Array(rawLength);
        for(var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], {type: contentType});
    }

    const { getRootProps, getInputProps } = useDropzone({
        accept: "image/*",
        onDrop: (acceptedFiles) => {
            // Resize image before upload
            var reader = new FileReader();
            reader.onload = function (readerEvent) {
                var image = new Image();
                image.onload = () => {
                    var canvas = document.createElement('canvas'), max_size = 1920, width = image.width, height = image.height;
                    if (width > height) {
                        if (width > max_size) {
                            height *= max_size / width;
                            width = max_size;
                        }
                    } else {
                        if (height > max_size) {
                            width *= max_size / height;
                            height = max_size;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                    var dataUrl = canvas.toDataURL('image/jpeg');

                    setFile(new File([dataURLToBlob(dataUrl)], acceptedFiles[0].name, acceptedFiles[0]));
                }
                image.src = readerEvent.target.result;
            }
            reader.readAsDataURL(acceptedFiles[0]);
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