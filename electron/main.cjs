const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    clipboard
  } = require('electron');
  const path = require('path');
  const fs = require("fs")
  const Store = require('electron-store');
  const {
    parseFile,
    checkPhoneNumber
  } = require("./parsePhoneNumbers.cjs")
  const store = new Store({
    name: 'settings'
  });
  const {
    Client,
    LocalAuth,
    MessageMedia
  } = require('whatsapp-web.js');
  const schedule = require('node-schedule');
  const activeStateStore = new Store({
    name: "activeStore"
  })
  activeStateStore.clear()
  const qrcode = require('qrcode-terminal');
  isDev = true
  const {
    OpenAI
  } = require("openai")
  const jobStore = new Store({
    name: "jobStore"
  })
  jobStore.set("currentJobs", [])
  
  console.log(store.get("contactsCollection"))
  if (!store.get("client")) store.set("client", "Default")
  if (!store.get("clientList")) store.set("clientList", ["Default"])
  if (!store.get("headless")) store.set("headless", "False")
  let mainWindow;
  let autoPrompt = false;
  let promptClient;
  let groupWindow;
  let phoneControlData = {
    phoneNumbers: [],
    message: "",
    step: 0
  }
  let modalWindow;
  let editorWindow;
  
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

      /*
      
Use this for each window for development
      
     newWindow.loadURL(
       isDev
        ? 'http://localhost:3000/new-component' // Replace with the URL path of your new React component
         : `file://${path.join(__dirname, 'build/index.html')}#/new-component` // Add a hash-based route or query parameters to identify the new component
    );

    */


    mainWindow.on('closed', function() {
        mainWindow = null;
    });
  }
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
  ipcMain.on("send-content-update", () => {
    console.log("sendin content update")
    mainWindow.webContents.send("content-updated")
  })
  ipcMain.on("open-editor-window", (event, type) => {
    console.log(type)
    console.log("recieved window editor")
    let response = "success"
    editorWindow = new BrowserWindow({
        width: 600,
        height: 500,
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
    editorWindow.loadURL(`http://localhost:5173/#/edit/${type}`);
    console.log(`http://localhost:5173/#/edit/${type}`)
    editorWindow.once('ready-to-show', () => {
        editorWindow.show()
    })
    editorWindow.on('closed', () => {
        editorWindow = null;
    })
  })
  ipcMain.on("close-auto-prompt", () => {
    if (autoPrompt) {
        promptClient.destroy()
        dialog.showMessageBox({
            type: 'warning',
            title: 'Error',
            message: "Closed Auto listening ...",
            buttons: ['OK'],
        });
    } else {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Error',
            message: "Auto Listening is already off ...",
            buttons: ['OK'],
        });
    }
  })
  ipcMain.on("start-auto-prompt", () => {
    const promptList = store.get("promptList")
    promptClient = new Client({
        authStrategy: new LocalAuth({
            clientId: store.get("client")
        }),
        puppeteer: {
            headless: store.get("headless") == "True" ? true : false
        }
    });
    console.log("started client")
    promptClient.on("qr", qr => {
        autoPrompt = false
        dialog.showMessageBox({
            type: 'warning',
            title: 'Error',
            message: "Login expired",
            buttons: ['OK'],
        });
    })
    promptClient.on('ready', () => {
        autoPrompt = true
    })
    promptClient.on("message", (message) => {
        const access = checkPhoneNumber(store.get("access"))
        const msg = message.body
        console.log(msg.startsWith("!send"))
        console.log(message.from == access + "@c.us")
        console.log(message.from)
        const foundPrompt = promptList.find((promptObj) => promptObj.prompt === msg);
        if (foundPrompt) {
            const response = foundPrompt.response;
            message.reply(response)
        }
        if (msg.startsWith("!send")) {
            console.log(message.from)
            console.log(store.get("access"))
            if (message.from == access + "@c.us") {
                message.reply("Send me the phoneNumbersList !phone <phoneNumbers>")
                phoneControlData.step = 1
            }
        }
        if (msg.startsWith("!phone")) {
            if (phoneControlData.step == 1) {
                phoneControlData.phoneNumbers = msg.replace("!phone", "").split(" ")
                const parsedNumbers = []
                phoneControlData.phoneNumbers.forEach((val) => {
                    const isValid = checkPhoneNumber(val)
                    if (isValid) parsedNumbers.push(isValid)
                })
                phoneControlData.step = 2
                phoneControlData.phoneNumbers = parsedNumbers
                message.reply("Send me the message !message")
            }
        }
        if (msg.startsWith("!message")) {
            if (phoneControlData.step == 2) {
                phoneControlData.message = msg.replace("!message", "")
                phoneControlData.step = 2
                message.reply("Sending Message")
                phoneControlData.step = 0
                async function sendToNumbers() {
                    for (const number of phoneControlData.phoneNumbers) {
                        const isRegistered = await promptClient.isRegisteredUser(`${number}@c.us`)
                        if (isRegistered) {
                            await promptClient.sendMessage(`${number}@c.us`, phoneControlData.message)
                        }
                    }
                }
                sendToNumbers()
            }
        }
    })
    promptClient.initialize()
  })
  ipcMain.on("alert", (event, message) => {
    dialog.showMessageBox({
        type: 'warning',
        title: 'Error',
        message: message,
        buttons: ['OK'],
    });
  })
  ipcMain.on("close-editor-window", () => {
    try {
        console.log("Received group deletiion")
        editorWindow.close()
        editorWindow = null
        mainWindow.webContents.send("content-updated")
    } catch (error) {
        console.log(error)
    }
  })
  ipcMain.on("open-group-page", async () => {
    if (autoPrompt) {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Error',
            message: "Closed auto prompt",
            buttons: ['OK'],
        });
        try {
            await promptClient.destroy()
            autoPrompt = false
        } catch (error) {
            console.log(error)
        }
    }
    let response = "success"
    groupWindow = new BrowserWindow({
        width: 600,
        height: 500,
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
    groupWindow.loadURL(`http://localhost:5173/#/groups`);
    groupWindow.once('ready-to-show', () => {
        groupWindow.show()
    })
    groupWindow.on('closed', () => {
        groupWindow = null;
    })
    try {
        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: store.get("client")
            }),
            puppeteer: {
                headless: store.get("headless") == "True" ? true : false
            }
        });
        // client.on('qr', (qr) => {
        //   console.log("sending qr code ")
        //   console.logqrcode.generate(qr, {small: true});
        //   groupWindow.webContents.send("qr" , qr)
        // })
        client.on('qr', qr => {
            qrcode.generate(qr, {
                small: true
            });
            groupWindow.webContents.send("qr", qr)
            client.destroy()
        });
        client.on('ready', async () => {
            console.log('Client is ready!');
            groupWindow.webContents.send("client-ready")
            const chatList = await client.getChats()
            console.log(chatList.length)
            const groups = chatList.filter((chat) => chat.isGroup)
            // console.log(groups[1])
            const groupMainInfo = [];
            groups.forEach((element) => {
                groupMainInfo.push({
                    name: element.name,
                    id: element.id._serialized
                });
            });
            groupWindow.webContents.send("groups-list", groupMainInfo)
            try {
                await client.destroy()
            } catch (error) {
                console.log(error)
            }
        });
        client.initialize()
    } catch (error) {
        const options = {
            type: 'error',
            buttons: ['OK'],
            title: 'Error',
            message: 'An error occurred!',
        };
        dialog.showMessageBox(groupWindow, options);
        groupWindow.close()
        console.log(error)
    }
  })
  ipcMain.on("close-group-window", () => {
    try {
        console.log("Received group deletiion")
        groupWindow.close()
        groupWindow = null
        mainWindow.webContents.send("content-updated")
    } catch (error) {
        console.log(error)
    }
  })
  app.on('ready', createWindow);
  app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
  });
  app.on('activate', function() {
    if (mainWindow === null) {
        createWindow();
    }
  });
  ipcMain.on("open-login", () => {
    if (autoPrompt) {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Error',
            message: "Closed auto prompt",
            buttons: ['OK'],
        });
        try {
            promptClient.destroy()
            autoPrompt = false;
        } catch (error) {
            console.log(error)
        }
    }
    try {
        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: store.get("client")
            }),
            puppeteer: {
                headless: false
            }
        })
        client.initialize()
        client.on('ready', async () => {
            await client.destroy()
        })
    } catch (error) {
        const options = {
            type: 'error',
            buttons: ['OK'],
            title: 'Error',
            message: 'An error occurred!',
        };
        dialog.showMessageBox(mainWindow, options);
        console.log(error)
    }
  })
  ipcMain.on("cancel-task", (event, name) => {
    let found = false;
    const data = jobStore.get("currentJobs")
    const newData = data.filter((element) => {
        element.name == name
        element.job.cancel()
    })
    jobStore.set("currentJobs", newData)
  })
  ipcMain.on("set-task", (event, msgData) => {
    console.log(msgData)
    const datetime = new Date(msgData.dateTime)
    const name = jobStore.get("jobHistory") ? `$Task-${jobStore.get("jobHistory").length}` : `Task 1`
    const recievers = []
    parsedNumbers = []
    console.log("logging1 -", jobStore.get("currentJobs"))
    msgData.phoneNumberList.forEach((val) => {
        const isValid = checkPhoneNumber(val)
        if (isValid) parsedNumbers.push(isValid)
    })
    msgData.phoneNumberList = parsedNumbers
    console.log(msgData.phoneNumberList)
    msgData.phoneNumberList.forEach((element) => recievers.push({
        name: element,
        done: false
    }))
    msgData.groups.forEach((element) => recievers.push({
        name: element.name,
        done: false
    }))
    console.log({
        name,
        job: "job",
        recievers
    })
    if (recievers.length > 0) {
        const job = schedule.scheduleJob(datetime, () => {
            sendMsg(msgData, {
                name,
                job,
                recievers
            });
        })
    } else {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Error',
            message: 'Invalid Recipients selected',
            buttons: ['OK'],
        })
    }
    console.log(job)
    console.log("recever-", recievers)
    jobStore.set("currentJobs", [...jobStore.get("currentJobs"), {
        name,
        recievers
    }])
    console.log("logging -", [...jobStore.get("currentJobs"), {
        name,
        recievers
    }])
    mainWindow.webContents.send("job-update")
  })
  const sendMsg = async (msgData, jobData) => {
    if (autoPrompt) {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Error',
            message: "Closed auto prompt",
            buttons: ['OK'],
        });
        try {
            await promptClient.destroy()
            autoPrompt = false
        } catch (error) {
            console.log(error)
        }
    }
    try {
        const client = new Client({
            authStrategy: new LocalAuth({
                clientId: store.get("client")
            }),
            puppeteer: {
                headless: store.get("headless") == "True" ? true : false
            }
        })
        var media;
        if (msgData.imageSrc) {
            media = MessageMedia.fromFilePath(msgData.imageSrc)
        }
        async function sendToGroups() {
            for (const group of msgData.groups) {
                msgData.imageSrc ? client.sendMessage(group.id, media, {
                        caption: msgData.msg
                    }) :
                    await client.sendMessage(group.id, msgData.msg)
                const updatedJobs = jobStore.get("currentJobs").map(job => {
                    const updatedReceivers = job.recievers.map(receiver => {
                        if (receiver.name === group.name) {
                            return {
                                ...receiver,
                                done: true
                            };
                        }
                        return receiver;
                    });
                    return {
                        ...job,
                        recievers: updatedReceivers
                    };
                });
                jobStore.set("currentJobs", updatedJobs)
                mainWindow.webContents.send("job-update")
                await sleep(1000 * parseInt(msgData.delayTime));
                console.log(1000 * parseInt(msgData.delayTime))
            }
        }
        async function sendToNumbers() {
            for (const number of msgData.phoneNumberList) {
                const isRegistered = await client.isRegisteredUser(`${number}@c.us`)
                if (isRegistered) {
                    msgData.imageSrc ? client.sendMessage(`${number}@c.us`, media, {
                            caption: msgData.msg
                        }) :
                        await client.sendMessage(`${number}@c.us`, msgData.msg)
                    const updatedJobs = jobStore.get("currentJobs").map(job => {
                        const updatedReceivers = job.recievers.map(receiver => {
                            if (receiver.name === number) {
                                return {
                                    ...receiver,
                                    done: true
                                };
                            }
                            return receiver;
                        });
                        return {
                            ...job,
                            recievers: updatedReceivers
                        };
                    });
                    jobStore.set("currentJobs", updatedJobs)
                    mainWindow.webContents.send("job-update")
                }
                await sleep(1000 * parseInt(msgData.delayTime));
                console.log(1000 * parseInt(msgData.delayTime))
            }
        }
        client.on('ready', async () => {
            await sendToNumbers()
            await sendToGroups()
            const currentJobTemp = jobStore.get('currentJobs').filter((element) => element.name == jobData.name)
            jobStore.set("currentJobs", currentJobTemp)
            const historyJobTemp = [...jobStore.get("historyJobs"), {
                name: jobData.name,
                recievers: jobData.recieved
            }]
            console.log(historyJobTemp)
            jobStore.set("historyJobs", historyJobTemp)
            mainWindow.webContents.send("job-update")
            try {
                await client.destroy()
            } catch (error) {
                console.log("error while closing after msg - ", error)
            }
        })
        client.on('qr', qr => {
            const options = {
                type: 'error',
                buttons: ['OK'],
                title: 'Error',
                message: 'Login Expired !',
            };
            dialog.showMessageBox(mainWindow, options);
            console.log(error)
        })
        client.initialize()
    } catch (error) {
        const options = {
            type: 'error',
            buttons: ['OK'],
            title: 'Error',
            message: 'An error ocurred !',
        };
        dialog.showMessageBox(mainWindow, options);
        console.log(error)
    }
  }
  ipcMain.on("chatgpt-query", (event, msgArray) => {
    if (!store.get("chatgptToken")) {
        const options = {
            type: 'error',
            buttons: ['OK'],
            title: 'Error',
            message: 'ChatGpt Token Invalid !',
        };
        dialog.showMessageBox(mainWindow, options);
    }
    async function main(openai) {
        try {
            const completion = await openai.chat.completions.create({
                messages: msgArray,
                model: "gpt-3.5-turbo",
            });
            console.log(completion.choices[0].message.content);
            mainWindow.webContents.send("chatgpt-response", completion.choices[0].message.content)
        } catch (error) {
            const options = {
                type: 'error',
                buttons: ['OK'],
                title: 'Error',
                message: 'ChatGpt Token Invalid !',
            };
            dialog.showMessageBox(mainWindow, options);
        }
    }
    try {
        const openai = new OpenAI({
            apiKey: store.get("chatgptToken")
        });
        main(openai);
    } catch (error) {
        console.log(error)
        const options = {
            type: 'error',
            buttons: ['OK'],
            title: 'Error',
            message: 'ChatGpt Token Invalid !',
        };
        dialog.showMessageBox(mainWindow, options);
    }
  })
  
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
