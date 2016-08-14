import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import MultiLineGraph from './MultiLineGraph';

function numbers(data) {
  if (!data) {
    return <div />;
  }
  return (<div className="tile is-child level">
    {data.map((d, i) => (
      <div className="level-item has-text-centered" key={i}>
        <h4 className={`graph-heading-${i} heading`}>CPU #{i}</h4>
        <h2 className="title">{Math.round(d)}%</h2>
      </div>
    ))}
  </div>);
}

function subscribe(subscribeToResource) {
  if (!subscribe.hasBeen) {
    subscribeToResource('cpu');
  }

  subscribe.hasBeen = true;
}


export class CpuMonitor extends Component {
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
      message: `CPU #${i} is overburdened at ${d}%!`,
      name: `CPU${i}`,
    }));

    alert(warnings);
  }

  render() {
    const { subscribeToResource, data } = this.props;

    subscribe(subscribeToResource);

    return (
      <div className="tile is-vertical">
        <div className="tile level">
          <h2 className="level-item has-text-centered title is-2">CPU Usage</h2>
        </div>
        <div className="tile">
          <div>
            <MultiLineGraph data={data} max={100} />
          </div>
          <div className="tile is-parent">
            {numbers(data)}
          </div>
        </div>
      </div>
    );
  }
}

CpuMonitor.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  subscribeToResource: PropTypes.func.isRequired,
  threshold: PropTypes.number.isRequired,
  alert: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    data: state.cpuData,
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
)(CpuMonitor);
