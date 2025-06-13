import electronHelper from './electronHelper';
import config from './config';

const path = electronHelper.require('path');

export default {
  getDataRelativePath,
  getSeedFilePath,
};

const profileData = {
  production: {
    data: './data',
  },
  development: {
    data: './data',
  },
};

const rootPath = electronHelper.getAppRoot();

function getDataRelativePath(...paths) {
  return getRelativePath('data', ...paths);
}

function getRelativePath(profileFolder, ...paths) {
  const folderRelative = profileData[getCurrentProfile()][profileFolder];

  if (!folderRelative) throw Error(`Cannot find relative folder profile '${profileFolder}'`);

  paths.unshift(folderRelative);
  paths.unshift(rootPath);

  const result = path.join(paths[0], paths[1], paths[2]);

  return result;
}

function getCurrentProfile() {
  return 'development';
}

function getSeedFilePath() {
  if (config.isDevLocal) {
    return './data/seed/seed.json';
  } else {
    return path.join(electronHelper.getAppRoot(), '/data/seed/', 'seed.json');
  }
}
