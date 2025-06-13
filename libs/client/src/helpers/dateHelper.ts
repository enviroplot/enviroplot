import {format, parseISO} from 'date-fns';

import config from 'helpers/config';

export default {
  displayProjectCreationDate,
};

function displayProjectCreationDate(date) {
  return format(parseISO(date), config.format.projectCreationDate);
}
