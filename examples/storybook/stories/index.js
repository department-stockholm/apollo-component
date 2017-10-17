import React from "react";
import gql from "graphql-tag";
import { Provider, MockClient, Query } from "apollo-component";

import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { linkTo } from "@storybook/addon-links";

import { Button, Welcome } from "@storybook/react/demo";

storiesOf("Welcome", module).add("to Storybook", () => (
  <Welcome showApp={linkTo("Button")} />
));

storiesOf("Query", module)
  .addDecorator(story => (
    <Provider client={new MockClient([])}>{story}</Provider>
  ))
  .add("empty", () => (
    <Query gql={}>{({data}) => <span>{data}</span>}</Query>
  ))