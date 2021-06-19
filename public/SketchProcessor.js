onmessage = (e) => {
    let { sketchDFT, length, epicycleSkip } = e.data;
    CalculateSketchPath(sketchDFT, length, epicycleSkip);
}

function CalculateSketchPath(pathDFT, sketchLength, epicycleSkip) {
    
    let Xx = pathDFT[0];
    let Xy = pathDFT[1];
    let time = 0;
    let epicycleData = [];
    let epicycleIndex = 0;

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
    
    for(let i = 0; i < sketchLength; i++) {
        if(Date.now() - prevTime >= 1000) {
            postMessage(["progress", [(i / sketchLength) * 100, sketchPath, epicycleData]]);
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
                sketchPath[index].push([Math.fround(coords[0]), Math.fround(coords[1])]);
            }
            if(i % epicycleSkip === 0) {
                if(j < 10 || (j < 50 && j % 2 === 0) || (j < 4000 && j % 50 === 0) || j % 250 === 0) {
                    epicycleData[epicycleIndex].push({depth: j, x: Math.fround(coords[0]), y: Math.fround(coords[1]), amp: Math.fround(Xx[j].amp)});
                }
            }

            coords[0] += Xx[j].amp * Math.cos(Xx[j].freq * time + Xx[j].phase);
			coords[1] += Xy[j].amp * Math.sin(Xy[j].freq * time + Xy[j].phase + Math.PI/2);
        }
        sketchPath[N - 1].push([Math.fround(coords[0]), Math.fround(coords[1])]);
        time += 2*Math.PI / Xx.length;
        if(i % epicycleSkip === 0) { epicycleIndex++; }
    }
    postMessage(["complete", [sketchPath, epicycleData, N]]);
}