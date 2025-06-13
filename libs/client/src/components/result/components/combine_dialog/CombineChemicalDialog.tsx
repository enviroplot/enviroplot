import React, {useState} from 'react';
import {Modal, Button, Table, Form} from 'components/bootstrap';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';

import CC_CONSTANTS from 'constants/combinedChemicals';
import {TOTAL_ASBESTOS_CODES} from 'constants/asbestosValues';

import './combined-dialog.scss';

CombineChemicalDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  combinedChemicals: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function CombineChemicalDialog({visible, combinedChemicals, onClose, onSave}) {
  const combinedChemicalsDisplay = useSelector((state: any) => state.session.combinedChemicalsDisplay);

  const [displaySettings, setDisplaySettings] = useState(combinedChemicalsDisplay);

  const setCCDisplay = (chemicalCode, displayType) => {
    setDisplaySettings({...displaySettings, [chemicalCode]: displayType});
  };

  const saveDisplaySettings = () => {
    onSave(displaySettings);
  };

  return (
    <Modal size="lg" id="combine-chemical-dialog" show={visible} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>Combined/&rsquo;Total&lsquo; Analytes</Modal.Header>

      <Modal.Body>
        <Form.Group>
          <b>Combined chemicals display settings</b>
        </Form.Group>

        <Table bordered>
          <thead>
            <tr>
              <th className="chemical">Chemical</th>
              <th>
                Combined Results only <br /> (i.e. A + B)
              </th>
              <th>
                Individual and Combined Results <br /> (i.e. A, B, A + B)
              </th>
              <th>
                Individual Results only <br /> (i.e. A, B)
              </th>
            </tr>
          </thead>

          <tbody>
            {combinedChemicals.map((chemical) => {
              let isDisplayAll = false;
              let isDisplayCombined = false;
              let isDisplayIndividual = false;

              switch (displaySettings[chemical.code]) {
                case CC_CONSTANTS.DISPLAY.INDIVIDUAL:
                  isDisplayIndividual = true;
                  break;
                case CC_CONSTANTS.DISPLAY.COMBINED:
                  isDisplayCombined = true;
                  break;
                case CC_CONSTANTS.DISPLAY.ALL:
                  isDisplayAll = true;
                  break;
                default:
                  if (TOTAL_ASBESTOS_CODES.includes(chemical.code)) {
                    isDisplayAll = true;
                  } else {
                    //default
                    isDisplayCombined = true;
                  }
              }

              return (
                <tr key={chemical.code}>
                  <td className="chemicalName">{chemical.name}</td>
                  <td>
                    <Form.Check
                      type="radio"
                      name={chemical.code}
                      checked={isDisplayCombined}
                      onChange={() => setCCDisplay(chemical.code, CC_CONSTANTS.DISPLAY.COMBINED)}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="radio"
                      name={chemical.code}
                      checked={isDisplayAll}
                      onChange={() => setCCDisplay(chemical.code, CC_CONSTANTS.DISPLAY.ALL)}
                    />
                  </td>
                  <td>
                    <Form.Check
                      type="radio"
                      name={chemical.code}
                      checked={isDisplayIndividual}
                      onChange={() => setCCDisplay(chemical.code, CC_CONSTANTS.DISPLAY.INDIVIDUAL)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" onClick={saveDisplaySettings}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CombineChemicalDialog;
