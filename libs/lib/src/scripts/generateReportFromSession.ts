import previewService from '../calculations/reportDataService';
import utils from '../utils';
import reportService from '../report/reportGenerationService';

const fs = utils.loadModule('fs-extra');
const pako = utils.loadModule('pako');

export default {
  generate,
};

async function generate(appSessionFilePath: string, reportPath?: string, outputFormat?: ReportOutputFormat) {
  if (!reportPath) {
    reportPath = './local/report.XLSX';
  }
  let seedDataPath = './data/seed/seed.json';

  let seedData: SeedData = await fs.readJson(seedDataPath);
  let fileExists = await fs.exists(appSessionFilePath);
  if (!fileExists) {
    console.log(`Session file '${appSessionFilePath}' does not exists`);
    return;
  }

  let state = null;

  try {
    let zippedData = await fs.readFile(appSessionFilePath, 'utf8');
    let unzippedData = pako.inflate(zippedData, {to: 'string'});
    state = JSON.parse(unzippedData);
  } catch (err) {
    try {
      state = await fs.readJson(appSessionFilePath);
    } catch (err) {
      console.log('Cannot open session file.');
      return;
    }
  }

  let assessmentTypeSeedData: SoilAssessmentCalculationData | WasteClassificationCalculationData | GwCalculationData =
    null;
  state.session.project.assessmentType === AssessmentType.Waste ? seedData.wasteData : seedData.soilData;

  switch (state.session.project.assessmentType) {
    case AssessmentType.Waste:
      assessmentTypeSeedData = seedData.wasteData;
      break;
    case AssessmentType.Water:
      assessmentTypeSeedData = seedData.waterData;
      break;
    case AssessmentType.Soil:
      assessmentTypeSeedData = seedData.soilData;
      break;
  }

  //logic from Reducer
  let getReportSamples = (state: any) => {
    let samples = state.sample.all;
    let order = state.sample.order;
    let reportSampleIds = state.sample.selection.report;

    let result = [];

    for (let sampleId of order) {
      if (reportSampleIds.includes(sampleId)) {
        const sample = samples[sampleId];
        let sampleWithUpdatedDepth: Sample = {...sample};
        if (sample.depthFrom) {
          sampleWithUpdatedDepth.depth = {
            from: sample.depthFrom,
            to: sample.depthTo ? sample.depthTo : sample.depthFrom,
          };
        }
        result.push(sampleWithUpdatedDepth);
      }
    }

    return result;
  };

  let samplesData = getReportSamples(state);

  let session = state.session;

  let waterAssessmentParameters = session.waterAssessmentParameters;

  if (!outputFormat) {
    outputFormat = state.session.outputFormat;
  }

  let sessionParameters = {
    applyBiodegradation: session.applyBiodegradation,
    shouldOutputAslp: session.shouldOutputAslp,
    shouldOutputTclp: session.shouldOutputTclp,
    highlightAllDetections: session.highlightAllDetections,
    displayOptions: {
      showDepthColumn: session.showDepthColumn,
      showSummaryStatistics: session.wasteStatistics ? session.wasteStatistics.calculateSummaryStatistics : null,
      showStatisticalInfoForContaminants: session.wasteStatistics
        ? session.wasteStatistics.statisticalInfoForContaminants
        : null,
    },
    criteria: session.criteria,
    chemicalGroups: session.chemicalGroups,
    combinedChemicalsDisplay: session.combinedChemicalsDisplay,
    edits: state.report.edits,
    reportOutputFormat: outputFormat,
    projectDetails: {
      assessmentType: session.project.assessmentType,
      state: session.project.state,
      type: session.project.type,
      name: session.project.name,
      number: session.project.number,
      location: session.project.location,
      date: session.project.date,
    },
    waterAssessmentParameters: {
      waterEnvironment: waterAssessmentParameters ? waterAssessmentParameters.waterEnvironment : null,
      levelOfProtection: {
        bioAccumulative:
          waterAssessmentParameters && waterAssessmentParameters.levelOfProtection
            ? waterAssessmentParameters.levelOfProtection.bioAccumulative
            : null,
        pfas:
          waterAssessmentParameters && waterAssessmentParameters.levelOfProtection
            ? waterAssessmentParameters.levelOfProtection.pfas
            : null,
        others:
          waterAssessmentParameters && waterAssessmentParameters.levelOfProtection
            ? waterAssessmentParameters.levelOfProtection.others
            : null,
      },
      potentialUse: waterAssessmentParameters ? waterAssessmentParameters?.potentialUse : null,
      soilType: waterAssessmentParameters ? waterAssessmentParameters?.soilType : null,
      waterDepth: waterAssessmentParameters ? waterAssessmentParameters?.waterDepth : null,
      vapourIntrusionHsl: waterAssessmentParameters ? waterAssessmentParameters?.vapourIntrusionHsl : null,
    },
  };

  let reportData = await previewService.getReportData(
    samplesData,
    state.sample.parameters,
    sessionParameters,
    assessmentTypeSeedData
  );

  return reportService.generateReport(reportPath, './data', reportData, sessionParameters, true);
}
