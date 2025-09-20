"use client";

import CreateCategoryModal from "@/components/products/CreateCategoryModal";
import ProductFormModal from "@/components/products/ProductFormModal";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import SearchAndFilters from "@/components/shared/SearchAndFilters";
import StatisticsCards from "@/components/shared/StatisticsCards";
import { useCategories } from "@/hooks/products/useCategories";
import { useProductCurrencies } from "@/hooks/products/useProductCurrencies";
import { useProducts } from "@/hooks/products/useProducts";
import { useProductSKU } from "@/hooks/products/useProductSKU";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { usePermission } from "@/hooks/shared/usePermission";
import { CreateCategoryFormSchema } from "@/schemas/categories/categories.schemas";
import { ProductFormInput } from "@/schemas/products/products.schemas";
import { CategoryInterface } from "@/types/category/category.type";
import {
  ProductCurrencyInterface,
  ProductInterface,
} from "@/types/product/product.type";
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  TagOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Divider,
  Flex,
  Pagination,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const formatField = (value: string | null | undefined) =>
  value?.trim() ? value : "N/A";

export default function ProductsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [categoryOptions, setCategoryOptions] = useState<CategoryInterface[]>(
    []
  );
  const [currencyOptions, setCurrencyOptions] = useState<
    ProductCurrencyInterface[]
  >([]);
  const [productSKU, setProductSKU] = useState<string>("");
  const [sortField, setSortField] = useState<string>();
  const [sortOrder, setSortOrder] = useState<SortOrder>();
  const [editProduct, setEditProduct] = useState<ProductInterface | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isOpenProductFormModal, setIsOpenProductFormModal] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] =
    useState(false);

  const sortParam =
    sortField && sortOrder
      ? `${sortField}_${sortOrder === "descend" ? "desc" : "asc"}`
      : undefined;

  const hasPermission = usePermission("can_manage_products_suppliers");

  const {
    data: productData,
    isLoading: loadingProduct,
    refetch: refetchProduct,
  } = useProducts({
    page: pagination.page,
    pageSize: pagination.pageSize,
    searchText,
    stockStatusFilter,
    selectedCategory,
    sort: sortParam,
  });

  useEffect(() => {
    if (!productData || !productData.data?.items) return;

    const { total } = productData.data;
    setPagination((prev) => ({ ...prev, total }));
  }, [productData]);

  const products = productData?.data?.items || [];
  const {
    total = 0,
    lowStock = 0,
    outOfStock = 0,
  } = productData?.data?.counts ?? {};

  const counts = { total, lowStock, outOfStock };

  const createProduct = useCreate("products");
  const updateProduct = useUpdate("products");

  const {
    data: categories,
    status: categoriesStatus,
    refetch: refetchCategory,
  } = useCategories();
  const createCategory = useCreate("categories");

  const { data: currencyData, status: currencyStatus } = useProductCurrencies();
  const {
    data: skuData,
    status: skuStatus,
    refetch: refetchSKU,
    isLoading: loadingSKU,
  } = useProductSKU();

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

  useEffect(() => {
    if (skuStatus === "success" && skuData) {
      setProductSKU(skuData);
    }
  }, [skuData]);

  const handleAddNewProduct = useCallback(() => {
    setFormMode("create");
    setEditProduct(null);
    refetchSKU();
    setIsOpenProductFormModal(true);
  }, [refetchSKU]);

  const handleView = useCallback(
    (product: ProductInterface) => {
      router.push(`/products/${product.id}`);
    },
    [router]
  );

  const handleEdit = useCallback((product: ProductInterface) => {
    setFormMode("edit");
    setEditProduct(product);
    setIsOpenProductFormModal((prev) => !prev);
  }, []);

  const handleSubmit = async (form: ProductFormInput) => {
    try {
      const payload = {
        ...form,
        unit_price: form.unit_price,
        min_stock: form.min_stock,
        currency_code_id: parseInt(form.currency_code_id),
      };

      if (formMode === "edit") {
        const { reason, ...rest } = payload;
        await updateProduct.mutateAsync({
          id: String(editProduct?.id),
          data: { ...rest, reason },
        });
        message.success("Product updated successfully");
      } else {
        await createProduct.mutateAsync(payload);
        message.success("Product created successfully");
      }

      setIsOpenProductFormModal(false);
      setEditProduct(null);
      await refetchProduct();
    } catch (err: any) {
      console.error(err);
      message.error("Operation failed");
    }
  };

  const handleCreateCategory = async (data: CreateCategoryFormSchema) => {
    try {
      await createCategory.mutateAsync(data);
      setIsCreateCategoryModalOpen((prev) => !prev);
      await refetchCategory();
      message.success("New category created successfully.");
    } catch (err: any) {
      console.error(err);
      message.error("Unexpected error creating category");
    }
  };

  const filters = [
    {
      key: "category",
      label: "Category",
      placeholder: "Select Category",
      value: selectedCategory ?? "",
      options: [
        { label: "All", value: "" },
        ...categoryOptions.map((cat) => ({
          label: cat.category_name,
          value: cat.category_name,
        })),
      ],
    },
    {
      key: "stock_status",
      label: "Stock Status",
      placeholder: "Select Stock Status",
      value: stockStatusFilter ?? "",
      options: [
        { label: "All", value: "" },
        { label: "In Stock", value: "in_stock" },
        { label: "Low Stock", value: "low_stock" },
        { label: "Out of Stock", value: "out_of_stock" },
      ],
    },
  ];

  const columns = [
    {
      title: "PRODUCT SKU",
      dataIndex: "sku",
      key: "sku",
      sorter: true,
      sortOrder: sortField === "sku" ? (sortOrder as SortOrder) : undefined,
      render: (sku: string) => (
        <span>
          <TagOutlined style={{ marginRight: 8 }} />
          {sku}
        </span>
      ),
    },
    {
      title: "NAME",
      dataIndex: "name",
      render: formatField,
    },
    {
      title: "CATEGORY",
      dataIndex: "category",
      render: formatField,
    },
    {
      title: "UNIT PRICE",
      dataIndex: "unit_price",
      render: (v: number, record: ProductInterface) =>
        `${formatWithThousandSeparator(v)} ${
          currencyData?.find((c) => Number(c.id) === record.currency_code_id)
            ?.currency_code ?? ""
        }`,
    },
    {
      title: "MIN STOCK",
      dataIndex: "min_stock",
      render: (min_stock: number) => (
        <span>{formatWithThousandSeparator(min_stock)}</span>
      ),
    },
    {
      title: "STATUS",
      render: (_: any, record: ProductInterface) => {
        const current = record.current_stock ?? 0;
        const min = record.min_stock ?? 0;

        if (current === 0) return <Tag color="red">Out of Stock</Tag>;
        if (current <= min) return <Tag color="orange">Low Stock</Tag>;
        return <Tag color="green">In Stock</Tag>;
      },
    },
    {
      title: "ACTIONS",
      render: (_: any, product: ProductInterface) => (
        <Space>
          <Button type="link" onClick={() => handleView(product)}>
            View
          </Button>
          {hasPermission && (
            <>
              <Divider type="vertical" />
              <Button type="link" onClick={() => handleEdit(product)}>
                Edit
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 10 });
  };

  // if (loadingProduct || loadingSKU)
  //   return (
  //     <div className="text-center py-20">
  //       <Spin />
  //     </div>
  //   );

  return (
    <section className="max-w-7xl mx-auto">
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Products" }]}
      />
      <HeaderSection
        title="Products"
        description="Manage your product catalog"
        icon={<TagsOutlined />}
        onAddNew={handleAddNewProduct}
        buttonText="New Product"
        hasPermission={hasPermission}
        buttonIcon={<PlusOutlined />}
      />
      <StatisticsCards
        stats={[
          {
            title: "Total Products",
            value: formatWithThousandSeparator(counts.total),
            icon: <TagsOutlined />,
            bgColor: "#40A9FF",
            gradient: "linear-gradient(90deg, #e6f7ff 0%, #fff 100%)",
            borderColor: "#91D5FF",
          },
          {
            title: "Low Stock Products",
            value: formatWithThousandSeparator(counts.lowStock),
            icon: <ExclamationCircleOutlined />,
            bgColor: "#FFA940",
            gradient: "linear-gradient(90deg, #fffbe6 0%, #fff 100%)",
            borderColor: "#FFD591",
          },
          {
            title: "Out of Stock Products",
            value: formatWithThousandSeparator(counts.outOfStock),
            icon: <ExclamationCircleOutlined />,
            bgColor: "#FF4D4F",
            gradient: "linear-gradient(90deg, #fff1f0 0%, #fff 100%)",
            borderColor: "#FFA39E",
          },
        ]}
      />
      <SearchAndFilters
        searchPlaceholder="Search by product SKU or Name"
        onSearch={setSearchText}
        filters={filters}
        onFilterChange={(key, value) => {
          if (key === "category") setSelectedCategory(value);
          if (key === "stock_status") setStockStatusFilter(value);
        }}
        onClearFilters={() => {
          setSelectedCategory(undefined);
          setStockStatusFilter(undefined);
        }}
      />
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loadingProduct || loadingSKU}
        footer={() => (
          <Flex justify="space-between" align="center" gap={4}>
            <Typography.Text>Total {total} items</Typography.Text>
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={total}
              onChange={paginationChangeHandler}
            />
          </Flex>
        )}
        pagination={false}
        bordered
      />

      <ProductFormModal
        open={isOpenProductFormModal}
        loading={
          editProduct
            ? updateProduct.isPending || loadingSKU
            : createProduct.isPending || loadingSKU
        }
        onClose={() => {
          setIsOpenProductFormModal((prev) => !prev);
          setEditProduct(null);
        }}
        onSubmit={handleSubmit}
        onCreateCategory={() => setIsCreateCategoryModalOpen(true)}
        mode={formMode}
        initialValues={
          formMode === "edit" && editProduct
            ? {
                sku: editProduct.sku,
                name: editProduct.name,
                category: editProduct.category,
                currency_code_id: String(editProduct.currency_code_id),
                unit_price: editProduct.unit_price,
                min_stock: editProduct.min_stock,
                description: editProduct.description ?? "",
              }
            : {
                sku: skuData ?? "",
                name: "",
                category: "",
                currency_code_id: "",
                unit_price: 0,
                min_stock: 0,
                description: "",
              }
        }
        currencyOptions={currencyOptions}
        categoryOptions={categoryOptions}
      />

      <CreateCategoryModal
        open={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
        loading={createCategory.isPending}
      />
    </section>
  );
}
