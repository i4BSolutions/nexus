"use client";

import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ProductFormSchema,
  productFormSchema,
} from "@/schemas/products/products.schemas";
import {
  EditOutlined,
  PlusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEffect } from "react";

const { TextArea } = Input;
const { Option } = Select;

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormSchema) => void;
  mode: "create" | "edit";
  initialValues?: Partial<ProductFormSchema>;
  currencyOptions: {
    currency_code: string;
    currency_name: string;
  }[];
  categoryOptions: string[];
  onCreateCategory: () => void;
}

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  mode,
  initialValues,
  currencyOptions,
  categoryOptions,
  onCreateCategory,
}: ProductFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
    reValidateMode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset({ ...initialValues });
      } else {
        reset();
      }
      clearErrors(); // clears any lingering validation errors
    }
  }, [initialValues, reset, open, clearErrors]);

  const isEdit = mode === "edit";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText={isEdit ? "Update Product" : "Add Product"}
      cancelText="Cancel"
      footer={null}
      centered
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            backgroundColor: "#7C3AED",
            color: "white",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {isEdit ? <EditOutlined /> : <PlusOutlined />}
        </div>
        <div>
          <Typography.Text strong style={{ fontSize: 16 }}>
            {isEdit ? "Edit Product" : "Add New Product"}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {isEdit
              ? "Update this product’s details."
              : "Add a new product to your catalog."}
          </Typography.Text>
        </div>
      </div>
      <Divider style={{ margin: "12px 0" }} />

      {/* Form */}
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* SKU */}
        <Form.Item label="Product SKU">
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <Input {...field} disabled placeholder="AA-100000" />
            )}
          />
        </Form.Item>

        {/* Name */}
        <Form.Item
          label="Product Name"
          required
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter product name" />
            )}
          />
        </Form.Item>

        {/* Category */}
        <Form.Item
          label="Category"
          required
          validateStatus={errors.category ? "error" : ""}
          help={errors.category?.message}
        >
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select category"
                allowClear
                popupRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: "4px 0" }} />
                    <Button
                      type="link"
                      style={{
                        padding: "8px",
                        cursor: "pointer",
                        color: "#000000D9",
                        fontWeight: 400,
                        fontSize: "14px",
                      }}
                      icon={<PlusCircleOutlined />}
                      onMouseDown={(e) => e.preventDefault()} // Prevents focus loss
                      onClick={onCreateCategory}
                    >
                      Create New Category
                    </Button>
                  </>
                )}
              >
                {categoryOptions.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        {/* Unit Price and Currency */}
        <Form.Item
          label="Unit Price"
          required
          validateStatus={
            errors.unit_price || errors.currency_code ? "error" : ""
          }
          help={errors.unit_price?.message || errors.currency_code?.message}
        >
          <Space.Compact style={{ width: "100%" }}>
            <Controller
              name="currency_code"
              control={control}
              render={({ field }) => (
                <Select {...field} style={{ width: 100 }}>
                  {currencyOptions.map((cur) => (
                    <Select.Option
                      key={cur.currency_code}
                      value={cur.currency_code}
                    >
                      {cur.currency_code}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
            <Controller
              name="unit_price"
              control={control}
              render={({ field }) => (
                <InputNumber {...field} min={0} style={{ width: "100%" }} />
              )}
            />
          </Space.Compact>
        </Form.Item>

        {/* Minimum Stock */}
        <Form.Item
          label="Minimum Stock Level"
          required
          validateStatus={errors.min_stock ? "error" : ""}
          help={errors.min_stock?.message}
        >
          <Controller
            name="min_stock"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0} style={{ width: "100%" }} />
            )}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item label="Description (optional)">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder="Enter product description"
                rows={3}
              />
            )}
          />
        </Form.Item>

        {/* Footer Buttons */}
        <Form.Item style={{ textAlign: "left", marginBottom: 0 }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {isEdit ? "Update Product" : "Add Product"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
