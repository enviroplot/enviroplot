import React, {useState, useEffect} from 'react';
import {Modal, Button} from 'components/bootstrap';
import PropTypes from 'prop-types';

import NumberInput from 'components/common/NumberInput';

ExcavationDepthDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  samples: PropTypes.object.isRequired,
  editSampleIds: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function ExcavationDepthDialog({visible, samples, editSampleIds, onClose, onSave}) {
  const [depth, setDepth] = useState('');

  useEffect(() => {
    let depth: any = '';

    if (editSampleIds.length === 1) {
      const sampleId = editSampleIds[0];

      const sample = samples[sampleId];

      if (sample) depth = sample.depth.excavationDepth;
    }

    if (depth) depth = depth.toFixed(2);

    setDepth(depth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveDepth = () => {
    const excavationDepth = depth ? Number(depth) : depth;

    onSave(excavationDepth);
  };

  return (
    <Modal id="depth-dialog" size="sm" show={visible} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>Set Excavation Depth</Modal.Header>

      <Modal.Body>
        <NumberInput
          name="depth"
          label="Excavation Depth (m)"
          value={depth}
          onChange={(field, value) => setDepth(value)}
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

export default ExcavationDepthDialog;
