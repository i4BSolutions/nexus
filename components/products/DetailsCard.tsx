"use client";

// React & Next
import { useEffect, useState } from "react";

// Antd
import {
  Card,
  Col,
  Row,
  Space,
  Typography,
  Tag,
  Input,
  Select,
  Button,
  List,
  Form,
  Modal,
  App,
} from "antd";

import {
  TagOutlined,
  LinkOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";

// Hooks
import { useCreate } from "@/hooks/react-query/useCreate";
import { useList } from "@/hooks/react-query/useList";
import { useDelete } from "@/hooks/react-query/useDelete";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { useGetWithParams } from "@/hooks/react-query/useGetWithParams";

// Types
import { AliasTypeInterface } from "@/types/product/alias/alias-type.type";
import { ProductAliasInterface } from "@/types/product/alias/alias.type";
import { AliasLanguageInterface } from "@/types/product/alias/language.type";
import { ProductInterface } from "@/types/product/product.type";

// Modal
import DeleteConfirmModal from "../shared/DeleteConfirmModal";

// Utils
import { formatWithThousandSeparator } from "@/utils/thousandSeparator";

export type ProductDetailsCardProps = Omit<
  ProductInterface,
  "name" | "created_at" | "stock" | "currency_code_id" | "description"
>;

const DetailsCard = ({
  id,
  sku,
  category,
  min_stock,
  unit_price,
  updated_at,
  product_currency,
}: ProductDetailsCardProps) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedAliasId, setSelectedAliasId] = useState<string>("");

  const [newType, setNewType] = useState<string>("");
  const [newLang, setNewLang] = useState<string>("");

  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { mutateAsync: createAliasType } = useCreate("products/alias-types");
  const { mutateAsync: createAliasLanguage } = useCreate(
    "products/alias-languages"
  );
  const { mutateAsync: createAlias } = useCreate("products/alias");

  const deleteAlias = useDelete("products/alias");

  const [editForm] = Form.useForm();
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const { mutateAsync: updateAlias, isPending: isUpdating } =
    useUpdate("products/alias");

  const { data: types } = useList<AliasTypeInterface[]>(
    "products/alias-types",
    {
      pageSize: "all" as any,
    }
  );

  const { data: languages } = useList<AliasLanguageInterface[]>(
    "products/alias-languages",
    {
      pageSize: "all" as any,
    }
  );

  const {
    data: aliases,
    isLoading: aliasLoading,
    refetch: refetchAliases,
  } = useGetWithParams<ProductAliasInterface[], { product_id: number }>(
    "products/alias",
    {
      product_id: id,
    }
  );

  useEffect(() => {
    if (!isEditModalOpen || !selectedAliasId) return;
    const current = aliases?.find(
      (a) => String(a.id) === String(selectedAliasId)
    );
    if (current) {
      editForm.setFieldsValue({
        name: current.name,
        type: current.type?.id,
        language: current.language?.id,
      });
    }
  }, [isEditModalOpen, selectedAliasId, aliases, editForm]);

  const handleCreateType = (values: { name: string }) => {
    createAliasType(values, {
      onSuccess: (data: unknown) => {
        const createdType = data as AliasTypeInterface;
        (isEditModalOpen ? editForm : form).setFieldsValue({
          type: createdType.id,
        });
        message.success("Alias type created");
        setTypeModalOpen(false);
      },
    });
  };

  const handleCreateLanguage = (values: { name: string }) => {
    createAliasLanguage(values, {
      onSuccess: (data: unknown) => {
        const createdLang = data as AliasLanguageInterface;
        (isEditModalOpen ? editForm : form).setFieldsValue({
          language: createdLang.id,
        });
        message.success("Alias language created");
        setLangModalOpen(false);
      },
    });
  };

  const handleCreateAlias = async (values: {
    name: string;
    type?: number;
    language?: number;
  }) => {
    const payload = {
      name: String(values.name ?? "").trim(),
      type_id: values.type ?? null,
      language_id: values.language ?? null,
      product_id: id,
    };
    try {
      await createAlias(payload as any);
      message.success("Alias created");
      form.resetFields(["name", "type", "language"]);
      setErrorMessage(null);

      await refetchAliases();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create alias";
      setErrorMessage(msg);
      message.error(msg);
    }
  };

  const handleDeleteAlias = async (id: string) => {
    try {
      await deleteAlias.mutateAsync(id);
      message.success("Alias deleted");
    } catch (error: any) {
      message.error("Failed to delete alias: " + error.message);
    } finally {
      refetchAliases();
    }
  };

  return (
    <>
      {/* Product Info */}
      <Card
        styles={{
          header: {
            background:
              "linear-gradient(90deg, rgba(249, 240, 255, 1) 0%, rgba(255, 255, 255, 1) 100%)",
            borderBottom: "1px solid #D3ADF7",
          },
        }}
        title={
          <Space style={{ margin: "12px 0" }}>
            <Space
              style={{
                width: 32,
                height: 32,
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 20,
                color: "white",
                background: "#9254DE",
                marginRight: 8,
              }}
            >
              <TagOutlined />
            </Space>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Product Information
              </Typography.Title>
              <Typography.Text type="secondary" style={{ margin: 0 }}>
                Last updated on{" "}
                {updated_at ? new Date(updated_at).toLocaleDateString() : "N/A"}
              </Typography.Text>
            </div>
          </Space>
        }
        variant="outlined"
        style={{ borderRadius: 12 }}
      >
        <Row gutter={24} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Product SKU</Typography.Text>
              <Typography.Title level={5}>{sku}</Typography.Title>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Category</Typography.Text>
              <Typography.Title level={5}>{category}</Typography.Title>
            </Space>
          </Col>
          <Col span={12} style={{ marginTop: 16 }}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Unit Price</Typography.Text>
              <Typography.Title level={5}>
                {unit_price.toLocaleString() ?? "N/A"}{" "}
                {product_currency?.currency_code}
              </Typography.Title>
            </Space>
          </Col>
          <Col span={12} style={{ marginTop: 16 }}>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">
                Minimum Stock Level
              </Typography.Text>
              <Typography.Title level={5}>
                {min_stock ?? "N/A"}
              </Typography.Title>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Product Aliases */}
      <Card
        style={{ marginTop: 24, borderRadius: 12 }}
        title={
          <Space style={{ padding: "12px 0" }}>
            <Space
              style={{
                width: 32,
                height: 32,
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 20,
                color: "white",
                background: "#9254DE",
                marginRight: 8,
              }}
            >
              <LinkOutlined />
            </Space>
            <Space direction="vertical" size={0}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Product Aliases
              </Typography.Title>
              <Typography.Text type="secondary">
                Add alternative names to help users find this product more
                easily
              </Typography.Text>
            </Space>
          </Space>
        }>
        <List
          loading={aliasLoading}
          locale={{ emptyText: "No aliases added yet." }}
          dataSource={aliases}
          renderItem={(alias) => (
            <List.Item
              style={{
                background: "#FAFAFA",
                border: "1px solid #E8E8E8",
                borderRadius: 8,
                marginBottom: 16,
                padding: "8px 12px",
              }}
              actions={[
                <EditOutlined
                  key="edit"
                  onClick={() => {
                    setSelectedAliasId(alias.id.toString());
                    setIsEditModalOpen(true);
                  }}
                />,
                <DeleteOutlined
                  key="delete"
                  onClick={() => {
                    setSelectedAliasId(alias.id.toString());
                    setIsDeleteModalOpen(true);
                  }}
                />,
              ]}
            >
              <Space size={8}>
                <LinkOutlined size={32} style={{ color: "#9254DE" }} />

                <Space direction="vertical" size={0}>
                  <Typography.Text>{alias.name}</Typography.Text>
                  <Space size={8}>
                    {alias.type && <Tag>{alias.type.name}</Tag>}
                    {alias.language && <Tag>{alias.language.name}</Tag>}
                  </Space>
                </Space>
              </Space>
            </List.Item>
          )}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={(vals) => handleCreateAlias(vals as any)}
          requiredMark="optional"
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text>Add New Alias Name</Typography.Text>
            <Space
              wrap
              style={{
                justifyContent: "space-between",
                width: "100%",
                alignItems: "center",
              }}
            >
              {/* ALIAS NAME */}
              <Form.Item
                label={
                  <div className="p-0 m-0 flex items-center">
                    <Typography.Paragraph
                      style={{
                        color: "red",
                        fontSize: 18,
                        marginTop: "0px",
                        marginBottom: "0px",
                        marginRight: "4px",
                      }}
                    >
                      *
                    </Typography.Paragraph>
                    <Typography.Text style={{ fontSize: 16 }}>
                      Alias Name
                    </Typography.Text>
                  </div>
                }
                name="name"
                rules={[{ required: true, message: "Alias name is required." }]}
                style={{ width: "462px" }}
              >
                <Space
                  direction="vertical"
                  size={0}
                  style={{ width: "100%", height: 44 }}
                >
                  <Input
                    size="large"
                    placeholder="Enter alias name"
                    style={{ width: "100%" }}
                  />
                  {errorMessage && (
                    <Typography.Text type="danger">
                      {errorMessage}
                    </Typography.Text>
                  )}
                </Space>
              </Form.Item>

              {/* TYPE */}
              <Form.Item
                name="type"
                style={{ width: 240 }}
                label={
                  <Typography.Text style={{ fontSize: 16 }}>
                    Type
                  </Typography.Text>
                }
              >
                <Select
                  size="large"
                  placeholder="Select type (Optional)"
                  allowClear
                  options={(types ?? []).map((t) => ({
                    label: t.name,
                    value: t.id,
                  }))}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ padding: 8 }}>
                        <Button
                          type="link"
                          block
                          onClick={() => setTypeModalOpen(true)}
                        >
                          <PlusCircleOutlined style={{ marginRight: 8 }} />
                          Create New
                        </Button>
                      </div>
                    </>
                  )}
                />
              </Form.Item>

              {/* LANGUAGE */}
              <Form.Item
                name="language"
                style={{ width: 240 }}
                label={
                  <Typography.Text style={{ fontSize: 16 }}>
                    Language
                  </Typography.Text>
                }
              >
                <Select
                  size="large"
                  placeholder="Select language (Optional)"
                  allowClear
                  options={(languages ?? []).map((l) => ({
                    label: l.name,
                    value: l.id,
                  }))}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <div style={{ padding: 8 }}>
                        <Button
                          type="link"
                          block
                          onClick={() => setLangModalOpen(true)}
                        >
                          <PlusCircleOutlined style={{ marginRight: 8 }} />
                          Create New
                        </Button>
                      </div>
                    </>
                  )}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space
                  direction="vertical"
                  size={0}
                  style={{ width: "100%", height: 56 }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ height: "40px", marginTop: "7.5px" }}
                  >
                    Add Alias
                  </Button>
                </Space>
              </Form.Item>
            </Space>
        </Col>
        <Col span={12} style={{ marginTop: 16 }}>
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">Unit Price</Typography.Text>
            <Typography.Title level={5}>
              {formatWithThousandSeparator(unit_price) ?? "N/A"}
            </Typography.Title>
          </Space>
        </Form>
      </Card>

      {/* Create Type Modal */}
      <Modal
        title="Create Type"
        open={typeModalOpen}
        onCancel={() => setTypeModalOpen(false)}
        onOk={() => handleCreateType({ name: newType })}
        okText="Add Type"
      >
        <Input
          size="large"
          placeholder="Enter type name (e.g., Associate)"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          onPressEnter={() => handleCreateType({ name: newType })}
        />
      </Modal>

      {/* Create Language Modal */}
      <Modal
        title="Create Language"
        open={langModalOpen}
        onCancel={() => setLangModalOpen(false)}
        onOk={() => handleCreateLanguage({ name: newLang })}
        okText="Add Language"
      >
        <Input
          size="large"
          placeholder="Enter language name (e.g., English)"
          value={newLang}
          onChange={(e) => setNewLang(e.target.value)}
          onPressEnter={() => handleCreateLanguage({ name: newLang })}
        />
      </Modal>

      {/* Edit Alias Modal */}
      <Modal
        title="Edit alias name"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditErrorMessage(null);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnHidden={true}
      >
        <Form
          id="edit-alias-form"
          form={editForm}
          layout="vertical"
          requiredMark="optional"
          onFinish={async (values: {
            name: string;
            type?: number;
            language?: number;
          }) => {
            try {
              setEditErrorMessage(null);
              await updateAlias({
                id: selectedAliasId,
                data: {
                  name: String(values.name ?? "").trim(),
                  type_id: values.type ?? null,
                  language_id: values.language ?? null,
                },
              });
              message.success("Alias updated");
              setIsEditModalOpen(false);
              editForm.resetFields();
              await refetchAliases();
            } catch (err: any) {
              const msg = err?.message || "Failed to update alias";
              setEditErrorMessage(msg);
              message.error(msg);
            }
          }}
        >
          {/* Alias Name */}
          <Form.Item
            label={
              <div className="p-0 m-0 flex items-center">
                <Typography.Paragraph
                  style={{
                    color: "red",
                    fontSize: 20,
                    marginTop: 6,
                    marginBottom: 0,
                    marginRight: 4,
                  }}
                >
                  *
                </Typography.Paragraph>
                <Typography.Text style={{ fontSize: 16 }}>
                  Alias Name
                </Typography.Text>
              </div>
            }
            name="name"
            rules={[
              { required: true, message: "Alias name is required." },
              {
                validator: (_, v) =>
                  String(v ?? "").trim().length === 0
                    ? Promise.reject(new Error("Alias name cannot be empty"))
                    : Promise.resolve(),
              },
            ]}
          >
            <Input size="large" placeholder="Enter alias name" />
          </Form.Item>

          {/* Type */}
          <Form.Item
            name="type"
            label={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 37.42,
                }}
              >
                <Typography.Text style={{ fontSize: 16 }}>Type</Typography.Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setTypeModalOpen(true)}
                  style={{ paddingRight: 0 }}
                >
                  Create New
                </Button>
              </div>
            }
          >
            <Select
              size="large"
              placeholder="Select type (Optional)"
              allowClear
              options={(types ?? []).map((t) => ({
                label: t.name,
                value: t.id,
              }))}
            />
          </Form.Item>

          {/* Language */}
          <Form.Item
            name="language"
            label={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 37.42,
                }}
              >
                <Typography.Text style={{ fontSize: 16 }}>
                  Language
                </Typography.Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setLangModalOpen(true)}
                  style={{ paddingRight: 0 }}
                >
                  Create New
                </Button>
              </div>
            }
          >
            <Select
              size="large"
              placeholder="Select language (Optional)"
              allowClear
              options={(languages ?? []).map((l) => ({
                label: l.name,
                value: l.id,
              }))}
            />
          </Form.Item>

          {editErrorMessage && (
            <Typography.Text
              type="danger"
              style={{ display: "block", marginBottom: 8 }}
            >
              {editErrorMessage}
            </Typography.Text>
          )}

          <Space style={{ width: "100%", justifyContent: "end" }}>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isUpdating}
              style={{ minWidth: 96 }}
            >
              Save
            </Button>
            <Typography.Title level={5}>
              {formatWithThousandSeparator(min_stock) ?? "N/A"}
            </Typography.Title>
          </Space>
        </Form>
      </Modal>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        title="Contact Person"
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          await handleDeleteAlias(selectedAliasId);
          setIsDeleteModalOpen(false);
        }}
      />
    </>
  );
};

export default DetailsCard;
