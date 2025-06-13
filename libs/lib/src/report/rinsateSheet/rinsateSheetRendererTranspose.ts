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
  generateRinsateSheetTranspose,
  addRinsateTable, //for test
};

const workSheetPropsQaQc: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateRinsateSheetTranspose(
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
  const startColumnNumber = 0;
  const startSamplesColumnNumber = startColumnNumber + 2;

  const tableGroups: ChemicalGroup[] = helper.getSelectedGroupsFromSeed(chemicalGroups, reportGroups);

  let lastRowNUmber = addHeaderVertically(
    ws,
    tableStartRow,
    startColumnNumber,
    reportItems,
    sessionParameters,
    tableGroups
  );

  addSamplesRows(ws, tableStartRow, startSamplesColumnNumber, reportItems, samples, units, sessionParameters);

  return lastRowNUmber;
}

function addHeaderVertically(
  ws: Worksheet,
  startRowNumber: number,
  groupsColumnNumber: number,
  reportItems: RinsateReportItem[],
  sessionParameters: SessionParameters,
  tableGroups: ChemicalGroup[]
) {
  const headersData: KeyLabelItem[] = [
    {key: 'dpSampleId', label: literals.sampleId},
    {key: 'sampleDate', label: literals.sampleDate},
    {key: 'sampleMedia', label: literals.sampleMedia},
    {key: 'units', label: literals.units},
  ];

  let startChemicalsRowNumber = startRowNumber + headersData.length;

  headersData.forEach((item, index) => {
    let currentRowNumber = startRowNumber + index;
    const titleFirstCellAddress = helper.getCellAddress(currentRowNumber, groupsColumnNumber);
    const titleLastCellAddress = helper.getCellAddress(currentRowNumber, groupsColumnNumber + 1);

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

  let labReportNumberRowNumber = startChemicalsRowNumber + reportItems.length;

  ws.mergeCells(
    `${helper.getCellAddress(labReportNumberRowNumber, groupsColumnNumber)}:${helper.getCellAddress(
      labReportNumberRowNumber,
      groupsColumnNumber + 1
    )}`
  );

  commonSectionsRenderer.addReportGroupsVertical(
    ws,
    startChemicalsRowNumber,
    groupsColumnNumber,
    reportItems,
    tableGroups
  );

  commonSectionsRenderer.addReportChemicalsVertical(
    ws,
    startChemicalsRowNumber,
    groupsColumnNumber + 1,
    reportItems,
    sessionParameters
  );

  const cellAddress = helper.getCellAddress(labReportNumberRowNumber, groupsColumnNumber);

  helper.setCell(
    ws,
    cellAddress,
    literals.labReportNo,
    constants.fontSize.header,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  return labReportNumberRowNumber; // which is last row number
}

function addSamplesRows(
  ws: Worksheet,
  startRowNumber: number,
  columnNumber: number,
  reportItems: RinsateReportItem[],
  samples: Sample[],
  units: string,
  sessionParameters: SessionParameters
) {
  let currentColumnNumber = columnNumber;

  for (const sample of samples) {
    const sampleId = sample.labSampleId;
    let currentRowNumber = startRowNumber;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      sample.dpSampleId,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    currentRowNumber++;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      sample.dateSampled,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentRowNumber++;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      extras.isWaterAssessment(sessionParameters) ? literals.water : literals.soil,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentRowNumber++;

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      units,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentRowNumber++;

    for (const chemical of reportItems) {
      const chemicalSamples = chemical.reportCells;
      const chemicalData = chemicalSamples[sampleId];

      const cellAddress = helper.getCellAddress(currentRowNumber, currentColumnNumber);

      commonSectionsRenderer.addChemicalValue(ws, cellAddress, chemicalData, sessionParameters, true);

      currentRowNumber++;
    }

    helper.setCell(
      ws,
      helper.getCellAddress(currentRowNumber, currentColumnNumber),
      sample.labReportNo,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
    currentColumnNumber++;
  }
}
