import React from "react";
import Link from "next/link";
import { withRouter } from "next/router";
import gql from "graphql-tag";
import { Query } from "@department/apollo-component";

import withApollo from "../components/withApollo";

const Directory = ({ parent, ...props }) => (
  <Query
    gql={ListDirectoriesQuery}
    variables={{ parent: parent ? { id: parent } : null }}
    {...props}
  >
    {({ data: { allDirectories }, error, loading, refetch, fetchMore }) =>
      loading ? (
        Array.from({ length: 5 }).map((_, i) => <LoadingItem key={i} />)
      ) : error ? (
        <span>{error.message || error}</span>
      ) : (
        <ol>
          {allDirectories.map(dir => (
            <li key={dir.id}>
              {dir.name} <button onClick={refetch}>⟳</button>{" "}
              <Directory parent={dir.id} lazy />
            </li>
          ))}
        </ol>
      )
    }
  </Query>
);

const LoadingItem = ({}) => (
  <div>
    <style jsx>{`
      div {
        background: gray;
        height: 1em;
      }
    `}</style>
  </div>
);

const ListDirectoriesQuery = gql`
  query ListDirectories($parent: DirectoryFilter) {
    allDirectories(filter: { parent: $parent }) {
      id
      name
    }
  }
`;

export default withApollo(Directory);
