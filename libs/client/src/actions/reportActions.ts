import {UPDATE_REPORT_PREVIEW, EXPORT_REPORT_TO_EXCEL, UPDATE_REPORT_EDITS} from './actionTypes';

import helper from './actionHelper';
import {getReportSamples} from 'reducers/sampleReducer';
import {getSessionParameters} from 'reducers/index';

import reportDataService from 'lib/calculations/reportDataService';
import reportGenerationService from 'lib/report/reportGenerationService';
import dataService from 'services/dataService';

export function updateReportPreview(): any {
  return helper.dispatchAsyncAction(async (dispatch, getState) => {
    const state = getState();

    let reportData: any = null;
    const seedData = dataService.getSeedData(state.session?.project?.assessmentType);

    try {
      const sessionParameters = getSessionParameters(state);

      /* 
        FIXME: the code below has been commented due to the following issues: 
        
        This updateReportPreview() is being called on every user click on "Results" tab. 
        Thus, dispatching loadSamples() method everytime resets all selections and modifications to samples
        (like Trip Blank, Trip Spike, etc) which user has made recently.

        This should be refactored in a proper way.
      */
      // const fileList = sessionParameters.fileList || {};
      // Object.keys(fileList).forEach((fileEntry) => {
      //   if (fileList[fileEntry]?.fileSamplesData?.samples) {
      //     const initialFileSamples = cloneDeep(fileList[fileEntry].fileSamplesData.samples);
      //     dispatch(loadSamples(initialFileSamples));
      //   }
      // });

      const reportSamples = getReportSamples(state);

      reportData = await reportDataService.getReportData(
        reportSamples,
        state.sample.parameters,
        sessionParameters,
        seedData
      );
    } catch (err) {
      console.log('Error on generation report items');
      console.log(err);
    }

    dispatch(helper.getAction(UPDATE_REPORT_PREVIEW, {reportData}));
    return reportData;
  }, null);
}

export function exportReportToExcel(dataFolderPath: any, filePath: any) {
  return helper.dispatchAsyncAction(async (dispatch, getState) => {
    const state = getState();

    const reportData = state.report.data;

    const sessionParameters = getSessionParameters(state);

    try {
      await reportGenerationService.generateReport(filePath, dataFolderPath, reportData, sessionParameters);
    } catch (err) {
      console.log('Error on generation report items');
      console.log(err);
    }

    dispatch(helper.getAction(EXPORT_REPORT_TO_EXCEL, {exportedToFile: filePath}));
  }, null);
}

export const updateReportEdits = (edits) => helper.getAction(UPDATE_REPORT_EDITS, {edits});
