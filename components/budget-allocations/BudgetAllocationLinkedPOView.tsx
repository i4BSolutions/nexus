import { useGetById } from "@/hooks/react-query/useGetById";
import {
  CalendarOutlined,
  CheckCircleTwoTone,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { App, Card, Col, Flex, Row, Spin, Tag, Typography } from "antd";
import dayjs from "dayjs";

const BudgetAllocationLinkedPOView = ({ id }: { id: number }) => {
  const { message } = App.useApp();
  const {
    data,
    isLoading: linkedPOIsLoading,
    error: linkedPOError,
  } = useGetById("purchase-orders", id as any, !!id);

  if (linkedPOError) {
    message.error(linkedPOError.message);
    return null;
  }

  if (linkedPOIsLoading || !data) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Spin />
      </div>
    );
  }

  const linkedPOData = data as any;
  return (
    <section className="w-full rounded-2xl border-2 border-[#F5F5F5]">
      <Flex
        align="center"
        gap={16}
        style={{
          padding: "16px 24px",
          borderRadius: "16px 16px 0 0",
          background: "linear-gradient(90deg, #E6F4FF 0%, #FFFFFF 100%)",
          borderBottom: "1px solid #91D5FF",
        }}
      >
        <ShoppingCartOutlined
          style={{
            width: 32,
            height: 32,
            background: "#69B1FF",
            borderRadius: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: 20,
          }}
        />
        <div>
          <Typography.Title level={4} className="!mb-0">
            Related Purchase Order
          </Typography.Title>
          <Typography.Text type="secondary">
            Purchase Order linked to this allocation
          </Typography.Text>
        </div>
      </Flex>

      <Card className="!px-0 !pb-0" variant="outlined">
        {/* Header Row */}
        <Row
          gutter={0}
          style={{
            fontWeight: 600,
            fontSize: 12,
            padding: "12px 24px",
            background: "#FAFAFA",
            borderBottom: "1px solid #E0E0E0",
          }}
          align="middle"
        >
          <Col span={4}>PURCHASE ORDER</Col>
          <Col span={4}>SUPPLIER</Col>
          <Col span={4}>ORDER DATE</Col>
          <Col span={4}>EXPECTED DELIVERY DATE</Col>
          <Col span={4}>AMOUNT</Col>
          <Col span={4}>STATUS</Col>
        </Row>

        {/* Data Row */}
        <Row
          gutter={0}
          align="middle"
          style={{
            padding: "14px 24px",
            backgroundColor: "white",
            borderBottom: "1px solid #F0F0F0",
          }}
        >
          {/* Purchase Order Number */}
          <Col span={4}>
            <div className="flex items-center gap-2 text-blue-500 font-medium">
              PO-{linkedPOData?.purchase_order_no}
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            </div>
          </Col>

          {/* Supplier */}
          <Col span={4}>{linkedPOData?.supplier?.name}</Col>

          {/* Order Date */}
          <Col span={4}>
            <Flex align="center" gap={6}>
              <CalendarOutlined />
              {dayjs(linkedPOData?.order_date).format("MMM D, YYYY")}
            </Flex>
          </Col>

          {/* Expected Delivery */}
          <Col span={4}>
            <Flex align="center" gap={6}>
              <CalendarOutlined />
              {dayjs(linkedPOData?.expected_delivery_date).format(
                "MMM D, YYYY"
              )}
            </Flex>
          </Col>

          {/* Amount */}
          <Col span={4}>
            {linkedPOData?.total_amount_local.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {linkedPOData?.currency?.currency_code}
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              (
              {linkedPOData?.total_amount_usd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD)
            </Typography.Text>
          </Col>

          {/* Status */}
          <Col span={4}>
            <Tag
              color="blue"
              style={{
                borderRadius: 16,
                padding: "0 12px",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {linkedPOData?.status}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* <Card style={{ border: "1px solid #e0e0e0", borderRadius: 8 }}>
        <Row
          gutter={16}
          style={{
            fontWeight: 600,
            // padding: "12px",
            background: "#fafafa",
            borderBottom: "1px solid #e0e0e0",
          }}
          align="middle"
        >
          <Col span={4}>PURCHASE ORDER</Col>
          <Col span={4}>SUPPLIER</Col>
          <Col span={4}>ORDER DATE</Col>
          <Col span={4}>EXPECTED DELIVERY DATE</Col>
          <Col span={4}>AMOUNT</Col>
          <Col span={4}>STATUS</Col>
        </Row>
        <Row
          gutter={16}
          align="middle"
          style={{
            // padding: "2px 20px",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Col span={4}>
            <div className="flex items-center gap-2 text-blue-500 font-medium">
              PO-{linkedPOData?.purchase_order_no}
              <CheckCircleTwoTone twoToneColor="#52c41a" />
            </div>
          </Col>
          <Col span={4}>{linkedPOData?.supplier?.name}</Col>
          <Col span={4}>
            <Flex align="center" gap={6}>
              <CalendarOutlined />
              {dayjs(linkedPOData?.order_date).format("MMM D, YYYY")}
            </Flex>
          </Col>
          <Col span={4}>
            <Flex align="center" gap={6}>
              <CalendarOutlined />
              {dayjs(linkedPOData?.expected_delivery_date).format(
                "MMM D, YYYY"
              )}
            </Flex>
          </Col>
          <Col span={4}>
            {linkedPOData?.total_amount_local.toFixed(2)}{" "}
            {linkedPOData?.currency?.currency_code}
            <br />
            <Typography.Text type="secondary">
              ({linkedPOData?.total_amount_usd.toFixed(2)} USD)
            </Typography.Text>
          </Col>
          <Col span={4}>
            <Tag color="blue" style={{ borderRadius: 6, textAlign: "center" }}>
              {linkedPOData?.status}
            </Tag>
          </Col>
        </Row>
      </Card> */}
    </section>
  );
};

export default BudgetAllocationLinkedPOView;
