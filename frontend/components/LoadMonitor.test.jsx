/**
 * 1. This is the first time I've ever used enzyme please forgive me.
 * 2. If this were production code, I'd definitely have written more tests
 */

import jsdom from 'jsdom';
import expect from 'expect';
import React from 'react';
import { mount } from 'enzyme';
import { LoadMonitor } from './LoadMonitor';

global.document = jsdom.jsdom('');
global.window = document.defaultView;

describe('components', () => {
  describe('LoadMonitor', () => {
    context('the last 5 minute load is above the threshold', () => {
      it('should call the alert prop with appropriate warnings', () => {
        const alert = expect.createSpy();
        const threshold = Math.floor(Math.random() * 5 + 2);
        const loads = [
          Math.random() * threshold,
          Math.random() * 2 + threshold,
          Math.random() * threshold,
        ];

        mount(
          <LoadMonitor
            threshold={threshold}
            alert={alert}
            subscribeToResource={() => {}} // eslint-disable-line react/jsx-no-bind
            data={loads}
          />
        );

        alert.calls[0].arguments[0].forEach(warning => {
          expect(warning).toMatch({
            diff: /(add)|(remove)/,
            message: String,
            name: /load\d/,
          });
          const { diff, name } = warning;

          const loadNumber = parseInt(/load(\d)/.exec(name)[1], 10);
          // okay this might not be the best factored code
          if (loadNumber === 1) {
            expect(diff).toEqual('add');
          } else {
            expect(diff).toEqual('remove');
          }
        });
      });
    });
  });
});
