import React, { useContext, useEffect, useRef, useState } from "react";
import Sketch from "react-p5";
import { AppStateCtx, ProgressCtx, SketchOptionsCtx, SketchPathCtx } from '../Contexts';
    
var processor = new Worker("./SketchProcessor.js", { type: "module" });

const SketchHandler = ({width, height}) => {

	const { sketchPath } = useContext(SketchPathCtx);
	const { setProgress } = useContext(ProgressCtx);
	const { appState, setAppState } = useContext(AppStateCtx);
	const { sketchOptions, setSketchOptions } = useContext(SketchOptionsCtx);

	const paddingX = 0;
	const paddingY = 0;
	const scale = useRef(1);
	const offset = useRef([0, 0]);
	const sketches = useRef([]);
	const isDrawing = useRef(false);
	const [time, setTime] = useState(0);
	const isProcessing = useRef(false);
	const fps = useRef(60);
	const selectedSketch = useRef([]);
	const epicycleData = useRef([]);
	const epicycleSkip = 10;

	useEffect(() => {

		if(appState === 7 && sketchPath[0] && !isProcessing.current) {
			isProcessing.current = true;
			if(processor === undefined) {
                processor = new Worker("./SketchProcessor.js", { type: "module" });
            }
            processor.postMessage({ sketchDFT: sketchPath[0], length: sketchPath[1], epicycleSkip: epicycleSkip });
            processor.onmessage = (e) => {

                var outputData = e.data;
                switch(outputData[0]) {

					case "resolutions":
						sketches.current = new Array(outputData[1]);
						for(let i = 0; i < outputData[1]; i++) {
							sketches.current[i] = [];
						}
						selectedSketch.current = sketches.current[outputData[1] - 1];
						break;

                    case "progress":
                        setProgress(outputData[1][0]);
						let sketchData = outputData[1][1];
						let speed = Math.ceil(sketchData[0].length / fps.current);
						updateOptions(["sketchSpeed"], [Math.max(speed, 1)]);
						updateSketchOut(sketchData);
						epicycleData.current.push(...outputData[1][2]);
						epicycleData.current = removeEmptyChildren(epicycleData.current);
						isDrawing.current = true;
                        break;

                    case "complete":
						updateSketchOut(outputData[1][0]);
						epicycleData.current.push(...outputData[1][1]);
						epicycleData.current = removeEmptyChildren(epicycleData.current);
						updateOptions(["resLevels", "selectedResLevel"], [outputData[1][2], outputData[1][2] - 1]);
						isProcessing.current = false;
                        setAppState(8);
						isDrawing.current = true;
						processor.terminate();
						processor = undefined;
                        break;
                    default:
                }
				console.log("Data: " + memorySizeOf(outputData), "Sketches: " + memorySizeOf(sketches), "Epicycles: " + memorySizeOf(epicycleData));
            };
		}
		var imgDims = sketchPath[2];
		if(imgDims) {
			scale.current = (width - 2*paddingX) / imgDims[0];
			if(scale.current * imgDims[1] > (height - 2*paddingY)) {
				scale.current = (height - 2*paddingY) / imgDims[1];
			}
			offset.current[0] = paddingX + (((width - 2*paddingX) - imgDims[0]*scale.current) / 2);
			offset.current[1] = paddingY + (((height - 2*paddingY) - imgDims[1]*scale.current) / 2);
		}

	}, [appState, sketchPath]);

	useEffect(() => {
		if(sketchOptions['restartDrawing'] === 1) {
			setTime(0);
			isDrawing.current = true;
			updateOptions(['restartDrawing'], [0]);
		}
	}, [sketchOptions['restartDrawing']]);

	useEffect(() => {
		if(appState === 8 && sketchOptions['selectedResLevel'] >= 0 && sketchOptions['selectedResLevel'] < sketchOptions['resLevels']) {
			selectedSketch.current = sketches.current[sketchOptions["selectedResLevel"]];
			setTime(0);
			isDrawing.current = true;
		}
	}, [sketchOptions['selectedResLevel']]);

	useEffect(() => {
		if(appState === 8) {
			setTime(time - sketchOptions['sketchSpeed']);
			isDrawing.current = true;
		}
	}, [sketchOptions['showEpicycles']])

	const updateOptions = (keys, vals) => {
        let options = Object.assign({}, sketchOptions);
		for(let i = 0; i < keys.length; i++) {
			options[keys[i]] = parseInt(vals[i]);
		}
        setSketchOptions(options);
    }

	const updateSketchOut = (sketchData) => {
		for(let i = 0; i < sketchData.length; i++) {
			sketches.current[i].push(...sketchData[i]);		
		}
	}

	const linearInterpolate = (val1, val2, interpFactor, max) => {
		return ((max - interpFactor) * val1 + interpFactor * val2) / max;
	}

	const setup = (p5, canvasParentRef) => {
		p5.createCanvas(width, height).parent(canvasParentRef);
	};

	const drawEpicycles = (p5, epicycles, epicyclesNext, interpFactor) => {

		let limit = Math.pow(2, sketchOptions['selectedResLevel'] + 1);
		if(appState === 7) { limit = Math.pow(2, sketches.current.length + 1); }
		
		if(epicycles !== undefined && epicyclesNext !== undefined) {
			for (let i = 0; i < epicycles.length - 1; i++) {
				if(epicycles[i] !== undefined && epicyclesNext[i] !== undefined) {
					if(epicycles[i].depth < limit) {
						let x1 = Math.fround((linearInterpolate(epicycles[i].x, epicyclesNext[i].x, interpFactor, epicycleSkip) * scale.current) + offset.current[0]);
						let x2 = Math.fround((linearInterpolate(epicycles[i + 1].x, epicyclesNext[i + 1].x, interpFactor, epicycleSkip)* scale.current) + offset.current[0]);
						let y1 = Math.fround((linearInterpolate(epicycles[i].y, epicyclesNext[i].y, interpFactor, epicycleSkip) * scale.current) + offset.current[1]);
						let y2 = Math.fround((linearInterpolate(epicycles[i + 1].y, epicyclesNext[i + 1].y, interpFactor, epicycleSkip) * scale.current) + offset.current[1]);
						p5.stroke('rgba(91,154,248,0.5)');
						p5.noFill();
						if(i > 0) { p5.ellipse(x1, y1, (epicycles[i].amp * 2)); }
						p5.stroke('rgba(0,0,0,0.5)');
						p5.line(x1, y1, x2, y2);
					}
				}
			}
		}
	}

	const draw = (p5) => {

		if(isDrawing.current) {
			fps.current = p5.frameRate();
			p5.background(255);
			if(selectedSketch.current) {
				if(selectedSketch.current[time] !== undefined) {
					if(selectedSketch.current[time].length === 2) {
						if(sketchOptions["showEpicycles"] && Math.floor(time / epicycleSkip) + 1 < epicycleData.current.length) {
							drawEpicycles(p5, epicycleData.current[Math.floor(time / epicycleSkip)], epicycleData.current[Math.floor(time / epicycleSkip) + 1], time % epicycleSkip);
						}
						p5.beginShape();
						p5.stroke(0);
						p5.noFill();
						for (let i = 0; i < time; i++) {
							p5.vertex(Math.fround((selectedSketch.current[i][0] * scale.current) + offset.current[0]), Math.fround((selectedSketch.current[i][1] * scale.current) + offset.current[1]));
						}
						p5.endShape();
						setTime(time + sketchOptions['sketchSpeed']);
						if(time + sketchOptions['sketchSpeed'] >= selectedSketch.current.length - 1) {
							isDrawing.current = false;
						}
					}
				}
			}
		}
	};

	return <Sketch setup={setup} draw={draw} />;
}

export default SketchHandler;

function removeEmptyChildren(arr) {
	let i = 0;
	while (i < arr.length) {
	  if (arr[i].length === 0) {
		arr.splice(i, 1);
	  } else {
		i++;
	  }
	}
	return arr;
  }

function memorySizeOf(obj) {
    var bytes = 0;

    function sizeOf(obj) {
        if(obj !== null && obj !== undefined) {
            switch(typeof obj) {
            case 'number':
                bytes += 8;
                break;
            case 'string':
                bytes += obj.length * 2;
                break;
            case 'boolean':
                bytes += 4;
                break;
            case 'object':
                var objClass = Object.prototype.toString.call(obj).slice(8, -1);
                if(objClass === 'Object' || objClass === 'Array') {
                    for(var key in obj) {
                        if(!obj.hasOwnProperty(key)) continue;
                        sizeOf(obj[key]);
                    }
                } else bytes += obj.toString().length * 2;
                break;
            }
        }
        return bytes;
    };

    function formatByteSize(bytes) {
        if(bytes < 1024) return bytes + " bytes";
        else if(bytes < 1048576) return(bytes / 1024).toFixed(3) + " KiB";
        else if(bytes < 1073741824) return(bytes / 1048576).toFixed(3) + " MiB";
        else return(bytes / 1073741824).toFixed(3) + " GiB";
    };

    return formatByteSize(sizeOf(obj));
};