import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import MultiLineGraph from './MultiLineGraph';

const MINUTES = [1, 2, 5, 15];
function numbers(data) {
  return (<div className="tile is-child level">
    {data.map((d, i) => (
      <div className="level-item has-text-centered" key={i}>
        <h4 className="heading">Load average <br /> {MINUTES[i]} minutes</h4>
        <h2 className="title">{d.toFixed(2)}</h2>
      </div>
    ))}
  </div>);
}

// ensures resource doesn't get subscribed to multiple times
// (though the reducer already does that, we can have layers of
// redundancy)
function subscribe(subscribeToResource) {
  if (!subscribe.hasBeen) {
    subscribeToResource('load');
  }

  subscribe.hasBeen = true;
}

export class LoadMonitor extends Component {
  componentDidMount() {
    this.calculateLastTwoMinuteLoadAverage(this.props);
    this.conditionalAlert(this.props);
  }

  componentWillReceiveProps(props) {
    this.calculateLastTwoMinuteLoadAverage(props);
    this.conditionalAlert(props);
  }

  getData(props) {
    if (!props.data) {
      return [0, 0, 0, 0];
    }

    const d = props.data.slice();
    d.splice(1, 0, this.twoMinuteAverageLoad || 0);
    return d;
  }

  _minuteLoadAveragesByMS = new Map()

  conditionalAlert(props) {
    const { alert, threshold } = props;
    const warnings = this.getData(props).map((d, i) => ({
      diff: d >= threshold ? 'add' : 'remove',
      message: `Load average for past ${MINUTES[i]} minutes is too high at ${d}!`,
      name: `load${i}`,
    }));

    alert(warnings);
  }

  calculateLastTwoMinuteLoadAverage(props) {
    if (!props.data) {
      return;
    }

    // this function is weird as hell
    // had to do this because I couldn't figure out how to get this
    // from linux utils or anything
    const now = new Date();
    const nowMS = now.getTime();
    const minuteAgoMS = nowMS - 60 * 1000;
    // find nearest data to 1 minute ago that we have
    let minuteAgoLoad = null;
    let nearestTimeDifference = Infinity;
    this._minuteLoadAveragesByMS.forEach((load, ms) => {
      const timeDifference = Math.abs(ms - minuteAgoMS);
      if (timeDifference < nearestTimeDifference) {
        nearestTimeDifference = timeDifference;
        minuteAgoLoad = load;
      }
    });

    this._minuteLoadAveragesByMS.set(nowMS, props.data[0]);
    this.twoMinuteAverageLoad = (minuteAgoLoad + props.data[0]) / 2;
  }

  render() {
    const { subscribeToResource } = this.props;

    subscribe(subscribeToResource);

    return (
      <div className="tile is-vertical">
        <div className="tile level">
          <h2 className="level-item has-text-centered title is-2">Load Monitoring</h2>
        </div>
        <div className="tile">
          <div>
            <MultiLineGraph
              data={this.getData(this.props)}
              max={this.props.threshold * 1.5}
            />
          </div>
          <div className="tile is-parent">
            {numbers(this.getData(this.props))}
          </div>
        </div>
      </div>
    );
  }
}

LoadMonitor.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  subscribeToResource: PropTypes.func.isRequired,
  threshold: PropTypes.number.isRequired,
  alert: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    data: state.loadData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    subscribeToResource(resource) {
      dispatch({ type: `SUBSCRIBE_TO_${resource.toUpperCase()}_DATA` });
    },
    alert(message) {
      dispatch({ type: 'ALERT', payload: message });
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadMonitor);
