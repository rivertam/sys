import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

class WarningMessage {
  constructor({ message, name, effectiveAt = new Date(), resolvedAt = false }) {
    this.message = message;
    this.name = name;
    this.effectiveAt = effectiveAt;
    this.resolvedAt = resolvedAt;
  }

  resolved() {
    return new WarningMessage({ ...this, resolvedAt: new Date() });
  }
}

function ResolvedWarningMessageComponent({ msg }) {
  return (
    <div className="resolved-warning">
      <span className="effective-at">{moment(msg.effectiveAt).fromNow()}</span>
      <span className="resolved-at"> (resolved {moment(msg.resolvedAt).fromNow()})</span>
      <span>: {msg.message}</span>
    </div>
  );
}

function UnresolvedWarningMessageComponent({ msg }) {
  return (
    <div className="unresolved-warning">
      <span className="effective-at">{moment(msg.effectiveAt).fromNow()}</span>
      <span>: {msg.message}</span>
    </div>
  );
}

function WarningMessageComponent({ msg }) {
  if (msg.resolvedAt) {
    return <ResolvedWarningMessageComponent msg={msg} />;
  }

  return <UnresolvedWarningMessageComponent msg={msg} />;
}

class Warnings extends Component {
  state = {
    messages: [],
  }

  componentWillReceiveProps(newProps) {
    this.tentativeState = this.tentativeState || this.state;
    const newWarnings = newProps.warnings || [];
    const oldWarnings = this.tentativeState.messages.filter(msg => !msg.resolvedAt);
    const brandNewWarnings =
      newWarnings.filter(({ name }) => !oldWarnings.find(w => w.name === name));
    const outdatedWarnings =
      oldWarnings.filter(({ name }) => !newWarnings.find(w => w.name === name));

    brandNewWarnings.forEach(::this.addNewWarning);
    outdatedWarnings.forEach(::this.resolveWarning);
    this.tentativeState.messages.sort((m1, m2) => m1.effectiveAt > m2.effectiveAt);
    this.setState(this.tentativeState);
  }

  addNewWarning(warning) {
    this.tentativeState = {
      messages: [
        ...this.tentativeState.messages,
        new WarningMessage(warning),
      ],
    };
  }

  resolveWarning(warning) {
    const newMessages = this.tentativeState.messages.map(msg => {
      if (msg.name === warning.name) {
        return msg.resolved();
      }

      return msg;
    });

    this.tentativeState.messages = newMessages;
  }

  render() {
    return (
      <div>
        {(this.state.messages).map(msg => (
          <div key={`${msg.name} ${msg.effectiveAt.toString()}`}>
            <WarningMessageComponent msg={msg} />
          </div>
        ))}
      </div>
    );
  }
}

Warnings.propTypes = {
  warnings: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
  })),
};

export default connect(
  s => ({ warnings: s.warnings })
)(Warnings);
