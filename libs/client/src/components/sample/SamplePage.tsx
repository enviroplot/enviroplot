import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {find, isEmpty} from 'lodash';

import {
  updateSelectionReport,
  updateSampleDepth,
  updateSelectionEdit,
  updateParameters,
  updateSampleDuplicate,
  changeSortOrder,
  updateSampleOrder,
  resetSamples,
} from 'actions/sampleActions';
import {confirmAction} from 'actions/commonActions';
import {updateWaterAssessmentParameters} from 'actions/sessionActions';

import {getAllSamples, getReportSamples, getEditSamples} from 'reducers/sampleReducer';

import uiHelper from 'helpers/uiHelper';
import formatHelper from 'helpers/formatHelper';
import shortcutsService from 'services/shortcutsService';
import sampleService from 'services/sampleService';

import extras from './extras';

import {SELECT_SAMPLES_MODE, VIEW_SAMPLES_MODE} from 'constants/sampleModes';
import {PARAMETERS_UPDATED_MESSAGE} from 'constants/literals/messages';
import {EIL_AES, EIL_C_IND, EIL_UR_POS} from 'constants/criteriaTypes';
import {CRITERIA_REQUIRED_PARAMETERS_ARE_MISSING} from 'constants/literals/errors';

import SampleToolsSection from './components/tools_section/SampleToolsSection';
import SampleList from './components/SampleList';
import SampleParametersView from './components/parameters_view/SampleParametersView';
import DepthDialog from './components/depth_dialog/DepthDialog';
import EilCalculatorDialog from './components/eil_calculator_dialog/EilCalculatorDialog';
import DuplicateSampleDialog from './components/duplicate_dialog/DuplicateSampleDialog';
import SpeciesLevelProtectionDialog from './components/species_level_protection_dialog/SpeciesLevelProtectionDialog';
import VapourIntrusionCriteriaDialog from './components/vapour_intrusion_dialog/VapourIntrusionCriteriaDialog';

import './sample-page.scss';

function SamplePage() {
  const dispatch = useDispatch();

  const reportSampleIds = useSelector((state: any) => state.sample.selection.report);
  const editSampleIds = useSelector((state: any) => state.sample.selection.edit);
  const parameters = useSelector((state: any) => state.sample.parameters);
  const sort = useSelector((state: any) => state.sample.sort);
  const criteria = useSelector((state: any) => state.session.criteria);
  const project = useSelector((state: any) => state.session.project);
  const waterAssessmentParameters = useSelector((state: any) => state.session.waterAssessmentParameters);
  const samples = useSelector((state: any) => getAllSamples(state));
  const reportSamples = useSelector((state: any) => getReportSamples(state));
  const editSamples = useSelector((state: any) => getEditSamples(state));

  const [displayMode, setDisplayMode] = useState(SELECT_SAMPLES_MODE);
  const [depthDialogVisible, setDepthDialogVisible] = useState(false);
  const [eilCalculatorVisible, setEilCalculatorVisible] = useState(false);
  const [duplicateDialogVisible, setDuplicateDialogVisible] = useState(false);
  const [speciesLevelProtectionDialogVisible, setSpeciesLevelProtectionDialogVisible] = useState(false);
  const [vapourIntrusionDialogVisible, setVapourIntrusionDialogVisible] = useState(false);

  useEffect(() => {
    shortcutsService.subscribeToShortcut('selectAll', selectAllSamples);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeOrder = async (sortOrder) => {
    await dispatch(changeSortOrder(sortOrder));

    const order = sampleService.getSamplesOrder(samples, sort);

    dispatch(updateSampleOrder(order));
  };

  const selectAllSamples = (e) => {
    if (e) e.preventDefault();
    selectAll(true);
  };

  const selectAll = (selected) => {
    let selectedIds: string[] = [];

    if (selected) selectedIds = Object.keys(samples);

    dispatch(updateSelectionReport(selectedIds));
  };

  const resetSelection = () => {
    dispatch(resetSamples());
  };

  const selectSample = (sampleId) => {
    const selectedIds = extras.getSelectedIds(sampleId, reportSampleIds);

    dispatch(updateSelectionReport(selectedIds));
  };

  const toggleDisplayMode = () => {
    const newDisplayMode = displayMode === SELECT_SAMPLES_MODE ? VIEW_SAMPLES_MODE : SELECT_SAMPLES_MODE;

    setDisplayMode(newDisplayMode);
  };

  const toggleDepthDialog = () => {
    setDepthDialogVisible(!depthDialogVisible);
  };

  const saveSampleDepth = (depthFrom, depthTo) => {
    dispatch(updateSampleDepth(depthFrom, depthTo));

    toggleDepthDialog();
    uiHelper.showSuccess(PARAMETERS_UPDATED_MESSAGE);
    clearEditSelection();
  };

  const toggleEilCalculator = () => {
    setEilCalculatorVisible(!eilCalculatorVisible);
  };

  const isValidEilParameters = (params) => {
    if (isEmpty(criteria)) return true;

    const eilCriteriaSelected = find(criteria, (criterion) => {
      return criterion === EIL_AES || criterion === EIL_C_IND || criterion === EIL_UR_POS;
    });

    if (!eilCriteriaSelected) return true;

    const missingRequiredSampleParameters = sampleService.detectMissingRequiredSampleParameters(editSamples, params);

    if (!isEmpty(missingRequiredSampleParameters)) {
      const message = formatHelper.displayRequiredSessionParametersMessage(missingRequiredSampleParameters);

      dispatch(
        confirmAction({
          title: 'Warning!',
          message: CRITERIA_REQUIRED_PARAMETERS_ARE_MISSING(message),
          infoDialog: true,
        })
      );

      return false;
    }

    return true;
  };

  const saveEilParameters = (params) => {
    if (isEmpty(params)) {
      toggleEilCalculator();
      clearEditSelection();
      return;
    }

    const updatedParameters = extras.getUpdatedParameters(parameters, params, editSampleIds);

    if (!isValidEilParameters(updatedParameters)) {
      toggleEilCalculator();
      clearEditSelection();
      return;
    }

    dispatch(updateParameters(updatedParameters));

    toggleEilCalculator();
    uiHelper.showSuccess(PARAMETERS_UPDATED_MESSAGE);
    clearEditSelection();
  };

  const toggleDuplicateDialog = () => {
    setDuplicateDialogVisible(!duplicateDialogVisible);
  };

  const saveSampleDuplicate = (primarySampleId) => {
    dispatch(updateSampleDuplicate(primarySampleId));

    toggleDuplicateDialog();
    uiHelper.showSuccess(PARAMETERS_UPDATED_MESSAGE);
    clearEditSelection();
  };

  const clearEditSelection = () => {
    dispatch(updateSelectionEdit([]));
  };

  const saveListOrder = (samples) => {
    const order = sampleService.getSampleIds(samples);

    dispatch(updateSampleOrder(order));
  };

  const toggleSpeciesLevelProtectionDialog = () => {
    setSpeciesLevelProtectionDialogVisible(!speciesLevelProtectionDialogVisible);
  };

  const saveSpeciesLevelProtectionParameters = (params) => {
    dispatch(updateWaterAssessmentParameters('levelOfProtection', params));

    toggleSpeciesLevelProtectionDialog();
    uiHelper.showSuccess(PARAMETERS_UPDATED_MESSAGE);
  };

  const toggleVapourIntrusionDialog = () => {
    setVapourIntrusionDialogVisible(!vapourIntrusionDialogVisible);
  };

  const saveVapourIntrusionCriteriaParameters = (params) => {
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (waterAssessmentParameters[key] === value) continue;

      dispatch(updateWaterAssessmentParameters(key, value));

      toggleVapourIntrusionDialog();
      uiHelper.showSuccess(PARAMETERS_UPDATED_MESSAGE);
    }
  };

  let displaySection = (
    <SampleList
      samplesObj={samples}
      parameters={parameters}
      reportSampleIds={reportSampleIds}
      sortSamples={changeOrder}
      selectAll={selectAll}
      selectSample={selectSample}
      sort={sort}
      saveListOrder={saveListOrder}
      assessmentType={project.assessmentType}
    />
  );

  if (displayMode === VIEW_SAMPLES_MODE) displaySection = <SampleParametersView />;

  return (
    <div id="sample-page">
      <SampleToolsSection
        displayMode={displayMode}
        onDisplayModeChange={toggleDisplayMode}
        onDepthModify={toggleDepthDialog}
        onEilCalculatorClick={toggleEilCalculator}
        onDuplicateSample={toggleDuplicateDialog}
        onLevelProtectionClick={toggleSpeciesLevelProtectionDialog}
        onVapourIntrusionClick={toggleVapourIntrusionDialog}
        onResetSampleSelection={resetSelection}
      />

      {samples && displaySection}

      {depthDialogVisible && (
        <DepthDialog
          visible={depthDialogVisible}
          samples={samples}
          editSampleIds={editSampleIds}
          onClose={toggleDepthDialog}
          onSave={saveSampleDepth}
        />
      )}

      {eilCalculatorVisible && (
        <EilCalculatorDialog
          visible={eilCalculatorVisible}
          params={parameters}
          editSampleIds={editSampleIds}
          onClose={toggleEilCalculator}
          onSave={saveEilParameters}
        />
      )}

      {duplicateDialogVisible && (
        <DuplicateSampleDialog
          visible={duplicateDialogVisible}
          samples={reportSamples}
          selectedSampleId={editSampleIds[0]}
          onClose={toggleDuplicateDialog}
          onSave={saveSampleDuplicate}
        />
      )}

      {speciesLevelProtectionDialogVisible && (
        <SpeciesLevelProtectionDialog
          visible={speciesLevelProtectionDialogVisible}
          params={waterAssessmentParameters.levelOfProtection}
          onClose={toggleSpeciesLevelProtectionDialog}
          onSave={saveSpeciesLevelProtectionParameters}
        />
      )}

      {vapourIntrusionDialogVisible && (
        <VapourIntrusionCriteriaDialog
          visible={vapourIntrusionDialogVisible}
          params={waterAssessmentParameters}
          onClose={toggleVapourIntrusionDialog}
          onSave={saveVapourIntrusionCriteriaParameters}
        />
      )}
    </div>
  );
}

export default SamplePage;
