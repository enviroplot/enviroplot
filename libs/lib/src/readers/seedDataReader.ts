import * as _ from 'lodash';
import utils from '../utils';

import * as constants from '../constants/constants';
import {Workbook, Worksheet} from 'exceljs';
import readerHelper from '../import/readerHelper';

const Excel = utils.loadModule('exceljs');

export default {
  readSeedData,
  setChemicalDetails, //for tests
};

let soilAssessmentData: SoilAssessmentCalculationData = null;
let wasteClassificationData: WasteClassificationCalculationData = null;
let groundWaterData: GwCalculationData = null;

async function readSeedData(
  chemicalsSeedFilePath: string,
  soilAssessmentSeedFilePath: string,
  wasteClassificationSeedFilePath: string,
  groundWaterSeedFilePath: string
) {
  const soilData = await readSoilSeedData(chemicalsSeedFilePath, soilAssessmentSeedFilePath);
  const wasteData = await readWasteSeedData(chemicalsSeedFilePath, wasteClassificationSeedFilePath);
  const waterData = await readWaterSeedData(chemicalsSeedFilePath, groundWaterSeedFilePath);

  const data = {
    soilData,
    wasteData,
    waterData,
  };

  return data;
}

/*
  When reading seed file, the chems in the 'Chemicals' and 'CalculatedGroups' tabs must be distinct.
  Here we're checking this requirement and creating set of warnings if duplications exist.
*/
function validateChemicalsVsCalculated(
  wbType: string,
  assessmentChemicals: Chemical[],
  calculatedChemicals: Chemical[]
): void {
  let warnings: string[] = [];
  const header = `\nWarning! Duplicates found in ${wbType} module among the Chemicals and CalculatedGroups tabs:\n`;

  warnings = _.intersectionBy(assessmentChemicals, calculatedChemicals, (el) => el?.code).map(
    (item) => `\t{code: ${item.code}, name: ${item.name}}`
  );

  if (!_.isEmpty(warnings)) console.log(header, warnings.join('\n'));
}

/*
  When reading seed file, all the Chems from 'Calculations' ('CalculationsChemicalCode' column) tab must be listed in the 'Chemicals' tab.
  Here we're checking this requirement and creating set of warnings if absentness found.
*/
function validateCalculationsVsChemicals(
  wbType: string,
  calculationsChemicals: Calculation[],
  assessmentChemicals: Chemical[]
): void {
  let warnings: string[] = [];
  const header = `\nWarning! Lost chems found in ${wbType} module in the Calculations tab which are being used in CalculatedGroups tab:\n`;

  calculationsChemicals.forEach((calcItem) => {
    if (!_.find(assessmentChemicals, (item) => calcItem.calculationsChemicalCode === item.code)) {
      warnings.push(`\tcode: ${calcItem.calculationsChemicalCode}`);
    }
  });

  if (!_.isEmpty(warnings)) console.log(header, warnings.join('\n'));
}

function validateChemicalGroups(
  wbType: string,
  assessmentChemicals: Chemical[],
  calculatedChemicals: Chemical[],
  chemicalGroups: ChemicalGroup[]
): void {
  function checkChemicals(chemicals: Chemical[], header: string) {
    const warnings: string[] = [];

    chemicals.forEach((chemical) => {
      if (!_.find(chemicalGroups, (group) => chemical.chemicalGroup === group.code)) {
        warnings.push(`\tchemical group: ${chemical.chemicalGroup} for chemical ${chemical.name} (${chemical.code})`);
      }
    });

    if (!_.isEmpty(warnings)) console.log(header, warnings.join('\n'));
  }

  const assessmentHeader = `\nWarning! In the ${wbType} module in the ChemGroups tab group is missing, which is listed in Chemicals tab\n`;
  checkChemicals(assessmentChemicals, assessmentHeader);

  const calculatedHeader = `\nWarning! In the ${wbType} module in the ChemGroups tab group is missing, which is listed in Calcs tab\n`;
  checkChemicals(calculatedChemicals, calculatedHeader);
}

async function readWasteSeedData(chemicalsSeedFilePath: string, wasteAssessmentSeedFilePath: string) {
  if (wasteClassificationData) return wasteClassificationData;

  let chemicalsWorkbook: Workbook = new Excel.Workbook();
  let wasteClassificationWorkbook: Workbook = new Excel.Workbook();

  await chemicalsWorkbook.xlsx.readFile(chemicalsSeedFilePath);
  await wasteClassificationWorkbook.xlsx.readFile(wasteAssessmentSeedFilePath);

  let chemicalsData = getChemicalsSeedData('Waste', chemicalsWorkbook, wasteClassificationWorkbook);

  let wasteClassificationCriterionDetails = getWCCriterionDetails(wasteClassificationWorkbook.getWorksheet('Criteria'));

  wasteClassificationData = {
    chemicalGroups: chemicalsData.chemicalGroups,
    chemicals: chemicalsData.assessmentChemicals,
    calculatedChemicals: chemicalsData.calculatedChemicals,
    chemicalsByGroup: chemicalsData.chemicalsByGroup,
    calculations: chemicalsData.assessmentCalculations,
    wasteClassificationCriterionDetails,
  };

  return wasteClassificationData;
}

async function readSoilSeedData(chemicalsSeedFilePath: string, soilAssessmentSeedFilePath: string) {
  if (soilAssessmentData) return soilAssessmentData;

  let chemicalsWorkbook: Workbook = new Excel.Workbook();
  let soilAssessmentWorkbook: Workbook = new Excel.Workbook();

  await chemicalsWorkbook.xlsx.readFile(chemicalsSeedFilePath);
  await soilAssessmentWorkbook.xlsx.readFile(soilAssessmentSeedFilePath);

  let chemicalsData = getChemicalsSeedData('Soil', chemicalsWorkbook, soilAssessmentWorkbook);

  let criteriaGroups = getCriteriaGroups(soilAssessmentWorkbook.getWorksheet('CriteriaGroups'));

  let criteria = getCriteria(soilAssessmentWorkbook.getWorksheet('Criteria'));

  let hilCriterionDetails = getHilCriterionDetails(soilAssessmentWorkbook.getWorksheet('HIL'));
  let hslCriterionDetails = getHslCriterionDetails(soilAssessmentWorkbook.getWorksheet('HSL'));
  let dcCriterionDetails = getDcCriterionDetails(soilAssessmentWorkbook.getWorksheet('DC'));
  let eilCriterionDetails = getEilCriterionDetails(soilAssessmentWorkbook.getWorksheet('EIL'));
  let eslCriterionDetails = getEslCriterionDetails(soilAssessmentWorkbook.getWorksheet('ESL'));
  let mlCriterionDetails = getMlCriterionDetails(soilAssessmentWorkbook.getWorksheet('ML'));
  let egvCriterionDetails = getEgvCriterionDetails(soilAssessmentWorkbook.getWorksheet('EGV-Indir'));

  soilAssessmentData = {
    chemicalGroups: chemicalsData.chemicalGroups,
    chemicals: chemicalsData.assessmentChemicals,
    calculatedChemicals: chemicalsData.calculatedChemicals,
    chemicalsByGroup: chemicalsData.chemicalsByGroup,
    calculations: chemicalsData.assessmentCalculations,
    criteriaGroups,
    criteria,
    hilCriterionDetails,
    hslCriterionDetails,
    dcCriterionDetails,
    eilCriterionDetails,
    eslCriterionDetails,
    mlCriterionDetails,
    egvCriterionDetails,
  };

  return soilAssessmentData;
}

async function readWaterSeedData(chemicalsSeedFilePath: string, groundWaterSeedFilePath: string) {
  if (groundWaterData) return groundWaterData;

  let chemicalsWorkbook = new Excel.Workbook();
  let gwWorkbook: Workbook = new Excel.Workbook();

  await chemicalsWorkbook.xlsx.readFile(chemicalsSeedFilePath);
  await gwWorkbook.xlsx.readFile(groundWaterSeedFilePath);

  let chemicalsData = getChemicalsSeedData('Water', chemicalsWorkbook, gwWorkbook, true);

  let criteriaGroups = getCriteriaGroups(gwWorkbook.getWorksheet('CriteriaGroups'));

  let criteria = getCriteria(gwWorkbook.getWorksheet('Criteria'));

  let vapourIntrusionCriterionDetails = getVapourIntrusionCriterionDetails(
    gwWorkbook.getWorksheet('CriterionDetailVapourIntrusion')
  );
  let waterQualityCriterionDetails = getWaterQualityCriterionDetails(
    gwWorkbook.getWorksheet('CriterionDetailWaterQuality')
  );

  let potentialUseCriterionDetails = getPotentialUseCriterionDetails(
    gwWorkbook.getWorksheet('CriterionDetailPotentialUse')
  );

  groundWaterData = {
    chemicalGroups: chemicalsData.chemicalGroups,
    chemicals: chemicalsData.assessmentChemicals,
    calculatedChemicals: chemicalsData.calculatedChemicals,
    chemicalsByGroup: chemicalsData.chemicalsByGroup,
    calculations: chemicalsData.assessmentCalculations,
    criteriaGroups,
    criteria,
    vapourIntrusionCriterionDetails,
    waterQualityCriterionDetails,
    potentialUseCriterionDetails,
  };
  return groundWaterData;
}

function getChemicalsSeedData(wbType: string, chemicalsWorkbook: any, assessmentWorkbook: any, isWater?: boolean) {
  let systemChemicals = getSystemChemicals(chemicalsWorkbook.getWorksheet('Chemicals'));

  let chemicalGroups = getChemicalGroups(assessmentWorkbook.getWorksheet('ChemGroups'));
  let calculatedChemicals = getCalculatedChemicals(assessmentWorkbook.getWorksheet('CalcGroups'));
  let assessmentChemicals = getAssessmentSpecificChemicals(assessmentWorkbook.getWorksheet('Chemicals'), isWater);
  let calculations = getCalculations(assessmentWorkbook.getWorksheet('Calcs'));

  setChemicalDetails(systemChemicals, assessmentChemicals);

  validateChemicalsVsCalculated(wbType, assessmentChemicals, calculatedChemicals);
  validateCalculationsVsChemicals(wbType, calculations, assessmentChemicals);
  validateChemicalGroups(wbType, assessmentChemicals, calculatedChemicals, chemicalGroups);

  assessmentChemicals = assessmentChemicals.concat(calculatedChemicals);

  let chemicalsByGroup = getChemicalsByGroup(assessmentChemicals, chemicalGroups);

  let assessmentChemicalsCodes: string[] = [];
  assessmentChemicals.forEach((element) => {
    assessmentChemicalsCodes.push(element.code);
  });

  let assessmentCalculations: Calculation[] = [];

  calculations.forEach((element) => {
    if (assessmentChemicalsCodes.includes(element.calculationsChemicalCode && element.calculatedChemicalsCode)) {
      assessmentCalculations.push(element);
    }
  });

  let result = {
    chemicalGroups,
    assessmentChemicals,
    calculatedChemicals,
    chemicalsByGroup,
    assessmentCalculations,
  };

  return result;
}

function getChemicalsByGroup(chemicalList: Chemical[], groupList: ChemicalGroup[]): ChemicalGroup[] {
  let result = _.sortBy(groupList, (x) => x.sortOrder);
  for (let group of result) {
    let chemicals = _.filter(chemicalList, (x) => x.chemicalGroup === group.code);
    chemicals = _.sortBy(chemicals, (x) => x.sortOrder);
    group.chemicals = chemicals;
  }
  return result;
}

function setChemicalDetails(allChemicals: Chemical[], assessmentChemicals: Chemical[]): Chemical[] {
  let result = assessmentChemicals;

  for (let chemical of result) {
    let systemChemical = _.find(allChemicals, (x) => x.code === chemical.code);

    if (!systemChemical?.name) {
      console.log('Warning! The following chemical is missing in the Chemicals Workbook:', chemical);
    } else {
      chemical.name = systemChemical.name;
      chemical.altCodes =
        systemChemical.altCodes && systemChemical.altCodes.length > 0 ? systemChemical.altCodes : null;
    }
  }

  return result;
}

function getChemicalGroups(ws: Worksheet): ChemicalGroup[] {
  let result: ChemicalGroup[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let chemicalGroup: ChemicalGroup = {
      code: row[1],
      name: row[2],
      description: row[3],
      sortOrder: row[4],
      isStandardContaminantSuite: row[5] ? true : false,
      chemicals: [],
    };

    result.push(chemicalGroup);
  });

  return result;
}

function getSystemChemicals(ws: Worksheet): Chemical[] {
  let result: Chemical[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let altCodes: string[] = [];

    if (row[3]) {
      altCodes = row[3].split(',').map((code: string) => code.trim());
    }
    let chemical: Chemical = {
      code: row[1],
      name: row[2],
      sortOrder: -1,
      chemicalGroup: '',
      calculated: false,
      calculationFormulaType: CalculationFormulaType.NotDefined,
      codeForAssessing: '',
      isBioaccumulative: false,
      altCodes: altCodes,
    };

    result.push(chemical);
  });

  return result;
}

function getAssessmentSpecificChemicals(ws: Worksheet, isWater?: boolean): Chemical[] {
  let result: Chemical[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let chemical: Chemical = {
      code: row[2],
      name: '',
      sortOrder: row[3],
      chemicalGroup: row[1],
      calculated: false,
      calculationFormulaType: CalculationFormulaType.NotDefined,
      codeForAssessing: '',
    };

    if (isWater) {
      chemical.isBioaccumulative = row[4];
    }

    result.push(chemical);
  });

  return result;
}

function getCalculatedChemicals(ws: Worksheet): Chemical[] {
  let result: Chemical[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let chemical: Chemical = {
      code: row[2],
      name: row[3],
      sortOrder: row[5],
      chemicalGroup: row[1],
      calculated: true,
      calculationFormulaType: row[4],
      codeForAssessing: row[6],
    };

    result.push(chemical);
  });

  return result;
}

function getCalculations(ws: Worksheet): Calculation[] {
  let result: Calculation[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let calculation: Calculation = {
      calculatedChemicalsCode: row[1],
      calculationsChemicalCode: row[2],
    };

    result.push(calculation);
  });

  return result;
}

function getCriteriaGroups(ws: Worksheet): CriteriaGroup[] {
  let result: CriteriaGroup[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let criteriaGroups: CriteriaGroup = {
      code: row[1],
      description: row[2],
      criteria: [],
    };

    result.push(criteriaGroups);
  });

  return result;
}

function getCriteria(ws: Worksheet): Criterion[] {
  let result: Criterion[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let criterion: Criterion = {
      group: row[1],
      code: row[2],
      name: row[3],
      category: row[4],
      sortOrder: row[5],
      dataSource: row[6],
    };

    result.push(criterion);
  });

  return result;
}

function getHilCriterionDetails(ws: Worksheet): HilDcCriterionDetail[] {
  let result: HilDcCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let hilCriterionDetail: HilDcCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      value: row[3],
      units: row[4],
      criterionDataSource: row[6],
    };

    result.push(hilCriterionDetail);
  });

  return result;
}

function getEgvCriterionDetails(ws: Worksheet): EgvCriterionDetail[] {
  let result: EgvCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let egvCriterionDetail: EgvCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      value: row[3],
      units: row[4],
      criterionDataSource: row[6],
    };

    result.push(egvCriterionDetail);
  });

  return result;
}

function getHslCriterionDetails(ws: Worksheet): HslCriterionDetail[] {
  let result: HslCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let strValue: string = row[5];
    let value: number = 0;
    let isUnlimited = false;

    if (strValue === ValueAbbreviations.UnlimitedCriterion) {
      value = constants.unlimitedDecimalCriterion;
      isUnlimited = true;
    } else {
      value = Number(strValue);
    }

    let hslCriterionDetail: HslCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      soilType: row[3],
      depthLevel: getDepthLevel(row[4]),
      value,
      isUnlimited,
      units: row[6],
      criterionDataSource: row[7],
    };

    result.push(hslCriterionDetail);
  });

  return result;
}

function getPotentialUseCriterionDetails(ws: Worksheet): GwPotentialUseCriterionDetail[] {
  let result: GwPotentialUseCriterionDetail[] = [];
  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let strValue: string = row[3];
    let value: number = 0;

    //check that number has more then 5 decimals after dot

    if (strValue !== ValueAbbreviations.ID) {
      value = Number(strValue);

      let waterQualityCriterionDetail: GwPotentialUseCriterionDetail = {
        criterionDetail: {
          chemicalCode: row[1],
          criterionCode: row[2],
        },
        value,
        units: row[4],
      };

      result.push(waterQualityCriterionDetail);
    }
  });

  return result;
}

function getWaterQualityCriterionDetails(ws: Worksheet): GwWaterQualityCriterionDetail[] {
  let result: GwWaterQualityCriterionDetail[] = [];
  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let strValue: string = row[5];
    let value: number = 0;

    if (strValue !== ValueAbbreviations.ID) {
      value = Number(strValue);

      let waterQualityCriterionDetail: GwWaterQualityCriterionDetail = {
        criterionDetail: {
          chemicalCode: row[1],
          criterionCode: row[2],
        },
        waterEnvironment: getWaterEnvironment(row[3]),
        speciesProtectionLevel: getSpeciesProtectionLevel(row[4]),
        value,
        units: row[6],
      };

      result.push(waterQualityCriterionDetail);
    }
  });

  return result;
}

function getVapourIntrusionCriterionDetails(ws: Worksheet): GwVapourIntrusionCriterionDetail[] {
  let result: GwVapourIntrusionCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let strValue: string = row[6];
    let value: number = 0;
    let isUnlimited = false;

    if (strValue === ValueAbbreviations.UnlimitedCriterion) {
      value = constants.unlimitedDecimalCriterion;
      isUnlimited = true;
    } else {
      value = Number(strValue);
    }

    let gwVapourIntrusionCriterionDetail: GwVapourIntrusionCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      hslCode: getGwHslType(row[3]),
      soilType: row[4],
      depthLevel: getGwDepthLevel(row[5]),
      value,
      isUnlimited,
      units: row[7],
    };

    result.push(gwVapourIntrusionCriterionDetail);
  });

  return result;
}

function getDcCriterionDetails(ws: Worksheet): HilDcCriterionDetail[] {
  let result: HilDcCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let dcCriterionDetail: HilDcCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      value: row[3],
      units: row[4],
      criterionDataSource: row[6],
    };

    result.push(dcCriterionDetail);
  });

  return result;
}

function getEilCriterionDetails(ws: Worksheet): EilCriterionDetail[] {
  let result: EilCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let contaminationType = null;
    if (row[6] === ContaminationType.Aged) {
      contaminationType = ContaminationType.Aged;
    }

    if (row[6] === ContaminationType.Fresh) {
      contaminationType = ContaminationType.Fresh;
    }

    let eilCriterionDetail: EilCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      ph: row[3],
      cec: row[4],
      clayContent: row[5],
      contaminationType,
      value: row[7],
      units: row[8],
      criterionDataSource: row[10],
    };

    result.push(eilCriterionDetail);
  });

  return result;
}

function getEslCriterionDetails(ws: Worksheet): EslCriterionDetail[] {
  let result: EslCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let value = row[4];

    if (value === ValueAbbreviations.NoCriterion) return;

    let eslCriterionDetail: EslCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      soilTexture: row[3],
      value,
      units: row[5],
      criterionDataSource: row[7],
    };

    result.push(eslCriterionDetail);
  });

  return result;
}

function getMlCriterionDetails(ws: Worksheet): MlCriterionDetail[] {
  let result: EslCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;

    let value = row[4];

    if (value === ValueAbbreviations.NoCriterion) return;

    let mlCriterionDetail: MlCriterionDetail = {
      criterionDetail: {
        chemicalCode: row[1],
        criterionCode: row[2],
      },
      soilTexture: row[3],
      value,
      units: row[5],
      criterionDataSource: row[7],
    };

    result.push(mlCriterionDetail);
  });

  return result;
}

function getWCCriterionDetails(ws: Worksheet): WcCriterionDetail[] {
  let result: WcCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;
    addWcCriterionDetail(row, result, 3, WasteCriterionType.CT1);
    addWcCriterionDetail(row, result, 5, WasteCriterionType.CT2);
    addWcCriterionDetail(row, result, 7, WasteCriterionType.SCC1);
    addWcCriterionDetail(row, result, 9, WasteCriterionType.SCC2);
    addWcCriterionDetail(row, result, 11, WasteCriterionType.TCLP1);
    addWcCriterionDetail(row, result, 13, WasteCriterionType.TCLP2);
  });

  return result;
}

//helper methods

function addWcCriterionDetail(
  row: any,
  wcCriteriaDetails: WcCriterionDetail[],
  valueColumnNumber: number,
  wasteCriterionType: WasteCriterionType
): void {
  let notEmptyValue = checkIfEmpty(row[valueColumnNumber]);
  let units = row[valueColumnNumber + 1];

  if (!notEmptyValue) return null;

  let wcCriterionDetail: WcCriterionDetail = {
    criterionDetail: {chemicalCode: row[1], criterionCode: wasteCriterionType},
    state: row[2],
    value: readerHelper.tryParseResultValue(notEmptyValue).resultValue,
    units,
    prefixType: readerHelper.getPrefixForValue(notEmptyValue),
  };
  wcCriteriaDetails.push(wcCriterionDetail);
}

function getDepthLevel(depthLevel: string) {
  switch (depthLevel) {
    case '0-1':
      return HslDepthLevel.Depth_0_to_1;
    case '1-2':
      return HslDepthLevel.Depth_1_to_2;
    case '2-4':
      return HslDepthLevel.Depth_2_to_4;
    default:
      return HslDepthLevel.Depth_4_to_unlimited;
  }
}
function getWaterEnvironment(waterEnvironment: string): GwWaterEnvironment {
  switch (waterEnvironment) {
    case 'Fresh':
      return GwWaterEnvironment.Fresh;
    case 'Marine':
      return GwWaterEnvironment.Marine;
    default:
      return null;
  }
}
function getSpeciesProtectionLevel(speciesProtectionLevel: string): GwSpeciesProtectionLevel {
  switch (speciesProtectionLevel) {
    case '80':
      return GwSpeciesProtectionLevel.Level_80;
    case '90':
      return GwSpeciesProtectionLevel.Level_90;
    case '95':
      return GwSpeciesProtectionLevel.Level_95;
    case '99':
      return GwSpeciesProtectionLevel.Level_99;
    case 'Unknown':
      return GwSpeciesProtectionLevel.Level_Unknown;
    default:
      return null;
  }
}

function getGwDepthLevel(depthLevel: string) {
  switch (depthLevel) {
    case '2-4':
      return GwHslDepthLevel.Depth_2_to_4;
    case '4-8':
      return GwHslDepthLevel.Depth_4_to_8;
    case '>8':
      return GwHslDepthLevel.Depth_8_to_unlimited;
    default:
      return null;
  }
}

function getGwHslType(hslType: string) {
  switch (hslType) {
    case 'HSL A/B':
      return GwHslType.GW_HSL_AB;
    case 'HSL C':
      return GwHslType.GW_HSL_C;
    case 'HSL D':
      return GwHslType.GW_HSL_D;
    default:
      return null;
  }
}

function checkIfEmpty(value: string): string {
  if (value == '' || value === ValueAbbreviations.Dash || value === ValueAbbreviations.NotApplicable) return null;

  return value;
}
