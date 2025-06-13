import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {intersection, isEmpty} from 'lodash';

import criteriaService from 'services/criteriaService';

import SelectInput from 'components/common/SelectInput';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

const INPUT_EGV_NAME = 'egv';

CriteriaSelection.propTypes = {
  criteria: PropTypes.array.isRequired,
  criteriaInfo: PropTypes.array.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  isPfasSelected: PropTypes.bool,
};

function CriteriaSelection({criteria, criteriaInfo, disabled, isPfasSelected, onChange}) {
  const hilOptions = criteriaService.getHilOptions();
  const hslOptions = criteriaService.getHslOptions();
  const egvIndirOptions = criteriaService.getEgvOptions(criteria);
  const eilEslOptions = criteriaService.getEilEslOptions();
  const managementOptions = criteriaService.getMLOptions();
  const directContactOptions = criteriaService.getDirectContactOptions();

  const [criteriaTooltips, setCriteriaTooltips] = useState({});

  const currentSelectedCriteria: string[] = useSelector((state: any) => state.session.criteria);

  useEffect(() => {
    const criteriaTooltips = {};

    for (const criterion of criteriaInfo) {
      criteriaTooltips[criterion.code] = criterion.name;
    }

    setCriteriaTooltips(criteriaTooltips);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriaInfo]);

  const hil = criteriaService.getSelectedOption(hilOptions, criteria);
  const hsl = criteriaService.getSelectedOption(hslOptions, criteria);

  const egv = criteriaService.getSelectedOption(egvIndirOptions, criteria);
  dispatchEGVCriterionOnReset();

  const eilEsl = criteriaService.getSelectedOptionEilEsl(criteria);
  const ml = criteriaService.getSelectedOption(managementOptions, criteria);
  const dc = criteriaService.getSelectedOption(directContactOptions, criteria);

  const tooltipDelay = {show: 250, hide: 400};
  const tooltipML = <Tooltip id="management-limits">Management limits</Tooltip>;
  const tooltipDC = <Tooltip id="direct-contact">Direct contact</Tooltip>;

  // if EGV current (store) value is unavailable in the options - dispatch reset
  function dispatchEGVCriterionOnReset(): void {
    const isEGVCriterionInStore = currentSelectedCriteria.find((el) => el.includes('EGV-'));

    if (isEGVCriterionInStore) {
      const availableEgvOptions = intersection(
        egvIndirOptions.map((el) => el.value),
        currentSelectedCriteria
      );

      if (isEmpty(availableEgvOptions)) {
        onChange(INPUT_EGV_NAME, egv);
      }
    }
  }

  return (
    <>
      <div className="tile border-right">
        <div className="criteria-tile">
          <SelectInput
            name="hil"
            label="HIL"
            value={hil}
            disabled={disabled}
            options={hilOptions}
            tooltips={criteriaTooltips}
            onChange={onChange}
          />
          <SelectInput
            name="hsl"
            label="HSL"
            value={hsl}
            disabled={disabled}
            options={hslOptions}
            tooltips={criteriaTooltips}
            onChange={onChange}
          />
        </div>

        <div className="tile-title">Health Criteria</div>
      </div>
      <div className="tile border-right">
        <div className="criteria-tile">
          <SelectInput
            name="eilEsl"
            label="EIL&ESL"
            value={eilEsl}
            disabled={disabled}
            options={eilEslOptions}
            tooltips={criteriaTooltips}
            onChange={onChange}
          />
        </div>

        <div className="tile-title">Ecological Criteria</div>
      </div>
      {isPfasSelected && (
        <div className="tile border-right">
          <div className="criteria-tile">
            <SelectInput
              name={INPUT_EGV_NAME}
              label="PFAS EGV"
              value={egv}
              disabled={disabled}
              options={egvIndirOptions}
              tooltips={criteriaTooltips}
              onChange={onChange}
            />
          </div>

          <div className="tile-title">EGV Criteria</div>
        </div>
      )}
      <div className="tile border-right">
        <div className="criteria-tile">
          <SelectInput
            name="ml"
            label="ML"
            value={ml}
            disabled={disabled}
            options={managementOptions}
            tooltips={criteriaTooltips}
            onChange={onChange}
          />
        </div>
        <div>
          <OverlayTrigger placement="top-start" overlay={tooltipML} delay={tooltipDelay}>
            <div className="tile-title">ML</div>
          </OverlayTrigger>
        </div>
      </div>
      <div className="tile border-right">
        <div className="criteria-tile">
          <SelectInput
            name="dc"
            label="DC"
            value={dc}
            disabled={disabled}
            options={directContactOptions}
            tooltips={criteriaTooltips}
            onChange={onChange}
          />
        </div>
        <div>
          <OverlayTrigger placement="top-start" overlay={tooltipDC} delay={tooltipDelay}>
            <div className="tile-title">DC</div>
          </OverlayTrigger>
        </div>
      </div>
    </>
  );
}

export default CriteriaSelection;
