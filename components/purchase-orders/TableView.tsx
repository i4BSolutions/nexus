import { PurchaseOrderType } from "@/types/purchase-order/po.type";
import { CalendarOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Pagination,
  Space,
  Table,
  TableProps,
  Typography,
} from "antd";
import StatusBadge from "./StatusBadge";

export default function TableView({ data }: { data: PurchaseOrderType[] }) {
  const columns: TableProps<PurchaseOrderType>["columns"] = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "id",
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
      render: (amount) => (
        <div>
          <div>
            <Typography.Text>${amount.toFixed(2)}</Typography.Text>
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
    <section className="py-4">
      <Table<PurchaseOrderType>
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
