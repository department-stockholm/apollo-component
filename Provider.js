import React from "react";
import PropTypes from "prop-types";

export class Provider extends React.Component {
  getChildContext() {
    let { client, queued } = this.props;
    const { apollo } = this.context;
    // pass through parent queries if there are any
    // this way the Provider may be nested and still
    // be able to track the proper queries
    if (apollo && apollo.queued) {
      queued = apollo.queued;
    }
    return {
      apollo: {
        client,
        queued
      }
    };
  }

  render() {
    return this.props.children;
  }
}

Provider.contextTypes = {
  apollo: PropTypes.shape({
    queued: PropTypes.array
  })
};

Provider.childContextTypes = {
  apollo: PropTypes.shape({
    client: PropTypes.object.isRequired,

    // used for server side rendering to keep track of queries to wait for
    // FIXME there must be a way inside the apollo client for this...
    queued: PropTypes.array
  }).isRequired
};
