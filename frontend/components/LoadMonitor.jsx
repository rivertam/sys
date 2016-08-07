import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import MultiLineGraph from './MultiLineGraph';

const MINUTES = [1, 5, 15];
function numbers(data) {
  if (!data) {
    return <div />;
  }
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
    this.conditionalAlert(this.props);
  }

  componentWillReceiveProps(props) {
    this.conditionalAlert(props);
  }

  conditionalAlert(props) {
    const { data, threshold, alert } = props;
    if (!alert || !data) {
      return;
    }

    const warnings = data.map((d, i) => ({
      diff: d >= threshold ? 'add' : 'remove',
      message: `Load average for past ${MINUTES[i]} is too high at ${d}!`,
      name: `load${i}`,
    }));

    alert(warnings);
  }

  render() {
    const { subscribeToResource, data } = this.props;

    subscribe(subscribeToResource);

    return (
      <div className="tile is-vertical">
        <div className="tile level">
          <h2 className="level-item has-text-centered title is-2">Load Monitoring</h2>
        </div>
        <div className="tile">
          <div>
            <MultiLineGraph data={data} max={this.props.threshold * 1.5} />
          </div>
          <div className="tile is-parent">
            {numbers(data)}
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
  alert: PropTypes.func,
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
