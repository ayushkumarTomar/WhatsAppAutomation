import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row, OverlayTrigger, Tooltip , Dropdown } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import { IoMdInformationCircle } from 'react-icons/io';
import { FaWhatsapp, FaUsers } from 'react-icons/fa'; // Import icons for WhatsApp and Groups
import { Link, useSearchParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';


const ConfigMsg = () => {
    const { darkTheme } = useTheme();
    const [modalShow, setModalShow] = useState(false);

    
    const handleModalClose = () => {
        console.log("handleClose fired")

        setModalShow(false);}
    const handleModalShow = () => setModalShow(true);

    const [msg , setMsg] = useState("")


    const [groups , setGroups] = useState([])
    const [selectedDateTime, setSelectedDateTime] = useState('');

    const handleDateTimeChange = (event) => {
        setSelectedDateTime(event.target.value);
      };

    const [phoneNumberList , setPhoneNumberList] = useState([])

    const [imgPath , setImgPath] = useState("")
    const [imgFileName , setImageFileName] = useState("")

    const [delayTime , setDelayTime] = useState(1)

    const handleGroupPage = ()=>{
        ipcBridge.send("open-group-page")
    }

    const handleMsg = (e)=>{
        setMsg(e.target.value)
    }

    const handlePhoneNumber = (e)=>{
        const NewList = e.target.value.split("\n")
        // console.log("new-list - " ,NewList)
        console.log(NewList)
        setPhoneNumberList(NewList)
        
    }

    const handleFinalSubmit = ()=>{
        console.log("handleFinal fired")

        if(selectedDateTime==="" || phoneNumberList.length ==0 || msg ==""){
            setModalShow(false)
           return ipcBridge.send("alert" , "All fields are required")
           
        }
        activeStore.set("time" , selectedDateTime)
        activeStore.set("delay-time" , delayTime)
        activeStore.set("message" , msg)
        ipcBridge.send("set-task" , {
            dateTime: selectedDateTime , 
            phoneNumberList: phoneNumberList , 
            groups : groups , 
            imageSrc: imgPath , 
            msg : msg 

        })
        console.log("sent")
        setModalShow(false)



    }

    useEffect(()=>{ipcBridge.receive("content-updated" , () =>{
        console.log("Recieved content update")
        // console.log(activeStore.get("imageSrc"))
        if(activeStore.get("phoneNumbers")) setPhoneNumberList(activeStore.get("phoneNumbers"))
        if(activeStore.get("imageSrc")){
            setImgPath(activeStore.get("imageSrc")["imageSrc"])
            setImageFileName(activeStore.get("imageSrc")["fileName"])
        }

        if(activeStore.get("groups")) {
            console.log("groups updated")
            
            setGroups(activeStore.get("groups"))}

        if(activeStore.get("currentCollection")){
            console.log("got collection")
            setPhoneNumberList(activeStore.get("currentCollection").numberList)
        }



  
  
      })} , [])

    const infoTooltipButton = (
        <Tooltip id="info-tooltip-button">Images to be sent with text.</Tooltip>
    );

    const infoTooltipAddGroups = (
        <Tooltip id="info-tooltip-add-groups">Add groups from your accounts to send</Tooltip>
    );

    const infoTooltipDelay = (
        <Tooltip id="info-tooltip-delay">Delay time between messages default 1s (Use it carefully to avoid ban).</Tooltip>
    );

    return (
        <Container className={`display-6 ${darkTheme ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            <Row className="mt-4">
                <Col>
                    <h4 className='display-6 fs-5'>Set the message date and time</h4>
                    <Form.Control type="datetime-local" className='rounded-4' value={selectedDateTime} onChange={handleDateTimeChange} />
                </Col>
                <Col>
                    <OverlayTrigger placement="top" overlay={infoTooltipDelay}>
                        <h4 className='display-6 fs-6'>
                            Set Delay time (in sec)<IoMdInformationCircle />
                        </h4>
                    </OverlayTrigger>
                    <Form.Control type="number" className='rounded-4' value = {delayTime} onChange={(e)=>setDelayTime(e.target.value)}/>
                </Col>
                <Col>
                    <OverlayTrigger placement="top" overlay={infoTooltipButton}>
                        <Button variant="primary" className='rounded-5' onClick ={()=>ipcBridge.send("open-image-file")}>
                            Upload Image <IoMdInformationCircle />
                        </Button>
                    </OverlayTrigger>
                    <h6 className='mx-2 my-2 display-6 fs-6'>{imgFileName}</h6>
                </Col>
            </Row>
            <Row className="mt-4">
            <Col style={{ height: '300px', overflow: 'auto' }}>
                    <h4 className='display-6 fs-4'>Message</h4>
                    <Form.Control as="textarea" rows={5} className='rounded-4' style={{ height: '130px', resize: 'none' }} value = {msg} onChange={handleMsg}/>
                    <OverlayTrigger placement="top" overlay={infoTooltipAddGroups}>
                        <Button className="my-3 rounded-3"variant="info" onClick={handleGroupPage}>
                            Add Groups <FaUsers />
                        </Button>
                    </OverlayTrigger>

                    <h6 className='display-6 fs-6 rounded-3 '>Groups Added : {groups.length}</h6>
                </Col>

                <Col>
                    <h4 className='display-6 fs-4'>Parsed Numbers - {phoneNumberList.length}</h4>
                    <Form.Control as="textarea" rows={3} className='rounded-4' style={{ resize: "none" }} onChange={handlePhoneNumber} value = {phoneNumberList.join("\n")} />
                    <Button variant="secondary" className="rounded-5 mt-3" onClick = {()=>ipcBridge.send("open-phone-file")}>
                        <span className='display-6 fs-6'>Upload Phone Numbers</span>
                    </Button>
                    
                    <Button variant="success" size="lg" className="mt-3 rounded-3" onClick = {()=> setModalShow(true)}>
                        <FaWhatsapp /> <span className='fs-5'>Send</span>
                    </Button>
                </Col>
            </Row>


    <Modal show={modalShow} onHide={handleModalClose}>
        <Modal.Header className='display-5 fs-4 text-light bg-dark' closeButton>
          <Modal.Title>Confirm Sending</Modal.Title>
        </Modal.Header>
        <Modal.Body className='display-6 fs-6 text-light bg-dark'>
            You are sending messages to<br/>
            PhoneNumbers - {phoneNumberList.length} <br/>
            Groups - {groups.length}<br/>
            Time - {selectedDateTime}<br/>
            Delay Time - {delayTime}s <br/>
            Selected Image - {imgFileName}
        </Modal.Body>
        <Modal.Footer className='text-light bg-dark'>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="success" onClick={handleFinalSubmit}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>

        </Container>
    );
};

export default ConfigMsg;
