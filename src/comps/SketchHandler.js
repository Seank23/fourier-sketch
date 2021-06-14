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

	useEffect(() => {

		if(appState === 0) {
            if(processor) {
                processor.terminate();
                processor = undefined;
                isProcessing.current = false;
            }
        }
		if(appState === 7 && sketchPath[0] && !isProcessing.current) {
			isProcessing.current = true;
			if(processor === undefined) {
                processor = new Worker("./SketchProcessor.js", { type: "module" });
            }
            processor.postMessage({ sketchDFT: sketchPath[0], length: sketchPath[1] });
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
						updateSketchOut(sketchData);
						epicycleData.current.push(...outputData[1][2]);
						let speed = Math.floor(sketchData[0].length / fps.current);
						updateOptions(["sketchSpeed"], [Math.max(speed, 1)]);
						isDrawing.current = true;
                        break;

                    case "complete":
						updateSketchOut(outputData[1][0]);
						epicycleData.current.push(...outputData[1][1]);
						updateOptions(["resLevels", "selectedResLevel"], [outputData[1][2], outputData[1][2] - 1]);
						isProcessing.current = false;
                        setAppState(8);
						isDrawing.current = true;
                        break;
                    default:
                }
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

	const setup = (p5, canvasParentRef) => {
		p5.createCanvas(width, height).parent(canvasParentRef);
	};

	const drawEpicycles = (p5, epicycles) => {

		let limit = Math.pow(2, sketchOptions['selectedResLevel'] + 1);
		if(appState === 7) { limit = Math.pow(2, sketches.current.length + 1); }
		for (let i = 0; i < epicycles.length - 1; i++) {
			if(epicycles[i].depth < limit) {
				let x1 = (epicycles[i].x * scale.current) + offset.current[0];
				let x2 = (epicycles[i + 1].x * scale.current) + offset.current[0];
				let y1 = (epicycles[i].y * scale.current) + offset.current[1];
				let y2 = (epicycles[i + 1].y * scale.current) + offset.current[1];
				p5.stroke('rgba(91,154,248,0.5)');
				p5.noFill();
				if(i > 0) { p5.ellipse(x1, y1, (epicycles[i].amp * 2)); }
				p5.stroke('rgba(0,0,0,0.5)');
				p5.line(x1, y1, x2, y2);
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
						drawEpicycles(p5, epicycleData.current[time]);
						p5.beginShape();
						p5.stroke(0);
						p5.noFill();
						for (let i = 0; i < time; i++) {
							p5.vertex((selectedSketch.current[i][0] * scale.current) + offset.current[0], (selectedSketch.current[i][1] * scale.current) + offset.current[1]);
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