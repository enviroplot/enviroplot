import * as _ from 'lodash';

import extras from './../../calculations/extras';

describe('Get correct Soil Display Options', () => {
  let exceededCriteria: {
    [key: string]: ExceededCriterion[];
  } = undefined;
  let sessionParameters: SessionParameters = undefined;

  beforeEach(async () => {
    exceededCriteria = {
      'HEALTH INVESTIGATION LEVELS': [],
      'HEALTH SCREENING LEVELS': [],
      'CRC CARE CRITERIA': [],
      'ECOLOGICAL INVESTIGATION LEVELS': [],
      'ECOLOGICAL SCREENING LEVELS': [],
      'MANAGEMENT LIMITS': [],
      'HSL FOR DEPTH 0-1m': [],
    };
    sessionParameters = {
      applyBiodegradation: false,
      highlightAllDetections: false,
      displayOptions: {
        showDepthColumn: true,
        showSummaryStatistics: false,
        showStatisticalInfoForContaminants: false,
      },
      criteria: ['HSL A/B', 'ESL AES', 'EIL AES', 'ML C/Ind', 'DC HSL A', 'HIL A'],
      chemicalGroups: {
        Soil: [
          'Metals_std',
          'TRH_std',
          'BTEX_std',
          'PAH_std',
          'Phenol_std',
          'OCP_std',
          'OPP_std',
          'PCB_std',
          'ASB_std_AS',
          'ASB_std_Nepm',
        ],
      } as SessionChemicalGroups,
      combinedChemicalsDisplay: {},
      edits: {},
      reportOutputFormat: ReportOutputFormat.STANDARD_OUTPUT_FORMAT,
      projectDetails: {
        assessmentType: AssessmentType.Soil,
        state: 'NSW',
        type: undefined,
        name: undefined,
        number: undefined,
        location: undefined,
        date: undefined,
      },
      waterAssessmentParameters: {
        waterEnvironment: undefined,
        levelOfProtection: {
          bioAccumulative: undefined,
          pfas: undefined,
          others: undefined,
        },
        potentialUse: undefined,
        soilType: undefined,
        waterDepth: undefined,
        vapourIntrusionHsl: undefined,
      },
    };
  });

  test('should get correct blue border for hsl 1-0 m', async () => {
    exceededCriteria['HEALTH SCREENING LEVELS'].push({
      criterionCode: 'HSL A/B',
      limitValue: 45,
    });
    exceededCriteria['HSL FOR DEPTH 0-1m'].push({
      criterionCode: 'HSL A/B',
      limitValue: 45,
    });
    const result = extras.getSoilDisplayOptions(exceededCriteria, false, sessionParameters);
    expect(result.borderColor).toBe(ReportColors.Blue);
    expect(result.isBold).toBe(true);
  });
});

describe('get correct Asbestos determination', () => {
  let shouldBeFalseAsbestosSoil = extras.isAsbestosBooleanValue('FA_AF_g', AssessmentType.Soil);
  let shouldBeTrueAsbestosWaste = extras.isAsbestosBooleanValue('FA_AF_g', AssessmentType.Waste);
  let shouldBeTrueAsbestos = extras.isAsbestosBooleanValue('FA_AF_g', AssessmentType.Soil);
  let shouldBeFalseNotAsbestos = extras.isAsbestosBooleanValue('108-88-3', AssessmentType.Waste);

  expect(shouldBeTrueAsbestos).toBeTruthy;
  expect(shouldBeFalseAsbestosSoil).toBeFalsy;
  expect(shouldBeTrueAsbestosWaste).toBeFalsy;
  expect(shouldBeFalseNotAsbestos).toBeFalsy;
});

describe('should correctly return whether show or not QA/QC reports', () => {
  let dummyNotEmptyReportItems: IHasQaQcData[] = [];
  dummyNotEmptyReportItems.push({
    isHiddenInReport: false,
    reportCells: {},
    group: '',
  });

  let dummyNotEmptySamples: Sample[] = [];
  dummyNotEmptySamples.push({
    labSampleId: '1',
    labReportNo: '2',
    dateSampled: '',
    dpSampleId: '',
    depth: undefined,
    matrixType: '',
    sampleType: '',
    labName: '',
    measurements: [],
  });

  let shouldDoShowReport = extras.shouldShowReport(dummyNotEmptyReportItems, dummyNotEmptySamples);
  let shouldNotShowReportBecauseEmptySamples = extras.shouldShowReport(dummyNotEmptyReportItems, []);
  let shouldNotShowReportBecauseEmptyReportItems = extras.shouldShowReport([], dummyNotEmptySamples);

  expect(shouldDoShowReport).toBeTruthy;
  expect(shouldNotShowReportBecauseEmptyReportItems).toBeFalsy;
  expect(shouldNotShowReportBecauseEmptySamples).toBeFalsy;
});

describe('should remove values without measurements', () => {
  let dummyNotEmptyReportItems: IHasQaQcData[] = [];
  dummyNotEmptyReportItems.push({
    isHiddenInReport: false,
    reportCells: {},
    group: '',
  });

  let dummyNotEmptySamples: Sample[] = [];
  dummyNotEmptySamples.push({
    labSampleId: '1',
    labReportNo: '2',
    dateSampled: '',
    dpSampleId: '',
    depth: undefined,
    matrixType: '',
    sampleType: '',
    labName: '',
    measurements: [],
  });

  let shouldDoShowReport = extras.shouldShowReport(dummyNotEmptyReportItems, dummyNotEmptySamples);
  let shouldNotShowReportBecauseEmptySamples = extras.shouldShowReport(dummyNotEmptyReportItems, []);
  let shouldNotShowReportBecauseEmptyReportItems = extras.shouldShowReport([], dummyNotEmptySamples);

  expect(shouldDoShowReport).toBeTruthy;
  expect(shouldNotShowReportBecauseEmptyReportItems).toBeFalsy;
  expect(shouldNotShowReportBecauseEmptySamples).toBeFalsy;
});
