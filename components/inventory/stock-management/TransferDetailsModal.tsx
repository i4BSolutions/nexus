import {
  Modal,
  Typography,
  Tag,
  Space,
  Button,
  Divider,
  Flex,
  Col,
  Row,
} from "antd";
import {
  DownCircleOutlined,
  UpCircleOutlined,
  WarningOutlined,
  PaperClipOutlined,
  SwapOutlined,
  CloseOutlined,
  StopOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { StockTransactionInterface } from "@/types/stock/stock.type";
import { PDFViewer } from "@react-pdf/renderer";
import Link from "next/link";

const { Text } = Typography;

type TransactionDetailsModalProps = {
  open: boolean;
  isLoading: boolean;
  setOpen: (open: boolean) => void;
  data?: StockTransactionInterface;
  onVoid?: () => void;
};

const TransferDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  open,
  isLoading,
  setOpen,
  data,
  onVoid,
}) => {
  if (!data) return null;

  const isIn = data.direction === "Stock In";

  const photos =
    data.evidence?.filter(
      (e) =>
        (e.mime && e.mime.startsWith("image/")) ||
        e.type === "photo" ||
        /\.(png|jpe?g|webp|gif)$/i.test(e.name || "") ||
        /\.(png|jpe?g|webp|gif)$/i.test(e.key || "")
    ) ?? [];

  const pdfs =
    data.evidence?.filter(
      (e) =>
        e.mime === "application/pdf" ||
        e.type === "pdf" ||
        /\.pdf$/i.test(e.name || "") ||
        /\.pdf$/i.test(e.key || "")
    ) ?? [];

  return (
    <Modal
      loading={isLoading}
      open={open}
      footer={null}
      centered
      title={null}
      onCancel={() => setOpen(false)}
      width={720}
      closeIcon={false}
      styles={{
        body: { padding: 0 },
        content: { padding: 0 },
      }}
    >
      {/* Custom Header */}
      <Flex
        justify="space-between"
        align="center"
        style={{
          background: "linear-gradient(90deg, #F9F0FF 0%, #FFFFFF 100%)",
          width: "100%",
          padding: "12px 16px",
          borderRadius: 5,
        }}
      >
        <Col style={{}}>
          <CloseOutlined
            onClick={() => setOpen(false)}
            style={{
              cursor: "pointer",
            }}
          />
          <Flex
            align="center"
            justify="space-between"
            gap={12}
            style={{ marginLeft: 20 }}
          >
            <SwapOutlined
              style={{
                backgroundColor: "#9254DE",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                fontSize: 16,
              }}
            />
            <Col style={{ display: "flex", flexDirection: "column" }}>
              <Typography.Text
                strong
                style={{ fontSize: 20, fontWeight: 500, color: "#000000D9" }}
              >
                {data.name ?? "-"}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: 14, color: "#00000073", fontWeight: 400 }}
              >
                {data.sku ?? "-"}
              </Typography.Text>
            </Col>
          </Flex>
        </Col>
        {!data.is_voided && (
          <Button
            type="primary"
            icon={<StopOutlined />}
            style={{
              borderRadius: 8,
              fontWeight: 500,
              backgroundColor: "red",
            }}
            onClick={onVoid}
          >
            Void Transaction
          </Button>
        )}
      </Flex>

      <Divider style={{ margin: 0, borderColor: "#D3ADF7" }} />

      <Space
        style={{
          paddingLeft: 40,
          paddingRight: 40,
          paddingBottom: 40,
          paddingTop: 24,
        }}
      >
        <Col
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Tag
            style={{
              borderRadius: 10,
              width: 82,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
            color={isIn ? "#52C41A" : "#FAAD14"}
          >
            {isIn ? <DownCircleOutlined /> : <UpCircleOutlined />}
            {isIn ? "Stock In" : "Stock Out"}
          </Tag>
          <Typography.Text
            strong
            style={{ fontSize: 30, fontWeight: 500, color: "#000000D9" }}
          >
            {data.quantity ? data.quantity : 0}
          </Typography.Text>
          <Row gutter={[24, 16]} style={{ marginTop: 12, width: 540 }}>
            {/* Date & Time */}
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>
                Date & Time
              </Text>
              <br />
              <Text strong style={{ fontSize: 14, fontWeight: 500 }}>
                {data.date ? data.date : "-"} {data.time ? data.time : "-"}
              </Text>
            </Col>
            <Col
              span={12}
              style={{ textAlign: "left", fontSize: 14, fontWeight: 400 }}
            >
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>
                Warehouse
              </Text>
              <br />
              <Text strong style={{ fontSize: 14, fontWeight: 400 }}>
                {data.warehouse ? data.warehouse : "-"}
              </Text>
            </Col>

            {/* Approved By */}
            {data.approved_by && (
              <Col span={12}>
                <Text
                  type="secondary"
                  style={{ fontSize: 14, fontWeight: 400 }}
                >
                  Approved By
                </Text>
                <br />
                <Text strong style={{ fontSize: 14, fontWeight: 400 }}>
                  {data.approved_by ? data.approved_by : "-"}
                </Text>
              </Col>
            )}
            {data.approval_order_no && (
              <Col span={12}>
                <Text
                  type="secondary"
                  style={{ fontSize: 14, fontWeight: 400 }}
                >
                  Approval Order No.
                </Text>
                <br />
                <Text strong style={{ fontSize: 14, fontWeight: 400 }}>
                  {data.approval_order_no ? data.approval_order_no : "-"}
                </Text>
              </Col>
            )}

            {/* Reference */}
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>
                Reference
              </Text>
              <br />
              <Text strong style={{ fontSize: 14, fontWeight: 400 }}>
                Warehouse Transfer
              </Text>
            </Col>
            {data.destination_warehouse && (
              <Col span={12}>
                <Text
                  type="secondary"
                  style={{ fontSize: 14, fontWeight: 400 }}
                >
                  Destination Warehouse
                </Text>
                <br />
                <Text strong style={{ fontSize: 14, fontWeight: 400 }}>
                  {data.destination_warehouse
                    ? data.destination_warehouse
                    : "-"}
                </Text>
              </Col>
            )}

            {/* Note (left only) */}
            <Col span={12}>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>
                Note
              </Text>
              <br />
              <Text strong style={{ fontSize: 14, fontWeight: 400 }}>
                {data.note ? data.note : "No notes available"}
              </Text>
            </Col>
          </Row>

          {photos.length > 0 && (
            <>
              <Typography.Text
                style={{
                  fontSize: 14,
                  marginTop: 12,
                  fontWeight: 400,
                  color: "#00000073",
                }}
              >
                Evidence Photos
              </Typography.Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 12,
                  overflowX: "auto",
                  paddingBottom: 8,
                }}
              >
                {photos.map((item) => {
                  return (
                    <Col key={item.url}>
                      <Image
                        unoptimized
                        src={item.url}
                        alt={item.name ? item.name : "Evidence"}
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "contain",
                          borderRadius: 8,
                          border: "1px solid #f0f0f0",
                          flexShrink: 0,
                        }}
                        width={120}
                        height={120}
                      />
                    </Col>
                  );
                })}
              </div>
            </>
          )}
          {pdfs.length > 0 && (
            <>
              <Typography.Text
                style={{
                  fontSize: 14,
                  fontWeight: 400,
                  color: "#00000073",
                }}
              >
                Approval Letter
              </Typography.Text>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {pdfs.map((p, idx) => (
                  <Link
                    key={p.url || idx}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#1677ff",
                      textDecoration: "none",
                      lineHeight: 1.4,
                      maxWidth: 360,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={p.name || "ApprovalLetter.pdf"}
                  >
                    <PaperClipOutlined />
                    <span>{p.name || "ApprovalLetter.pdf"}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Col>
      </Space>
    </Modal>
  );
};

export default TransferDetailsModal;
