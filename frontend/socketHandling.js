const HOST = 'localhost';
const PORT = '6474';

const socket = new WebSocket(`ws://${HOST}:${PORT}/ws`);
const messageHandlers = [];
const messages = [];

socket.onopen = () => {
  messages.forEach(::socket.send);
  messages.push = ::socket.send;
};

socket.onmessage = event => {
  const withoutFlirtations = event.data.replace(/Of course, my sugar <3 /, '');
  messageHandlers.forEach(fn => fn(withoutFlirtations));
};

socket.onerror = error => {
  console.error('of course I\'m gonna get an error T_T', error);
};

socket.onclose = reasonOrSomething => {
  console.log('closing socket', reasonOrSomething);
};

export function onMessage(fn) {
  messageHandlers.push(fn);
}

export function sendMessage(message) {
  messages.push(message);
}

export function requestResource(resourceName) {
  sendMessage(`Hey babe, can I get your ${resourceName}?`);
}
