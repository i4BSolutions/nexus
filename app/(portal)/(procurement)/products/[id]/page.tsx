"use client";

// React & Next
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

// Ant Design
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { App, Button, Space, Spin, Tabs, Tag, Typography } from "antd";

// Components
import ConfirmModal from "@/components/products/ConfirmModal";
import CreateCategoryModal from "@/components/products/CreateCategoryModal";
import DetailsCard from "@/components/products/DetailsCard";
import PopConfirm from "@/components/products/PopConfirm";
import ProductHistory from "@/components/products/ProductHistory";
import ProductFormModal from "@/components/products/ProductFormModal";
import UsageHistory from "@/components/products/UsageHistory";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import DynamicPricing from "@/components/products/DynamicPricing";

// Hooks
import { useCategories } from "@/hooks/products/useCategories";
import { useDeactivateProduct } from "@/hooks/products/useDeactivateProduct";
import { useGetProductById } from "@/hooks/products/useGetProductById";
import { useProductCurrencies } from "@/hooks/products/useProductCurrencies";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useDelete } from "@/hooks/react-query/useDelete";
import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { usePermission } from "@/hooks/shared/usePermission";
import { usePaginatedById } from "@/hooks/react-query/usePaginatedById";
import { useQuery } from "@tanstack/react-query";
import { useGetAll } from "@/hooks/react-query/useGetAll";

// Schema and Types
import { CreateCategoryFormSchema } from "@/schemas/categories/categories.schemas";
import { ProductFormInput } from "@/schemas/products/products.schemas";
import { CategoryInterface } from "@/types/category/category.type";
import { PurchaseOrderRegionsResponse } from "@/types/purchase-order/purchase-order-region.type";
import { PersonInterface } from "@/types/person/person.type";
import {
  ProductCurrencyInterface,
  ProductHistoryPaginatedResponse,
  ProductInterface,
  ProductUsageHistory,
} from "@/types/product/product.type";

import { downloadBlob, toCSV } from "@/utils/product/exportCSV";

const ProductDetailPage = () => {
  const hasPermission = usePermission("can_manage_products_suppliers");
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { message } = App.useApp();

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const [dynamicPricingPagination, setDynamicPricingPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const [dynamicPricingFilters, setDynamicPricingFilters] = useState({
    currency: "",
    region: "",
    contact_person: "",
  });

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

  // version 0 product price log
  // const {
  //   data: priceHistoryData,
  //   isLoading: loadingPriceHistory,
  //   error: productPriceHistoryError,
  //   refetch: refetchProductPriceHistory,
  // } = useGetProductById("get-product-price-history", id);
  // const priceHistory = priceHistoryData as ProductPriceHistoryInterface[];

  // version 1 product audit log
  const {
    data: auditLogData,
    isLoading: auditLogLoading,
    error: auditLogError,
    refetch: refetchAuditLog,
  } = usePaginatedById<ProductHistoryPaginatedResponse>(
    "products/get-product-log-history",
    id,
    pagination
  );

  const handleLogPaginationChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  useEffect(() => {
    refetchAuditLog();
  }, [pagination]);

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
      await refetchAuditLog();
      message.success("Product updated successfully");
    } catch (error) {
      console.log(error);
      message.error("Unexpected error updating product");
    }
  };

  const fetchProductDynamicPricing = async ({
    queryKey,
  }: {
    queryKey: [
      string,
      {
        page: number;
        pageSize: number;
        currency: string;
        region: string;
        contactPerson: string;
      }
    ];
  }) => {
    const [, params] = queryKey;
    const query = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString(),
      currency: params.currency,
      regionId: params.region,
      contactPersonId: params.contactPerson,
    }).toString();

    const res = await fetch(
      `/api/products/get-product-dynamic-pricing/${id}?${query}`,
      {
        method: "GET",
      }
    );
    return res.json();
  };

  const {
    data: pricingData,
    refetch: pricingRefetch,
    isLoading: pricingLoading,
  } = useQuery({
    queryKey: [
      "products/get-product-dynamic-pricing",
      {
        page: dynamicPricingPagination.page,
        pageSize: dynamicPricingPagination.pageSize,
        currency: dynamicPricingFilters.currency,
        region: dynamicPricingFilters.region,
        contactPerson: dynamicPricingFilters.contact_person,
      },
    ],
    queryFn: fetchProductDynamicPricing,
  });

  useEffect(() => {
    pricingRefetch();
  }, [dynamicPricingPagination, dynamicPricingFilters]);

  const handleDynamicPricingPagination = (page: number, pageSize: number) => {
    setDynamicPricingPagination((prev) => ({
      page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  const { data: currencies } = useProductCurrencies();

  const { data: regionsRaw } = useGetAll(
    "purchase-orders/purchase-orders-regions",
    ["regions"]
  );

  const regions = regionsRaw as PurchaseOrderRegionsResponse[];

  const { data: contactPersonsRaw } = useGetAll("persons", ["contact_persons"]);

  const contactPersons = contactPersonsRaw as PersonInterface[];

  const filtersForUI = useMemo(
    () => [
      {
        key: "currency",
        label: "Currency",
        placeholder: "Select Currency",
        value: dynamicPricingFilters.currency, // 👈 bind to object state
        options: [
          { label: "All Currencies", value: "" },
          ...(currencies?.map((c: any) => ({
            label: c.currency_code,
            value: c.currency_code, // code
          })) || []),
        ],
      },
      {
        key: "region",
        label: "Region",
        placeholder: "Select Region",
        value: dynamicPricingFilters.region, // 👈 id
        options: [
          { label: "All Regions", value: "" },
          ...(regions?.map((region: any) => ({
            label: region.name,
            value: region.id, // id
          })) || []),
        ],
      },
      {
        key: "contact_person",
        label: "Contact Person",
        placeholder: "Select Contact Person",
        value: dynamicPricingFilters.contact_person, // 👈 id
        options: [
          { label: "All Contacts Person", value: "" },
          ...(contactPersons?.map((person: any) => ({
            label: person.name,
            value: person.id, // id
          })) || []),
        ],
      },
    ],
    [dynamicPricingFilters, currencies, regions, contactPersons]
  );

  const handleDynamicPricingFilterChange = (key: any) => (value: any) => {
    setDynamicPricingFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDynamicPricingClearFilter = () => {
    setDynamicPricingFilters({
      currency: "",
      region: "",
      contact_person: "",
    });
  };

  const buildDynamicPricingQuery = () => {
    const q: Record<string, string> = {};
    if (dynamicPricingFilters.currency)
      q.currency = dynamicPricingFilters.currency;
    if (dynamicPricingFilters.region)
      q.regionId = String(dynamicPricingFilters.region);
    if (dynamicPricingFilters.contact_person)
      q.contactPersonId = String(dynamicPricingFilters.contact_person);
    return q;
  };

  const handleExportDynamicPricingCSV = async () => {
    const params = buildDynamicPricingQuery();

    // fetch once to get total, then paginate in chunks
    const firstQs = new URLSearchParams({
      page: "1",
      pageSize: "1",
      ...params,
    }).toString();

    const firstRes = await fetch(
      `/api/products/get-product-dynamic-pricing/${id}?${firstQs}`
    );
    const firstJson = await firstRes.json();
    const total = firstJson?.data?.pagination?.total ?? 0;
    if (!total) {
      downloadBlob(toCSV([]), `dynamic-pricing-${id}.csv`);
      return;
    }

    const pageSize = 500;
    const totalPages = Math.ceil(total / pageSize);

    let allItems: any[] = [];
    for (let page = 1; page <= totalPages; page++) {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...params,
      }).toString();

      const res = await fetch(
        `/api/products/get-product-dynamic-pricing/${id}?${qs}`
      );
      const json = await res.json();
      const items = json?.data?.items ?? [];
      allItems = allItems.concat(items);
    }

    allItems.map((item) => {
      item.unit_price_local = item.unit_price_local.toFixed(2);
      item.exchange_rate = item.exchange_rate.toFixed(2);
      item.unit_price_usd = item.unit_price_usd.toFixed(2);
    });

    const csv = toCSV(allItems);
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");
    downloadBlob(csv, `Dynamic Pricing-${id}-${timestamp}.csv`);
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
    <section className="max-w-7xl mx-auto">
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

        {hasPermission && (
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
        )}
      </Space>

      {/* Tabs */}
      <Tabs
        size="large"
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
            key: "dynamic_pricing",
            label: "Dynamic Pricing",
            children: (
              <DynamicPricing
                data={pricingData?.data}
                filters={filtersForUI}
                pagination={dynamicPricingPagination}
                onPaginationChange={handleDynamicPricingPagination}
                handleFilterChange={handleDynamicPricingFilterChange}
                handleClearFilter={handleDynamicPricingClearFilter}
                onExportCSV={handleExportDynamicPricingCSV}
                loading={pricingLoading}
              />
            ),
          },
          {
            key: "product_log",
            label: "Product Log",
            children: (
              <ProductHistory
                data={auditLogData}
                loading={auditLogLoading}
                error={auditLogError}
                pagination={pagination}
                onPaginationChange={handleLogPaginationChange}
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
                refetchAuditLog();
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
                refetchAuditLog();
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
