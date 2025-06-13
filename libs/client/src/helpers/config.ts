const isDevLocal = process.env.NODE_ENV !== 'production';

export default {
  isDevLocal,
  loggingOn: process.env.LOGGING_ON,
  baseUrl: process.env.REACT_APP_BASE_URL,
  visionUrl: process.env.REACT_APP_VISION_URL,
  erApiUrl: process.env.REACT_APP_ER_URL,
  adminCenterApiUrl: process.env.REACT_APP_ADMIN_CENTER_URL,
  baseVisionProjectFolder: process.env.REACT_APP_BASE_VISION_PROJECT_FOLDER
    ? process.env.REACT_APP_BASE_VISION_PROJECT_FOLDER
    : null,
  format: {
    projectCreationDate: 'MMMM yyyy',
  },
  disabledContaminantGroups: [] as string[],
  version: '4.0.7',
};
