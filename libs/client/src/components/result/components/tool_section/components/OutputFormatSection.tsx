import React from 'react';
import PropTypes from 'prop-types';
import {useSelector, useDispatch} from 'react-redux';

import {updateOutputFormat} from 'actions/sessionActions';

import {STANDARD_OUTPUT_FORMAT, TRANSPOSED_OUTPUT_FORMAT} from 'constants/outputFormats';

import SelectInput from 'components/common/SelectInput';

OutputFormatSection.propTypes = {
  disabled: PropTypes.bool.isRequired,
};

function OutputFormatSection({disabled}) {
  const dispatch = useDispatch();

  const outputFormat = useSelector((state: any) => state.session.outputFormat);

  const outputFormatOptions = [
    {value: STANDARD_OUTPUT_FORMAT, label: STANDARD_OUTPUT_FORMAT},
    {value: TRANSPOSED_OUTPUT_FORMAT, label: TRANSPOSED_OUTPUT_FORMAT},
  ];

  return (
    <div className="tile border-right">
      <div className="display-buttons criteria-tile">
        <SelectInput
          name="outputFormat"
          label="Output Format"
          value={outputFormat}
          disabled={disabled}
          options={outputFormatOptions}
          onChange={(field, value) => dispatch(updateOutputFormat(value))}
        />
      </div>
    </div>
  );
}

export default OutputFormatSection;
