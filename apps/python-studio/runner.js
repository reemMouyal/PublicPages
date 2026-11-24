importScripts('runtime/pyodide.js');
let loaded;
self.onmessage = async ({data}) => {
  let scope;
  try {
    loaded ??= loadPyodide({indexURL:new URL('runtime/',self.location.href).href});
    const py = await loaded;
    scope = py.toPy({});
    scope.set('__name__','__main__');
    py.setStdout({batched:s=>postMessage({line:s})});
    py.setStderr({batched:s=>postMessage({line:s})});
    await py.runPythonAsync(data.code,{globals:scope});
    let count=0;
    for(const test of data.tests){
      await py.runPythonAsync(test,{globals:scope});
      postMessage({passed:++count});
    }
    postMessage({ok:true});
  } catch(e){postMessage({error:String(e.message||e)});}
  finally{scope?.destroy();}
};
