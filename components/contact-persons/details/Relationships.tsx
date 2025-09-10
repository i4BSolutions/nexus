"use client";

import React from "react";
import { Collapse, CollapseProps } from "antd";
import {
  PlusOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import SectionHeader from "./relationships/SectionHeader";
import RelatedPurchaseOrdersTable from "./relationships/RelatedPurchaseOrdersTable";
import RelatedSuppliersTable from "./relationships/RelatedSuppliersTable";
import RelatedTransactionsTable from "./relationships/RelatedTransactionsTable";

const Relationships: React.FC<{ id: string }> = ({ id }) => {
  const items: CollapseProps["items"] = [
    {
      showArrow: false,
      key: "po",
      label: (
        <SectionHeader
          icon={<ShoppingCartOutlined />}
          title="Related Purchase Order"
          subtitle="Purchase Order linked to this contact person"
          gradient="linear-gradient(90deg, #E6F7FF 0%, rgba(255, 255, 255, 0.00) 100%)"
          borderColor="#91D5FF"
          badgeBg="#40A9FF"
          rightExtra={<PlusOutlined />}
        />
      ),
      children: (
        <div
          style={{ padding: 24, width: "100%", border: "1px solid #F5F5F5" }}
        >
          <RelatedPurchaseOrdersTable id={id} />
        </div>
      ),
      style: {
        margin: "12px 0",
      },
    },
    {
      showArrow: false,
      key: "suppliers",
      label: (
        <SectionHeader
          icon={<ShopOutlined />}
          title="Related Supplier"
          subtitle="Supplier linked to this contact person"
          gradient="linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)"
          borderColor="#D3ADF7"
          badgeBg="#9254DE"
          rightExtra={<PlusOutlined />}
        />
      ),
      children: (
        <div
          style={{ padding: 24, width: "100%", border: "1px solid #F5F5F5" }}
        >
          <RelatedSuppliersTable id={id} />
        </div>
      ),
      style: {
        margin: "12px 0",
      },
    },
    {
      showArrow: false,
      key: "transactions",
      label: (
        <SectionHeader
          icon={<ShopOutlined />}
          title="Related Transaction"
          subtitle="Transaction linked to this contact person"
          gradient="linear-gradient(90deg, #FFFBE6 0%, #FFF 100%)"
          borderColor="#FFE58F"
          badgeBg="#FFC53D"
          rightExtra={<PlusOutlined />}
        />
      ),
      children: (
        <div
          style={{ padding: 24, width: "100%", border: "1px solid #F5F5F5" }}
        >
          <RelatedTransactionsTable id={id} />
        </div>
      ),
      style: {
        margin: "12px 0",
      },
    },
  ];

  return (
    <Collapse
      bordered={false}
      defaultActiveKey={["po"]}
      items={items}
      style={{ padding: 0 }}
    />
  );
};

export default Relationships;
