import React from 'react';
import PropTypes from 'prop-types';

import resultService from 'services/resultService';

import extras from '../extras';

SampleCell.propTypes = {
  cellItem: PropTypes.object.isRequired,
  highlightAllDetections: PropTypes.bool.isRequired,
};

function SampleCell({cellItem, highlightAllDetections}) {
  let displayValue = resultService.displayPreviewValue(cellItem.value, cellItem.prefix);

  if (displayValue === null || ['ND', 'NT', 'NaN'].includes(displayValue)) {
    displayValue = '-';
  }
  const displayOptions = cellItem.displayOptions;

  let isHighlighted = false;

  if (highlightAllDetections) {
    isHighlighted = cellItem.highlightDetection;
  }

  const cellClass = extras.getCellClassByDisplayOptions('sample-cell', displayOptions, isHighlighted);

  return <td className={cellClass}>{displayValue}</td>;
}

export default SampleCell;
