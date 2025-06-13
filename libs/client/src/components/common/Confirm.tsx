import React from 'react';
import {Modal, Button} from 'components/bootstrap';
import PropTypes from 'prop-types';

Confirm.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  visible: PropTypes.bool,
  infoDialog: PropTypes.bool,
  action: PropTypes.func,
  close: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};

function Confirm({title, message, visible, infoDialog, action, close, buttonText}) {
  const displayTitle = title ? title : 'Are you sure?';
  const displayMessage = message ? message : 'Confirmation';
  const displayPrimaryButtonText = buttonText ? buttonText : 'Ok';

  return (
    <Modal show={visible} onHide={close} backdrop="static" centered>
      <Modal.Header closeButton>{displayTitle}</Modal.Header>
      <Modal.Body>
        <div style={{whiteSpace: 'pre-line'}}>{displayMessage}</div>
      </Modal.Body>

      <Modal.Footer>
        {infoDialog && (
          <Button variant="primary" onClick={close}>
            {displayPrimaryButtonText}
          </Button>
        )}

        {!infoDialog && (
          <React.Fragment>
            <Button variant="danger" onClick={action}>
              {displayPrimaryButtonText}
            </Button>
            <Button variant="secondary" onClick={close}>
              No
            </Button>
          </React.Fragment>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default Confirm;
