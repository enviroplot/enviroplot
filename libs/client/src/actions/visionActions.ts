import {orderBy, filter} from 'lodash';

import helper from './actionHelper';
import dataService from 'services/dataService';
import projectService from 'services/projectService';

export const isVisionConnected: any = () => {
  return helper.dispatchAsyncAction(async () => {
    return await dataService.isConnectedToVisionApi();
  }, null);
};

export const getProjects: any = (projectNumber) => {
  return helper.dispatchAsyncAction(async () => {
    const projectsData = await dataService.getProjects(projectNumber);
    let projects: any = [];

    for (const projectData of projectsData) {
      //map only projects with empty phase and task
      const emptyPhase = !projectData.phase || projectData.phase === 'no_phase';

      if (!emptyPhase || !isEmptyTask(projectData)) continue;

      const project = projectService.mapProject(projectData);
      projects.push(project);
    }

    projects = orderBy(projects, 'projectName');

    return projects;
  }, null);
};

export const getProjectDetails: any = (projectNumber, phase, task) => {
  return helper.dispatchAsyncAction(async () => {
    const projectDetails = await dataService.getProjectDetails(projectNumber, phase, task);

    const result = projectService.mapProject(projectDetails);
    return result;
  }, null);
};

export const getProjectPhases: any = (projectNumber: any, searchStr = '') => {
  return helper.dispatchAsyncAction(async () => {
    let phases = await dataService.getProjectPhases(projectNumber);

    if (searchStr) {
      phases = filter(phases, (project) => {
        const phase = project.phase;

        if (!phase) return false;

        return phase.toLowerCase().includes(searchStr.toLowerCase());
      });
    }

    let projects: any = [];

    for (const projectData of phases) {
      //map only projects with empty task
      if (!isEmptyTask(projectData)) continue;

      const project = projectService.mapProject(projectData);
      projects.push(project);
    }

    projects = orderBy(projects, 'projectName');

    return projects;
  }, null);
};

export const getProjectTasks: any = (projectNumber, phase, searchStr = '') => {
  return helper.dispatchAsyncAction(async () => {
    let tasks = await dataService.getProjectTasks(projectNumber, phase);

    if (searchStr) {
      tasks = filter(tasks, (project) => {
        const task = project.task;

        if (!task) return false;

        return task.toLowerCase().includes(searchStr.toLowerCase());
      });
    }

    let projects: any = [];

    for (const projectData of tasks) {
      const project = projectService.mapProject(projectData);
      projects.push(project);
    }

    projects = orderBy(projects, 'projectName');

    return projects;
  }, null);
};

//helper methods

function isEmptyTask(projectData) {
  return !projectData.task || projectData.task === 'no_task';
}
