import React, {useState, useEffect} from 'react';
import {Button, Tooltip, OverlayTrigger} from 'components/bootstrap';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {isEmpty} from 'lodash';

import {
  updateSoilTypeParameter,
  updateSelectionEdit,
  updateTripBlank,
  updateTripSpike,
  updateRinsate,
} from 'actions/sampleActions';
import {updateSessionBiodegradation, updateWaterAssessmentParameters} from 'actions/sessionActions';
import {confirmAction} from 'actions/commonActions';

import {getAllSamples} from 'reducers/sampleReducer';
import {getAppData} from 'reducers/index';

import {SELECT_SAMPLES_MODE} from 'constants/sampleModes';
import {
  PARAMETERS_UPDATED_MESSAGE,
  CONFIRM_TRIP_BLANK,
  CONFIRM_TRIP_SPIKE,
  CONFIRM_RINSATE,
} from 'constants/literals/messages';
import {SELECT_SAMPLES_FIRST} from 'constants/literals/tooltips';
import {Soil, Water} from 'constants/assessmentType';

import uiHelper from 'helpers/uiHelper';

import sessionService from 'services/sessionService';
import sampleService from 'services/sampleService';

import AppIcon from 'components/common/AppIcon';
import SoilTypesSection from './components/SoilTypesSection';
import QaqcSection from './components/QaqcSection';
import HslOptionsSection from './components/HslOptionsSection';
import GroundWaterSection from './components/GroundWaterSection';

SampleToolsSection.propTypes = {
  displayMode: PropTypes.string.isRequired,
  onDisplayModeChange: PropTypes.func.isRequired,
  onDepthModify: PropTypes.func.isRequired,
  onEilCalculatorClick: PropTypes.func.isRequired,
  onDuplicateSample: PropTypes.func.isRequired,
  onLevelProtectionClick: PropTypes.func.isRequired,
  onVapourIntrusionClick: PropTypes.func.isRequired,
  onResetSampleSelection: PropTypes.func.isRequired,
};

function SampleToolsSection({
  displayMode,
  onDisplayModeChange,
  onDepthModify,
  onEilCalculatorClick,
  onDuplicateSample,
  onLevelProtectionClick,
  onVapourIntrusionClick,
  onResetSampleSelection,
}) {
  const dispatch = useDispatch();

  const editSampleIds = useSelector((state: any) => state.sample.selection.edit);
  const reportSampleIds = useSelector((state: any) => state.sample.selection.report);
  const applyBiodegradation = useSelector((state: any) => state.session.applyBiodegradation);
  const project = useSelector((state: any) => state.session.project);
  const params = useSelector((state: any) => state.sample.parameters);
  const waterAssessmentParameters = useSelector((state: any) => state.session.waterAssessmentParameters);
  const samples = useSelector((state: any) => getAllSamples(state));
  const appData = useSelector((state: any) => getAppData(state));

  const [parameters, setParameters] = useState({});

  useEffect(() => {
    const isWaterAssessment = project && project.assessmentType === Water;

    if (!isWaterAssessment) return;

    if (isEmpty(editSampleIds)) {
      setParameters({...parameters});
      return;
    }

    const parametersObj =
      editSampleIds.length > 1
        ? sampleService.initParametersForMultipleSamples(params, editSampleIds)
        : params[editSampleIds[0]];

    setParameters(parametersObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSampleIds]);

  const changeSoilType = (soilType) => {
    dispatch(updateSoilTypeParameter(soilType));
    uiHelper.showSuccess(PARAMETERS_UPDATED_MESSAGE);
    clearSelection();
  };

  const changeTripBlank = (isTripBlank) => {
    if (!isTripBlank) {
      dispatch(updateTripBlank(isTripBlank));
      clearSelection();
      return;
    }

    dispatch(
      confirmAction({
        message: CONFIRM_TRIP_BLANK,
        action: () => {
          dispatch(updateTripBlank(isTripBlank));
          clearSelection();
        },
      })
    );
  };

  const changeTripSpike = (isTripSpike) => {
    if (!isTripSpike) {
      dispatch(updateTripSpike(isTripSpike));
      clearSelection();
      return;
    }

    dispatch(
      confirmAction({
        message: CONFIRM_TRIP_SPIKE,
        action: () => {
          dispatch(updateTripSpike(isTripSpike));
          clearSelection();
        },
      })
    );
  };

  const changeRinsate = (isRinsate) => {
    if (!isRinsate) {
      dispatch(updateRinsate(isRinsate));
      clearSelection();
      return;
    }

    dispatch(
      confirmAction({
        message: CONFIRM_RINSATE,
        action: () => {
          dispatch(updateRinsate(isRinsate));
          clearSelection();
        },
      })
    );
  };

  const isTripActive = (tripKey) => {
    if (isEmpty(editSampleIds)) return false;

    if (editSampleIds.length === 1) {
      const sample = samples[editSampleIds[0]];

      if (sample) return sample[tripKey];

      return false;
    }

    let isActive = true;

    for (const sampleId of editSampleIds) {
      const sample = samples[sampleId];

      if (sample && !sample[tripKey]) {
        isActive = false;
        break;
      }
    }

    return isActive;
  };

  const updateBiodegradation = () => {
    dispatch(updateSessionBiodegradation());
  };

  const updateWaterAssessmentParamter = (field, value) => {
    dispatch(updateWaterAssessmentParameters(field, value));
    uiHelper.showSuccess(PARAMETERS_UPDATED_MESSAGE);
  };

  const clearSelection = () => {
    dispatch(updateSelectionEdit([]));
  };

  const sampleToolsBtnTemplate = (btnName: string, forDisabled, forOnClick, forVariant?, forClassName?) => {
    return (
      <div>
        <Button
          disabled={forDisabled}
          onClick={forOnClick}
          variant={forVariant ? forVariant : 'link'}
          className={forClassName}>
          {btnName}
        </Button>
      </div>
    );
  };

  if (!project) return null;

  const isSoilAssessment = project.assessmentType === Soil;
  const isWaterAssessment = project.assessmentType === Water;

  const isChooseMode = displayMode === SELECT_SAMPLES_MODE;

  const btnDisabledGw = isEmpty(editSampleIds);

  const saveBtnDisabled = !Object.keys(samples).length;

  const btnDisabled = isChooseMode || isEmpty(editSampleIds);

  const duplicateBtnDisabled = btnDisabled || editSampleIds.length > 1;

  const resetBtnDisabled = reportSampleIds.length > 0;

  const tooltipDelay = {show: 250, hide: 400};
  const tooltip = <Tooltip id="modify-samples-parameters">{SELECT_SAMPLES_FIRST}</Tooltip>;

  return (
    <div className="bg-light tools">
      <div className="tile border-right">
        <div className="display-buttons">
          <Button variant="link" disabled={isChooseMode} onClick={onDisplayModeChange}>
            Choose and Order Samples
          </Button>
          <Button variant="link" disabled={!isChooseMode} onClick={onDisplayModeChange}>
            View Selection and Edit Parameters
          </Button>
          <Button variant="link" disabled={!resetBtnDisabled} onClick={onResetSampleSelection}>
            Reset Sample Selection
          </Button>
        </div>
        <div className="tile-title">Samples</div>
      </div>

      {isWaterAssessment && (
        <GroundWaterSection
          disabled={btnDisabledGw}
          waterAssessmentParameters={waterAssessmentParameters}
          specifySpeciesLevel={onLevelProtectionClick}
          specifyVapourIntrusion={onVapourIntrusionClick}
          updateWaterAssessmentParameter={updateWaterAssessmentParamter}
          btnTemplate={sampleToolsBtnTemplate}
        />
      )}

      {isSoilAssessment && <SoilTypesSection disabled={btnDisabled} changeSoilType={changeSoilType} />}

      {!isWaterAssessment && (
        <div className="tile border-right">
          <div className="display-buttons">
            {isSoilAssessment &&
              (btnDisabled ? (
                <div>
                  <OverlayTrigger placement="top-start" overlay={tooltip} delay={tooltipDelay} trigger="hover">
                    <div>{sampleToolsBtnTemplate('EIL Calculator', true, onEilCalculatorClick)}</div>
                  </OverlayTrigger>
                </div>
              ) : (
                sampleToolsBtnTemplate('EIL Calculator', false, onEilCalculatorClick)
              ))}

            {btnDisabled ? (
              <div>
                <OverlayTrigger placement="top-start" overlay={tooltip} delay={tooltipDelay} trigger="hover">
                  <div>{sampleToolsBtnTemplate('Modify Sample Depth', true, onDepthModify)}</div>
                </OverlayTrigger>
              </div>
            ) : (
              sampleToolsBtnTemplate('Modify Sample Depth', false, onDepthModify)
            )}
          </div>
          <div className="tile-title">Modify Samples Parameters</div>
        </div>
      )}

      <QaqcSection
        disabled={btnDisabled}
        duplicateDisabled={duplicateBtnDisabled}
        isTripActive={isTripActive}
        changeTripBlank={changeTripBlank}
        changeTripSpike={changeTripSpike}
        changeRinsate={changeRinsate}
        onDuplicateSample={onDuplicateSample}
        btnTemplate={sampleToolsBtnTemplate}
      />

      {false && (
        <HslOptionsSection applyBiodegradation={applyBiodegradation} updateBiodegradation={updateBiodegradation} />
      )}

      <div className="tile border-right">
        <Button
          disabled={saveBtnDisabled}
          variant="link"
          className="tile-icon"
          onClick={() => sessionService.saveSession(appData)}>
          <AppIcon name="save" size="3x" color="dodgerblue" />
          Save
        </Button>
      </div>
    </div>
  );
}

export default SampleToolsSection;
