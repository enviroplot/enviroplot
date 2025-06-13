import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'components/bootstrap';

import {SAND_SOIL_TYPE, SILT_SOIL_TYPE, CLAY_SOIL_TYPE} from 'constants/hslSoilTypes';

import AppIcon from 'components/common/AppIcon';

SoilTypesSection.propTypes = {
  disabled: PropTypes.bool.isRequired,
  changeSoilType: PropTypes.func.isRequired,
};

function SoilTypesSection({disabled, changeSoilType}) {
  return (
    <div className="tile border-right">
      <div className="display-buttons">
        <Button variant="link" disabled={disabled} onClick={() => changeSoilType(CLAY_SOIL_TYPE)}>
          <AppIcon name="silt" size="3x" color="grey" />
          Clay
        </Button>
        <Button variant="link" disabled={disabled} onClick={() => changeSoilType(SAND_SOIL_TYPE)}>
          <AppIcon name="sand" size="3x" color="grey" />
          Sand
        </Button>
        <Button variant="link" disabled={disabled} onClick={() => changeSoilType(SILT_SOIL_TYPE)}>
          <AppIcon name="silt" size="3x" rotation={90} color="grey" />
          Silt
        </Button>
      </div>
      <div className="tile-title">Change Soil Type</div>
    </div>
  );
}

export default SoilTypesSection;
