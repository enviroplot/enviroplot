import * as _ from 'lodash';

import {Workbook} from 'exceljs';
import extras from '../../calculations/extras';
import tripSpikeSheetRenderer from './tripSpikeSheetRenderer';
import tripSpikeSheetRendererTranspose from './tripSpikeSheetRendererTranspose';

export default {
  generateTripSpikeSheet,
};

async function generateTripSpikeSheet(
  wb: Workbook,
  dataFolderPath: string,
  tsSamples: Sample[],
  reportItems: ReportItem[],
  selectedGroupsKeys: string[],
  groupsLookUp: any,
  sessionParameters: SessionParameters
) {
  const btexGroup: Chemical[] = groupsLookUp.BTEX_std ?? groupsLookUp.BTEX;

  if (!btexGroup) {
    return;
  }

  const uniqueBtexGroup = btexGroup.filter((chemical, index, arr) => {
    return arr.findIndex((x) => x.code === chemical.code) === index;
  });

  if (!extras.shouldShowReport(reportItems, tsSamples)) {
    return;
  }

  const arr = reportItems.filter((element) => {
    return uniqueBtexGroup.some((chemical) => chemical.code === element.code);
  });

  const tableData = extras.removeHiddenItems(arr, tsSamples, selectedGroupsKeys, true);

  switch (sessionParameters.reportOutputFormat) {
    case ReportOutputFormat.STANDARD_OUTPUT_FORMAT:
      tripSpikeSheetRenderer.generateTripSpikeSheet(
        wb,
        dataFolderPath,
        tsSamples,
        tableData,
        uniqueBtexGroup,
        sessionParameters
      );
      break;
    case ReportOutputFormat.TRANSPOSED_OUTPUT_FORMAT:
      tripSpikeSheetRendererTranspose.generateTripSpikeSheetTranspose(
        wb,
        dataFolderPath,
        tsSamples,
        tableData,
        uniqueBtexGroup,
        sessionParameters
      );
      break;
    default:
      break;
  }
}
