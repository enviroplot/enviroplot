import {ECO, EIL_AES, ESL_AES, EIL_UR_POS, ESL_UR_POS, EIL_C_IND, ESL_C_IND} from './../constants/criteriaTypes';
import * as CRITERIA from 'constants/criteriaTypes';
import {FRESHWATER_ENV, MARINE_ENV} from 'constants/waterEnvironments';
import {DEPTH_LEVEL_2_to_4, DEPTH_LEVEL_4_to_8, DEPTH_LEVEL_8_to_UNLIMITED} from 'constants/groundwaterHslDepthLevels';

export default {
  getHilOptions,
  getHslOptions,
  getEgvOptions,
  getEilEslOptions,
  getEslOptions,
  getMLOptions,
  getGwCriteriaByAssessmentParamters,
  getDirectContactOptions,
  getSelectedOption,
  getSelectedOptionEilEsl,
  getCriteriaLookup,
};

function getHilOptions() {
  const hilCriteria = [CRITERIA.HIL_A, CRITERIA.HIL_B, CRITERIA.HIL_C, CRITERIA.HIL_D];

  const options = getCriteriaOptions(hilCriteria);
  return options;
}

function getGwWqCriteria(waterType): string[] {
  const marine = [CRITERIA.WQMarine, CRITERIA.WQMarinePFAS];
  const fresh = [CRITERIA.WQFresh, CRITERIA.WQFreshPFAS];
  if (waterType) {
    if (waterType === MARINE_ENV) return marine;
    if (waterType === FRESHWATER_ENV) return fresh;
  }
  return marine.concat(fresh);
}

function getGwViHslCriteriaByWaterDepth(waterDepth) {
  switch (waterDepth) {
    case DEPTH_LEVEL_2_to_4:
      return CRITERIA.VI_2_4;
    case DEPTH_LEVEL_4_to_8:
      return CRITERIA.VI_4_8;
    case DEPTH_LEVEL_8_to_UNLIMITED:
      return CRITERIA.VI_8more;
    default:
      return '';
  }
}

function getGwCriteriaByAssessmentParamters(criterionTypeCode, value, gwAssessmentParameters) {
  let result: string[] = [];

  if (criterionTypeCode === 'wq' && value && gwAssessmentParameters.waterEnvironment) {
    const wqCriteria = getGwWqCriteria(gwAssessmentParameters.waterEnvironment);
    result = result.concat(wqCriteria);
  }
  if (criterionTypeCode === 'vi' && gwAssessmentParameters.waterDepth) {
    result.push(getGwViHslCriteriaByWaterDepth(gwAssessmentParameters.waterDepth));
  }
  return result;
}

function getHslOptions() {
  const hslCriteria = [CRITERIA.HSL_AB, CRITERIA.HSL_C, CRITERIA.HSL_D, CRITERIA.HSL_IMW];

  const options = getCriteriaOptions(hslCriteria);
  return options;
}

function getEgvOptions(alreadySelectedOptions: string[]) {
  const egvCriteria = [CRITERIA.EGV_INDIR_ALL];

  if (alreadySelectedOptions.includes(CRITERIA.HIL_B) || alreadySelectedOptions.includes(CRITERIA.HIL_D)) {
    egvCriteria.push(CRITERIA.EGV_INDIR_IDS_MAX);
    egvCriteria.push(CRITERIA.EGV_INDIR_IDS_UD);
  }

  const options = getCriteriaOptions(egvCriteria);

  return options;
}

function getEilEslOptions() {
  const eilEslCriteria = [
    CRITERIA.EIL_AES,
    CRITERIA.ESL_AES,
    CRITERIA.EIL_UR_POS,
    CRITERIA.ESL_UR_POS,
    CRITERIA.EIL_C_IND,
    CRITERIA.ESL_C_IND,
  ];

  const options = getCriteriaOptionsEilEsl(eilEslCriteria);
  return options;
}

function getEslOptions() {
  const eslCriteria = [CRITERIA.ESL_AES, CRITERIA.ESL_UR_POS, CRITERIA.ESL_C_IND];

  const options = getCriteriaOptions(eslCriteria);
  return options;
}

function getMLOptions() {
  const mlCriteria = [CRITERIA.ML_R_P_POS, CRITERIA.ML_C_IND];

  const options = getCriteriaOptions(mlCriteria);
  return options;
}

function getDirectContactOptions() {
  const dcCriteria = [CRITERIA.DC_HSL_A, CRITERIA.DC_HSL_B, CRITERIA.DC_HSL_C, CRITERIA.DC_HSL_D, CRITERIA.DC_HSL_IMW];

  const options = getCriteriaOptions(dcCriteria);
  return options;
}

function getSelectedOption(options, criteria) {
  for (const criterion of criteria) {
    const opt = options.find((option) => option.value === criterion);
    if (opt) return opt.value;
  }
  return '';
}

function getSelectedOptionEilEsl(criteria) {
  for (const criterion of criteria) {
    if (criterion === EIL_AES || criterion === ESL_AES) {
      return 'EcologicalAES';
    }
    if (criterion === EIL_UR_POS || criterion === ESL_UR_POS) {
      return 'EcologicalPOS';
    }
    if (criterion === EIL_C_IND || criterion === ESL_C_IND) {
      return 'EcologicalInd';
    }
  }
  return '';
}

//TODO reuse code from lib
function getCriteriaLookup() {
  const lookup = {
    hil: [CRITERIA.HIL_A, CRITERIA.HIL_B, CRITERIA.HIL_C, CRITERIA.HIL_D],
    hsl: [CRITERIA.HSL_AB, CRITERIA.HSL_C, CRITERIA.HSL_D, CRITERIA.HSL_IMW],
    egv: [CRITERIA.EGV_INDIR_ALL, CRITERIA.EGV_INDIR_IDS_MAX, CRITERIA.EGV_INDIR_IDS_UD],
    eilEsl: [
      CRITERIA.EIL_AES,
      CRITERIA.ESL_AES,
      CRITERIA.EIL_C_IND,
      CRITERIA.ESL_C_IND,
      CRITERIA.EIL_UR_POS,
      CRITERIA.ESL_UR_POS,
    ],
    ml: [CRITERIA.ML_R_P_POS, CRITERIA.ML_C_IND],
    dc: [CRITERIA.DC_HSL_A, CRITERIA.DC_HSL_B, CRITERIA.DC_HSL_C, CRITERIA.DC_HSL_D, CRITERIA.DC_HSL_IMW],
    pu: [
      CRITERIA.PUAesthetic,
      CRITERIA.PUHealth,
      CRITERIA.PUIrrigationLTV,
      CRITERIA.PUIrrigationSTV,
      CRITERIA.PURecreation,
    ],
    wq: [CRITERIA.WQFresh, CRITERIA.WQFreshPFAS, CRITERIA.WQMarine, CRITERIA.WQMarinePFAS],
    vi: [CRITERIA.VI_2_4, CRITERIA.VI_4_8, CRITERIA.VI_8more],
  };

  return lookup;
}

//helper methods

function getCriteriaOptions(criteria) {
  const options: any[] = [];

  for (const criterion of criteria) {
    const option = getOption(criterion, criterion);
    options.push(option);
  }

  return options;
}

function getOption(value, label) {
  return {value, label};
}

function getCriteriaOptionsEilEsl(criteria) {
  const options: any[] = [];
  const criteriaAes: any[] = [];
  const criteriaPos: any[] = [];
  const criteriaInd: any[] = [];

  for (const criterion of criteria) {
    if (criterion.indexOf('AES') !== -1) {
      criteriaAes.push(criterion);
    }
  }
  const optionAes = getOptionEilEsl(criteriaAes);
  options.push(optionAes);

  for (const criterion of criteria) {
    if (criterion.indexOf('POS') !== -1) {
      criteriaPos.push(criterion);
    }
  }
  const optionPos = getOptionEilEsl(criteriaPos);
  options.push(optionPos);

  for (const criterion of criteria) {
    if (criterion.indexOf('Ind') !== -1) {
      criteriaInd.push(criterion);
    }
  }
  const optionInd = getOptionEilEsl(criteriaInd);
  options.push(optionInd);

  return options;
}

function getOptionEilEsl(criteriaArr) {
  return {
    value: ECO + criteriaArr[0].slice(-3),
    label: criteriaArr[0].slice(0, 3) + '/' + criteriaArr[1],
  };
}
