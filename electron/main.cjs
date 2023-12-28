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

ipcMain.on("close-phone-window", () => {
    try {
        console.log("Received phone deletiion")
        modalWindow.close()
        modalWindow = null
    } catch (error) {
        console.log(error)
    }
  })
  ipcMain.on("copy-this", (event, param) => {
    clipboard.writeText(param)
  })
  ipcMain.on("content-update", () => {
    console.log("recieved content-update ")
    mainWindow.webContents.send("content-updated")
  })


const createPhonWindow = (file, type, numbersList) => {
    console.log("Received phone creation");
    modalWindow = new BrowserWindow({
        width: 600,
        height: 600,
        parent: mainWindow,
        modal: true,
        resizable: false,
        show: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });
    console.log(`http://localhost:5173/#/upload/${type}`)
    modalWindow.loadURL(`http://localhost:5173/#/upload/${type}`);
    modalWindow.once('ready-to-show', () => {
        modalWindow.show();
        if (numbersList) {
            console.log(" i am sending ", numbersList)
            modalWindow.webContents.send("phone-file-selected", file.filePaths[0], numbersList);
        } else {
            console.log("sending image", file.filePaths[0])
            modalWindow.webContents.send("image-file-selected", file.filePaths[0])
        }
    });
    modalWindow.on('closed', () => {
        modalWindow = null;
    });
  };

ipcMain.on('open-image-file', async (event, arg) => {
    const file = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{
                name: "JPG Images",
                extensions: ["jpg"],
            },
            {
                name: 'PNG Images',
                extensions: ['png'],
            },
            {
                name: 'JPEG Images',
                extensions: ['jpeg'],
            },
        ],
    });
    if (!file.canceled) {
        createPhonWindow(file, 'image');
    }
  });


ipcMain.on('open-phone-file', async (event, arg) => {
    const file = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{
                name: "Text Files",
                extensions: ["txt"],
            },
            {
                name: 'CSV Files',
                extensions: ['csv'],
            },
        ],
    });
    if (!file.canceled) {
        const numbersList = await parseFile(file.filePaths[0]);
        console.log('Phone numbers in the file:', numbersList);
        createPhonWindow(file, 'numbers', numbersList);
    }
  });
  