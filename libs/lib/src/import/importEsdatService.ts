import * as _ from 'lodash';
import readerHelper from './readerHelper';
import * as constants from '../constants/constants';
import * as literals from '../constants/literals';
import utils from '../utils';
import {Row, Workbook} from 'exceljs';
import unitsConverter from '../calculations/unitsConverter';
import extras from '../calculations/extras';

const Excel = utils.loadModule('exceljs');

export default {
  readCSVFileNormalValues,
  readCSVSampleFile,
  readAndSetChemicalData,
};

async function readCSVFileNormalValues(
  filePathSample: string,
  filePathChemistry: string,
  skipUnparsableValues: boolean,
  assessmentType: AssessmentType,
  seedData: IHasGeneralChemicalsData
) {
  const result: InputFileParsingResult = await readCSVSampleFile(filePathSample);

  if (!result) return false;

  const hasErrorAndNeedsInput = result.messages.some(
    (message) => message.isConfirm && message.messageType === MessageType.Error
  );

  if (hasErrorAndNeedsInput) return result;

  await readAndSetChemicalData(filePathChemistry, result, skipUnparsableValues, assessmentType, seedData);

  return result;
}

async function readAndSetChemicalData(
  filePathChemistry: string,
  result: InputFileParsingResult,
  skipUnparsableValues: boolean = false,
  assessmentType: AssessmentType,
  seedData: IHasGeneralChemicalsData
) {
  let isWrongChemicalFile = false;

  const workbook: Workbook = new Excel.Workbook();
  await workbook.csv.readFile(filePathChemistry);
  const ws = workbook.worksheets[0];
  const firstRow = ws.getRow(1).values as any;

  if (!firstRow.some((item: any) => item === 'ChemCode')) {
    isWrongChemicalFile = true;
  }

  if (isWrongChemicalFile) return false;

  let chemicalsWithWrongValues: string[] = [];

  ws.eachRow((wsRow: Row, index: number) => {
    if (index <= 1) return; //columns
    const row = wsRow.values as any[];
    row.shift();

    const laboratorySampleId = row[0];
    const sample: any = _.find(result.samples, {labSampleId: laboratorySampleId});

    if (!sample) return;

    sample.measurements = sample.measurements || [];

    const chemicalCode = row[1];

    if (!chemicalCode) return;

    const chemicalMeasurement: ChemicalMeasurement = {
      laboratorySampleId: laboratorySampleId,
      chemical: {
        code: chemicalCode,
        name: row[2],
      },
      units: unitsConverter.convertToDefaultUnifiedUnits(row[5]),
      pqlValue: null,
      pqlPrefix: null,
      prefix: readerHelper.getPrefixForValue(row[3]),
      resultValue: null,
      asbestosValue: null,
      aslpTclpType: null, //todo
      method: row[9],
      dissolved: assessmentType === AssessmentType.Water && row[6] === 'F' ? true : false,
    };

    chemicalMeasurement.chemical.code = readerHelper.getReassignedAltCode(
      chemicalMeasurement.chemical.code,
      chemicalMeasurement.units,
      seedData.chemicals
    );

    const pqlValParsedPql = readerHelper.tryParseResultValue(row[12]);
    chemicalMeasurement.pqlValue = pqlValParsedPql.isValidValue ? pqlValParsedPql.resultValue : null;

    const isAsbestos = extras.isAsbestosBooleanValue(chemicalMeasurement.chemical.code, assessmentType);
    const cellValue = row[4];

    if (isAsbestos) {
      chemicalMeasurement.asbestosValue = cellValue;
    }

    // parse result value
    const parseResult = readerHelper.tryParseResultValue(cellValue);
    const resultValue = parseResult.resultValue;

    if (!parseResult.isValidValue) {
      if (skipUnparsableValues) {
        return;
      }

      chemicalsWithWrongValues.push(`${chemicalMeasurement.chemical.name}(${chemicalMeasurement.chemical.code})`);
    }

    chemicalMeasurement.resultValue = resultValue;

    sample.measurements.push(chemicalMeasurement);
  });

  if (chemicalsWithWrongValues.length > 0) {
    readerHelper.addUniqueMessages(
      result,
      literals.check.wrongFormatChemicalsEsdat(chemicalsWithWrongValues.join(', ')),
      MessageType.Error,
      true
    );
  }

  readerHelper.processTCLPIdentification(result, assessmentType, seedData);

  return true;
}

async function readCSVSampleFile(filePathSample: string): Promise<InputFileParsingResult> {
  let isWrongSampleFile = false;

  const workbook: Workbook = new Excel.Workbook();
  try {
    await workbook.csv.readFile(filePathSample);
  } catch (ex) {
    console.log(ex);
  }
  const ws = workbook.worksheets[0];

  const firstRow = ws.getRow(1).values as any[];

  if (firstRow.some((item: any) => item === 'ChemCode')) {
    isWrongSampleFile = true;
  }

  if (isWrongSampleFile) return null;

  let readResult: InputFileParsingResult = {
    samples: [],
    messages: [],
    skipUnparsableValues: false,
  };

  readResult = await readerHelper.validateDepthsInWorksheet(ws, LabFileType.ESDAT);

  ws.eachRow((wsRow: any, index: number) => {
    if (index <= 1) return; //columns

    const row = wsRow.values;
    row.shift();

    const sample: Sample = {} as Sample;
    const sampleType = row[7];
    const dpSampleId = row[2];
    const isException = constants.sampleFieldIdExceptions.includes(dpSampleId);

    const rowIsOk = sampleType === 'Normal' && !isException;

    if (!rowIsOk) return;

    sample.labSampleId = row[0];
    sample.labReportNo = row[14];
    sample.dateSampled = readerHelper.parseDateTime(row[1]);
    sample.dpSampleId = dpSampleId;

    const depthDataString = row[4];
    const depthData = readerHelper.parseDepthData(depthDataString);

    sample.depth = depthData.depth;

    sample.matrixType = _.isString(row[6]) ? _.capitalize(row[6]) : null;
    sample.sampleType = 'Normal';
    sample.labName = row[11];

    readResult.samples.push(sample);
  });

  return readResult;
}
