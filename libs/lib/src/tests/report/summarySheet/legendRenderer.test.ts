const Excel = require('exceljs');

import {Workbook, Worksheet} from 'exceljs';
import legendRenderer from './../../../report/summarySheet/legendRenderer';

test('addSoilLegend function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  let lastTableRowNumber: number = 40;
  let startColumnIndex: number = 0;
  let legendStartColumnIndex: number = 3;

  let calculatedResult = legendRenderer.addSoilLegend(ws, lastTableRowNumber, startColumnIndex, legendStartColumnIndex);
  expect(calculatedResult).toBe(44);

  expect(ws.getCell('D41').text).toBe(
    '■  HIL/HSL exceedance  ■  EIL/ESL exceedance  ■  HIL/HSL and EIL/ESL exceedance  ■  ML exceedance  ■  ML and HIL/HSL or EIL/ESL exceedance  '
  );
  expect(ws.getCell('D42').text).toBe(
    '■  Indicates that asbestos has been detected by the lab, refer to the lab report  ■Blue  = DC exceedance  Red  = EGV-indirect exceedance  □  HSL 0-<1 Exceedance  '
  );
  expect(ws.getCell('D43').text).toBe(
    'Bold  = Lab detections     - = Not tested or No HIL/HSL/EIL/ESL (as applicable) or Not applicable    NL = Non limiting    NAD = No Asbestos detected     '
  );
  expect(ws.getCell('D44').text).toBe(
    'HIL = Health investigation level    HSL = Health screening level (excluding DC)    EIL = Ecological investigation level    ESL = Ecological screening level    EGV = Environmental Guideline Value     ML = Management Limit    DC = Direct Contact HSL   '
  );
});

test('addWasteLegend function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');

  let lastTableRowNumber: number = 24;
  let legendStartColumnIndex: number = 3;

  let calculatedResult = legendRenderer.addWasteLegend(ws, lastTableRowNumber, legendStartColumnIndex);
  expect(calculatedResult).toBe(26);
  expect(ws.getCell('D25').text).toBe(
    '□  CT1 exceedance  ■  TCLP1 and/or SCC1 exceedance  □  CT2 exceedance  ■  TCLP2 and/or SCC2 exceedance  ■  Asbestos detection  '
  );
  expect(ws.getCell('D26').text).toBe('- = Not tested, no criteria or not applicable     NAD = no asbestos detected');
});
