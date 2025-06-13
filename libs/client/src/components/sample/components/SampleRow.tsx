import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {Form} from 'components/bootstrap';
import {DragSource, DropTarget} from 'react-dnd';

import formatHelper from 'helpers/formatHelper';

const dragSource = {
  beginDrag(props) {
    return {
      id: props.sampleId,
      originalIndex: props.findItem(props.sampleId).index,
    };
  },

  endDrag(props, monitor) {
    const {id: droppedId, originalIndex} = monitor.getItem();
    const didDrop = monitor.didDrop();

    if (!didDrop) {
      props.moveItem(droppedId, originalIndex);
    } else {
      props.saveListOrder();
    }
  },
};

const registerDragSource = (Component) =>
  DragSource('SAMPLE_ROW', dragSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }))(Component);

const dropTarget = {
  canDrop() {
    return false;
  },

  hover(props, monitor) {
    const {id: draggedId} = monitor.getItem();
    const {sampleId: overId} = props;

    if (draggedId !== overId) {
      const {index: overIndex} = props.findItem(overId);
      props.moveItem(draggedId, overIndex);
    }
  },
};

const registerDropTarget = (Component) =>
  DropTarget('SAMPLE_ROW', dropTarget, (connect) => ({
    connectDropTarget: connect.dropTarget(),
  }))(Component);

SampleRow.propTypes = {
  sampleId: PropTypes.string.isRequired,
  sample: PropTypes.object.isRequired,
  parameter: PropTypes.object.isRequired,
  selectSample: PropTypes.func,
  findItem: PropTypes.func.isRequired,
  moveItem: PropTypes.func.isRequired,
  saveListOrder: PropTypes.func.isRequired,
  isChecked: PropTypes.bool,
  isSoilAssessment: PropTypes.bool,
  isWaterAssessment: PropTypes.bool,
};

function SampleRow({
  sampleId,
  sample,
  selectSample,
  isChecked,
  isSoilAssessment,
  isWaterAssessment,
  connectDragSource,
  connectDropTarget,
  isDragging,
}) {
  let depthTo,
    depthFrom = '-';
  const excavationDepth = '-';

  if (sample && sample.depth) {
    if (sample.depth.to || sample.depth.to === 0) depthTo = sample.depth.to;
    if (sample.depth.from || sample.depth.from === 0) depthFrom = sample.depth.from;
  }

  const displayDepthFrom = formatHelper.displayDepth(depthFrom);
  const displayDepthTo = formatHelper.displayDepth(depthTo);

  const sampleClass = classnames({
    selected: isChecked,
    dragging: isDragging,
  });

  const tripRinsateClass = classnames({
    tripRinsate: sample.isTripBlank || sample.isTripSpike || sample.isRinsate || sample.primarySampleId,
  });

  return connectDragSource(
    connectDropTarget(
      <tr key={sampleId} className={sampleClass} onClick={() => selectSample(sampleId)}>
        <td className="indent" />
        <td className="td-check">
          <Form.Check type="checkbox" checked={isChecked} onChange={() => null} />
        </td>
        <td className={tripRinsateClass}>{sampleId}</td>
        <td className={tripRinsateClass}>{sample.dpSampleId}</td>
        <td>{sample.hasStandardContaminationChemicals ? 'Yes' : 'No'}</td>

        {!isWaterAssessment && (
          <>
            <td>{displayDepthFrom}</td>
            <td>{displayDepthTo}</td>
          </>
        )}

        {isSoilAssessment && <td>{excavationDepth}</td>}
        <td>{sample.dateSampled}</td>
        <td>{sample.matrixType}</td>
      </tr>
    )
  );
}

export default registerDropTarget(registerDragSource(SampleRow));
