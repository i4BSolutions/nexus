import { PurchaseInvoiceDto } from "@/types/purchase-invoice/purchase-invoice.type";

import {
  DollarOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
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
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import StatusBadge from "./StatusBadge";
import dayjs from "dayjs";
import Link from "antd/es/typography/Link";

export default function CardView({
  data,
  pagination,
  total,
  paginationChangeHandler,
}: {
  data: PurchaseInvoiceDto[];
  pagination: { page: number; pageSize: number };
  total: number;
  paginationChangeHandler: (page: number, pageSize?: number) => void;
}) {
  const router = useRouter();

  return (
    <section className="py-4">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(325px, 1fr))" }}
      >
        {data.map((item: PurchaseInvoiceDto) => {
          const items: MenuProps["items"] = [
            {
              label: <div className="text-sm !w-32">View</div>,
              key: "view",
              icon: <EyeOutlined />,
              onClick: () => {
                router.push(`/purchase-orders/${item.purchase_invoice_number}`);
              },
            },
            {
              label: <span className="text-sm !w-32">Edit</span>,
              key: "edit",
              icon: <EditOutlined />,
              onClick: () => {
                router.push(
                  `/purchase-orders/${item.purchase_invoice_number}/edit`
                );
              },
            },
          ];
          return (
            <div
              key={item.id}
              className="border-2 border-[#F5F5F5] rounded-[16px] w-full"
            >
              <div
                className="py-3 rounded-t-[14px]"
                style={{
                  background: "linear-gradient(90deg, #FFFBE6 0%, #FFF 100%)",
                }}
              >
                <Row>
                  <Col span={6} className="!grid !place-items-center">
                    <DollarOutlined
                      style={{
                        width: 32,
                        height: 32,
                        background: "#FFC53D",
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
                      {item.purchase_invoice_number}
                    </Typography.Text>
                    <div className="flex items-center gap-1.5">
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
                    {item.total_amount_local.toLocaleString()}{" "}
                    {item.currency_code}
                  </p>
                  <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Typography.Text type="secondary">
                      (${item.total_amount_usd.toLocaleString()})
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      1 USD = {item.usd_exchange_rate.toLocaleString()}{" "}
                      {item.currency_code}
                    </Typography.Text>
                  </Space>
                </div>

                <Flex
                  justify="space-between"
                  align="center"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Typography.Text type="secondary">
                      Invoice Date
                    </Typography.Text>
                  </div>
                  <div>
                    <p className="m-0 font-medium text-base">
                      {dayjs(item.invoice_date).format("MMM D, YYYY")}
                    </p>
                  </div>
                </Flex>

                <Flex
                  justify="space-between"
                  align="center"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Typography.Text type="secondary">Due Date</Typography.Text>
                  </div>
                  <div>
                    <p className="m-0 font-medium text-base">
                      {dayjs(item.due_date).format("MMM D, YYYY")}
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
                      Linked PO
                    </Typography.Text>
                  </div>
                  <div>
                    <Link className="m-0 font-medium text-base">
                      {item.purchase_order_no}
                    </Link>
                  </div>
                </Flex>

                <Row>
                  <Col span={12}>
                    <Typography.Text type="secondary">
                      Delivery Progress
                    </Typography.Text>
                  </Col>
                  <Progress percent={19} />
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
