const { contextBridge, ipcRenderer } = require('electron');
const Store = require('electron-store');

const store = new Store({ name: 'settings' });

const activeStateStore = new Store({name:"activeStore"})


const jobStore = new Store({name:"jobStore"})

contextBridge.exposeInMainWorld('ipcBridge',{
   send : (message , parameters)=>{
      ipcRenderer.send(message , parameters)
   } , 
   receive: (channel, callback) => {
      ipcRenderer.on(channel, (event, ...args) => {
        callback(...args);
      });
    }
})

contextBridge.exposeInMainWorld("settings" , {
   get : (key)=>{
      // console.log('recieved request for - ' , key)
      // console.log("its value is - " , store.get(key))
      return store.get(key)
   },
   set : (key , value)=>{
      console.log("recieved change for - " , key  , " - " , value)
      store.set(key , value)
   } , 
   delete :(key)=> store.delete(key)
})

contextBridge.exposeInMainWorld("activeStore" ,{
   get : (key)=>{
      return activeStateStore.get(key)
   },
   set : (key , value)=>{
      console.log("recieved change for - " , key  , " - " , value)
      activeStateStore.set(key , value)
   } , 
   delete :(key)=> activeStateStore.delete(key)

})

contextBridge.exposeInMainWorld("jobStore" ,{
   get : (key)=>{
      return jobStore.get(key)
   },
   set : (key , value)=>{
      console.log("recieved change for - " , key  , " - " , value)
      jobStore.set(key , value)
   } , 
   delete :(key)=> jobStore.delete(key)

})


