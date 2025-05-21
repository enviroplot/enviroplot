import React, {useState} from 'react';
import PropTypes from 'prop-types';

import {get} from 'lodash';

import extras from '../extras';
import TextInput from 'components/common/TextInput';

interface ICell {
  key: string;
  field: string;
}

EditableCells.propTypes = {
  item: PropTypes.object,
  id: PropTypes.string.isRequired,
  onChangeTextInput: PropTypes.func.isRequired,
  onUpdateReportEdits: PropTypes.func.isRequired,
  extraFields: PropTypes.object,
};

function EditableCells({item, id, onChangeTextInput, onUpdateReportEdits, extraFields}) {
  const [cellToEdit, setCellToEdit] = useState<ICell | null>(null);

  const toggleEditMode = (key, field) => {
    let cellToEdit: any = {key, field};

    if (!key) cellToEdit = null;

    setCellToEdit(cellToEdit);
  };

  const updateStatInfo = () => {
    setCellToEdit(null);
    onUpdateReportEdits();
  };

  const onKeyUp = (e) => {
    if (!e.isEnter) return;

    updateStatInfo();
  };

  const renderEditableCell = (key) => {
    let value = null;

    let cellClass = 'stat info';

    if (item) {
      value = item[key];

      const displayOptions = get(extraFields, [key, 'displayOptions']);
      if (displayOptions) {
        cellClass = extras.getCellClassByDisplayOptions(cellClass, displayOptions);
      }
    }

    let isEditable = false;
    if (cellToEdit && cellToEdit.key === id) {
      isEditable = cellToEdit.field === key ? true : false;
    }

    return (
      <td className={cellClass} onClick={() => toggleEditMode(id, key)}>
        {isEditable ? (
          <TextInput
            name={key}
            autoFocus
            value={value}
            onChange={(field, value) => onChangeTextInput(id, field, value)}
            onBlur={updateStatInfo}
            onKeyUp={onKeyUp}
          />
        ) : (
          value
        )}
      </td>
    );
  };

  return (
    <>
      {renderEditableCell('standardDeviation')}
      {renderEditableCell('ucl')}
    </>
  );
}

export default EditableCells;
