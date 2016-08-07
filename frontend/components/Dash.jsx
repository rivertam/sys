import React, { Component, PropTypes } from 'react';
import UptimeMonitor from './UptimeMonitor';
import CpuMonitor from './CpuMonitor';
import LoadMonitor from './LoadMonitor';
import Warnings from './Warnings';

export default class Dash extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="header">
          <div className="container">
            <h1 className="title is-1">Uptime dashboard</h1>
          </div>
        </div>
        <div className="section">
          <div className="container">
            <Warnings />
          </div>
        </div>
        <div className="section">
          <div className="fluid-container">
            <div className="tile is-ancestor">
              <UptimeMonitor />
            </div>
          </div>
        </div>
        <div className="section">
          <div className="fluid-container">
            <div className="tile is-ancestor">
              <CpuMonitor threshold={80} />
            </div>
          </div>
        </div>
        <div className="section">
          <div className="fluid-container">
            <div className="tile is-ancestor">
              <LoadMonitor threshold={5} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
