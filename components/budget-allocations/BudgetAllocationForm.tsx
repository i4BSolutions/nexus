"use client";

import { BudgetAllocationsInterface } from "@/types/budget-allocations/budget-allocations.type";
import { ProductCurrencyInterface } from "@/types/product/product.type";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";
import {
  CalendarOutlined,
  CheckCircleFilled,
  LeftOutlined,
  RightOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Form,
  Input,
  DatePicker,
  Select,
  Typography,
  Row,
  Col,
  Upload,
  UploadFile,
  UploadProps,
  Button,
  Tag,
  Modal,
  Carousel,
  App,
} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { RcFile } from "antd/es/upload";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import React, { useState } from "react";

dayjs.extend(utc);

const { TextArea } = Input;
const { Option } = Select;

const fetchCurrencies = async () => {
  const res = await fetch("/api/products/get-product-currencies");
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const json = await res.json();
  return json.data;
};

const fetchPurchaseOrders = async () => {
  const res = await fetch("/api/purchase-orders?pageSize=100");
  if (!res.ok) throw new Error("Failed to fetch purchase orders");
  const json = await res.json();
  return json.data.dto;
};

type BudgetAllocationFormProps = {
  onSubmit: (formData: FormData) => void;
  initialValues?: Partial<BudgetAllocationsInterface>;
  mode?: "create" | "edit";
  isLoading?: boolean;
  onCancel: () => void;
};

const BudgetAllocationForm = ({
  onSubmit,
  initialValues,
  mode = "create",
  isLoading,
  onCancel,
}: BudgetAllocationFormProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>("");
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const allocatedAmountValue = parseFloat(allocatedAmount) || 0;
  const exchangeRateValue = parseFloat(exchangeRate) || 1;

  const usdEquivalent =
    exchangeRateValue > 0 ? allocatedAmountValue / exchangeRateValue : 0;

  const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

  const { data: poData, isLoading: poLoading } = useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: fetchPurchaseOrders,
  });

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        allocation_date: initialValues.allocation_date
          ? dayjs(initialValues.allocation_date)
          : undefined,
        currency_code: initialValues.currency_code,
        po_id: initialValues.po_id,
        allocated_by: initialValues.allocated_by || "",
        note: initialValues.note || "",
        allocated_amount: initialValues.allocation_amount?.toString() || "",
        exchange_rate_usd: initialValues.exchange_rate_usd?.toString() || "",
      });
      setAllocatedAmount(initialValues.allocation_amount?.toString() || "");
      setExchangeRate(initialValues.exchange_rate_usd?.toString() || "");

      // Handle transfer evidence URL(s)
      if (initialValues?.transfer_evidence_urls?.length) {
        const files: UploadFile[] = initialValues.transfer_evidence_urls.map(
          (item, index) => ({
            uid: `-${index}`,
            name: item.key.split("/").pop() || `evidence-${index}`,
            status: "done",
            url: item.url ?? undefined,
          })
        );
        setFileList(files);
        setPreviewUrl(files[0]?.url || "");
      }
    }
  }, [initialValues]);

  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const props: UploadProps = {
    name: "file",
    multiple: true,
    action: "",
    accept: "image/jpeg, image/png",
    onChange(info) {
      let newFileList = [...info.fileList];
      setFileList(newFileList);

      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        const latestFile = info.file.response?.url || info.file.thumbUrl;
        if (latestFile) {
          setPreviewUrl(latestFile);
        } else if (info.file.originFileObj) {
          const url = URL.createObjectURL(info.file.originFileObj);
          setPreviewUrl(url);
        }
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove(file) {
      const newFiles = fileList.filter((f) => f.uid !== file.uid);
      setFileList(newFiles);

      // Revoke old preview URL for safety
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      // Update preview to latest file or clear
      const lastFile = newFiles[newFiles.length - 1];
      if (lastFile?.originFileObj) {
        const newPreviewUrl = URL.createObjectURL(lastFile.originFileObj);
        setPreviewUrl(newPreviewUrl);
      } else {
        setPreviewUrl("");
      }
    },
  };

  const handleSubmit = async (values: any) => {
    const formData = new FormData();

    formData.append("po_id", values.po_id);
    formData.append("allocation_number", values.allocation_number);
    formData.append(
      "allocation_date",
      dayjs(values.allocation_date).format("YYYY-MM-DD")
    );
    formData.append("allocation_amount", allocatedAmount);
    formData.append("currency_code", values.currency_code);
    formData.append("exchange_rate_usd", exchangeRate);
    formData.append("allocated_by", values.allocated_by);
    formData.append("note", values.note || "");
    formData.append("status", values.status || "Pending");

    const validFiles = fileList
      .map((file) => file.originFileObj)
      .filter((f): f is RcFile => !!f);

    if (mode === "create" && validFiles.length === 0) {
      message.error("Please upload at least one transfer proof image");
      return;
    }

    validFiles.forEach((file) => {
      formData.append("file", file);
    });

    onSubmit(formData);
    form.resetFields();
    setFileList([]);
    setPreviewUrl("");
  };

  const poSummaryColumns: ColumnsType<any> = [
    {
      title: "PURCHASE ORDER",
      dataIndex: "purchase_order_no",
      render: (text: string) => (
        <Typography.Link style={{ color: "#1677FF", fontWeight: 500 }}>
          {text}{" "}
          <CheckCircleFilled
            style={{ color: "#52c41a", marginLeft: 4, fontSize: 16 }}
          />
        </Typography.Link>
      ),
    },
    {
      title: "SUPPLIER",
      dataIndex: "supplier",
      render: (supplier_name: string) => (
        <span style={{ fontWeight: 500 }}>{supplier_name}</span>
      ),
    },
    {
      title: "ORDER DATE",
      dataIndex: "order_date",
      render: (date: string) => (
        <span>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
    },
    {
      title: "EXPECTED DELIVERY DATE",
      dataIndex: "expected_delivery_date",
      render: (date: string) => (
        <span>
          <CalendarOutlined style={{ marginRight: 6 }} />
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
    },
    {
      title: "AMOUNT",
      dataIndex: "amount_local",
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{`${formatWithThousandSeparator(
            record.amount_local
          )} ${record.currency_code}`}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
            ({formatWithThousandSeparator(record.amount_usd)} USD)
          </div>
        </div>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      render: (status: string) => (
        <Tag
          color="#f5f5f5"
          style={{
            color: "#000000d9",
            borderRadius: 999,
            padding: "2px 12px",
            fontWeight: 500,
          }}
        >
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: "100%" }}
      >
        <Card
          title={
            <div className="py-2">
              <Typography.Text
                style={{
                  color: "#000000D9",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
              >
                Allocation Details
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "#00000073",
                  display: "block",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22px",
                }}
              >
                Enter the basic details for this budget allocation
              </Typography.Text>
            </div>
          }
          variant="outlined"
          style={{ borderRadius: 8 }}
        >
          {/* <Form form={form} layout="vertical" style={{ maxWidth: "100%" }}> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              required
              name="allocation_number"
              label="Allocation Number"
              rules={[
                { required: true, message: "Please enter allocation number" },
              ]}
            >
              <Input placeholder="Enter allocation number" />
            </Form.Item>

            <Form.Item
              required
              name="allocation_date"
              label="Allocation Date"
              rules={[
                { required: true, message: "Please select allocation date" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select date"
                format="YYYY-MM-DD"
                // disabledDate={(current) =>
                //   current && current < dayjs().startOf("day")
                // }
              />
            </Form.Item>
          </div>

          <Form.Item
            required
            name="po_id"
            label="Purchase Order"
            rules={[
              { required: true, message: "Please select purchase order" },
            ]}
          >
            <Select
              placeholder="Select Purchase Order"
              loading={poLoading}
              allowClear
              onChange={(value) => {
                const po = poData?.find((p: any) => p.id === value);
                setSelectedPO(po);
                form.setFieldValue("po_id", value);
              }}
            >
              {poData?.map((po: any) => (
                <Option key={po.id} value={po.id}>
                  {po.purchase_order_no}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {selectedPO && (
            <div
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                // padding: 16,
                marginTop: 16,
              }}
            >
              <Table
                columns={poSummaryColumns}
                dataSource={[selectedPO]}
                pagination={false}
                showHeader
                bordered={false}
                rowKey="id"
              />
            </div>
          )}
          {/* </Form> */}
        </Card>

        <Card
          title={
            <div>
              <Typography.Text
                style={{
                  color: "#000000D9",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
              >
                Financial Details
              </Typography.Text>
              <Typography.Text
                style={{
                  color: "#00000073",
                  display: "block",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22px",
                }}
              >
                Enter the financial information for this allocation
              </Typography.Text>
            </div>
          }
          variant="outlined"
          style={{ borderRadius: 8, marginTop: 12 }}
        >
          {/* <Form form={form} layout="vertical"> */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Allocated Amount"
                name="allocated_amount"
                required
                rules={[
                  { required: true, message: "Allocated amount is required" },
                  {
                    validator: (_, value) => {
                      const num = parseFloat(value);
                      if (isNaN(num) || num <= 0) {
                        return Promise.reject(
                          new Error("Must be a positive number greater than 0")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  disabled={mode === "edit" ? true : false}
                  addonBefore={
                    <Form.Item
                      name="currency_code"
                      noStyle
                      required
                      rules={[
                        { required: true, message: "Currency is required" },
                      ]}
                    >
                      <Select
                        disabled={mode === "edit" ? true : false}
                        loading={currenciesLoading}
                        placeholder="Currency"
                        style={{ width: 80 }}
                      >
                        {currenciesData?.map(
                          (currency: ProductCurrencyInterface) => (
                            <Option
                              key={currency.currency_code}
                              value={currency.currency_code}
                            >
                              {currency.currency_code}
                            </Option>
                          )
                        )}
                      </Select>
                    </Form.Item>
                  }
                  placeholder="Enter allocated amount"
                  value={allocatedAmount}
                  onChange={(e) =>
                    setAllocatedAmount(e.target.value.replace(/[^\d.]/g, ""))
                  }
                />
              </Form.Item>
            </Col>

            {/* Exchange Rate */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Exchange Rate (to USD)"
                name="exchange_rate_usd"
                required
                rules={[
                  { required: true, message: "Exchange rate is required" },
                  {
                    validator: (_, value) => {
                      const num = parseFloat(value);
                      if (isNaN(num) || num <= 0) {
                        return Promise.reject(
                          new Error("Must be a positive number greater than 0")
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input
                  disabled={mode === "edit" ? true : false}
                  placeholder="Enter exchange rate (USD)"
                  value={exchangeRate}
                  onChange={(e) =>
                    setExchangeRate(e.target.value.replace(/[^\d.]/g, ""))
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Text
            style={{
              color: "#00000073",
              fontSize: 14,
              fontWeight: 400,
              lineHeight: "22px",
            }}
          >
            Allocated Amount (USD Equivalent)
          </Typography.Text>
          <div style={{ fontSize: 20 }}>
            ${" "}
            {usdEquivalent.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {/* </Form> */}
        </Card>

        {/* Transfer Evidence */}
        <Card
          title={
            <div>
              <div
                style={{
                  color: "#000000D9",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "22px",
                }}
              >
                Transfer Evidence
              </div>
              <Typography.Text
                style={{
                  color: "#00000073",
                  display: "block",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22px",
                }}
              >
                Upload proof of funds transfer
              </Typography.Text>
            </div>
          }
          variant="outlined"
          style={{ borderRadius: 8, marginTop: 12 }}
        >
          {/* <Form layout="vertical"> */}
          <Row gutter={24}>
            {/* Left Section */}
            <Col xs={24} md={16}>
              <Form.Item
                name="transfer_proof"
                label="Transfer Proof"
                rules={
                  mode === "create"
                    ? [
                        {
                          required: true,
                          message: "Please upload transfer proof",
                        },
                      ]
                    : []
                }
              >
                <Upload
                  {...props}
                  fileList={fileList}
                  listType="picture"
                  style={{ width: "100%" }}
                >
                  <Button icon={<UploadOutlined />} block>
                    Click to Upload
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="allocated_by"
                label="Allocated By"
                required
                rules={[
                  { required: true, message: "Please enter allocated by" },
                ]}
              >
                <Input
                  disabled={mode === "edit" ? true : false}
                  placeholder="Please Enter Allocated By"
                />
              </Form.Item>

              <Form.Item name="note" label="Note (optional)">
                <TextArea rows={4} placeholder="Enter note" />
              </Form.Item>
            </Col>

            {/* Right Section: Image Preview */}
            <Col xs={24} md={8}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Transfer Proof"
                  style={{
                    height: "100%",
                    objectFit: "contain",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const index = fileList.findIndex(
                      (f) =>
                        f.thumbUrl === previewUrl ||
                        f.url === previewUrl ||
                        (f.originFileObj &&
                          URL.createObjectURL(f.originFileObj) === previewUrl)
                    );
                    setPreviewIndex(index >= 0 ? index : 0);
                    setIsPreviewVisible(true);
                  }}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    minHeight: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography.Text type="secondary">
                    No transfer proof image uploaded
                  </Typography.Text>
                </div>
              )}
            </Col>
          </Row>
          {/* </Form> */}
        </Card>
        <Row style={{ justifyContent: "space-between", marginTop: 12 }}>
          <Button disabled={isLoading} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            loading={isLoading}
            type="primary"
            htmlType="submit"
          >
            {mode === "edit" ? "Update Allocation" : "Create Allocation"}
          </Button>
        </Row>
      </Form>
      <Modal
        open={isPreviewVisible}
        footer={null}
        onCancel={() => setIsPreviewVisible(false)}
        width="100%"
        centered
        style={{ maxWidth: "900px" }}
        className="preview-modal"
      >
        <Carousel
          initialSlide={previewIndex}
          dots
          infinite
          arrows
          className="preview-carousel"
        >
          {fileList.map((file) => {
            const src =
              file.url ||
              file.thumbUrl ||
              (file.originFileObj
                ? URL.createObjectURL(file.originFileObj)
                : "");
            return (
              <div
                key={file.uid}
                style={{
                  textAlign: "center",
                  maxHeight: "75vh",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={src}
                  alt="Transfer Preview"
                  style={{
                    maxHeight: "70vh",
                    width: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              </div>
            );
          })}
        </Carousel>
      </Modal>
      <style jsx global>{`
        .preview-modal .slick-prev,
        .preview-modal .slick-next {
          background-color: rgba(0, 0, 0, 0.25);
          border-radius: 50%;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .preview-modal .slick-prev:hover,
        .preview-modal .slick-next:hover {
          background-color: rgba(0, 0, 0, 0.45);
        }

        .preview-modal .slick-prev::before,
        .preview-modal .slick-next::before {
          color: white;
          font-size: 18px;
        }
      `}</style>
    </>
  );
};

export default BudgetAllocationForm;
