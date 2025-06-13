import React from 'react';
import PropTypes from 'prop-types';
import {Button, Tooltip, OverlayTrigger} from 'components/bootstrap';
import {useSelector, useDispatch} from 'react-redux';
import {updateWaterAssessmentParameters} from 'actions/sessionActions';
import classnames from 'classnames';

import {GW_HSL_AB, GW_HSL_C, GW_HSL_D} from 'constants/groundwaterHslTypes';
import {PUHealth, PURecreation, PUIrrigationSTV, PUIrrigationLTV} from 'constants/criteriaTypes';
import {WQFresh, WQFreshPFAS, WQMarine, WQMarinePFAS} from 'constants/criteriaTypes';

import SelectInput from 'components/common/SelectInput';

GuidelinesSection.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const gwHslType = [
  {value: GW_HSL_AB, label: 'HSL A/B: Low-high Density Residential'},
  {value: GW_HSL_C, label: 'HSL C: Recreational / Open Space'},
  {value: GW_HSL_D, label: 'HSL D: Commercial / Industrial'},
];

const wqCirteria = [WQFresh, WQFreshPFAS, WQMarine, WQMarinePFAS];
function GuidelinesSection({disabled, onChange}) {
  const dispatch = useDispatch();
  function onUpdate(field, value) {
    onChange(field, value);
  }

  function onChangeHslCriteria(field, value) {
    dispatch(updateWaterAssessmentParameters('vapourIntrusionHsl', value));
    onChange(field, value);
  }

  const vapourIntrusionHsl =
    useSelector((state: any) => state.session?.waterAssessmentParameters?.vapourIntrusionHsl) || '';

  const criteria = useSelector((state: any) => state.session.criteria);

  function render() {
    const wqIsSelected = criteria.some((v) => wqCirteria.indexOf(v) !== -1);
    const waterQualityClass = classnames({
      selected: wqIsSelected,
    });

    function getSelection(criterionCode) {
      return classnames({
        selected: criteria.includes(criterionCode),
      });
    }

    const tooltipDelay = {show: 250, hide: 400};
    const HealthTooltip = <Tooltip id="modify-samples-parameters">Health Potential Use</Tooltip>;
    const RecreationTooltip = <Tooltip id="modify-samples-parameters">Recreation Potential Use</Tooltip>;
    const IrrigationLTVTooltip = (
      <Tooltip id="modify-samples-parameters">Irrigation Potential Use Long Term Trigger Values</Tooltip>
    );
    const IrrigationSTVTooltip = (
      <Tooltip id="modify-samples-parameters">Irrigation Potential Use Short Term Trigger Values</Tooltip>
    );

    return (
      <div className="tile border-right">
        <div className="guidelines-tools">
          <div className="potential-use">
            <div className="extra-title">Potential use</div>
            <div className="display-buttons">
              <div className="column">
                <div>
                  <OverlayTrigger placement="top-start" overlay={HealthTooltip} delay={tooltipDelay} trigger="hover">
                    <Button
                      variant="link"
                      className={getSelection(PUHealth)}
                      onClick={() => onUpdate('pu', PUHealth)}
                      disabled={disabled}>
                      Health
                    </Button>
                  </OverlayTrigger>
                </div>

                <div>
                  <OverlayTrigger
                    placement="top-start"
                    overlay={RecreationTooltip}
                    delay={tooltipDelay}
                    trigger="hover">
                    <Button
                      variant="link"
                      className={getSelection(PURecreation)}
                      onClick={() => onUpdate('pu', PURecreation)}
                      disabled={disabled}>
                      Recreation
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
              <div className="column">
                <div>
                  <OverlayTrigger
                    placement="top-start"
                    overlay={IrrigationLTVTooltip}
                    delay={tooltipDelay}
                    trigger="hover">
                    <Button
                      variant="link"
                      className={getSelection(PUIrrigationLTV)}
                      onClick={() => onUpdate('pu', PUIrrigationLTV)}
                      disabled={disabled}>
                      Irrigation LTV
                    </Button>
                  </OverlayTrigger>
                </div>

                <div>
                  <OverlayTrigger
                    placement="top-start"
                    overlay={IrrigationSTVTooltip}
                    delay={tooltipDelay}
                    trigger="hover">
                    <Button
                      variant="link"
                      className={getSelection(PUIrrigationSTV)}
                      onClick={() => onUpdate('pu', PUIrrigationSTV)}
                      disabled={disabled}>
                      Irrigation STV
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
          </div>
          <div className="display-buttons">
            <Button
              variant="link"
              className={waterQualityClass}
              onClick={() => onChange('wq', !wqIsSelected)}
              disabled={disabled}>
              Fresh/Marine Water Quality
            </Button>
            <div className="criteria-tile">
              <SelectInput
                name="vi"
                label="HSL Criteria"
                value={vapourIntrusionHsl}
                disabled={disabled}
                options={gwHslType}
                onChange={(field, value) => onChangeHslCriteria(field, value)}
              />
            </div>
          </div>
        </div>
        <div className="tile-title">Apply Guidelines</div>
      </div>
    );
  }

  return render();
}

export default GuidelinesSection;
