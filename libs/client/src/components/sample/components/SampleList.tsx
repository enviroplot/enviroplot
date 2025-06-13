import React, {useState, useEffect} from 'react';
import {Table, Form} from 'components/bootstrap';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {DropTarget} from 'react-dnd';

import * as sortOrders from 'constants/sortOrders';
import {Soil, Water} from 'constants/assessmentType';

import AppIcon from 'components/common/AppIcon';
import SampleRow from './SampleRow';
import extras from '../extras';

const dropTarget = {};

const registerDropTarget: any = (Component) =>
  DropTarget('SAMPLE_ROW', dropTarget, (connect) => ({
    connectDropTarget: connect.dropTarget(),
  }))(Component);

SampleList.propTypes = {
  samplesObj: PropTypes.object,
  parameters: PropTypes.object,
  reportSampleIds: PropTypes.array,
  sort: PropTypes.object.isRequired,
  sortSamples: PropTypes.func.isRequired,
  selectAll: PropTypes.func.isRequired,
  selectSample: PropTypes.func.isRequired,
  saveListOrder: PropTypes.func.isRequired,
  assessmentType: PropTypes.string,
};

function SampleList({
  samplesObj,
  parameters,
  reportSampleIds,
  sort,
  sortSamples,
  selectAll,
  selectSample,
  saveListOrder,
  assessmentType,
  connectDropTarget,
}) {
  const [samples, setSamples] = useState([]);
  const [readyToRender, setReadyToRender] = useState(false);

  useEffect(() => {
    initData();

    if (!readyToRender) setReadyToRender(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samplesObj]);

  const initData = () => {
    const samples: any = [];

    if (samplesObj) {
      for (const key of Object.keys(samplesObj)) {
        samples.push(samplesObj[key]);
      }
    }

    setSamples(samples);
  };

  const selectAllSamples = () => {
    const allSelected = extras.isAllSelected(samples, reportSampleIds);
    selectAll(!allSelected);
  };

  const findItem = (id) => {
    const item = samples.filter((i: any) => i.labSampleId === id)[0];

    const result = {
      item,
      index: samples.indexOf(item),
    };

    return result;
  };

  const moveItem = (id, atIndex) => {
    const {item, index} = findItem(id);

    const newSamples = update(samples, {
      $splice: [
        [index, 1],
        [atIndex, 0, item],
      ],
    });

    setSamples(newSamples);
  };

  const renderSortArrow = (sortOrder) => {
    if (sortOrder !== sort.order) return null;

    const icon = sort.direction === sortOrders.ASCENDING_DIRECTION ? 'sort-down' : 'sort-up';

    return <AppIcon name={icon} size="lg" />;
  };

  const getColumnClass = (column) => {
    return sort.order === column ? 'selected' : '';
  };

  const renderColumnHeader = (sortId, label) => (
    <th className={getColumnClass(sortId)} onClick={() => sortSamples(sortId)}>
      <div>
        <span>{label}</span>
        {renderSortArrow(sortId)}
      </div>
    </th>
  );

  function render() {
    if (!readyToRender) return null;

    const allSelected = extras.isAllSelected(samples, reportSampleIds);

    const isSoilAssessment = assessmentType === Soil;
    const isWaterAssessment = assessmentType === Water;

    return connectDropTarget(
      <div className="table-container-sticky-header" id="sample-list">
        <Table bordered hover className="main-table sortable">
          <thead>
            <tr>
              <th className="indent" />
              <th className="td-check" onClick={selectAllSamples}>
                <Form.Check type="checkbox" checked={allSelected} onChange={() => null} />
              </th>

              {renderColumnHeader(sortOrders.LAB_SAMPLE_ID_ORDER, 'Lab ID')}
              {renderColumnHeader(sortOrders.DP_SAMPLE_ID_ORDER, 'DP ID')}
              {renderColumnHeader(sortOrders.CONTAMINATION_DATA_PRESENT, 'Contamination data present')}

              {!isWaterAssessment && (
                <>
                  {renderColumnHeader(sortOrders.DEPTH_FROM_ORDER, 'Depth From (m)')}
                  {renderColumnHeader(sortOrders.DEPTH_TO_ORDER, 'Depth To (m)')}
                </>
              )}

              {isSoilAssessment && <>{renderColumnHeader(sortOrders.EXCAVATION_DEPTH_ORDER, 'Excavation Depth')}</>}
              {renderColumnHeader(sortOrders.DATE_SAMPLED_ORDER, 'Date Sampled')}
              {renderColumnHeader(sortOrders.MATRIX_TYPE_ORDER, 'Sample Type')}
            </tr>
          </thead>

          <tbody>
            {samples.map((sample: any) => {
              if (!sample) return null;

              const id = sample.labSampleId;
              const checkedSample = reportSampleIds.find((sampleId) => sampleId === id);
              const isChecked = checkedSample ? true : false;
              const parameter = parameters[id];

              return (
                <SampleRow
                  key={id}
                  sampleId={id}
                  sample={sample}
                  parameter={parameter}
                  isChecked={isChecked}
                  selectSample={selectSample}
                  findItem={findItem}
                  moveItem={moveItem}
                  saveListOrder={() => saveListOrder(samples)}
                  isSoilAssessment={isSoilAssessment}
                  isWaterAssessment={isWaterAssessment}
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

export default registerDropTarget(SampleList);
