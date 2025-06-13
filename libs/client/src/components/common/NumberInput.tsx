import React from 'react';
import PropTypes from 'prop-types';
import {Form} from 'components/bootstrap';

NumberInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  tooltip: PropTypes.string,
};

function NumberInput({error, value, name, label, placeholder, disabled, min, max, onChange, tooltip}) {
  if (!value && value !== 0) value = '';

  const minValue = min ? min : 0;
  const maxValue = max ? max : 50;

  const inputOnChange = (e) => {
    const targetName = e.target.name;
    let targetValue = e.target.value;

    if (targetValue) {
      targetValue = Number(targetValue);

      if (targetValue < minValue) targetValue = minValue;
      if (targetValue > maxValue) targetValue = maxValue;
    }

    onChange(targetName, targetValue);
  };

  const inputOnBlur = (e) => {
    const targetName = e.target.name;
    let targetValue = e.target.value;

    if (targetValue) {
      targetValue = Number(targetValue).toFixed(2);
      onChange(targetName, targetValue);
    }
  };

  return (
    <Form.Group>
      {label && <Form.Label htmlFor={name}>{label}</Form.Label>}

      <Form.Control
        type="number"
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        min={minValue}
        max={maxValue}
        onChange={inputOnChange}
        onBlur={inputOnBlur}
        title={tooltip ? tooltip : ''}
      />

      {error && <div className="alert alert-danger">{error}</div>}
    </Form.Group>
  );
}

export default NumberInput;
