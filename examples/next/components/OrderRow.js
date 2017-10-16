import React from "react";
import gql from "graphql-tag";
import Link from "next/link";

export const LoadingOrderRow = ({ offset }) => <span className="loading" />;

export const OrderRow = ({ id, name }) => (
  <Link href={`?id=${id}`}>
    <a>{name}</a>
  </Link>
);

OrderRow.fragments = {
  OrderRow: gql`
    fragment OrderRow on Order {
      id
      name
    }
  `
};
