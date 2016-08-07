/**
 * 1. This is the first time I've ever used enzyme please forgive me.
 * 2. If this were production code, I'd definitely have written more tests
 */

import jsdom from 'jsdom';
import expect from 'expect';
import React from 'react';
import { mount } from 'enzyme';
import { CpuMonitor } from './CpuMonitor';

global.document = jsdom.jsdom('');
global.window = document.defaultView;

describe('components', () => {
  describe('CpuMonitor', () => {
    context('some CPUs are over threshold and some are not', () => {
      it('should call the alert prop with appropriate warnings', () => {
        const alert = expect.createSpy();
        const threshold = Math.floor(Math.random() * 90 + 10);
        const numCPUs = Math.floor(Math.random() * 8 + 2);
        const inverseIdle = [];
        const overloaded = [];
        const generateOverloadedNumber = () =>
          Math.min(Math.random(threshold * 2) + threshold + 1, 100);
        for (let cpu = 0; cpu < numCPUs; ++cpu) {
          if (cpu % 2 === 0) {
            overloaded.push(cpu);
            inverseIdle.push(generateOverloadedNumber());
          } else {
            inverseIdle.push(Math.floor(Math.random() * threshold));
          }
        }


        mount(
          <CpuMonitor
            threshold={threshold}
            alert={alert}
            subscribeToResource={() => {}} // eslint-disable-line react/jsx-no-bind
            data={inverseIdle}
          />
        );

        alert.calls[0].arguments[0].forEach(warning => {
          expect(warning).toMatch({
            diff: /(add)|(remove)/,
            message: String,
            name: /CPU\d/,
          });
          const { diff, name } = warning;

          const cpuNumber = parseInt(/CPU(\d)/.exec(name)[1], 10);
          if (overloaded.indexOf(cpuNumber) !== -1) {
            expect(diff).toEqual('add');
          } else {
            expect(diff).toEqual('remove');
          }
        });
      });
    });

    // just a probably unimportant design decision
    context('a CPU is at threshold exactly', () => {
      it('should alert for it', () => {
        const alert = expect.createSpy();
        const threshold = Math.floor(Math.random() * 90 + 10);
        mount(
          <CpuMonitor
            threshold={threshold}
            alert={alert}
            subscribeToResource={() => {}} // eslint-disable-line react/jsx-no-bind
            data={[threshold]}
          />
        );

        expect(alert.calls[0].arguments[0][0]).toMatch({
          diff: /add/,
        });
      });
    });
  });
});
