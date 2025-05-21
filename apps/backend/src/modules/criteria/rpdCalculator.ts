import * as _ from 'lodash';
import {UNITS} from '../constants/constants';

import unitsConverter from './unitsConverter';

export default {
  getRpdItems,
};

function getRpdItems(
  reportItems: ReportItem[],
  replicatedSamples: ReplicatedSamplesPair[],
  isWaterAssessment: boolean
): RpdReportItem[] {
  const result: RpdReportItem[] = [];

  for (const reportItem of reportItems) {
    const resultItem: RpdReportItem = {
      chemical: reportItem.chemical,
      code: reportItem.code,
      group: reportItem.group,
      isHiddenInReport: reportItem.isHiddenInReport,
      units: reportItem.units as string,
      wcType: reportItem.wcType,
      replicates: [],
    };

    for (const replicatedSample of replicatedSamples) {
      const originalLabId = replicatedSample.primary.labSampleId;
      const replicateLabId = replicatedSample.replica.labSampleId;

      const toUnits = isWaterAssessment ? UNITS.UG_L[0] : UNITS.MG_KG[0];

      const reportItemInConvertedUnits = unitsConverter.convertReportItem(reportItem, toUnits);

      const originalData = reportItemInConvertedUnits.reportCells[originalLabId];
      const replicateData = reportItemInConvertedUnits.reportCells[replicateLabId];

      let diffValue: string = ValueAbbreviations.Dash;
      let rpdValue: string = ValueAbbreviations.Dash;
      let rpdMoreThanThirty = false;

      const checkIsNumericValue = (value: string) =>
        value !== ValueAbbreviations.Dash &&
        value !== ValueAbbreviations.NotTested &&
        value !== ValueAbbreviations.NoData &&
        value !== ValueAbbreviations.NaN &&
        value !== ValueAbbreviations.NotApplicable;

      if (checkIsNumericValue(originalData.value) && checkIsNumericValue(replicateData.value)) {
        diffValue = '0';
        rpdValue = '0%';

        const originalValue = Number(originalData.value);
        const duplicateValue = Number(replicateData.value);

        const diff = Math.abs(duplicateValue - originalValue);
        diffValue = (+diff.toFixed(2)).toString();

        const rpd = (diff / ((originalValue + duplicateValue) / 2)) * 100;
        rpdValue = `${Math.round(rpd)}%`;

        rpdMoreThanThirty = rpd > 30;
      }

      const replica = {
        originalLabId,
        replicateLabId,
        originalValue: getDisplayValue(originalData),
        replicateValue: getDisplayValue(replicateData),
        originalDataIsDetected: originalData.prefix === ValuePrefixType.Less ? false : true,
        replicateDataIsDetected: replicateData.prefix === ValuePrefixType.Less ? false : true,
        diffValue,
        rpdValue,
        rpdMoreThanThirty,
        convertedUnits: reportItem.units,
      };

      resultItem.replicates.push(replica);
    }
    result.push(resultItem);
  }

  function getDisplayValue(data: ReportCellWithLimits) {
    const isNoData =
      data.value === ValueAbbreviations.NoData ||
      data.value === ValueAbbreviations.NotTested ||
      data.value === ValueAbbreviations.NaN;

    if (isNoData) data.value = ValueAbbreviations.Dash;

    const value = data.prefix === ValuePrefixType.Less ? `<${data.value}` : data.value;

    return value;
  }

  return result;
}
