import React from "react";
import gql from "graphql-tag";
import { Form, Input, Button } from "antd";

class FileFormView extends React.Component {
  onSubmit = e => {
    const { form, file, onSubmit } = this.props;
    e.preventDefault();

    form.validateFields((err, values) => {
      if (!err) {
        onSubmit({
          id: file.id,
          ...values
        });
      }
    });
  };

  render() {
    const { file, onDestroy } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.onSubmit}>
        <Form.Item>
          {getFieldDecorator("name", {
            initialValue: file.name,
            rules: [
              { required: true, message: "Please input a name for the asset" }
            ]
          })(<Input placeholder="Name" />)}
        </Form.Item>

        <Button type="primary" htmlType="submit" className="login-form-button">
          {post.id ? "Update" : "Create"}
        </Button>

        {onDestroy ? (
          <Button
            type="danger"
            onClick={onDestroy}
            className="login-form-button"
          >
            Destroy
          </Button>
        ) : null}
      </Form>
    );
  }
}
export const FileForm = Form.create()(FileFormView);

export const fragments = {
  EditFile: gql`
    fragment EditFile on File {
      id
      contentType
      name
      size
      url
    }
  `
};
