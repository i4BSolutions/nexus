import { PoBudgetAllocationInterface } from "@/types/purchase-order/purchase-order-detail.type";
import { CalendarOutlined } from "@ant-design/icons";
import { Button, Flex, Pagination, Table, TableProps, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import StatusBadge from "../StatusBadge";

export default function PoBudgetAllocationTable({
  data,
  total,
  pagination,
  paginationChangeHandler,
}: {
  data: PoBudgetAllocationInterface[];
  total: number;
  pagination: { page: number; pageSize: number };
  paginationChangeHandler: (page: number, pageSize?: number) => void;
}) {
  const router = useRouter();
  const columns: TableProps<PoBudgetAllocationInterface>["columns"] = [
    {
      title: "BUDGET ALLOCATIONS",
      dataIndex: "budget_no",
      key: "budget_no",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "DATE",
      dataIndex: "allocation_date",
      key: "allocation_date",
      render: (allocation_date) => (
        <div>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {dayjs(allocation_date).format("MMM D, YYYY")}
        </div>
      ),
    },
    {
      title: "AMOUNT",
      dataIndex: "allocated_amount_local",
      key: "allocated_amount_local",
      render: (_, record) => (
        <div>
          <div>
            <Typography.Text>
              {record.allocated_amount_local.toLocaleString()}{" "}
              {record.currency_code}
            </Typography.Text>
          </div>
          <div>
            <Typography.Text type="secondary">
              (${record.allocated_amount_usd.toLocaleString("en-US")})
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
          <Button
            style={{ padding: 0 }}
            type="link"
            onClick={() =>
              router.push(`/budget-allocations/${record.budget_no}`)
            }
          >
            View
          </Button>
        </Flex>
      ),
    },
  ];

  return (
    <section className="py-4 px-6 mb-4">
      <Table<PoBudgetAllocationInterface>
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
              pageSize={pagination.pageSize}
              total={total}
              onChange={paginationChangeHandler}
            />
          </div>
        )}
      />
    </section>
  );
}
