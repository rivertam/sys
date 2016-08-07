import { takeEvery, delay, fork } from 'redux-saga';
import { requestResource } from './socketHandling';

// honestly, the assignment says to do 10 seconds but it's so much
// coolor when it's under a second. Especially because you can see
// the CPU usage spike when you type and/or I need a new computer.
const REFRESH_INTERVAL = 10000;

function generateSubscribeToResource(resource) {
  let alreadySubscribed = false;
  return function* subscribeToResource() {
    if (alreadySubscribed) {
      return;
    }
    alreadySubscribed = true;

    while(true) {
      requestResource(resource);
      yield delay(REFRESH_INTERVAL);
    }
  };
}

export function* watchSubscriptionsToResource(resource) {
  yield* takeEvery(
    `SUBSCRIBE_TO_${resource.toUpperCase()}_DATA`,
    generateSubscribeToResource(resource)
  );
}

export default function* rootSaga() {
  const resources = ['cpu', 'load', 'uptime'];
  yield resources.map(watchSubscriptionsToResource);
}
