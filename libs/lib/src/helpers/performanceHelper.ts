import * as _ from 'lodash';

export default {
  measureOperation,
  clearStat,
  getStat,
  getStatDisplay,
};

let stat: any = {};

function getStat() {
  return stat;
}

function clearStat() {
  stat = {};
}

function getStatDisplay() {
  let result: any = {};
  for (let key of Object.keys(stat)) {
    let statItem: any = stat[key];

    let times = _.map(statItem.intervals, (x) => x.end - x.start);
    let max = _.max(times);
    let total = _.sum(times);

    let resultItem = {
      max,
      total,
      count: statItem.count,
    };

    result[key] = resultItem;
  }

  return JSON.stringify(result, null, 4);
}

function measureOperation(id: string) {
  if (!stat[id]) {
    stat[id] = {
      count: 0,
      intervals: [],
    };
  }

  let lastInterval: any = _.last(stat[id].intervals);

  let isOperationStart = !lastInterval || lastInterval.end;

  if (isOperationStart) {
    stat[id].intervals.push({
      start: Date.now(),
    });
  } else {
    let lastInterval: any = _.last(stat[id].intervals);

    stat[id].count++;
    lastInterval.end = Date.now();
  }
}
