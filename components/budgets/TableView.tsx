import { Budget, BudgetResponse } from "@/types/budgets/budgets.type";
import { CalendarOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Pagination,
  Space,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React from "react";

export default function TableView({ data }: { data: Budget[] }) {
  const columns: TableProps<Budget>["columns"] = [
    {
      title: "BUDGET NAME",
      dataIndex: "budget_name",
      key: "budget_name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "PROJECT NAME",
      dataIndex: "project_name",
      key: "project_name",
    },
    {
      title: "START DATE",
      dataIndex: "start_date",
      key: "start_date",
      render: (start_date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          <span>{dayjs(start_date).format("MMM D, YYYY")}</span>
        </div>
      ),
    },
    {
      title: "END DATE",
      dataIndex: "end_date",
      key: "end_date",
      render: (end_date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          <span>{dayjs(end_date).format("MMM D, YYYY")}</span>
        </div>
      ),
    },
    {
      title: "PLANNED AMOUNT USD",
      dataIndex: "planned_amount_usd",
      key: "planned_amount_usd",
      render: (planned_amount_usd) => (
        <div>
          <div>
            <Typography.Text>${planned_amount_usd}</Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary">
              (${planned_amount_usd.toLocaleString("en-US")})
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">View</Button>
          <Divider type="vertical" />
          <Button type="link">Edit</Button>
        </Space>
      ),
    },
  ];
  return (
    <section className="py-1">
      <Table<Budget>
        columns={columns}
        dataSource={data}
        rowKey={"id"}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        pagination={false}
        footer={() => (
          <div className="flex justify-between">
            <Typography.Text type="secondary">
              Total {data.length} items
            </Typography.Text>
            <Pagination defaultCurrent={1} total={data.length} />
          </div>
        )}
      />
    </section>
  );
}
