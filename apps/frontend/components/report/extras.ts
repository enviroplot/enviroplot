import classnames from 'classnames';

export default {
  getCellClassByDisplayOptions,
};

function getCellClassByDisplayOptions(mainClass, displayOptions, isHighlighted = false) {
  if (displayOptions && displayOptions.isBold) {
    isHighlighted = true;
  }

  const classDefinition = {
    [mainClass]: true,
    highlighted: isHighlighted,
  };
  if (displayOptions && displayOptions.backgroundColor) {
    const className = `report-background-${displayOptions.backgroundColor.toLowerCase()}`;
    classDefinition[className] = true;
  }

  if (displayOptions && displayOptions.textColor) {
    const className = `report-text-${displayOptions.textColor.toLowerCase()}`;
    classDefinition[className] = true;
  }

  if (displayOptions && displayOptions.borderColor) {
    const className = `report-border-${displayOptions.borderColor.toLowerCase()}`;
    classDefinition[className] = true;
  }

  const result = classnames(classDefinition);

  return result;
}
