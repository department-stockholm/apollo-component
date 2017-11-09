import React from "react";
import PropTypes from "prop-types";

export class Provider extends React.Component {
  static childContextTypes = {
    apollo: PropTypes.shape({
      client: PropTypes.object.isRequired,

      // used for server side rendering to keep track of queries to wait for
      // FIXME there must be a way inside the apollo client for this...
      queries: PropTypes.array
    }).isRequired
  };

  getChildContext = () => ({
    apollo: {
      client: this.props.client,
      queries: this.props.queries
    }
  });

  render() {
    return this.props.children;
  }
}
