import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Container, Row, Col, Button} from 'components/bootstrap';
import PropTypes from 'prop-types';

import * as states from 'constants/states';
import * as assessmentTypes from 'constants/assessmentType';

import TextInput from 'components/common/TextInput';
import SelectInput from 'components/common/SelectInput';
import AppIcon from 'components/common/AppIcon';
import {updateCriteria, saveCurrentCriteria, updateChemicalGroups} from 'actions/sessionActions';
import {isArray} from 'lodash';

interface IProject {
  assessmentType: string;
  state: string;
  number: string;
  name: string;
  type: string;
  location: string;
  date: string;
}

ProjectDetailsSection.propTypes = {
  files: PropTypes.object,
  currentProject: PropTypes.object.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  onUpdateSession: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

function ProjectDetailsSection({files, currentProject, onRemoveFile, onUpdateSession, onImport}) {
  const dispatch = useDispatch();

  const statesList = [
    states.NSW_STATE,
    states.QLD_STATE,
    states.SA_STATE,
    states.TAS_STATE,
    states.VIC_STATE,
    states.WA_STATE,
    states.ACT_TERR,
    states.NT_TERR,
  ];

  const assessmentTypesList = [assessmentTypes.Soil, assessmentTypes.Waste, assessmentTypes.Water];
  // TODO: enable when ready!
  // let disableWater = true;
  // if (disableWater) {
  //   assessmentTypesList = [assessmentTypes.Soil, assessmentTypes.Waste];
  // }
  const [needSessionUpdate, setNeedSessionUpdate] = useState(false);
  const [project, setProject] = useState<IProject | null>(null);

  const currentSelectedCriteria = useSelector((state: any) => state.session.criteria);
  const previouslySelectedCriteria = useSelector((state: any) => state.session.selectedCriteria);
  const chemicalGroups = useSelector((state: any) => state.session.chemicalGroups);

  useEffect(() => {
    setProject(currentProject);
  }, [currentProject]);

  useEffect(() => {
    if (project) updateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needSessionUpdate]);

  const updateSession = () => {
    onUpdateSession(project);
  };

  const renderFileRow = (key, file) => {
    const chemistryFile = file.chemistryFile;

    return (
      <Row key={key} className="files-names">
        <Col sm={{span: 3, offset: 1}} className="sample-file-name">
          {file.sampleFile}
        </Col>
        <Col sm={{span: 3}} className="chemistry-file-name">
          {chemistryFile}
        </Col>
        <Col sm={{span: 1}}>
          <Button onClick={() => onRemoveFile(key)} className="btn-remove" variant="link">
            <AppIcon name="close" />
          </Button>
        </Col>
      </Row>
    );
  };

  if (!project) return null;

  const onFieldChange = (name, value) => {
    setProject({...project, [name]: value});
  };

  const onFieldChangeWithUpdateSession = (name, value) => {
    onFieldChange(name, value);
    setNeedSessionUpdate(!needSessionUpdate);

    if (name === 'assessmentType') {
      const moduleName = value;

      dispatch(saveCurrentCriteria(currentSelectedCriteria, project.assessmentType));
      dispatch(updateCriteria(previouslySelectedCriteria[value]));
      if (isArray(chemicalGroups[moduleName])) dispatch(updateChemicalGroups(chemicalGroups[moduleName], moduleName));
    } else {
      dispatch(updateCriteria([]));
    }
  };

  const stateOptions = statesList.map((state) => ({value: state, label: state}));

  const assessmentTypeOptions = assessmentTypesList.map((assessmentType) => {
    return {value: assessmentType, label: assessmentType};
  });

  const updateBtnDisabled = !project.assessmentType || !project.state;

  return (
    <div id="project-details">
      <Container fluid>
        <div className="title">Project Details</div>

        <Row>
          <Col sm={{span: 11, offset: 1}}>
            <Row>
              <Col sm={4}>
                <SelectInput
                  name="assessmentType"
                  label="Assessment Type"
                  hideDefaultOption={true}
                  options={assessmentTypeOptions}
                  value={project.assessmentType}
                  disabled={files !== null && Object.keys(files).length !== 0 ? true : false}
                  onChange={onFieldChangeWithUpdateSession}
                />
              </Col>

              <Col sm={4}>
                <TextInput name="number" label="Project Number" value={project.number} onChange={onFieldChange} />
              </Col>

              <Col sm={3}>
                <Button variant="primary" onClick={onImport}>
                  From Vision
                </Button>
              </Col>
            </Row>

            <Row>
              <Col sm={4}>
                <SelectInput
                  name="state"
                  label="State / Territory"
                  hideDefaultOption={true}
                  options={stateOptions}
                  value={project.state}
                  onChange={onFieldChangeWithUpdateSession}
                />
              </Col>

              <Col sm={4}>
                <TextInput name="name" label="Project Name" value={project.name} onChange={onFieldChange} />
              </Col>
            </Row>

            <Row>
              <Col sm={4}>
                <TextInput name="type" label="Investigation Type" value={project.type} onChange={onFieldChange} />
              </Col>

              <Col sm={4}>
                <TextInput name="location" label="Location" value={project.location} onChange={onFieldChange} />
              </Col>

              <Col sm={3}>
                <Button variant="primary" disabled={updateBtnDisabled} onClick={updateSession}>
                  Update
                </Button>
              </Col>
            </Row>
            <Row>
              <Col sm={4}>
                <TextInput name="date" label="Project Date" value={project.date} onChange={onFieldChange} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <Container fluid className="files">
        <div className="title">Laboratory Files</div>
        {files &&
          Object.keys(files).map((key) => {
            const file = files[key];
            return renderFileRow(key, file);
          })}
      </Container>
    </div>
  );
}

export default ProjectDetailsSection;
