import * as _ from 'lodash';
import {UNITS} from '../constants/constants';

import unitsConverter from './unitsConverter';

export default {
  getRinsateItems,
};

function getRinsateItems(reportItems: ReportItem[], isWaterAssessment: boolean): RinsateReportItem[] {
  const result: RinsateReportItem[] = [];

  for (const reportItem of reportItems) {
    //All results for Rinsate Samples will have the units converted as follows:
    //Soil and Waste Modules:  all results to be converted to mg/L
    //Groundwater Module:  all results to be converted to µg/L
    //Both Modules: where results cannot be converted as above (i.e. incompatible units or no known conversion)

    const toUnits = isWaterAssessment ? UNITS.UG_L[0] : UNITS.MG_L[0];

    const reportItemInConvertedUnits = unitsConverter.convertReportItem(reportItem, toUnits);

    result.push(reportItemInConvertedUnits as RinsateReportItem);
  }
  return result;
}
