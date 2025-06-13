import React, {useState} from 'react';
import {Modal, Button} from 'components/bootstrap';
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async';
import {useDispatch} from 'react-redux';
import {isEmpty} from 'lodash';

import {getProjects, getProjectDetails, getProjectPhases, getProjectTasks} from 'actions/visionActions';

import projectService from 'services/projectService';

interface IProject {
  number: string;
  phase: string;
  task: string;
  name: string;
  hasSublevels: boolean;
}

VisionProjectSearchDialog.propTypes = {
  visible: PropTypes.bool,
  close: PropTypes.func.isRequired,
  importFromVision: PropTypes.func.isRequired,
  project: PropTypes.object,
};

function VisionProjectSearchDialog({visible, project, close, importFromVision}) {
  const dispatch = useDispatch();

  const [projectSelected, setProject] = useState<IProject | null>(null);
  const [phaseSelected, setPhase] = useState<IProject | null>(null);
  const [taskSelected, setTask] = useState<IProject | null>(null);

  const loadProjects: any = async (inputValue: any, callback) => {
    if (inputValue.length < 3) return;

    const projects = await dispatch(getProjects(inputValue));

    callback(getProjectOptions(projects, 'projectNumber'));
  };

  const loadPhases: any = async (inputValue: any) => {
    if (!projectSelected) return;

    const phases = await dispatch(getProjectPhases(projectSelected.number, inputValue));

    return getProjectOptions(phases, 'phase');
  };

  const loadTasks: any = async (inputValue) => {
    if (!projectSelected || !phaseSelected) return;

    const tasks = await dispatch(getProjectTasks(projectSelected.number, phaseSelected.phase, inputValue));

    return getProjectOptions(tasks, 'task');
  };

  const getProjectOptions = (projects, field) => {
    const options: any[] = [];

    for (const project of projects) {
      const option = {
        value: project.id,
        label: projectService.getProjectLabel(project, field),
        number: project.projectNumber,
        phase: project.phase,
        task: project.task,
        name: project.projectName,
        hasSublevels: project.hasSublevels,
      };

      options.push(option);
    }

    return options;
  };

  const handleInputChange = (newValue) => {
    const inputValue = newValue.replace(/\W/g, '');
    return inputValue;
  };

  const importProject = async () => {
    if (!projectSelected) return;

    let number = projectSelected.number;
    let phase = projectSelected.phase;
    let task = projectSelected.task;

    if (taskSelected) {
      number = taskSelected.number;
      phase = taskSelected.phase;
      task = taskSelected.task;
    } else if (phaseSelected) {
      number = phaseSelected.number;
      phase = phaseSelected.phase;
      task = phaseSelected.task;
    }

    const selectedProject = await dispatch(getProjectDetails(number, phase, task));

    if (!selectedProject) return;

    let projectToUpdate = {
      number: '',
      name: '',
      date: '',
      type: '',
      location: '',
    };

    if (!isEmpty(project)) projectToUpdate = {...project};

    projectToUpdate.number = selectedProject.projectNumber;
    projectToUpdate.name = selectedProject.projectName;
    projectToUpdate.date = selectedProject.creationDate;
    projectToUpdate.location = selectedProject.location;

    importFromVision(projectToUpdate);
  };

  const getProjectName = () => {
    let name = '';

    if (taskSelected) {
      name = taskSelected.name;
    } else if (phaseSelected) {
      name = phaseSelected.name;
    } else if (projectSelected) {
      name = projectSelected.name;
    }

    return name;
  };

  const isBtnDisabled = () => {
    if (!projectSelected) return true;

    if (projectSelected && projectSelected.hasSublevels && !phaseSelected) return true;

    if (phaseSelected && phaseSelected.hasSublevels && !taskSelected) return true;

    return false;
  };

  const btnDisabled = isBtnDisabled();

  const showPhaseInput = projectSelected && projectSelected.hasSublevels;

  const showTaskInput = showPhaseInput && phaseSelected && phaseSelected.hasSublevels;

  const projectName = getProjectName();

  return (
    <Modal id="project-search-dialog" show={visible} onHide={close} backdrop="static" centered>
      <Modal.Header closeButton>Please start typing project number</Modal.Header>
      <Modal.Body>
        <AsyncSelect
          name="project"
          placeholder="Project number..."
          loadOptions={loadProjects}
          onInputChange={handleInputChange}
          onChange={(selected: any) => setProject(selected)}
        />

        {showPhaseInput && (
          <AsyncSelect
            name="phase"
            placeholder="Phase..."
            loadOptions={loadPhases}
            cacheOptions
            defaultOptions
            onInputChange={handleInputChange}
            onChange={(selected: any) => setPhase(selected)}
          />
        )}

        {showTaskInput && (
          <AsyncSelect
            name="task"
            placeholder="Task..."
            loadOptions={loadTasks}
            cacheOptions
            defaultOptions
            onInputChange={handleInputChange}
            onChange={(selected: any) => setTask(selected)}
          />
        )}

        {projectName && <div>Project Name: {projectName}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" disabled={btnDisabled} onClick={importProject}>
          Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default VisionProjectSearchDialog;
