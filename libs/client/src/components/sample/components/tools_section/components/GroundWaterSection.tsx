import React from 'react';
import PropTypes from 'prop-types';
import {OverlayTrigger, Tooltip} from 'components/bootstrap';

import {FRESHWATER_ENV, MARINE_ENV, BOTH_ENV} from 'constants/waterEnvironments';

import SelectInput from 'components/common/SelectInput';
import {SELECT_SAMPLES_FIRST} from 'constants/literals/tooltips';

GroundWaterSection.propTypes = {
  disabled: PropTypes.bool.isRequired,
  waterAssessmentParameters: PropTypes.object.isRequired,
  specifySpeciesLevel: PropTypes.func.isRequired,
  btnTemplate: PropTypes.func.isRequired,
  specifyVapourIntrusion: PropTypes.func.isRequired,
  updateWaterAssessmentParameter: PropTypes.func.isRequired,
};

function GroundWaterSection({
  disabled,
  waterAssessmentParameters,
  specifySpeciesLevel,
  specifyVapourIntrusion,
  updateWaterAssessmentParameter,
  btnTemplate,
}) {
  const waterEnvOptions = [
    {value: FRESHWATER_ENV, label: FRESHWATER_ENV},
    {value: MARINE_ENV, label: MARINE_ENV},
    {value: BOTH_ENV, label: BOTH_ENV},
  ];

  const levelOfProtectionDisabled = disabled || !waterAssessmentParameters.waterEnvironment;

  const tooltipDelay = {show: 250, hide: 400};
  const tooltip = <Tooltip id="modify-samples-parameters">{SELECT_SAMPLES_FIRST}</Tooltip>;

  return (
    <div className="tile border-right">
      <div className="display-buttons">
        <SelectInput
          name="waterEnvironment"
          label="Water Environment"
          value={waterAssessmentParameters.waterEnvironment}
          disabled={disabled}
          options={waterEnvOptions}
          onChange={updateWaterAssessmentParameter}
        />

        {levelOfProtectionDisabled ? (
          <OverlayTrigger placement="top-start" overlay={tooltip} delay={tooltipDelay} trigger="hover">
            <div>{btnTemplate('Species Level of Protection', true, specifySpeciesLevel)}</div>
          </OverlayTrigger>
        ) : (
          btnTemplate('Species Level of Protection', false, specifySpeciesLevel)
        )}

        {disabled ? (
          <OverlayTrigger placement="top-start" overlay={tooltip} delay={tooltipDelay} trigger="hover">
            <div>{btnTemplate('Vapour Intrusion - HSL Criteria', true, specifyVapourIntrusion)}</div>
          </OverlayTrigger>
        ) : (
          btnTemplate('Vapour Intrusion - HSL Criteria', false, specifyVapourIntrusion)
        )}
      </div>
      <div className="tile-title">Groundwater Assessment Criteria</div>
    </div>
  );
}

export default GroundWaterSection;
