import React from "react";
import gql from "graphql-tag";
import { Provider, Query, MockClient } from "@department/apollo-component";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

const FakeQuery = gql`
  query GetStuff {
    stuff {
      id
    }
  }
`;

storiesOf("Query", module)
  .addDecorator(story => (
    <Provider client={new MockClient([])}>{story}</Provider>
  ))
  .add("empty", () => (
    <Query gql={FakeQuery}>
      {({ data: { stuff }, loading, error }) => (
        <span>{loading ? "loading..." : error ? "error" : stuff.id}</span>
      )}
    </Query>
  ));
