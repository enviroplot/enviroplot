import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {Form} from 'components/bootstrap';

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  onBlur: PropTypes.func,
  onKeyUp: PropTypes.func,
};

function TextInput({error, value, name, label, placeholder, disabled, autoFocus, onBlur, onKeyUp, onChange}) {
  const inputEl: any = useRef(null);

  useEffect(() => {
    if (autoFocus && inputEl) {
      setTimeout(() => {
        inputEl.current.focus();
      }, 0);
    }
  });

  const inputOnChange = (e) => {
    onChange(e.target.name, e.target.value);
  };

  const handleKeyUp = (e) => {
    const event: any = {};
    event.keyCode = e.keyCode || e.which;
    event.isEnter = event.keyCode === 13;
    event.isEscape = event.keyCode === 27;
    if (onKeyUp) onKeyUp(event);
  };

  return (
    <Form.Group>
      {label && <Form.Label htmlFor={name}>{label}</Form.Label>}

      <Form.Control
        type="text"
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        value={value ? value : ''}
        onChange={inputOnChange}
        onBlur={onBlur}
        onKeyUp={handleKeyUp}
        ref={inputEl}
      />

      {error && <div className="alert alert-danger">{error}</div>}
    </Form.Group>
  );
}

export default TextInput;
