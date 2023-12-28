import React, { useState } from 'react';
import './App.css';
import { useTheme , ThemeProvider} from './context/ThemeContext';
import { Container, Row, Col, Button , ButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ChatGPTComponent , SettingsPanel , Queues , ConfigMsg } from './components';



const App = () => {
  const { darkTheme } = useTheme();

  const [activePage, setActivePage] = useState(1);
  
  return (
      <Container fluid className={`p-0 ${darkTheme ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <Row className="vh-100">
          {/* Side Panel (Settings) */}
          <Col xs={2} >
                 <SettingsPanel />
          </Col>

          {/* Main Content */}
          <Col xs={7} >
            
            <h2 className="display-5 text-center mb-3 my-2 text-success">AutoChat</h2>
            <div className="d-flex justify-content-center">
              {/* Segmented Buttons */}
              <ButtonGroup  aria-label="Basic example">
                    <Button className="rounded-start-5" variant={activePage==1?"success":"secondary"} onClick={()=>setActivePage(1)}>Messages</Button>
                    <Button className="rounded-end-5" variant={activePage==2?"success":"secondary"} onClick={()=>setActivePage(2)}>Queues</Button>
             </ButtonGroup>

             
            </div>

            {/* Main Content Sections */}
            <Row className="mt-3">
              {/* Placeholder for the main content */}
              <Col xs={12} className="">
                {/* <ConfigMsg></ConfigMsg> */}
                {
                  activePage==1? <ConfigMsg/> : <Queues/>
                }
                   
              </Col>
            </Row>
          </Col>

          {/* ChatGPT Component */}
          <Col xs={3} className="d-flex flex-column">
            {/* <h2 className="my-3 lead text-center mb-3">ChatGPT</h2> */}
            <div style={{ height: '25%' }}>
              {/* Content for ChatGPT */}
              <ChatGPTComponent ></ChatGPTComponent>
            </div>
          </Col>
        </Row>
      </Container>
  );
};

const ThemedApp = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default ThemedApp;
