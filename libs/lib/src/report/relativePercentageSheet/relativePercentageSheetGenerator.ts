import * as _ from 'lodash';

import helper from '../reportHelper';
import {Workbook} from 'exceljs';
import extras from '../../calculations/extras';
import relativePercentageSheetRenderer from './relativePercentageSheetRenderer';
import relativePercentageSheetRendererTranspose from './relativePercentageSheetRendererTranspose';

export default {generateRPDTable};

async function generateRPDTable(
  wb: Workbook,
  dataFolderPath: string,
  rpdReportItems: RpdReportItem[],
  samples: Sample[],
  chemicalGroups: ChemicalGroup[],
  selectedGroupsKeys: string[],
  sessionParameters: SessionParameters,
  showDepth: boolean
) {
  const replicatedSamplePairs = helper.getReplicatedSamples(samples);

  let reportItems = rpdReportItems.filter((item) => !item.isHiddenInReport);

  reportItems = reportItems.filter(
    (item) =>
      item.replicates.filter(
        (replicate) =>
          replicate.diffValue != ValueAbbreviations.Dash && replicate.originalValue != ValueAbbreviations.Dash
      ).length > 0
  );

  if (!replicatedSamplePairs.length || !reportItems.length) return;

  const tableGroups: ChemicalGroup[] = [];

  for (const group of chemicalGroups) {
    if (selectedGroupsKeys.includes(group.code)) {
      tableGroups.push(group);
    }
  }

  const sortedUnitsAndGroupedReportItems = extras.getSortedByUnits(
    reportItems,
    extras.isWasteAssessment(sessionParameters)
  );

  switch (sessionParameters.reportOutputFormat) {
    case ReportOutputFormat.STANDARD_OUTPUT_FORMAT:
      relativePercentageSheetRenderer.generateRPDTable(
        wb,
        dataFolderPath,
        sortedUnitsAndGroupedReportItems,
        replicatedSamplePairs,
        chemicalGroups,
        selectedGroupsKeys,
        sessionParameters,
        showDepth
      );
      break;
    case ReportOutputFormat.TRANSPOSED_OUTPUT_FORMAT:
      relativePercentageSheetRendererTranspose.generateRPDTableTranspose(
        wb,
        dataFolderPath,
        sortedUnitsAndGroupedReportItems,
        replicatedSamplePairs,
        chemicalGroups,
        selectedGroupsKeys,
        sessionParameters,
        showDepth
      );
      break;
    default:
      break;
  }
}
