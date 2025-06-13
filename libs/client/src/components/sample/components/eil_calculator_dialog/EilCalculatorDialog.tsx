import React, {useState, useEffect} from 'react';
import {Modal, Button, Row, Col, Form} from 'components/bootstrap';
import PropTypes from 'prop-types';
import {upperFirst} from 'lodash';

import {ASSUMED_TYPE, PRESUMED_TYPE, MEASURED_TYPE} from 'constants/parameterValueTypes';
import {AGED_CONTAMINATION_TYPE, FRESH_CONTAMINATION_TYPE} from 'constants/eilContaminationTypes';
import {NSW_STATE, QLD_STATE, VIC_STATE, SA_STATE} from 'constants/states';
import {LOW_TRAFFIC_VOLUME, HIGH_TRAFFIC_VOLUME} from 'constants/eilTrafficVolumeTypes';

import {LEAVE_BLANK_TOOLTIP} from 'constants/literals/tooltips';

import helper from 'helpers/reactHelper';

import sampleService from 'services/sampleService';

import NumberInput from 'components/common/NumberInput';
import SelectInput from 'components/common/SelectInput';

import './eil-calculator.scss';

EilCalculatorDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  editSampleIds: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function EilCalculatorDialog({visible, params, editSampleIds, onClose, onSave}) {
  const valueTypes = [
    {value: ASSUMED_TYPE, label: upperFirst(ASSUMED_TYPE)},
    {value: PRESUMED_TYPE, label: upperFirst(PRESUMED_TYPE)},
    {value: MEASURED_TYPE, label: upperFirst(MEASURED_TYPE)},
  ];

  const contaminationTypes = [
    {value: FRESH_CONTAMINATION_TYPE, label: FRESH_CONTAMINATION_TYPE},
    {value: AGED_CONTAMINATION_TYPE, label: AGED_CONTAMINATION_TYPE},
  ];

  const states = [
    {value: NSW_STATE, label: NSW_STATE},
    {value: VIC_STATE, label: VIC_STATE},
    {value: QLD_STATE, label: QLD_STATE},
    {value: SA_STATE, label: SA_STATE},
  ];

  const trafficVolumeTypes = [
    {value: LOW_TRAFFIC_VOLUME, label: LOW_TRAFFIC_VOLUME},
    {value: HIGH_TRAFFIC_VOLUME, label: HIGH_TRAFFIC_VOLUME},
  ];

  const [parameters, setParameters] = useState({
    cec: {value: '', type: ASSUMED_TYPE},
    ph: {value: '', type: ASSUMED_TYPE},
    clayContent: {value: '', type: ASSUMED_TYPE},
    organicCarbon: {value: '', type: ASSUMED_TYPE},
    contaminationType: '',
    mbc: '',
    state: '',
    trafficVolume: '',
    ironContent: {value: '', type: ASSUMED_TYPE},
  });
  const [initialParameters, setInitialParameters] = useState(null);

  useEffect(() => {
    const parametersObj =
      editSampleIds.length > 1
        ? sampleService.initParametersForMultipleSamples(params, editSampleIds)
        : params[editSampleIds[0]];

    setParameters(parametersObj);
    setInitialParameters(parametersObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onValueChange = (name, value) => {
    const parameter = {...parameters[name]};
    parameter.value = value;

    setParameters({...parameters, [name]: parameter});
  };

  const onValueTypeChange = (name, value) => {
    const parameter = {...parameters[name]};
    parameter.type = value;

    setParameters({...parameters, [name]: parameter});
  };

  const onParamChange = (name, value) => {
    setParameters({...parameters, [name]: value});
  };

  const saveParameters = () => {
    const diff = helper.objectDiff(parameters, initialParameters);

    onSave(diff);
  };

  const renderParameterRow = (name, label, max: any = null) => {
    const parameter = parameters[name];

    return (
      <Row>
        <Col sm={5}>
          <Form.Label>{label}:</Form.Label>
        </Col>
        <Col sm={3}>
          <NumberInput key={name} name={name} max={max} value={parameter.value} onChange={onValueChange} />
        </Col>
        <Col sm={4}>
          <SelectInput
            key={name}
            name={name}
            value={parameter.type}
            options={valueTypes}
            onChange={onValueTypeChange}
          />
        </Col>
      </Row>
    );
  };

  const renderContaminationRow = (name, label, list) => {
    return (
      <Row>
        <Col sm={5}>
          <Form.Label>{label}:</Form.Label>
        </Col>
        <Col sm={3}>
          <SelectInput name={name} value={parameters[name]} options={list} onChange={onParamChange} />
        </Col>
      </Row>
    );
  };

  return (
    <Modal id="eil-calculator" show={visible} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>EIL Calculator</Modal.Header>

      <Modal.Body>
        <div className="title">Calculation of ACL</div>

        {renderParameterRow('cec', 'CEC (cmolc/kg)', 100)}
        {renderParameterRow('ph', 'pH')}
        {renderParameterRow('clayContent', 'Clay Content (%)', 10)}
        {renderParameterRow('organicCarbon', 'Organic Carbon (%)', 100)}

        <div className="title">Calculation of ABC</div>

        {renderContaminationRow('contaminationType', 'Contamination Type', contaminationTypes)}

        <div hidden>
          <div className="subtitle">For Aged and Fresh contamination</div>

          <Row>
            <Col sm={5}>
              <Form.Label>MB Concentration (mg/kg):</Form.Label>
            </Col>
            <Col sm={3}>
              <NumberInput name="mbc" value={parameters.mbc} onChange={onParamChange} tooltip={LEAVE_BLANK_TOOLTIP} />
            </Col>
          </Row>
        </div>
        <div className="subtitle">For Aged contamination</div>

        {renderContaminationRow('state', 'State', states)}
        {renderContaminationRow('trafficVolume', 'Traffic Volume', trafficVolumeTypes)}

        <div className="subtitle">For Fresh contamination</div>

        {renderParameterRow('ironContent', 'Iron Content (%)')}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={saveParameters}>
          Update sample parameters
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EilCalculatorDialog;
