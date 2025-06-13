import React from 'react';
import PropTypes from 'prop-types';
import {OverlayTrigger, Tooltip} from 'components/bootstrap';
import classnames from 'classnames';
import {SELECT_SAMPLES_FIRST} from 'constants/literals/tooltips';

QaqcSection.propTypes = {
  disabled: PropTypes.bool.isRequired,
  duplicateDisabled: PropTypes.bool.isRequired,
  isTripActive: PropTypes.func.isRequired,
  changeTripBlank: PropTypes.func.isRequired,
  changeTripSpike: PropTypes.func.isRequired,
  changeRinsate: PropTypes.func.isRequired,
  onDuplicateSample: PropTypes.func.isRequired,
  btnTemplate: PropTypes.func.isRequired,
};

function QaqcSection({
  disabled,
  duplicateDisabled,
  isTripActive,
  changeTripBlank,
  changeTripSpike,
  changeRinsate,
  onDuplicateSample,
  btnTemplate,
}) {
  const isTripBlank = isTripActive('isTripBlank');
  const isTripSpike = isTripActive('isTripSpike');
  const isRinsate = isTripActive('isRinsate');

  const tripBlankClass = classnames({
    selected: isTripBlank,
  });

  const tripSpikeClass = classnames({
    selected: isTripSpike,
  });

  const rinsateClass = classnames({
    selected: isRinsate,
  });

  const tooltipDelay = {show: 250, hide: 400};
  const tooltipMSP = <Tooltip id="modify-samples-parameters">{SELECT_SAMPLES_FIRST}</Tooltip>;

  return (
    <div className="tile border-right">
      <div className="display-buttons">
        {duplicateDisabled ? (
          <div>
            <OverlayTrigger placement="top-start" overlay={tooltipMSP} delay={tooltipDelay} trigger="hover">
              <div>{btnTemplate('Select Field Duplicate', true, onDuplicateSample)}</div>
            </OverlayTrigger>
          </div>
        ) : (
          btnTemplate('Select Field Duplicate', false, onDuplicateSample)
        )}

        {disabled ? (
          <div>
            <OverlayTrigger placement="top-start" overlay={tooltipMSP} delay={tooltipDelay} trigger="hover">
              <div>
                {btnTemplate('Select Trip Blank', true, () => changeTripBlank(!isTripBlank), 'link', tripBlankClass)}
              </div>
            </OverlayTrigger>
          </div>
        ) : (
          btnTemplate('Select Trip Blank', false, () => changeTripBlank(!isTripBlank), 'link', tripBlankClass)
        )}

        {disabled ? (
          <div>
            <OverlayTrigger placement="top-start" overlay={tooltipMSP} delay={tooltipDelay} trigger="hover">
              <div>
                {btnTemplate('Select Trip Spike', true, () => changeTripSpike(!isTripSpike), 'link', tripSpikeClass)}
              </div>
            </OverlayTrigger>
          </div>
        ) : (
          btnTemplate('Select Trip Spike', false, () => changeTripSpike(!isTripSpike), 'link', tripSpikeClass)
        )}

        {disabled ? (
          <div>
            <OverlayTrigger placement="top-start" overlay={tooltipMSP} delay={tooltipDelay} trigger="hover">
              <div>{btnTemplate('Select Rinsate', true, () => changeRinsate(!isRinsate), 'link', rinsateClass)}</div>
            </OverlayTrigger>
          </div>
        ) : (
          btnTemplate('Select Rinsate', false, () => changeRinsate(!isRinsate), 'link', rinsateClass)
        )}
      </div>

      <div className="tile-title">Assign QAQC</div>
    </div>
  );
}

export default QaqcSection;
