import * as _ from 'lodash';
import {Cell, Row, Workbook, Worksheet} from 'exceljs';

import utils from '../utils';

const Excel = utils.loadModule('exceljs');

export default {
  convertToInitialSeedData,
};

async function convertToInitialSeedData(seedData: SeedData, gvmntSeedFilePath: string, erSeedGwFilePath: string) {
  let gvmntWqDetails = await getGvmntWaterQualityCriterionDetails(gvmntSeedFilePath);

  let pfasWqDetails = seedData.waterData.waterQualityCriterionDetails.filter(function (
    wqDetail: GwWaterQualityCriterionDetail
  ) {
    return (
      wqDetail.criterionDetail.criterionCode === GwCriterionCode.WQFreshPFAS ||
      wqDetail.criterionDetail.criterionCode === GwCriterionCode.WQMarinePFAS
    );
  });

  let allWqDetails = gvmntWqDetails.concat(pfasWqDetails);
  writeWqErSeedFile(seedData, allWqDetails, erSeedGwFilePath);
}

async function writeWqErSeedFile(
  seedData: SeedData,
  gvmntWqDetails: GwWaterQualityCriterionDetail[],
  erSeedGwFilePath: string
) {
  let wb: Workbook = new Excel.Workbook();

  await wb.xlsx.readFile(erSeedGwFilePath);
  let ws = await wb.getWorksheet('CriterionDetailWaterQuality');
  await clearWorkSheet(wb, ws, erSeedGwFilePath);

  let currentRow = 2;
  gvmntWqDetails.forEach((item: GwWaterQualityCriterionDetail) => {
    let row = ws.getRow(currentRow);

    let chemical = seedData.waterData.chemicals.find((chemical) => chemical.code === item.criterionDetail.chemicalCode);

    let lop = getSpeciesProtectionLevelString(item.speciesProtectionLevel);
    row.getCell(1).value = item.criterionDetail.chemicalCode;
    row.getCell(2).value = item.criterionDetail.criterionCode;
    row.getCell(3).value = getWaterEnvironmentString(item.waterEnvironment);
    row.getCell(4).value = lop;
    row.getCell(5).value = item.value;
    row.getCell(6).value = item.units;
    row.getCell(7).value = chemical || chemical != null ? chemical.name : '???';
    currentRow++;
  });

  await wb.xlsx.writeFile(erSeedGwFilePath);
}

async function getGvmntWaterQualityCriterionDetails(
  gvmntSeedFilePath: string
): Promise<GwWaterQualityCriterionDetail[]> {
  let gwWorkbook: Workbook = new Excel.Workbook();

  await gwWorkbook.xlsx.readFile(gvmntSeedFilePath);
  let ws = await gwWorkbook.getWorksheet('toxicant-DGVs');

  let result: GwWaterQualityCriterionDetail[] = [];

  ws.eachRow((wsRow: any, index: number) => {
    if (index === 1) return;

    let row = wsRow.values;
    for (let columnIndex = 7; columnIndex <= 11; columnIndex++) {
      let value = row[columnIndex];

      let waterEnvironment = getWaterEnvironment(row[4]);
      let chemicalCode = row[3];
      if (!isNaN(value)) {
        let waterQualityCriterionDetail: GwWaterQualityCriterionDetail = {
          criterionDetail: {
            chemicalCode: chemicalCode,
            criterionCode: getErCriterionCode(waterEnvironment),
          },
          waterEnvironment: waterEnvironment,
          speciesProtectionLevel: getSpeciesProtectionLevelByColumn(columnIndex),
          value,
          units: 'μg/L',
        };

        result.push(waterQualityCriterionDetail);
      }
    }
  });

  return result;
}

function getWaterEnvironmentString(waterEnvironment: GwWaterEnvironment): string {
  switch (waterEnvironment) {
    case GwWaterEnvironment.Fresh:
      return 'Fresh';
    case GwWaterEnvironment.Marine:
      return 'Marine';
    default:
      return null;
  }
}

function getWaterEnvironment(waterEnvironment: string): GwWaterEnvironment {
  switch (waterEnvironment.toLowerCase()) {
    case 'freshwater':
      return GwWaterEnvironment.Fresh;
    case 'marine water':
      return GwWaterEnvironment.Marine;
    default:
      return null;
  }
}

function getSpeciesProtectionLevelString(columnIndex: GwSpeciesProtectionLevel): string {
  switch (columnIndex) {
    case GwSpeciesProtectionLevel.Level_80:
      return '80';
    case GwSpeciesProtectionLevel.Level_90:
      return '90';
    case GwSpeciesProtectionLevel.Level_95:
      return '95';
    case GwSpeciesProtectionLevel.Level_99:
      return '99';
    case GwSpeciesProtectionLevel.Level_Unknown:
      return 'Unknown';
  }
}

function getSpeciesProtectionLevelByColumn(columnIndex: number): GwSpeciesProtectionLevel {
  switch (columnIndex) {
    case 7:
      return GwSpeciesProtectionLevel.Level_99;
    case 8:
      return GwSpeciesProtectionLevel.Level_95;
    case 9:
      return GwSpeciesProtectionLevel.Level_90;
    case 10:
      return GwSpeciesProtectionLevel.Level_80;
    case 11:
      return GwSpeciesProtectionLevel.Level_Unknown;
    default:
      return null;
  }
}

function getErCriterionCode(waterEnvironment: GwWaterEnvironment) {
  let wqPart = waterEnvironment === GwWaterEnvironment.Fresh ? 'Fresh' : 'Marine';
  return `WQ${wqPart}`;
}

async function clearWorkSheet(wb: Workbook, ws: Worksheet, filePath: string) {
  await ws.eachRow(async (wsRow: Row, index: number) => {
    if (index === 1) return;
    await wsRow.eachCell((cell: Cell) => {
      cell.value = '';
    });
  });

  await wb.xlsx.writeFile(filePath);
}
