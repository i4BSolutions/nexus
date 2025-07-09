"use client";

import { ProductCurrencyInterface } from "@/types/product/product.type";
import { UploadOutlined } from "@ant-design/icons";
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
  message,
  Button,
} from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";

const { TextArea } = Input;
const { Option } = Select;

const fetchCurrencies = async () => {
  const res = await fetch("/api/products/get-product-currencies");
  if (!res.ok) throw new Error("Failed to fetch currencies");
  const json = await res.json();
  return json.data;
};

const BudgetAllocationForm = () => {
  const [form] = Form.useForm();
  const [allocatedAmount, setAllocatedAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>("");

  const allocatedAmountValue = parseFloat(allocatedAmount) || 0;
  const exchangeRateValue = parseFloat(exchangeRate) || 1;

  const usdEquivalent =
    exchangeRateValue > 0 ? allocatedAmountValue / exchangeRateValue : 0;

  const { data: currenciesData, isLoading: currenciesLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: fetchCurrencies,
  });

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

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        console.log("Form Submitted:", {
          ...values,
          allocated_amount: allocatedAmount,
          exchange_rate_usd: exchangeRate,
          file_list: fileList, // your uploaded files
        });
      }}
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
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>
        </div>

        <Form.Item
          required
          name="po_id"
          label="Purchase Order"
          rules={[{ required: true, message: "Please select purchase order" }]}
        >
          <Select placeholder="Select Purchase Order" allowClear>
            <Option value="po-1">PO-001</Option>
            <Option value="po-2">PO-002</Option>
            {/* Replace with actual PO options */}
          </Select>
        </Form.Item>
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
              rules={[
                { required: true, message: "Please upload transfer proof" },
              ]}
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
              rules={[{ required: true, message: "Please enter allocated by" }]}
            >
              <Input placeholder="Please Enter Allocated By" />
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
                style={{ height: "100%", objectFit: "contain" }}
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
        <Button>Cancel</Button>
        <Button type="primary" htmlType="submit">
          Create Allocation
        </Button>
      </Row>
    </Form>
  );
};

export default BudgetAllocationForm;
