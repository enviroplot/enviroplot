import dataService from 'services/dataService';
import {Soil} from 'constants/assessmentType';

export default {
  getStandardGroups,
};

function getStandardGroups(assessmentType: string = Soil): string[] {
  const result: string[] = [];
  const allGroups = dataService.getChemicalGroups(assessmentType);

  for (const group of allGroups) {
    if (assessmentType === Soil || group.isStandardContaminantSuite) {
      result.push(group.code);
    }
  }

  return result;
}
