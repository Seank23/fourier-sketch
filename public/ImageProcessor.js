
onmessage = (e) => {
    var { imageData, denoiseThreshold } = e.data;
    postMessage(3);
    var imgMatrix = ImageDataToMatrix(ToGrayscale(imageData));
    postMessage(4);
    var denoiseSobel = DenoiseImage(ConvolveSobel(imgMatrix), denoiseThreshold);
    var outputImg = MatrixToImageData(denoiseSobel);
    postMessage(outputImg);
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

    //var outX = convolveSeparable(imgMatrix, [1, 0, -1], [1, 2, 1])
    //var outY = convolveSeparable(imgMatrix, [1, 2, 1], [1, 0, -1])
    var outX = conv_2d([[1,0,-1],[2,0,-2],[1,0,-1]], imgMatrix);
    var outY = conv_2d([[1,2,1],[0,0,0],[-1,-2,-1]], imgMatrix);
    for(let i = 0; i < outX.length; i++) {
        for(let j = 0; j < outX[i].length; j++) {
            outX[i][j] = Math.sqrt(outX[i][j] ** 2 + outY[i][j] ** 2)
        }
    }
    return outX;
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

/*function convolveSeparable(img, kernelVec1, kernelVec2) {
    
    var conv = new Array(img.length);
    for(let i = 0; i < img.length; i++) {
        conv[i] = new Array(img[i].length);
        for(let j = 0; j < img[i].length; j++) {
            var start = j - kernelVec1.length + 1;
            for(let k = 0; k < kernelVec1.length; k++) {
                if(start + k >= 0 && start + k < img[i].length) {
                    if(conv[i][j]) {
                        conv[i][j] += img[i][start + k] * kernelVec1[k];
                    } else {
                        conv[i][j] = img[i][start + k] * kernelVec1[k];
                    }
                }
            }
        }
    }

    for(let i = 0; i < img[0].length; i++) {
        for(let j = 0; j < img.length; j++) {
            start = j - kernelVec2.length + 1;
            for(let k = 0; k < kernelVec2.length; k++) {
                if(start + k >= 0 && start + k < img.length) {
                    if(conv[j][i]) {
                        conv[j][i] += img[start + k][i] * kernelVec1[k];
                    } else {
                        conv[j][i] = img[start + k][i] * kernelVec1[k];
                    }
                }
            }
        }
    }

    return conv;
}*/