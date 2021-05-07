import React, { useState, useMemo } from 'react';
import { AppStateCtx } from './Contexts'
import ImageViewer from './comps/ImageViewer';
import Title from './comps/Title';
import Cookies from 'universal-cookie';
import ImageUIPanel from './comps/ImageUIPanel';
import UploadImage from './comps/UploadImage';

const cookies = new Cookies();
setInterval(function() {
  cookies.set('imageId', cookies.get('imageId'), { path: '/', maxAge: 1800 });
}, 300000);

function App() {

  const [appState, setAppState] = useState(0);
  const appStateProvider = useMemo(() => ({appState, setAppState}), [appState, setAppState]);

  if(cookies.get('imageId') && appState === 0) {
    setAppState(1);
  }

  return (
    <div className="App">
      <Title/>
      <AppStateCtx.Provider value={appStateProvider}>
        <ImageUIPanel/>
        { appState === 0 && <UploadImage/> }
        { appState > 0 && <ImageViewer/> }
      </AppStateCtx.Provider>
    </div>
  );
}

export default App;
