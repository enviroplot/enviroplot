import React, {Component} from 'react';
import {Container} from 'components/bootstrap';

import helper from 'helpers/reactHelper';
//import pathHelper from 'helpers/pathHelper';
//import electronHelper from 'helpers/electronHelper';
import Helmet from 'react-helmet';
import lib from 'lib/index';

import utils from 'utils';

const {dialog} = utils.getElectronModules();

const stateMap = (state) => ({
  reduxState: state,
});

const actions = {};

class TestPage extends Component<any, any> {
  state = {
    data: null,
    title: 'Custom title',
  };

  constructor(props) {
    super(props);

    helper.autoBind(this);
  }

  async open() {
    dialog.showOpenDialog({properties: ['openFile']}).then(async (result) => {
      this.setState({data: result.filePaths});
      if (!result.filePaths || result.filePaths.length === 0) return;
    });
  }

  async save() {
    dialog
      .showSaveDialog({
        title: 'Export report to Excel',
        filters: [{name: 'Excel File (.XLSX)', extensions: ['xlsx']}],
      })
      .then(async (result) => {
        try {
          lib.writeFile(result.filename);
        } catch (err) {
          return console.log(err);
        }
      });
  }

  async test() {
    lib.helloWorld();
  }

  async updateSeedData() {
    const fs = utils.loadModule('fs-extra');
    const seedFromFile = await fs.readJson('./data/seed/seed.json');
    const newSolidChemical = {
      calculated: false,
      calculationFormula: '',
      calculationFormulaType: 'NotDefined',
      chemicalGroup: 'ASB_std_AS',
      code: '108-38-3-123',
      name: 'Asbestos Custom!!!',
      sortOrder: 0,
    };
    seedFromFile.soilData.chemicals.unshift(newSolidChemical);
    await fs.writeJson('./data/seed/seed.json', seedFromFile);
    if (true) {
      //TODO: somehow to reload the page without remote
    }
  }

  async logReduxState() {
    console.log(JSON.stringify(this.props.reduxState, null, 4));
  }

  render() {
    const {title} = this.state;
    return (
      <Container>
        <Helmet title={title} />
        <h2>Test Page</h2>
        <button onClick={this.open}>Open file</button>
        <button onClick={this.save}>Save file</button>
        <br />
        <button onClick={this.logReduxState}>Log Redux State</button>
        <button onClick={this.test}>Test</button>
        <button onClick={this.updateSeedData}>Update Seed Data</button>
        <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
      </Container>
    );
  }
}

export default helper.connect(TestPage, stateMap, actions);
