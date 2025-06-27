"use client";

import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Button, message, Space, Tabs, Tag, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ProductInterface } from "@/types/product/product.type";
import { ProductFormSchema } from "@/schemas/products/products.schemas";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import PopConfirm from "../../../../components/products/PopConfirm";
import DetailsCard from "../../../../components/products/DetailsCard";
import ProductFormModal from "../../../../components/products/ProductFormModal";
import ConfirmModal from "@/components/products/ConfirmModal";

const ProductDetailPage = () => {
  const params = useParams() as { id: string };
  const { id } = params;

  const router = useRouter();
  const [productDetail, setProductDetail] = useState<ProductInterface | null>(
    null
  );
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<
    {
      id: string;
      currency_code: string;
      currency_name: string;
    }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [openProductFormModal, setOpenProductFormModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [type, setType] = useState<"deactivate" | "delete">("deactivate");

  const fetchProductDetail = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const result = await res.json();
      if (res.ok && result.status === "success") {
        setProductDetail(result.data);
      } else {
        message.error("Failed to fetch product");
      }
    } catch {
      message.error("Error fetching product");
    }
  };

  useEffect(() => {
    fetchProductDetail();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.status === "success") {
        const cleaned = data.data
          .map((cat: any) => cat.category_name)
          .filter((c: string) => !!c && c.trim());
        setCategoryOptions(cleaned);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("/api/products/get-product-currencies");
        const data = await res.json();
        console.log(data);
        if (data.status === "success") {
          setCurrencyOptions(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchCurrencies();
  }, []);

  const handleSubmit = async (data: ProductFormSchema) => {
    console.log(data);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        message.success("Product updated successfully");
        setOpenProductFormModal(false);
      } else {
        message.error(result.message || "Failed to create product");
      }
    } catch {
      message.error("Unexpected error creating product");
    }
  };

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      <Breadcrumbs
        items={[
          { title: "Home", href: "/" },
          { title: "Products", href: "/products" },
          { title: `${productDetail?.name}`, href: `/products/${id}` },
        ]}
      />

      {/* Header */}
      <Space
        align="center"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Space align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            type="link"
            onClick={() => router.back()}
            style={{ fontSize: 20, color: "#000" }}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              {productDetail?.name}
            </Typography.Title>
            {productDetail && (
              <Tag
                color={
                  productDetail.stock === 0
                    ? "#F5222D"
                    : productDetail.stock <= productDetail.min_stock
                    ? "#FA8C16"
                    : "#52C41A"
                }
                style={{ marginTop: 0 }}
              >
                {productDetail.stock === 0
                  ? "Out of Stock"
                  : productDetail.stock <= productDetail.min_stock
                  ? "Low Stock"
                  : "In Stock"}
              </Tag>
            )}
          </Space>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setOpenProductFormModal(true)}
          >
            Edit Product
          </Button>
          <PopConfirm
            open={open}
            setOpen={setOpen}
            onDeactivate={() => {
              setType("deactivate");
              setOpenConfirmModal(true);
            }}
            onDelete={() => {
              setType("delete");
              setOpenConfirmModal(true);
            }}
          />
        </Space>
      </Space>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: "details",
            label: "Details",
            children: productDetail?.category && (
              <DetailsCard
                sku={productDetail.sku}
                category={productDetail.category}
                unit_price={productDetail.unit_price}
                min_stock={productDetail.min_stock}
                updated_at={productDetail.updated_at}
              />
            ),
          },
          {
            key: "usage_history",
            label: "Usage History",
            // children: <HistoryCard />,
          },
          {
            key: "price_history",
            label: "Price History",
            // children: <HistoryCard />,
          },
        ]}
      />

      {openProductFormModal && (
        <ProductFormModal
          open={openProductFormModal}
          onClose={() => setOpenProductFormModal(false)}
          onCreateCategory={() => {}}
          mode="edit"
          onSubmit={handleSubmit}
          initialValues={{
            sku: productDetail?.sku || "",
            name: productDetail?.name || "",
            category: productDetail?.category || "",
            unit_price: productDetail?.unit_price || 0,
            min_stock: productDetail?.min_stock || 0,
            currency_code_id: productDetail?.currency_code_id,
            description: productDetail?.description || "",
          }}
          currencyOptions={currencyOptions}
          categoryOptions={categoryOptions}
        />
      )}

      {openConfirmModal && (
        <ConfirmModal
          open={openConfirmModal}
          type={type}
          onCancel={() => {
            setOpenConfirmModal(false);
          }}
          onConfirm={() => {}}
        />
      )}

      {openConfirmModal && (
        <ConfirmModal
          open={openConfirmModal}
          type={type}
          onCancel={() => {
            setOpenConfirmModal(false);
          }}
          onConfirm={() => {}}
        />
      )}
    </section>
  );
};

export default ProductDetailPage;
