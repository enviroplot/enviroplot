import {Workbook} from 'exceljs';
import utils from '../utils';

const fs = utils.loadModule('fs-extra');

export default {
  writeFileWithData,
  writeReport,
};

function writeFileWithData(data: any) {
  fs.writeFile('tests_data.txt', JSON.stringify(data), (err: any) => {
    if (err) {
      console.error(err);
    }
    // file written successfully
  });
}

function writeReport(wb: Workbook) {
  /*
  HINT: when debugging tests, you may use xlsx file creation to see what is wrong.
  Just put the following line inside a test function 
  and then locate 'test.xlsx' file in the root of your project folder:
*/
  wb.xlsx.writeFile('test.xlsx');
}
