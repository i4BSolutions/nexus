"use client";

import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ProductFormInput,
  productFormInputSchema,
} from "@/schemas/products/products.schemas";
import { CategoryInterface } from "@/types/category/category.type";
import { ProductCurrencyInterface } from "@/types/product/product.type";
import Modal from "../shared/Modal";

const { TextArea } = Input;

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormInput) => void;
  mode: "create" | "edit";
  initialValues?: Partial<ProductFormInput>;
  currencyOptions: ProductCurrencyInterface[];
  categoryOptions: CategoryInterface[];
  onCreateCategory: () => void;
  loading?: boolean;
}

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  mode,
  initialValues,
  currencyOptions = [],
  categoryOptions = [],
  onCreateCategory,
  loading = false,
}: ProductFormModalProps) {
  const isEdit = mode === "edit";

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productFormInputSchema),
    mode: "onBlur",
    defaultValues: {
      sku: "",
      name: "",
      category: "",
      currency_code_id: "",
      unit_price: "",
      min_stock: "",
      description: "",
      reason: "",
    },
  });

  const currentUnitPrice = watch("unit_price");
  const initialPrice = initialValues?.unit_price;

  // Reset form when modal opens/closes or initial values change
  useEffect(() => {
    if (open) {
      const formData = {
        sku: initialValues?.sku || "",
        name: initialValues?.name || "",
        category: initialValues?.category || "",
        currency_code_id: initialValues?.currency_code_id || "",
        unit_price: initialValues?.unit_price || "",
        min_stock: initialValues?.min_stock || "",
        description: initialValues?.description || "",
        reason: "",
      };
      reset(formData);
    } else {
      // Reset to default values when modal closes
      reset({
        sku: "",
        name: "",
        category: "",
        currency_code_id: "",
        unit_price: "",
        min_stock: "",
        description: "",
        reason: "",
      });
    }
  }, [open, initialValues, reset]);

  const handleFormSubmit = async (data: ProductFormInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
      message.error("Failed to submit form. Please try again.");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const showPriceChangeReason =
    isEdit &&
    currentUnitPrice &&
    initialPrice &&
    parseFloat(currentUnitPrice) !== parseFloat(initialPrice);

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={isEdit ? "Edit Product" : "Add New Product"}
      description={
        isEdit
          ? "Edit the details of the product"
          : "Add a new product to your catalog."
      }
    >
      <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
        <Form.Item label="SKU">
          <Controller
            name="sku"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                disabled
                placeholder="Auto-generated SKU"
                value={field.value || ""}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Product Name"
          validateStatus={errors.name ? "error" : ""}
          help={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter product name"
                value={field.value || ""}
                disabled={isSubmitting}
              />
            )}
          />
        </Form.Item>

        <Form.Item
          label="Category"
          validateStatus={errors.category ? "error" : ""}
          help={errors.category?.message}
          required
        >
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                value={field.value || undefined}
                placeholder="Select category"
                allowClear
                disabled={isSubmitting}
                loading={categoryOptions.length === 0}
                notFoundContent={
                  categoryOptions.length === 0
                    ? "Loading..."
                    : "No categories found"
                }
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
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={onCreateCategory}
                      disabled={isSubmitting}
                    >
                      Create New Category
                    </Button>
                  </>
                )}
              >
                {categoryOptions.map((cat) => (
                  <Select.Option key={cat.id} value={cat.category_name}>
                    {cat.category_name}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        <Form.Item
          label="Unit Price"
          validateStatus={
            errors.unit_price || errors.currency_code_id ? "error" : ""
          }
          help={errors.unit_price?.message || errors.currency_code_id?.message}
          required
        >
          <Space.Compact style={{ width: "100%" }}>
            <Controller
              name="currency_code_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  value={field.value || undefined}
                  placeholder="Currency"
                  allowClear
                  disabled={isSubmitting}
                  loading={currencyOptions.length === 0}
                  notFoundContent={
                    currencyOptions.length === 0
                      ? "Loading..."
                      : "No currencies found"
                  }
                  optionFilterProp="children"
                  style={{ width: 120 }}
                >
                  {currencyOptions.map((cur) => (
                    <Select.Option key={cur.id} value={cur.id.toString()}>
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
                <InputNumber
                  {...field}
                  placeholder="Enter unit price"
                  min={0}
                  precision={2}
                  style={{ width: "100%" }}
                  disabled={isSubmitting}
                  value={field.value ? parseFloat(field.value) : undefined}
                  onChange={(value) => field.onChange(value?.toString() || "")}
                />
              )}
            />
          </Space.Compact>
        </Form.Item>

        {showPriceChangeReason && (
          <Form.Item
            label="Reason for Price Change"
            validateStatus={errors.reason ? "error" : ""}
            help={errors.reason?.message}
            required
          >
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  placeholder="Enter reason for price change"
                  rows={3}
                  disabled={isSubmitting}
                  value={field.value || ""}
                />
              )}
            />
          </Form.Item>
        )}

        <Form.Item
          label="Minimum Stock Level"
          validateStatus={errors.min_stock ? "error" : ""}
          help={errors.min_stock?.message}
          required
        >
          <Controller
            name="min_stock"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                placeholder="Enter minimum stock"
                min={0}
                precision={0}
                style={{ width: "100%" }}
                disabled={isSubmitting}
                value={field.value ? parseInt(field.value) : undefined}
                onChange={(value) => field.onChange(value?.toString() || "")}
              />
            )}
          />
        </Form.Item>

        <Form.Item label="Description (Optional)">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                placeholder="Enter product description"
                rows={3}
                disabled={isSubmitting}
                value={field.value || ""}
              />
            )}
          />
        </Form.Item>

        <Form.Item style={{ textAlign: "left", marginBottom: 0 }}>
          <Space>
            <Button onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting || loading}
            >
              {isEdit ? "Update Product" : "Add Product"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
