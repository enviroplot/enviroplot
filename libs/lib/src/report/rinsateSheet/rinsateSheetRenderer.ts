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
  generateRinsateSheet,
  addRinsateTable, //for test
};

const workSheetPropsQaQc: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateRinsateSheet(
  wb: Workbook,
  dataFolderPath: string,
  sortedUnitsAndGroupedReportItems: SortedAndGroupedReportItems,
  samples: Sample[],
  chemicalGroups: ChemicalGroup[],
  selectedGroupsKeys: string[],
  sessionParameters: SessionParameters
) {
  const ws = wb.addWorksheet(literals.rinsate, workSheetPropsQaQc);

  const sheetTitle = extras.isWaterAssessment(sessionParameters)
    ? literals.rinsateTitleWater
    : literals.rinsateTitleSoil;

  commonSectionsRenderer.addSheetHeader(ws, sheetTitle);

  let nextTableStartRow = 6;

  sortedUnitsAndGroupedReportItems.units.forEach((units) => {
    const tableDataByUnit = sortedUnitsAndGroupedReportItems.reportItems[units] as ReportItem[];

    nextTableStartRow = addRinsateTable(
      ws,
      nextTableStartRow,
      tableDataByUnit,
      samples,
      units,
      chemicalGroups,
      selectedGroupsKeys,
      sessionParameters
    );

    nextTableStartRow += 3;
  });

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);
}

//Helper functions

function addRinsateTable(
  ws: Worksheet,
  tableStartRow: number,
  reportItems: RinsateReportItem[],
  samples: Sample[],
  units: string,
  chemicalGroups: ChemicalGroup[],
  reportGroups: string[],
  sessionParameters: SessionParameters
) {
  const chemicalsRowNumber = 7;
  const startSamplesRowNumber = tableStartRow + 2;
  const startColumnIndex = 0;

  helper.setRowHeight(ws, chemicalsRowNumber, constants.rowHeight.chemicalsHeader);

  const tableGroups: ChemicalGroup[] = helper.getSelectedGroupsFromSeed(chemicalGroups, reportGroups);

  addHeader(ws, tableStartRow, reportItems, sessionParameters, tableGroups);

  return addSamplesRows(ws, startSamplesRowNumber, startColumnIndex, reportItems, samples, units, sessionParameters);
}

function addHeader(
  ws: Worksheet,
  headerRowNumber: number,
  reportItems: RinsateReportItem[],
  sessionParameters: SessionParameters,
  tableGroups: ChemicalGroup[]
) {
  const numberOfNestedColumns = 1;

  const headersData: KeyLabelItem[] = [
    {key: 'dpSampleId', label: literals.sampleId},
    {key: 'sampleDate', label: literals.sampleDate},
    {key: 'sampleMedia', label: literals.sampleMedia},
    {key: 'units', label: literals.units},
  ];

  headersData.forEach((item, columnIndex) => {
    helper.setColumnWidth(ws, columnIndex, constants.columnWidth.common);
    const titleFirstCellAddress = helper.getCellAddress(headerRowNumber, columnIndex);
    const titleLastCellAddress = helper.getCellAddress(headerRowNumber + 1, columnIndex);
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
  const labReportNumberColumnIndex = reportItems.length + headersData.length;

  ws.mergeCells(
    `${helper.getCellAddress(headerRowNumber, labReportNumberColumnIndex)}:${helper.getCellAddress(
      headerRowNumber + 1,
      labReportNumberColumnIndex
    )}`
  );

  commonSectionsRenderer.addReportGroupsHorizontal(ws, headerRowNumber, headersData.length, reportItems, tableGroups);

  commonSectionsRenderer.addReportChemicalsHorizontal(
    ws,
    headerRowNumber + 1,
    headersData.length,
    reportItems,
    sessionParameters,
    numberOfNestedColumns
  );

  const cellAddress = helper.getCellAddress(headerRowNumber, labReportNumberColumnIndex);

  helper.setCell(
    ws,
    cellAddress,
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
  reportItems: RinsateReportItem[],
  samples: Sample[],
  units: string,
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
