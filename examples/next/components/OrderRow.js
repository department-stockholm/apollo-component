import React from "react";
import gql from "graphql-tag";
import Link from "next/link";

export const LoadingOrderRow = ({ offset }) => <div className="loading" />;

export const OrderRow = ({ id, name }) => (
  <div>
    <Link href={`?id=${id}`}>
      <a>{name}</a>
    </Link>
  </div>
);

OrderRow.fragments = {
  OrderRow: gql`
    fragment OrderRow on Order {
      id
      name
    }
  `
};
