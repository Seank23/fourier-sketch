onmessage = (e) => {
    let { sketchDFT, length, epicycleSkip, sketchInterp } = e.data;
    CalculateSketchPath(sketchDFT, length, epicycleSkip, sketchInterp);
}

function CalculateSketchPath(pathDFT, sketchLength, epicycleSkip, sketchInterp) {
    
    const filterVals = [1, 0.1, 0.025];
    let Xx = pathDFT[0];
    let Xy = pathDFT[1];
    let time = 0;
    let epicycleData = [];
    let epicycleIndex = 0;
    let delta = 2*Math.PI / Xx.length;

    let N = Math.log2(Xx.length) - 1;
    let resolutions = [];
    for(let i = 1; i < N; i++) {
        resolutions.push(Math.pow(2, i));
    }

    let sketchPath = new Array(N);
    for(let i = 0; i < N; i++) {
        sketchPath[i] = [];
    }
    postMessage(["resolutions", N]);
    let prevTime = Date.now();
    
    for(let i = 0; i < sketchLength / sketchInterp; i++) {
        if(Date.now() - prevTime >= 1000) {
            postMessage(["progress", [(i / (sketchLength / sketchInterp)) * 100, sketchPath, epicycleData]]);
            prevTime = Date.now();
            for(let i = 0; i < N; i++) {
                sketchPath[i].length = 0;
            }
            epicycleData.length = 0;
            epicycleIndex = 0;
        }
        let coords = [0, 0];
        epicycleData[epicycleIndex] = [];

        for(let j = 0; j < Xx.length; j++) {

            if(resolutions.includes(j)) {
                let index = Math.log2(j) - 1;
                let filterX = coords[0];
                let filterY = coords[1];
                if(sketchPath[index].length > 2) {
                    filterX = filter([coords[0], sketchPath[index][sketchPath[index].length - 1][0], sketchPath[index][sketchPath[index].length - 2][0]], filterVals);
                    filterY = filter([coords[1], sketchPath[index][sketchPath[index].length - 1][1], sketchPath[index][sketchPath[index].length - 2][1]], filterVals);
                }
                sketchPath[index].push([Math.fround(filterX), Math.fround(filterY)]);
            }
            if(i % epicycleSkip === 0) {
                if(j < 10 || (j < 50 && j % 2 === 0) || (j < 4000 && j % 50 === 0) || j % 250 === 0) {
                    epicycleData[epicycleIndex].push({depth: j, x: Math.fround(coords[0]), y: Math.fround(coords[1]), amp: Math.fround(Xx[j].amp)});
                }
            }

            coords[0] += Xx[j].amp * Math.cos(Xx[j].freq * time + Xx[j].phase);
			coords[1] += Xy[j].amp * Math.sin(Xy[j].freq * time + Xy[j].phase + Math.PI/2);
        }

        if(sketchPath[N - 1].length > 2) {
            coords[0] = filter([coords[0], sketchPath[N - 1][sketchPath[N - 1].length - 1][0], sketchPath[N - 1][sketchPath[N - 1].length - 2][0]], filterVals);
            coords[1] = filter([coords[1], sketchPath[N - 1][sketchPath[N - 1].length - 1][1], sketchPath[N - 1][sketchPath[N - 1].length - 2][1]], filterVals);
        }
        sketchPath[N - 1].push([Math.fround(coords[0]), Math.fround(coords[1])]);
        
        time += delta * sketchInterp;
        if(i % epicycleSkip === 0) { epicycleIndex++; }
    }
    postMessage(["complete", [sketchPath, epicycleData, N]]);
}

function filter(inputVals, filterVals) {
    let out = 0;
    for(let i = 0; i < inputVals.length; i++) {
        out += inputVals[i] * filterVals[i];
    }
    return out / filterVals.reduce((a, b) => a + b);
}