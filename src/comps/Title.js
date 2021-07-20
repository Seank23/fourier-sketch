import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import HelpGuide from './HelpGuide';
import HelpAbout from './HelpAbout';

const Title = () => {

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
    <div className="title flex-row">
      <h1>FourierSketch</h1>
      <a href="#" onClick={handleShow}>Help</a>
    </div>

    <Modal centered size="lg" show={show} onHide={handleClose}>
    <Modal.Header closeButton>
      <Modal.Title>Help</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Tabs defaultActiveKey="aboutTab" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="aboutTab" title="About">
          <HelpAbout/>
        </Tab>
        <Tab eventKey="guideTab" title="Guide">
          <HelpGuide/>
        </Tab>
      </Tabs>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
  </div>
  )
}

export default Title;