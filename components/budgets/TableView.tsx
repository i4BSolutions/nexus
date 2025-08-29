import { Budget } from "@/types/budgets/budgets.type";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";
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

export default function TableView({
  data,
  hasPermission,
}: {
  data: Budget[];
  hasPermission?: boolean;
}) {
  const columns: TableProps<Budget>["columns"] = [
    {
      title: "BUDGET NAME",
      dataIndex: "budget_name",
      key: "budget_name",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "PROJECT NAME",
      dataIndex: "project_name",
      key: "project_name",
    },
    {
      title: "PLANNED AMOUNT",
      dataIndex: "planned_amount_usd",
      key: "planned_amount_usd",
      sorter: (a, b) => a.planned_amount_usd - b.planned_amount_usd,
      render: (planned_amount_usd) => (
        <div>
          <span>{formatWithThousandSeparator(planned_amount_usd)}</span>
        </div>
      ),
    },
    {
      title: "ALLOCATED",
      dataIndex: "allocated_amount_usd",
      key: "allocated_amount_usd",
      sorter: (a, b) =>
        (a.allocated_amount_usd ?? 0) - (b?.allocated_amount_usd ?? 0),
      render: (allocated_amount_usd) => (
        <Typography.Text type="secondary">
          {formatWithThousandSeparator(allocated_amount_usd)}
        </Typography.Text>
      ),
    },
    {
      title: "INVOICED",
      dataIndex: "invoiced_amount_usd",
      key: "invoiced_amount_usd",
      sorter: (a, b) =>
        (a.invoiced_amount_usd ?? 0) - (b.invoiced_amount_usd ?? 0),
      render: (invoiced_amount_usd) => (
        <Typography.Text type="secondary">
          {formatWithThousandSeparator(invoiced_amount_usd)}
        </Typography.Text>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">View</Button>
          {hasPermission && (
            <>
              <Divider type="vertical" />
              <Button type="link">Edit</Button>
            </>
          )}
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
