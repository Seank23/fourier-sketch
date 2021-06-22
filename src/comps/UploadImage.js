import React, { useContext, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ProgressBar from './ProgressBar';
import { Card } from 'react-bootstrap';
import { AppStateCtx, SketchPathCtx } from '../Contexts';
import useStorage from '../hooks/useStorage';
import { FaFileUpload } from 'react-icons/fa';

const UploadImage = () => {

    const { setAppState } = useContext(AppStateCtx);
    const { setSketchPath } = useContext(SketchPathCtx);
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
        accept: "image/*, .csv",
        onDrop: (acceptedFiles) => {
            let nameSplit = acceptedFiles[0].name.split('.');
            if(nameSplit[1] === "csv") {
                parseCSV(acceptedFiles[0]);
            }
            else {
                loadImage(acceptedFiles[0]);
            }
        }
    });

    const onDrag = (isDragging) => {
        if(dragging !== isDragging) {
            setDragging(isDragging);
        }
    }

    const loadImage = (file) => {

        var reader = new FileReader();
        reader.onload = function (readerEvent) {
            var image = new Image();
            image.onload = () => {
                var canvas = document.createElement('canvas'), max_size = 1600, width = image.width, height = image.height;
                // Resize image before upload
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

                setFile(new File([dataURLToBlob(dataUrl)], file.name, file));
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
    }

    const parseCSV = (file) => {

        setAppState(9);
        let reader = new FileReader();
        reader.onload = function(readerEvent) {
            let dataStr = readerEvent.target.result;
            let dataArr = dataStr.split(',');
            if(dataArr.length > 3 && (dataArr.length - 4) % 4 === 0) {
                let length = parseInt(dataArr.shift());
                let width = parseInt(dataArr.shift());
                let height = parseInt(dataArr.shift());
                let dataX = [];
                let dataY = [];
                for(let k = 0; k < dataArr.length - 1; k += 4) {
                    let reX = parseFloat(dataArr[k]);
                    let imX = parseFloat(dataArr[k + 1]);
                    let reY = parseFloat(dataArr[k + 2]);
                    let imY = parseFloat(dataArr[k + 3]);
                    dataX[k / 4] = {
                        re: reX,
                        im: imX,
                        freq: k / 4,
                        amp: Math.sqrt(reX ** 2 + imX ** 2),
                        phase: Math.atan2(imX, reX)
                    }
                    dataY[k / 4] = {
                        re: reY,
                        im: imY,
                        freq: k / 4,
                        amp: Math.sqrt(reY ** 2 + imY ** 2),
                        phase: Math.atan2(imY, reY)
                    }
                }
                setAppState(7);
                setSketchPath([[dataX.sort((a, b) => b.amp - a.amp), dataY.sort((a, b) => b.amp - a.amp)], length, [width, height]]);
            }
            else {
                alert("CSV file is not formatted correctly.");
                setAppState(0);
            }
        }
        reader.readAsText(file)
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