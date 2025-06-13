import React from 'react';
import {Form} from 'components/bootstrap';
import PropTypes from 'prop-types';

import {ECO} from 'constants/criteriaTypes';

SelectInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.any,
  disabled: PropTypes.bool,
  defaultOption: PropTypes.string,
  hideDefaultOption: PropTypes.bool,
  options: PropTypes.array,
  tooltips: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

function SelectInput({
  name,
  label,
  value,
  options,
  defaultOption,
  disabled,
  onChange,
  error,
  tooltips,
  hideDefaultOption,
}) {
  const inputOnChange = (event) => {
    onChange(name, event.target.value);
  };

  const showTooltips = tooltips ? true : false;

  const showDefaultOption = hideDefaultOption && value ? false : true;

  const renderOption = (option) => {
    const key = option.value;
    const disabled = option.disabled ? true : false;

    return (
      <option key={key} value={key} disabled={disabled}>
        {option.label}
      </option>
    );
  };

  const renderOptionWithTooltip = (option, tooltips) => {
    const key = option.value;
    let eilEslTooltipTitle = '';
    let restTooltipTitle = '';

    for (const keyItem in tooltips) {
      if (ECO + keyItem.slice(-3) === key) {
        eilEslTooltipTitle = tooltips[keyItem];
      } else {
        restTooltipTitle = tooltips[key];
      }
    }

    const disabled = option.disabled ? true : false;

    const tooltipTitle = restTooltipTitle ? restTooltipTitle : eilEslTooltipTitle;

    return (
      <option key={key} value={key} disabled={disabled} title={tooltipTitle}>
        {option.label}
      </option>
    );
  };

  return (
    <Form.Group>
      {label && <Form.Label htmlFor={name}>{label}</Form.Label>}

      <Form.Control as="select" name={name} value={value} onChange={inputOnChange} disabled={disabled}>
        {showDefaultOption && <option value="">{defaultOption ? defaultOption : ''}</option>}

        {options.map((option) => {
          if (showTooltips) return renderOptionWithTooltip(option, tooltips);

          return renderOption(option);
        })}
      </Form.Control>

      {error && <div className="alert alert-danger">{error}</div>}
    </Form.Group>
  );
}

export default SelectInput;
