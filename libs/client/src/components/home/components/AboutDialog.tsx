import React from 'react';
import {Modal, Button} from 'components/bootstrap';
import PropTypes from 'prop-types';

import config from 'helpers/config';

AboutDialog.propTypes = {
  visible: PropTypes.bool,
  close: PropTypes.func.isRequired,
};

function AboutDialog({visible, close}) {
  const date = new Date();
  const year = date.getFullYear();

  const message = `Copyright © ${year} Douglas Partners Pty Ltd.`;
  const messageVersion = `Version  ${config.version}`;

  return (
    <Modal show={visible} onHide={close} backdrop="static" centered>
      <Modal.Header closeButton>Info</Modal.Header>
      <Modal.Body>
        <h6>{message}</h6>
        <div>{messageVersion}</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={close}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AboutDialog;
