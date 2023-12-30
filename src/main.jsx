import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {Upload} from './components'
import {Groups} from './components/'
import {Editor} from './components'
import { HashRouter , Route , Routes} from 'react-router-dom'



ReactDOM.createRoot(document.getElementById('root')).render(

<HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="upload/:type" element={<Upload />} />
      <Route path = "groups" element = {<Groups/>}/>
      <Route path = "edit/:type" element = {<Editor/>}/>


    </Routes>
  </HashRouter>
);

