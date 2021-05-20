import React, { useContext, useEffect, useRef } from "react";
import Sketch from "react-p5";
import { SketchPathCtx } from '../Contexts';
    
const SketchHandler = ({width, height}) => {

	const { sketchPath } = useContext(SketchPathCtx);

	const paddingX = 50;
	const paddingY = 50;
	let scale = useRef(1);
	let offset = useRef([0, 0]);
	let sketchOut = useRef([]);
	let time = 0;
	let sketchSpeed = 50;
	let isDrawing = useRef(false);

	useEffect(() => {
		sketchOut.current = sketchPath[0];
		var imgDims = sketchPath[1];
		if(imgDims) {
			if(imgDims[0] > imgDims[1]) {
				scale.current = (width - 2*paddingX) / imgDims[0];
			} else {
				scale.current = (height - 2*paddingY) / imgDims[1];
			}
			offset.current[0] = -sketchOut.current[sketchOut.current.length - 1][0] + paddingX + (((width - 2*paddingX) - imgDims[0]*scale.current) / 2);
			offset.current[1] = -sketchOut.current[sketchOut.current.length - 1][1] + paddingY + (((height - 2*paddingY) - imgDims[1]*scale.current) / 2);
			isDrawing.current = true;
		}
	}, [height, sketchPath, width]);

	const setup = (p5, canvasParentRef) => {
		p5.createCanvas(width, height).parent(canvasParentRef);
	};

	const drawEpicycles = (p5, curCoords, X) => {

		for (let i = 0; i < X.length; i++) {
			let prevCoords = [curCoords[0], curCoords[1]];
			p5.stroke(255, 100);
			p5.noFill();
			p5.ellipse(prevCoords[0], prevCoords[1], X[i].amp * 2);
			p5.stroke(255);
			p5.line(prevCoords[0], prevCoords[1], curCoords[0], curCoords[1]);
		}
		return curCoords;
	}

	const draw = (p5) => {

		if(isDrawing.current) {

			p5.background(255);
			if(sketchOut.current.length > 0) {
				
				p5.stroke(0, 100);
				p5.line(0, (sketchOut.current[time][1] * scale.current) + offset.current[1], 
					(sketchOut.current[time][0] * scale.current) + offset.current[0], (sketchOut.current[time][1] * scale.current) + offset.current[1]);
				p5.line((sketchOut.current[time][0] * scale.current) + offset.current[0], 0, 
					(sketchOut.current[time][0] * scale.current) + offset.current[0], (sketchOut.current[time][1] * scale.current) + offset.current[1]);
				p5.stroke(0);
				p5.beginShape();
				p5.noFill();
				for (let i = 0; i < time; i++) {
					p5.vertex((sketchOut.current[i][0] * scale.current) + offset.current[0], (sketchOut.current[i][1] * scale.current) + offset.current[1]);
				}
				p5.endShape();
				time += sketchSpeed;
				if(time >= sketchOut.current.length - 1) {
					isDrawing.current = false;
				}
			}
		}
	};

	return <Sketch setup={setup} draw={draw} />;
}

export default SketchHandler;