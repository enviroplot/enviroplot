import React, {useEffect} from 'react';
import {Table, Form} from 'components/bootstrap';
import {useSelector, useDispatch} from 'react-redux';

import {updateSelectionEdit} from 'actions/sampleActions';

import {getReportSamples} from 'reducers/sampleReducer';

import {Soil, Water} from 'constants/assessmentType';

import sampleService from 'services/sampleService';

import extras from '../../extras';
import SampleParameterItem from './components/SampleParameterItem';

function SampleParametersView() {
  const dispatch = useDispatch();

  const parameters = useSelector((state: any) => state.sample.parameters);
  const editSampleIds = useSelector((state: any) => state.sample.selection.edit);
  const project = useSelector((state: any) => state.session.project);
  const waterAssessmentParameters = useSelector((state: any) => state.session.waterAssessmentParameters);
  const samples = useSelector((state: any) => getReportSamples(state));

  useEffect(() => {
    // returned function will be called on component unmount
    return () => {
      dispatch(updateSelectionEdit([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAll = () => {
    const allSelected = extras.isAllSelected(samples, editSampleIds);

    let selectedSampleIds = [];

    if (!allSelected) {
      selectedSampleIds = sampleService.getSampleIds(samples);
    }

    dispatch(updateSelectionEdit(selectedSampleIds));
  };

  const selectSample = (sampleId) => {
    const selectedIds = extras.getSelectedIds(sampleId, editSampleIds);

    dispatch(updateSelectionEdit(selectedIds));
  };

  const renderSoilHeaders = () => {
    return (
      <>
        <th>Excavation Depth</th>
        <th>Soil Type</th>
        <th>Texture</th>
        <th>pH</th>
        <th>CEC</th>
        <th>Clay Content</th>
        <th>MBC</th>
        <th>Contam Type</th>
        <th>State</th>
        <th>Traffic Volume</th>
        <th>Iron Content</th>
        <th>Organic Carbon</th>
      </>
    );
  };

  const renderWaterHeaders = () => {
    return (
      <>
        <th>Water Environment</th>
        <th>
          Species Level of Protection <br /> Bio-Accumulative
        </th>
        <th>
          Species Level of Protection <br /> PFAS
        </th>
        <th>
          Species Level of Protection <br /> Others
        </th>
        <th>Potential Use</th>
      </>
    );
  };

  function render() {
    const allSelected = extras.isAllSelected(samples, editSampleIds);

    const isSoilAssessment = project && project.assessmentType === Soil;
    const isWaterAssessment = project && project.assessmentType === Water;

    return (
      <div className="table-container-sticky-header" id="sample-parameters-list">
        <Table bordered hover className="main-table">
          <thead>
            <tr>
              <th className="indent" />
              <th className="td-check" onClick={selectAll}>
                <Form.Check type="checkbox" checked={allSelected} onChange={() => null} />
              </th>
              <th>Lab ID</th>
              <th>DP ID</th>

              {!isWaterAssessment && (
                <>
                  <th>Depth From (m)</th>
                  <th>Depth To (m)</th>
                </>
              )}

              {isSoilAssessment && renderSoilHeaders()}
              {isWaterAssessment && renderWaterHeaders()}
            </tr>
          </thead>

          <tbody>
            {samples.map((sample) => {
              return (
                <SampleParameterItem
                  key={sample.labSampleId}
                  sample={sample}
                  editSampleIds={editSampleIds}
                  parameters={parameters}
                  isSoilAssessment={isSoilAssessment}
                  isWaterAssessment={isWaterAssessment}
                  selectSample={selectSample}
                  waterAssessmentParameters={waterAssessmentParameters}
                />
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }

  return render();
}

export default SampleParametersView;
