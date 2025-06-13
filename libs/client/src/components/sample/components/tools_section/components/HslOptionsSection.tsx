import React from 'react';
import PropTypes from 'prop-types';
import {Button, OverlayTrigger, Tooltip} from 'components/bootstrap';
import classnames from 'classnames';

import {FUTURE_FEATURE} from 'constants/literals/tooltips';

HslOptionsSection.propTypes = {
  applyBiodegradation: PropTypes.bool.isRequired,
  updateBiodegradation: PropTypes.func.isRequired,
};

function HslOptionsSection({applyBiodegradation, updateBiodegradation}) {
  const temporaryDisabled = true; //TODO remove if not used

  const biodegradationClass = classnames({
    selected: applyBiodegradation,
  });

  const tooltipDelay = {show: 250, hide: 400};
  const tooltip = <Tooltip id="future-feature">{FUTURE_FEATURE}</Tooltip>;

  return (
    <div className="tile border-right">
      <div className="display-buttons">
        <OverlayTrigger placement="top-start" delay={tooltipDelay} overlay={tooltip}>
          <span>
            <Button variant="link" disabled={temporaryDisabled}>
              Apply Proposed Excavation Depth
            </Button>
          </span>
        </OverlayTrigger>
        <OverlayTrigger placement="top-start" delay={tooltipDelay} overlay={tooltip}>
          <span>
            <Button
              variant="link"
              className={biodegradationClass}
              disabled={temporaryDisabled}
              onClick={updateBiodegradation}>
              Apply Biodegradation
            </Button>
          </span>
        </OverlayTrigger>
      </div>

      <div className="tile-title">HSL Options</div>
    </div>
  );
}

export default HslOptionsSection;
