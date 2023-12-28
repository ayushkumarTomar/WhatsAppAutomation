import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

function AutoPrompt() {
  const [promptList, setPromptList] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (settings.get('promptList')) setPromptList(settings.get('promptList'));
  }, []);

  const handleAdd = () => {
    if (prompt.trim() === '' || response.trim() === '') {
      ipcBridge.send('alert', 'All the fields are required');
    } else {
      const newElems = [...promptList, { prompt: prompt, response: response }];
      setPromptList(newElems);
      setPrompt('');
      setResponse('');
      settings.set('promptList', newElems);
    }
  };

  const startAutoPrompt = () => {
    ipcBridge.send("start-auto-prompt");
    ipcBridge.send("alert", "Started listening auto prompt provided by you");
  };

  const handleDelete = (index) => {
    const updatedElements = promptList.filter((_, i) => i !== index);
    setPromptList(updatedElements);
    settings.set('promptList', updatedElements);
  };

  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#343a40' }}>
      <div className="container-fluid p-3" style={{ overflow: 'auto', maxHeight: '100vh' }}> {/* Set a max height for scrolling */}
        <h6 className="display-6 fs-6 text-white">Add and Delete prompts</h6><br />
        <Button className="py-2" variant="primary" size="sm" onClick={startAutoPrompt}>Click Start Listening to Auto prompts and Phone Controls</Button><br /><br />
        <Form.Group className="mb-3">
          <Form.Control className="rounded-4" type="text" placeholder="Enter prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control className="rounded-4" as="textarea" placeholder="Enter response" value={response} onChange={(e) => setResponse(e.target.value)} rows={3} />
        </Form.Group>
        <Button className="btn-sm rounded-4" variant="primary" onClick={handleAdd}>
          Add Auto prompt
        </Button>

        <hr />
        <h6 className="display-6 fs-6 text-white">Added Prompts:</h6>
        {promptList.map((element, index) => (
          <div key={index}>
            <h6 className="text-white">{element.prompt}</h6>
            <p className="text-white" style={{ "fontSize": "10px" }}>{element.response}</p>
            <Button variant="danger" size="sm" className="ms-2 rounded-4" style={{ padding: '0.2rem 0.5rem', fontSize: '0.45rem' }} onClick={() => handleDelete(index)}>
              Delete
            </Button>
          </div>
        ))}

        <div className="text-center my-3">
          <Button size="sm" variant="secondary" onClick={() => ipcBridge.send('close-editor-window')}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AutoPrompt;
