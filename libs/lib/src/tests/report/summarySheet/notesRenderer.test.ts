import {Workbook, Worksheet} from 'exceljs';
const Excel = require('exceljs');
import notesRenderer from './../../../report/summarySheet/notesRenderer';
import seedDataReader from '../../../readers/seedDataReader';

describe('should display correct notes for soil criteria depending on selection', () => {
  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';

  beforeAll(async () => {
    let seedData: SeedData = null;

    jest.setTimeout(50000);
    seedData = await seedDataReader.readSeedData(
      chemicalsSeedFilePath,
      soilAssessmentSeedFilePath,
      wasteAssessmentSeedFilePath,
      waterAssessmentSeedFilePath
    );
    seedDataCriteria = seedData.soilData.criteria;
  });

  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');
  let rowNumber: number = 47;
  let startColumnIndex: number = 0;
  let selectedCriteriaHilA: string[] = ['HIL A'];
  let selectedCriteriaHilADC: string[] = ['HIL A', 'DC HSL A'];
  let selectedCriteriaHilAMLInd: string[] = ['HIL A', 'ML C/Ind'];
  let selectedCriteriaHilAMLPos: string[] = ['HIL A', 'ML R/P/POS'];
  let selectedCriteriaHslAB: string[] = ['HSL A/B'];
  let selectedCriteriaHilAHslAB: string[] = ['HIL A', 'HSL A/B'];
  let selectedCriteriaHilAHslD: string[] = ['HIL A', 'HSL D'];
  let selectedCriteriaHilBHslAB: string[] = ['HIL B', 'HSL A/B'];
  let selectedCriteriaHilBHslD: string[] = ['HIL B', 'HSL D'];
  let selectedCriteriaHilCHslC: string[] = ['HIL C', 'HSL C'];
  let selectedCriteriaHilCHslD: string[] = ['HIL C', 'HSL D'];
  let selectedCriteriaHilDHslD: string[] = ['HIL D', 'HSL D'];
  let selectedAllCriteria: string[] = [
    'HIL A',
    'HSL A/B',
    'EIL AES',
    'ESL AES',
    'EGV-indir All',
    'ML C/Ind',
    'DC HSL A',
  ];
  let notSelectedCriteria: string[] = [];
  let selectedPfas: string[] = ['PFAS_std'];
  let notSelectedPfas: string[] = [];
  let seedDataCriteria: any[] = [];

  test('description for disabled criteria', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      notSelectedCriteria,
      notSelectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
    expect(ws.getCell('A51').text).toBe('');
  });

  test('description for HIL A without PFAS group selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilA,
      notSelectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013)');
  });

  test('description for HIL A with PFAS group selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilA,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
  });

  test('description for HIL A with PFAS group and DC selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilADC,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('DC');
    expect(ws.getCell('D52').text).toBe('Direct contact HSL A Residential (Low density) (CRC CARE, 2011)');
  });

  test('description for HIL A with PFAS group and ML/Ind selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilAMLInd,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('DC');
    expect(ws.getCell('D52').text).toBe('Direct contact HSL A Residential (Low density) (CRC CARE, 2011)');
  });

  test('description for HIL A with PFAS group and ML/POS selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilAMLPos,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('DC');
    expect(ws.getCell('D52').text).toBe('Direct contact HSL A Residential (Low density) (CRC CARE, 2011)');
  });

  test('description for all criteria selected (with PFAS group)', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedAllCriteria,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Residential A with garden/accessible soil'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-A/B (NEPC, 2013)');
    expect(ws.getCell('B53').text).toBe('DC');
    expect(ws.getCell('D53').text).toBe('Direct contact HSL A Residential (Low density) (CRC CARE, 2011)');
    expect(ws.getCell('O54').text).toBe('EGV-Indir');
    expect(ws.getCell('Q54').text).toBe('EGV, all land uses, Indirect exposure (HEPA, 2020)');
    expect(ws.getCell('O51').text).toBe('EGV');
    expect(ws.getCell('Q51').text).toBe('EGV, all land uses, direct exposure (HEPA, 2020)');
    expect(ws.getCell('O52').text).toBe('ESL');
    expect(ws.getCell('Q52').text).toBe('Areas of Ecological Significance (NEPC, 2013)');
  });

  test('description for all criteria selected (without PFAS group)', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedAllCriteria,
      notSelectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Residential A with garden/accessible soil'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013)');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-A/B (NEPC, 2013)');
    expect(ws.getCell('B53').text).toBe('DC');
    expect(ws.getCell('D53').text).toBe('Direct contact HSL A Residential (Low density) (CRC CARE, 2011)');
    expect(ws.getCell('O51').text).toBe('EIL');
    expect(ws.getCell('Q51').text).toBe('Areas of Ecological Significance (NEPC, 2013)');
    expect(ws.getCell('O54').text).toBe('EGV-Indir');
    expect(ws.getCell('Q54').text).toBe('EGV, all land uses, Indirect exposure (HEPA, 2020)');
  });

  test('description for HSL A/B selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHslAB,
      notSelectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for:  [user input required]');
    expect(ws.getCell('B51').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D51').text).toBe('HSL-A/B (NEPC, 2013)');
  });

  test('description for HIL A & HSL A/B criteria without PFAS group selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilAHslAB,
      notSelectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Residential A with garden/accessible soil'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013)');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-A/B (NEPC, 2013)');
  });

  test('description for HIL A & HSL A/B criteria with PFAS group selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilAHslAB,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Residential A with garden/accessible soil'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-A/B (NEPC, 2013)');
  });

  test('description for HIL A & HSL D criteria selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilAHslD,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Residential A with garden/accessible soil with commercial and/or communal parking below residential use (including as basement)'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-D (NEPC, 2013)');
  });

  test('description for HIL B & HSL A/B criteria selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilBHslAB,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Residential B with minimal opportunities for soil access'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-B (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-A/B (NEPC, 2013)');
  });

  test('description for HIL B & HSL D criteria selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilBHslD,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Residential B with minimal opportunities for soil access with commercial and/or communal parking below residential use (including as basement)'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-B (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-D (NEPC, 2013)');
  });

  test('description for HIL C & HSL C criteria selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilCHslC,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Recreational C including public open space'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-C (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-C (NEPC, 2013)');
  });

  test('description for HIL C & HSL D criteria selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilCHslD,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe(
      'SAC based on generic land use thresholds for Recreational C including public open space with amenities buildings'
    );
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-C (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-D (NEPC, 2013)');
  });

  test('description for HIL D & HSL D criteria selected', () => {
    notesRenderer.addSoilAssessmentSACNotes(
      ws,
      rowNumber,
      startColumnIndex,
      selectedCriteriaHilDHslD,
      selectedPfas,
      seedDataCriteria
    );
    expect(ws.getCell('A49').text).toBe('SAC based on generic land use thresholds for Commercial/ industrial D');
    expect(ws.getCell('B51').text).toBe('HIL');
    expect(ws.getCell('D51').text).toBe('HIL-D (NEPC, 2013 or HEPA, 2020 (PFAS only))');
    expect(ws.getCell('B52').text).toBe('HSL (vapour intrusion)');
    expect(ws.getCell('D52').text).toBe('HSL-D (NEPC, 2013)');
  });
});

test('addNotesRow function', () => {
  let wb: Workbook = new Excel.Workbook();
  let ws: Worksheet = wb.addWorksheet('test');
  let rowNumber: number = 34;
  let startColumnIndex: number = 0;
  let label: string = 'a';
  let description: string = 'QA/QC replicate of sample listed directly below the primary sample';

  notesRenderer.addNotesRow(ws, rowNumber, startColumnIndex, label, description);
  expect(ws.getCell('A34').text).toBe('a');
  expect(ws.getCell('B34').text).toBe('QA/QC replicate of sample listed directly below the primary sample');
});

test('getNote function', () => {
  expect(notesRenderer.getNote(['HIL A', 'HSL A/B'])).toBe(
    'SAC based on generic land use thresholds for Residential A with garden/accessible soil'
  );
  expect(notesRenderer.getNote(['HIL A', 'HSL D'])).toBe(
    'SAC based on generic land use thresholds for Residential A with garden/accessible soil with commercial and/or communal parking below residential use (including as basement)'
  );
  expect(notesRenderer.getNote(['HIL B', 'HSL A/B'])).toBe(
    'SAC based on generic land use thresholds for Residential B with minimal opportunities for soil access'
  );
  expect(notesRenderer.getNote(['HIL B', 'HSL D'])).toBe(
    'SAC based on generic land use thresholds for Residential B with minimal opportunities for soil access with commercial and/or communal parking below residential use (including as basement)'
  );
  expect(notesRenderer.getNote(['HIL C', 'HSL C'])).toBe(
    'SAC based on generic land use thresholds for Recreational C including public open space'
  );
  expect(notesRenderer.getNote(['HIL C', 'HSL D'])).toBe(
    'SAC based on generic land use thresholds for Recreational C including public open space with amenities buildings'
  );
  expect(notesRenderer.getNote(['HIL D', 'HSL D'])).toBe(
    'SAC based on generic land use thresholds for Commercial/ industrial D'
  );
  expect(notesRenderer.getNote(['HIL A'])).toBe('SAC based on generic land use thresholds for:  [user input required]');
  expect(notesRenderer.getNote([])).toBe('SAC based on generic land use thresholds for:  [user input required]');
  expect(notesRenderer.getNote(['HIL A', 'EIL AES', 'ESL AES', 'EGV-indir All', 'ML C/Ind', 'DC HSL A'])).toBe(
    'SAC based on generic land use thresholds for:  [user input required]'
  );
  expect(notesRenderer.getNote(['EIL AES', 'ESL AES', 'EGV-indir All', 'ML C/Ind', 'DC HSL A'])).toBeNull;
});

test('getDescription function', () => {
  let criterionHilA: Criterion = {
    category: CriterionCategory.Health,
    code: 'HIL A',
    dataSource: 'NEPC, 2013',
    group: 'HEALTH INVESTIGATION LEVELS',
    name: 'Residential / Low - High Density',
    sortOrder: 1,
  };
  let criterionHslAB: Criterion = {
    category: CriterionCategory.Health,
    code: 'HSL A/B',
    dataSource: 'NEPC, 2013',
    group: 'HEALTH SCREENING LEVELS',
    name: 'Residential / Low - High Density',
    sortOrder: 5,
  };
  let criterionDC: Criterion = {
    category: CriterionCategory.Health,
    code: 'DC HSL A',
    dataSource: 'CRC CARE, 2011',
    group: 'CRC CARE CRITERIA',
    name: 'Direct contact HSL A Residential (Low density)',
    sortOrder: 9,
  };
  let criterionEilEsl: Criterion = {
    category: CriterionCategory.Ecological,
    code: 'EIL AES',
    dataSource: 'NEPC, 2013',
    group: 'ECOLOGICAL INVESTIGATION LEVELS',
    name: 'Areas of Ecological Significance',
    sortOrder: 14,
  };
  let criterionML: Criterion = {
    category: CriterionCategory.Both,
    code: 'ML C/Ind',
    dataSource: 'NEPC, 2013',
    group: 'MANAGEMENT LIMITS',
    name: 'Commercial and Industrial',
    sortOrder: 24,
  };
  let criterionEGV: Criterion = {
    category: CriterionCategory.Ecological,
    code: 'EGV-indir All',
    dataSource: 'HEPA, 2020',
    group: 'ECOLOGICAL INVESTIGATION LEVELS INDIRECT',
    name: 'All land uses',
    sortOrder: 25,
  };

  expect(notesRenderer.getDescription(criterionHilA, false)).toBe('HIL-A (NEPC, 2013)');
  expect(notesRenderer.getDescription(criterionHilA, true)).toBe('HIL-A (NEPC, 2013 or HEPA, 2020 (PFAS only))');
  expect(notesRenderer.getDescription(criterionHslAB, false)).toBe('HSL-A/B (NEPC, 2013)');
  expect(notesRenderer.getDescription(criterionDC, false)).toBe(
    'Direct contact HSL A Residential (Low density) (CRC CARE, 2011)'
  );
  expect(notesRenderer.getDescription(criterionEilEsl, false)).toBe('Areas of Ecological Significance (NEPC, 2013)');
  expect(notesRenderer.getDescription(criterionML, false)).toBe('Commercial and Industrial (NEPC, 2013)');
  expect(notesRenderer.getDescription(criterionEGV, false)).toBe('EGV, all land uses, Indirect exposure (HEPA, 2020)');
  expect(notesRenderer.getDescription(criterionEGV, true)).toBe('EGV, all land uses, Indirect exposure (HEPA, 2020)');
});
