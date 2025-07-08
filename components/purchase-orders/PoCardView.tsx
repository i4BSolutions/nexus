import { PurchaseOrderDto } from "@/types/purchase-order/purchase-order.type";
import {
  DollarOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  InfoOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import {
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
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";

export default function PoCardView({
  data,
  pagination,
  total,
  paginationChangeHandler,
}: {
  data: PurchaseOrderDto[];
  pagination: { page: number; pageSize: number };
  total: number;
  paginationChangeHandler: (page: number, pageSize?: number) => void;
}) {
  const router = useRouter();

  return (
    <section className="py-4">
      <div className="flex flex-wrap gap-4">
        {data.map((item: PurchaseOrderDto) => {
          const items: MenuProps["items"] = [
            {
              label: <div className="text-sm !w-32">View</div>,
              key: "view",
              icon: <EyeOutlined />,
              onClick: () => {
                router.push(`/purchase-orders/${item.purchase_order_no}`);
              },
            },
            {
              label: <span className="text-sm !w-32">Edit</span>,
              key: "edit",
              icon: <EditOutlined />,
              onClick: () => {
                router.push(`/purchase-orders/${item.purchase_order_no}/edit`);
              },
            },
          ];
          return (
            <div
              key={item.id}
              className="border-2 border-[#F5F5F5] rounded-[16px] w-[320px]"
            >
              <div
                className="py-3 rounded-t-[14px]"
                style={{
                  background: "linear-gradient(90deg, #E6F7FF 0%, #FFF 100%)",
                }}
              >
                <Row>
                  <Col span={6} className="!grid !place-items-center">
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
                  <Col span={12}>
                    <Typography.Text className="!text-xl !font-semibold">
                      {item.purchase_order_no}
                    </Typography.Text>
                    <div className="flex items-center gap-1.5">
                      <Typography.Text
                        className="text-sm"
                        style={{ color: "rgba(0, 0, 0, 0.45)" }}
                      >
                        {item.order_date}
                      </Typography.Text>
                      <StatusBadge status={item.status} />
                    </div>
                  </Col>
                  <Col span={6} className="!grid !place-items-center">
                    <Dropdown
                      menu={{ items }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button icon={<EllipsisOutlined />} />
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
                    {item.amount_local.toLocaleString()} {item.currency_code}
                  </p>
                  <Typography.Text type="secondary">
                    (${item.amount_usd.toLocaleString()})
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
                      {item.expected_delivery_date}
                    </p>
                  </div>
                </Flex>
                <Row>
                  <Col span={12}>
                    <Typography.Text type="secondary">
                      Invoiced(USD){" "}
                      <Tooltip title="Total amount invoiced in USD">
                        <InfoOutlined
                          style={{
                            cursor: "pointer",
                            border: "1px solid #d9d9d9",
                            borderRadius: "50%",
                            padding: 2,
                            width: 14,
                            height: 14,
                          }}
                        />
                      </Tooltip>
                    </Typography.Text>
                    <p className="m-0 font-medium text-base">
                      $
                      {item.invoiced_amount
                        ? item.invoiced_amount.toLocaleString()
                        : 0}
                    </p>
                  </Col>
                  <Col span={12}>
                    <Typography.Text type="secondary">
                      Remaining(USD){" "}
                      <Tooltip title="Total amount remaining in USD">
                        <InfoOutlined
                          style={{
                            cursor: "pointer",
                            border: "1px solid #d9d9d9",
                            borderRadius: "50%",
                            padding: 2,
                            width: 14,
                            height: 14,
                          }}
                        />
                      </Tooltip>
                    </Typography.Text>
                    <p className="m-0 font-medium text-base">
                      $
                      {item.invoiced_amount
                        ? item.invoiced_amount.toLocaleString()
                        : 0}
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Progress percent={item.invoiced_amount} />
                </Row>
                <Row>
                  <Col span={12}>
                    <Typography.Text type="secondary">
                      Allocated(USD){" "}
                      <Tooltip title="Total amount allocated in USD">
                        <InfoOutlined
                          style={{
                            cursor: "pointer",
                            border: "1px solid #d9d9d9",
                            borderRadius: "50%",
                            padding: 2,
                            width: 14,
                            height: 14,
                          }}
                        />
                      </Tooltip>
                    </Typography.Text>
                    <p className="m-0 font-medium text-base">
                      $
                      {item.allocated_amount
                        ? item.allocated_amount.toLocaleString()
                        : 0}
                    </p>
                  </Col>
                  <Col span={12}>
                    <Typography.Text type="secondary">
                      Remaining(USD){" "}
                      <Tooltip title="Total amount remaining in USD">
                        <InfoOutlined
                          style={{
                            cursor: "pointer",
                            border: "1px solid #d9d9d9",
                            borderRadius: "50%",
                            padding: 2,
                            width: 14,
                            height: 14,
                          }}
                        />
                      </Tooltip>
                    </Typography.Text>
                    <p className="m-0 font-medium text-base">
                      $
                      {item.allocated_amount
                        ? item.allocated_amount.toLocaleString()
                        : 0}
                    </p>
                  </Col>
                </Row>
                <Row>
                  <Progress percent={item.allocated_amount} />
                </Row>
              </div>
            </div>
          );
        })}
      </div>
      <Flex justify="space-between" align="center" className="!pb-10 !pt-6">
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
