import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Dropdown, OverlayTrigger, Tooltip} from 'components/bootstrap';
import {useSelector, useDispatch} from 'react-redux';

import {updateWasteData, checkIfNeedsUpdate} from 'actions/updateActions';
import {confirmAction} from 'actions/commonActions';

import {isAssessmentTypeSelected} from 'reducers/sessionReducer';

import {CHOOSE_ASSESSMNET_TYPE_PRIOR_IMPORT, FUTURE_FEATURE} from 'constants/literals/tooltips';
import {UPDATES_ARE_AVAILABLE} from 'constants/literals/messages';
import {
  NO_CONNECTION_TO_ADMIN_CENTER,
  YOUR_DATA_IS_UP_TO_DATE,
  LOCAL_DATA_SUCCESSFULLY_UPDATED,
} from 'constants/literals/info';

import loaderService from 'services/loaderService';

import AppIcon from 'components/common/AppIcon';

HomeToolsSection.propTypes = {
  isActiveSession: PropTypes.bool.isRequired,
  importDpFile: PropTypes.func.isRequired,
  importEsdatFile: PropTypes.func.isRequired,
  createSession: PropTypes.func.isRequired,
  clearProjectDetails: PropTypes.func.isRequired,
  showChemicals: PropTypes.func.isRequired,
  loadSession: PropTypes.func.isRequired,
  saveSession: PropTypes.func.isRequired,
  showAboutInfo: PropTypes.func.isRequired,
  viewProjectDetails: PropTypes.func.isRequired,
};

function HomeToolsSection(props) {
  const dispatch = useDispatch();

  const isAssessmentType = useSelector((state: any) => isAssessmentTypeSelected(state))();

  const [chemicalsVisible, setChemicalsVisibility] = useState(false);

  const toggleChemicals = () => {
    if (chemicalsVisible) {
      props.viewProjectDetails();
    } else {
      props.showChemicals();
    }

    setChemicalsVisibility(!chemicalsVisible);
  };

  const createSession = async () => {
    props.viewProjectDetails();
    setChemicalsVisibility(false);
    await props.createSession();
  };

  const updateSeedData = async () => {
    const needsUpdate: any = await dispatch(checkIfNeedsUpdate());

    if (!needsUpdate) {
      showInfo(NO_CONNECTION_TO_ADMIN_CENTER);
      return;
    }

    if (needsUpdate === 'false') {
      showInfo(YOUR_DATA_IS_UP_TO_DATE);
      return;
    }

    dispatch(
      confirmAction({
        title: 'Warning!',
        message: UPDATES_ARE_AVAILABLE,
        action: async () => {
          loaderService.showLoader();
          const result = await dispatch(updateWasteData());

          if (result) showInfo(LOCAL_DATA_SUCCESSFULLY_UPDATED);

          loaderService.hideLoader();
        },
      })
    );
  };

  const showInfo = (message) => {
    dispatch(
      confirmAction({
        title: 'Info',
        message: message,
        infoDialog: true,
      })
    );
  };

  const tooltipDelay = {show: 250, hide: 400};
  const tooltip = <Tooltip id="check-for-updates">{FUTURE_FEATURE}</Tooltip>;
  const tooltipImportNewData = <Tooltip id="check-for-updates">{CHOOSE_ASSESSMNET_TYPE_PRIOR_IMPORT}</Tooltip>;

  return (
    <div className="bg-light tools">
      <div className="tile border-right">
        <div className="file-buttons">
          <Button variant="link" onClick={createSession}>
            <AppIcon name="file" size="3x" color="grey" />
            New
          </Button>
          <OverlayTrigger placement="right-start" overlay={tooltipImportNewData} delay={tooltipDelay}>
            <Dropdown>
              <Dropdown.Toggle id="import-toggler" variant="link" disabled={!props.isActiveSession}>
                <AppIcon name="import" size="3x" color="grey" />
                Import New Data
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item disabled={!props.isActiveSession} onClick={props.importEsdatFile}>
                  Import ESdat file (select &rsquo;sample&apos; file)
                </Dropdown.Item>
                <Dropdown.Item disabled={!props.isActiveSession} onClick={props.importDpFile}>
                  Import Douglas File
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </OverlayTrigger>

          <Button variant="link" onClick={props.loadSession}>
            <AppIcon name="open" size="3x" color="grey" />
            Open Existing File
          </Button>

          <Button variant="link" onClick={props.saveSession} disabled={!props.isActiveSession}>
            <AppIcon name="save" size="3x" color="dodgerblue" />
            Save
          </Button>
        </div>
        <div className="tile-title">File</div>
      </div>

      <div className="tile border-right">
        <div className="display-buttons">
          <Button variant="link" onClick={toggleChemicals} disabled={!isAssessmentType}>
            {chemicalsVisible ? 'Project details' : 'Contaminant List'}
          </Button>
          {false && (
            <OverlayTrigger placement="right-start" overlay={tooltip} delay={tooltipDelay}>
              <div>
                <Button variant="link" onClick={updateSeedData} disabled={true}>
                  <AppIcon name="download" size="3x" color="grey" />
                  Check for Updates
                </Button>
              </div>
            </OverlayTrigger>
          )}

          <Button variant="link" onClick={props.showAboutInfo}>
            About
          </Button>
        </div>
        <div className="tile-title">System</div>
      </div>

      <div className="tile border-right">
        <div className="display-buttons">
          <Button variant="link" onClick={props.clearProjectDetails}>
            Clear Project Details
          </Button>
        </div>
        <div className="tile-title">Settings</div>
      </div>
    </div>
  );
}

export default HomeToolsSection;
