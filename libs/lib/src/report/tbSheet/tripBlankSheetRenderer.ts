import * as _ from 'lodash';
import utils from '../../utils';

import helper from '../reportHelper';
import commonSectionsRenderer from '../commonSectionsRenderer';
import * as constants from '../../constants/constants';
import * as literals from '../../constants/literals';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';
import extras from '../../calculations/extras';

const path = utils.loadModule('path');

export default {
  generateTripBlank,
  addTripBlankTable, //for test
};

const workSheetPropsQaQc: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateTripBlank(
  wb: Workbook,
  dataFolderPath: string,
  sortedUnitsAndGroupedReportItems: SortedAndGroupedReportItems,
  samples: Sample[],
  chemicalGroups: ChemicalGroup[],
  selectedGroupsKeys: string[],
  sessionParameters: SessionParameters
) {
  const ws = wb.addWorksheet(literals.tb, workSheetPropsQaQc);

  const tbTitle: string = extras.isWaterAssessment(sessionParameters) ? literals.tbTitleWater : literals.tbTitleSoil;

  commonSectionsRenderer.addSheetHeader(ws, tbTitle);

  let nextTableStartRow = 6;

  sortedUnitsAndGroupedReportItems.units.forEach((units) => {
    const tableDataByUnit = sortedUnitsAndGroupedReportItems.reportItems[units] as ReportItem[];

    nextTableStartRow = addTripBlankTable(
      ws,
      nextTableStartRow,
      units,
      tableDataByUnit,
      samples,
      chemicalGroups,
      selectedGroupsKeys,
      sessionParameters
    );

    nextTableStartRow = nextTableStartRow + 3;
  });

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);
}

//Helper functions

function addTripBlankTable(
  ws: Worksheet,
  tableStartRow: number,
  units: string,
  reportItems: ReportItem[],
  samples: Sample[],
  chemicalGroups: ChemicalGroup[],
  reportGroups: string[],
  sessionParameters: SessionParameters
) {
  const chemicalsRowNumber = 7;
  const startSamplesRowNumber = tableStartRow + 2;
  const startColumnIndex = 0;

  const tableGroups: ChemicalGroup[] = [];

  helper.setRowHeight(ws, chemicalsRowNumber, constants.rowHeight.chemicalsHeader);

  for (const group of chemicalGroups) {
    if (reportGroups.includes(group.code)) {
      tableGroups.push(group);
    }
  }

  addHeader(ws, tableStartRow, reportItems, sessionParameters, tableGroups);

  const result = addSamplesRows(
    ws,
    startSamplesRowNumber,
    startColumnIndex,
    units,
    reportItems,
    samples,
    sessionParameters
  );

  return result;
}

function addHeader(
  ws: Worksheet,
  headerStartRow: number,
  reportItems: ReportItem[],
  sessionParameters: SessionParameters,
  tableGroups: ChemicalGroup[]
) {
  const numberOfNestedColumns = 1;

  const headersData: KeyLabelItem[] = [
    {key: 'dpSampleId', label: literals.sampleId},
    {key: 'sampleDate', label: literals.sampleDate},
    {key: 'sampleMedia', label: literals.sampleMedia},
    {key: 'sampleType', label: literals.sampleType},
    {key: 'units', label: literals.units},
  ];

  headersData.forEach((item, columnIndex) => {
    helper.setColumnWidth(ws, columnIndex, constants.columnWidth.common);
    const titleFirstCellAddress = helper.getCellAddress(headerStartRow, columnIndex);
    const titleLastCellAddress = helper.getCellAddress(headerStartRow + 1, columnIndex);
    const columnWidth = columnIndex === 0 ? constants.columnWidth.sampleId : constants.columnWidth.common;
    helper.setColumnWidth(ws, columnIndex, columnWidth);

    helper.setCell(
      ws,
      titleFirstCellAddress,
      item.label,
      constants.fontSize.header,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    ws.mergeCells(`${titleFirstCellAddress}:${titleLastCellAddress}`);
  });

  commonSectionsRenderer.addReportGroupsHorizontal(ws, headerStartRow, headersData.length, reportItems, tableGroups);

  commonSectionsRenderer.addReportChemicalsHorizontal(
    ws,
    headerStartRow + 1,
    headersData.length,
    reportItems,
    sessionParameters,
    numberOfNestedColumns
  );

  const labReportNumberColumnIndex = reportItems.length + headersData.length;

  ws.mergeCells(
    `${helper.getCellAddress(headerStartRow, labReportNumberColumnIndex)}:${helper.getCellAddress(
      headerStartRow + 1,
      labReportNumberColumnIndex
    )}`
  );

  helper.setCell(
    ws,
    helper.getCellAddress(headerStartRow, labReportNumberColumnIndex),
    literals.labReportNo,
    constants.fontSize.header,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}

function addSamplesRows(
  ws: Worksheet,
  rowNumber: number,
  startIndex: number,
  units: string,
  reportItems: ReportItem[],
  samples: Sample[],
  sessionParameters: SessionParameters
) {
  let lastColumnIndex = 0;

  for (const sample of samples) {
    const sampleId = sample.labSampleId;
    let currentIndex = startIndex;

    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, currentIndex),
      sample.dpSampleId,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    currentIndex++;

    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, currentIndex),
      sample.dateSampled,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentIndex++;

    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, currentIndex),
      extras.isWaterAssessment(sessionParameters) ? literals.water : literals.soil,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentIndex++;

    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, currentIndex),
      sample.matrixType,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentIndex++;

    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, currentIndex),
      units,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentIndex++;

    for (const chemical of reportItems) {
      const chemicalSamples = chemical.reportCells;
      const chemicalData = chemicalSamples[sampleId];

      const cellAddress = helper.getCellAddress(rowNumber, currentIndex);

      commonSectionsRenderer.addChemicalValue(ws, cellAddress, chemicalData, sessionParameters, true);

      currentIndex++;
    }

    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, currentIndex),
      sample.labReportNo,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    if (!lastColumnIndex) lastColumnIndex = currentIndex - 1;

    rowNumber++;
  }
  return rowNumber;
}
