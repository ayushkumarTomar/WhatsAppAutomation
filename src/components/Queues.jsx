import React, { useEffect, useState } from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';

const Queues = () => {
  const [currentJobs, setCurrentJobs] = useState([]);
  const [historyJobs, setHistoryJobs] = useState([]);

  useEffect(() => {
    if (jobStore.get("currentJobs") !== null) setCurrentJobs(jobStore.get("currentJobs"));
    if (jobStore.get("historyJobs") !== null) setHistoryJobs(jobStore.get("historyJobs"));

    ipcBridge.receive("job-update", () => {
      if (jobStore.get("currentJobs") !== null) setCurrentJobs(jobStore.get("currentJobs"));
      if (jobStore.get("historyJobs") !== null) setHistoryJobs(jobStore.get("historyJobs"));
    });
  }, []);

  return (
    <div style={{ background: '#343a40', minHeight: '100vh', padding: '20px' }}>
      <Container>
        <Row>
          <Col>
            <div style={{ maxHeight: '400px', overflowY: 'scroll' }}>
              <ListGroup variant="flush">
                {currentJobs.map((job, index) => (
                  <div key={index}>
                    <ListGroup.Item className="bg-dark text-white">
                      <p>Name: {job.name}</p>
                      {job.recievers && job.recievers.length > 0 ? (
                        job.recievers.map((receiver, idx) => (
                          <p key={idx}>
                            {receiver.name} {receiver.done ? "🟢" : "❌"}
                          </p>
                        ))
                      ) : (
                        <p>No receivers</p>
                      )}
                    </ListGroup.Item>
                  </div>
                ))}
                {historyJobs.map((job, index) => (
                  <div key={index + 100}>
                    <ListGroup.Item className="bg-dark text-white">
                      <p>Name: {job.name}</p>
                      {job.recievers && job.recievers.length > 0 ? (
                        job.recievers.map((receiver, idx) => (
                          <p key={idx}>
                            {receiver.name} {receiver.done ? "🟢" : "❌"}
                          </p>
                        ))
                      ) : (
                        <p>No receivers</p>
                      )}
                    </ListGroup.Item>
                  </div>
                ))}
              </ListGroup>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Queues;
