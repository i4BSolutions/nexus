import { PurchaseOrderDto } from "@/types/purchase-order/purchase-order.type";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  HourglassOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Flex,
  Pagination,
  Table,
  TableProps,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

export default function PoTableView({
  data,
  total,
  pagination,
  paginationChangeHandler,
  hasPermission = false,
}: {
  data: PurchaseOrderDto[];
  total: number;
  pagination: { page: number; pageSize: number };
  paginationChangeHandler: (page: number, pageSize?: number) => void;
  hasPermission?: boolean;
}) {
  const router = useRouter();

  const columns: TableProps<PurchaseOrderDto>["columns"] = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "purchase_order_no",
      key: "id",
      render: (text, record) => (
        <div className="flex items-center gap-1.5">
          <a>{text}</a>
          {record.status == "Draft" ? (
            <HourglassOutlined />
          ) : record.status == "Approved" ? (
            <CheckCircleOutlined style={{ color: "#52C41A" }} />
          ) : (
            <></>
          )}
        </div>
      ),
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
          {dayjs(order_date).format("MMM D, YYYY")}
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
          {dayjs(expected_delivery_date).format("MMM D, YYYY")}
        </div>
      ),
    },
    {
      title: "AMOUNT",
      dataIndex: "amount_local",
      key: "amount_local",
      render: (amount, record) => (
        <div>
          <div>
            <Typography.Text>
              {amount.toFixed(2)} {record.currency_code}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary">
              (${record.amount_usd.toLocaleString("en-US")})
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "purchase_order_smart_status",
      key: "purchase_order_smart_status",
      render: (purchase_order_smart_status) => (
        <StatusBadge status={purchase_order_smart_status} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Flex justify="start" align="center" gap={4}>
          <Button
            style={{ padding: 0 }}
            type="link"
            onClick={() => router.push(`/purchase-orders/${record.id}`)}
          >
            View
          </Button>
          {hasPermission && (
            <>
              <Divider type="vertical" />
              <Button
                style={{ padding: 0 }}
                type="link"
                onClick={() =>
                  router.push(`/purchase-orders/${record.id}/edit`)
                }
              >
                Edit
              </Button>
            </>
          )}
        </Flex>
      ),
    },
  ];

  return (
    <section className="py-4 w-full max-w-[1140px]">
      <Table<PurchaseOrderDto>
        columns={columns}
        dataSource={data}
        showSorterTooltip={{ target: "sorter-icon" }}
        rowKey={"id"}
        style={{ border: "2px solid #F5F5F5", borderRadius: "8px" }}
        pagination={false}
        footer={() => (
          <div className="flex justify-between">
            <Typography.Text type="secondary">
              Total {total} items
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
