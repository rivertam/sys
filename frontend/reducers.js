import { onMessage } from './socketHandling';
import store from './store';

const alreadySubscribed = new Set();

// Life is too short to do the whole "Dux" thing.
// Just write one giant messy reducer.

export default (state, action) => {
  {
    const result = /SUBSCRIBE_TO_([^_\s]+)_DATA/.exec(action.type);
    if (result && !alreadySubscribed.has(result[1].toLowerCase())) {
      alreadySubscribed.add(result[1].toLowerCase());
      onMessage(message => {
        if (message.toLowerCase().startsWith(result[1].toLowerCase())) {
          const json = message.split(':').slice(1).join('');
          store.dispatch({
            type: `RECEIVE_${result[1].toUpperCase()}_DATA`,
            payload: JSON.parse(json),
          });
        }
      });
    }
  }

  {
    const result = /RECEIVE_([^_\s]+)_DATA/.exec(action.type);
    if (result) {
      return {
        ...state,
        [`${result[1].toLowerCase()}Data`]: action.payload,
      };
    }
  }

  if (action.type === 'ALERT') {
    let warnings = (state.warnings || []).slice();
    action.payload.forEach(({ diff, message, name }) => {
      // always remove conflicting warnings
      warnings = warnings.filter(w => w.name !== name);
      if (diff === 'add') {
        // replace it if it's an add
        warnings.push({ name, message });
      }
    });

    return {
      ...state,
      warnings,
    };
  }

  return state;
};
