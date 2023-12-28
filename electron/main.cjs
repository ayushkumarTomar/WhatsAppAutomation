const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    clipboard
  } = require('electron');
  const path = require('path');
  const fs = require("fs")

  let mainWindow;


function createWindow() {
    console.log(path.join(__dirname, '..', 'dist', 'index.html'))
    mainWindow = new BrowserWindow({
        title: "AutoChat",
        width: 1000,
        height: 600,
        show: false,
        autoHideMenuBar: true,
        resizable: false,
        icon: path.join(__dirname , "../public/autoChat.png") ,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.cjs'),
        }
    });
    mainWindow.loadURL("http://localhost:5173/")
    mainWindow.webContents.on("did-finish-load", () => mainWindow.show())
    // console.log(store.get("contactsCollection"))
    // newWindow.loadURL(
    //   isDev
    //     ? 'http://localhost:3000/new-component' // Replace with the URL path of your new React component
    //     : `file://${path.join(__dirname, 'build/index.html')}#/new-component` // Add a hash-based route or query parameters to identify the new component
    // );
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
}


app.on('ready', createWindow);
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
      app.quit();
  }
});