import React, {useState, useEffect} from 'react';
import {Modal, Button, Row, Col} from 'components/bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import {find} from 'lodash';

import './duplicate-dialog.scss';

DuplicateSampleDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  samples: PropTypes.array.isRequired,
  selectedSampleId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function DuplicateSampleDialog({visible, samples, selectedSampleId, onClose, onSave}) {
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [options, setOptions] = useState([]);
  const [readyToRender, setReadyToRender] = useState(false);

  useEffect(() => {
    let selectedSample: any = null;
    const selectOptions: any = [];

    for (const sample of samples) {
      const sampleId = sample.labSampleId;

      if (sampleId === selectedSampleId) {
        selectedSample = sample;
        continue;
      }

      const label = getOptionLabel(sample);

      const option = {value: sampleId, label};

      selectOptions.push(option);
    }

    let selected = null;

    if (selectedSample && selectOptions) {
      selected = find(selectOptions, (opt) => {
        return opt.value === selectedSample.primarySampleId;
      });
    }

    setOptions(selectOptions);
    setSelectedOption(selected);
    setReadyToRender(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getOptionLabel = (sample) => {
    const depthTo = sample.depth.to;

    let depth = sample.depth.from;

    if (depthTo !== depth) {
      depth += ` - ${depthTo} m`;
    } else {
      depth += 'm';
    }

    const label = `${sample.labSampleId} (${sample.dpSampleId} / ${depth})`;

    return label;
  };

  const onChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  const save = () => {
    const value = selectedOption ? selectedOption.value : '';

    onSave(value);
  };

  if (!readyToRender) return null;

  return (
    <Modal id="duplicate-dialog" show={visible} onHide={onClose} backdrop="static" centered size="lg">
      <Modal.Header closeButton>Save</Modal.Header>

      <Modal.Body>
        <Row>
          <Col sm={2}>Primary Sample:</Col>
          <Col sm={6}>
            <Select
              value={selectedOption}
              isSearchable={true}
              isClearable={true}
              options={options}
              onChange={onChange}
            />
          </Col>
          <Col sm={4}>Lab ID (DP ID / Depth)</Col>
        </Row>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={save}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DuplicateSampleDialog;
