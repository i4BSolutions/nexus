import { useGetById } from "@/hooks/react-query/useGetById";
import { InventoryInterface } from "@/types/inventory/inventory.type";
import { StockTransactionHistory } from "@/types/stock/stock.type";
import { WarehouseInterface } from "@/types/warehouse/warehouse.type";
import {
  DeleteOutlined,
  PaperClipOutlined,
  PlusOutlined,
  TagOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Typography,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";

import React, { useEffect } from "react";
import StockOutHistory from "./StockOutHistory";
import { RcFile } from "antd/es/upload";
import ImageViewerModal, {
  ViewerImage,
} from "@/components/shared/ImageViewerModal";
import { useGetAll } from "@/hooks/react-query/useGetAll";
import { PersonInterface, PersonResponse } from "@/types/person/person.type";
import { useList } from "@/hooks/react-query/useList";

const { Option } = Select;
const { TextArea } = Input;

interface StockOutProps {
  warehouses: WarehouseInterface[] | undefined;
  warehouseLoading?: boolean;
  mutateLoading?: boolean;
  stockOutHistories: StockTransactionHistory[] | undefined;
  stockOutHistoryLoading?: boolean;
  onSubmit?: (payload: any) => void;
}

const MAX_FILES = 10;

const StockOut = ({
  warehouses,
  warehouseLoading,
  mutateLoading,
  stockOutHistories,
  stockOutHistoryLoading,
  onSubmit,
}: StockOutProps) => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [fileList, setFileList] = React.useState<UploadFile[]>([]);
  const [openUploadModal, setOpenUploadModal] = React.useState(false);
  const [evidenceMap, setEvidenceMap] = React.useState<
    Record<string, UploadFile[]>
  >({});
  const [activeLineKey, setActiveLineKey] = React.useState<string | null>(null);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const [openConfirmModal, setOpenConfirmModal] = React.useState(false);
  const [pendingRemove, setPendingRemove] = React.useState<UploadFile | null>(
    null
  );
  const removeResolverRef = React.useRef<((ok: boolean) => void) | null>(null);

  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerStart, setViewerStart] = React.useState(0);
  const [viewerImages, setViewerImages] = React.useState<ViewerImage[]>([]);

  const toViewerImages = (files: UploadFile[]): ViewerImage[] =>
    files.map((f, i) => ({
      src:
        f.url ||
        f.thumbUrl ||
        (f.originFileObj ? URL.createObjectURL(f.originFileObj as File) : ""),
      name: f.name,
      key: f.uid ?? i,
    }));

  const reason = Form.useWatch("reason", form);
  const selectedWarehouseName = Form.useWatch("warehouse", form);

  const selectedWarehouse = warehouses?.find(
    (w) => w.name === selectedWarehouseName
  );

  const { data: inventoryDataRaw, isLoading: inventoryLoading } = useGetById(
    "inventory/get-by-warehouse-id",
    selectedWarehouse?.id as any,
    !!selectedWarehouse?.id
  );

  const inventoryItems = (inventoryDataRaw as InventoryInterface[]) || [];

  const { data: contactPersons } = useList<PersonResponse>("persons", {
    pageSize: "all" as any,
    status: "true",
  });

  useEffect(() => {
    setEvidenceMap({});
    setActiveLineKey(null);
    setActiveIndex(null);

    if (selectedWarehouse?.id && inventoryItems.length > 0) {
      form.setFieldsValue({
        items: [{ product: null, quantity: 1 }],
      });
    } else {
      form.setFieldsValue({ items: [] });
    }
  }, [selectedWarehouse?.id, inventoryItems.length, form]);

  const beforeUpload = (file: RcFile) => {
    const isImage = ["image/jpeg", "image/png"].includes(file.type);
    const isPdf = file.type === "application/pdf";

    // Only allow image or pdf
    if (!isImage && !isPdf) {
      message.error(`${file.name} is not a valid file type`);
      return Upload.LIST_IGNORE;
    }

    // Size checks
    const isLtPhoto5M = file.size / 1024 / 1024 < 5;
    const isLtPdf5M = file.size / 1024 / 1024 < 5;

    if (isImage && !isLtPhoto5M) {
      message.error(`${file.name} must be smaller than 5MB!`);
      return Upload.LIST_IGNORE;
    }
    if (isPdf && !isLtPdf5M) {
      message.error(`${file.name} must be smaller than 5MB!`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  const handleUploadChange: UploadProps["onChange"] = (info) => {
    let newFileList = [...info.fileList].slice(-5);

    newFileList = newFileList.map((file) => {
      const resp = file.response as any;

      // map backend response ➜ file.url + keep storage_key for submit
      if (resp && typeof resp === "object" && resp.data) {
        (file as any).id = resp.data.id;
        file.url = resp.data.url || file.url;
        (file as any).storage_key = resp.data.key;
        (file as any).mime = resp.data.mime ?? file.type;
        (file as any).size_bytes = resp.data.size_bytes ?? file.size ?? 0;
        (file as any).original_filename =
          resp.data.original_filename ?? file.name;
      }

      // fallback local blob preview (while uploading)
      if (!file.url && file.originFileObj) {
        file.url = URL.createObjectURL(file.originFileObj as RcFile);
      }
      return file;
    });

    setFileList(newFileList);
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

  const openViewerForRow = (lineKey: string, startIndex = 0) => {
    const files = evidenceMap[lineKey] ?? [];
    if (!files.length) return;
    setViewerImages(toViewerImages(files));
    setViewerStart(startIndex);
    setViewerOpen(true);
  };

  const rowUploadProps: UploadProps = {
    name: "file",
    multiple: true,
    accept: "image/jpeg,image/png",
    action: "/api/uploads/direct", // client-only, no auto upload
    fileList: activeLineKey !== null ? evidenceMap[activeLineKey] ?? [] : [],
    beforeUpload(file) {
      const isImg = file.type === "image/jpeg" || file.type === "image/png";
      if (!isImg) {
        message.error("You can only upload JPG/PNG file!");
        return Upload.LIST_IGNORE;
      }
      const isLt2M = (file.size ?? 0) / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    async onRemove(file) {
      if (activeLineKey === null || activeIndex === null) return false;
      const ok = await askRemove(file);
      if (!ok) return false;

      setEvidenceMap((prev) => {
        const next = { ...prev };
        next[activeLineKey] = (next[activeLineKey] ?? []).filter(
          (f) => f.uid !== file.uid
        );

        // keep form in sync + trigger row validation
        form.setFieldValue(
          ["items", activeIndex, "evidence_photo"],
          next[activeLineKey]
        );
        form.validateFields([["items", activeIndex, "evidence_photo"]]);
        return next;
      });
      return true;
    },
    onChange({ fileList: newList }) {
      if (activeLineKey === null || activeIndex === null) return;

      // trim count
      let trimmed = newList;
      if (newList.length > MAX_FILES) {
        trimmed = newList.slice(0, MAX_FILES);
        message.warning(`You can upload up to ${MAX_FILES} photos.`);
      }

      trimmed = trimmed.map((file) => {
        const resp = file.response as any;
        if (resp && typeof resp === "object" && resp.data) {
          (file as any).id = resp.data.id;
          file.url = resp.data.url || file.url;
          (file as any).storage_key = resp.data.key;
          (file as any).mime = resp.data.mime ?? file.type;
          (file as any).size_bytes = resp.data.size_bytes ?? file.size ?? 0;
          (file as any).original_filename =
            resp.data.original_filename ?? file.name;
        }
        if (!file.url && file.originFileObj) {
          file.url = URL.createObjectURL(file.originFileObj as RcFile);
        }
        return file;
      });

      setEvidenceMap((prev) => {
        const next = { ...prev, [activeLineKey]: trimmed };
        form.setFieldValue(["items", activeIndex, "evidence_photo"], trimmed);
        form.validateFields([["items", activeIndex, "evidence_photo"]]);
        return next;
      });
    },
    onPreview(file) {
      // preview from the same active row
      if (!activeLineKey) return;
      const files = evidenceMap[activeLineKey] ?? [];
      const idx = files.findIndex((f) => f.uid === file.uid);
      openViewerForRow(activeLineKey, idx >= 0 ? idx : 0);
    },
    listType: "picture",
    showUploadList: true,
  };

  const handleFinish = (values: any) => {
    if (!values.items || values.items.length === 0) {
      message.warning("Please select at least one item.");
      return;
    }

    const approvalFiles = fileList.filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type === "image/jpeg" ||
        f.type === "image/png"
    );

    if (approvalFiles.length < 1) {
      message.error("At least one Approval Letter (PDF/JPG/PNG) is required");
      return;
    }

    const approvalAssets = approvalFiles.map((f) => ({
      id: (f as any).id,
      key: (f as any).storage_key || (f.response as any)?.data?.key,
      mime: (f as any).mime || f.type,
      size_bytes: (f as any).size_bytes ?? 0,
      original_filename: (f as any).original_filename || f.name,
      type: f.type === "application/pdf" ? "pdf" : "photo",
    }));

    const rowPhotos: UploadFile[] = Object.values(evidenceMap)
      .flat()
      .filter(Boolean);
    const photoAssets = rowPhotos.map((f) => ({
      id: (f as any).id,
      key: (f as any).storage_key || (f.response as any)?.data?.key,
      mime: (f as any).mime || f.type,
      size_bytes: (f as any).size_bytes ?? 0,
      original_filename: (f as any).original_filename || f.name,
      type: "photo",
    }));

    const payload = {
      stock_out_items: (values.items ?? [])
        .filter((i: any) => Number(i.quantity) > 0)
        .map((i: any) => {
          const product = inventoryItems.find(
            (inv) => inv.product.id === i.product
          );
          if (!product || product.quantity <= 0) return null;

          const base: any = {
            product_id: product.product.id,
            warehouse_id: selectedWarehouse?.id!,
            quantity: Number(i.quantity),
            reason: values.reason,
            note: values.note || null,

            approve_by_contact_id: values.approved_by,
            approval_order_no: values.approved_order_no,
            approval_letter_id: approvalAssets[0]?.id, // first file uuid
            assets: [...photoAssets, ...approvalAssets],
          };

          if (
            values.reason === "Warehouse Transfer" &&
            values.destination_warehouse
          ) {
            const dest = warehouses?.find(
              (w) => w.name === values.destination_warehouse
            );
            if (dest) base.destination_warehouse_id = dest.id;
          }

          return base;
        })
        .filter(Boolean),
    };

    try {
      onSubmit?.(payload);
      message.success("Stock Out completed successfully!");
      form.resetFields();
      setFileList([]);
      setEvidenceMap({});
    } catch (error) {
      console.error(error);
      message.error("Stock Out Failed. Please try again.");
    }
  };

  return (
    <>
      <Card
        styles={{
          header: {
            background: "linear-gradient(90deg, #FFFBE6 0%, #FFFFFF 100%)",
            borderBottom: "1px solid #FFE58F",
          },
        }}
        variant="outlined"
        title={
          <div className="flex items-center gap-3 py-2">
            <div
              style={{
                width: 32,
                height: 32,
                background: "#FFC53D",
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <UploadOutlined style={{ color: "#FFFFFF" }} />
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
                Stock Out
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "#00000073",
                  fontSize: "14px",
                  fontWeight: 400,
                }}
              >
                Move items out of inventory for use or transfer
              </Typography.Text>
            </div>
          </div>
        }
      >
        <Form
          layout="vertical"
          form={form}
          style={{ maxWidth: "100%" }}
          onFinish={handleFinish}
        >
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
          <Card style={{ marginBottom: 12 }}>
            <Space direction="vertical" size="small" style={{ gap: 0 }}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Select Items
              </Typography.Title>
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                Select items to move out of inventory for use or transfer
              </Typography.Text>
            </Space>

            {inventoryLoading ? (
              <div className="grid place-items-center h-[200px]">
                <Spin />
              </div>
            ) : inventoryItems.length === 0 ? (
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
            ) : (
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.length > 0 && (
                      <div
                        style={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 8,
                          overflow: "hidden",
                          marginTop: 12,
                        }}
                      >
                        {/* Header */}
                        <Row
                          gutter={16}
                          style={{
                            fontWeight: 600,
                            padding: "12px 8px",
                            background: "#fafafa",
                            borderBottom: "1px solid #e0e0e0",
                          }}
                          align="middle"
                        >
                          <Col span={6}>PRODUCT</Col>
                          <Col span={4}>PRODUCT SKU</Col>
                          <Col span={4}>AVAILABLE QTY</Col>
                          <Col span={6}>QUANTITY TO STOCK OUT</Col>
                          <Col span={4}>EVIDENCE PHOTO</Col>
                        </Row>

                        {/* Rows */}
                        {fields.map(({ key, name, ...restField }, index) => (
                          <Row
                            key={key}
                            gutter={16}
                            align="middle"
                            style={{
                              padding: "12px 8px",
                              borderBottom:
                                index !== fields.length - 1
                                  ? "1px solid #f0f0f0"
                                  : undefined,
                            }}
                          >
                            {/* Product Select */}
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "product"]}
                                rules={[
                                  { required: true, message: "Select product" },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <Select
                                  placeholder="Select Product"
                                  style={{ width: "100%" }}
                                  allowClear
                                  options={inventoryItems
                                    .filter((inv) => inv.quantity > 0)
                                    .map((inv) => ({
                                      value: inv.product.id,
                                      label: inv.product.name,
                                    }))}
                                />
                              </Form.Item>
                            </Col>

                            {/* SKU */}
                            <Col span={4}>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prev, cur) =>
                                  prev.items?.[name]?.product !==
                                  cur.items?.[name]?.product
                                }
                              >
                                {() => {
                                  const pid = form.getFieldValue([
                                    "items",
                                    name,
                                    "product",
                                  ]);
                                  const inv = inventoryItems.find(
                                    (i) => i.product.id === pid
                                  );
                                  return (
                                    <Flex style={{ gap: 4 }}>
                                      <TagOutlined />
                                      <Typography.Text>
                                        {inv?.product.sku ?? "-"}
                                      </Typography.Text>
                                    </Flex>
                                  );
                                }}
                              </Form.Item>
                            </Col>

                            {/* Available Qty */}
                            <Col span={4}>
                              <Form.Item
                                noStyle
                                shouldUpdate={(prev, cur) =>
                                  prev.items?.[name]?.product !==
                                  cur.items?.[name]?.product
                                }
                              >
                                {() => {
                                  const pid = form.getFieldValue([
                                    "items",
                                    name,
                                    "product",
                                  ]);
                                  const inv = inventoryItems.find(
                                    (i) => i.product.id === pid
                                  );
                                  return (
                                    <Typography.Text>
                                      {inv?.quantity?.toLocaleString() ?? "-"}
                                    </Typography.Text>
                                  );
                                }}
                              </Form.Item>
                            </Col>

                            {/* Quantity Input */}
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, "quantity"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Quantity is required.",
                                  },
                                  {
                                    validator: (_, value) => {
                                      const pid = form.getFieldValue([
                                        "items",
                                        name,
                                        "product",
                                      ]);
                                      const inv = inventoryItems.find(
                                        (i) => i.product.id === pid
                                      );
                                      if (value <= 0) {
                                        return Promise.reject(
                                          new Error(
                                            "Quantity must be greater than 0."
                                          )
                                        );
                                      }
                                      if (
                                        typeof value === "number" &&
                                        inv &&
                                        value > inv.quantity
                                      ) {
                                        return Promise.reject(
                                          new Error(
                                            `Cannot exceed available qty (${inv.quantity})`
                                          )
                                        );
                                      }
                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                                style={{ marginBottom: 0 }}
                              >
                                <InputNumber
                                  max={(() => {
                                    const pid = form.getFieldValue([
                                      "items",
                                      name,
                                      "product",
                                    ]);
                                    return (
                                      inventoryItems.find(
                                        (i) => i.product.id === pid
                                      )?.quantity ?? undefined
                                    );
                                  })()}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>

                            {/* Evidence Photo */}
                            <Col span={4}>
                              <Form.Item
                                {...restField}
                                name={[name, "evidence_photo"]}
                                valuePropName="value"
                                style={{ marginBottom: 0 }}
                                rules={[
                                  {
                                    validator: async (_, value) => {
                                      const lineKey = String(name);
                                      const filesFromMap =
                                        evidenceMap[lineKey] ?? [];
                                      const filesFromField =
                                        (value as UploadFile[] | undefined) ??
                                        [];
                                      const files = filesFromField.length
                                        ? filesFromField
                                        : filesFromMap;

                                      if (files.length === 0) {
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
                                    const lineKey = String(name);
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
                                            cursor: hasThumb
                                              ? "pointer"
                                              : "default",
                                          }}
                                          onClick={() =>
                                            hasThumb &&
                                            openViewerForRow(lineKey, 0)
                                          }
                                          title={
                                            hasThumb ? "Preview" : undefined
                                          }
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
                                                "items",
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
                        ))}
                      </div>
                    )}

                    {/* Add More Button */}
                    {fields.length > 0 && (
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => add({ product: null, quantity: 1 })}
                        style={{ marginTop: 16 }}
                      >
                        Add More
                      </Button>
                    )}
                  </>
                )}
              </Form.List>
            )}
          </Card>
          <Form.Item
            label="Reason"
            required
            name="reason"
            rules={[{ required: true, message: "Please enter a reason" }]}
          >
            <Select allowClear placeholder="Select reason">
              <Option value="Production Consumption">
                Production Consumption
              </Option>
              <Option value="Warehouse Transfer">Warehouse Transfer</Option>
              <Option value="Damaged/Lost">Damaged/Lost</Option>
              <Option value="Return to Supplier">Return to Supplier</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          {reason === "Warehouse Transfer" && (
            <Form.Item
              label="Destination Warehouse"
              required
              name="destination_warehouse"
              rules={[
                {
                  required: true,
                  message: "Please enter a destination warehouse",
                },
              ]}
            >
              <Select allowClear placeholder="Select destination warehouse">
                {warehouses
                  ?.filter((w) => w.name !== form.getFieldValue("warehouse"))
                  .map((w) => (
                    <Option key={w.id} value={w.name}>
                      {w.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}
          <Flex gap={20}>
            <Form.Item
              label="Approved by"
              name="approved_by"
              required
              style={{ width: "100%" }}
              rules={[{ required: true, message: "Please select approved by" }]}
            >
              <Select allowClear placeholder="Select approved by">
                {contactPersons?.items.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Approved Order No."
              name="approved_order_no"
              required
              style={{ width: "100%" }}
              rules={[
                { required: true, message: "Please enter approved order no." },
              ]}
            >
              <Input placeholder="Enter approved order no." />
            </Form.Item>
          </Flex>
          <Form.Item
            label="Approval Letter"
            required
            name="evidence"
            rules={[
              { required: true, message: "Please upload approval evidence" },
            ]}
          >
            <Upload
              action="/api/uploads/direct" // TODO: replace with your backend
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              multiple
              data={(file) => ({
                type:
                  file.type === "application/pdf"
                    ? "pdf"
                    : "stock-out-evidence",
              })}
              accept=".jpg,.png,.pdf"
              listType="picture"
              onPreview={async (file) => {
                let src = file.url;

                if (!src && file.originFileObj) {
                  src = URL.createObjectURL(file.originFileObj as RcFile);
                }

                if (src) {
                  const newWindow = window.open(src, "_blank");
                  newWindow?.focus();
                } else {
                  message.error("No preview available for this file.");
                }
              }}
              itemRender={(originNode, file, currFileList, actions) => {
                const isPdf =
                  file.type === "application/pdf" || file.name.endsWith(".pdf");
                if (isPdf) {
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fafafa",
                        padding: "4px 8px",
                        borderRadius: 4,
                        marginTop: 4,
                      }}
                    >
                      <span>
                        <PaperClipOutlined />
                        <span
                          onClick={() => {
                            if (file.originFileObj) {
                              const src =
                                file.url ||
                                URL.createObjectURL(
                                  file.originFileObj as RcFile
                                );
                              window.open(src, "_blank");
                            }
                          }}
                          style={{ color: "#1677ff", cursor: "pointer" }}
                        >
                          {file.name}
                        </span>
                      </span>
                      <span
                        style={{ cursor: "pointer", color: "#999" }}
                        onClick={actions.remove}
                      >
                        <DeleteOutlined />
                      </span>
                    </div>
                  );
                }
                return originNode;
              }}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Note (Optional)" name="note">
            <TextArea placeholder="Enter note" />
          </Form.Item>
          <Flex style={{ justifyContent: "space-between" }}>
            <Button
              type="default"
              onClick={() => form.resetFields()}
              disabled={mutateLoading}
            >
              Reset
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={mutateLoading}
              loading={mutateLoading}
            >
              Complete Stock Out
            </Button>
          </Flex>
        </Form>
      </Card>

      <Divider plain>
        <Typography.Text
          style={{ fontSize: "12px", fontWeight: 400, color: "#00000073" }}
        >
          Scroll down to see recent stock in history
        </Typography.Text>
      </Divider>

      <StockOutHistory
        items={stockOutHistories}
        isLoading={stockOutHistoryLoading}
      />

      <Modal
        open={openUploadModal}
        onCancel={() => setOpenUploadModal(false)}
        footer={null}
        centered
        // wrapClassName="centered-modal"
      >
        <Typography.Text
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: "#000000D9",
            marginBottom: 8,
          }}
        >
          <span style={{ color: "red" }}>*</span> Evidence Photo
        </Typography.Text>
        <Upload.Dragger {...rowUploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Upload Evidence Photos</p>
          <p className="ant-upload-hint">
            Drag & drop or click to upload. JPEG/PNG only (max 2MB per file)
          </p>
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload.Dragger>
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
          }}
        >
          <Typography.Text
            style={{ fontSize: 20, fontWeight: 500, color: "#000000D9" }}
          >
            Remove Photo
          </Typography.Text>
          <Typography.Text style={{ fontSize: 14, color: "#00000073" }}>
            Are you sure you want to delete this file?
          </Typography.Text>
        </div>
        <Flex justify="center" gap={4} style={{ marginTop: 12 }}>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button type="primary" danger onClick={handleConfirmRemove}>
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

export default StockOut;
