import React from "react";
import PropTypes from "prop-types";

export class Provider extends React.Component {
  static childContextTypes = {
    apollo: PropTypes.shape({
      client: PropTypes.object.isRequired
    }).isRequired
  };

  getChildContext = () => ({
    apollo: {
      client: this.props.client
    }
  });

  render() {
    return this.props.children;
  }
}
