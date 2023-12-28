import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button, Form } from 'react-bootstrap';
import "./image.css"

function ImageUpload() {
  const [fileName, setFileName] = useState('');
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    ipcBridge.receive('image-file-selected', (filePath) => {
      console.log('Received data from main:', filePath);
      setFileName(filePath.split('\\').pop());
      setImageSrc(filePath); 
    });
  }, []);

  return (
    <div className="bg-dark text-light" style={{ minHeight: '100vh' }}>
      <h2 className="display-4 fs-4" style={{ textAlign: 'center' }}>{fileName}</h2>
      <Container className="py-2">
      <div className="image-container">
      <div className="image-scroll">
        {imageSrc && (
          <img
            src={`file://${imageSrc}`}
            alt="Uploaded"
            className="image-content"
          />
        )}
      </div>
    </div>
        <div>

        <Button
            variant="primary"
            className="me-2 my-2"
            onClick={() =>{
                activeStore.set("imageSrc" , {imageSrc , fileName})
                ipcBridge.send("content-update")
                ipcBridge.send("close-phone-window")
            }
        }
          >
            OK
          </Button>
          <Button
            variant="secondary" className='my-2'
            onClick={() => ipcBridge.send("close-phone-window")}
          >
            Cancel
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default ImageUpload;
