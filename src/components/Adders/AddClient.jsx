import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

function AddClient() {
  const [inputValue, setInputValue] = useState('');
  const [clientList, setClientList] = useState([]);

  useEffect(() => {
    if (settings.get("clientList")) setClientList(settings.get("clientList"));
  }, []);

  const handleAdd = () => {
    if (inputValue.trim() !== '') {
      const newElems = [...clientList, inputValue];
      setClientList(newElems);
      setInputValue('');
      settings.set("clientList", newElems);
    }
  };

  const handleDelete = (index) => {
    if (clientList[index] === "Default") return ipcBridge.send("alert", "Can't delete default");
    const updatedElements = clientList.filter((_, i) => i !== index);
    setClientList(updatedElements);
    settings.set("clientList", updatedElements);
  };

  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#343a40' }}>
      <div className="container-fluid p-3" style={{ overflow: 'auto' }}>
        <h4 className='display-6 fs-6 mb-4 text-white'>Add and Delete Clients</h4>
        <Form.Group className="mb-3">
          <Form.Control className='rounded-4'
            type="text"
            placeholder="Enter element"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </Form.Group>
        <Button size="sm" variant="primary" className='rounded-4' onClick={handleAdd}>
          Add Element
        </Button>
  
        <hr />
        <h6 className="text-white">Added Elements:</h6>
        {clientList.map((element, index) => (
          <div key={index}>
            <span className="text-white">{element}</span>
            <Button variant="danger" size="sm" className="ms-2 rounded-4" style={{"padding": "0.2rem 0.5rem","fontSize": '0.45rem'}} onClick={() => handleDelete(index)}>
              Delete
            </Button>
          </div>
        ))}
  
        <div className="text-center my-3">
          <Button size="sm" variant="secondary" onClick={() => ipcBridge.send('close-editor-window')}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default AddClient;
