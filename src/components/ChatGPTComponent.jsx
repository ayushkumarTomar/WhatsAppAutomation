import React, { useState, useRef, useEffect } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { IoSunnyOutline, IoMoonOutline, IoCopy } from 'react-icons/io5';
import { useTheme } from '../context/ThemeContext';

const ChatGPTComponent = () => {
  const { darkTheme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(-1);

  const [msgArray, setMsgArray] = useState([
    { "role": "system", "content": "You are a helpful assistant." }
  ]);

  const [gptResponse, setGptResponse] = useState([]);

  useEffect(() => {
    ipcBridge.receive("chatgpt-response", (response) => {
      setMsgArray((prev) => [...prev, { "role": "assistant", "content": response }]);
      setGptResponse((prev) => [...prev, gptResponse]);
      setMessages([...messages, { text: response, fromUser: false }]);
    });
  }, []);

  const chatEndRef = useRef(null);

  const handleUserInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (userInput.trim() !== '') {
      const newMessage = { text: userInput, fromUser: true };
      const newArr = [...msgArray, { "role": "user", "content": userInput }];
      ipcBridge.send("chatgpt-query", newArr);
      setMsgArray(newArr);
      setMessages([...messages, newMessage]);
      setUserInput('');
    }
  };

  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(-1);
    }, 1500); // Reset the copied index after 1.5 seconds
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="container py-3 rounded-5 my-2" style={{ backgroundColor: darkTheme ? '#343a40' : '#FFF8E1', color: darkTheme ? '#fff' : '#000' }}>
      <div className="position-fixed top-0 end-0 " style={{ zIndex: 1000 }}>
        <OverlayTrigger
          placement="left"
          overlay={<Tooltip id="themeTooltip">{darkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</Tooltip>}
        >
          <Button variant="link" className="theme-toggle-icon" onClick={toggleTheme} style={{ marginBottom: '20px' }}>
            {darkTheme ? <IoSunnyOutline size={24} /> : <IoMoonOutline size={24} />}
          </Button>
        </OverlayTrigger>
      </div>

      <h3 className="text-center mb-4 my-2">ChatGPT</h3>

      <div className="mt-3 mb-3 d-flex flex-column align-items-center">
        <textarea
          type="text"
          rows={4}
          placeholder='Waiting for prompt ....'
          value={userInput}
          onChange={handleUserInputChange}
          style={{ width: "90%", resize: "none" }}
          className="form-control form-control-sm rounded-4 mb-2" // Apply the form-control-sm class for smaller font size
        />
        <Button variant="primary" onClick={sendMessage} className="btn-sm rounded-2">
          Send
        </Button>
      </div>

      <div className="scrollable-div" style={{ overflowY: 'auto', maxHeight: '300px' }}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`d-flex justify-content-${message.fromUser ? 'end' : 'start'}`}
            style={{ marginBottom: '8px' }}
          >
            <div
              className={`form-control-sm rounded-3 mb-2 p-2 ${message.fromUser ? 'bg-primary text-white' : 'bg-secondary text-dark'}`}
              style={{
                width: 'fit-content',
                maxWidth: '100%',
                resize: 'none',
                overflowWrap: 'break-word',
                minHeight: '30px',
                padding: '5px',
                whiteSpace: 'pre-wrap',
                position: 'relative',
                display: 'flex', // Ensure the background covers the entire height
                alignItems: 'center', // Center content vertically
              }}
            >
              {message.fromUser ? 'You reply: ' : ''}
              <br />
              <div
                className="text-break"
                style={{ width: 'fit-content' }}
                contentEditable={false}
              >
                {message.text}
              </div>
              {!message.fromUser && (
                <Button
                  variant="link"
                  onClick={() => handleCopyMessage(message.text, index)}
                  className="copy-icon"
                  style={{ color: copiedIndex === index ? 'green' : 'black', position: 'absolute', bottom: '5px', right: '5px' }}
                >
                  <IoCopy size={13} />
                </Button>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatGPTComponent;
