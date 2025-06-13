import React, {useState, useEffect} from 'react';
import {Table, Form} from 'components/bootstrap';
import {orderBy, keyBy} from 'lodash';

import dataService from 'services/dataService';
import AppIcon from 'components/common/AppIcon';

function ContaminantList() {
  const STYLES = {
    nameColumn: {
      width: 330,
    },
  };

  const [chemicals, setChemicals] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortClass, setSortClass] = useState('');
  const [sortDirection, setSortDirection] = useState('');
  const [groupLookup, setGroupLookup] = useState({});

  useEffect(() => {
    const allChemicals = dataService.getChemicals();
    const chemicalList: any = orderBy(allChemicals, ['chemicalGroup', 'sortOrder']);

    const groups = dataService.getChemicalGroups();
    const lookup = keyBy(groups, (x) => x.code);

    setGroupLookup(lookup);
    // eslint-disable-next-line react-hooks/exhaustive-deps

    chemicalList.forEach((chemical) => {
      chemical.chemicalGroupName = lookup[chemical.chemicalGroup].name;
    });

    setChemicals(chemicalList);
  }, []);

  const sortChemicals = (order) => {
    let direction: any = 'asc';

    if (order === sortOrder) {
      direction = sortDirection === direction ? 'desc' : 'asc';
    }

    const orderedChemicals = orderBy(chemicals, order, direction);

    setChemicals(orderedChemicals);
    setSortOrder(order);
    setSortClass(order);
    setSortDirection(direction);
  };

  const renderSortArrow = (order, title) => {
    const direction: any = 'asc';

    const icon = order === direction ? 'sort-down' : 'sort-up';

    return title === sortClass ? <AppIcon name={icon} size="lg" /> : null;
  };

  const getColumnClass = (column) => {
    return sortOrder === column ? 'selected' : '';
  };

  const renderChemicalRow = (chemical) => {
    let group = groupLookup[chemical.chemicalGroup];

    if (!group) group = {};

    return (
      <tr key={chemical.code}>
        <td className="indent" />
        <td>{chemical.code}</td>
        <td style={STYLES.nameColumn}>{chemical.name}</td>
        <td>{group.code}</td>
        <td>{group.name}</td>
        <td>
          <Form.Check type="checkbox" checked={chemical.calculated} disabled />
        </td>
        <td>
          <Form.Check type="checkbox" checked={true} disabled />
        </td>
        <td>{chemical.sortOrder}</td>
      </tr>
    );
  };

  return (
    <div className="table-container-sticky-header">
      <Table bordered hover className="main-table sortable">
        <thead>
          <tr>
            <th className="indent" />
            <th className={getColumnClass('code')} onClick={() => sortChemicals('code')}>
              <div>
                <span>Code</span>
                {renderSortArrow(sortDirection, 'code')}
              </div>
            </th>
            <th className={getColumnClass('name')} style={STYLES.nameColumn} onClick={() => sortChemicals('name')}>
              <div>
                <span>Name</span>
                {renderSortArrow(sortDirection, 'name')}
              </div>
            </th>
            <th className={getColumnClass('chemicalGroup')} onClick={() => sortChemicals('chemicalGroup')}>
              <div>
                <span>Group Code</span>
                {renderSortArrow(sortDirection, 'chemicalGroup')}
              </div>
            </th>

            <th className={getColumnClass('chemicalGroupName')} onClick={() => sortChemicals('chemicalGroupName')}>
              <div>
                <span>Group</span>
                {renderSortArrow(sortDirection, 'chemicalGroupName')}
              </div>
            </th>

            <th className={getColumnClass('calculated')} onClick={() => sortChemicals('calculated')}>
              <div>
                <span>
                  Combined / `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`Total `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;
                  Analytes
                </span>
                {renderSortArrow(sortDirection, 'calculated')}
              </div>
            </th>
            <th className={getColumnClass('temp')} onClick={() => sortChemicals('temp')}>
              <div>
                <span>Added to ER database</span>
                {renderSortArrow(sortDirection, 'temp')}
              </div>
            </th>
            <th className={getColumnClass('sortOrder')} onClick={() => sortChemicals('sortOrder')}>
              <div>
                <span>Display Order</span>
                {renderSortArrow(sortDirection, 'sortOrder')}
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {chemicals.map((chemical) => {
            return renderChemicalRow(chemical);
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default ContaminantList;
