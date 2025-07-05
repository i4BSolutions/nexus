"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

// Ant Design Components
import { Form, Input, Select, Space, Typography } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

// React Query Hooks
import { useQuery } from "@tanstack/react-query";
import { useList } from "@/hooks/react-query/useList";
import { useCreate } from "@/hooks/react-query/useCreate";

// Components
import RegionCreateModal from "@/components/purchase-orders/RegionCreateModal";
import SupplierCreateModal from "@/components/suppliers/SupplierModal";

// Types
import { PurchaseOrderRegionInterface } from "@/types/purchase-order/purchase-order-region.type";
import { SuppliersResponse } from "@/types/supplier/supplier.type";

interface StepSupplierRegionProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export interface StepSupplierRegionRef {
  submitForm: () => void;
  getFormData: () => any;
}

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

const StepSupplierRegion = forwardRef<
  StepSupplierRegionRef,
  StepSupplierRegionProps
>(({ onNext, onBack, formData }, ref) => {
  const [form] = Form.useForm();

  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionOptions, setRegionOptions] = useState<
    { value: number | string; label: string }[]
  >([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // Fetch all suppliers
  const {
    data: suppliersData,
    refetch: refetchSuppliers,
    isLoading: suppliersLoading,
  } = useList("suppliers", {
    pageSize: "all" as any,
    status: "true",
  });

  // Create Region
  const { mutate: createRegion } = useCreate(
    "/purchase-orders/purchase-orders-regions"
  );

  // Create Supplier
  const { mutate: createSupplier } = useCreate("/suppliers");

  // Fetch Regions
  const {
    data: regionsData,
    refetch: refetchRegions,
    isLoading: regionsLoading,
  } = useQuery({
    queryKey: ["purchase-order-regions"],
    queryFn: fetchRegions,
  });

  // Fetch PO Number
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

    // Pre-populate form with existing data
    if (formData) {
      form.setFieldsValue(formData);
    }
  }, [regionsData, poNumberData, form, formData, suppliersData]);

  const handleNext = () => {
    form.validateFields().then((values) => {
      onNext(values);
    });
  };

  const handleRegionCreate = (values: any) => {
    createRegion(values, {
      onSuccess: () => {
        form.setFieldValue("region", values.name);
        setIsRegionModalOpen(false);
        refetchRegions();
      },
    });
  };

  const handleSupplierCreate = (values: any) => {
    createSupplier(values, {
      onSuccess: () => {
        form.setFieldValue("supplier", values.id);
        setIsSupplierModalOpen(false);
        refetchSuppliers();
      },
    });
  };

  // Expose submitForm method to parent component
  useImperativeHandle(ref, () => ({
    submitForm: handleNext,
    getFormData: () => form.getFieldsValue(),
  }));

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleNext}
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
                  onClick={() => setIsSupplierModalOpen(true)}
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
                  label: (
                    <div onClick={() => setIsSupplierModalOpen(true)}>
                      <PlusCircleOutlined style={{ marginRight: 8 }} />
                      Create New Supplier
                    </div>
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
              options={[
                ...regionOptions,
                {
                  label: (
                    <div onClick={() => setIsRegionModalOpen(true)}>
                      <PlusCircleOutlined style={{ marginRight: 8 }} />
                      Create New Region
                    </div>
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
          handleRegionCreate(values);
        }}
      />

      <SupplierCreateModal
        open={isSupplierModalOpen}
        isEdit={false}
        onClose={() => setIsSupplierModalOpen(false)}
        onSubmit={(values) => {
          handleSupplierCreate(values);
        }}
      />
    </div>
  );
});

StepSupplierRegion.displayName = "StepSupplierRegion";

export default StepSupplierRegion;
