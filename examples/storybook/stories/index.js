import React from "react";
import gql from "graphql-tag";
import { Provider, Query } from "@department/apollo-component";
import { ApolloClient } from "@department/apollo-component/mock";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import { Button, Welcome } from "@storybook/react/demo";

storiesOf("Welcome", module).add("to Storybook", () => (
  <Welcome showApp={linkTo("Button")} />
));

storiesOf("Query", module)
  .addDecorator(story => (
    <Provider client={new ApolloClient([])}>{story}</Provider>
  ))
  .add("empty", () => (
    <Query gql={}>{({data}) => <span>{data}</span>}</Query>
  ))