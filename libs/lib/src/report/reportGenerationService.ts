import * as _ from 'lodash';
import utils from '../utils';

import extras from '../calculations/extras';
import summarySheetGenerator from './summarySheet/summarySheetGenerator';
import dtSheetGenerator from './dtSheetRenderer';
import sacSheetsRenderer from './sacSheetsRenderer';
import {Workbook} from 'exceljs';
import rinsateSheetGenerator from './rinsateSheet/rinsateSheetGenerator';
import tripBlankSheetGenerator from './tbSheet/tripBlankSheetGenerator';
import relativePercentageSheetGenerator from './relativePercentageSheet/relativePercentageSheetGenerator';
import tripSpikeSheetGenerator from './tsSheet/tripSpikeSheetGenerator';

const Excel = utils.loadModule('exceljs');

export default {
  generateReport,
};

async function generateReport(
  reportPath: string,
  dataFolderPath: string,
  reportData: ReportData,
  sessionParameters: SessionParameters,
  generateSacTables?: boolean
) {
  try {
    // eslint-disable-next-line prefer-const
    let {allReportItems, generalReportItems, rinsateReportItems, rpdReportItems, seedData, samples, sampleParameters} =
      reportData;
    const groupLookup: any = _.groupBy(allReportItems, (item) => {
      return item.group;
    });
    const selectedGroupsKeys = Object.keys(groupLookup) as string[];
    allReportItems = _.sortBy(allReportItems, 'groupSortOrder', 'sortOrder');

    const showDepthColumn =
      sessionParameters.displayOptions.showDepthColumn && !extras.isWaterAssessment(sessionParameters);

    const wb: Workbook = new Excel.Workbook();

    const {tbSamples, tsSamples, rinsateSamples, samplesWithoutTbTsRinsate} = extras.filterTbTsRinsateSamples(samples);

    if (samplesWithoutTbTsRinsate.length && selectedGroupsKeys.length) {
      if (extras.isWasteAssessment(sessionParameters)) {
        await summarySheetGenerator.generateWasteSummarySheet(
          wb,
          selectedGroupsKeys,
          generalReportItems,
          seedData as WasteClassificationCalculationData,
          sessionParameters,
          samplesWithoutTbTsRinsate,
          dataFolderPath,
          showDepthColumn
        );
      }
      if (extras.isSoilAssessment(sessionParameters)) {
        await summarySheetGenerator.generateSoilSummarySheet(
          wb,
          selectedGroupsKeys,
          generalReportItems,
          seedData as SoilAssessmentCalculationData,
          sessionParameters,
          samplesWithoutTbTsRinsate,
          dataFolderPath,
          showDepthColumn
        );
      }
      if (extras.isWaterAssessment(sessionParameters)) {
        await summarySheetGenerator.generateWaterSummarySheet(
          wb,
          selectedGroupsKeys,
          generalReportItems,
          seedData as GwCalculationData,
          sessionParameters,
          samplesWithoutTbTsRinsate,
          dataFolderPath,
          showDepthColumn
        );
      }
    }
    if (!extras.isWaterAssessment(sessionParameters)) {
      await dtSheetGenerator.generate(wb, dataFolderPath, sampleParameters, sessionParameters);
    }

    await tripBlankSheetGenerator.generateTripBlank(
      wb,
      dataFolderPath,
      allReportItems,
      tbSamples,
      seedData.chemicalGroups,
      selectedGroupsKeys,
      sessionParameters
    );

    await tripSpikeSheetGenerator.generateTripSpikeSheet(
      wb,
      dataFolderPath,
      tsSamples,
      allReportItems,
      selectedGroupsKeys,
      groupLookup,
      sessionParameters
    );

    await rinsateSheetGenerator.generateRinsateSheet(
      wb,
      dataFolderPath,
      rinsateReportItems,
      rinsateSamples,
      seedData.chemicalGroups,
      selectedGroupsKeys,
      sessionParameters
    );

    await relativePercentageSheetGenerator.generateRPDTable(
      wb,
      dataFolderPath,
      rpdReportItems,
      samples,
      seedData.chemicalGroups,
      selectedGroupsKeys,
      sessionParameters,
      showDepthColumn
    );

    if (generateSacTables && extras.isSoilAssessment(sessionParameters)) {
      await sacSheetsRenderer.renderSacSheets(
        wb,
        selectedGroupsKeys,
        allReportItems,
        seedData as SoilAssessmentCalculationData,
        samples,
        sessionParameters,
        dataFolderPath
      );
    }
    await wb.xlsx.writeFile(reportPath);
  } catch (err) {
    return console.log(err);
  }
}
