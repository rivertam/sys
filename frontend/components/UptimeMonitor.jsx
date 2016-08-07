import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

// ensures resource doesn't get subscribed to multiple times
// (though the reducer already does that, we can have layers of
// redundancy)
function subscribe(subscribeToResource) {
  if (!subscribe.hasBeen) {
    subscribeToResource('uptime');
  }

  subscribe.hasBeen = true;
}

class UptimeMonitor extends Component {
  readableUptime() {
    const seconds = this.props.uptime;
    // yanked from http://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form
    const splitUp = [
      // I know, I know, magic numbers, right? Annoying
      ['second', (((seconds % 31536000) % 86400) % 3600) % 60],
      ['minute', Math.floor((((seconds % 31536000) % 86400) % 3600) / 60)],
      ['hour', Math.floor(((seconds % 31536000) % 86400) / 3600)],
      ['day', Math.floor((seconds % 31536000) / 86400)],
      ['year', Math.floor(seconds / 31536000)],
    ];

    return splitUp.reduce((list, [label, amount]) => {
      const realLabel = amount !== 1 ? `${label}s` : label;
      if (amount > 0) {
        return [`${amount} ${realLabel}`, ...list];
      }

      return list;
    }, []).join(', ');
  }

  render() {
    subscribe(this.props.subscribeToResource);
    return (
      <div className="tile level">
        <h2 className="level-item has-text-centered title is-1" >
          We&rsquo;ve been up for {this.readableUptime()}
        </h2>
      </div>
    );
  }
}

UptimeMonitor.propTypes = {
  uptime: PropTypes.number,
  subscribeToResource: PropTypes.func.isRequired,
};


function mapStateToProps(state) {
  return {
    uptime: state.uptimeData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    subscribeToResource(resource) {
      dispatch({ type: `SUBSCRIBE_TO_${resource.toUpperCase()}_DATA` });
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UptimeMonitor);
