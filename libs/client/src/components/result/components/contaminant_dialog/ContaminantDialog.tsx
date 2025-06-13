import React, {useState} from 'react';
import {Modal, Button, Form} from 'components/bootstrap';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {find, filter, includes, isEmpty, intersection} from 'lodash';

import './contaminant-dialog.scss';
import config from 'helpers/config';

import * as assessmentTypes from 'constants/assessmentType';

const isAllGroupSelected = (contaminantGroup, selectedContaminants = []): boolean => {
  const contaminantGroupExt = contaminantGroup.filter((el) => !config.disabledContaminantGroups.includes(el.code));
  let allSelected = true;

  const groupSelectedContaminants = intersection(
    contaminantGroupExt.map((el) => el.code),
    selectedContaminants
  );

  if (isEmpty(groupSelectedContaminants)) return false;

  if (contaminantGroupExt.length > groupSelectedContaminants.length) return false;

  for (const contaminant of contaminantGroupExt) {
    const isSelected = find(groupSelectedContaminants, (abbr) => {
      return abbr === contaminant?.code;
    });

    if (!isSelected) {
      allSelected = true;
      break;
    }
  }

  return allSelected;
};

ContaminantDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  chemicalGroups: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialSelectedAslp: PropTypes.bool.isRequired,
  initialSelectedTclp: PropTypes.bool.isRequired,
};

function ContaminantDialog({visible, chemicalGroups, onClose, onSave, initialSelectedAslp, initialSelectedTclp}) {
  const disabledContaminantGroups = config.disabledContaminantGroups;

  const assessmentType = useSelector((state: any) => state.session.project.assessmentType);
  let sessionChemicalGroups = useSelector((state: any) => state.session.chemicalGroups[assessmentType]);
  sessionChemicalGroups = sessionChemicalGroups.filter((el) => !disabledContaminantGroups.includes(el));

  const chemicalGroupsExt = chemicalGroups.map((el) => {
    const group = {...el};
    group.isDisabled = disabledContaminantGroups.includes(el.code);

    return group;
  });

  const [selected, setSelected] = useState(sessionChemicalGroups);
  const [selectedAslp, setSelectedAslp] = useState(initialSelectedAslp);
  const [selectedTclp, setSelectedTclp] = useState(initialSelectedTclp);

  const selectGroup = (abbreviation) => {
    let groupSelected: any[] = [].concat(selected);

    const isSelected = find(groupSelected, (abbr) => {
      return abbr === abbreviation;
    });

    if (isSelected) {
      groupSelected = filter(groupSelected, (abbr) => {
        return abbr !== abbreviation;
      });
    } else {
      groupSelected.push(abbreviation);
    }

    setSelected(groupSelected);
  };

  const toggleGroupAllSelection = (isChecked, contaminantGroup) => {
    const groupSelected: any[] = [].concat(selected);

    if (isChecked) {
      for (const contaminant of contaminantGroup) {
        const abbreviation = contaminant.code;

        if (includes(groupSelected, abbreviation)) {
          groupSelected.splice(groupSelected.indexOf(abbreviation), 1);
        }
      }
    } else {
      for (const contaminant of contaminantGroup) {
        const abbreviation = contaminant.code;

        if (disabledContaminantGroups.includes(abbreviation)) continue;

        if (!includes(groupSelected, abbreviation)) {
          groupSelected.push(abbreviation);
        }
      }
    }

    setSelected(groupSelected);
  };

  const saveSelectedGroupsAndAslpTclp = () => {
    onSave(selected, selectedAslp, selectedTclp);
  };

  function handleShouldOutputAslp(event) {
    setSelectedAslp(event.target.checked);
  }

  function handleShouldOutputTclp(event) {
    setSelectedTclp(event.target.checked);
  }

  const renderGroupRow = (contaminant) => {
    const abbreviation = contaminant.code;

    const isChecked = includes(selected, abbreviation);

    return (
      <Form.Group key={abbreviation} controlId={abbreviation} className="contaminant-group">
        <Form.Check
          type="checkbox"
          checked={isChecked}
          label={contaminant.name}
          disabled={contaminant.isDisabled}
          onChange={() => selectGroup(abbreviation)}
        />
      </Form.Group>
    );
  };

  const standardGroup = filter(chemicalGroupsExt, (contaminant) => {
    return contaminant.isStandardContaminantSuite;
  });

  const otherGroup = filter(chemicalGroupsExt, (contaminant) => {
    return !contaminant.isStandardContaminantSuite;
  });

  const isAllStandardSelected: boolean = isAllGroupSelected(standardGroup, selected);
  const isAllOtherSelected: boolean = isAllGroupSelected(otherGroup, selected);

  const isSoilAssessment = assessmentType === assessmentTypes.Soil;
  const standardContaminantsName = isSoilAssessment
    ? 'Standard Contaminant Suite (SAC/Priority) (Table 1 and 2 Output)'
    : 'Standard groups';
  const completeContaminantsSuiteName = isSoilAssessment
    ? 'Complete contaminants Suites (Table 3 Output)'
    : 'Additional analytes';

  return (
    <Modal id="contaminant-dialog" show={visible} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>Contaminant Group Selection</Modal.Header>

      <Modal.Body>
        <Form.Group>
          <b>Contaminant groups to include</b>
        </Form.Group>

        <Form.Group>
          <b>{standardContaminantsName}</b>
        </Form.Group>

        <Form.Check
          id="standardGroupCheckbox"
          type="checkbox"
          checked={isAllStandardSelected}
          label="All"
          onChange={() => toggleGroupAllSelection(isAllStandardSelected, standardGroup)}
        />

        {standardGroup.map((contaminant) => {
          return renderGroupRow(contaminant);
        })}

        <Form.Group className="other-group-label">
          <b>{completeContaminantsSuiteName}</b>
        </Form.Group>

        <Form.Check
          id="otherGroupCheckbox"
          type="checkbox"
          checked={isAllOtherSelected}
          label="All"
          onChange={() => toggleGroupAllSelection(isAllOtherSelected, otherGroup)}
        />

        {otherGroup.map((contaminant) => {
          return renderGroupRow(contaminant);
        })}

        {isSoilAssessment && (
          <div>
            <Form.Group className="other-group-label">
              <b>ASLP/TCLP Results (to be output in Tables 1, 2 and 3 as applicable)</b>
            </Form.Group>
            <Form.Check
              id="aslp"
              type="checkbox"
              checked={selectedAslp}
              onChange={handleShouldOutputAslp}
              label="ASLP"
            />
            <Form.Check
              id="tclp"
              type="checkbox"
              checked={selectedTclp}
              onChange={handleShouldOutputTclp}
              label="TCLP"
            />
            {/* <Form.Check id="tclp" type="checkbox" checked={outputTclp} label="Tclp" /> */}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={saveSelectedGroupsAndAslpTclp} disabled={isEmpty(selected)}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ContaminantDialog;
