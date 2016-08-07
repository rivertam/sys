import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import reducer from './reducers';

const sagaMiddleware = createSagaMiddleware();

export default createStore(
  reducer,
  {},
  compose(
    applyMiddleware(sagaMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);
sagaMiddleware.run(rootSaga);
