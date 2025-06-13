import React, {useState, useEffect} from 'react';
import {Switch, Route} from 'react-router-dom';
import PropTypes from 'prop-types';
import {ToastContainer} from 'react-toastify';
import Loader from 'react-loaders';
import {isEmpty} from 'lodash';
import {useSelector, useDispatch} from 'react-redux';

import {confirmActionCancel} from 'actions/commonActions';
import {isVisionConnected} from 'actions/visionActions';

import {CANNOT_CONNECT_TO_DP_NETWORK} from 'constants/literals/errors';

import utils from 'utils';
import uiHelper from 'helpers/uiHelper';
import config from 'helpers/config';

import AppPage from 'components/common/AppPage';
import Confirm from 'components/common/Confirm';

import '../styles/App.scss';

App.propTypes = {
  routes: PropTypes.array.isRequired,
  children: PropTypes.any,
};

function App(props) {
  const dispatch = useDispatch();

  const confirmAction = useSelector((state: any) => state.common.confirmAction);
  const isLoaderVisible = useSelector((state: any) => state.common.isLoaderVisible);

  const cancelAction = () => {
    dispatch(confirmActionCancel());
  };

  const isVisionApiConnected = () => {
    return dispatch(isVisionConnected());
  };

  const {dialog, currentWindow} = utils.getElectronModules();

  const [canRun, setCanRun] = useState(false);

  useEffect(() => {
    handleSaveOnClose();
    if (config.isDevLocal) {
      setCanRun(true);
    } else {
      checkIsConnectedToDpNetwork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkIsConnectedToDpNetwork = async () => {
    const isVisionAvailable = await isVisionApiConnected();

    handleResponse(isVisionAvailable);

    setInterval(async () => {
      const isVisionAvailable = await isVisionApiConnected();

      if (isVisionAvailable !== canRun) handleResponse(isVisionAvailable);
    }, 10000);
  };

  const handleResponse = (isVisionAvailable) => {
    if (!isVisionAvailable) uiHelper.showError(CANNOT_CONNECT_TO_DP_NETWORK);

    setCanRun(isVisionAvailable);
  };

  const handleSaveOnClose = () => {
    if (!currentWindow) return;
    currentWindow.on('close', (event) => {
      if (event) {
        event.preventDefault();
        const options = {
          type: 'question',
          buttons: ['&Exit without save', '&Cancel'],
          defaultId: 1,
          title: 'Are you sure?',
          message: 'Do you want exit without saving session data? ',
          detail: 'All unsaved session data will be deleted. Select "Cancel" to cancel exit so you can save data.',
          cancelId: 1,
          noLink: true,
          normalizeAccessKeys: true,
        };

        dialog.showMessageBox(currentWindow, options).then((result) => {
          if (result.response === 0) {
            currentWindow.destroy();
          } else if (result.response === 1) {
            //Cancel button pressed, no action needed
          }
        });
      }
    });
  };

  const renderRoute = (route, index) => {
    const {pageProps, component: Component} = route;

    const wrapInAppPage = !isEmpty(pageProps);

    let render = (props) => <Component {...props} />;

    if (wrapInAppPage) {
      render = (props) => (
        <AppPage {...pageProps}>
          <Component {...props} />
        </AppPage>
      );
    }

    return <Route key={index} exact={route.exact} path={route.path} render={render} />;
  };

  return (
    <div>
      {canRun && (
        <>
          <Switch>
            {props.routes.map((route, index) => {
              return renderRoute(route, index);
            })}
          </Switch>

          {props.children}
        </>
      )}

      <ToastContainer />

      {isLoaderVisible && <Loader type="ball-spin-fade-loader" active={isLoaderVisible} />}

      {confirmAction && confirmAction.message && (
        <Confirm
          title={confirmAction.title}
          message={confirmAction.message}
          infoDialog={confirmAction.infoDialog}
          visible={true}
          action={() => {
            cancelAction();
            confirmAction.action();
          }}
          close={cancelAction}
          buttonText={confirmAction.buttonText}
        />
      )}
    </div>
  );
}

export default App;
