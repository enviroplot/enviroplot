let express = require('express');
let cors = require('cors');
let _ = require('lodash');
let app = express();

let projectsData = require('./projects.json');
let phasesData = require('./phases.json');
let tasksData = require('./tasks.json');

app.use(cors());

const PORT = 3000;
const throwError = false;

app.listen(PORT, () => {
  console.log(`Vision APIs server running on port ${PORT}`);
});

app.get('/status', (req, res, next) => {
  res.json(getVisionApiStatus());
});

app.get('/vision/v2/projects', (req, res, next) => {
  if (throwError) {
    res.status(500);
    return res.send('Server Error');
  }

  const query = req.query;

  let projects = getProjects(projectsData);

  if (!query) return res.json(projects);

  projects = _.filter(projects, project => {
    let projectNumber = project.ProjectNumber;
    if (!projectNumber) return false;
    return projectNumber.toLowerCase().includes(query.number.toLowerCase());
  });

  res.json(projects);
});

app.get('/vision/project/:projectNumber/:phase/tasks', (req, res, next) => {
  let {projectNumber, phase} = req.params;

  let projects = getProjects(tasksData);

  let result = _.filter(projects, p => p.Phase === phase && p.ProjectNumber === projectNumber);

  if (result.length) return res.json(result);

  res.json(null);
});

app.get('/vision/project/:projectNumber/:phase/:task', (req, res, next) => {
  let {phase, projectNumber, task} = req.params;

  let projects = getProjects(projectsData);

  let result = _.filter(projects, p => (p.Task = task && p.Phase === phase && p.ProjectNumber === projectNumber));

  if (result.length) return res.json(result[0]);

  res.json(null);
});

app.get('/vision/project/:projectNumber/phases/', (req, res, next) => {
  let {projectNumber} = req.params;

  let projects = getProjects(phasesData);

  let result = _.filter(projects, p => p.ProjectNumber === projectNumber);

  if (result.length) return res.json(result);

  res.json(null);
});

//helper methods

function getProjects(data) {
  let result = _.cloneDeep(data);

  for (let project of result) {
    if (project.Task === null) project.Task = 'no_task';
  }

  for (let project of result) {
    if (project.Phase === null) project.Phase = 'no_phase';
  }

  return result;
}

function getVisionApiStatus() {
  return 'active';
}
