/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext } from 'react';
import { AppStateCtx, SketchOptionsCtx, SketchPathCtx } from '../Contexts';
import { Card, Button } from 'react-bootstrap';
import { GiHamburgerMenu } from 'react-icons/gi';
import { saveAs } from 'file-saver';

const DropdownMenu = () => {

    const { appState } = useContext(AppStateCtx);
    const { sketchOptions, setSketchOptions } = useContext(SketchOptionsCtx);
    const { sketchPath } = useContext(SketchPathCtx);
    const [open, setOpen] = useState(false);
    var [saveValsSuccess, setSaveValsSuccess] = useState(false);
    var [saveImageSuccess, setSaveImageSuccess] = useState(false);

    const epicyclesChange = () => {
        let options = Object.assign({}, sketchOptions);
        if(sketchOptions["showEpicycles"] === 0) { options['showEpicycles'] = 1; }
        if(sketchOptions["showEpicycles"] === 1) { options['showEpicycles'] = 0; }
        setSketchOptions(options);
    }

    const saveSketchVals = () => {

        let data = "";
        for(let i = 0; i < sketchPath[0][0].length; i++) {
            data += parseFloat(sketchPath[0][0][i].re).toFixed(4) + ',';
            data += parseFloat(sketchPath[0][0][i].im).toFixed(4) + ',';
            data += parseFloat(sketchPath[0][1][i].re).toFixed(4) + ',';
            data += parseFloat(sketchPath[0][1][i].im).toFixed(4) + ',';
        }
        saveAs(new Blob([data], {type: "text/csv"}), "sketch.csv");
        setSaveValsSuccess(true);
        setTimeout(() => { setSaveValsSuccess(false); }, 1000);
    }

    const saveSketchImage = () => {

        if(sketchOptions["showEpicycles"] === 1) { epicyclesChange(); }
        setTimeout(() => {
            var canvas = document.getElementsByClassName("p5Canvas")[0];
            canvas.toBlob(function(blob) {
                saveAs(blob, "sketch.png");
            });
        }, 200);
        setSaveImageSuccess(true);
        setTimeout(() => { setSaveImageSuccess(false); }, 1000);
    }

    return (
        <div className="dropdownIcon">
            <a href="#" className={appState < 7 ? "disabled" : ""} onClick={() => setOpen(!open)}><GiHamburgerMenu/></a>
            { appState >= 7 && open &&
                <Card body className="dropdownContainer shadow">
                    <Button variant={sketchOptions["showEpicycles"] ? "secondary" : "outline-secondary"} size="sm" className="dropdownItem" onClick={epicyclesChange}>
                        {sketchOptions["showEpicycles"] ? "Hide Epicycles" : "Show Epicycles"}</Button>
                    <Button variant={saveValsSuccess ? "success" : "outline-secondary"} size="sm" className="dropdownItem" onClick={saveSketchVals} disabled={appState === 8 ? false : true}>Save Sketch (.csv)</Button>
                    <Button variant={saveImageSuccess ? "success" : "outline-secondary"} size="sm" className="dropdownItem" onClick={saveSketchImage} disabled={appState === 8 ? false : true}>Save Sketch Image</Button>
                </Card>
            }
        </div>
    );
}

export default DropdownMenu;