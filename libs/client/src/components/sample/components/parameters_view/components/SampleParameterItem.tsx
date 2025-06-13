import React from 'react';
import PropTypes from 'prop-types';
import {Form} from 'components/bootstrap';
import classnames from 'classnames';
import {find} from 'lodash';

import * as speciesProtectionLevels from 'constants/speciesProtectionLevels';

import formatHelper from 'helpers/formatHelper';

SampleParameterItem.propTypes = {
  sample: PropTypes.object.isRequired,
  editSampleIds: PropTypes.array.isRequired,
  parameters: PropTypes.object.isRequired,
  isSoilAssessment: PropTypes.bool.isRequired,
  isWaterAssessment: PropTypes.bool.isRequired,
  selectSample: PropTypes.func.isRequired,
  waterAssessmentParameters: PropTypes.object.isRequired,
};

function SampleParameterItem({
  sample,
  editSampleIds,
  parameters,
  isSoilAssessment,
  isWaterAssessment,
  selectSample,
  waterAssessmentParameters,
}) {
  const renderParameter = (parameter) => {
    const parameterClass = classnames({
      [parameter.type]: true,
    });

    const value = formatHelper.displayTwoDecimalPlaces(parameter.value);

    return <td className={parameterClass}>{value}</td>;
  };

  const renderSoilRows = (sampleParameters) => {
    const displayExcavationDepth = formatHelper.displayTwoDecimalPlaces(sampleParameters.excavationDepth);
    const displayMbc = sampleParameters.mbc ? Number(sampleParameters.mbc) : '';

    return (
      <>
        <td>{displayExcavationDepth}</td>
        <td>{sampleParameters.soilType}</td>
        <td>{sampleParameters.soilTexture}</td>
        {renderParameter(sampleParameters.ph)}
        {renderParameter(sampleParameters.cec)}
        {renderParameter(sampleParameters.clayContent)}
        <td>{displayMbc}</td>
        <td>{sampleParameters.contaminationType}</td>
        <td>{sampleParameters.state}</td>
        <td>{sampleParameters.trafficVolume}</td>
        {renderParameter(sampleParameters.ironContent)}
        {renderParameter(sampleParameters.organicCarbon)}
      </>
    );
  };

  const renderWaterRows = () => {
    const displayLevelOfProtection = (value) => {
      if (!waterAssessmentParameters.waterEnvironment) return '';

      switch (value) {
        case speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_80:
          return '80%';
        case speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_90:
          return '90%';
        case speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_95:
          return '95%';
        case speciesProtectionLevels.SPECIES_PROTECTION_LEVEL_99:
          return '99%';
        default:
          return '';
      }
    };

    const levelOfProtection = waterAssessmentParameters.levelOfProtection;

    return (
      <>
        <td>{waterAssessmentParameters.waterEnvironment}</td>
        <td>{displayLevelOfProtection(levelOfProtection.bioAccumulative)}</td>
        <td>{displayLevelOfProtection(levelOfProtection.pfas)}</td>
        <td>{displayLevelOfProtection(levelOfProtection.others)}</td>
        <td>{waterAssessmentParameters.potentialUse}</td>
      </>
    );
  };

  function render() {
    const labSampleId = sample.labSampleId;

    const sampleParameters = parameters[labSampleId];
    let depthTo,
      depthFrom = '-';

    if (sample && sample.depth) {
      if (sample.depth.to || sample.depth.to === 0) depthTo = sample.depth.to;
      if (sample.depth.from || sample.depth.from === 0) depthFrom = sample.depth.from;
    }

    const displayDepthFrom = formatHelper.displayDepth(depthFrom);
    const displayDepthTo = formatHelper.displayDepth(depthTo);

    const isCheckedSample = find(editSampleIds, (sampleId) => {
      return sampleId === labSampleId;
    });

    const isChecked = isCheckedSample ? true : false;

    const sampleClass = classnames({
      selected: isChecked,
    });

    const tripRinsateClass = classnames({
      tripRinsate: sample.isTripBlank || sample.isTripSpike || sample.isRinsate || sample.primarySampleId,
    });

    return (
      <tr className={sampleClass} onClick={() => selectSample(labSampleId)}>
        <td className="indent" />
        <td className="td-check">
          <Form.Check type="checkbox" checked={isChecked} onChange={() => null} />
        </td>
        <td className={tripRinsateClass}>{labSampleId}</td>
        <td className={tripRinsateClass}>{sample.dpSampleId}</td>

        {!isWaterAssessment && (
          <>
            <td>{displayDepthFrom}</td>
            <td>{displayDepthTo}</td>
          </>
        )}

        {isSoilAssessment && renderSoilRows(sampleParameters)}
        {isWaterAssessment && renderWaterRows()}
      </tr>
    );
  }

  return render();
}

export default SampleParameterItem;
