import React, {useState, useEffect} from 'react';
import {Table, Form} from 'components/bootstrap';
import PropTypes from 'prop-types';
import {first, isEmpty, cloneDeep, filter, get} from 'lodash';
import {useSelector, useDispatch} from 'react-redux';
import {ScrollSync, ScrollSyncPane} from 'react-scroll-sync';

import {updateReportEdits, updateReportPreview} from 'actions/reportActions';

import {Waste} from 'constants/assessmentType';

import dataService from 'services/dataService';
import extras from './extras';

import SampleCell from './components/SampleCell';
import EditableCells from './components/EditableCells';

import {NOT_APPLICABLE} from 'constants/legendValues';
import {TCLP1, TCLP2, CT1, CT2, SCC1, SCC2} from 'constants/wasteCriterions';

ResultsTable.propTypes = {
  data: PropTypes.array,
};

function ResultsTable({data}) {
  const dispatch = useDispatch();

  const highlightAllDetections = useSelector((state: any) => state.session.highlightAllDetections);
  const project = useSelector((state: any) => state.session.project);
  const wasteStatistics = useSelector((state: any) => state.session.wasteStatistics);

  const edits = useSelector((state: any) => state.report.edits);

  const assessmentType: string = useSelector((state: any) => state.session.project.assessmentType);

  const [editsLocal, setEditsLocal] = useState({});
  const [wasteClassificationCriterionDetails, setWasteClassificationCriterionDetails] = useState([]);

  useEffect(() => {
    const editsLocal = cloneDeep(edits);

    const seedData = dataService.getSeedData(assessmentType);

    let details = seedData.wasteClassificationCriterionDetails ? seedData.wasteClassificationCriterionDetails : [];

    details = filter(details, (row) => {
      return row.state === project.state;
    });

    setEditsLocal(editsLocal);
    setWasteClassificationCriterionDetails(details);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getItemKey = (item) => {
    return `${item.code}#${item.units}#${item.group}#${item.wcType}`;
  };

  const onChangeTextInput = (key, field, value) => {
    const newEdits: any = cloneDeep(editsLocal);

    if (!newEdits[key]) {
      newEdits[key] = {isSelected: true, standardDeviation: null, ucl: null};
    }

    newEdits[key][field] = value;

    setEditsLocal(newEdits);
  };

  const onUpdateReportEdits = () => {
    dispatch(updateReportEdits(editsLocal));
    dispatch(updateReportPreview());
  };

  const renderStaticTableHeader = () => {
    return (
      <tr>
        <th className="units">Units</th>
        <th className="chemical">Chemical</th>
        <th className="td-check">Calc</th>
        <th className="code">Code</th>
        <th className="group">Group</th>
        <th className="indent" />
      </tr>
    );
  };

  const renderTableHeader = (summaryStatVisible, statInfoVisible, anyWasteCriteria) => {
    const firstItem: any = first(data);
    const reportCells = firstItem.reportCells;

    return (
      <tr>
        {anyWasteCriteria && (
          <>
            <th className="sample-cell">SCC1</th>
            <th className="sample-cell">CT1</th>
            <th className="sample-cell">TCLP1</th>
            <th className="sample-cell">CT2</th>
            <th className="sample-cell">SCC2</th>
            <th className="sample-cell">TCLP2</th>
          </>
        )}

        {summaryStatVisible && (
          <>
            <th className="stat sample-cell">Min</th>
            <th className="stat sample-cell">Max</th>
            <th className="stat sample-cell">Mean</th>
          </>
        )}

        {statInfoVisible && (
          <>
            <th className="stat info sample-cell">Std. Dev.</th>
            <th className="stat info sample-cell">95% UCL</th>
          </>
        )}

        {Object.keys(reportCells).map((key) => {
          return (
            <th className="sample-cell" key={key}>
              {key}
            </th>
          );
        })}
      </tr>
    );
  };

  const renderStaticTableBodyRow = (item) => {
    let code = item.code;
    let chemical = item.chemical;
    if (item.wcType) {
      chemical = `${chemical} ${item.wcType.toUpperCase()}`;
      code = `${item.code}${item.wcType.slice(0, -3)}`;
    }

    const key = getItemKey(item);

    return (
      <tr key={key}>
        <td className="units">{item.units}</td>
        <td className="chemical" title={chemical}>
          {chemical}&#x200e;
        </td>
        {/* using this char to support correct brackets position  in rtl direction */}
        <td className="td-check">
          <Form.Check type="checkbox" checked={item.isCalculated} disabled onChange={() => null} />
        </td>
        <td className="code">{code}&#x200e;</td>
        <td className="group">{item.group}&#x200e;</td>
        <td className="indent" />
      </tr>
    );
  };

  const renderTableBodyRow = (item, anyWasteCriteria, summaryStatVisible, statInfoVisible) => {
    const extraFields = item.extraFields;

    const key = getItemKey(item);
    const editsItem = editsLocal ? editsLocal[key] : null;

    const wasteCriteria: any[] = filter(wasteClassificationCriterionDetails, (row: any) => {
      return row.criterionDetail.chemicalCode === item.chemicalCodeForAssessing;
    });

    const renderExtraFields = (val) => {
      const displayValue = val === null ? '-' : val.value;
      const displayOptions = get(val, 'displayOptions');
      const displayClass = extras.getCellClassByDisplayOptions('stat sample-cell', displayOptions);

      return <td className={displayClass}>{String(displayValue)}</td>;
    };

    const displayCriterion = (criteria: any[], criterionCode) => {
      if (!criteria || criteria.length < 1) return '-';

      const criterion = criteria.find((criterion) => criterion.criterionDetail.criterionCode === criterionCode);

      if (!criterion) return '-';

      let value = criterion.value;

      if (value) {
        const decimalPart = (value + '').split('.')[1];
        if (decimalPart === '99') {
          value = value + 0.01;
        }
      }

      let result = '-';

      if (value) {
        if (
          (item.wcType && (criterionCode === TCLP1 || criterionCode === TCLP2)) ||
          (!item.wcType && criterionCode !== TCLP1 && criterionCode !== TCLP2)
        ) {
          result = value;
        } else {
          result = anyWasteCriteria ? '-' : NOT_APPLICABLE;
        }
      }

      return result;
    };

    return (
      <tr key={key}>
        {anyWasteCriteria && (
          <>
            <td className="sample-cell">{displayCriterion(wasteCriteria, CT1)}</td>
            <td className="sample-cell">{displayCriterion(wasteCriteria, SCC1)}</td>
            <td className="sample-cell">{displayCriterion(wasteCriteria, TCLP1)}</td>
            <td className="sample-cell">{displayCriterion(wasteCriteria, CT2)}</td>
            <td className="sample-cell">{displayCriterion(wasteCriteria, SCC2)}</td>
            <td className="sample-cell">{displayCriterion(wasteCriteria, TCLP2)}</td>
          </>
        )}

        {summaryStatVisible && (
          <>
            {renderExtraFields(extraFields.min)}
            {renderExtraFields(extraFields.max)}
            {renderExtraFields(extraFields.mean)}
          </>
        )}

        {statInfoVisible && (
          <EditableCells
            key={key}
            id={key}
            item={editsItem}
            extraFields={extraFields}
            onChangeTextInput={onChangeTextInput}
            onUpdateReportEdits={onUpdateReportEdits}
          />
        )}
        {Object.keys(item.reportCells).map((key) => {
          const cellItem = item.reportCells[key];

          return <SampleCell key={key} cellItem={cellItem} highlightAllDetections={highlightAllDetections} />;
        })}
      </tr>
    );
  };

  if (isEmpty(data)) return null;

  const isWasteAssessment = project && project.assessmentType === Waste;

  const summaryStatVisible = isWasteAssessment && wasteStatistics && wasteStatistics.calculateSummaryStatistics;

  const statInfoVisible = isWasteAssessment && wasteStatistics && wasteStatistics.statisticalInfoForContaminants;

  const anyWasteCriteria = !isEmpty(wasteClassificationCriterionDetails);

  return (
    <ScrollSync>
      <div className="table-container">
        <ScrollSyncPane group="vertical">
          <div className="table-container-sticky-header right-to-left half-width-with-scroll">
            <Table bordered className="main-table fixed">
              <thead>{renderStaticTableHeader()}</thead>
              <tbody>
                {data
                  .filter((item) => !item.isHiddenInReport)
                  .map((item) => {
                    return renderStaticTableBodyRow(item);
                  })}
              </tbody>
            </Table>
          </div>
        </ScrollSyncPane>
        <ScrollSyncPane group="vertical">
          <div className="table-container-sticky-header half-width-with-scroll">
            <Table bordered className="main-table fixed">
              <thead>{renderTableHeader(summaryStatVisible, statInfoVisible, anyWasteCriteria)}</thead>
              {
                <tbody>
                  {data
                    .filter((item) => !item.isHiddenInReport)
                    .map((item) => {
                      return renderTableBodyRow(item, anyWasteCriteria, summaryStatVisible, statInfoVisible);
                    })}
                </tbody>
              }
            </Table>
          </div>
        </ScrollSyncPane>
      </div>
    </ScrollSync>
  );
}

export default ResultsTable;
