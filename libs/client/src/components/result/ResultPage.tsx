import React, {useState, useEffect} from 'react';
import {get, intersection, groupBy} from 'lodash';
import {useSelector, useDispatch} from 'react-redux';

import {updateReportPreview, exportReportToExcel} from 'actions/reportActions';
import {
  saveChemicalGroups,
  saveDisplaySettings,
  saveShouldOutputAslp,
  saveShouldOutputTclp,
} from 'actions/sessionActions';

import config from 'helpers/config';
import pathHelper from 'helpers/pathHelper';
import loaderService from 'services/loaderService';
import dataService from 'services/dataService';

import ResultToolsSection from './components/tool_section/ResultToolsSections';
import ContaminantDialog from './components/contaminant_dialog/ContaminantDialog';
import CombineChemicalDialog from './components/combine_dialog/CombineChemicalDialog';
import ResultsTable from './components/results_table/ResultsTable';

import './result-page.scss';

import utils from 'utils';

const {dialog, shell} = utils.getElectronModules();
const os = utils.loadModule('os');

function ResultPage() {
  const dispatch: any = useDispatch();

  const reportData = useSelector((state: any) => state.report.data);
  const shouldOutputAslp = useSelector((state: any) => state.session.shouldOutputAslp);
  const shouldOutputTclp = useSelector((state: any) => state.session.shouldOutputTclp);
  const assessmentType: string = useSelector((state: any) => state.session.project.assessmentType);

  const [contaminantModalVisible, setContaminantModalVisibility] = useState(false);
  const [combineChemicalModalVisible, setCombineChemicalModalVisibility] = useState(false);
  const [chemicalGroups, setChemicalGroups] = useState([]);
  const [combinedChemicals, setCombinedChemicals] = useState([]);

  useEffect(() => {
    const initData = async () => {
      loaderService.showLoader();

      const data = await dispatch(updateReportPreview());

      const seedData = dataService.getSeedData(assessmentType);

      const combinedChemicals = getAvailableCombinedChemicals(data);

      loaderService.hideLoader();

      setChemicalGroups(seedData.chemicalGroups);
      setCombinedChemicals(combinedChemicals);
    };

    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAvailableCombinedChemicals = (data) => {
    let result: any = [];

    if (!data && !reportData) return result;

    const generalReportItems = data ? data.generalReportItems : reportData.generalReportItems;

    const seedData = dataService.getSeedData(assessmentType);
    const calculatedChemicalsList = groupBy(seedData.calculatedChemicals, (item) => item.code);

    const reportChemicalCodes = generalReportItems.filter((item) => item.isCalculable).map((item) => item.code);

    const ccListCodes = Object.keys(calculatedChemicalsList);
    const ccCodes = intersection(reportChemicalCodes, ccListCodes);

    result = ccCodes.map((item) => calculatedChemicalsList[item][0]);

    return result;
  };

  const toggleContaminantDialog = () => {
    setContaminantModalVisibility(!contaminantModalVisible);
  };

  const toggleCombineChemicalDialog = () => {
    setCombineChemicalModalVisibility(!combineChemicalModalVisible);
  };

  const exportReport = async () => {
    dialog
      .showSaveDialog({
        title: 'Export report to Excel',
        filters: [{name: 'Excel File (.XLSX)', extensions: ['xlsx']}],
      })
      .then(async (result) => {
        try {
          if (!config.isDevLocal && config.loggingOn) {
            const userADName = os.userInfo().username;
            const timestamp = Math.floor(Date.now());

            dataService.postLogInfo(userADName, timestamp);
          }
          const dataFolderPath: any = pathHelper.getDataRelativePath('./');

          await dispatch(exportReportToExcel(dataFolderPath, result.filePath));
          shell.openPath(result.filePath);
        } catch (err) {
          return console.log(err);
        }
      });
  };

  const saveChemicalGroupsAndAslpTclpAction = async (chemicalGroups, shouldOutputAslp, shouldOutputTclp) => {
    dispatch(saveChemicalGroups(chemicalGroups, assessmentType));
    dispatch(saveShouldOutputAslp(shouldOutputAslp));
    dispatch(saveShouldOutputTclp(shouldOutputTclp));

    toggleContaminantDialog();

    const data = await dispatch(updateReportPreview());

    setCombinedChemicals(getAvailableCombinedChemicals(data));
  };

  const saveDisplaySettingsAction = async (displaySettings) => {
    dispatch(saveDisplaySettings(displaySettings));

    toggleCombineChemicalDialog();

    await dispatch(updateReportPreview());
  };

  const generalReportItems = get(reportData, 'generalReportItems', []);

  return (
    <div id="result-page">
      <ResultToolsSection
        showContaminantDialog={toggleContaminantDialog}
        showCombineChemicalDialog={toggleCombineChemicalDialog}
        data={generalReportItems}
        onExport={exportReport}
      />

      <ResultsTable data={generalReportItems} />

      {contaminantModalVisible && (
        <ContaminantDialog
          visible={contaminantModalVisible}
          chemicalGroups={chemicalGroups}
          onClose={toggleContaminantDialog}
          onSave={saveChemicalGroupsAndAslpTclpAction}
          initialSelectedAslp={shouldOutputAslp}
          initialSelectedTclp={shouldOutputTclp}
        />
      )}

      {combineChemicalModalVisible && (
        <CombineChemicalDialog
          visible={combineChemicalModalVisible}
          onClose={toggleCombineChemicalDialog}
          combinedChemicals={combinedChemicals}
          onSave={saveDisplaySettingsAction}
        />
      )}
    </div>
  );
}

export default ResultPage;
