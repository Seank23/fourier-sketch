import React, { useState, useMemo } from 'react';
import { AppStateCtx } from './Contexts'
import ImageViewer from './comps/ImageViewer';
import Title from './comps/Title';
import Cookies from 'universal-cookie';
import ImageUIPanel from './comps/ImageUIPanel';

const cookies = new Cookies();
setInterval(function() {
  cookies.set('imageId', cookies.get('imageId'), { path: '/', maxAge: 1800 });
}, 300000);

function App() {

  const [appState, setAppState] = useState(0);
  const appStateProvider = useMemo(() => ({appState, setAppState}), [appState, setAppState]);

  return (
    <div className="App">
      <Title/>
      <AppStateCtx.Provider value={appStateProvider}>
        <ImageUIPanel/>
        <ImageViewer/>
      </AppStateCtx.Provider>
    </div>
  );
}

export default App;
