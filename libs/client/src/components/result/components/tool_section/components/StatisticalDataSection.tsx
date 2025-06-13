import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'components/bootstrap';
import classnames from 'classnames';

StatisticalDataSection.propTypes = {
  wasteStatistics: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  updateStatistics: PropTypes.func.isRequired,
};

function StatisticalDataSection({wasteStatistics, disabled, updateStatistics}) {
  const onUpdate = (field) => {
    const value = !wasteStatistics[field];

    updateStatistics(field, value);
  };

  const calculateSummaryStatClass = classnames({
    selected: wasteStatistics?.calculateSummaryStatistics || '',
  });

  const statisticalInformationClass = classnames({
    selected: wasteStatistics?.statisticalInfoForContaminants || '',
  });

  return (
    <div className="tile border-right">
      <div className="display-buttons">
        <Button
          variant="link"
          disabled={disabled}
          className={calculateSummaryStatClass}
          onClick={() => onUpdate('calculateSummaryStatistics')}>
          Calculate Summary Statistics
        </Button>

        <Button
          variant="link"
          disabled={disabled}
          className={statisticalInformationClass}
          onClick={() => onUpdate('statisticalInfoForContaminants')}>
          Input Std. Deviation and 95% UCL
        </Button>
      </div>
      <div className="tile-title">Statistical data</div>
    </div>
  );
}

export default StatisticalDataSection;
