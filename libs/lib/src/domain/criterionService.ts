import * as _ from 'lodash';

export default {
  getCriterionNameByTypeLookup,
  getCriterionTypeBeCategoryLookup,
  getCriterionTypesByCodes,
  getCriterionCategoriesByCodes,
};

function getCriterionNameByTypeLookup() {
  const lookup = {
    // eslint-disable-next-line
    [CriterionType.Hil]: [CriterionCode.HIL_A, CriterionCode.HIL_B, CriterionCode.HIL_C, CriterionCode.HIL_D],
    // eslint-disable-next-line
    [CriterionType.Hsl]: [CriterionCode.HSL_AB, CriterionCode.HSL_C, CriterionCode.HSL_D, CriterionCode.HSL_IMW],
    // eslint-disable-next-line
    [CriterionType.Eil]: [CriterionCode.EIL_AES, CriterionCode.EIL_C_IND, CriterionCode.EIL_UR_POS],
    // eslint-disable-next-line
    [CriterionType.Esl]: [CriterionCode.ESL_AES, CriterionCode.ESL_C_IND, CriterionCode.ESL_UR_POS],
    // eslint-disable-next-line
    [CriterionType.ManagementLimits]: [CriterionCode.ML_R_P_POS, CriterionCode.ML_C_IND],
    // eslint-disable-next-line
    [CriterionType.DirectContact]: [
      CriterionCode.DC_HSL_A,
      CriterionCode.DC_HSL_B,
      CriterionCode.DC_HSL_C,
      CriterionCode.DC_HSL_D,
      CriterionCode.DC_HSL_IMW,
    ],
  };

  return lookup;
}

function getCriterionTypeBeCategoryLookup() {
  const lookup = {
    // eslint-disable-next-line
    [CriterionCategory.Health]: [CriterionType.Hil, CriterionType.Hsl, CriterionType.DirectContact],
    // eslint-disable-next-line
    [CriterionCategory.Ecological]: [CriterionType.Eil, CriterionType.Esl],
    // eslint-disable-next-line
    [CriterionCategory.Both]: [CriterionType.ManagementLimits],
  };

  return lookup;
}

function getCriterionTypesByCodes(criterionCodes: any) {
  const typeCodeLookup: any = getCriterionNameByTypeLookup();

  const lookup: any = {};

  for (const criterionCode of criterionCodes) {
    for (const criterionType of Object.keys(typeCodeLookup)) {
      if (typeCodeLookup[criterionType].includes(criterionCode)) {
        lookup[criterionType] = true;
      }
    }
  }

  return Object.keys(lookup);
}

function getCriterionCategoriesByCodes(criterionCodes: any) {
  const typeCodeLookup = getCriterionTypesByCodes(criterionCodes);
  const categoryTypeLookup: any = getCriterionTypeBeCategoryLookup();

  const result = [];

  for (const category of Object.keys(categoryTypeLookup)) {
    const categoryHasAny = _.some(typeCodeLookup, (type) => categoryTypeLookup[category].includes(type));
    if (categoryHasAny) result.push(category);
  }

  return result;
}
