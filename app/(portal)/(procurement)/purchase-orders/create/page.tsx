"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Ant Design Components
import { Form, Input, Select, Space, Typography } from "antd";
import { ArrowLeftOutlined, PlusCircleOutlined } from "@ant-design/icons";

// Components
import CreationSteps from "@/components/purchase-orders/CreationSteps";
import RegionCreateModal from "@/components/purchase-orders/RegionCreateModal";

// React Query Hooks
import { useQuery } from "@tanstack/react-query";
import { useList } from "@/hooks/react-query/useList";
import { useCreate } from "@/hooks/react-query/useCreate";

// Types
import { PurchaseOrderRegionInterface } from "@/types/purchase-order/purchase-order-region.type";
import { SuppliersResponse } from "@/types/supplier/supplier.type";

const fetchRegions = async () => {
  const res = await fetch("/api/purchase-orders/purchase-orders-regions");
  if (!res.ok) throw new Error("Failed to fetch regions");
  const json = await res.json();
  return { items: json.data };
};

const fetchPoNumber = async () => {
  const res = await fetch("/api/purchase-orders/get-purchase-order-no");
  if (!res.ok) throw new Error("Failed to fetch PO number");
  const json = await res.json();
  return json.data;
};

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionOptions, setRegionOptions] = useState<
    { value: number | string; label: string }[]
  >([]);

  const { data: suppliersData, isLoading: suppliersLoading } = useList(
    "suppliers",
    {
      pageSize: "all" as any,
      status: "true",
    }
  );

  const { mutate: createRegion } = useCreate(
    "/purchase-orders/purchase-orders-regions"
  );

  const { data: regionsData, isLoading: regionsLoading } = useQuery({
    queryKey: ["purchase-order-regions"],
    queryFn: fetchRegions,
  });

  const { data: poNumberData, isLoading: poNumberLoading } = useQuery({
    queryKey: ["purchase-order-no"],
    queryFn: fetchPoNumber,
  });

  useEffect(() => {
    if (regionsData?.items) {
      const options = regionsData.items.map(
        (region: PurchaseOrderRegionInterface) => ({
          value: region.id,
          label: region.name,
        })
      );
      setRegionOptions(options);
    }

    if (poNumberData) {
      form.setFieldValue("po_number", poNumberData);
    }
  }, [regionsData, poNumberData]);

  const handleRegionChange = (value: string | number) => {
    if (value === "create_new") {
      setIsRegionModalOpen(true);
    } else {
      form.setFieldValue("region", value);
    }
  };

  return (
    <section className="max-w-7xl mx-auto py-4 px-6">
      <Space
        size="small"
        style={{
          display: "flex",
          marginBottom: "16px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Space size="middle">
          <ArrowLeftOutlined
            style={{ fontSize: 16 }}
            onClick={() => router.back()}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              Create New Purchase Order
            </Typography.Title>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Fill in the details and add products to create a new purchase
              order
            </Typography.Paragraph>
          </Space>
        </Space>
      </Space>

      <CreationSteps currentStep={0} />

      <Form
        form={form}
        layout="vertical"
        onFinish={() => {}}
        requiredMark="optional"
      >
        <Form.Item
          label={
            <div className="flex items-center">
              <Typography.Paragraph
                style={{
                  color: "red",
                  fontSize: 20,
                  margin: "6px 4px 0 0",
                }}
              >
                *
              </Typography.Paragraph>
              <Typography.Text style={{ fontSize: 16 }}>
                PO Number
              </Typography.Text>
            </div>
          }
          name="po_number"
          rules={[{ required: true, message: "PO number is required" }]}
        >
          <Input
            size="large"
            placeholder={poNumberLoading ? "Loading..." : "Enter PO number"}
            disabled
          />
        </Form.Item>

        <Space
          size="middle"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <Form.Item
            style={{ width: "510px" }}
            label={
              <Space
                style={{ justifyContent: "space-between", width: "510px" }}
              >
                <div className="flex items-center">
                  <Typography.Paragraph
                    style={{
                      color: "red",
                      fontSize: 20,
                      margin: "6px 4px 0 0",
                    }}
                  >
                    *
                  </Typography.Paragraph>
                  <Typography.Text style={{ fontSize: 16 }}>
                    Supplier
                  </Typography.Text>
                </div>
                <Typography.Link
                  style={{ fontSize: 14, fontWeight: 500, marginRight: 0 }}
                >
                  Create New
                </Typography.Link>
              </Space>
            }
            name="supplier"
            rules={[{ required: true, message: "Supplier is required" }]}
          >
            <Select
              size="large"
              placeholder={
                suppliersLoading ? "Loading suppliers..." : "Select supplier"
              }
              loading={suppliersLoading}
              showSearch
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === "string") {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
              options={[
                ...((suppliersData as SuppliersResponse)?.items?.map((s) => ({
                  value: s.id,
                  label: s.name,
                })) || []),
                {
                  value: "create_new",
                  label: (
                    <span>
                      <PlusCircleOutlined style={{ marginRight: 8 }} />
                      Create New Supplier
                    </span>
                  ),
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            style={{ width: "510px" }}
            label={
              <Space
                style={{ justifyContent: "space-between", width: "510px" }}
              >
                <div className="flex items-center w-full">
                  <Typography.Paragraph
                    style={{
                      color: "red",
                      fontSize: 20,
                      margin: "6px 4px 0 0",
                    }}
                  >
                    *
                  </Typography.Paragraph>
                  <Typography.Text style={{ fontSize: 16 }}>
                    Region
                  </Typography.Text>
                </div>

                <Typography.Link
                  style={{ fontSize: 14, fontWeight: 500, marginRight: 0 }}
                  onClick={() => setIsRegionModalOpen(true)}
                >
                  Create New
                </Typography.Link>
              </Space>
            }
            name="region"
            rules={[{ required: true, message: "Region is required" }]}
          >
            <Select
              size="large"
              placeholder={
                regionsLoading ? "Loading regions..." : "Select region"
              }
              loading={regionsLoading}
              showSearch
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === "string") {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
              onChange={handleRegionChange}
              options={[
                ...regionOptions,
                {
                  value: "create_new",
                  label: (
                    <span>
                      <PlusCircleOutlined style={{ marginRight: 8 }} />
                      Create New Region
                    </span>
                  ),
                },
              ]}
            />
          </Form.Item>
        </Space>
      </Form>

      <RegionCreateModal
        open={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        onSubmit={(values) => {
          createRegion(values, {
            onSuccess: () => {
              form.setFieldValue("region", values.name);
              setIsRegionModalOpen(false);
            },
          });
        }}
      />
    </section>
  );
}
