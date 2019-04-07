const {app, BrowserWindow} = require('electron')
var path = require("path");
import Api from './Api';
const htmSrcFolder = "./src/htm";
const pySrcFolder  = "./src/py";
//uncomment to disable logging
//console.log = ()=>{}

//py

let pyProc = null
let isPyProcStarted = false

const createPyProc = () => {
  // var options = {
  //   stdio: 'pipe' //feed all child process logging into parent process
  // };

  let script = path.join(pySrcFolder, 'server.py');
  pyProc = require('child_process').spawn('pipenv', ['run','python','-u',script])
  if (pyProc != null) {
    //document.body.style.pointerEvents = "none";
    console.log('child process success')

    pyProc.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      if(!isPyProcStarted && `${data}`.indexOf("started")!=-1){
        isPyProcStarted = true;
        console.log("Loading api interface");
        setTimeout(()=>{
          Api.loadInterface(onApiInterfaceLoaded);
        },500);
      }
    });
    
    pyProc.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    
    pyProc.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  }
}

const onApiInterfaceLoaded=()=>{
  console.log("Interface Loaded");

 // document.body.style.pointerEvents = "auto";
  Api.get().hello("Node").then((resp)=>{
    console.log("Success in API call hello");
  })
  .catch((e)=>{
    console.log(e);
  });
}

const exitPyProc = () => {
  pyProc.kill()
}

app.on('ready', createPyProc)
app.on('will-quit', exitPyProc)

//electron
function createWindow () {
    var window = new BrowserWindow({width: 800, height: 600})
    window.loadFile(htmSrcFolder+ '/index.html')
}

app.on('ready', createWindow)
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

