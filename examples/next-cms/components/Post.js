import React from "react";
import gql from "graphql-tag";
import { Form, Input, Button } from "antd";
const FormItem = Form.Item;

class PostFormView extends React.Component {
  onSubmit = e => {
    const { form, post, onSubmit } = this.props;
    e.preventDefault();

    form.validateFields((err, values) => {
      if (!err) {
        onSubmit({
          id: post.id,
          ...values
        });
      }
    });
  };

  render() {
    const { post } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.onSubmit}>
        <FormItem>
          {getFieldDecorator("title", {
            initialValue: post.title,
            rules: [
              { required: true, message: "Please input a title for the post" }
            ]
          })(<Input placeholder="Title" />)}
        </FormItem>

        <FormItem>
          {getFieldDecorator("excerpt", {
            initialValue: post.excerpt
          })(<Input.TextArea placeholder="Excerpt" />)}
        </FormItem>

        <Button type="primary" htmlType="submit" className="login-form-button">
          {post.id ? "Update" : "Create"}
        </Button>
      </Form>
    );
  }
}
export const PostForm = Form.create()(PostFormView);

export const fragments = {
  EditPost: gql`
    fragment EditPost on Post {
      id
      title
      excerpt
    }
  `
};
