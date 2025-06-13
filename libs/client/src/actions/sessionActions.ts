import * as actionTypes from './actionTypes';
import helper from './actionHelper';

import {NSW_STATE} from 'constants/states';
import {Soil, Waste, Water} from 'constants/assessmentType';
import groupService from 'services/groupService';

export const addSessionFile = (sampleFileName, sampleIds, chemistryFileName, fileSamplesData) =>
  helper.getAction(actionTypes.ADD_SESSION_FILE, {sampleFileName, sampleIds, chemistryFileName, fileSamplesData});

export const removeSessionFile = (fileName, sampleIds) =>
  helper.getAction(actionTypes.REMOVE_SESSION_FILE, {fileName, sampleIds});

export const createSession: any = () => {
  return (dispatch) => {
    dispatch(helper.getAction(actionTypes.RESET_SESSION, {}));
    dispatch(
      helper.getAction(actionTypes.UPDATE_SESSION, {
        project: {
          assessmentType: Soil,
          state: NSW_STATE,
        },
      })
    );
  };
};

export const clearProjectDetails: any = () => {
  return (dispatch) => {
    dispatch(
      helper.getAction(actionTypes.UPDATE_SESSION, {
        project: {
          assessmentType: Soil,
          state: NSW_STATE,
        },
        chemicalGroups: {
          Soil: groupService.getStandardGroups(Soil),
          Waste: groupService.getStandardGroups(Waste),
          Water: groupService.getStandardGroups(Water),
        },
        criteria: [],
      })
    );
  };
};

export const updateSession = (project) => helper.getAction(actionTypes.UPDATE_SESSION, {project});

export const updateSessionBiodegradation = () => helper.getAction(actionTypes.APPLY_BIODEGRADATION, {});

export const saveChemicalGroups = (chemicalGroups, assessmentType) =>
  helper.getAction(actionTypes.SAVE_CHEMICAL_GROUPS, {chemicalGroups, assessmentType});

export const saveShouldOutputAslp = (shouldOutputAslp) =>
  helper.getAction(actionTypes.SHOULD_OUTPUT_ASLP, {shouldOutputAslp});

export const saveShouldOutputTclp = (shouldOutputTclp) =>
  helper.getAction(actionTypes.SHOULD_OUTPUT_TCLP, {shouldOutputTclp});

export const saveDisplaySettings = (combinedChemicalsDisplay) =>
  helper.getAction(actionTypes.SET_COMBINED_CHEMICALS_DISPLAY, {combinedChemicalsDisplay});

export const updateAllDetections = () => helper.getAction(actionTypes.HIGHTLIGHT_ALL_DETECTIONS, {});

export const updateDepthColumnVisibility = () => helper.getAction(actionTypes.TOGGLE_DEPTH_COLUMN, {});

export const updateCriteria = (criteria) => helper.getAction(actionTypes.SAVE_CRITERIA, {criteria});

export const saveCurrentCriteria = (criteria, assessmentType) =>
  helper.getAction(actionTypes.SAVE_CURRENT_CRITERIA, {criteria, assessmentType});

export const updateChemicalGroups = (chemicalGroups, moduleName) =>
  helper.getAction(actionTypes.UPDATE_CHEMICAL_GROUPS, {chemicalGroups, moduleName});

export const updateWasteStatistics = (field, value) =>
  helper.getAction(actionTypes.UPDATE_WASTE_STATISTICS, {field, value});

export const updateOutputFormat = (outputFormat) => helper.getAction(actionTypes.UPDATE_OUTPUT_FORMAT, {outputFormat});

export const updateWaterAssessmentParameters = (field, value) =>
  helper.getAction(actionTypes.UPDATE_WATER_ASSESSMENT_PARAMETERS, {field, value});
