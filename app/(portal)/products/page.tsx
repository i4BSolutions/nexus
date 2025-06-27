"use client";

import ProductFormModal from "@/components/products/ProductFormModal";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import SearchAndFilters from "@/components/shared/SearchAndFilters";
import StatisticsCards from "@/components/shared/StatisticsCards";
import { ProductFormSchema } from "@/schemas/products/products.schemas";
import { ProductInterface } from "@/types/product/product.type";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  TagOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Button, Divider, message, Space, Table, Tag } from "antd";
import { SortOrder } from "antd/es/table/interface";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const formatField = (value: string | null | undefined) =>
  value?.trim() ? value : "N/A";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [counts, setCounts] = useState({
    total: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState<
    string | undefined
  >();
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<
    {
      id: string;
      currency_code: string;
      currency_name: string;
    }[]
  >([]);
  const [productSKU, setProductSKU] = useState<string>("");

  const [isOpenProductFormModal, setIsOpenProductFormModal] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          pageSize: pagination.pageSize.toString(),
        });

        if (searchText.trim()) params.append("search", searchText.trim());
        if (stockStatusFilter) params.append("stock_status", stockStatusFilter);
        if (selectedCategory) params.append("category", selectedCategory);

        const res = await fetch(`/api/products?${params.toString()}`);
        const result = await res.json();

        if (mounted && result.status === "success") {
          setProducts(result.data.items);
          setPagination((prev) => ({
            ...prev,
            page: result.data.page,
            pageSize: result.data.pageSize,
          }));
          setCounts({
            total: result.data.total,
            lowStock: result.data.lowStock,
            outOfStock: result.data.outOfStock,
          });
        }
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [
    pagination.page,
    pagination.pageSize,
    searchText,
    stockStatusFilter,
    selectedCategory,
  ]);

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
    const fetchProductSKU = async () => {
      try {
        const res = await fetch("/api/products/get-product-sku");
        const data = await res.json();
        console.log(data);
        if (data.status === "success") {
          setProductSKU(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchProductSKU();
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

  const handleAddNewProduct = useCallback(() => {
    setIsOpenProductFormModal(true);
  }, []);

  const handleView = useCallback(
    (product: ProductInterface) => {
      router.push(`/products/${product.id}`);
    },
    [router]
  );

  const handleSubmit = async (data: ProductFormSchema) => {
    console.log(data);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        message.success("Product created successfully");
        setIsOpenProductFormModal(false);
      } else {
        message.error(result.message || "Failed to create product");
      }
    } catch {
      message.error("Unexpected error creating product");
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
          label: cat,
          value: cat,
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
      sorter: (a: ProductInterface, b: ProductInterface) =>
        a.sku.localeCompare(b.sku),
      sortDirections: ["ascend", "descend"] as SortOrder[],
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (sku: string) => (
        <span>
          <TagOutlined style={{ marginRight: 8 }} />
          {sku}
        </span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "Category",
      dataIndex: "category",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: formatField,
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (v: number, record: ProductInterface) =>
        `${v} ${
          currencyOptions.find((c) => Number(c.id) === record.currency_code_id)
            ?.currency_code ?? ""
        }`,
    },
    {
      title: "Min Stock",
      dataIndex: "min_stock",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
    },
    {
      title: "Status",
      dataIndex: "stock",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (stock: number, record: ProductInterface) => {
        if (record.min_stock === 0)
          return <Tag color="#F5222D">Out of Stock</Tag>;
        if (stock <= record.min_stock)
          return <Tag color="#FA8C16">Low Stock</Tag>;
        return <Tag color="#52C41A">In Stock</Tag>;
      },
    },
    {
      title: "Actions",
      onCell: () => ({
        style: {
          borderRight: "none",
        },
      }),
      render: (_: any, product: ProductInterface) => (
        <Space style={{ display: "flex", gap: 0 }}>
          <Button
            type="link"
            onClick={() => handleView(product)}
            style={{ padding: 0 }}
          >
            View
          </Button>
          <Divider type="vertical" />
          <Button
            type="link"
            onClick={() => console.log("view")}
            style={{ padding: 0 }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <Breadcrumbs
        items={[{ title: "Home", href: "/" }, { title: "Products" }]}
      />

      {/* Header Section */}
      <HeaderSection
        title="Products"
        description="Manage your product catalog"
        icon={<TagsOutlined />}
        onAddNew={handleAddNewProduct}
        buttonText="New Product"
        buttonIcon={<PlusOutlined />}
      />

      {/* Statistics */}
      <StatisticsCards
        stats={[
          {
            title: "Total Products",
            value: counts.total,
            icon: <TagsOutlined />,
            bgColor: "#40A9FF",
            gradient: "linear-gradient(90deg, #e6f7ff 0%, #fff 100%)",
            borderColor: "#91D5FF",
          },
          {
            title: "Low Stock Products",
            value: counts.lowStock,
            icon: <ExclamationCircleOutlined />,
            bgColor: "#FFA940",
            gradient: "linear-gradient(90deg, #fffbe6 0%, #fff 100%)",
            borderColor: "#FFD591",
          },
          {
            title: "Out of Stock Products",
            value: counts.outOfStock,
            icon: <ExclamationCircleOutlined />,
            bgColor: "#FF4D4F",
            gradient: "linear-gradient(90deg, #fff1f0 0%, #fff 100%)",
            borderColor: "#FFA39E",
          },
        ]}
      />

      {/* Search & Filter */}
      <SearchAndFilters
        searchPlaceholder="Search by product SKU or Name"
        onSearch={(text) => setSearchText(text)}
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

      {/* Table */}
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.pageSize,
          total: counts.total,
          onChange: (page, pageSize) => {
            setPagination({
              page,
              pageSize: pageSize || 10,
              total: pagination.total,
            });
          },
        }}
        bordered
      />

      <ProductFormModal
        open={isOpenProductFormModal}
        onClose={() => setIsOpenProductFormModal(false)}
        onSubmit={handleSubmit}
        onCreateCategory={() => {}}
        mode="create"
        initialValues={{
          sku: productSKU,
          name: "",
          category: "",
          currency_code_id: 1,
          unit_price: 0,
          min_stock: 0,
          description: "",
        }}
        currencyOptions={currencyOptions}
        categoryOptions={categoryOptions}
      />
    </section>
  );
}
