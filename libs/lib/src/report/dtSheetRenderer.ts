import * as _ from 'lodash';
import utils from '../utils';

import helper from './reportHelper';
import commonSectionsRenderer from './commonSectionsRenderer';
import * as literals from '../constants/literals';
import * as constants from '../constants/constants';
import extras from '../calculations/extras';
import {Worksheet} from 'exceljs';

const path = utils.loadModule('path');

export default {
  generate: generateSheetDT,
  addDerivationTable, //for tests
};

const CONSTANTS = {
  workSheetPropsDerivation: {
    views: [{state: 'frozen', xSplit: 0, ySplit: 6}],
  },
};

function generateSheetDT(
  workBook: any,
  dataFolderPath: string,
  sampleParameters: SampleParameterItem[],
  sessionParameters: SessionParameters
) {
  const ws = workBook.addWorksheet(literals.derivationTable, CONSTANTS.workSheetPropsDerivation);
  const rowNumberHeader = 5;
  const startCellIndex = 0;
  commonSectionsRenderer.addSheetHeader(ws, literals.derivationTableTitle);
  let headerData: any[] = [];
  if (extras.isSoilAssessment(sessionParameters)) {
    headerData = [
      {key: 'dpId', name: literals.sampleId},
      {key: 'depth', name: literals.sampleDepth},
      {key: 'soilType', name: literals.soilType},
      {key: 'soilTexture', name: literals.soilTexture},
      {key: 'clayContent', name: literals.clayContent},
      {key: 'cec', name: literals.cec},
      {key: 'ph', name: literals.pH},
    ];
  }
  if (extras.isWasteAssessment(sessionParameters)) {
    headerData = [
      {key: 'dpId', name: literals.sampleId},
      {key: 'depth', name: literals.sampleDepth},
    ];
  }

  addDerivationTable(ws, rowNumberHeader, startCellIndex, sampleParameters, headerData);

  const logoPath = path.join(dataFolderPath, constants.logoPath);
  commonSectionsRenderer.addLogo(workBook, ws, logoPath);
}

function addDerivationTable(
  ws: Worksheet,
  rowNumberHeader: number,
  startCellIndex: number,
  sampleParametersData: SampleParameterItem[],
  headerData: any[]
) {
  helper.setRowHeight(ws, rowNumberHeader, constants.rowHeight.header);
  for (let columnIndex = 0; columnIndex < headerData.length; columnIndex++) {
    const headerItem = headerData[columnIndex];

    helper.setColumnWidth(ws, columnIndex, constants.columnWidth.dtColumnWidth);

    const cellAddress = helper.getCellAddress(rowNumberHeader, columnIndex);

    helper.setCell(
      ws,
      cellAddress,
      headerItem.name,
      constants.fontSize.header,
      true,
      helper.getMiddleCenterAlignment(),
      helper.getHairBorderAround()
    );
  }

  commonSectionsRenderer.addSimpleTableContentHorizontal(
    ws,
    rowNumberHeader,
    startCellIndex,
    sampleParametersData,
    headerData
  );
}
