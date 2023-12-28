import React, { useEffect, useState } from 'react';
import { Nav, NavDropdown, NavItem, Button } from 'react-bootstrap';
import { BsPerson } from 'react-icons/bs';
import { FaRegUserCircle } from "react-icons/fa";

const SettingsPanel = () => {
  const [headlessOption, setHeadlessOption] = useState("");
  const [client, setClient] = useState("");
  const [collection, setCollection] = useState();
  const [collectionList, setCollectionList] = useState([]);
  const [clientList, setClientList] = useState([]);

  const handleHeadless = (eventKey) => {
    setHeadlessOption(eventKey);
    settings.set("headless", eventKey);
  };

  const handleCollection = (eventKey) => {
    collectionList.forEach((element) => {
      if (element.name === eventKey) {
        setCollection(element);
        activeStore.set("currentCollection", element);
        ipcBridge.send('send-content-update');
      }
    });
  };

  const handleClient = (eventKey) => {
    setClient(eventKey);
    settings.set("client", eventKey);
  };

  useEffect(() => {
    if (settings.get("headless")) setHeadlessOption(settings.get("headless"));
    if (settings.get("client")) setClient(settings.get("client"));
    if (settings.get("collectionList")) setCollectionList(settings.get("collectionList"));
    if (settings.get("clientList")) setClientList(settings.get("clientList"));

    ipcBridge.receive("content-updated", () => {
      if (settings.get("headless")) setHeadlessOption(settings.get("headless"));
      if (settings.get("client")) setClient(settings.get("client"));
      if (settings.get("collectionList")) setCollectionList(settings.get("collectionList"));
      if (settings.get("clientList")) setClientList(settings.get("clientList"));
    });
  }, []);

  return (
    <div className="p-4 pt-3 settings-panel">
      <Nav className="flex-column">
        <Nav.Link href="#" className="img rounded-circle mb-2">
          <BsPerson size={50} />
        </Nav.Link>
        <NavItem className='font-weight-bold-fs-6 py-2 '>
          <Button variant="secondary" size="sm" onClick={() => ipcBridge.send("open-login")}>Login</Button>
        </NavItem>
        <NavItem className="font-weight-bold fs-6">Collection</NavItem>
        <NavDropdown title={collection ? collection.name : "Select"} id="collection-dropdown" onSelect={handleCollection}>
          {collectionList.map((collection, index) => (
            <NavDropdown.Item eventKey={collection.name} key={index}>{collection.name}</NavDropdown.Item>
          ))}
        </NavDropdown>
        <NavItem className="font-weight-bold fs-6">Client</NavItem>
        <NavDropdown title={client} onSelect={handleClient} id="client-dropdown">
          {clientList.map((clients, index) => (
            <NavDropdown.Item eventKey={clients} key={index}>{clients}</NavDropdown.Item>
          ))}
        </NavDropdown>
        <NavItem className="font-weight-bold fs-6">Headless</NavItem>
        <NavDropdown title={headlessOption} className="narrow-dropdown" id="client-dropdown" onSelect={handleHeadless}>
          <NavDropdown.Item eventKey="True">True</NavDropdown.Item>
          <NavDropdown.Item eventKey="False">False</NavDropdown.Item>
        </NavDropdown>
        <NavItem className="" style={{ fontSize: "13px" }} onClick={() => ipcBridge.send("open-editor-window", "gpt-token")}>ChatGPT Token</NavItem>
        <NavItem className="ont-weight-bold fs-6" style={{ fontSize: "13px" }}>Help</NavItem>
      </Nav>
      <div className="buttons-container">
        <Button variant="primary" className="btn-sm mb-2 btn-custom-smaller" style={{ fontSize: "9px" }} onClick={() => ipcBridge.send("open-editor-window", "phone-control")}>Phone Control </Button>
        <Button variant="primary" className="btn-sm mb-2 btn-custom-smaller" style={{ fontSize: "9px" }} onClick={() => ipcBridge.send("open-editor-window", "auto-prompt")}>Auto Prompt </Button>
        <Button variant="primary" className="btn-sm mb-2 btn-custom-smaller" style={{ fontSize: "9px" }} onClick={() => ipcBridge.send("close-auto-prompt")}>Close Auto Bot </Button>
        <Button variant="primary" className="btn-sm mb-2 btn-custom-smaller" style={{ fontSize: "9px" }} onClick={() => ipcBridge.send("open-editor-window", "collections")}>Edit Collections </Button>
        <Button variant="secondary" className="btn-sm mb-2 btn btn-custom-smaller" style={{ fontSize: "9px" }} onClick={() => ipcBridge.send("open-editor-window", "client")}>Edit Clients</Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
