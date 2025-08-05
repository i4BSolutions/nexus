"use client";

import ConfirmModal from "@/components/products/ConfirmModal";
import CreateCategoryModal from "@/components/products/CreateCategoryModal";
import DetailsCard from "@/components/products/DetailsCard";
import PopConfirm from "@/components/products/PopConfirm";
import PriceHistory from "@/components/products/PriceHistory";
import ProductFormModal from "@/components/products/ProductFormModal";
import UsageHistory from "@/components/products/UsageHistory";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { useCategories } from "@/hooks/products/useCategories";
import { useDeactivateProduct } from "@/hooks/products/useDeactivateProduct";
import { useGetProductById } from "@/hooks/products/useGetProductById";
import { useProductCurrencies } from "@/hooks/products/useProductCurrencies";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useDelete } from "@/hooks/react-query/useDelete";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { CreateCategoryFormSchema } from "@/schemas/categories/categories.schemas";
import { ProductFormInput } from "@/schemas/products/products.schemas";
import { CategoryInterface } from "@/types/category/category.type";
import {
  ProductCurrencyInterface,
  ProductInterface,
  ProductPriceHistoryInterface,
  ProductUsageHistory,
} from "@/types/product/product.type";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { App, Button, Space, Spin, Tabs, Tag, Typography } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ProductDetailPage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { message } = App.useApp();

  const [openPopConfirm, setOpenPopConfirm] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryInterface[]>(
    []
  );
  const [currencyOptions, setCurrencyOptions] = useState<
    ProductCurrencyInterface[]
  >([]);
  const [openProductFormModal, setOpenProductFormModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [isOpenCreateCategoryModal, setIsOpenCreateCategoryModal] =
    useState(false);
  const [confirmType, setConfirmType] = useState<"deactivate" | "delete">(
    "deactivate"
  );

  const {
    data,
    isLoading,
    refetch: refetchProduct,
  } = useGetById("products", id);
  const productDetail = data as ProductInterface;
  const updateProduct = useUpdate("products");
  const deleteProduct = useDelete("products");
  const deactivateProduct = useDeactivateProduct();

  const {
    data: categories,
    status: categoriesStatus,
    refetch: refetchCategory,
  } = useCategories();
  const createCategory = useCreate("categories");

  const { data: currencyData, status: currencyStatus } = useProductCurrencies();

  const {
    data: priceHistoryData,
    isLoading: loadingPriceHistory,
    error: productPriceHistoryError,
    refetch: refetchProductPriceHistory,
  } = useGetProductById("get-product-price-history", id);
  const priceHistory = priceHistoryData as ProductPriceHistoryInterface[];

  const { data: usageHistoryData } = useGetProductById("get-usage-history", id);
  const usageHistory = usageHistoryData as ProductUsageHistory;

  useEffect(() => {
    if (categoriesStatus === "success" && categories.data) {
      setCategoryOptions(categories.data);
    }
  }, [categories, categoriesStatus]);

  useEffect(() => {
    if (currencyStatus === "success" && currencyData) {
      setCurrencyOptions(currencyData);
    }
  }, [currencyData]);

  const handleCreateCategory = async (data: CreateCategoryFormSchema) => {
    try {
      await createCategory.mutateAsync(data);
      setIsOpenCreateCategoryModal((prev) => !prev);
      refetchCategory();
      message.success("New category created successfully.");
    } catch {
      message.error("Unexpected error creating category");
    }
  };

  const handleSubmit = async (formData: ProductFormInput) => {
    try {
      const payload = {
        ...formData,
        unit_price: formData.unit_price,
        min_stock: formData.min_stock,
        currency_code_id: parseInt(formData.currency_code_id),
      };
      const { reason, ...rest } = payload;
      await updateProduct.mutateAsync({ id, data: { ...rest, reason } });
      setOpenProductFormModal(false);
      await refetchProductPriceHistory();
      message.success("Product updated successfully");
    } catch (error) {
      console.log(error);
      message.error("Unexpected error updating product");
    }
  };

  if (isLoading || !productDetail) {
    return (
      <div className="text-center py-20">
        <Spin />
      </div>
    );
  }

  const statusTag = () => {
    const { current_stock, min_stock } = productDetail;
    if (current_stock === 0) return <Tag color="red">Out of Stock</Tag>;
    if (current_stock <= min_stock) return <Tag color="orange">Low Stock</Tag>;
    return <Tag color="green">In Stock</Tag>;
  };

  return (
    <section className="max-w-7xl mx-auto py-10 px-4">
      <Breadcrumbs
        items={[
          { title: "Home", href: "/" },
          { title: "Products", href: "/products" },
          { title: productDetail.name },
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
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            type="link"
            onClick={() => router.back()}
            style={{ fontSize: 20, color: "#000" }}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              {productDetail.name}
            </Typography.Title>
            {statusTag()}
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
            open={openPopConfirm}
            setOpen={setOpenPopConfirm}
            onDeactivate={() => {
              setConfirmType("deactivate");
              setOpenConfirmModal(true);
            }}
            onDelete={() => {
              setConfirmType("delete");
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
            children: (
              <DetailsCard
                sku={productDetail.sku}
                category={productDetail.category}
                unit_price={productDetail.unit_price}
                min_stock={productDetail.min_stock}
                updated_at={productDetail.updated_at}
                current_stock={productDetail.current_stock}
              />
            ),
          },
          {
            key: "usage_history",
            label: "Usage History",
            children: <UsageHistory data={usageHistory} />,
          },
          {
            key: "price_history",
            label: "Price History",
            children: (
              <PriceHistory
                priceHistory={priceHistory}
                loading={loadingPriceHistory}
                error={productPriceHistoryError}
              />
            ),
          },
        ]}
      />

      {/* Product Form Modal */}
      {openProductFormModal && (
        <ProductFormModal
          open={openProductFormModal}
          onClose={() => setOpenProductFormModal(false)}
          onSubmit={handleSubmit}
          loading={updateProduct.isPending}
          onCreateCategory={() => setIsOpenCreateCategoryModal(true)}
          mode="edit"
          initialValues={{
            sku: productDetail?.sku,
            name: productDetail?.name,
            category: productDetail?.category,
            currency_code_id: String(productDetail?.currency_code_id),
            unit_price: productDetail?.unit_price,
            min_stock: productDetail?.min_stock,
            description: productDetail?.description ?? "",
          }}
          currencyOptions={currencyOptions}
          categoryOptions={categoryOptions}
        />
      )}

      {isOpenCreateCategoryModal && (
        <CreateCategoryModal
          open={isOpenCreateCategoryModal}
          onClose={() => setIsOpenCreateCategoryModal(false)}
          onSubmit={handleCreateCategory}
          loading={createCategory.isPending}
        />
      )}

      {/* Confirm Modal */}
      {openConfirmModal && (
        <ConfirmModal
          open={openConfirmModal}
          type={confirmType}
          onCancel={() => setOpenConfirmModal(false)}
          onConfirm={async () => {
            if (confirmType === "delete") {
              try {
                await deleteProduct.mutateAsync(id);
                setOpenConfirmModal(false);
                refetchProductPriceHistory();
                message.success("Product deleted successfully");
                router.push("/products");
              } catch (error: any) {
                message.error(error.message);
              }
            } else {
              try {
                await deactivateProduct.mutateAsync({
                  id,
                  is_active: !productDetail.is_active,
                });
                setOpenConfirmModal(false);
                refetchProductPriceHistory();
                message.success("Product deactivated successfully");
                router.push("/products");
              } catch (error: any) {
                message.error(error.message);
              }
            }
          }}
        />
      )}
    </section>
  );
};

export default ProductDetailPage;
