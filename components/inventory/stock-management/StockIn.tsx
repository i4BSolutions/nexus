import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Table,
  InputNumber,
  Typography,
  Space,
  Flex,
  Divider,
  App,
  Empty,
  Spin,
  Row,
  Col,
  Checkbox,
  Upload,
  Modal,
  UploadProps,
  UploadFile,
  Image,
} from "antd";
import { useEffect, useRef, useState } from "react";
import {
  DownloadOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import StockInHistory from "./StockInHistory";
import {
  PurchaseInvoiceDto,
  PurchaseInvoiceInterface,
  PurchaseInvoiceResponse,
} from "@/types/purchase-invoice/purchase-invoice.type";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import { useGetById } from "@/hooks/react-query/useGetById";
import { StockTransactionHistory } from "@/types/stock/stock.type";
import ImageViewerModal, {
  ViewerImage,
} from "@/components/shared/ImageViewerModal";

const { Option } = Select;
const { TextArea } = Input;

const { Dragger } = Upload;

const toViewerImages = (files: UploadFile[]): ViewerImage[] =>
  files.map((f, i) => {
    const fullSrc =
      (f.originFileObj
        ? URL.createObjectURL(f.originFileObj as File)
        : f.url ?? "") || "";
    return {
      src: fullSrc,
      name: f.name,
      key: f.uid ?? i,
    };
  });

interface StockFormProps {
  invoices: PurchaseInvoiceDto[] | undefined;
  warehouses: WarehouseInterface[] | undefined;
  stockInHistories: StockTransactionHistory[] | undefined;
  invoiceLoading?: boolean;
  warehouseLoading?: boolean;
  mutateStockInLoading?: boolean;
  stockInHistoryLoading?: boolean;
  onSubmit?: (payload: any) => void;
}

const MAX_FILES = 10;
const MAX_MB = 5;

const StockInForm = ({
  invoices,
  warehouses,
  stockInHistories,
  invoiceLoading,
  warehouseLoading,
  stockInHistoryLoading,
  mutateStockInLoading,
  onSubmit,
}: StockFormProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  // ---- Upload modal ----
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [evidenceMap, setEvidenceMap] = useState<Record<string, UploadFile[]>>(
    {}
  );
  const [activeLineKey, setActiveLineKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // ---- Confirm remove ----
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<UploadFile | null>(null);

  // ---- Image viewer ----
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStart, setViewerStart] = useState(0);
  const [viewerImages, setViewerImages] = useState<ViewerImage[]>([]);

  const removeResolverRef = useRef<((ok: boolean) => void) | null>(null);

  const selectedInvoice = Form.useWatch("invoice", form);
  const selectedInvoiceId = invoices?.find(
    (inv) => inv.purchase_invoice_number === selectedInvoice
  )?.id;

  const {
    data: invoiceDataRaw,
    isLoading: invoiceDetailLoading,
    error,
  } = useGetById(
    "purchase-invoices",
    selectedInvoiceId as any,
    !!selectedInvoiceId
  );

  const invoiceData = invoiceDataRaw as PurchaseInvoiceInterface;

  const validInvoiceItems =
    invoiceData?.invoice_items?.filter(
      (item) =>
        typeof item?.remaining_to_stock_in === "number" &&
        item.remaining_to_stock_in > 0
    ) || [];

  useEffect(() => {
    setEvidenceMap({});
    setActiveLineKey(null);

    if (validInvoiceItems.length) {
      form.setFieldsValue({
        invoice_items: validInvoiceItems.map((item) => ({
          checked: false,
          stock_in_quantity: 1,
          ...item,
        })),
      });
    }
  }, [invoiceData, form]);

  const beforeUpload = (file: UploadFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return Upload.LIST_IGNORE;
    }
    const isLt5MB = (file.size ?? 0) / 1024 / 1024 < MAX_MB;
    if (!isLt5MB) {
      message.error(`Image must be smaller than ${MAX_MB}MB!`);
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const askRemove = (file: UploadFile) =>
    new Promise<boolean>((resolve) => {
      removeResolverRef.current = resolve;
      setPendingRemove(file);
      setOpenConfirmModal(true);
    });

  const handleConfirmRemove = () => {
    setOpenConfirmModal(false);
    removeResolverRef.current?.(true);
    removeResolverRef.current = null;
    setPendingRemove(null);
  };
  const handleCancelRemove = () => {
    setOpenConfirmModal(false);
    removeResolverRef.current?.(false);
    removeResolverRef.current = null;
    setPendingRemove(null);
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    accept: "image/jpeg,image/png",
    action: "", // pre-upload client-side only
    fileList: activeLineKey !== null ? evidenceMap[activeLineKey] ?? [] : [],
    beforeUpload,
    async onRemove(file) {
      if (activeLineKey === null || activeIndex === null) return false;
      const ok = await askRemove(file);
      if (!ok) return false;

      setEvidenceMap((prev) => {
        const next = { ...prev };
        next[activeLineKey] = (next[activeLineKey] ?? []).filter(
          (f) => f.uid !== file.uid
        );
        form.setFieldValue(
          ["invoice_items", activeIndex, "evidence_photo"],
          next[activeLineKey]
        );

        form.validateFields([["invoice_items", activeIndex, "evidence_photo"]]);

        return next;
      });
      return true;
    },
    onChange({ fileList: newList }) {
      if (activeLineKey === null || activeIndex === null) return;
      let trimmed = newList;
      if (newList.length > MAX_FILES) {
        trimmed = newList.slice(0, MAX_FILES);
        message.warning(`You can upload up to ${MAX_FILES} photos.`);
      }
      setEvidenceMap((prev) => {
        const next = { ...prev, [activeLineKey]: trimmed };
        form.setFieldValue(
          ["invoice_items", activeIndex, "evidence_photo"],
          trimmed
        );

        form.validateFields([["invoice_items", activeIndex, "evidence_photo"]]);

        return next;
      });
    },
    onPreview(file) {
      if (!activeLineKey) return;
      const files = evidenceMap[activeLineKey] ?? [];
      const index = files.findIndex((f) => f.uid === file.uid);
      openViewerForRow(activeLineKey, index >= 0 ? index : 0);
    },
    previewFile: async (file) => {
      return URL.createObjectURL(file as unknown as File);
    },
    listType: "picture",
    showUploadList: true,
  };

  const handleFinish = (values: any) => {
    const selectedItems = values.invoice_items?.filter(
      (item: any) => item.checked
    );

    if (!selectedItems || selectedItems.length === 0) {
      message.warning("Please select at least one item to stock in.");
      return;
    }

    const payload = {
      invoice_items: selectedItems.map((item: any) => {
        const lineKey = String(item.id);
        const files = (evidenceMap[lineKey] ?? [])
          .map((f) => f.originFileObj)
          .filter(Boolean) as File[];

        return {
          product_id: item.product_id,
          warehouse_id: warehouses?.find((w) => w.name === values.warehouse)
            ?.id,
          quantity: item.stock_in_quantity,
          invoice_line_item_id: item.id,
          __files__: files,
        };
      }),
    };

    onSubmit?.(payload);
    // message.success("Stock In completed successfully!");
    form.resetFields();
    setEvidenceMap({});
    setActiveLineKey(null);
    setActiveIndex(null);
  };

  const openViewerForRow = (lineKey: string, startIndex = 0) => {
    const files = evidenceMap[lineKey] ?? [];
    if (!files.length) return;
    setViewerImages(toViewerImages(files));
    setViewerStart(startIndex);
    setViewerOpen(true);
  };

  return (
    <>
      <Card
        styles={{
          header: {
            background: "linear-gradient(90deg, #F6FFED 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #73D13D",
          },
        }}
        title={
          <div className="flex items-center gap-3 py-2">
            <div
              style={{
                width: 32,
                height: 32,
                background: "#73D13D",
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DownloadOutlined style={{ color: "#FFFFFF" }} />
            </div>
            <div className="flex flex-col">
              <Typography.Text
                strong
                style={{
                  color: "#000000D9",
                  fontSize: "20px",
                  fontWeight: 500,
                }}
              >
                Stock In
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "#00000073",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                Receive items into inventory from invoices
              </Typography.Text>
            </div>
          </div>
        }
        variant="outlined"
      >
        <Form layout="vertical" form={form} style={{}} onFinish={handleFinish}>
          <Flex style={{ gap: 12 }}>
            <Form.Item
              label="Invoice"
              name="invoice"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please select invoice" }]}
            >
              <Select
                loading={invoiceLoading}
                allowClear
                placeholder="Select Invoice"
              >
                {invoices?.map((i) => (
                  <Option key={i.id} value={i.purchase_invoice_number}>
                    {i.purchase_invoice_number}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Warehouse"
              name="warehouse"
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please select warehouse" }]}
            >
              <Select
                allowClear
                loading={warehouseLoading}
                placeholder="Select Warehouse"
              >
                {warehouses?.map((warehouse) => (
                  <Option key={warehouse.id} value={warehouse.name}>
                    {warehouse.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Flex>

          <Card
            styles={{
              header: {
                borderBottom: "none",
              },
            }}
            title={
              <div className="flex flex-col">
                <Typography.Text
                  strong
                  style={{
                    fontWeight: 500,
                    color: "#000000D9",
                    fontSize: "20px",
                  }}
                >
                  Available Items
                </Typography.Text>
                <Typography.Text
                  style={{
                    color: "#00000073",
                    fontWeight: 400,
                    fontSize: "14px",
                  }}
                >
                  Select quantities to add to stock
                </Typography.Text>
              </div>
            }
            style={{ marginTop: 12 }}
          >
            {selectedInvoice ? (
              invoiceDetailLoading ? (
                <div className="grid place-items-center h-[200px]">
                  <Spin />
                </div>
              ) : validInvoiceItems.length > 0 ? (
                <Form.List name="invoice_items">
                  {(fields) => (
                    <div
                      style={{ border: "1px solid #e0e0e0", borderRadius: 8 }}
                    >
                      <Row
                        gutter={16}
                        style={{
                          fontWeight: 600,
                          padding: "12px",
                          background: "#fafafa",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                        align="middle"
                      >
                        <Col span={2}>SELECT</Col>
                        <Col span={4}>PRODUCT NAME</Col>
                        <Col span={3}>PRODUCT SKU</Col>
                        <Col span={3}>INVOICED QTY</Col>
                        <Col span={3}>REMAINING QTY</Col>
                        <Col span={5}>QUANTITY TO STOCK IN</Col>
                        <Col span={4}>EVIDENCE PHOTO</Col>
                      </Row>

                      {fields.map(({ key, name, ...restField }, index) => {
                        const item = validInvoiceItems[index];
                        if (!item) return null;

                        const lineKey = String(item.id);

                        return (
                          <Row
                            key={key}
                            gutter={16}
                            align="middle"
                            style={{
                              padding: "12px 20px",
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <Col span={2}>
                              <Form.Item
                                {...restField}
                                name={[name, "checked"]}
                                valuePropName="checked"
                                initialValue={false}
                                style={{ marginBottom: 0 }}
                              >
                                <Checkbox />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Typography.Text>
                                {item.product_name}
                              </Typography.Text>
                            </Col>
                            <Col span={3}>
                              <Typography.Text>
                                {item.product_sku}
                              </Typography.Text>
                            </Col>
                            <Col span={3}>
                              <Typography.Text>
                                {item.total_ordered}
                              </Typography.Text>
                            </Col>
                            <Col span={3}>
                              <Typography.Text>
                                {item.remaining_to_stock_in}
                              </Typography.Text>
                            </Col>
                            <Col span={5}>
                              <Form.Item
                                {...restField}
                                name={[name, "stock_in_quantity"]}
                                initialValue={1}
                                style={{ marginBottom: 0 }}
                                rules={[
                                  {
                                    required: true,
                                    message: "Quantity is required.",
                                  },
                                  {
                                    validator: (_, value) => {
                                      const remaining =
                                        item.remaining_to_stock_in ?? 1;
                                      if (typeof value !== "number")
                                        return Promise.resolve();
                                      if (value <= 0) {
                                        return Promise.reject(
                                          new Error(
                                            "Quantity must be greater than 0."
                                          )
                                        );
                                      }
                                      if (value > remaining) {
                                        return Promise.reject(
                                          new Error(
                                            `Cannot exceed remaining quantity (${remaining})`
                                          )
                                        );
                                      }
                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <InputNumber style={{ width: "100%" }} />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              {/* Hidden field to drive validation + keep form in sync */}
                              <Form.Item
                                {...restField}
                                name={[name, "evidence_photo"]}
                                valuePropName="value"
                                style={{ marginBottom: 0 }}
                                dependencies={[
                                  ["invoice_items", index, "checked"],
                                ]}
                                rules={[
                                  {
                                    validator: async (_, value) => {
                                      const checked = form.getFieldValue([
                                        "invoice_items",
                                        index,
                                        "checked",
                                      ]);
                                      const lineKey = String(item.id);

                                      const filesFromMap =
                                        evidenceMap[lineKey] ?? [];
                                      const filesFromField =
                                        (value as UploadFile[] | undefined) ??
                                        [];

                                      const files = filesFromField.length
                                        ? filesFromField
                                        : filesFromMap;

                                      if (checked && files.length === 0) {
                                        throw new Error(
                                          "Evidence Photo is required."
                                        );
                                      }
                                    },
                                  },
                                ]}
                              >
                                <Flex align="center" gap={8} wrap>
                                  {(() => {
                                    const files = evidenceMap[lineKey] ?? [];
                                    const first = files[0];
                                    const count = files.length;
                                    const hasThumb = !!first;

                                    return (
                                      <>
                                        <Flex
                                          style={{
                                            borderRadius: 12,
                                            overflow: "hidden",
                                            border: "1px solid #e5e5e5",
                                            display: "grid",
                                            placeItems: "center",
                                            background: "#fafafa",
                                            position: "relative",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            openViewerForRow(lineKey, 0)
                                          }
                                          title="Preview"
                                        >
                                          {hasThumb ? (
                                            <img
                                              alt="thumb"
                                              src={
                                                first.thumbUrl ||
                                                (first as any).url ||
                                                (first.originFileObj
                                                  ? URL.createObjectURL(
                                                      first.originFileObj as File
                                                    )
                                                  : undefined)
                                              }
                                              style={{
                                                width: 32,
                                                height: 32,
                                                objectFit: "cover",
                                              }}
                                              onError={(e) =>
                                                (e.currentTarget.style.display =
                                                  "none")
                                              }
                                            />
                                          ) : null}
                                          {count > 1 && (
                                            <div
                                              style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(0,0,0,.35)",
                                                display: "grid",
                                                placeItems: "center",
                                                color: "#fff",
                                                fontWeight: 600,
                                                fontSize: 16,
                                              }}
                                            >
                                              +{count - 1}
                                            </div>
                                          )}
                                        </Flex>
                                        <Button
                                          icon={<UploadOutlined />}
                                          onClick={() => {
                                            setActiveLineKey(lineKey);
                                            setActiveIndex(index);
                                            setOpenUploadModal(true);
                                            form.setFieldValue(
                                              [
                                                "invoice_items",
                                                index,
                                                "evidence_photo",
                                              ],
                                              evidenceMap[lineKey] ?? []
                                            );
                                          }}
                                        >
                                          {hasThumb ? "" : "Upload"}
                                        </Button>
                                      </>
                                    );
                                  })()}
                                </Flex>
                              </Form.Item>
                            </Col>
                          </Row>
                        );
                      })}
                    </div>
                  )}
                </Form.List>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 200,
                  }}
                >
                  <Empty description="There are no items to stock in." />
                </div>
              )
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: 200,
                  width: "100%",
                }}
              >
                <Empty
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  styles={{ image: { height: 60 } }}
                  description={null}
                />
                <Typography.Text
                  style={{
                    color: "#000000D9",
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  Select invoice to add items to stock.
                </Typography.Text>
              </div>
            )}
          </Card>

          <Form.Item
            label="Note (Optional)"
            name="note"
            style={{ marginTop: 12 }}
          >
            <TextArea placeholder="Enter note" />
          </Form.Item>

          <Space
            style={{
              display: "flex",
              marginTop: 16,
              justifyContent: "space-between",
            }}
          >
            <Button
              htmlType="reset"
              onSubmit={() => form.resetFields()}
              loading={mutateStockInLoading}
              disabled={mutateStockInLoading}
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={mutateStockInLoading}
              loading={mutateStockInLoading}
            >
              Complete Stock In
            </Button>
          </Space>
        </Form>
      </Card>

      <Divider plain>
        <Typography.Text
          style={{ fontSize: "12px", fontWeight: 400, color: "#00000073" }}
        >
          Scroll down to see recent stock in history
        </Typography.Text>
      </Divider>

      <StockInHistory
        items={stockInHistories}
        isLoading={stockInHistoryLoading}
      />

      <Modal
        open={openUploadModal}
        onCancel={() => setOpenUploadModal((prev) => !prev)}
        footer={null}
        centered
        wrapClassName="centered-modal"
      >
        <Typography.Text
          style={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#000000D9",
            alignSelf: "flex-start",
            marginBottom: 8,
          }}
        >
          <span style={{ color: "red" }}>*</span> Evidence Photo
        </Typography.Text>
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ color: "#1890FF" }} color="#1890FF" />
          </p>
          <p className="ant-upload-text">Upload Evidence Photos</p>
          <p className="ant-upload-hint">
            Drag and drop files here, or click the button to upload. Supported
            formats: JPEG, PNG (Max 10MB per file)
          </p>
          <Button
            style={{
              borderColor: "#D9D9D9",
              marginTop: 20,
            }}
            icon={<UploadOutlined />}
          >
            Click to upload
          </Button>
        </Dragger>
      </Modal>

      <Modal
        open={openConfirmModal}
        onCancel={handleCancelRemove}
        footer={null}
        centered
        wrapClassName="centered-modal"
        style={{ maxWidth: 400 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography.Text
            style={{
              fontSize: "20px",
              fontWeight: 500,
              color: "#000000D9",
            }}
          >
            Remove Photo
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#00000073",
            }}
          >
            Are you sure you want to delete this file?
          </Typography.Text>
        </div>
        <Flex justify="center" gap={4} style={{ marginTop: 12 }}>
          <Button
            onClick={() => setOpenConfirmModal((prev) => !prev)}
            type="primary"
            style={{
              borderColor: "#D9D9D9",
              backgroundColor: "#FFFFFF",
              color: "#000000D9",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRemove}
            type="primary"
            style={{
              borderColor: "#FF4D4F",
              backgroundColor: "#FF4D4F",
            }}
          >
            Remove
          </Button>
        </Flex>
      </Modal>
      {viewerOpen && (
        <ImageViewerModal
          open={viewerOpen}
          images={viewerImages}
          start={viewerStart}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
};

export default StockInForm;
