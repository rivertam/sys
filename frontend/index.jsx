import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import Dash from './components/Dash';
import store from './store';
render(
  <Provider store={store}>
    <Dash />
  </Provider>,
  document.getElementById('app')
);
