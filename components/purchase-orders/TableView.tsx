import { GetPurchaseOrderDto } from "@/types/purchase-order/purchase-order.type";
import { CalendarOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Flex,
  Pagination,
  Table,
  TableProps,
  Typography,
} from "antd";
import StatusBadge from "./StatusBadge";

export default function TableView({
  data,
  total,
  pagination,
  paginationChangeHandler,
}: {
  data: GetPurchaseOrderDto[];
  total: number;
  pagination: { page: number; pageSize: number };
  paginationChangeHandler: (page: number, pageSize?: number) => void;
}) {
  const columns: TableProps<GetPurchaseOrderDto>["columns"] = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "purchase_order_no",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "CONTACT PERSON",
      dataIndex: "contact_person",
      key: "contact_person",
    },
    {
      title: "ORDER DATE",
      dataIndex: "order_date",
      key: "order_date",
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        new Date(a.order_date).getTime() - new Date(b.order_date).getTime(),
      render: (order_date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          <span>{new Date(order_date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      title: "EXPECTED DELIVERY DATE",
      dataIndex: "expected_delivery_date",
      key: "expected_delivery_date",
      render: (expected_delivery_date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          <span>{new Date(expected_delivery_date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      title: "AMOUNT",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <div>
          <div>
            <Typography.Text>
              {amount.toFixed(2)} {record.currency_code}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary">
              (${amount.toLocaleString("en-US")})
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Flex justify="start" align="center" gap={4}>
          <Button style={{ padding: 0 }} type="link">
            View
          </Button>
          <Divider type="vertical" />
          <Button style={{ padding: 0 }} type="link">
            Edit
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <section className="py-4">
      <Table<GetPurchaseOrderDto>
        columns={columns}
        dataSource={data}
        showSorterTooltip={{ target: "sorter-icon" }}
        rowKey={"id"}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        pagination={false}
        footer={() => (
          <div className="flex justify-between">
            <Typography.Text type="secondary">
              Total {data.length} items
            </Typography.Text>
            <Pagination
              defaultCurrent={1}
              current={pagination.page}
              total={total}
              onChange={paginationChangeHandler}
            />
          </div>
        )}
      />
    </section>
  );
}
