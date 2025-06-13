import React, {useState, useEffect} from 'react';
import {Button} from 'components/bootstrap';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {indexOf, isEmpty, filter} from 'lodash';
import {useSelector, useDispatch} from 'react-redux';

import {
  updateAllDetections,
  updateCriteria,
  updateDepthColumnVisibility,
  updateWasteStatistics,
} from 'actions/sessionActions';
import {updateReportPreview} from 'actions/reportActions';
import {confirmAction} from 'actions/commonActions';

import {getAppData} from 'reducers/index';
import {getReportSamples} from 'reducers/sampleReducer';

import {CRITERIA_REQUIRED_PARAMETERS_ARE_MISSING} from 'constants/literals/errors';
import {NO_SELECTED_REPORT_CRITERIA} from 'constants/literals/warnings';
import {Soil, Waste, Water} from 'constants/assessmentType';

import formatHelper from 'helpers/formatHelper';
import sessionService from 'services/sessionService';
import criteriaService from 'services/criteriaService';
import sampleService from 'services/sampleService';
import dataService from 'services/dataService';

import AppIcon from 'components/common/AppIcon';
import CriteriaSelection from './components/CriteriaSelection';
import StatisticalDataSection from './components/StatisticalDataSection';
import GuidelinesSection from './components/GuidelinesSection';
import OutputFormatSection from './components/OutputFormatSection';
import {EIL_AES, EIL_C_IND, EIL_UR_POS, ESL_AES, ESL_C_IND, ESL_UR_POS} from 'constants/criteriaTypes';

ResultToolsSection.propTypes = {
  data: PropTypes.array,
  showContaminantDialog: PropTypes.func.isRequired,
  showCombineChemicalDialog: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
};

function ResultToolsSection({data, showContaminantDialog, showCombineChemicalDialog, onExport}) {
  const dispatch = useDispatch();

  const highlightAllDetections = useSelector((state: any) => state.session.highlightAllDetections);
  const showDepthColumn = useSelector((state: any) => state.session.showDepthColumn);
  const criteria = useSelector((state: any) => state.session.criteria);
  const project = useSelector((state: any) => state.session.project);
  const samples = useSelector((state: any) => state.sample.all);
  const parameters = useSelector((state: any) => state.sample.parameters);
  const wasteStatistics = useSelector((state: any) => state.session.wasteStatistics) || {};
  const appData = useSelector((state: any) => getAppData(state));
  const reportSamples = useSelector((state: any) => getReportSamples(state));
  const waterAssessmentParameters = useSelector((state: any) => state.session.waterAssessmentParameters);
  const assessmentType = useSelector((state: any) => state.session.project.assessmentType);
  const selectedChemicalGroups: string[] =
    useSelector((state: any) => state.session.chemicalGroups[assessmentType]) || [];

  const [criteriaInfo, setCriteriaInfo] = useState([]);

  useEffect(() => {
    const seedData = dataService.getSeedData(assessmentType);

    setCriteriaInfo(seedData.criteria || []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processMissingEilCriteria = () => {
    const missingRequiredSampleParameters = sampleService.detectMissingRequiredSampleParameters(
      reportSamples,
      parameters
    );

    if (!isEmpty(missingRequiredSampleParameters)) {
      const message = formatHelper.displayRequiredSessionParametersMessage(missingRequiredSampleParameters);

      dispatch(
        confirmAction({
          title: 'Warning!',
          message: CRITERIA_REQUIRED_PARAMETERS_ARE_MISSING(message),
          infoDialog: true,
        })
      );

      return;
    }
  };

  const saveCriteria = (field, value) => {
    const isSoilAssessment = project.assessmentType === Soil;
    const isGWAssessment = project.assessmentType === Water;

    let newCriteria: any[] = [].concat(criteria);
    const criteriaLookup = criteriaService.getCriteriaLookup();

    if (isGWAssessment) {
      if (field === 'pu') {
        const index = newCriteria.findIndex((criterion) => criterion === value);
        if (index === -1) {
          if (value) newCriteria.push(value);
        } else {
          newCriteria.splice(index, 1);
        }
      } else {
        newCriteria = newCriteria.filter((el) => !criteriaLookup[field].includes(el));
        const criteriaFromParameters = criteriaService.getGwCriteriaByAssessmentParamters(
          field,
          value,
          waterAssessmentParameters
        );
        newCriteria = newCriteria.concat(criteriaFromParameters);
      }
    }

    if (isSoilAssessment) {
      //TODO: use constant for 'hsl'
      if (field === 'eilEsl') {
        processMissingEilCriteria();
      }

      newCriteria = filter(newCriteria, (criterion) => {
        return indexOf(criteriaLookup[field], criterion) === -1;
      });

      for (const item of criteriaLookup[field]) {
        if (value === item) {
          newCriteria.push(value);
          break;
        } else if (value === 'EcologicalAES') {
          newCriteria.push(EIL_AES, ESL_AES);
          break;
        } else if (value === 'EcologicalPOS') {
          newCriteria.push(EIL_UR_POS, ESL_UR_POS);
          break;
        } else if (value === 'EcologicalInd') {
          newCriteria.push(EIL_C_IND, ESL_C_IND);
          break;
        }
      }

      //clear all dc criteria (TODO: use constant for 'hil')
      if (field === 'hil') {
        newCriteria = filter(newCriteria, (criterion) => {
          return indexOf(criteriaLookup.dc, criterion) === -1;
        });
      }
    }
    dispatch(updateCriteria(newCriteria));
    dispatch(updateReportPreview());
  };

  const isExportBtnDisabled = (disabled) => {
    if (disabled) return true;

    //if there are TB/TS should not be disabled
    for (const sample of Object.values(samples)) {
      const sampleValues: any = sample;
      if (sampleValues.isTripBlank || sampleValues.isTripSpike) return false;
    }

    return false;
  };

  const onReportExport = async () => {
    const isWasteAssessment = project.assessmentType === Waste;

    // TODO: temporary decision, to be updated properly when GW module ready

    const isNotEmptyCriteria =
      (project.assessmentType === Soil && !isEmpty(criteria)) ||
      (project.assessmentType === Water && !isEmpty(criteria)) ||
      isWasteAssessment;

    if (isNotEmptyCriteria) {
      return await onExport();
    }

    dispatch(
      confirmAction({
        message: NO_SELECTED_REPORT_CRITERIA,
        action: async () => {
          await onExport();
        },
      })
    );
  };

  function render() {
    if (!project) return null;

    const isSoilAssessment = project.assessmentType === Soil;
    const isWasteAssessment = project.assessmentType === Waste;
    const isWaterAssessment = project.assessmentType === Water;

    const disabled = isEmpty(data);

    const selectedDepthColumnVisibility = classnames({
      selected: showDepthColumn,
    });

    const isPfasSelected = selectedChemicalGroups.includes('PFAS_std') || selectedChemicalGroups.includes('PFAS');
    return (
      <div className="bg-light tools">
        <div className="tile border-right">
          <div className="display-buttons">
            <Button variant="link" onClick={showContaminantDialog} disabled={!samples}>
              Contaminant Groups
            </Button>

            <Button variant="link" onClick={showCombineChemicalDialog} disabled={disabled}>
              Combined/ &rsquo;Total &lsquo; Analytes
            </Button>

            {isWaterAssessment ? null : (
              <>
                {renderHighlightAllDetectionsButton(disabled)}

                <Button
                  variant="link"
                  className={selectedDepthColumnVisibility}
                  disabled={disabled}
                  onClick={() => dispatch(updateDepthColumnVisibility())}>
                  Show Depth Column in Final Output
                </Button>
              </>
            )}
          </div>
          <div className="tile-title">Display Options</div>
        </div>

        {isWaterAssessment && (
          <>
            <div className="tile border-right">
              <div className="display-buttons">{renderHighlightAllDetectionsButton(disabled)}</div>
              <div className="tile-title">Highlight Detections</div>
            </div>

            {/* <GuidelinesSection disabled={disabled} onChange={() => dispatch(updateReportPreview())} /> */}
            <GuidelinesSection disabled={disabled} onChange={saveCriteria} />
          </>
        )}

        {isWasteAssessment && (
          <StatisticalDataSection
            wasteStatistics={wasteStatistics}
            disabled={disabled}
            updateStatistics={(field, value) => dispatch(updateWasteStatistics(field, value))}
          />
        )}

        {isSoilAssessment && (
          <CriteriaSelection
            criteria={criteria}
            criteriaInfo={criteriaInfo}
            disabled={disabled}
            onChange={saveCriteria}
            isPfasSelected={isPfasSelected}
          />
        )}

        {!isSoilAssessment && <OutputFormatSection disabled={disabled} />}

        {renderCommonButtons(disabled)}
      </div>
    );
  }

  function renderHighlightAllDetectionsButton(disabled) {
    const selectedDetectionsClass = classnames({
      selected: highlightAllDetections,
    });

    return (
      <Button
        variant="link"
        className={selectedDetectionsClass}
        disabled={disabled}
        onClick={() => dispatch(updateAllDetections())}>
        Highlight all Detections
      </Button>
    );
  }

  function renderCommonButtons(disabled) {
    const exportDisabled = isExportBtnDisabled(disabled);

    return (
      <>
        <div className="tile border-right">
          <Button variant="link" className="tile-icon" disabled={exportDisabled} onClick={onReportExport}>
            <AppIcon name="excel" size="3x" color="green" />
            Export
          </Button>
          <div className="tile-title">Report</div>
        </div>

        <div className="tile border-right">
          <Button
            variant="link"
            className="tile-icon"
            disabled={disabled}
            onClick={() => sessionService.saveSession(appData)}>
            <AppIcon name="save" size="3x" color="dodgerblue" />
            Save
          </Button>
        </div>
      </>
    );
  }

  return render();
}

export default ResultToolsSection;
