import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import "./Uploaders/image.css";
import QRCode from 'qrcode.react';

function Groups() {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [addedGroups, setAddedGroups] = useState([]);
  const [clientReady, setClientReady] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [qr, setQr] = useState("");

  const addToAddedGroups = (groupName) => {
    setAddedGroups([...addedGroups, groupName]);
    setAvailableGroups(availableGroups.filter((group) => group !== groupName));
  };

  const removeFromAddedGroups = (groupName) => {
    setAvailableGroups([...availableGroups, groupName]);
    setAddedGroups(addedGroups.filter((group) => group !== groupName));
  };

  const handleGroupSubmit = () => {
    activeStore.set("groups", addedGroups);
    ipcBridge.send("close-group-window");
  };

  useEffect(() => {
    ipcBridge.receive("groups-list", (groupsList) => {
      setAvailableGroups(groupsList);
      setClientReady(true);
    });

    ipcBridge.receive("qr", (qr) => {
      setIsLogin(false);
      setClientReady(true);
      setQr(qr);
    });

    ipcBridge.receive("client-ready", () => {
      setIsLogin(true);
      setClientReady(true);
    });
  }, []);

  if (!clientReady) {
    return (
      <Container fluid className="p-0 m-0 bg-dark text-light" style={{ height: "100vh" }}>
        <h3 className='py-4 display-4 fs-4 text-center'>Fetching your data ......</h3>
        <div style={{ textAlign: 'center' }}>
          Loading<br/>
          <Spinner animation="border" variant="primary" style={{ animationDuration: '2s' }} />
        </div>
      </Container>
    );
  }

  if (!isLogin) {
    alert("Login Expired");
    return ipcBridge.send("close-group-window");
  }

  return (
    <Container fluid className="p-0 m-0 bg-dark text-light" style={{ height: "100vh", overflow: "auto" }}>
      <Row>
        <Col className='my-3' xs={12} md={6}>
          <h4 className='mx-4 display-6 fs-4'>Available Groups</h4>
          <div className="group-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {availableGroups.map((group) => (
              <Button
                key={group.id}
                className="rounded-pill m-1 small-btn"
                onClick={() => addToAddedGroups(group)}
              >
                {group.name}
              </Button>
            ))}
          </div>
        </Col>
        <Col className='my-3' xs={12} md={6}>
          <h4 className='mx-5 display-6 fs-4'>Added Groups</h4>
          <div className="group-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {addedGroups.map((group) => (
              <Button
                key={group.id}
                className="rounded-pill m-1 added-group small-btn"
                onClick={() => removeFromAddedGroups(group)}
              >
                {group.name}{' '}
                <span role="img" aria-label="remove" className="remove-icon">❌</span>
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center mt-3">
        <Col xs="auto">
          <Button variant='success' className="py-2" onClick={handleGroupSubmit}>Confirm</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Groups;
