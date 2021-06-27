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
        let { imageData, sampleInterval, pathDepth } = e.data;
        let sampledPixels = GetSampledPixels(ImageDataToMatrix(imageData), sampleInterval);
        path = GetPath(sampledPixels, sampleInterval, pathDepth);
        postMessage(["output", [path, dimensions]]);
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

    let pixelStrings = PixelsToString(pixels);
    let numPixels = pixelStrings.length;
    let path = [];
    let numSkip = 0;
    let pixelIndex = 0;
    path[0] = pixelStrings[0];

    while(path.length < numPixels - numSkip) {

        if(path.length % 100 === 0) { postMessage(["progress", (path.length / (numPixels - numSkip)) * 100]) }
        let curPixel = pixelStrings[pixelIndex];
        for(let i = sampleInterval; i < (depth + 1) * sampleInterval; i += sampleInterval) {

            let searchPixels = [];
            let pixelVals = curPixel.split(",");
            let pixelX = parseInt(pixelVals[0]);
            let pixelY = parseInt(pixelVals[1]);

            for(let j = -i; j < i + 1; j += sampleInterval) {
                searchPixels.push((pixelX - i) + "," + (pixelY + j));
                searchPixels.push((pixelX + i) + "," + (pixelY + j));
                searchPixels.push((pixelX + j) + "," + (pixelY - i));
                searchPixels.push((pixelX + j) + "," + (pixelY + i));
            }
            var found = false;
            let foundIndex = -1;
            for(let j = 0; j < searchPixels.length; j++) {
                foundIndex = pixelStrings.indexOf(searchPixels[j]);
                if(foundIndex !== -1) {
                        found = true;
                        break;
                }
            }
            if(found) {
                path.push(pixelStrings[foundIndex]);
                pixelStrings.splice(pixelIndex, 1);
                if(foundIndex > pixelIndex) {
                    foundIndex--;
                }
                pixelIndex = foundIndex;
                break;
            }
        }
        if(!found) {
            let [bestIndex, pixelsToRemove] = GetNextPixel(curPixel, pixelStrings, sampleInterval);
            if(bestIndex === -1) { break; }
            path.push(pixelStrings[bestIndex]);
            let indexOffset = 0;
            for(let i = 0; i < pixelsToRemove.length; i++) {
                pixelStrings.splice(pixelsToRemove[i] - i, 1);
                numSkip++;
                if(bestIndex > pixelsToRemove[i]) {
                    indexOffset++;
                }
            }
            bestIndex -= indexOffset;
            pixelStrings.splice(pixelIndex, 1);
            if(bestIndex > pixelIndex) {
                bestIndex--;
            }
            pixelIndex = bestIndex;
        }
    }
    postMessage(["progress", null]);
    return StringToPixels(path);
}

function GetNextPixel(origin, pixels, sampleInterval) {

    let curDistances = GetPixelDistances(origin, pixels);
    let bestIndex = -1;
    let i = 0;
    for(i; i < Math.min(curDistances.length, 50); i++) {
        let nextDistances = GetPixelDistances(pixels[curDistances[i].key], pixels);
        if(nextDistances[0].val < 5 * sampleInterval && nextDistances[Math.min(nextDistances.length - 1, 3)].val < 5 * sampleInterval) {
            bestIndex = curDistances[i].key;
            break;
        }
    }
    let pixelsToRemove = [];
    for(let j = 0; j < i; j++) {
        pixelsToRemove.push(curDistances[j].key);
    }
    return [bestIndex, pixelsToRemove];
}

function GetPixelDistances(origin, pixels) {

    let distances = [];
    let pixelVals = origin.split(",");
    let pixelX = parseInt(pixelVals[0]);
    let pixelY = parseInt(pixelVals[1]);
    for(let i = 0; i < pixels.length; i++) {
        let vals = pixels[i].split(',');
        let distance = Math.sqrt(Math.pow(parseInt(vals[0]) - pixelX, 2) + Math.pow(parseInt(vals[1]) - pixelY, 2));
        if(distance > 0) {
            distances.push({key: i, val: distance});
        }
    }
    return distances.sort((a, b) => a.val - b.val);
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