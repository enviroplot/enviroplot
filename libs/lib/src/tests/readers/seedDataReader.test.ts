import seedDataReader from '../../readers/seedDataReader';

test('setChemicalDetails function', () => {
  let allChemicals: Chemical[] = [
    {
      calculated: false,
      calculationFormulaType: CalculationFormulaType.NotDefined,
      chemicalGroup: '',
      code: '100-00-5',
      codeForAssessing: '',
      isBioaccumulative: false,
      name: '1-chloro-4-nitrobenzene',
      sortOrder: -1,
    },
  ];
  let assessmentChemicalWithSameCode: Chemical[] = [
    {
      calculated: false,
      calculationFormulaType: CalculationFormulaType.NotDefined,
      chemicalGroup: 'PHYSICAL_PARAM',
      code: '100-00-5',
      codeForAssessing: '',
      isBioaccumulative: false,
      name: '',
      sortOrder: 1,
    },
  ];

  let resultName = seedDataReader.setChemicalDetails(allChemicals, assessmentChemicalWithSameCode);
  expect(resultName[0].name).toBe('1-chloro-4-nitrobenzene');
});

describe('should read correct data from seed file', () => {
  let seedData: SeedData = null;
  let chemicalsSeedFilePath = './data/seed/SeedData_chemicals.xlsx';
  let soilAssessmentSeedFilePath = './data/seed/SeedData_soil.xlsx';
  let wasteAssessmentSeedFilePath = './data/seed/SeedData_waste.xlsx';
  let waterAssessmentSeedFilePath = './data/seed/SeedData_water.xlsx';

  beforeAll(async () => {
    jest.setTimeout(50000);
    seedData = await seedDataReader.readSeedData(
      chemicalsSeedFilePath,
      soilAssessmentSeedFilePath,
      wasteAssessmentSeedFilePath,
      waterAssessmentSeedFilePath
    );
  });
  test('should successfully Read EGV critiron details', async () => {
    expect(seedData.soilData.egvCriterionDetails).toHaveLength;
  });
});
