import React from "react";
import Router from "next/router";
import gql from "graphql-tag";
import { Query, Mutate } from "@department/apollo-component";
import { Layout as AntLayout } from "antd";

import { Layout } from "components/Layout";
import withApollo from "components/withApollo";
import { PostForm, fragments } from "components/Post";

const New = ({ query: { id } }) => (
  <Layout>
    <Mutate gql={CreatePostMutation} variables={{ id }} fail>
      {(create, { loading }) => (
        <PostForm
          onSubmit={async vars => {
            await create(vars);
            Router.replace("/posts");
          }}
          post={{}}
        />
      )}
    </Mutate>
  </Layout>
);

const CreatePostMutation = gql`
  mutation CreatePost($title: String!, $excerpt: String!) {
    createPost(title: $title, excerpt: $excerpt) {
      id
    }
  }
`;

// TODO can we build a component from the arguments/types of this mutation?
console.log(CreatePostMutation);

export default withApollo(New);
