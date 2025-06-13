import * as _ from 'lodash';
import utils from '../../utils';

import helper from '../reportHelper';
import extras from '../../calculations/extras';
import legendRenderer from './legendRenderer';
import wasteSectionsRenderer from './wasteSectionsRenderer';
import waterSectionsRenderer from './waterSectionRenderer';
import commonSectionsRenderer from '../commonSectionsRenderer';
import * as constants from '../../constants/constants';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';

const workSheetProps: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 8}],
};

const path = utils.loadModule('path');

export default {
  renderSummarySheet,
  addSamplesRows, //for tests
};

async function renderSummarySheet(
  wb: Workbook,
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData,
  dataFolderPath: string,
  reportItems: ReportItem[],
  samples: Sample[],
  tableGroups: ChemicalGroup[],
  selectedTableGroupsKeys: string[],
  tableNumber: number,
  sessionParameters: SessionParameters,
  showDepthColumn: boolean
) {
  if (!reportItems || reportItems.length === 0) return;

  const criteriaNumber = sessionParameters.criteria.length;
  const groupsRowNumber = 6;
  const chemicalsRowNumber = 7;
  const pqlRowNumber = 8;
  const startCriteriaRowNumber = 8;
  const unitsRowNumber = 9 + criteriaNumber;
  const startContentRowNumber = 10 + criteriaNumber;
  const startColumnIndex = 0;
  const startContentColumnIndex = showDepthColumn ? 3 : 2;

  const titleData = helper.getSummarySheetTitle(reportItems, tableGroups, selectedTableGroupsKeys, tableNumber);

  const ws = wb.addWorksheet(titleData.sheetName, workSheetProps);
  ws.views = [...workSheetProps.views, {showGridLines: false}]; //remove all borders

  commonSectionsRenderer.addSheetHeader(ws, titleData.sheetTitle);

  await commonSectionsRenderer.addReportGroupsHorizontal(
    ws,
    groupsRowNumber,
    startContentColumnIndex,
    reportItems,
    tableGroups
  );

  await commonSectionsRenderer.addReportChemicalsHorizontal(
    ws,
    chemicalsRowNumber,
    startContentColumnIndex,
    reportItems,
    sessionParameters
  );

  await commonSectionsRenderer.addReportPQLHorizontal(ws, pqlRowNumber, startContentColumnIndex, reportItems);

  await commonSectionsRenderer.addReportUnitsHorizontal(
    ws,
    unitsRowNumber,
    startContentColumnIndex,
    reportItems,
    showDepthColumn
  );

  // eslint-disable-next-line prefer-const
  let {lastTableRow, lastColumnIndex} = await addSamplesRows(
    ws,
    startContentRowNumber,
    startColumnIndex,
    reportItems,
    samples,
    sessionParameters,
    showDepthColumn
  );

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);

  if (extras.isWasteAssessment(sessionParameters)) {
    lastTableRow = await wasteSectionsRenderer.generateWasteSpecificSectionsHorizontal(
      ws,
      lastTableRow,
      lastColumnIndex,
      startColumnIndex,
      startContentColumnIndex,
      reportItems,
      sessionParameters
    );

    lastTableRow = await legendRenderer.addWasteLegend(ws, lastTableRow, startContentColumnIndex);
  }

  if (extras.isWaterAssessment(sessionParameters)) {
    await waterSectionsRenderer.generateWaterSpecificSectionsRegular(
      ws,
      startCriteriaRowNumber,
      startColumnIndex,
      startContentColumnIndex,
      sessionParameters,
      reportItems,
      seedData as GwCalculationData
    );
  }
  lastTableRow++;

  const isPhenolsPresent = helper.isPhenolsInReportItems(reportItems);
  commonSectionsRenderer.addReportFooter(
    ws,
    lastTableRow,
    startColumnIndex,
    seedData,
    sessionParameters,
    isPhenolsPresent
  );
}

async function addSamplesRows(
  ws: Worksheet,
  rowNumber: number,
  startIndex: number,
  reportItems: ReportItem[],
  samples: Sample[],
  sessionParameters: SessionParameters,
  showDepthColumn: boolean
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

    if (showDepthColumn) {
      helper.setCell(
        ws,
        helper.getCellAddress(rowNumber, currentIndex),
        helper.getDepth(sample.depth),
        constants.fontSize.content,
        false,
        helper.getMiddleCenterAlignment(true),
        helper.getHairBorderAround()
      );
      currentIndex++;
    }

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

    for (const chemical of reportItems) {
      const chemicalSamples = chemical.reportCells;
      const chemicalData = chemicalSamples[sampleId];

      const cellAddress = helper.getCellAddress(rowNumber, currentIndex);

      commonSectionsRenderer.addChemicalValue(ws, cellAddress, chemicalData, sessionParameters);

      currentIndex++;
    }

    if (!lastColumnIndex) lastColumnIndex = currentIndex - 1;

    rowNumber++;
  }

  return {lastTableRow: rowNumber, lastColumnIndex};
}
