import * as _ from 'lodash';

import helper from '../reportHelper';
import * as constants from '../../constants/constants';
import * as literals from '../../constants/literals';
import {Worksheet} from 'exceljs';

export default {
  addSoilLegend,
  addWasteLegend,
};

function addSoilLegend(
  ws: Worksheet,
  lastTableRowNumber: number,
  startColumnIndex: number,
  legendStartColumnIndex: number
) {
  lastTableRowNumber++;

  renderSoilCellScheme(ws, lastTableRowNumber, startColumnIndex);
  const firstRowLegendCell = getCellForLegend(ws, lastTableRowNumber, legendStartColumnIndex);

  firstRowLegendCell.value = {
    richText: [
      getColorRectangleText(helper.getColorValue(ReportColors.Yellow)),
      getLabel('HIL/HSL exceedance'),
      getColorRectangleText(helper.getColorValue(ReportColors.Green)),
      getLabel('EIL/ESL exceedance'),
      getColorRectangleText(helper.getColorValue(ReportColors.Orange)),
      getLabel('HIL/HSL and EIL/ESL exceedance'),
      getColorRectangleText(helper.getColorValue(ReportColors.Grey)),
      getLabel('ML exceedance'),
      getColorRectangleText(helper.getColorValue(ReportColors.Red)),
      getLabel('ML and HIL/HSL or EIL/ESL exceedance'),
    ],
  };

  lastTableRowNumber++;

  const secondRowLegendCell = getCellForLegend(ws, lastTableRowNumber, legendStartColumnIndex);

  secondRowLegendCell.value = {
    richText: [
      getColorRectangleText(helper.getColorValue(ReportColors.Pink)),
      getLabel('Indicates that asbestos has been detected by the lab, refer to the lab report'),

      getColorRectangleText(helper.getColorValue(ReportColors.LightBlue)),
      getLabel('Blue', false, true, helper.getColorValue(ReportColors.Blue)),
      getLabel('= DC exceedance'),

      getLabel('Red', false, true, helper.getColorValue(ReportColors.Red)),
      getLabel('= EGV-indirect exceedance'),

      getColorBorderRectangleText(helper.getColorValue(ReportColors.Blue)),
      getLabel('HSL 0-<1 Exceedance'),
    ],
  };

  lastTableRowNumber++;
  const thirdRowCell = getCellForLegend(ws, lastTableRowNumber, legendStartColumnIndex);

  const specialValues = constants.specialValuesSoil;

  const specialValuesLabel = getSpecialValuesLabel(specialValues, false);

  const bigFontGap = {
    font: {size: constants.fontSize.big, name: constants.fontName},
    text: ' ',
  };

  thirdRowCell.value = {
    richText: [getLabel('Bold', false, true), getLabel('= Lab detections '), getLabel(specialValuesLabel), bigFontGap],
  };

  lastTableRowNumber++;

  const fourthRowCell = getCellForLegend(ws, lastTableRowNumber, legendStartColumnIndex);

  const soilCriteria = constants.criteriaValuesSoil;

  const soilCriteriaLabel = getSpecialValuesLabel(soilCriteria, false);

  fourthRowCell.value = {
    richText: [getLabel(soilCriteriaLabel, false), bigFontGap],
  };

  return lastTableRowNumber;
}

function renderSoilCellScheme(ws: Worksheet, lastTableRowNumber: number, startColumnIndex: number) {
  let firstCellAddress = helper.getCellAddress(lastTableRowNumber, startColumnIndex);
  let secondCellAddress = helper.getCellAddress(lastTableRowNumber, startColumnIndex + 1);

  ws.mergeCells(`${firstCellAddress}:${secondCellAddress}`);

  helper.setCell(
    ws,
    firstCellAddress,
    getRichTextValue(literals.labResult, false),
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(),
    helper.getBorderStyle('hair', {top: true, left: true, right: true})
  );

  lastTableRowNumber++;

  firstCellAddress = helper.getCellAddress(lastTableRowNumber, startColumnIndex);

  helper.setCell(
    ws,
    firstCellAddress,
    getRichTextValue(literals.hilHslValueTitle, false, false, helper.getColorValue(ReportColors.Orange)),
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(),
    helper.getBorderStyle('hair', {left: true, bottom: true})
  );

  secondCellAddress = helper.getCellAddress(lastTableRowNumber, startColumnIndex + 1);

  helper.setCell(
    ws,
    secondCellAddress,
    getRichTextValue(literals.eilEslValueTitle, false, false, helper.getColorValue(ReportColors.DarkGreen)),
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(),
    helper.getBorderStyle('hair', {right: true, bottom: true})
  );
}

function addWasteLegend(ws: Worksheet, lastTableRow: number, legendStartColumnIndex: number) {
  lastTableRow++;

  const firstRowCell = getCellForLegend(ws, lastTableRow, legendStartColumnIndex);

  firstRowCell.value = {
    richText: [
      getColorBorderRectangleText(helper.getColorValue(ReportColors.LavenderBorder)),
      getLabel('CT1 exceedance'),
      getColorRectangleText(helper.getColorValue(ReportColors.LavenderBackground)),
      getLabel('TCLP1 and/or SCC1 exceedance'),
      getColorBorderRectangleText(helper.getColorValue(ReportColors.LightBlueBorder)),
      getLabel('CT2 exceedance'),
      getColorRectangleText(helper.getColorValue(ReportColors.LightBlueBackground)),
      getLabel('TCLP2 and/or SCC2 exceedance'),
      getColorRectangleText(helper.getColorValue(ReportColors.Red)),
      getLabel('Asbestos detection'),
    ],
  };

  lastTableRow++;

  const secondRowCell = getCellForLegend(ws, lastTableRow, legendStartColumnIndex);

  secondRowCell.value = {
    richText: [getLabel(literals.legendNoValueAndAsbestosWaste, false, false)],
  };

  return lastTableRow;
}

//helper methods
function getLabel(
  text: string,
  padding = true,
  bold = false,
  color: string = null,
  fontSize = constants.fontSize.content
) {
  if (padding) text = `  ${text}  `;

  const result: any = {
    font: {size: fontSize, name: constants.fontName, bold: bold},
    text,
  };

  if (color) {
    result.font.color = {argb: color};
  }

  return result;
}

function getRichTextValue(
  text: string,
  padding = true,
  bold = false,
  color: string = null,
  fontSize = constants.fontSize.content
) {
  const label = getLabel(text, padding, bold, color, fontSize);
  return {richText: [label]};
}

function getColorRectangleText(color: string) {
  return {
    font: {size: constants.fontSize.big, color: {argb: color}, name: constants.fontLegendSquareName},
    text: '■',
  };
}

function getColorBorderRectangleText(color: string) {
  return {
    font: {size: constants.fontSize.big, color: {argb: color}, name: constants.fontLegendSquareName},
    text: '□',
  };
}

function getSpecialValuesLabel(specialValues: KeyLabelItem[], includeFirstSeparator = true) {
  let result = '';
  const separator = '  ';

  for (const specialValueItem of specialValues) {
    result += `  ${specialValueItem.key} = ${specialValueItem.label}${separator}`;
  }

  if (!includeFirstSeparator) {
    result = result.substr(separator.length);
  }

  return result;
}

function getCellForLegend(ws: Worksheet, lastTableRow: number, legendStartColumnIndex: number) {
  const firstCellAddress = helper.getCellAddress(lastTableRow, legendStartColumnIndex);

  return ws.getCell(firstCellAddress);
}
