import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Modal, Button, Row, Col, Form} from 'components/bootstrap';

import * as speciesProtectionLevels from 'constants/speciesProtectionLevels';

import './species-level-protection.scss';

SpeciesLevelProtectionDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function SpeciesLevelProtectionDialog({visible, params, onClose, onSave}) {
  const levelOptions = [
    {value: speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_80, label: '80%'},
    {value: speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_90, label: '90%'},
    {value: speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_95, label: '95%'},
    {value: speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_99, label: '99%'},
  ];

  const [parameters, setParameters] = useState({
    bioAccumulative: speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_99,
    pfas: speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_99,
    others: speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_95,
  });

  useEffect(() => {
    setParameters(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onValueChange = (name, value) => {
    setParameters({...parameters, [name]: value});
  };

  function render() {
    return (
      <Modal id="species-level-protection" show={visible} onHide={onClose} backdrop="static" centered>
        <Modal.Header closeButton>Species Protection Level</Modal.Header>

        <Modal.Body>
          <Row>
            {renderColumn('Bio-Accumulative', 'bioAccumulative')}
            {renderColumn('PFAS', 'pfas')}
            {renderColumn('Others', 'others')}
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={() => onSave(parameters)}>
            Update sample parameters
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const renderColumn = (label, name) => {
    return (
      <Col sm={4}>
        <div className="title">{label}</div>
        <div className="level-container">
          {levelOptions.map((option) => {
            const key = option.value;

            const controlId = `${name}_${key}`;

            const isChecked = parameters[name] === key;

            return (
              <Form.Group key={controlId} controlId={controlId}>
                <Form.Check
                  type="radio"
                  name={name}
                  checked={isChecked}
                  label={option.label}
                  onChange={() => onValueChange(name, key)}
                />
              </Form.Group>
            );
          })}
        </div>
      </Col>
    );
  };

  return render();
}

export default SpeciesLevelProtectionDialog;
