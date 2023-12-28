import { useState , useEffect } from 'react'
import { useParams , Link } from 'react-router-dom'
import { Container, Button, Form } from 'react-bootstrap';



function NumberUpload() {

    // const {type} = useParams()


    const [fileName , setFileName] = useState("")
    const [phoneNumberList , setPhoneNumberList] =useState([])

  

  useEffect(()=>{
    console.log("i am inside use effect")
    ipcBridge.receive("phone-file-selected" , (fileName , phoneumbers) =>{
      console.log('Received data from main:', fileName);
      const parts = fileName.split("\\")
      setFileName(parts[parts.length-1])
      console.log(phoneumbers)
      setPhoneNumberList(phoneumbers)


    })
    
  } , [])

  return (
    <div className="bg-dark text-light" style={{ minHeight: '100vh' }}>
        <h2 className='display-4 fs-4' style={{textAlign:"center"}}>{fileName}</h2>
      <Container className="py-2">
        <h1>Parsed Numbers - {phoneNumberList.length}</h1>
        <Form.Group controlId="parsedNumbersTextArea" className="mb-3">
          {/* <Form.Label>Parsed Numbers:</Form.Label> */}
          <Form.Control
            as="textarea"
            rows={5}
            readOnly
            value={phoneNumberList.join(', ')}
          />
        </Form.Group>
        <div>
          <Button
            variant="primary"
            className="me-2"
            onClick={() =>{
                activeStore.set("phoneNumbers" , phoneNumberList)
                ipcBridge.send("content-update")
                ipcBridge.send("close-phone-window")
            }
        }
          >
            OK
          </Button>
          <Button
            variant="secondary"
            onClick={() => ipcBridge.send("close-phone-window")}
          >
            Cancel
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default NumberUpload;


