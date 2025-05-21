import * as _ from 'lodash';

import extras from './extras';
import * as CONSTANTS from '../constants/constants';

export default {
  getCalculatedChemicalsResult,
  removeIncompleteGroups, //export for test only
  groupCalculatedChemicalsWithSamples, //export for test only,
};

function getCalculatedChemicalsResult(
  reportData: ReportItem[],
  calculationsSeedData: Calculation[],
  ccSeedData: Chemical[],
  samplesData: Sample[],
  groupsSeedData: ChemicalGroup[],
  sessionParameters: SessionParameters
): ReportItem[] {
  const calculatedChemsByER: ReportItem[] = [];

  const groupedData: Dictionary<ReportItem[]> = groupCalculatedChemicalsWithSamples(
    reportData,
    calculationsSeedData,
    sessionParameters
  );

  if (extras.isSoilAssessment(sessionParameters)) {
    removeIncompleteGroups(groupedData, calculationsSeedData, ccSeedData);
  }

  for (const key of Object.keys(groupedData)) {
    const [calculatedChemicalsCode, units] = key.split('#');

    const groupedFpdItem: any = groupedData[key];
    const ccItem = _.find(ccSeedData, {code: calculatedChemicalsCode});

    if (!ccItem) continue;

    const pqlValue = _.min(_.map(groupedFpdItem, (x) => x.pqlValue));
    const codeForAssessing = ccItem.codeForAssessing ? ccItem.codeForAssessing : ccItem.code;

    const ccChemicalGroup = _.find(groupsSeedData, (group) => group.code === ccItem.chemicalGroup);

    const reportItem: ReportItem = {
      code: calculatedChemicalsCode,
      group: ccItem.chemicalGroup,
      chemical: ccItem.name,
      isCalculated: true,
      isCalculable: true,
      units: units,
      pqlValue: pqlValue,
      pqlPrefix: null,
      groupSortOrder: ccChemicalGroup ? ccChemicalGroup.sortOrder : 0,
      sortOrder: ccItem.sortOrder,
      isHiddenInReport: false,
      chemicalCodeForAssessing: codeForAssessing,
      extraFields: {
        min: null,
        max: null,
        mean: null,
        standardDeviation: null,
        ucl: null,
      },
      reportCells: {},
      replicates: [],
      wcType: null,
    };

    const sampleIds = samplesData.map((item) => item.labSampleId);

    for (const sampleId of sampleIds) {
      let isCalculatedValueND = true;
      let isAsbestosDetected = false;
      let isAsbestosNotTested = true;
      let calculatedValue = 0;
      let calculatedValueLess: number | null = null;

      const isAsbestosCalculation = ccItem.calculationFormulaType === CalculationFormulaType.AsbestosWorseVariant;
      let resultValue: string = ValueAbbreviations.NoData;
      let resultPrefix = ValuePrefixType.ExactValue;

      let ccCalculatedChemicalResult = _.find(groupedFpdItem, (fpdItem) => fpdItem.code === ccItem.code)?.reportCells?.[
        sampleId
      ];

      let wasCalculatedByLab =
        ccCalculatedChemicalResult && ccCalculatedChemicalResult.value !== ValueAbbreviations.NoData;

      if (!wasCalculatedByLab) {
        for (let i = 0; i < groupedFpdItem.length; i++) {
          const reportCells = groupedFpdItem[i].reportCells;
          if (reportCells && reportCells[sampleId]) {
            const sample = reportCells[sampleId];

            if (sample && sample.value !== ValueAbbreviations.NoData) {
              isCalculatedValueND = false;

              const sampleValue = parseFloat(sample.value);

              if (isAsbestosCalculation) {
                isAsbestosDetected =
                  isAsbestosDetected ||
                  (sample.value && sample.value.toString().toLowerCase() === AsbestosValueType.Detected.toLowerCase());

                isAsbestosNotTested = isAsbestosNotTested && sample.value === AsbestosValueType.NotTested;
              } else if (sample.prefix === ValuePrefixType.Less) {
                if (!calculatedValueLess || calculatedValueLess > sampleValue) {
                  calculatedValueLess = sampleValue;
                }
              } else if (ccItem.calculationFormulaType === CalculationFormulaType.Sum) {
                calculatedValue = _.round(calculatedValue + sampleValue, 3);
              }
            }
          }
        }

        if (!isCalculatedValueND) {
          if (calculatedValue) {
            resultValue = calculatedValue.toString();
          } else if (calculatedValueLess) {
            resultValue = calculatedValueLess.toString();
          }
        }

        if (!calculatedValue && calculatedValueLess) {
          resultPrefix = ValuePrefixType.Less;
        }

        if (isAsbestosCalculation) {
          if (isAsbestosDetected) {
            resultValue = AsbestosValueType.Detected;
          } else if (isAsbestosNotTested) {
            resultValue = AsbestosValueType.NotTested;
          } else {
            resultValue = AsbestosValueType.NotDetected;
          }
        }
      } else {
        resultValue = ccCalculatedChemicalResult.value;
        resultPrefix = ccCalculatedChemicalResult.prefix;
      }
      const highlightDetection = extras.highlightDetection(resultPrefix, isAsbestosCalculation, resultValue.toString());

      reportItem.reportCells[sampleId] = {
        value: resultValue,
        prefix: resultPrefix,
        displayOptions: null,
        isAsbestosValue: isAsbestosCalculation,
        isAsbestosDetected: isAsbestosDetected,
        highlightDetection,
      };
    }

    calculatedChemsByER.push(reportItem);
  }

  const calculatedChemsResult = _.union(calculatedChemsByER).filter((el) => el.isCalculable);

  return calculatedChemsResult;
}

function groupCalculatedChemicalsWithSamples(
  reportItems: ReportItem[],
  calculationsSeedData: Calculation[],
  sessionParameters: SessionParameters
): Dictionary<ReportItem[]> {
  // Group calculationsSeedData by calculationsChemicalCode
  const calculationsSeedDataObj = _.groupBy(calculationsSeedData, 'calculationsChemicalCode');

  // Extract unique calculationsChemicalCode values
  const seedCalculationsCodes = Array.from(new Set(calculationsSeedData.map((item) => item.calculationsChemicalCode)));

  // Filter reportItems based on seedCalculationsCodes
  let filteredData: ReportItem[] = reportItems.filter((item) => {
    if (extras.isWasteAssessment(sessionParameters)) {
      return seedCalculationsCodes.includes(item.code) && !item.wcType;
    }
    return seedCalculationsCodes.includes(item.code);
  });

  // Extend filteredData with calculatedChemicalsCode from calculationsSeedDataObj
  const extendedData = [];
  for (const reportItem of filteredData) {
    const calculationsSeedDataArray = calculationsSeedDataObj[reportItem.code];
    for (const calculationsSeedDataItem of calculationsSeedDataArray) {
      const extendedItem = {
        ...reportItem,
        calculatedChemicalsCode: calculationsSeedDataItem.calculatedChemicalsCode,
      };
      extendedData.push(extendedItem);
    }
  }

  // Add items with calculatedChemicalsCode from Lab file to extendedData
  reportItems.forEach((item) => {
    if (_.find(calculationsSeedData, (calculation) => calculation.calculatedChemicalsCode === item.code)) {
      extendedData.unshift({...item, calculatedChemicalsCode: item.code});
    }
  });

  // Group extendedData by calculatedChemicalsCode and units
  const groupedData = _.groupBy(extendedData, (item) => {
    let asbestosCodes: string[] = [];
    if (extras.isSoilAssessment(sessionParameters)) {
      asbestosCodes = CONSTANTS.asbestosCodesSoil;
    }
    if (extras.isWasteAssessment(sessionParameters)) {
      asbestosCodes = CONSTANTS.asbestosCodesWaste;
    }

    if (asbestosCodes.includes(item.code)) {
      return `${item.calculatedChemicalsCode}`;
    } else {
      return `${item.calculatedChemicalsCode}#${item.units}`;
    }
  });
  return groupedData;
}

function removeIncompleteGroups(
  groupedData: Dictionary<ReportItem[]>,
  calculationsSeedData: Calculation[],
  ccSeedData: Chemical[] = []
) {
  const groupedSeedData = _.groupBy(calculationsSeedData, (item) => item.calculatedChemicalsCode);

  for (const key of Object.keys(groupedData)) {
    const [calculatedChemicalsCode] = key.split('#');
    // do not exclude group if it has 'AsbestosWorseVariant' formula type (for Asbestos)
    const ccSeedGroup = _.find(ccSeedData, (el) => el.code === calculatedChemicalsCode);
    if (ccSeedGroup?.calculationFormulaType === 'AsbestosWorseVariant') continue;

    if (groupedData[key].length < groupedSeedData[calculatedChemicalsCode].length) {
      delete groupedData[key];
    }
  }
}
