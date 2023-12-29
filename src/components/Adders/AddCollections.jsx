import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

function Addcollection() {
  const [inputValue, setInputValue] = useState('');
  const [collectionList, setCollectionList] = useState([]);
  const [inputList, setInputList] = useState([]);

  useEffect(() => {
    if (settings.get("collectionList")) setCollectionList(settings.get("collectionList"));
  }, []);

  const handleAdd = () => {
    if (inputValue.trim() === '' || inputList.length === 0) {
      ipcBridge.send("alert", "All the fields are required");
    } else {
      const newElems = [...collectionList, { name: inputValue, numberList: inputList }];
      setCollectionList(newElems);
      setInputValue('');
      setInputList([]);
      settings.set("collectionList", newElems);
    }
  };

  const handleDelete = (index) => {
    const updatedElements = collectionList.filter((_, i) => i !== index);
    setCollectionList(updatedElements);
    settings.set("collectionList", updatedElements);
  };

  const handleInputList = (e) => {
    const newList = e.target.value.split("\n");
    setInputList(newList);
  };

  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#343a40' }}>
      <div className="container-fluid p-3" style={{ overflow: 'auto' }}>
        <h6 className="display-6 fs-6 text-white">Add and Delete Collections</h6>
        <Form.Group className="mb-3">
          <Form.Control className='rounded-4'
            type="text"
            placeholder="Enter element"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control className='rounded-4'
            as="textarea"
            placeholder="Enter numbers"
            value={inputList.join("\n")}
            onChange={handleInputList}
            rows={3}
          />
        </Form.Group>
        <Button className="btn-sm rounded-4" variant="primary" onClick={handleAdd}>
          Add Element
        </Button>
  
        <hr />
        <h6 className='display-6 fs-6 text-white'>Added Elements:</h6>
        {collectionList.map((element, index) => (
          <div key={index}>
            <h6 className='text-white'>{element.name}</h6>
            <ul>
              {element.numberList.map((value, subIndex) => (
                <li className="text-white" key={subIndex}>{value}</li>
              ))}
            </ul>
            <Button variant="danger" size="sm" className="ms-2 rounded-4" style={{ "padding": "0.2rem 0.5rem", "fontSize": '0.45rem' }} onClick={() => handleDelete(index)}>
              Delete
            </Button>
          </div>
        ))}
  
        <div className="text-center my-3">
          <Button size="sm" variant="secondary" onClick={() => ipcBridge.send("close-editor-window")}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default Addcollection;
