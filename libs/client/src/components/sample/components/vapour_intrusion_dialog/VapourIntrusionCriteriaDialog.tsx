import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Modal, Button, Row, Col} from 'components/bootstrap';

import {CLAY_SOIL_TYPE, SILT_SOIL_TYPE, SAND_SOIL_TYPE} from 'constants/hslSoilTypes';
import {DEPTH_LEVEL_2_to_4, DEPTH_LEVEL_4_to_8, DEPTH_LEVEL_8_to_UNLIMITED} from 'constants/groundwaterHslDepthLevels';

import SelectInput from 'components/common/SelectInput';

VapourIntrusionCriteriaDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function VapourIntrusionCriteriaDialog({visible, params, onClose, onSave}) {
  const soilTypeOptions = [
    {value: CLAY_SOIL_TYPE, label: CLAY_SOIL_TYPE},
    {value: SILT_SOIL_TYPE, label: SILT_SOIL_TYPE},
    {value: SAND_SOIL_TYPE, label: SAND_SOIL_TYPE},
  ];

  const waterDepthOptions = [
    {value: DEPTH_LEVEL_2_to_4, label: '2 m to < 4 m'},
    {value: DEPTH_LEVEL_4_to_8, label: '4 m to < 8 m'},
    {value: DEPTH_LEVEL_8_to_UNLIMITED, label: '8 m+'},
  ];

  const [soilType, setSoilType] = useState(params.soilType);
  const [waterDepth, setWaterDepth] = useState(params.waterDepth);

  const saveParameters = () => {
    const parameters = {
      soilType,
      waterDepth,
    };

    onSave(parameters);
  };

  function render() {
    return (
      <Modal id="vapour-intrusion-criteria" show={visible} onHide={onClose} backdrop="static" centered>
        <Modal.Header closeButton>HSL Criteria</Modal.Header>

        <Modal.Body>
          <Row>
            <Col sm={3}>Soil Type</Col>
            <Col sm={5}>
              <SelectInput
                name="soilType"
                value={soilType}
                options={soilTypeOptions}
                onChange={(field, value) => setSoilType(value)}
              />
            </Col>
          </Row>

          <Row>
            <Col sm={3}>Water Depth</Col>
            <Col sm={5}>
              <SelectInput
                name="waterDepth"
                value={waterDepth}
                options={waterDepthOptions}
                onChange={(field, value) => setWaterDepth(value)}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={saveParameters}>
            Update sample parameters
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return render();
}

export default VapourIntrusionCriteriaDialog;
