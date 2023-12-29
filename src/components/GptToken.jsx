import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

function GptToken() {
  const [token, setToken] = useState("");

  useEffect(() => {
    if (settings.get("chatgptToken")) setToken(settings.get("chatgptToken"));
  }, []);

  const handleAdd = () => {
    settings.set("chatgptToken", token);
    ipcBridge.send("close-editor-window");
  };

  const handleDelete = () => {
    setToken("");
    settings.set("chatgptToken", "");
  };

  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#343a40' }}>
      <div className="container-fluid p-3" style={{ overflow: 'auto' }}>
        <h6 className="display-6 fs-6 text-white">Change or Delete ChatGptToken</h6>
      
        <Form.Group className="mb-3">
          <Form.Control className='rounded-4'
            type="text"
            placeholder="Enter API Key"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </Form.Group>
      
        <Button className="btn-sm rounded-4" variant="primary" onClick={handleAdd}>
          Add
        </Button>

        <Button className="px-2 mx-2 btn-sm rounded-4" variant="primary" onClick={handleDelete}>
          Delete
        </Button> 

        <h4 className='text-white display-6 fs-4 my-4'>API Key - {token ? token : "None"}</h4>

        <hr />
      </div>
    </div>
  );
}

export default GptToken;
