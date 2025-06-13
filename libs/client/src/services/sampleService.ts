import {includes, isObject, isString, cloneDeep, isEmpty, orderBy, filter, find, reverse} from 'lodash';

import {SAND_SOIL_TYPE} from 'constants/hslSoilTypes';
import {COARSE_SOIL_TEXTURE} from 'constants/soilTextureTypes';
import {ASSUMED_TYPE} from 'constants/parameterValueTypes';
import {AGED_CONTAMINATION_TYPE, FRESH_CONTAMINATION_TYPE} from 'constants/eilContaminationTypes';
import {NSW_STATE} from 'constants/states';
import {LOW_TRAFFIC_VOLUME} from 'constants/eilTrafficVolumeTypes';
import {ZINC_CODE, CHROMIUM_CODE, COPPER_CODE, NICKEL_CODE} from 'constants/ecologicalLevelSpecialChemicals';

import dataService from './dataService';
import unitsConverter from 'lib/calculations/unitsConverter';

const ORGANIC_CARBON = 'organic carbon';
const IRON_CONTENT = 'iron content';

export default {
  shouldGetSelectedSamples,
  getSampleIds,
  getSessionSampleParameters,
  mapSamples,
  getSamplesOrder,
  detectMissingRequiredSampleParameters,
  initParametersForMultipleSamples,
  addHasStandardContaminationChemicalsFlag,
};

function shouldGetSelectedSamples(samples) {
  const selected = filter(samples, (sample) => {
    return sample.hasStandardContaminationChemicals;
  });

  if (!selected) return [];

  return getSampleIds(selected);
}

function getSampleIds(samples) {
  const sampleIds = samples.map((sample) => {
    return sample.labSampleId;
  });

  return sampleIds;
}

function getSessionSampleParameters(samples) {
  const parameters = {};

  for (const sample of samples) {
    const parameter = {
      depth: {from: sample.depth?.from, to: sample.depth?.to},
      excavationDepth: sample.excavationDepth,
      soilType: SAND_SOIL_TYPE,
      soilTexture: COARSE_SOIL_TEXTURE,
      ph: initParameter(4),
      cec: initParameter(2),
      clayContent: initParameter(1),
      mbc: null,
      contaminationType: AGED_CONTAMINATION_TYPE,
      state: NSW_STATE,
      trafficVolume: LOW_TRAFFIC_VOLUME,
      ironContent: initParameter(0),
      organicCarbon: initParameter(1),
    };

    parameters[sample.labSampleId] = parameter;
  }

  return parameters;
}

/* 
  This method merges same samples. It takes last one and merges with older measurements.
  NOTE: no units conversion applied!
  NB: If ER falls in this method then probably you have several samples with the same SampleCode

*/
function mergeSamples(existingSample, incomingSample) {
  const resultSample = cloneDeep(existingSample);

  reverse(incomingSample.measurements).forEach((measurement) => {
    const isSimilarMeasurement = find(resultSample.measurements, (el) => {
      const isCodesSame = el.chemical.code === measurement.chemical.code;
      const isUnitsCompatible = unitsConverter.isUnitsConvertible(el.units, measurement.units);

      return isCodesSame && isUnitsCompatible;
    });

    if (!isSimilarMeasurement) {
      resultSample.measurements.unshift(measurement);
    }
  });

  return resultSample;
}

function mapSamples(all, samples) {
  let result = {};
  if (all) result = {...all};

  const mergedSamplesLabIds: any[] = [];
  for (const sample of samples) {
    const sampleId = sample.labSampleId;
    // we need to merge samples if same sample aready exists (was loaded previously with another file)
    const existingSampleIdForMerge = FindLabSampleIdToMergeWith(result, sample);

    if (existingSampleIdForMerge) {
      result[existingSampleIdForMerge] = cloneDeep(mergeSamples(result[existingSampleIdForMerge], sample));
      mergedSamplesLabIds.push(sampleId);
    } else {
      result[sampleId] = sample;
    }
  }
  return {result, mergedSamplesLabIds};
}

function FindLabSampleIdToMergeWith(existingSamples, newlyAddedSample) {
  const existingSampeLabId = Object.keys(existingSamples).find((key) => {
    const existingSample = existingSamples[key];
    const newSample = newlyAddedSample;

    if (
      existingSample.dpSampleId === newSample.dpSampleId &&
      existingSample.dateSampled === newSample.dateSampled &&
      ((existingSample.depth === undefined && newSample.depth === undefined) ||
        (existingSample.depth &&
          newSample.depth &&
          existingSample.depth.from === newSample.depth.from &&
          existingSample.depth.to === newSample.depth.to))
    ) {
      return existingSample.labSampleId; // All conditions match
    }

    return false; // Conditions do not match
  });

  if (existingSampeLabId !== undefined) {
    return existingSampeLabId;
  } else {
    return null;
  }
}

function getSamplesOrder(samples, sort) {
  const orderedSamples = orderBy(samples, sort.order, sort.direction);

  const order = getSampleIds(orderedSamples);

  return order;
}

function detectMissingRequiredSampleParameters(samples, parameters) {
  const result = {};

  for (const sample of samples) {
    const labSampleId = sample.labSampleId;

    const sampleParameter = parameters[labSampleId];

    for (const chemicalMeasurement of sample.measurements) {
      const chemicalCode = chemicalMeasurement.chemical.code;

      if (!isEcologicalLevelCalculationChemical(chemicalCode)) continue;

      const missingRequiredSampleParameters = detectMissingRequiredSampleParametersForChemical(
        chemicalCode,
        sampleParameter
      );

      if (isEmpty(missingRequiredSampleParameters)) continue;

      if (result[labSampleId]) {
        result[labSampleId] = result[labSampleId].concat(missingRequiredSampleParameters);
      } else {
        result[labSampleId] = [];
        result[labSampleId] = result[labSampleId].concat(missingRequiredSampleParameters);
      }
    }
  }

  return result;
}

function initParametersForMultipleSamples(parameters, sampleIds) {
  const result = cloneDeep(parameters[sampleIds[0]]);

  for (let i = 1; i < sampleIds.length; i++) {
    const nextSampleParams = parameters[sampleIds[i]];

    for (const key of Object.keys(result)) {
      const paramValue: any = result[key];
      const nextParamValue = nextSampleParams[key];

      if (isString(paramValue)) {
        if (paramValue !== nextParamValue) {
          result[key] = '';
        }
      }

      if (isObject(paramValue)) {
        const clonedParamValue: any = {...paramValue};

        if (clonedParamValue.value !== nextParamValue.value) {
          result[key].value = '';
        }
        if (clonedParamValue.type !== nextParamValue.type) {
          result[key].type = '';
        }
      }
    }
  }

  return result;
}

//helper methods

function initParameter(value, type = ASSUMED_TYPE, isSelected = true) {
  return {
    value: value.toFixed(2),
    type,
    isSelected,
  };
}

function isEcologicalLevelCalculationChemical(chemicalCode) {
  const chemicalsToCheck = [ZINC_CODE, CHROMIUM_CODE, NICKEL_CODE, COPPER_CODE];

  return includes(chemicalsToCheck, chemicalCode);
}

function detectMissingRequiredSampleParametersForChemical(chemicalCode, parameter) {
  const result: string[] = [];

  switch (chemicalCode) {
    case CHROMIUM_CODE:
    case ZINC_CODE:
    case NICKEL_CODE:
      if (!checkIronContentIsSpecified(parameter)) {
        result.push(IRON_CONTENT);
      }

      break;

    case COPPER_CODE:
      if (!checkIronContentIsSpecified(parameter)) {
        result.push(IRON_CONTENT);
      }

      const organicCarbonNotNull = parameter.organicCarbon.value && Number(parameter.organicCarbon.value) !== 0;

      if (!organicCarbonNotNull) {
        result.push(ORGANIC_CARBON);
      }

      break;

    default:
      break;
  }

  return result;
}

function checkIronContentIsSpecified(parameter) {
  const mbcNull = parameter.mbc === null;
  const isFreshType = parameter.contaminationType === FRESH_CONTAMINATION_TYPE;
  const ironNotNull = parameter.ironContent.value && Number(parameter.ironContent.value) !== 0;

  if (mbcNull && isFreshType && !ironNotNull) return false;

  return true;
}

function addHasStandardContaminationChemicalsFlag(samples, assessmentType) {
  const allGroups = dataService.getChemicalGroups(assessmentType);

  const standardContaminationChemicalsLookup = {};

  for (const group of allGroups) {
    if (group.isStandardContaminantSuite) {
      for (const chemical of group.chemicals) {
        standardContaminationChemicalsLookup[chemical.code] = true;
      }
    }
  }
  for (const sample of samples) {
    let hasStandardContaminationChemicals = false;
    if (!sample.measurements) continue;
    console.log(standardContaminationChemicalsLookup);
    for (const measurement of sample.measurements) {
      console.log(standardContaminationChemicalsLookup[measurement.chemical.code]);
      console.log(measurement.chemical.code);
      if (standardContaminationChemicalsLookup[measurement.chemical.code]) {
        hasStandardContaminationChemicals = true;
        break;
      }
    }
    sample.hasStandardContaminationChemicals = hasStandardContaminationChemicals;
  }
}
