import * as _ from 'lodash';

import * as CONSTANTS from '../constants/constants';

import unitsConverter from './unitsConverter';
import rpdCalculator from './rpdCalculator';
import criteriaCalculator from './soilCriteriaCalculator';
import ccCalculator from './calculatedChemicalsCalculator';
import gwCriteriaCalculator from './gwCriteriaCalculator';
import wcCriteriaCalculator from './wcCriteriaCalculator';
import reportHelper from '../report/reportHelper';

import extras from '../calculations/extras';
import rinsateCalculator from './rinsateCalculator';
export default {
  getReportData,
  getSoilCriteriaInfo, //for tests only
  getWaterCriteriaInfo, //for tests only
};

const criteriaUnitsCache: any = {};

async function getReportData(
  samples: Sample[],
  sampleParameters: {[key: string]: SampleParameters},
  sessionParameters: SessionParameters,
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData
): Promise<ReportData> {
  // TODO: create list of unit values for each chem
  getUnitsListForChems(seedData, sessionParameters.projectDetails.assessmentType);

  const reportItems: ReportItem[] = [];

  const reportItemRows = await getReportItemRows(samples, sessionParameters, seedData);

  for (const reportItemRow of reportItemRows) {
    const {chemical, group, units, dissolved, wcType} = reportItemRow;

    const codeForAssessing = reportItemRow.chemical.codeForAssessing
      ? reportItemRow.chemical.codeForAssessing
      : reportItemRow.chemical.code;

    const previewItem: ReportItem = {
      chemical: chemical.name,
      code: chemical.code,
      group: group.code,
      isCalculated: false,
      isCalculable: !!_.find(seedData.calculatedChemicals, (item) => item.code === chemical.code),
      units: null,
      pqlValue: null,
      pqlPrefix: null,
      groupSortOrder: group.sortOrder,
      sortOrder: chemical.sortOrder,
      isHiddenInReport: false,
      chemicalCodeForAssessing: codeForAssessing,
      replicates: [],
      extraFields: {
        min: null,
        max: null,
        mean: null,
        standardDeviation: null,
        ucl: null,
      },
      reportCells: {},
      wcType: wcType,
      dissolved: dissolved,
    };

    for (const sample of samples) {
      const reportCell: ReportCellWithLimits = await getReportCell(
        sample,
        previewItem,
        chemical,
        units,
        dissolved,
        wcType,
        sessionParameters,
        sampleParameters,
        seedData
      );
      previewItem.reportCells[sample.labSampleId] = reportCell;
    }

    reportItems.push(previewItem);
  }

  const calculatedChemicalsItems = await processCalculatedReportItems(
    reportItems,
    seedData,
    samples,
    sessionParameters,
    sampleParameters
  );

  const reportItemsWithoutCalculableItems = reportItems.filter((el) => !el.isCalculable);

  const resultData = _.orderBy(
    _.concat(reportItemsWithoutCalculableItems, calculatedChemicalsItems),
    ['groupSortOrder', 'sortOrder'],
    ['asc', 'asc']
  );

  if (extras.isWasteAssessment(sessionParameters)) {
    addExtraValues(resultData, sessionParameters);
  }

  const sampleParameterItems = getSampleParameters(samples, sampleParameters);

  const replicatedSamples = reportHelper.getReplicatedSamples(samples);

  const rpdReportItems = rpdCalculator.getRpdItems(
    resultData,
    replicatedSamples,
    extras.isWaterAssessment(sessionParameters)
  );

  const rinsateReportItems = rinsateCalculator.getRinsateItems(resultData, extras.isWaterAssessment(sessionParameters));

  const filteredResultData = getReportItemsWithoutRinsateTbTS(resultData, samples);

  return {
    allReportItems: resultData,
    generalReportItems: filteredResultData,
    rpdReportItems: rpdReportItems,
    rinsateReportItems: rinsateReportItems,
    seedData: seedData,
    samples,
    sampleParameters: sampleParameterItems,
  };
}

//helper methods

function getAllAvailableCriterionDetails(
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData
) {
  const res = Object.keys(seedData)
    .filter((item) => item.includes('CriterionDetails'))
    .map((el) => (seedData as any)[el] || []);

  return _.uniq(_.flatten(res));
}

function getUnitsListForChems(
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData,
  assessmentType: AssessmentType
): void {
  let criterionDetails: any = {};

  switch (assessmentType) {
    case AssessmentType.Soil: {
      const soilSeedData = seedData as SoilAssessmentCalculationData;
      criterionDetails = getAllAvailableCriterionDetails(soilSeedData);
      break;
    }

    case AssessmentType.Water: {
      const waterSeedData = seedData as GwCalculationData;
      criterionDetails = getAllAvailableCriterionDetails(waterSeedData);
      break;
    }

    case AssessmentType.Waste: {
      const wasteSeedData = seedData as WasteClassificationCalculationData;
      criterionDetails = getAllAvailableCriterionDetails(wasteSeedData);
      break;
    }

    default:
      return;
  }

  if (_.isEmpty(criteriaUnitsCache) && criterionDetails) {
    const x = _.groupBy(criterionDetails, (item) => item?.criterionDetail?.chemicalCode);

    _.forEach(x, (v, k) => {
      if (Array.isArray(v)) {
        criteriaUnitsCache[k] = _.uniq(v.map((y) => y.units));
      }
    });
  }
}

async function getReportCell(
  sample: Sample,
  previewItem: ReportItem,
  chemical: Chemical,
  units: string,
  dissolved: boolean,
  wcType: AslpTclpType,
  sessionParameters: SessionParameters,
  sampleParameters: {[key: string]: SampleParameters},
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData
) {
  let measurement: ChemicalMeasurement = _.find(
    sample.measurements,
    (x) =>
      x.chemical.code === chemical.code &&
      unitsConverter.isUnitsConvertible(x.units, units) &&
      x.dissolved === dissolved &&
      x.aslpTclpType === wcType
  );

  // leave this snippet for debug purpose (often required during development)
  // if (chemical.code == 'ACM_7mm') {
  //   console.log(measurement);
  // }
  const isAsbestosValue = extras.isAsbestosBooleanValue(chemical.code, sessionParameters.projectDetails.assessmentType);
  let value: string = isAsbestosValue ? ValueAbbreviations.Dash : ValueAbbreviations.NoData;
  let prefix = '';

  const chemCriteriaUnits: string[] = criteriaUnitsCache[chemical.code] || [];
  const chemCriterionUnits = chemCriteriaUnits && chemCriteriaUnits[0];

  if (measurement) {
    measurement = unitsConverter.convertMeasurementValue(
      measurement,
      chemCriterionUnits,
      sessionParameters.projectDetails.assessmentType
    );

    if (measurement.resultValue) value = measurement.resultValue.toString();
    if (isAsbestosValue) value = measurement.asbestosValue; //Override for asbestos
    if (measurement.prefix && measurement.resultValue) prefix = measurement.prefix;
    if (!previewItem.units) previewItem.units = measurement.units;
    if (!previewItem.pqlValue) previewItem.pqlValue = measurement.pqlValue;
    if (!previewItem.pqlPrefix && previewItem.pqlValue) previewItem.pqlPrefix = getRoundedValue(measurement.pqlPrefix);
    previewItem.wcType = measurement.aslpTclpType;

    if (previewItem.wcType && _.isInteger(previewItem.sortOrder)) {
      previewItem.sortOrder = previewItem.sortOrder + 0.5;
    }

    value = isAsbestosValue ? measurement.asbestosValue : getRoundedValue(value);
  }

  let resultCriteriaInfo: ResultCriteriaInfo = {exceededCriteria: {}, criteriaLimits: {}};

  // use incompatibility units flag in order to understand if we can apply criteria to current measurement
  const isCriterionAndMeasurementUnitsCompatible = measurement && chemCriteriaUnits.includes(measurement.units);

  if (isCriterionAndMeasurementUnitsCompatible) {
    const chemicalReportDataAndValue: ChemicalReportDataAndValue = extras.getChemicalDataAndValue(
      chemical,
      measurement
    );

    if (extras.isWasteAssessment(sessionParameters)) {
      resultCriteriaInfo = await wcCriteriaCalculator.getWcResultCriteriaInfo(
        chemicalReportDataAndValue,
        sampleParameters[sample.labSampleId],
        seedData as WasteClassificationCalculationData
      );
    }

    if (extras.isSoilAssessment(sessionParameters)) {
      resultCriteriaInfo = await getSoilCriteriaInfo(
        chemicalReportDataAndValue,
        sampleParameters[sample.labSampleId],
        seedData as SoilAssessmentCalculationData,
        sample.depth
      );
    }

    if (extras.isWaterAssessment(sessionParameters)) {
      resultCriteriaInfo = await getWaterCriteriaInfo(
        chemicalReportDataAndValue,
        sessionParameters,
        seedData as GwCalculationData
      );
    }
  }

  const highlightDetection = extras.highlightDetection(prefix, isAsbestosValue, value);
  const isAsbestosDetected = isAsbestosValue && extras.isAsbestosDetected(value);

  let displayOptions = null;

  if (extras.isWasteAssessment(sessionParameters)) {
    const wasteDisplayOptions = extras.getWasteDisplayOptions(
      resultCriteriaInfo.exceededCriteria,
      isAsbestosDetected,
      sessionParameters
    );
    if (wasteDisplayOptions) displayOptions = wasteDisplayOptions;
  }

  if (extras.isSoilAssessment(sessionParameters)) {
    const soilDisplayOptions = extras.getSoilDisplayOptions(
      resultCriteriaInfo.exceededCriteria,
      isAsbestosDetected,
      sessionParameters
    );
    if (soilDisplayOptions) displayOptions = soilDisplayOptions;
  }

  if (extras.isWaterAssessment(sessionParameters)) {
    const gwCriteriaDetails = reportHelper.getWaterCriteriaDetailsWithColor(seedData as GwCalculationData);
    const waterAssessmentDisplayOptions = extras.getWaterAssessmentDisplayOptions(
      resultCriteriaInfo.exceededCriteria,
      sessionParameters,
      gwCriteriaDetails
    );
    if (waterAssessmentDisplayOptions) displayOptions = waterAssessmentDisplayOptions;
  }

  const exceededCriteria = resultCriteriaInfo.exceededCriteria;
  const criteriaLimits = resultCriteriaInfo.criteriaLimits;

  const reportCell: ReportCellWithLimits = {
    value,
    isAsbestosValue,
    isAsbestosDetected,
    highlightDetection,
    prefix,
    exceededCriteria,
    criteriaLimits,
    displayOptions,
  };

  return reportCell;
}

/* 
  This method processes calculated chemicals and single chems which are used in calculated chems formulas,
  Asbestos calculations, and also manages calculated chems coming from Lab file in preference of calculations by ER.
  The main job is done by mutating 'reportData' object.
  Also it returns the list of Calculated chems.
*/
async function processCalculatedReportItems(
  reportData: ReportItem[],
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData,
  samples: Sample[],
  sessionParameters: SessionParameters,
  sampleParameters: {[key: string]: SampleParameters}
) {
  const result = ccCalculator.getCalculatedChemicalsResult(
    reportData,
    seedData.calculations,
    seedData.calculatedChemicals,
    samples,
    seedData.chemicalGroups,
    sessionParameters
  );

  for (const calculatedChemical of result) {
    for (const sampleId of Object.keys(calculatedChemical.reportCells)) {
      const sampleValue = Number(calculatedChemical.reportCells[sampleId].value);

      const seedChemical = _.find(seedData.chemicals, (x) => {
        return x.code === calculatedChemical.code;
      });
      const codeForAssessing = seedChemical.codeForAssessing ? seedChemical.codeForAssessing : calculatedChemical.code;

      const chemicalAndValueAndChemCodeForAssessing: ChemicalReportDataAndValue = {
        chemicalCode: calculatedChemical.code,
        chemicalGroupCode: calculatedChemical.group,
        resultValue: !isNaN(sampleValue) ? sampleValue : null,
        chemicalCodeForAssessing: codeForAssessing,
        units: calculatedChemical.units,
      };
      let exceededCriteria: {
        [key: string]: ExceededCriterion[];
      };
      let criteriaLimits: {
        [categoryKey: string]: IHasCriterionDetailAndValue[];
      };

      const sample = samples.find((sample) => {
        return sample.labSampleId === sampleId;
      });

      if (extras.isSoilAssessment(sessionParameters)) {
        const soilResult = await getSoilCriteriaInfo(
          chemicalAndValueAndChemCodeForAssessing,
          sampleParameters[sampleId],
          seedData as SoilAssessmentCalculationData,
          sample.depth
        );
        exceededCriteria = soilResult.exceededCriteria;
        criteriaLimits = soilResult.criteriaLimits;
      }

      if (extras.isWaterAssessment(sessionParameters)) {
        const waterResult = await getWaterCriteriaInfo(
          chemicalAndValueAndChemCodeForAssessing,
          sessionParameters,
          seedData as GwCalculationData
        );
        exceededCriteria = waterResult.exceededCriteria;
        criteriaLimits = waterResult.criteriaLimits;
      }

      if (extras.isWasteAssessment(sessionParameters)) {
        const wasteResult = wcCriteriaCalculator.getWcResultCriteriaInfo(
          chemicalAndValueAndChemCodeForAssessing,
          sampleParameters[sampleId],
          seedData as WasteClassificationCalculationData
        );
        exceededCriteria = wasteResult.exceededCriteria;
        criteriaLimits = wasteResult.criteriaLimits;
      }

      const cellItem = calculatedChemical.reportCells[sampleId];

      cellItem.exceededCriteria = exceededCriteria;
      cellItem.criteriaLimits = criteriaLimits;

      const isAsbestosDetected = cellItem.isAsbestosDetected;

      if (extras.isWasteAssessment(sessionParameters)) {
        const wasteDisplayOptions = extras.getWasteDisplayOptions(
          exceededCriteria,
          isAsbestosDetected,
          sessionParameters
        );
        if (wasteDisplayOptions) cellItem.displayOptions = wasteDisplayOptions;
      }

      if (extras.isSoilAssessment(sessionParameters)) {
        const soilDisplayOptions = extras.getSoilDisplayOptions(
          exceededCriteria,
          isAsbestosDetected,
          sessionParameters
        );
        if (soilDisplayOptions) cellItem.displayOptions = soilDisplayOptions;
      }
    }
  }

  const combinedChemicalsDisplay = sessionParameters.combinedChemicalsDisplay;

  //filter data according to session.combinedChemicalsDisplay settings
  for (const calculatedChemical of result) {
    const ccCode = calculatedChemical.code;
    let displayOption = 'combined';

    const isAsbestos = extras.isAsbestosBooleanValue(ccCode, sessionParameters.projectDetails.assessmentType);
    const isWaterAssessment = extras.isWaterAssessment(sessionParameters);

    if (isAsbestos || isWaterAssessment) {
      displayOption = 'all';
    }
    if (combinedChemicalsDisplay[ccCode]) displayOption = combinedChemicalsDisplay[ccCode];
    else {
      combinedChemicalsDisplay[ccCode] = displayOption;
    }

    switch (displayOption) {
      case 'combined':
        const chemicalsToRemove: any = seedData.calculations
          .filter((item: any) => item.calculatedChemicalsCode === ccCode)
          .map((item2: any) => item2.calculationsChemicalCode);

        for (const item of reportData) {
          if (chemicalsToRemove.includes(item.code)) {
            item.isHiddenInReport = true;
          }
        }

        break;

      case 'individual':
        for (const item of result) {
          if (item.code === ccCode) {
            item.isHiddenInReport = true;
          }
        }

        for (const item of reportData) {
          if (item.code === ccCode) {
            item.isHiddenInReport = true;
          }
        }

        break;

      case 'all':
      default:
        break;
    }
  }

  return result;
}

function getSampleParameters(
  samples: Sample[],
  sampleParameters: {[key: string]: SampleParameters}
): SampleParameterItem[] {
  const result: SampleParameterItem[] = [];

  for (const sample of samples) {
    const sampleParameterPreviewItem: SampleParameterItem = {
      labId: sample.labSampleId,
      dpId: sample.dpSampleId,
      depth: getDepthLiteral(sample.depth),
      soilType: getSampleParameter(sampleParameters, sample.labSampleId, 'soilType'),
      soilTexture: getSampleParameter(sampleParameters, sample.labSampleId, 'soilTexture'),
      clayContent: getSampleParameter(sampleParameters, sample.labSampleId, 'clayContent').value,
      cec: getSampleParameter(sampleParameters, sample.labSampleId, 'cec').value,
      ph: getSampleParameter(sampleParameters, sample.labSampleId, 'ph').value,
    };
    result.push(sampleParameterPreviewItem);
  }

  return result;
}

async function getReportItemRows(
  samples: Sample[],
  sessionParameters: SessionParameters,
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData
) {
  const resultLookup: {
    [s: string]: [
      {
        chemical: Chemical;
        group: ChemicalGroup;
        units: string;
        dissolved?: boolean;
        wcType?: AslpTclpType;
      }
    ];
  } = {};

  const chemicalsLookup: any = {};

  for (const sample of samples) {
    if (sample.measurements) {
      for (const measurement of sample.measurements) {
        chemicalsLookup[measurement.chemical.code] = true;
      }
    }
  }

  const assessmentType = sessionParameters.projectDetails.assessmentType;
  const chemicalGroups = sessionParameters.chemicalGroups[assessmentType];

  for (const group of seedData.chemicalsByGroup) {
    const groupCode = group.code;

    const isGroupSelected = _.isEmpty(chemicalGroups) ? true : _.includes(chemicalGroups, groupCode);

    if (!isGroupSelected) continue;

    const dissolvedGroup = reportHelper.getDissolvedGroupFromSeedGroup(group);

    for (const seedChemical of group.chemicals) {
      if (!chemicalsLookup[seedChemical.code]) continue;

      for (const sample of samples) {
        let measurements = _.filter(sample.measurements, (x) => x.chemical.code === seedChemical.code);

        for (const measurement of measurements) {
          if (measurement.aslpTclpType && !shouldReportAslpTclp(measurement, sessionParameters)) continue;
          let measurementChemical = {...seedChemical};

          const units = measurement.units;
          const measurementType = measurement.aslpTclpType;

          // to ensure that order is TC>TCLP>ASLP - to the chemical sort order we will add 0.1 for TCLP and 0.2 ASLP
          if (measurement.aslpTclpType) {
            const additionToSortOrder = measurementType === AslpTclpType.Tclp ? 0.1 : 0.2;
            measurementChemical.sortOrder = seedChemical.sortOrder + additionToSortOrder;
          }
          /* 
            Add new item to the lookup dictionary.
           If there's already a chem added previously, we need to verify if their 
           previous and current units are compatible (convertible). 
           If yes - skip adding new element
           */
          const itemToAdd = {
            chemical: measurementChemical,
            group: measurement.dissolved ? dissolvedGroup : group,
            units,
            dissolved: measurement.dissolved,
            wcType: measurement.aslpTclpType,
          };

          const key = `${itemToAdd.group.code}-${seedChemical.code}`;

          if (resultLookup[key]) {
            let isItemToAdd = true;
            resultLookup[key].forEach((lkp) => {
              if (
                /* !measurement.dissolved && */ unitsConverter.isUnitsConvertible(lkp.units, units) &&
                lkp.wcType === measurementType
              )
                isItemToAdd = false;
            });

            if (isItemToAdd) {
              resultLookup[key].push(itemToAdd);
            }
          } else {
            resultLookup[key] = [itemToAdd];
          }
        }
      }
    }
  }

  const result = _.flatten(Object.values(resultLookup));

  return result;
}

async function getSoilCriteriaInfo(
  chemicalAndValueAndChemCodeForAssessing: ChemicalReportDataAndValue,
  sampleParametersForSample: SampleParameters,
  seedData: SoilAssessmentCalculationData,
  depth: Depth
) {
  const hilCriteria: Criterion[] = _.filter(seedData.criteria, {group: SoilCriterionTypeName.HIL});
  const hslCriteria: Criterion[] = _.filter(seedData.criteria, {group: SoilCriterionTypeName.HSL});
  const dcCriteria: Criterion[] = _.filter(seedData.criteria, {group: SoilCriterionTypeName.DC});
  const eilCriteria: Criterion[] = _.filter(seedData.criteria, {group: SoilCriterionTypeName.EIL});
  const eslCriteria: Criterion[] = _.filter(seedData.criteria, {group: SoilCriterionTypeName.ESL});
  const mlCriteria: Criterion[] = _.filter(seedData.criteria, {group: SoilCriterionTypeName.ML});
  const egvCriteria: Criterion[] = _.filter(seedData.criteria, {group: SoilCriterionTypeName.EGV_INDIR});

  criteriaCalculator.addCriteriaData(seedData);

  const hilExceededResult = criteriaCalculator.validateHilCriteriaExceedance(
    chemicalAndValueAndChemCodeForAssessing,
    hilCriteria
  );

  const hslExceededResult = criteriaCalculator.validateHslCriteriaExceedance(
    chemicalAndValueAndChemCodeForAssessing,
    hslCriteria,
    sampleParametersForSample,
    depth
  );

  const dcExceededResult = criteriaCalculator.validateDcCriteriaExceedance(
    chemicalAndValueAndChemCodeForAssessing,
    dcCriteria
  );

  const eilExceededResult = criteriaCalculator.validateEilCriteriaExceedance(
    chemicalAndValueAndChemCodeForAssessing,
    eilCriteria,
    sampleParametersForSample
  );

  const eslExceededResult = criteriaCalculator.validateEslCriteriaExceedance(
    chemicalAndValueAndChemCodeForAssessing,
    eslCriteria,
    sampleParametersForSample
  );

  const mlExceededResult = criteriaCalculator.validateMlCriteriaExceedance(
    chemicalAndValueAndChemCodeForAssessing,
    mlCriteria,
    sampleParametersForSample
  );

  const hsl_0_1_ExceededResult = criteriaCalculator.validateHsl_0_1Exceedance(
    chemicalAndValueAndChemCodeForAssessing,
    hslCriteria,
    sampleParametersForSample
  );

  const egvExceededResult = criteriaCalculator.validateEgvCriteriaExceedance(
    chemicalAndValueAndChemCodeForAssessing,
    egvCriteria
  );

  const result: ResultCriteriaInfo = {
    exceededCriteria: {
      // eslint-disable-next-line
      [SoilCriterionTypeName.HIL]: hilExceededResult.exceededCriteria,
      // eslint-disable-next-line
      [SoilCriterionTypeName.HSL]: hslExceededResult.exceededCriteria,
      // eslint-disable-next-line
      [SoilCriterionTypeName.DC]: dcExceededResult.exceededCriteria,
      // eslint-disable-next-line
      [SoilCriterionTypeName.EIL]: eilExceededResult.exceededCriteria,
      // eslint-disable-next-line
      [SoilCriterionTypeName.ESL]: eslExceededResult.exceededCriteria,
      // eslint-disable-next-line
      [SoilCriterionTypeName.ML]: mlExceededResult.exceededCriteria,
      // eslint-disable-next-line
      [SoilCriterionTypeName.HSL_0_1]: hsl_0_1_ExceededResult.exceededCriteria,
      // eslint-disable-next-line
      [SoilCriterionTypeName.EGV_INDIR]: egvExceededResult.exceededCriteria,
    },
    criteriaLimits: {
      // eslint-disable-next-line
      [CriterionCategory.Health]: hilExceededResult.hilCriteriaLimits.concat(hslExceededResult.hslCriteriaLimits),
      // eslint-disable-next-line
      [CriterionCategory.Ecological]: eilExceededResult.eilCriteriaLimits.concat(eslExceededResult.eslCriteriaLimits),
    },
  };
  return result;
}

async function getWaterCriteriaInfo(
  chemicalReportDataAndValue: ChemicalReportDataAndValue,
  sessionParameters: SessionParameters,
  seedData: GwCalculationData
) {
  const puCriteriaSeed: any = _.filter(seedData.criteria, {group: GwCriterionType.PotentialUse});
  const wqCriteriaSeed: any = _.filter(seedData.criteria, {group: GwCriterionType.WaterQuality});
  const viCriteriaSeed: any = _.filter(seedData.criteria, {group: GwCriterionType.VapourIntrusion});

  gwCriteriaCalculator.addCriteriaData(seedData);

  const puExceededResult = gwCriteriaCalculator.validatePUCriteriaExceedance(
    chemicalReportDataAndValue,
    puCriteriaSeed
  );

  const wqExceededResult = gwCriteriaCalculator.validateWqCriteriaExceedance(
    chemicalReportDataAndValue,
    wqCriteriaSeed,
    seedData,
    sessionParameters
  );

  const viExceededResult = gwCriteriaCalculator.validateViCriteriaExceedance(
    chemicalReportDataAndValue,
    viCriteriaSeed,
    sessionParameters
  );

  const exceededCriteria = {
    // eslint-disable-next-line
    [GwCriterionType.PotentialUse]: puExceededResult.exceededCriteria,
    // eslint-disable-next-line
    [GwCriterionType.WaterQuality]: wqExceededResult.exceededCriteria,
    // eslint-disable-next-line
    [GwCriterionType.VapourIntrusion]: viExceededResult.exceededCriteria,
  };

  const allLimits: IHasCriterionDetailAndValue[] = puExceededResult.puCriteriaLimits.concat(
    wqExceededResult.wqCriteriaLimits,
    viExceededResult.viCriteriaLimits
  );
  const criteriaLimits = {
    // eslint-disable-next-line
    [AssessmentType.Water]: allLimits,
  };

  const result = {exceededCriteria, criteriaLimits};
  return result;
}

function getDepthLiteral(depth: Depth) {
  if (depth.to === depth.from) {
    return `${depth.from} m`;
  } else {
    return `${depth.from} - ${depth.to} m`;
  }
}

function getSampleParameter(sampleParameters: any, labSampleId: string, fieldName: string) {
  return sampleParameters[labSampleId][fieldName];
}

function getMinValue(values: number[]) {
  const min = _.min(values);

  if (_.isNumber(min)) return min;

  return null;
}

function getMaxValue(values: number[]) {
  const max = _.max(values);

  if (_.isNumber(max)) return max;

  return null;
}

function getMeanValue(values: number[], pqlValue: number) {
  const valuesWithoutNaN = values.filter(function (value) {
    return !Number.isNaN(value);
  });

  const mean = _.mean(valuesWithoutNaN);

  let decimalPartLength = 0;

  function getDecimalPartLength(number: number) {
    const parts = number.toString().split('.');
    if (parts.length > 1) {
      return parts[1].length;
    }
    return 0;
  }

  if (_.isNumber(mean)) {
    if (pqlValue) {
      decimalPartLength = getDecimalPartLength(pqlValue);
    } else {
      values.forEach((element) => {
        const valueDecimalPartLength = getDecimalPartLength(element);
        if (valueDecimalPartLength > decimalPartLength) {
          decimalPartLength = valueDecimalPartLength;
        }
      });
    }
    return _.round(mean, decimalPartLength);
  }

  return null;
}

function getRoundedValue(value: string): string {
  const numValue = +value;

  if (!_.isNumber(numValue)) return value;

  const decimals = _.fill(Array(CONSTANTS.VALUE_DECIMALS_COUNT), '0');
  const multiplier = +['1', ...decimals].join(''); // receiving a number (10)n, e.g. 10000
  const res = Math.round((numValue + Number.EPSILON) * multiplier) / multiplier;

  return res.toString();
}

function addExtraValues(resultData: any[], sessionParameters: SessionParameters) {
  for (const previewItem of resultData) {
    const addExtraValue = (key: string, value: number) => {
      previewItem.extraFields[key] = {
        value,
      };
    };

    const getValueFromExtras = (key: string) => {
      const edits = sessionParameters.edits || {};

      if (_.isEmpty(edits)) return null;

      const id = `${previewItem.code}#${previewItem.units}`;

      const editsItem: any = edits[id];

      let value: any = null;
      if (editsItem && editsItem.isSelected && editsItem[key]) {
        value = editsItem[key];
      }

      return value;
    };

    const sampleValues = Object.keys(previewItem.reportCells).map((key) => {
      return Number(previewItem.reportCells[key].value);
    });

    addExtraValue('min', getMinValue(sampleValues));
    addExtraValue('max', getMaxValue(sampleValues));
    addExtraValue('mean', getMeanValue(sampleValues, previewItem.pqlValue));
    addExtraValue('standardDeviation', getValueFromExtras('standardDeviation'));
    addExtraValue('ucl', getValueFromExtras('ucl'));
  }
}

function shouldReportAslpTclp(measurement: ChemicalMeasurement, sessionParameters: SessionParameters) {
  if (extras.isWaterAssessment(sessionParameters)) {
    return false;
  }

  if (measurement.aslpTclpType === AslpTclpType.Aslp) {
    if (extras.isWasteAssessment(sessionParameters)) {
      return false;
    }
    if (sessionParameters.shouldOutputAslp) {
      return true;
    }
  }
  if (measurement.aslpTclpType === AslpTclpType.Tclp) {
    if (extras.isWasteAssessment(sessionParameters)) {
      return true;
    }
    if (sessionParameters.shouldOutputTclp) {
      return true;
    }
  }
}

function getReportItemsWithoutRinsateTbTS(reportItems: ReportItem[], samples: Sample[]) {
  const excludedValues = [
    ValueAbbreviations.Dash.toString(),
    ValueAbbreviations.NoData.toString(),
    ValueAbbreviations.NotTested.toString(),
  ];
  const relevantSampleIds = samples
    .filter((sample) => !sample.isTripBlank && !sample.isRinsate && !sample.isTripSpike)
    .map((sample) => sample.labSampleId);

  const filteredItems = reportItems
    .map((reportItem) => {
      const filteredReportCells = Object.fromEntries(
        Object.entries(reportItem.reportCells).filter(([labSampleId]) => relevantSampleIds.includes(labSampleId))
      );

      // Check if all reportCells are 'ND' and not isAsbestosValue
      const shouldRemoveReportItem = Object.values(filteredReportCells).every(
        (cell) => excludedValues.includes(cell.value) && !cell.isAsbestosValue
      );

      return !shouldRemoveReportItem && Object.keys(filteredReportCells).length > 0
        ? {...reportItem, reportCells: filteredReportCells}
        : null;
    })
    .filter(Boolean); // Remove null values

  return filteredItems;
}
