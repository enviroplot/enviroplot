import * as _ from 'lodash';

import {Workbook} from 'exceljs';
import extras from '../../calculations/extras';
import tripBlankSheetRenderer from './tripBlankSheetRenderer';
import tripBlankSheetRendererTranspose from './tripBlankSheetRendererTranspose';

export default {
  generateTripBlank,
};

async function generateTripBlank(
  wb: Workbook,
  dataFolderPath: string,
  reportItems: ReportItem[],
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
      tripBlankSheetRenderer.generateTripBlank(
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
      tripBlankSheetRendererTranspose.generateTripBlankTranspose(
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
