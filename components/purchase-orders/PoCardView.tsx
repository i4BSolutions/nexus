import { useUpdate } from "@/hooks/react-query/useUpdate";
import { PurchaseOrderDto } from "@/types/purchase-order/purchase-order.type";
import {
  CheckCircleOutlined,
  CheckOutlined,
  DollarOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  HourglassOutlined,
  InfoCircleOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
  App,
  Button,
  Col,
  Dropdown,
  Flex,
  Pagination,
  Progress,
  Row,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";

export default function PoCardView({
  data,
  pagination,
  total,
  paginationChangeHandler,
  hasPermission = false,
}: {
  data: PurchaseOrderDto[];
  pagination: { page: number; pageSize: number };
  total: number;
  paginationChangeHandler: (page: number, pageSize?: number) => void;
  hasPermission?: boolean;
}) {
  const { message } = App.useApp();
  const router = useRouter();
  const updateStatus = useUpdate(`purchase-orders`);

  return (
    <section className="py-6 w-full max-w-[1140px]">
      <div className="grid grid-cols-3 items-center w-full gap-5">
        {data.map((item: PurchaseOrderDto) => {
          const items: MenuProps["items"] = [
            {
              label: <div className="text-sm !w-32">View</div>,
              key: "view",
              icon: <EyeOutlined />,
              onClick: () => {
                router.push(`/purchase-orders/${item.id}`);
              },
            },
          ];

          if (item.status === "Draft" && hasPermission) {
            items.push(
              {
                label: <span className="text-sm !w-32">Edit</span>,
                key: "edit",
                icon: <EditOutlined />,
                onClick: () => {
                  router.push(`/purchase-orders/${item.id}/edit`);
                },
              },
              {
                label: (
                  <span className="text-sm !w-32 text-[#52C41A]">Approve</span>
                ),
                key: "approve",
                icon: <CheckOutlined style={{ color: "#52C41A" }} />,
                onClick: async () => {
                  await updateStatus.mutateAsync(
                    {
                      data: { status: "Approved", reason: "Approve PO" },
                      id: item.id.toString(),
                    },
                    {
                      onSuccess: () => {
                        message.success("Purchase order approved successfully");
                      },
                      onError: (error: any) => {
                        message.error(
                          error?.message || "Failed to approve purchase order"
                        );
                      },
                    }
                  );
                },
              }
            );
          } else if (item.status === "Approved" && hasPermission) {
            items.push(
              {
                label: <span className="text-sm !w-32">Edit</span>,
                key: "edit",
                icon: <EditOutlined />,
                onClick: () => {
                  router.push(`/purchase-orders/${item.id}/edit`);
                },
              },
              {
                label: (
                  <span className="text-sm !w-32 text-[#FAAD14]">
                    Cancel Approval
                  </span>
                ),
                key: "cancel approval",
                icon: <RollbackOutlined style={{ color: "#FAAD14" }} />,
                onClick: async () => {
                  await updateStatus.mutateAsync(
                    {
                      data: { status: "Draft", reason: "Cancel Approval" },
                      id: item.id.toString(),
                    },
                    {
                      onSuccess: () => {
                        message.success(
                          "Purchase order approval cancelled successfully"
                        );
                      },
                      onError: (error: any) => {
                        message.error(
                          error?.message ||
                            "Failed to update purchase order status"
                        );
                      },
                    }
                  );
                },
              }
            );
          }

          return (
            <div
              key={item.id}
              className="border-2 border-[#F5F5F5] rounded-[16px] w-full"
            >
              <div
                className="py-3 rounded-t-[14px]"
                style={{
                  background: "linear-gradient(90deg, #E6F7FF 0%, #FFF 100%)",
                }}
              >
                <Row style={{ paddingLeft: 12 }}>
                  <Col span={4} className="!grid !place-items-center">
                    <DollarOutlined
                      style={{
                        width: 32,
                        height: 32,
                        background: "#40A9FF",
                        borderRadius: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "white",
                        fontSize: 20,
                      }}
                    />
                  </Col>
                  <Col span={16}>
                    <div className="flex items-center gap-1.5">
                      <Typography.Text className="!text-xl !font-semibold">
                        {item.purchase_order_no}
                      </Typography.Text>
                      {item.status == "Draft" ? (
                        <HourglassOutlined />
                      ) : item.status == "Approved" ? (
                        <CheckCircleOutlined style={{ color: "#52C41A" }} />
                      ) : (
                        <></>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Typography.Text
                        className="text-sm"
                        style={{ color: "rgba(0, 0, 0, 0.45)" }}
                      >
                        {dayjs(item.order_date).format("MMM D, YYYY")}
                      </Typography.Text>
                      <StatusBadge status={item.purchase_order_smart_status} />
                    </div>
                  </Col>
                  <Col span={4} className="!grid !place-items-center">
                    <Dropdown
                      menu={{ items }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        icon={<EllipsisOutlined />}
                        loading={updateStatus.isPending}
                      />
                    </Dropdown>
                  </Col>
                </Row>
              </div>
              <div className="px-6 py-4 !space-y-2">
                <div className="m-0">
                  <Typography.Text type="secondary">Amount</Typography.Text>
                  <p
                    className="text-[30px] font-[500] m-0"
                    style={{ lineHeight: "32px" }}
                  >
                    {formatWithThousandSeparator(item.amount_local)}{" "}
                    {item.currency_code}
                  </p>
                  <Typography.Text type="secondary">
                    (${formatWithThousandSeparator(item.amount_usd)})
                  </Typography.Text>
                </div>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Typography.Text type="secondary">
                      Contact Person
                    </Typography.Text>
                  </div>
                  <div>
                    <p className="m-0 font-medium text-base">
                      {item.contact_person}
                    </p>
                  </div>
                </Flex>
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Typography.Text type="secondary">
                      Expected Delivery
                    </Typography.Text>
                  </div>
                  <div>
                    <p className="m-0 font-medium text-base">
                      {dayjs(item.expected_delivery_date).format("MMM D, YYYY")}
                    </p>
                  </div>
                </Flex>
                <Row>
                  <Col span={12}>
                    <Typography.Text type="secondary" className="align-middle">
                      Invoiced(USD){" "}
                      <Tooltip title="Total amount invoiced in USD">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Typography.Text>
                    <p className="m-0 font-medium text-base">
                      $
                      {item.invoiced_amount
                        ? formatWithThousandSeparator(item.invoiced_amount)
                        : 0}
                    </p>
                  </Col>
                  <Col span={12}>
                    <Typography.Text type="secondary" className="align-middle">
                      Remaining(USD){" "}
                      <Tooltip title="Total amount remaining in USD">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Typography.Text>
                    <p className="m-0 font-medium text-base">
                      $
                      {item.remaining_invoiced_amount
                        ? formatWithThousandSeparator(
                            item.remaining_invoiced_amount
                          )
                        : 0}
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Progress percent={item.invoiced_percentage} />
                </Row>
                <Row>
                  <Col span={12}>
                    <Typography.Text type="secondary" className="align-middle">
                      Allocated(USD){" "}
                      <Tooltip title="Total amount allocated in USD">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Typography.Text>

                    <p className="m-0 font-medium text-base">
                      $
                      {item.allocated_amount
                        ? formatWithThousandSeparator(item.allocated_amount)
                        : 0}
                    </p>
                  </Col>
                  <Col span={12}>
                    <Typography.Text type="secondary" className="align-middle">
                      Remaining(USD){" "}
                      <Tooltip title="Total amount remaining in USD">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Typography.Text>
                    <p className="m-0 font-medium text-base">
                      $
                      {item.remaining_allocation
                        ? formatWithThousandSeparator(item.remaining_allocation)
                        : 0}
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Progress
                    percent={item.allocation_percentage}
                    strokeColor={
                      item.allocation_percentage &&
                      item.allocation_percentage < 100
                        ? "#9254DE"
                        : "#52C41A"
                    }
                  />
                </Row>
              </div>
            </div>
          );
        })}
      </div>

      <Flex
        justify="space-between"
        align="center"
        className="!pb-10 !pt-6"
        style={{ alignSelf: "end" }}
      >
        <div>
          <Typography.Text type="secondary">
            Total {total} items
          </Typography.Text>
        </div>
        <Pagination
          defaultCurrent={1}
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onChange={paginationChangeHandler}
        />
      </Flex>
    </section>
  );
}
