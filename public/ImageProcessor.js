var path;
var outputImg;
var dimensions;

onmessage = (e) => {
    if(e.data['stage'] === 0) {
        let { imageData, denoiseThreshold } = e.data;
        dimensions = [imageData.width, imageData.height];
        postMessage(["state", 3]);
        let imgMatrix = ImageDataToMatrix(ToGrayscale(imageData));
        postMessage(["state", 4]);
        let denoiseSobel = DenoiseImage(ConvolveSobel(imgMatrix), denoiseThreshold);
        outputImg = MatrixToImageData(denoiseSobel);
        postMessage(["output", outputImg]);
    }
    else if(e.data['stage'] === 1) {
        let { imageData, sampleInterval } = e.data;
        let sampledPixels = GetSampledPixels(ImageDataToMatrix(imageData), sampleInterval);
        path = GetPath(sampledPixels, sampleInterval, 400);
        let sampledImg = GetPathCoverage(path, imageData.width, imageData.height);
        outputImg = MatrixToImageData(sampledImg);
        postMessage(["pathDFT", path]);
    }
    else if(e.data['stage'] === 2) {
        let { pathDFT } = e.data;
        postMessage(["state", 7]);
        let sketchPath = CalculateSketchPath(pathDFT);
        postMessage(["output", [outputImg, [sketchPath, dimensions]]]);
    }
}

function ToGrayscale(imageData) {

    var data = new Array(imageData.data.length);
    for (let i = 0; i < imageData.height; i++) {
        for (let j = 0; j < imageData.width; j++) {

            var index = (i*4) * imageData.width + (j*4);
            var average = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
            data[index] = average;
            data[index + 1] = average;
            data[index + 2] = average;
            data[index + 3] = imageData.data[index + 3];
        }
    }
    return new ImageData(Uint8ClampedArray.from(data), imageData.width, imageData.height);
}

function ImageDataToMatrix(imageData) {

    var dataIndex = 0;
    var imgMatrix = new Array(imageData.height);
    for(let i = 0; i < imgMatrix.length; i++) {
        imgMatrix[i] = new Array(imageData.width);
        for(let j = 0; j < imgMatrix[i].length; j++) {
            imgMatrix[i][j] = imageData.data[dataIndex];
            dataIndex += 4;
        }
    }
    return imgMatrix;
}

function MatrixToImageData(imgMatrix) {

    var dataIndex = 0;
    var data = new Array(imgMatrix.length * imgMatrix[0].length * 4);
    for(let i = 0; i < imgMatrix.length; i++) {
        for(let j = 0; j < imgMatrix[i].length; j++) {
            data[dataIndex] = imgMatrix[i][j];
            data[dataIndex + 1] = imgMatrix[i][j];
            data[dataIndex + 2] = imgMatrix[i][j];
            data[dataIndex + 3] = 255;
            dataIndex += 4;
        }
    }
    return new ImageData(Uint8ClampedArray.from(data), imgMatrix[0].length, imgMatrix.length);
}

function DenoiseImage(imgMatrix, threshold) {

    var denoise = new Array(imgMatrix.length);
    for(let i = 0; i < imgMatrix.length; i++) {
        denoise[i] = new Array(imgMatrix[i].length);
        for(let j = 0; j < imgMatrix[i].length; j++) {
            if(imgMatrix[i][j] > threshold) {
                denoise[i][j] = imgMatrix[i][j];
            } else {
                denoise[i][j] = 0;
            }
        }
    }
    return denoise;
}

function ConvolveSobel(imgMatrix) {

    var outX = conv_2d([[1,0,-1],[2,0,-2],[1,0,-1]], imgMatrix);
    var outY = conv_2d([[1,2,1],[0,0,0],[-1,-2,-1]], imgMatrix);
    for(let i = 0; i < outX.length; i++) {
        for(let j = 0; j < outX[i].length; j++) {
            outX[i][j] = Math.sqrt(outX[i][j] ** 2 + outY[i][j] ** 2)
        }
    }
    return outX;
}

function GetSampledPixels(imgMatrix, sampleInterval) {

    const imgWidth = imgMatrix[0].length;
    const imgHeight = imgMatrix.length;

    var sampledPixels = [];
    var count = 0;
    for(let i = 0; i < imgHeight; i += sampleInterval) {
        for(let j = 0; j < imgWidth; j += sampleInterval) {
            if(imgMatrix[i][j] > 0) {
                sampledPixels[count] = new Array(2);
                sampledPixels[count][0] = i;
                sampledPixels[count][1] = j;
                count++;
            }
        }
    }
    return sampledPixels;
}

function GetPath(pixels, sampleInterval, depth) {

    var pixelStrings = PixelsToString(pixels);
    var path = [];
    var pixelIndex = 0;
    path[0] = pixelStrings[0];
    var backtrackCount = 0;
    while(path.length < pixelStrings.length) {
        if(path.length % 100 === 0) { postMessage(["progress", (path.length / pixelStrings.length) * 100]) }
        const curPixel = pixelStrings[pixelIndex];
        for(let i = sampleInterval; i < (depth + 1) * sampleInterval; i += sampleInterval) {
            var searchPixels = [];
            const pixelVals = curPixel.split(",");
            const pixelX = parseInt(pixelVals[0]);
            const pixelY = parseInt(pixelVals[1]);
            for(let j = -i; j < i + 1; j += sampleInterval) {
                searchPixels[searchPixels.length] = (pixelX - i) + "," + (pixelY + j);
                searchPixels[searchPixels.length] = (pixelX + i) + "," + (pixelY + j);
                searchPixels[searchPixels.length] = (pixelX + j) + "," + (pixelY - i);
                searchPixels[searchPixels.length] = (pixelX + j) + "," + (pixelY + i);
            }
            var found = false;
            for(let j = 0; j < searchPixels.length; j++) {
                var foundIndex = pixelStrings.indexOf(searchPixels[j]);
                if(foundIndex !== -1) {
                    if(!path.includes(searchPixels[j])) {
                        found = true;
                        pixelIndex = foundIndex;
                        break;
                    }
                }
            }
            if(found) {
                path[path.length] = pixelStrings[pixelIndex];
                backtrackCount = 0;
                break;
            }
        }
        if(!found) {
            backtrackCount++;
            pixelIndex = pixelStrings.indexOf(path[path.length - 2*backtrackCount]); // Backtrack to previous pixel
            path[path.length] = pixelStrings[pixelIndex];
            console.log("Backtracking: " + backtrackCount);
            break;
        }
    }
    postMessage(["progress", null]);
    return StringToPixels(path);
}

function PixelsToString(pixels) {

    var pixelStrings = new Array(pixels.length);
    for(let i = 0; i < pixels.length; i++) {
        pixelStrings[i] = pixels[i][0] + "," + pixels[i][1];
    }
    return pixelStrings;
}

function StringToPixels(pixelStrings) {

    var pixels = new Array(pixelStrings.length);
    for(let i = 0; i < pixelStrings.length; i++) {
        let strings = pixelStrings[i].split(",");
        pixels[i] = new Array(2);
        pixels[i][0] = parseInt(strings[0]);
        pixels[i][1] = parseInt(strings[1]);
    }
    return pixels;
}

function GetPathCoverage(path, imgWidth, imgHeight) {

    var sampledImg = new Array(imgHeight);
    for(let i = 0; i < sampledImg.length; i++) {
        sampledImg[i] = new Array(imgWidth);
        for(let j = 0; j < sampledImg[i].length; j++) {
            sampledImg[i][j] = 0;
        }
    }
    for(let i = 0; i < path.length; i++) {
        sampledImg[path[i][0]][path[i][1]] = 255;
    }
    return sampledImg;
}

function CalculateSketchPath(pathDFT) {
    
    let Xx = pathDFT[0];
    let Xy = pathDFT[1];
    let time = 0;
    let sketchPath = [];

    for(let i = 0; i < Xx.length; i++) {
        if(i % 100 === 0) { postMessage(["progress", (i / Xx.length) * 100]) }
        let coords = [0, 0];
        for(let j = 0; j < Xx.length; j++) {
            coords[0] += Xx[j].amp * Math.cos(Xx[j].freq * time + Xx[j].phase);
			coords[1] += Xy[j].amp * Math.sin(Xy[j].freq * time + Xy[j].phase + Math.PI/2);
        }
        sketchPath.push(coords);
        time += 2*Math.PI / Xx.length;
    }
    postMessage(["progress", null]);
    return sketchPath;
}

function uniform_array(len, value) {
    let arr = new Array(len); for (let i=0; i<len; ++i) arr[i] = Array.isArray(value) ? [...value] : value;
    return arr;
}

function conv_2d(kernel, array) {
    var result = uniform_array(array.length, uniform_array(array[0].length, 0));
    var kRows = kernel.length;
    var kCols = kernel[0].length;
    var rows = array.length;
    var cols = array[0].length;
    // find center position of kernel (half of kernel size)
    var kCenterX = Math.floor(kCols/2);
    var kCenterY = Math.floor(kRows/2);
    var i, j, m, n, ii, jj;

    for(i=0; i < rows; ++i){          // for all rows
        for(j=0; j < cols; ++j){          // for all columns
            for(m=0; m < kRows; ++m){         // for all kernel rows
                for(n=0; n < kCols; ++n){        // for all kernel columns
                    // index of input signal, used for checking boundary
                    ii = i + (m - kCenterY);
                    jj = j + (n - kCenterX);
                    // ignore input samples which are out of bound
                    if(ii >= 0 && ii < rows && jj >= 0 && jj < cols){
                        result[i][j] += array[ii][jj] * kernel[m][n];
                    };
                };
            };
        };
    };
    return result;
};