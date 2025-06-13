import * as _ from 'lodash';

import rpdCalculator from '../../calculations/rpdCalculator';
import {
  replicatedSamples,
  reportItemsWithoutReplicates as reportItems,
} from '../test_data/relativePercentageCalculator/data';

describe('Get correctly relative percentage items', () => {
  test('getRpdItems function', async () => {
    let rpdReportItems: RpdReportItem[] = rpdCalculator.getRpdItems(reportItems, replicatedSamples, false);

    expect(rpdReportItems[0].replicates).toHaveLength(1);
  });
});
