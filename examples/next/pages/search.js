import React from "react";
import Link from "next/link";
import { withRouter } from "next/router";
import gql from "graphql-tag";
import { Query } from "@department/apollo-component";

import withApollo from "../components/withApollo";

class Search extends React.Component {
  state = {};

  query = e => {
    this.setState({ q: e.target.value });
  };

  render() {
    return (
      <div>
        <input type="search" value={this.state.q} onChange={this.query} />
        <SearchResult q={this.state.q} />
      </div>
    );
  }
}

const SearchResult = ({ q }) => (
  <div>
    <Query
      gql={SearchQuery}
      variables={{ q }}
      skip={({ q }) => !q || q.length < 2}
    >
      {({ data: { allPosts }, loading, skipped }) =>
        skipped || !allPosts ? (
          <span>
            Enter more than 2 characters (hint: try "he" or "ol" or "lo")
          </span>
        ) : loading ? (
          <span>Getting your stuffs!</span>
        ) : !allPosts.length ? (
          <span>No results...try something shorter</span>
        ) : (
          <ol>
            {allPosts.map(({ id, description }) => (
              <li key={id}>{description}</li>
            ))}
          </ol>
        )
      }
    </Query>
  </div>
);

const SearchQuery = gql`
  query Search($q: String!) {
    allPosts(filter: { description_contains: $q }) {
      id
      description
    }
  }
`;

export default withApollo(Search);
