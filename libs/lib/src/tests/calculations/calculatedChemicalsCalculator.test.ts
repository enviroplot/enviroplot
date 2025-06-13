import ccCalculator from './../../calculations/calculatedChemicalsCalculator';

test('removeIncompleteGroups function', () => {
  const groupedData: Dictionary<ReportItem[]> = {
    'Aldrin + Dieldrin': [
      {
        chemical: 'Aldrin',
        chemicalCodeForAssessing: '309-00-2',
        code: '309-00-2',
        extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
        group: 'OCP_std',
        groupSortOrder: 6,
        isCalculated: false,
        isHiddenInReport: false,
        pqlPrefix: 'exactValue',
        pqlValue: 0.1,
        replicates: [],
        reportCells: {},
        sortOrder: 6,
        units: 'mg/kg',
        wcType: null,
      },
      {
        chemical: 'Dieldrin',
        chemicalCodeForAssessing: '60-57-1',
        code: '60-57-1',
        extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
        group: 'OCP_std',
        groupSortOrder: 6,
        isCalculated: false,
        isHiddenInReport: false,
        pqlPrefix: 'exactValue',
        pqlValue: 0.1,
        replicates: [],
        reportCells: {},
        sortOrder: 7,
        units: 'mg/kg',
        wcType: null,
      },
    ],
    'DDT+DDE+DDD': [
      {
        chemical: 'DDD',
        chemicalCodeForAssessing: '72-54-8',
        code: '72-54-8',
        extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
        group: 'OCP_std',
        groupSortOrder: 6,
        isCalculated: false,
        isHiddenInReport: false,
        pqlPrefix: 'exactValue',
        pqlValue: 0.1,
        replicates: [],
        reportCells: {},
        sortOrder: 2,
        units: 'mg/kg',
        wcType: null,
      },
      {
        chemical: 'DDE',
        chemicalCodeForAssessing: '72-55-9',
        code: '72-55-9',
        extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
        group: 'OCP_std',
        groupSortOrder: 6,
        isCalculated: false,
        isHiddenInReport: false,
        pqlPrefix: 'exactValue',
        pqlValue: 0.1,
        replicates: [],
        reportCells: {},
        sortOrder: 3,
        units: 'mg/kg',
        wcType: null,
      },
    ],
  };
  const calculationsSeedData: Calculation[] = [
    {
      calculatedChemicalsCode: 'Aldrin + Dieldrin',
      calculationsChemicalCode: '309-00-2',
    },

    {calculatedChemicalsCode: 'Aldrin + Dieldrin', calculationsChemicalCode: '60-57-1'},
    {
      calculatedChemicalsCode: 'DDT+DDE+DDD',
      calculationsChemicalCode: '72-54-8',
    },
    {
      calculatedChemicalsCode: 'DDT+DDE+DDD',
      calculationsChemicalCode: '72-55-9',
    },
    {
      calculatedChemicalsCode: 'DDT+DDE+DDD',
      calculationsChemicalCode: '50-29-3',
    },
  ];
  const groupedDataForResult = {...groupedData};
  const stubResult = {
    'Aldrin + Dieldrin': groupedDataForResult['Aldrin + Dieldrin'],
  };
  ccCalculator.removeIncompleteGroups(groupedData, calculationsSeedData);
  expect(groupedData).toEqual(stubResult);
});

test('groupCalculatedChemicalsWithSamples', () => {
  const reportItems: ReportItem[] = [
    {
      chemical: 'Arsenic',
      chemicalCodeForAssessing: '7440-38-2',
      code: '7440-38-2',
      extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
      group: 'Metals_std',
      groupSortOrder: 1,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 4,
      replicates: [],
      reportCells: {},
      sortOrder: 1,
      units: 'mg/kg',
      wcType: null,
    },
    {
      chemical: 'Aldrin',
      chemicalCodeForAssessing: '309-00-2',
      code: '309-00-2',
      extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
      group: 'OCP_std',
      groupSortOrder: 6,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 0.1,
      replicates: [],
      reportCells: {},
      sortOrder: 6,
      units: 'mg/kg',
      wcType: null,
    },
    {
      chemical: 'Dieldrin',
      chemicalCodeForAssessing: '60-57-1',
      code: '60-57-1',
      extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
      group: 'OCP_std',
      groupSortOrder: 6,
      isCalculated: false,
      isHiddenInReport: false,
      pqlPrefix: 'exactValue',
      pqlValue: 0.1,
      replicates: [],
      reportCells: {},
      sortOrder: 7,
      units: 'mg/kg',
      wcType: null,
    },
  ];
  const calculationsSeedData: Calculation[] = [
    {
      calculatedChemicalsCode: 'Aldrin + Dieldrin',
      calculationsChemicalCode: '309-00-2',
    },

    {calculatedChemicalsCode: 'Aldrin + Dieldrin', calculationsChemicalCode: '60-57-1'},
    {
      calculatedChemicalsCode: 'DDT+DDE+DDD',
      calculationsChemicalCode: '72-54-8',
    },
    {
      calculatedChemicalsCode: 'DDT+DDE+DDD',
      calculationsChemicalCode: '72-55-9',
    },
    {
      calculatedChemicalsCode: 'DDT+DDE+DDD',
      calculationsChemicalCode: '50-29-3',
    },
  ];
  const sessionParameters: SessionParameters = {
    applyBiodegradation: false,
    chemicalGroups: {
      Soil: [],
    } as SessionChemicalGroups,
    combinedChemicalsDisplay: {},
    criteria: [],
    displayOptions: {showDepthColumn: true, showSummaryStatistics: false, showStatisticalInfoForContaminants: false},
    edits: {},
    highlightAllDetections: true,
    projectDetails: {
      assessmentType: AssessmentType.Soil,
      state: '',
      type: '',
      name: '',
      number: '',
      location: '',
      date: '',
    },
    waterAssessmentParameters: {
      waterEnvironment: null,
      levelOfProtection: {
        bioAccumulative: null,
        others: null,
        pfas: null,
      },
      potentialUse: null,
      soilType: null,
      waterDepth: null,
      vapourIntrusionHsl: null,
    },
    reportOutputFormat: ReportOutputFormat.STANDARD_OUTPUT_FORMAT,
  };

  const stubResult: object = {
    'Aldrin + Dieldrin#mg/kg': [
      {
        calculatedChemicalsCode: 'Aldrin + Dieldrin',
        chemical: 'Aldrin',
        chemicalCodeForAssessing: '309-00-2',
        code: '309-00-2',
        extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
        group: 'OCP_std',
        groupSortOrder: 6,
        isCalculated: false,
        isHiddenInReport: false,
        pqlPrefix: 'exactValue',
        pqlValue: 0.1,
        replicates: [],
        reportCells: {},
        sortOrder: 6,
        units: 'mg/kg',
        wcType: null,
      },
      {
        calculatedChemicalsCode: 'Aldrin + Dieldrin',
        chemical: 'Dieldrin',
        chemicalCodeForAssessing: '60-57-1',
        code: '60-57-1',
        extraFields: {min: null, max: null, mean: null, standardDeviation: null, ucl: null},
        group: 'OCP_std',
        groupSortOrder: 6,
        isCalculated: false,
        isHiddenInReport: false,
        pqlPrefix: 'exactValue',
        pqlValue: 0.1,
        replicates: [],
        reportCells: {},
        sortOrder: 7,
        units: 'mg/kg',
        wcType: null,
      },
    ],
  };
  const calculatedResult = ccCalculator.groupCalculatedChemicalsWithSamples(
    reportItems,
    calculationsSeedData,
    sessionParameters
  );
  expect(calculatedResult).toEqual(stubResult);
});
