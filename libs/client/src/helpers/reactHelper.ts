import reactAutoBind from 'react-autobind';
import {isObject, isEqual, transform, isEmpty, isFunction} from 'lodash';
import {connect as reduxConnect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

export default {
  autoBind,
  connect,
  getKey,
  objectDiff,
};

function autoBind(self) {
  reactAutoBind(self);
}

function connect(component, stateMap, actions, options: any = {}) {
  const mapStateToProps = stateMap;
  if (mapStateToProps && !isFunction(mapStateToProps)) {
    throw new Error('State Map should be a function');
  }

  let mapDispatchToProps: any = null;
  if (!isEmpty(actions)) {
    mapDispatchToProps = (dispatch) => bindActionCreators(actions, dispatch);
  }

  if (!mapStateToProps && !mapDispatchToProps) {
    return component;
  }

  let result: any = reduxConnect(mapStateToProps, mapDispatchToProps)(component);

  if (options.withRouter) {
    result = withRouter(result);
  }

  return result;
}

function getKey() {
  const randomKey = Math.random().toString(36).substring(7);

  return randomKey;
}

function objectDiff(object, base) {
  const changes = (object, base) => {
    return transform(object, (result: any, value, key) => {
      if (!isEqual(value, base[key])) {
        result[key] = isObject(value) && isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });
  };

  return changes(object, base);
}
