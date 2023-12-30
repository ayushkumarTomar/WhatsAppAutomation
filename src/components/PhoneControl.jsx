import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

function PhoneControl() {
  const [access, setAccess] = useState("");

  useEffect(() => {
    if (settings.get("access")) setAccess(settings.get("access"));
  }, []);

  const startAutoPrompt = () => {
    ipcBridge.send("start-auto-prompt");
    ipcBridge.send("alert", "Started listening auto prompt provided by you");
  };

  const handleAdd = () => {
    settings.set("access", access);
    setAccess(access);
  };

  const handleDelete = () => {
    setAccess("");
    settings.set("access", "");
  };

  return (
    <div className="vh-100 vw-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#343a40' }}>
      <div className="container-fluid p-3" style={{ overflow: 'auto' }}>
        <Button className="py-2" variant="primary" size="sm" onClick={startAutoPrompt}>
          Click Start Listening to Auto prompts and Phone Control
        </Button>
        <br /><br />
        <h6 className="display-6 fs-6 text-white">Change or Delete access</h6>
        <Form.Group className="mb-3">
          <Form.Control className='rounded-4'
            type="text"
            placeholder="Enter phonenumber"
            value={access}
            onChange={(e) => setAccess(e.target.value)}
          />
        </Form.Group>
        <Button className="btn-sm rounded-4" variant="primary" onClick={handleAdd}>
          Add Access
        </Button>
        <Button className=" px-2  mx-2 btn-sm rounded-4" variant="primary" onClick={handleDelete}>
          Revoke Access
        </Button>
        <h4 className='text-white display-6 fs-4 my-4'>Access - {access ? access : "None"}</h4>
        <hr />
      </div>
    </div>
  );
}

export default PhoneControl;
