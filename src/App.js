import React, { useState, useMemo, useEffect } from 'react';
import { AppStateCtx, ImageURLCtx, ProgressCtx, SketchOptionsCtx, SketchPathCtx } from './Contexts'
import Title from './comps/Title';
import Cookies from 'universal-cookie';
import ImageUIPanel from './comps/ImageUIPanel';
import UploadImage from './comps/UploadImage';
import ImageController from './comps/ImageController';


const cookies = new Cookies();
setInterval(function() {
  cookies.set('imageId', cookies.get('imageId'), { path: '/', maxAge: 1800 });
}, 300000);

function App() {

  const [appState, setAppState] = useState(0);
  const appStateProvider = useMemo(() => ({appState, setAppState}), [appState, setAppState]);
  const [imageURL, setImageURL] = useState(null);
  const imageURLProvider = useMemo(() => ({imageURL, setImageURL}), [imageURL, setImageURL]);
  const [sketchPath, setSketchPath] = useState([]);
  const sketchPathProvider = useMemo(() => ({sketchPath, setSketchPath}), [sketchPath, setSketchPath]);
  const [progress, setProgress] = useState(null);
  const progressProvider = useMemo(() => ({progress, setProgress}), [progress, setProgress]);
  const [sketchOptions, setSketchOptions] = useState({ denoiseThreshold: 100, sampleInterval: 2, pathDepth: 40, selectedResLevel: 0, resLevels: 1, sketchSpeed: 50, restartDrawing: 0, showEpicycles: 1 });
  const sketchOptionsProvider = useMemo(() => ({sketchOptions, setSketchOptions}), [sketchOptions, setSketchOptions]);

  if(cookies.get('imageId') && appState === 0) {
    setAppState(1);
  }

  useEffect(() => {
    if(appState === 0) {
      setSketchOptions({ denoiseThreshold: 100, qualitySetting: 3, pathDepth: 40, selectedResLevel: 0, resLevels: 1, sketchSpeed: 50, restartDrawing: 0, showEpicycles: 1 });
    }
  }, [appState])

  return (
    <div className="App">
      <Title/>
      <AppStateCtx.Provider value={appStateProvider}>
        <ImageURLCtx.Provider value={imageURLProvider}>
          <SketchPathCtx.Provider value={sketchPathProvider}>
            <ProgressCtx.Provider value={progressProvider}>
              <SketchOptionsCtx.Provider value={sketchOptionsProvider}>

                <ImageUIPanel/>
                { appState === 0 && <UploadImage/> }
                <ImageController/>

              </SketchOptionsCtx.Provider>
            </ProgressCtx.Provider>
          </SketchPathCtx.Provider>
        </ImageURLCtx.Provider>
      </AppStateCtx.Provider>
    </div>
  );
}

export default App;
