"use client";

import { useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Space, Typography, Form, Input, Select } from "antd";

import { useList } from "@/hooks/react-query/useList";
import { useCreate } from "@/hooks/react-query/useCreate";

import PersonCreateModal from "@/components/purchase-orders/PersonCreateModal";

import { PersonInterface, PersonResponse } from "@/types/person/person.type";
import { PlusCircleOutlined } from "@ant-design/icons";

interface StepContactPersonsProps {
  onNext: (values: any) => void;
  onBack: () => void;
  formData?: any;
}

export interface StepContactPersonsRef {
  submitForm: () => void;
  getFormData: () => any;
}

const StepContactPersons = forwardRef<
  StepContactPersonsRef,
  StepContactPersonsProps
>(({ onNext, onBack, formData }, ref) => {
  const [form] = Form.useForm();

  const [isPersonCreateModalOpen, setIsPersonCreateModalOpen] = useState(false);
  const [personCreateTargetField, setPersonCreateTargetField] = useState<
    "contact_person" | "sign_person" | "authorized_sign_person" | null
  >(null);

  useEffect(() => {
    // Pre-populate form with existing data
    if (formData) {
      form.setFieldsValue(formData);
    }
  }, [formData, form]);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      form.submit();
    },
    getFormData: () => form.getFieldsValue(),
  }));

  const handleNext = () => {
    form.validateFields().then((values) => {
      onNext(values);
    });
  };

  const {
    data: personsDataRaw,
    isLoading: personsLoading,
    refetch: refetchPersons,
  } = useList("persons", {
    pageSize: "all" as any,
  });

  const personsData = personsDataRaw as PersonResponse;

  const { mutate: createPerson } = useCreate("persons");

  // Watch selected values for all three fields
  const contactPerson = Form.useWatch("contact_person", form);
  const signPerson = Form.useWatch("sign_person", form);
  const authorizedSignPerson = Form.useWatch("authorized_sign_person", form);

  // Helper to filter options for each dropdown
  const getFilteredOptions = (exclude: (string | number | undefined)[]) => {
    return (personsData?.items as PersonInterface[] | undefined)
      ?.filter((person) => !exclude.includes(person.id))
      .map((person) => ({
        label:
          person.name +
          " (" +
          person.rank +
          ") " +
          " (" +
          person.department +
          ")",
        value: person.id,
      }));
  };

  const handlePersonCreate = (values: { name: string }) => {
    createPerson(values, {
      onSuccess: (data: unknown) => {
        const createdPerson = data as PersonInterface;
        if (personCreateTargetField && createdPerson?.id) {
          form.setFieldValue(personCreateTargetField, createdPerson.id);
        }
        setIsPersonCreateModalOpen(false);
        setPersonCreateTargetField(null);
        refetchPersons();
      },
    });
  };

  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleNext}
        requiredMark="optional"
      >
        {/* Contact Person */}
        <Form.Item
          label={
            <div
              style={{
                width: "1232px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
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
                  Contact Person
                </Typography.Text>
              </div>
            </div>
          }
          name="contact_person"
          rules={[{ required: true, message: "Contact person is required" }]}
        >
          <Select
            size="large"
            placeholder={
              personsLoading ? "Loading..." : "Select contact person"
            }
            allowClear
            showSearch
            filterOption={(input, option) => {
              const label = option?.label;
              if (typeof label === "string") {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
            options={[
              ...(getFilteredOptions([signPerson, authorizedSignPerson]) || []),
            ]}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Space
          size="middle"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          {/* Sign Person */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "510px",
              alignSelf: "flex-start",
              height: "89px",
            }}
          >
            <Space
              size="small"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <Typography.Text style={{ fontSize: 16 }}>
                Sign Person{" "}
                <Typography.Text type="secondary">(optional)</Typography.Text>
              </Typography.Text>
            </Space>
            <Form.Item name="sign_person">
              <Select
                size="large"
                placeholder={
                  personsLoading ? "Loading..." : "Select sign person"
                }
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === "string") {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={[
                  ...(getFilteredOptions([
                    contactPerson,
                    authorizedSignPerson,
                  ]) || []),
                ]}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          {/* Authorized Sign Person */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "510px",
              alignSelf: "flex-start",
              height: "89px",
            }}
          >
            <Space
              size="small"
              style={{ justifyContent: "space-between", width: "100%" }}
            >
              <Typography.Text style={{ fontSize: 16 }}>
                Authorized Sign Person{" "}
                <Typography.Text type="secondary">(optional)</Typography.Text>
              </Typography.Text>
            </Space>
            <Form.Item name="authorized_sign_person">
              <Select
                size="large"
                placeholder={
                  personsLoading
                    ? "Loading..."
                    : "Select authorized sign person"
                }
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label;
                  if (typeof label === "string") {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  return false;
                }}
                options={[
                  ...(getFilteredOptions([contactPerson, signPerson]) || []),
                ]}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>
        </Space>

        <Form.Item
          label={
            <div className="flex items-center">
              <Typography.Text style={{ fontSize: 16 }}>Note</Typography.Text>
            </div>
          }
          name="note"
          required={false}
        >
          <Input.TextArea size="large" placeholder="Enter note" />
        </Form.Item>
      </Form>

      <PersonCreateModal
        open={isPersonCreateModalOpen}
        onClose={() => {
          setIsPersonCreateModalOpen(false);
          setPersonCreateTargetField(null);
        }}
        onSubmit={handlePersonCreate}
      />
    </div>
  );
});

export default StepContactPersons;
