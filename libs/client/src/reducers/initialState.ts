import {cloneDeep} from 'lodash';

import {LAB_SAMPLE_ID_ORDER, ASCENDING_DIRECTION} from 'constants/sortOrders';

import {Waste, Soil, Water} from 'constants/assessmentType';
import {SPECIES_PROTECTION_LEVEL_99, SPECIES_PROTECTION_LEVEL_95} from 'constants/speciesProtectionLevels';
import {NSW_STATE} from 'constants/states';
import {STANDARD_OUTPUT_FORMAT} from 'constants/outputFormats';
import config from 'helpers/config';

import groupService from 'services/groupService';
// take standard Contaminant groups by default (except disabled by config file)

const excludedGroups = ['ASS', 'ENM'];

export const defaultChemicalGroups = {
  Soil: groupService.getStandardGroups(Soil).filter((group) => !config.disabledContaminantGroups.includes(group)),
  Waste: groupService
    .getStandardGroups(Waste)
    .filter((group) => !config.disabledContaminantGroups.includes(group) && !excludedGroups.includes(group)),
  Water: groupService.getStandardGroups(Water).filter((group) => !config.disabledContaminantGroups.includes(group)),
};

export const initialStateOriginal = {
  common: {
    asyncAction: null,
    confirmAction: null,
    isLoaderVisible: false,
  },
  sample: {
    all: null, //{key (labSampleId): {...}}
    order: [],
    sort: {
      order: LAB_SAMPLE_ID_ORDER,
      direction: ASCENDING_DIRECTION,
    },
    selection: {
      report: [],
      edit: [],
    },
    parameters: null, //{key (labSampleId): {...}}
  },
  session: {
    project: {
      assessmentType: Soil,
      state: NSW_STATE,
    },
    fileList: null,
    applyBiodegradation: false,
    highlightAllDetections: false,
    showDepthColumn: true,
    shouldOutputAslp: false,
    shouldOutputTclp: false,
    chemicalGroups: defaultChemicalGroups,
    combinedChemicalsDisplay: {},
    criteria: [],
    selectedCriteria: {
      Soil: [],
      Waste: [],
      Water: [],
    },
    wasteStatistics: {
      calculateSummaryStatistics: false,
      statisticalInfoForContaminants: false,
    },
    outputFormat: STANDARD_OUTPUT_FORMAT,
    waterAssessmentParameters: {
      waterEnvironment: '',
      levelOfProtection: {
        bioAccumulative: SPECIES_PROTECTION_LEVEL_99,
        pfas: SPECIES_PROTECTION_LEVEL_99,
        others: SPECIES_PROTECTION_LEVEL_95,
      },
      potentialUse: '',
      soilType: '',
      waterDepth: '',
      vapourIntrusionHsl: '',
    },
  },
  report: {
    data: null,
    edits: {}, // {key (code#chemical): {isSelected: false, standardDeviation: null, ucl: null}}
    exportedToFile: null,
  },
};

const initialState = cloneDeep(initialStateOriginal);

export default initialState;
