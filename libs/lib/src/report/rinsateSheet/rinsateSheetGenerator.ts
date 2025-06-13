import * as _ from 'lodash';

import {Workbook} from 'exceljs';
import extras from '../../calculations/extras';
import rinsateSheetRenderer from './rinsateSheetRenderer';
import rinsateSheetRendererTranspose from './rinsateSheetRendererTranspose';

export default {
  generateRinsateSheet,
};

async function generateRinsateSheet(
  wb: Workbook,
  dataFolderPath: string,
  reportItems: RinsateReportItem[],
  samples: Sample[],
  chemicalGroups: ChemicalGroup[],
  selectedGroupsKeys: string[],
  sessionParameters: SessionParameters
) {
  if (!extras.shouldShowReport(reportItems, samples)) return;

  const tableData = extras.removeHiddenItems(reportItems, samples, selectedGroupsKeys);

  const sortedUnitsAndGroupedReportItems = extras.getSortedByUnits(
    tableData,
    extras.isWasteAssessment(sessionParameters)
  );

  switch (sessionParameters.reportOutputFormat) {
    case ReportOutputFormat.STANDARD_OUTPUT_FORMAT:
      rinsateSheetRenderer.generateRinsateSheet(
        wb,
        dataFolderPath,
        sortedUnitsAndGroupedReportItems,
        samples,
        chemicalGroups,
        selectedGroupsKeys,
        sessionParameters
      );
      break;
    case ReportOutputFormat.TRANSPOSED_OUTPUT_FORMAT:
      rinsateSheetRendererTranspose.generateRinsateSheetTranspose(
        wb,
        dataFolderPath,
        sortedUnitsAndGroupedReportItems,
        samples,
        chemicalGroups,
        selectedGroupsKeys,
        sessionParameters
      );
      break;
    default:
      break;
  }
}
