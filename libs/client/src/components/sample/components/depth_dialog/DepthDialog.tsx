import React, {useState, useEffect} from 'react';
import {Modal, Button} from 'components/bootstrap';
import PropTypes from 'prop-types';
import {isString} from 'lodash';

import {WRONG_DEPTH_SELECTED} from 'constants/literals/errors';
import {confirmAction} from 'actions/commonActions';
import {useDispatch} from 'react-redux';

import NumberInput from 'components/common/NumberInput';

DepthDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  samples: PropTypes.object.isRequired,
  editSampleIds: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function DepthDialog({visible, samples, editSampleIds, onClose, onSave}) {
  const [depthFrom, setDepthFrom] = useState('');
  const [depthTo, setDepthTo] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    let depthFrom: any = 0;
    let depthTo: any = '';

    if (editSampleIds.length === 1) {
      const sampleId = editSampleIds[0];

      const parameter = samples[sampleId];

      if (parameter) {
        depthFrom = parameter.depth.from;
        depthTo = parameter.depth.to;
      }
    }

    depthFrom = depthFrom.toFixed(2);

    if (depthTo) depthTo = depthTo.toFixed(2);

    setDepthFrom(depthFrom);
    setDepthTo(depthTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDepth = () => {
    let from = depthFrom ? Number(depthFrom) : depthFrom;

    if (isString(from)) from = 0;

    const to = depthTo ? Number(depthTo) : depthTo;

    const fromNumber = Number(from);
    const toNumber = Number(to);

    if (!isNaN(fromNumber) && !isNaN(toNumber) && (fromNumber < toNumber || fromNumber === toNumber)) {
      onSave(fromNumber, toNumber);
    } else {
      dispatch(
        confirmAction({
          title: 'Error!',
          message: WRONG_DEPTH_SELECTED,
          infoDialog: true,
          buttonText: 'Clear depths',
        })
      );
    }

    setDepthFrom('0');
    setDepthTo('0');
  };

  return (
    <Modal id="depth-dialog" size="sm" show={visible} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>Set Depth</Modal.Header>

      <Modal.Body>
        <NumberInput
          name="depthFrom"
          label="Depth From (m)"
          value={depthFrom}
          onChange={(field, value) => setDepthFrom(value)}
        />

        <NumberInput
          name="depthTo"
          label="Depth To (m)"
          value={depthTo}
          onChange={(field, value) => setDepthTo(value)}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={saveDepth}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DepthDialog;
