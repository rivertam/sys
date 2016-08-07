import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

function Warnings(props) {
  return (
    <div>
      {(props.warnings || []).map(({ message, name }) =>
        <div key={name}>
          {name}: {message}
        </div>
      )}
    </div>
  );
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
