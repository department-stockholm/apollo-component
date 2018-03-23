import React from "react";
import gql from "graphql-tag";
import Link from "next/link";

export const LoadingOrderRow = ({}) => <div className="loading" />;

export const OrderRow = ({ id, name }) => (
  <div>
    <Link href={`?id=${id}`}>
      <a>{name}</a>
    </Link>
  </div>
);

export const fragments = {
  OrderRow: gql`
    fragment OrderRow on Order {
      id
      name
    }
  `
};
