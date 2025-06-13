import * as _ from 'lodash';
import utils from '../../utils';

import helper from '../reportHelper';
import commonSectionsRenderer from '../commonSectionsRenderer';
import * as constants from '../../constants/constants';
import * as literals from '../../constants/literals';
import {AddWorksheetOptions, Workbook, Worksheet} from 'exceljs';
import extras from '../../calculations/extras';
import reportHelper from '../reportHelper';

const path = utils.loadModule('path');

export default {generateRPDTableTranspose};

const workSheetPropsRPD: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateRPDTableTranspose(
  wb: Workbook,
  dataFolderPath: string,
  sortedUnitsAndGroupedReportItems: SortedAndGroupedReportItems,
  replicatedSamplePairs: ReplicatedSamplesPair[],
  chemicalGroups: ChemicalGroup[],
  reportGroups: string[],
  sessionParameters: SessionParameters,
  showDepthRow: boolean
) {
  let groupsColumnNumber = 0;
  let chemicalsColumnNumber = 1;
  let startContentColumnNumber = 2;
  let startRowNumber = 7;

  let startContentRowNumber = showDepthRow ? startRowNumber + 6 : startRowNumber + 5;

  const tableGroups: ChemicalGroup[] = reportHelper.getSelectedGroupsFromSeed(chemicalGroups, reportGroups);

  const titleData = {
    sheetName: literals.rpd,
    sheetTitle: extras.isWaterAssessment(sessionParameters)
      ? literals.relativePercentageTableTitleWater
      : literals.relativePercentageTableTitleSoilWaste,
  };

  const ws = wb.addWorksheet(titleData.sheetName, workSheetPropsRPD);
  ws.views = [...workSheetPropsRPD.views, {showGridLines: false}];

  commonSectionsRenderer.addSheetHeader(ws, titleData.sheetTitle);

  sortedUnitsAndGroupedReportItems.units.forEach((units) => {
    const tableDataByUnit = sortedUnitsAndGroupedReportItems.reportItems[units] as ReportItem[];

    addRpHeaderVertically(ws, startRowNumber, groupsColumnNumber, startContentRowNumber, showDepthRow);

    commonSectionsRenderer.addReportGroupsVertical(
      ws,
      startContentRowNumber,
      groupsColumnNumber,
      tableDataByUnit,
      tableGroups
    );

    let lastRow = commonSectionsRenderer.addReportChemicalsVertical(
      ws,
      startContentRowNumber,
      chemicalsColumnNumber,
      tableDataByUnit,
      sessionParameters
    );

    addSamplesColumnsRp(
      ws,
      startRowNumber,
      startContentColumnNumber,
      tableDataByUnit,
      replicatedSamplePairs,
      units,
      showDepthRow,
      sessionParameters
    );

    startRowNumber = lastRow + 3; // for the next block of tables with another units
    startContentRowNumber = showDepthRow ? startRowNumber + 6 : startRowNumber + 5; // for the next block of tables with another units
  });

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);
}

function addRpHeaderVertically(
  ws: Worksheet,
  rowNumber: number,
  groupsColumnNumber: number,
  contentRowNumber: number,
  showDepthColumn: boolean
) {
  //Merge 2 first cells (chemical and group one) for fitting in title
  for (var i = rowNumber; i < contentRowNumber; i++) {
    ws.mergeCells(
      `${helper.getCellAddress(i, groupsColumnNumber)}:${helper.getCellAddress(i, groupsColumnNumber + 1)}`
    );
  }

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, groupsColumnNumber),
    literals.labReportNo,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, groupsColumnNumber),
    literals.sampleId,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  if (showDepthColumn) {
    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber++, groupsColumnNumber),
      literals.depth,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
  }

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, groupsColumnNumber),
    literals.sampleDate,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, groupsColumnNumber),
    literals.sampleType,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, groupsColumnNumber),
    literals.units,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}

function addSamplesColumnsRp(
  ws: Worksheet,
  startRowNumber: number,
  startContentColumnNumber: number,
  reportItems: RpdReportItem[],
  replicaSamples: ReplicatedSamplesPair[],
  units: string,
  showDepthRow: boolean,
  sessionParameters: SessionParameters
) {
  const originalSampleColumnNumber = startContentColumnNumber;
  const replicateSampleColumnNumber = startContentColumnNumber + 1;
  const diffColumnNumber = startContentColumnNumber + 2;
  const rpdColumnNumber = startContentColumnNumber + 3;
  const gapColumnNumber = 5;
  const startContentRowNumber = showDepthRow ? startRowNumber + 6 : startRowNumber + 5;

  const getNextBlockColumnNumber = (columnNumber: number, index: number) => columnNumber + gapColumnNumber * index;
  const diffRpdTitleRowNumber = startContentRowNumber - 3; // because start connetent is dinamical because of showDepthColumn
  const unitsRowNumber = startContentRowNumber - 1; // because start connetent is dinamical because of showDepthColumn

  for (let i = 0; i < replicaSamples.length; i++) {
    const replicatedSample = replicaSamples[i];
    const {primary: original, replica} = replicatedSample;

    addRpSamplesInfo(
      ws,
      startRowNumber,
      getNextBlockColumnNumber(originalSampleColumnNumber, i),
      original,
      units,
      showDepthRow
    );

    addRpSamplesInfo(
      ws,
      startRowNumber,
      getNextBlockColumnNumber(replicateSampleColumnNumber, i),
      replica,
      units,
      showDepthRow
    );

    let contentRowNumber = startContentRowNumber;

    helper.setCell(
      ws,
      helper.getCellAddress(diffRpdTitleRowNumber, getNextBlockColumnNumber(diffColumnNumber, i)),
      literals.difference,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    helper.setCell(
      ws,
      helper.getCellAddress(diffRpdTitleRowNumber, getNextBlockColumnNumber(rpdColumnNumber, i)),
      literals.rpd,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    helper.setCell(
      ws,
      helper.getCellAddress(unitsRowNumber, getNextBlockColumnNumber(diffColumnNumber, i)),
      units,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    helper.setCell(
      ws,
      helper.getCellAddress(unitsRowNumber, getNextBlockColumnNumber(rpdColumnNumber, i)),
      '%',
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    helper.setHairBorderAroundCellsByRow(
      ws,
      startRowNumber,
      startContentRowNumber,
      getNextBlockColumnNumber(diffColumnNumber, i)
    );

    helper.setHairBorderAroundCellsByRow(
      ws,
      startRowNumber,
      startContentRowNumber,
      getNextBlockColumnNumber(rpdColumnNumber, i)
    );

    for (const chemical of reportItems) {
      const replicateData = chemical.replicates.find(
        (item) => item.originalLabId === original.labSampleId && item.replicateLabId === replica.labSampleId
      );

      helper.setCell(
        ws,
        helper.getCellAddress(contentRowNumber, getNextBlockColumnNumber(originalSampleColumnNumber, i)),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.originalValue),
        constants.fontSize.content,
        sessionParameters.highlightAllDetections && replicateData.originalDataIsDetected,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      helper.setCell(
        ws,
        helper.getCellAddress(contentRowNumber, getNextBlockColumnNumber(replicateSampleColumnNumber, i)),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.replicateValue),
        constants.fontSize.content,
        sessionParameters.highlightAllDetections && replicateData.replicateDataIsDetected,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      helper.setCell(
        ws,
        helper.getCellAddress(contentRowNumber, getNextBlockColumnNumber(diffColumnNumber, i)),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.diffValue),
        constants.fontSize.content,
        false,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      helper.setCell(
        ws,
        helper.getCellAddress(contentRowNumber, getNextBlockColumnNumber(rpdColumnNumber, i)),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.rpdValue),
        constants.fontSize.content,
        replicateData.rpdMoreThanThirty,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      contentRowNumber++;
    }
  }
}

function addRpSamplesInfo(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  sample: Sample,
  units: string,
  showDepthColumn: boolean
) {
  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, startColumnIndex),
    sample.labReportNo,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, startColumnIndex),
    sample.dpSampleId,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  if (showDepthColumn) {
    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber++, startColumnIndex),
      helper.getDepth(sample.depth),
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
  }

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, startColumnIndex),
    sample.dateSampled,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, startColumnIndex),
    sample.matrixType,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber++, startColumnIndex),
    units,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}
