import React, { useState, useMemo } from 'react';
import { AppStateCtx, ProgressCtx, SketchPathCtx } from './Contexts'
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
  const [sketchPath, setSketchPath] = useState([]);
  const sketchPathProvider = useMemo(() => ({sketchPath, setSketchPath}), [sketchPath, setSketchPath]);
  const [progress, setProgress] = useState(null);
  const progressProvider = useMemo(() => ({progress, setProgress}), [progress, setProgress]);

  if(cookies.get('imageId') && appState === 0) {
    setAppState(1);
  }

  return (
    <div className="App">
      <Title/>
      <AppStateCtx.Provider value={appStateProvider}>
        <SketchPathCtx.Provider value={sketchPathProvider}>
          <ProgressCtx.Provider value={progressProvider}>
            <ImageUIPanel/>
            { appState === 0 && <UploadImage/> }
            { appState > 0 && <ImageController/> }
          </ProgressCtx.Provider>
        </SketchPathCtx.Provider>
      </AppStateCtx.Provider>
    </div>
  );
}

export default App;
