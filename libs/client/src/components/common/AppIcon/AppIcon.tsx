/* eslint-disable react/prop-types */
import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

//reduce bundle size by importing required icons only
import {faQuestionCircle, faFileExcel, faSave, faFile, faFolderOpen} from '@fortawesome/free-regular-svg-icons';
import {
  faBars,
  faChessBoard,
  faFileImport,
  faCloudDownloadAlt,
  faTimes,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';

const unknownIcon = faQuestionCircle;

const map = {
  excel: faFileExcel,
  save: faSave,
  sand: faChessBoard,
  silt: faBars,
  file: faFile,
  import: faFileImport,
  open: faFolderOpen,
  download: faCloudDownloadAlt,
  close: faTimes,
  'sort-up': faSortUp,
  'sort-down': faSortDown,
};

const AppIcon = (props) => {
  let icon = unknownIcon;

  if (map[props.name]) {
    icon = map[props.name];
  }

  return <FontAwesomeIcon {...props} icon={icon} />;
};

export default AppIcon;
