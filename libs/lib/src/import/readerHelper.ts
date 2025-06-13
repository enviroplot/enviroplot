import * as _ from 'lodash';

import {Row, Worksheet} from 'exceljs';
import * as constants from '../constants/constants';
import * as literals from '../constants/literals';
import {UNITS as U} from '../constants/constants';

import utils from '../utils';
const {format, parse} = utils.loadModule('date-fns');

export default {
  parseDateTime,
  parseDepthData,
  getPrefixForValue,
  processNaphtalene,
  tryParseResultValue,
  tryParseResultValuePql,
  validateDepthsInWorksheet,
  getDPBlankRowsToSkip,
  validateDataInWorksheet,
  getReassignedAltCode,
  processTCLPIdentification,
  parseUnitsValue,
  isDissolved,
  addUniqueMessages,
};

function getReassignedAltCode(chemicalCode: string, units: string, allChemicals: Chemical[]): string {
  const withAltCodes: Chemical[] = allChemicals.filter((element) => element.altCodes && element.altCodes.length > 0);

  let result = chemicalCode;

  for (const chemical of withAltCodes) {
    if (chemical.altCodes && chemical.altCodes.length > 0) {
      for (const altCode of chemical.altCodes) {
        const unitsRegexp = new RegExp('\\[([^\\][]*)]');
        let curUnits = null;
        let curAltCode = altCode;
        const unitsArray = unitsRegexp.exec(curAltCode);
        if (unitsArray && unitsArray.length > 0) {
          curAltCode = altCode.slice(0, altCode.indexOf('['));
          curUnits = unitsArray[1];
        }
        if (curAltCode === chemicalCode) {
          if (curUnits === null || (curUnits && curUnits === units)) {
            result = chemical.code;
            break;
          }
        }
      }
    }
  }

  return result;
}

function parseDateTime(value: string) {
  if (!value || value === ValueAbbreviations.Dash) return null;

  // try to parse different formats (e.g. 'dd/MM/yy', 'dd/MM/yyyy', etc) first
  const FAILED_DATE_RETURN = 'Invalid Date';
  const possibleFormats = ['dd/MM/yy', 'dd/MM/yyyy', 'dd-MM-yy', 'dd-MM-yyyy', 'dd.MM.yy', 'dd.MM.yyyy'];
  const parsedValues = possibleFormats.map((format) => parse(value, format, new Date()) as Date | string);

  // if date has different format (e.g. '11 Nov 2020', etc), try auto-parsing as a last resort
  // eslint-disable-next-line eqeqeq
  if (parsedValues.every((item) => item == FAILED_DATE_RETURN)) {
    return format(new Date(value), constants.reportDateFormat);
  }

  // eslint-disable-next-line eqeqeq
  const parsedDate = parsedValues.find((item) => item != FAILED_DATE_RETURN);

  return format(parsedDate as Date, constants.reportDateFormat);
}

function parseDepthData(depthData: string): {isSuccessfulParse: boolean; depth: Depth} {
  const result: {isSuccessfulParse: boolean; depth: Depth} = {
    depth: null,
    isSuccessfulParse: true,
  };

  if (_.isEmpty(depthData)) {
    result.depth = {from: 0, to: 0};

    return result;
  }

  function returnUnsuccessfulParse() {
    result.isSuccessfulParse = false;
    return result;
  }

  const washedDepthData = depthData.replace(/[^0-9.-]/gi, '');
  const parts = _.split(washedDepthData, ValueAbbreviations.Dash);

  const from = Number(parts[0]);

  let to = from;

  if (parts.length === 2) {
    to = Number(parts[1]);
  }

  if (isNaN(from) || isNaN(to)) {
    return returnUnsuccessfulParse();
  }

  if (from > to) {
    return returnUnsuccessfulParse();
  }

  result.depth = {from: from, to: to};
  return result;
}

function getPrefixForValue(cellValue: string) {
  if (!cellValue) return ValuePrefixType.ExactValue;

  cellValue = cellValue.toString();

  switch (cellValue.substring(0, 1)) {
    case '<':
      return ValuePrefixType.Less;
    case '>':
      return ValuePrefixType.Greater;
    default:
      return ValuePrefixType.ExactValue;
  }
}

function processNaphtalene(
  chemicalMeasurement: ChemicalMeasurement,
  sample: Sample,
  resultValue: number,
  prefix: ValuePrefixType
) {
  if (chemicalMeasurement.chemical.code !== constants.naphtaleneCode) return;

  const addedNaphtaleneMeasurement = _.find(sample.measurements, (m) => {
    return m.chemical.code === constants.naphtaleneCode;
  });

  if (!addedNaphtaleneMeasurement || !(addedNaphtaleneMeasurement.resultValue < resultValue)) return;

  addedNaphtaleneMeasurement.resultValue = resultValue;
  addedNaphtaleneMeasurement.prefix = prefix;
  addedNaphtaleneMeasurement.pqlValue = chemicalMeasurement.pqlValue;
}

/*
  This function identifies ASLP and TCLP:
  •	Matrix is soil or material
  •	Chemical is in /kg 
  •	Chemical has TCLP/ASLP in name
  •	Has suffix T or A
  •	Method include phrase TCLP/ASLP
  •	Chemical measurement Is in units /L 
  Note: (TCLPs are chems which have 'mg/L' (OR COMPARTIBLE!))
*/

function processTCLPIdentification(
  result: InputFileParsingResult,
  assessmentType: AssessmentType,
  seedData: IHasGeneralChemicalsData
) {
  const allowedTypes = [AssessmentType.Soil, AssessmentType.Waste];

  if (!allowedTypes.includes(assessmentType)) return;

  for (let i = 0; i < result.samples.length; i++) {
    let sample = result.samples[i];
    if (!sample.measurements) continue;
    for (let j = 0; j < sample.measurements.length; j++) {
      const measurement = sample.measurements[j];
      if (!measurement.units || !sample.matrixType || !unitsAndMatrixAreTclpAslp(measurement.units, sample.matrixType))
        continue;

      //Remove and replace chemical code if contains'T' or 'A'
      processLastLetterInChemicalCode(measurement, seedData);

      //Unify chemical name for Aslp/Tclp chemicals
      processChemicalName(measurement);

      //Check Aslp/Tclp type in method
      processMeasurementMethod(measurement);

      //Set default values and show message
      if (!measurement.aslpTclpType) {
        measurement.aslpTclpType =
          assessmentType === AssessmentType.Soil
            ? AslpTclpType.Aslp
            : assessmentType === AssessmentType.Waste
            ? AslpTclpType.Tclp
            : null;

        addUniqueMessages(
          result,
          measurement.aslpTclpType === AslpTclpType.Aslp ? literals.leachableAslp : literals.leachableTclp,
          MessageType.Info,
          false
        );
      }

      if (measurement.aslpTclpType) {
        const seedDataChemical = seedData.chemicals.find((chemical) => chemical.code === measurement.chemical.code);
        if (seedDataChemical) {
          measurement.chemical.name = `${seedDataChemical.name} in ${measurement.aslpTclpType}`;
        }
      }
    }
  }
}

function tryParseResultValue(resultValueStr: string) {
  const result = {
    resultValue: 0,
    isValidValue: true,
  };

  parseNumericValue(resultValueStr, result);

  return result;
}

function tryParseResultValuePql(resultValueStr: string) {
  const result: any = {
    resultValue: null,
    isValidValue: true,
  };

  parseNumericValue(resultValueStr, result);

  return result;
}

function parseNumericValue(resultValueStr: string, result: any) {
  if (constants.emptyValue.includes(resultValueStr)) {
    return result;
  }

  resultValueStr = _.trimStart(resultValueStr, '>');
  resultValueStr = _.trimStart(resultValueStr, '<');
  resultValueStr = _.trimEnd(resultValueStr, '%');

  const isNumber = Number(resultValueStr);

  if (isNumber === 0 || isNumber) {
    result.resultValue = isNumber;
    return result;
  }

  result.isValidValue = false;
  return result;
}

function isDissolved(code: string, name: string, method: string) {
  let result = false;

  if (constants.dissolvedExclusionsCodes.includes(code)) return result;

  result = (name.toLowerCase() || method.toLowerCase()).includes('dissolved');

  return result;
}

async function validateDepthsInWorksheet(
  ws: Worksheet,
  fileType: LabFileType,
  blankRowsToSkipNumber = 0
): Promise<InputFileParsingResult> {
  const readResult: InputFileParsingResult = {
    samples: [],
    skipUnparsableValues: false,
    messages: [],
  };

  let rowsToSkip = blankRowsToSkipNumber;
  let depthColumnIndex: number;

  switch (fileType) {
    case LabFileType.DOUGLAS:
      rowsToSkip += 5;
      depthColumnIndex = 6;
      break;

    case LabFileType.ESDAT:
      rowsToSkip += 1;
      depthColumnIndex = 4;
      break;

    default:
      break;
  }

  let numberOfWrongDepths = 0;

  ws.eachRow((wsRow: Row, index: number) => {
    if (index <= rowsToSkip) return null; // DP lab file blank and header rows

    const row = wsRow.values as any;
    row.shift();
    const depthDataString = row[depthColumnIndex];
    const parseData = parseDepthData(depthDataString);

    if (!parseData.isSuccessfulParse) {
      numberOfWrongDepths++;
    }
  });

  if (numberOfWrongDepths > 0) {
    addUniqueMessages(readResult, literals.check.incorrectDepthsError(numberOfWrongDepths), MessageType.Error, false);
  }
  return readResult;
}

/*
 if a DP Lab file has blank rows as it starts in the header - skip them, 
 but don't treat this file as broken
*/
async function getDPBlankRowsToSkip(ws: Worksheet): Promise<number> {
  let result = 0;

  for (let index = 1; index <= ws.rowCount; index++) {
    if (ws.getCell(index, 1).text === '') {
      result = index;
    } else {
      break;
    }
  }

  return result;
}

async function validateDataInWorksheet(ws: Worksheet, blankRowsToSkipNumber: number): Promise<InputFileParsingResult> {
  const readResult: InputFileParsingResult = {
    samples: [],
    skipUnparsableValues: false,
    messages: [],
  };

  const rowIndex = 1 + blankRowsToSkipNumber;

  if (
    !(
      ws.getCell(rowIndex, 1).text === constants.excelTitles.Reference &&
      ws.getCell(rowIndex, 2).text === constants.excelTitles.Details &&
      ws.getCell(rowIndex, 3).text === constants.excelTitles.SampleCode &&
      ws.getCell(rowIndex, 4).text === constants.excelTitles.SampleDescription &&
      ws.getCell(rowIndex, 5).text === constants.excelTitles.SampleNo &&
      ws.getCell(rowIndex, 6).text === constants.excelTitles.Replicate &&
      ws.getCell(rowIndex, 7).text === constants.excelTitles.Depth
    )
  ) {
    addUniqueMessages(readResult, literals.check.incorrectDataFile(), MessageType.Error, false);
  }
  return readResult;
}

// this method is required for cases when units value comes as rich text object (e.g for 'µg/L' units)
function parseUnitsValue(rawCode: any) {
  if (typeof rawCode == 'string') return rawCode;

  if (typeof rawCode == 'object' && rawCode?.richText && _.isArray(rawCode.richText)) {
    let code = '';
    rawCode.richText.forEach((el: any) => {
      const val = el?.text;
      if (val && typeof val == 'string') code = `${code}${val}`;
    });

    return code;
  }

  return rawCode;
}

function unitsAndMatrixAreTclpAslp(units: string, matrixType: string) {
  const normalizedUnits = units.toUpperCase().normalize('NFKC'); // Normalize and convert to uppercase
  const unitsAreAslpTclp = [...U.MG_L, ...U.NG_L, ...U.UG_L].some((unit) => unit === normalizedUnits);

  let matrixIsForTclpAslp = matrixType.toUpperCase() === 'SOIL' || matrixType.toUpperCase() === 'MATERIAL';

  return unitsAreAslpTclp && matrixIsForTclpAslp;
}

function processLastLetterInChemicalCode(measurement: ChemicalMeasurement, seedData: IHasGeneralChemicalsData) {
  const lastCharacter = measurement.chemical.code.slice(-1).toUpperCase();
  if (lastCharacter === 'T' || lastCharacter === 'A') {
    const codeWithoutLastCharacter = measurement.chemical.code.slice(0, -1);
    const chemicalWithCodeExists = seedData.chemicals.some((chemical) => chemical.code === codeWithoutLastCharacter);

    if (chemicalWithCodeExists) {
      measurement.aslpTclpType =
        lastCharacter === 'A' ? AslpTclpType.Aslp : lastCharacter === 'T' ? AslpTclpType.Tclp : null;
      measurement.chemical.code = codeWithoutLastCharacter;
    }
  }
}

function processChemicalName(measurement: ChemicalMeasurement) {
  const name = measurement.chemical.name.toUpperCase();
  const aslpStr = AslpTclpType.Aslp.toUpperCase();
  const tclpStr = AslpTclpType.Tclp.toUpperCase();

  if (name.includes(aslpStr) || name.includes(tclpStr)) {
    measurement.aslpTclpType = name.includes(aslpStr)
      ? AslpTclpType.Aslp
      : name.includes(tclpStr)
      ? AslpTclpType.Tclp
      : null;
  }
}

function processMeasurementMethod(measurement: ChemicalMeasurement) {
  const method = measurement.method.toUpperCase();
  const aslpStr = AslpTclpType.Aslp.toUpperCase();
  const tclpStr = AslpTclpType.Tclp.toUpperCase();
  if (method.includes(aslpStr || tclpStr))
    measurement.aslpTclpType = method.includes(aslpStr)
      ? AslpTclpType.Aslp
      : method.includes(tclpStr)
      ? AslpTclpType.Tclp
      : null;
}

function addUniqueMessages(result: InputFileParsingResult, text: string, messageType: MessageType, isConfirm: boolean) {
  const hasSameMessage = result.messages.some(
    (message) => message.messageType === messageType && message.text === text && message.isConfirm === isConfirm
  );
  if (!hasSameMessage) {
    result.messages.push({
      text: text,
      messageType: messageType,
      isConfirm: isConfirm,
    });
  }
}
