import React from "react";
import gql from "graphql-tag";
import { Query, Mutate } from "@department/apollo-component";

import { Layout } from "components/Layout";
import withApollo from "components/withApollo";
import { PostForm, fragments } from "components/Post";

const Edit = ({ query: { id } }) => (
  <Layout>
    <Mutate gql={DeletePostMutation} variables={{ id }} fail>
      {(destroy, destroying) => (
        <Mutate gql={UpdatePostMutation} refetchQueries={["GetPost"]} fail>
          {(update, updating) => (
            <Query gql={GetPostQuery} variables={{ id }} wait fail>
              {({ data: { Post } }) => (
                <PostForm onSubmit={update} post={Post} />
              )}
            </Query>
          )}
        </Mutate>
      )}
    </Mutate>
  </Layout>
);

const GetPostQuery = gql`
  query GetPost($id: ID!) {
    Post(id: $id) {
      ...EditPost
    }
  }
  ${fragments.EditPost}
`;

const DeletePostMutation = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      id
    }
  }
`;

const UpdatePostMutation = gql`
  mutation UpdatePost($id: ID!, $title: String!, $excerpt: String) {
    updatePost(id: $id, title: $title, excerpt: $excerpt) {
      id
    }
  }
`;

// TODO can we build a component from the arguments/types of this mutation?
console.log(UpdatePostMutation);

export default withApollo(Edit);
