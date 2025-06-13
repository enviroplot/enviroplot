import * as _ from 'lodash';

import * as literals from '../../constants/literals';
import extras from '../../calculations/extras';

export default {
  getTsData, //for tests
  getReportValue, //for tests
  getHeadersData, //for tests
};

function getTsData(
  sampleData: Sample[],
  reportItems: ReportItem[],
  btexChemicals: Chemical[],
  sessionParameters: SessionParameters
): any[] {
  const result: any[] = [];
  const itemsLookup = _.keyBy(reportItems, (x) => x.code);

  const btexCodes = btexChemicals.map((x) => x.code);

  for (let i = 0; i < sampleData.length; i++) {
    const sample = sampleData[i];

    const item: any = {
      dpSampleId: sample.dpSampleId,
      sampleMedia: extras.isWaterAssessment(sessionParameters) ? literals.water : literals.soil,
      sampleType: sample.matrixType,
      sampleDate: sample.dateSampled,
      labReportNo: sample.labReportNo,
    };

    for (const code of btexCodes) {
      const previewValue = itemsLookup[code].reportCells[sample.labSampleId];
      const value = getReportValue(previewValue);
      if (value !== '-') {
        item[code] = value;
      } else {
        item[code] = 0;
      }
    }

    result.push(item);
  }
  return result;
}

function getReportValue(previewValue: ReportCellWithLimits) {
  if (!previewValue) return literals.noValue;

  return previewValue.prefix === ValuePrefixType.Less ? `<${previewValue.value}` : previewValue.value;
}

function getHeadersData(btexChemicals: any[]): KeyLabelItem[] {
  const headerData: KeyLabelItem[] = [
    {key: 'dpSampleId', label: literals.sampleId},
    {key: 'sampleDate', label: literals.sampleDate},
    {key: 'sampleMedia', label: literals.sampleMedia},
    {key: 'sampleType', label: literals.sampleType},
  ];

  for (const chemical of btexChemicals) {
    headerData.push({key: chemical.code, label: chemical.chemical});
  }

  headerData.push({key: 'labReportNo', label: literals.labReportNo});

  return headerData;
}
