import * as _ from 'lodash';

import * as literals from '../../constants/literals';
import * as LEGEND from '../../constants/legend';
import * as constants from '../../constants/constants';

import helper from '../reportHelper';
import {Worksheet} from 'exceljs';

export default {
  addNotes,
  addSoilAssessmentSACNotes, //for tests
  addNotesRow, //for tests
  getNote, //for tests
  getDescription, //for tests
};

function addNotes(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  sessionParameters: SessionParameters,
  seedData: SoilAssessmentCalculationData | GwCalculationData | WasteClassificationCalculationData,
  isPhenolsPresent: boolean
) {
  helper.setCell(ws, helper.getCellAddress(rowNumber, startColumnIndex), LEGEND.notes, constants.fontSize.header, true);

  switch (sessionParameters.projectDetails.assessmentType) {
    case AssessmentType.Waste:
      addWasteAssessmentNotes(ws, rowNumber, startColumnIndex, sessionParameters);
      break;
    case AssessmentType.Soil:
      addSoilAssessmentNotes(
        ws,
        rowNumber,
        startColumnIndex,
        sessionParameters,
        seedData as SoilAssessmentCalculationData,
        isPhenolsPresent
      );

      break;
    case AssessmentType.Water:
      addWaterAssessmentNotes(ws, rowNumber, startColumnIndex, sessionParameters, seedData as GwCalculationData);
      break;
    default:
      break;
  }
}

function addWaterAssessmentNotes(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  sessionParameters: SessionParameters,
  seedData: GwCalculationData
) {
  const notes: KeyLabelItem[] = [...constants.waterNotesStart];

  const selectedCriteriacodes: string[] = sessionParameters.criteria;

  const allWaterCriteria: Criterion[] = seedData.criteria;
  const assessedCriteria = allWaterCriteria.filter((criterion: Criterion) =>
    selectedCriteriacodes.includes(criterion.code)
  );
  assessedCriteria.forEach((criterion: Criterion) => {
    const label = helper.getGwCriteriaTitle(criterion.code, criterion.dataSource, sessionParameters);
    notes.push({
      label: label,
    });
  });

  notes.push({label: constants.unknownLopWaterNote});

  notes.push(...constants.waterNotesEnd);

  for (const note of notes) {
    rowNumber++;
    addNotesRow(ws, rowNumber, startColumnIndex, note.key, note.label);
  }
}

function addWasteAssessmentNotes(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  sessionParameters: SessionParameters
) {
  const notes = [...constants.wasteNotes];

  for (const note of notes) {
    if (!sessionParameters.displayOptions.showStatisticalInfoForContaminants && note.key === literals.ucl95) {
      continue;
    }
    rowNumber++;
    addNotesRow(ws, rowNumber, startColumnIndex, note.key, note.label);
  }
}

function addSoilAssessmentNotes(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  sessionParameters: SessionParameters,
  seedData: SoilAssessmentCalculationData,
  isPhenolsPresent: boolean
) {
  const assessmentType = sessionParameters.projectDetails.assessmentType;

  const seedDataCriteria: Criterion[] = seedData.criteria;
  const selectedCriteria: string[] = sessionParameters.criteria;
  const selectedGroups: string[] = sessionParameters.chemicalGroups[assessmentType];

  const notes = [...constants.soilNotes];

  for (const note of notes) {
    rowNumber++;

    if (!(note.key === 'd' && !isPhenolsPresent)) {
      addNotesRow(ws, rowNumber, startColumnIndex, note.key, note.label);
    }
  }
  rowNumber++;
  addSoilAssessmentSACNotes(ws, rowNumber, startColumnIndex, selectedCriteria, selectedGroups, seedDataCriteria);
}

function addSoilAssessmentSACNotes(
  ws: Worksheet,
  rowNumber: number,
  startColumnIndex: number,
  selectedCriteria: string[],
  selectedGroups: string[],
  seedDataCriteria: Criterion[]
) {
  rowNumber++;
  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex),
    LEGEND.SacNotesTitle,
    constants.fontSize.header,
    true
  );

  rowNumber++;
  const note = getNote(selectedCriteria);
  const address = helper.getCellAddress(rowNumber, startColumnIndex);

  if (note) {
    if (note.includes(LEGEND.sacNotesTitle.user_input_required)) {
      const bgColor = helper.getColorValue(ReportColors.Yellow);
      helper.setCell(ws, address, note, constants.fontSize.header, undefined, undefined, undefined, bgColor);
      brushCellsWithBgColor(ws, rowNumber, 1, 5, bgColor);
    } else {
      helper.setCell(ws, address, note, constants.fontSize.header);
    }
  } else {
    const cell = ws.getCell(address);
    cell.value = {
      richText: [
        {
          font: {size: constants.fontSize.content, name: constants.fontName},
          text: LEGEND.sacNotesTitle.any_combination_without_HilHsl,
        },
        {
          font: {
            size: constants.fontSize.content,
            name: constants.fontName,
            color: {argb: helper.getColorValue(ReportColors.Red)},
          },
          text: LEGEND.sacNotesTitle.user_input_required,
        },
      ],
    };
  }

  rowNumber++;
  helper.setCell(
    ws,
    helper.getCellAddress(rowNumber, startColumnIndex),
    LEGEND.SacNotesDescription,
    constants.fontSize.header
  );

  rowNumber++;
  let firstTierRowNumber = rowNumber;
  let secondTierRowNumber = rowNumber;

  for (const criterion of seedDataCriteria) {
    if (!selectedCriteria.includes(criterion.code)) continue;

    const isPfasSelected = selectedGroups.includes('PFAS_std') || selectedGroups.includes('PFAS');
    const isAsbestosSelected = selectedGroups.includes('ASB_std_AS') || selectedGroups.includes('ASB_std_Nepm');

    const noteCode = getNoteCode(criterion, isPfasSelected, isAsbestosSelected);
    const noteDescription = getDescription(criterion, isPfasSelected);
    const tierNumber = getNoteTierNumber(criterion.group);
    const tierColumnNumber = {
      FIRST: 1,
      SECOND: 14,
    };

    let cellCodeAddress, cellDescriptionAddress;
    if (tierNumber === NoteTierNumber.FIRST) {
      cellCodeAddress = helper.getCellAddress(firstTierRowNumber, tierColumnNumber.FIRST);
      cellDescriptionAddress = helper.getCellAddress(firstTierRowNumber, tierColumnNumber.FIRST + 2);
      firstTierRowNumber++;
    } else {
      cellCodeAddress = helper.getCellAddress(secondTierRowNumber, tierColumnNumber.SECOND);
      cellDescriptionAddress = helper.getCellAddress(secondTierRowNumber, tierColumnNumber.SECOND + 2);
      secondTierRowNumber++;
    }

    let code = criterion.code;

    if (criterion.group === SoilCriterionTypeName.EIL) {
      code = code.replace('EIL', 'EIL/ESL/EGV');
    }

    helper.setCell(ws, cellCodeAddress, noteCode, constants.fontSize.content);
    helper.setCell(ws, cellDescriptionAddress, noteDescription, constants.fontSize.content);
  }
}

/*
  In legend we print SAC notes splitted in two columns. This method specifies which column to use for a particular SAC.
*/
function getNoteTierNumber(criterionGroup: string): NoteTierNumber {
  switch (criterionGroup) {
    case SoilCriterionTypeName.HIL:
    case SoilCriterionTypeName.HSL:
    case SoilCriterionTypeName.DC:
      return NoteTierNumber.FIRST;

    case SoilCriterionTypeName.ML:
    case SoilCriterionTypeName.EIL:
    case SoilCriterionTypeName.ESL:
    case SoilCriterionTypeName.EGV_INDIR:
    default:
      return NoteTierNumber.SECOND;
  }
}

function brushCellsWithBgColor(
  ws: Worksheet,
  rowNumber: number,
  startColumnNumber: number,
  countCellsToBrush: number,
  bgColor: string
) {
  for (let i = startColumnNumber; i < startColumnNumber + countCellsToBrush; i++) {
    helper.setCell(ws, helper.getCellAddress(rowNumber, i), null, undefined, undefined, undefined, undefined, bgColor);
  }
}

function addNotesRow(ws: Worksheet, rowNumber: number, startColumnIndex: number, label: string, description: string) {
  const cellAddressTitle = helper.getCellAddress(rowNumber, startColumnIndex);

  if (label) {
    helper.setCell(ws, cellAddressTitle, label, constants.fontSize.content, false, helper.getMiddleCenterAlignment());
  }

  const cellDescriptionAddress = helper.getCellAddress(rowNumber, startColumnIndex + 1);

  helper.setCell(ws, cellDescriptionAddress, description);
}

function getNoteCode(
  criterion: Criterion,
  isPfasGroupSelected: boolean = false,
  isAsbestosGroupSelected: boolean = false
): string {
  let result = '';

  switch (criterion.group) {
    case SoilCriterionTypeName.HIL:
      result = isAsbestosGroupSelected ? 'HSL (asbestos)' : 'HIL';
      break;
    case SoilCriterionTypeName.HSL:
      result = 'HSL (vapour intrusion)';
      break;
    case SoilCriterionTypeName.DC:
      result = 'DC';
      break;
    case SoilCriterionTypeName.ML:
      result = 'ML';
      break;
    case SoilCriterionTypeName.EIL:
      result = isPfasGroupSelected ? 'EGV' : 'EIL';
      break;
    case SoilCriterionTypeName.ESL:
      result = 'ESL';
      break;
    case SoilCriterionTypeName.EGV_INDIR:
      result = 'EGV-Indir';
      break;
    default:
      result = criterion.code;
      break;
  }

  return result;
}

function getDescription(criterion: Criterion, isPfasGroupSelected: boolean) {
  let result = '';

  switch (criterion.group) {
    case SoilCriterionTypeName.HIL:
      result = LEGEND.sacNotesDescriptions.HIL.getText(criterion, isPfasGroupSelected);
      break;
    case SoilCriterionTypeName.HSL:
      result = LEGEND.sacNotesDescriptions.HSL.getText(criterion);
      break;
    case SoilCriterionTypeName.DC:
      result = LEGEND.sacNotesDescriptions.DC.getText(criterion);
      break;
    case SoilCriterionTypeName.ML:
      result = LEGEND.sacNotesDescriptions.ML.getText(criterion);
      break;
    case SoilCriterionTypeName.EIL:
      result = LEGEND.sacNotesDescriptions.EIL.getText(criterion, isPfasGroupSelected);
      break;
    case SoilCriterionTypeName.ESL:
      result = LEGEND.sacNotesDescriptions.ESL.getText(criterion);
      break;
    case SoilCriterionTypeName.EGV_INDIR:
      result = LEGEND.sacNotesDescriptions.EGV_INDIR.getText(criterion);
      break;
    default:
      result = '';
      break;
  }

  return result;
}

function getNote(selectedCriteria: string[]) {
  const includesCriteria = (criteria: string[]) => {
    return criteria.every((criterion) => selectedCriteria.includes(criterion));
  };

  if (includesCriteria([CriterionCode.HIL_A, CriterionCode.HSL_AB])) {
    return LEGEND.sacNotesTitle.HilA_HslAB_notes;
  } else if (includesCriteria([CriterionCode.HIL_A, CriterionCode.HSL_D])) {
    return LEGEND.sacNotesTitle.HilA_HslD_notes;
  } else if (includesCriteria([CriterionCode.HIL_B, CriterionCode.HSL_AB])) {
    return LEGEND.sacNotesTitle.HilB_HslAB_notes;
  } else if (includesCriteria([CriterionCode.HIL_B, CriterionCode.HSL_D])) {
    return LEGEND.sacNotesTitle.HilB_HslD_notes;
  } else if (includesCriteria([CriterionCode.HIL_C, CriterionCode.HSL_C])) {
    return LEGEND.sacNotesTitle.HilC_HslC_notes;
  } else if (includesCriteria([CriterionCode.HIL_C, CriterionCode.HSL_D])) {
    return LEGEND.sacNotesTitle.HilC_HslD_notes;
  } else if (includesCriteria([CriterionCode.HIL_D, CriterionCode.HSL_D])) {
    return LEGEND.sacNotesTitle.HilD_HslD_notes;
  } else {
    return `${LEGEND.sacNotesTitle.any_combination_without_HilHsl} ${LEGEND.sacNotesTitle.user_input_required}`;
  }
}
