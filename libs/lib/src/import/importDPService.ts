import * as _ from 'lodash';

import readerHelper from './readerHelper';
import * as CONSTANTS from '../constants/constants';
import * as literals from '../constants/literals';
import utils from '../utils';
import {Row, Workbook, Worksheet} from 'exceljs';
import extras from '../calculations/extras';
import unitsConverter from '../calculations/unitsConverter';

const Excel = utils.loadModule('exceljs');

export default {
  readExcelFileNormalValues,
};

async function readExcelFileNormalValues(
  filePathSample: string,
  skipUnparsableValues: boolean,
  assessmentType: AssessmentType,
  seedData: WasteClassificationCalculationData | SoilAssessmentCalculationData | GwCalculationData
) {
  const result = await readExcelDpFile(filePathSample);

  let hasErrorAndNeedsInput = result.messages.some(
    (message) => message.isConfirm && message.messageType == MessageType.Error
  );

  if (hasErrorAndNeedsInput) return result;

  await readAndSetChemicalData(filePathSample, result, skipUnparsableValues, assessmentType, seedData);

  return result;
}

async function readAndSetChemicalData(
  filePathSample: string,
  result: InputFileParsingResult,
  skipUnparsableValues: boolean,
  assessmentType: AssessmentType,
  seedData: IHasGeneralChemicalsData
) {
  const workbook: Workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePathSample);
  const ws = workbook.worksheets[0];

  const blankRowsToSkipNumber = await readerHelper.getDPBlankRowsToSkip(ws);

  const chemicals: any[] = getChemicalsData(ws, blankRowsToSkipNumber);

  ws.eachRow((wsRow: Row, index: number) => {
    if (index <= blankRowsToSkipNumber + CONSTANTS.excelDPHeaderRowsCount) return null; // skipping blank rows & header

    const row = wsRow.values as any[];
    row.shift();

    const laboratorySampleId = row[2];
    const sample: Sample = _.find(result.samples, (s) => {
      return s.labSampleId === laboratorySampleId;
    });
    if (!sample) return;

    sample.measurements = [];

    for (let j = 10; j < ws.columnCount; j++) {
      const inputChemical = chemicals[j];
      if (!inputChemical) continue;

      let cellValue = row[j];

      if (!cellValue || cellValue.formula) continue; //if no value or in input file it is formula in there

      cellValue = _.trim(cellValue);

      const isDissolved =
        assessmentType === AssessmentType.Water
          ? readerHelper.isDissolved(inputChemical.chemicalCode, inputChemical.chemicalName, inputChemical.method)
          : false;

      const chemicalCode = readerHelper.getReassignedAltCode(
        inputChemical.chemicalCode,
        inputChemical.units,
        seedData.chemicals
      );

      const chemicalMeasurement: ChemicalMeasurement = {
        laboratorySampleId,
        chemical: {
          code: chemicalCode,
          name: inputChemical.chemicalName,
        },
        units: inputChemical.units,
        pqlValue: inputChemical.pql,
        pqlPrefix: inputChemical.pqlPrefix,
        prefix: readerHelper.getPrefixForValue(cellValue),
        resultValue: null,
        asbestosValue: null,
        aslpTclpType: null, //todo
        method: inputChemical.method,
        dissolved: isDissolved,
      };

      result.skipUnparsableValues = false;
      const isAsbestos = extras.isAsbestosBooleanValue(inputChemical.chemicalCode, assessmentType);

      if (isAsbestos) {
        chemicalMeasurement.asbestosValue = cellValue;
      } else {
        parseSimpleChemical(result, sample, cellValue, skipUnparsableValues, chemicalMeasurement);
      }

      const hasErrorAndNeedsInput = result.messages.some(
        (message) => message.isConfirm && message.messageType === MessageType.Error
      );

      if (!hasErrorAndNeedsInput && !result.skipUnparsableValues) {
        sample.measurements.push(chemicalMeasurement);
      }
    }
  });
  readerHelper.processTCLPIdentification(result, assessmentType, seedData);
}

function getChemicalsData(ws: Worksheet, blankRowsToSkipNumber: number) {
  const result: any = {};

  for (let i = 11; i <= ws.columnCount; i++) {
    const column = ws.getColumn(i);
    const values = column.values as any[];

    // removing blank cells
    for (let i = 0; i < blankRowsToSkipNumber; i++) {
      values.shift();
    }
    values.shift(); // removing 1st header cell

    const name = values[0];
    const code = values[1];
    let units = unitsConverter.convertToDefaultUnifiedUnits(values[2]);
    const pqlData = values[3];
    const method = values[4];

    if (!code || CONSTANTS.emptyCodes.includes(code)) continue;

    units = readerHelper.parseUnitsValue(units);

    if (typeof code !== 'string' || typeof name !== 'string' || typeof units !== 'string') {
      console.log(
        `Warning! The following chemical has incorrect value(s): code: ${code};  name: ${name};  units: ${units}; `
      );
    }

    const chemicalDataItem: any = {
      chemicalCode: typeof code === 'string' ? code.trim() : '',
      chemicalName: typeof name === 'string' ? name.trim() : '',
      units: typeof units === 'string' ? units.toLowerCase() : '',
      method: typeof method === 'string' ? method.toLowerCase() : '',
      pql: null,
      pqlPrefix: null,
    };

    const pql = readerHelper.tryParseResultValuePql(pqlData);
    if (pql.isValidValue) {
      chemicalDataItem.pql = pql.resultValue;
      chemicalDataItem.pqlPrefix = readerHelper.getPrefixForValue(pqlData);
    }

    result[i - 1] = chemicalDataItem;
  }

  return result;
}

async function readExcelDpFile(filePathSample: string) {
  const workbook: Workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(filePathSample);
  const ws: Worksheet = workbook.worksheets[0];

  let readResult: InputFileParsingResult = {
    samples: [],
    skipUnparsableValues: false,
    messages: [],
  };

  const processedSamples: any = {};

  const blankRowsToSkipNumber = await readerHelper.getDPBlankRowsToSkip(ws);

  readResult = await readerHelper.validateDataInWorksheet(ws, blankRowsToSkipNumber);

  readResult = await readerHelper.validateDepthsInWorksheet(ws, LabFileType.DOUGLAS, blankRowsToSkipNumber);

  if (readResult.messages.some((message) => message.messageType === MessageType.Error)) {
    return readResult;
  }

  ws.eachRow((wsRow: Row, index: number) => {
    if (index <= blankRowsToSkipNumber + CONSTANTS.excelDPHeaderRowsCount) return null; // skipping blank rows & header

    const row = wsRow.values as any;
    row.shift();

    const sample: Sample = {} as Sample;
    const sampleType = row[8];
    const dpSampleId = row[3];
    const isException = CONSTANTS.sampleFieldIdExceptions.includes(dpSampleId);

    const rowIsOk = sampleType === 'Normal' && !isException;
    if (!rowIsOk) return null;

    const labSampleId = row[2];
    sample.labSampleId = labSampleId;

    sample.labReportNo = row[0];

    if (processedSamples[labSampleId]) {
      throw new Error('Input file has rows with the same lab sample ID');
    }
    processedSamples[labSampleId] = true;

    sample.dateSampled = readerHelper.parseDateTime(row[7]);
    sample.dpSampleId = dpSampleId;

    const depthDataString = row[6];
    const depthData = readerHelper.parseDepthData(depthDataString);

    sample.depth = depthData.depth;
    sample.matrixType = sample.matrixType = _.isString(row[9]) ? _.capitalize(row[9]) : null;
    sample.sampleType = 'Normal';
    sample.labName = 'Unknown';

    readResult.samples.push(sample);
  });

  return readResult;
}

function parseSimpleChemical(
  result: InputFileParsingResult,
  sample: Sample,
  cellValue: string,
  skipUnparsableValues: boolean,
  chemicalMeasurement: ChemicalMeasurement
) {
  const parseResult = readerHelper.tryParseResultValue(cellValue);
  const resultValue = parseResult.resultValue;

  if (!parseResult.isValidValue) {
    if (skipUnparsableValues) {
      result.skipUnparsableValues = true;
      return;
    }

    const wrongChemicalValue = cellValue;

    const wrongChemicalName = `${chemicalMeasurement.chemical.name}(${chemicalMeasurement.chemical.code})`;
    readerHelper.addUniqueMessages(
      result,
      literals.check.wrongFormatChemical(wrongChemicalValue, wrongChemicalName),
      MessageType.Error,
      true
    );
  }

  chemicalMeasurement.resultValue = resultValue;

  if (chemicalMeasurement.pqlValue !== null) {
    const prefix = readerHelper.getPrefixForValue(cellValue);
    readerHelper.processNaphtalene(chemicalMeasurement, sample, resultValue, prefix);
  }
}
