import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import {DragDropContextProvider} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import * as serviceWorker from './serviceWorker';
import loaderService from 'services/loaderService';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-toastify/dist/ReactToastify.css';

import './styles/index.scss';
import App from './components/App';
import {routes} from './routes';
import configureStore from './store';

const store = configureStore();

loaderService.setStore(store);

ReactDOM.render(
  <Provider store={store}>
    <HashRouter basename="/">
      <DragDropContextProvider backend={HTML5Backend}>
        <App routes={routes} />
      </DragDropContextProvider>
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
