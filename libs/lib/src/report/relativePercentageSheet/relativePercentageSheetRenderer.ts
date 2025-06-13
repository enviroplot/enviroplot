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

export default {generateRPDTable};

const workSheetPropsRPD: Partial<AddWorksheetOptions> = {
  views: [{state: 'frozen', xSplit: 0, ySplit: 3}],
};

async function generateRPDTable(
  wb: Workbook,
  dataFolderPath: string,
  sortedUnitsAndGroupedReportItems: SortedAndGroupedReportItems,
  replicatedSamplePairs: ReplicatedSamplesPair[],
  chemicalGroups: ChemicalGroup[],
  reportGroups: string[],
  sessionParameters: SessionParameters,
  showDepthColumn: boolean
) {
  let groupsRowNumber = 6;
  let chemicalsRowNumber = 7;
  let startContentRowNumber = 9;
  const startColumnIndex = 0;

  const startContentColumnIndex = showDepthColumn ? 6 : 5;

  const tableGroups: ChemicalGroup[] = reportHelper.getSelectedGroupsFromSeed(chemicalGroups, reportGroups);

  for (const group of chemicalGroups) {
    const groupCodeAlreadyExists = tableGroups.some((existingGroup) => existingGroup.code === group.code);

    if (reportGroups.includes(group.code) && !groupCodeAlreadyExists) {
      tableGroups.push(group);
    }
  }

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

    addRpHeader(ws, groupsRowNumber, startColumnIndex, startContentColumnIndex, showDepthColumn);

    commonSectionsRenderer.addReportGroupsHorizontal(
      ws,
      groupsRowNumber,
      startContentColumnIndex,
      tableDataByUnit,
      tableGroups
    );

    commonSectionsRenderer.addReportChemicalsHorizontal(
      ws,
      chemicalsRowNumber,
      startContentColumnIndex,
      tableDataByUnit,
      sessionParameters
    );

    addSamplesRowsRP(
      ws,
      startContentRowNumber,
      startColumnIndex,
      tableDataByUnit,
      replicatedSamplePairs,
      units,
      showDepthColumn,
      sessionParameters
    );

    groupsRowNumber = groupsRowNumber + 7 * replicatedSamplePairs.length + 2; // for the next block of tables with another units
    chemicalsRowNumber = chemicalsRowNumber + 7 * replicatedSamplePairs.length + 2;
    startContentRowNumber = startContentRowNumber + 7 * replicatedSamplePairs.length + 2;
  });

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(wb, ws, logoPath);
}

function addRpHeader(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  contentColumnNumber: number,
  showDepthColumn: boolean
) {
  for (var i = 0; i < contentColumnNumber; i++) {
    ws.mergeCells(`${helper.getCellAddress(rowNumber, i)}:${helper.getCellAddress(rowNumber + 1, i)}`);
  }

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    literals.labReportNo,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    literals.sampleId,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  if (showDepthColumn) {
    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, startColumnIndex++),
      literals.depth,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
  }

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    literals.sampleDate,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    literals.sampleType,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    literals.units,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}

function addSamplesRowsRP(
  ws: Worksheet,
  startContentRowNumber: number,
  startColumnIndex: number,
  reportItems: RpdReportItem[],
  replicaSamples: ReplicatedSamplesPair[],
  units: string,
  showDepthColumn: boolean,
  sessionParameters: SessionParameters
) {
  const originalSampleRowNumber = startContentRowNumber;
  const replicateSampleRowNumber = startContentRowNumber + 1;
  const diffRowNumber = startContentRowNumber + 2;
  const rpdRowNumber = startContentRowNumber + 3;
  const gapRowsNumber = 6;
  const startContentColumnIndex = showDepthColumn ? 6 : 5;

  const getNextBlockRowNumber = (rowNumber: number, index: number) => rowNumber + gapRowsNumber * index;
  const differenceRpdLiteralsColumnIndex = startContentColumnIndex - 3;
  const unitsDifferenceRPDUnitsIndex = startContentColumnIndex - 1;

  for (let i = 0; i < replicaSamples.length; i++) {
    const replicatedSample = replicaSamples[i];
    const {primary: original, replica} = replicatedSample;

    addRpSamplesInfo(
      ws,
      getNextBlockRowNumber(originalSampleRowNumber, i),
      startColumnIndex,
      original,
      units,
      showDepthColumn
    );
    addRpSamplesInfo(
      ws,
      getNextBlockRowNumber(replicateSampleRowNumber, i),
      startColumnIndex,
      replica,
      units,
      showDepthColumn
    );

    let contentColumnIndex = startContentColumnIndex;

    helper.setHairBorderAroundCellsByColumn(
      ws,
      getNextBlockRowNumber(diffRowNumber, i),
      startColumnIndex,
      contentColumnIndex
    );
    helper.setHairBorderAroundCellsByColumn(
      ws,
      getNextBlockRowNumber(rpdRowNumber, i),
      startColumnIndex,
      contentColumnIndex
    );

    helper.setCell(
      ws,
      helper.getCellAddress(getNextBlockRowNumber(diffRowNumber, i), differenceRpdLiteralsColumnIndex),
      literals.difference,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    helper.setCell(
      ws,
      helper.getCellAddress(getNextBlockRowNumber(rpdRowNumber, i), differenceRpdLiteralsColumnIndex),
      literals.rpd,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    for (const chemical of reportItems) {
      const replicateData = chemical.replicates.find(
        (item) => item.originalLabId === original.labSampleId && item.replicateLabId === replica.labSampleId
      );

      helper.setCell(
        ws,
        helper.getCellAddress(getNextBlockRowNumber(originalSampleRowNumber, i), contentColumnIndex),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.originalValue),
        constants.fontSize.content,
        sessionParameters.highlightAllDetections && replicateData.originalDataIsDetected,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      helper.setCell(
        ws,
        helper.getCellAddress(getNextBlockRowNumber(replicateSampleRowNumber, i), contentColumnIndex),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.replicateValue),
        constants.fontSize.content,
        sessionParameters.highlightAllDetections && replicateData.replicateDataIsDetected,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      helper.setCell(
        ws,
        helper.getCellAddress(getNextBlockRowNumber(diffRowNumber, i), contentColumnIndex),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.diffValue),
        constants.fontSize.content,
        false,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      helper.setCell(
        ws,
        helper.getCellAddress(getNextBlockRowNumber(rpdRowNumber, i), contentColumnIndex),
        reportHelper.formatNumberIfGreaterThan1000(replicateData.rpdValue),
        constants.fontSize.content,
        replicateData.rpdMoreThanThirty,
        helper.getMiddleCenterAlignment(),
        helper.getHairBorderAround()
      );

      contentColumnIndex++;
    }

    helper.setCell(
      ws,
      helper.getCellAddress(getNextBlockRowNumber(diffRowNumber, i), unitsDifferenceRPDUnitsIndex),
      units,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );

    helper.setCell(
      ws,
      helper.getCellAddress(getNextBlockRowNumber(rpdRowNumber, i), unitsDifferenceRPDUnitsIndex),
      literals.percentage,
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
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
    helper.getCellAddress(rowNumber, startColumnIndex++),
    sample.labReportNo,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    sample.dpSampleId,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  if (showDepthColumn) {
    helper.setCell(
      ws,
      helper.getCellAddress(rowNumber, startColumnIndex++),
      helper.getDepth(sample.depth),
      constants.fontSize.content,
      false,
      helper.getMiddleCenterAlignment(true),
      helper.getHairBorderAround()
    );
  }

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    sample.dateSampled,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    sample.matrixType,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );

  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex++),
    units,
    constants.fontSize.content,
    false,
    helper.getMiddleCenterAlignment(true),
    helper.getHairBorderAround()
  );
}
