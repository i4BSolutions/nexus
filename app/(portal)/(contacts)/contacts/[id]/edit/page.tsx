"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Typography,
} from "antd";

import { useList } from "@/hooks/react-query/useList";
import { useCreate } from "@/hooks/react-query/useCreate";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { RankInterface } from "@/types/person/rank/rank.type";
import { DepartmentInterface } from "@/types/departments/department.type";

type Person = {
  id: string;
  name: string;
  email: string;
  rank_id?: string | null;
  department_id?: string | null;
  rank?: { id: string; name: string } | null;
  department?: { id: string; name: string } | null;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T | null;
};

export default function ContactPersonEditPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  // Page state
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [person, setPerson] = useState<Person | null>(null);

  // Create Rank modal state
  const [rankModalOpen, setRankModalOpen] = useState(false);
  const [newRank, setNewRank] = useState("");

  const update = useUpdate("persons");

  const normalize = (s?: string | null) =>
    (s ?? "").toString().trim().toLowerCase();

  function findIdByName<T extends { id: string | number; name: string }>(
    items: T[] | undefined,
    name?: string | null
  ) {
    if (!items || !name) return undefined;
    const key = normalize(name);
    return items.find((x) => normalize(x.name) === key)?.id;
  }

  // Ranks & Departments
  const {
    data: ranksData,
    isLoading: ranksLoading,
    refetch: refetchRanks,
  } = useList<RankInterface[]>("ranks", { pageSize: "all" as any });

  const { data: departmentsData, isLoading: departmentsLoading } = useList<
    DepartmentInterface[]
  >("departments", { pageSize: "all" as any });

  const { mutate: createRank } = useCreate("ranks");

  // Fetch existing person
  useEffect(() => {
    let mounted = true;
    const fetchPerson = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/persons/${id}`, { method: "GET" });
        if (!res.ok) {
          throw new Error(`Failed to fetch person (${res.status})`);
        }
        const json: ApiResponse<Person> = await res.json();
        if (!json?.data) throw new Error(json?.message || "Person not found");

        if (!mounted) return;

        const p = json.data;
        setPerson(p);
        setPerson(p);
        form.setFieldsValue({
          name: p.name ?? "",
          email: p.email ?? "",
        });

        const initialValues = {
          name: p.name ?? "",
          email: p.email ?? "",
          rank: p.rank_id ?? p.rank?.id ?? undefined,
          department: p.department_id ?? p.department?.id ?? undefined,
        };
        form.setFieldsValue(initialValues);
      } catch (err: any) {
        message.error(err?.message || "Unable to load contact");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) fetchPerson();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!person) return;

    // Prefer *_id if present; otherwise map from the returned names
    const rankId =
      person.rank_id ??
      (typeof person.rank === "string"
        ? findIdByName(ranksData, person.rank)
        : person.rank?.id);

    const departmentId =
      person.department_id ??
      (typeof person.department === "string"
        ? findIdByName(departmentsData, person.department)
        : person.department?.id);

    // Avoid clobbering user edits if they’ve already touched these fields
    if (!form.isFieldsTouched(["rank"])) {
      form.setFieldsValue({ rank: rankId });
    }
    if (!form.isFieldsTouched(["department"])) {
      form.setFieldsValue({ department: departmentId });
    }
  }, [person, ranksData, departmentsData, form]);

  const currentValues = useMemo(() => {
    if (!person) return null;
    return {
      name: person.name ?? "",
      email: person.email ?? "",
      rank: person.rank_id ?? person.rank?.id ?? undefined,
      department: person.department_id ?? person.department?.id ?? undefined,
    };
  }, [person]);

  const openCreateRank = () => {
    setNewRank("");
    setRankModalOpen(true);
  };

  const handleCreateRank = (values: { name: string }) => {
    if (!values.name?.trim()) {
      message.warning("Please enter a rank name.");
      return;
    }
    createRank(values, {
      onSuccess: (data: unknown) => {
        const createdRank = data as RankInterface;
        form.setFieldsValue({ rank: createdRank.id });
        message.success("Rank created");
        setRankModalOpen(false);
        refetchRanks();
      },
      onError: () => {
        message.error("Failed to create rank");
      },
    });
  };

  // Submit PATCH with only changed fields mapped to API contract
  const onFinish = async (values: {
    name?: string;
    email?: string;
    rank?: string;
    department?: string;
  }) => {
    if (!id) return;

    // Compute changed fields only
    const patch: Partial<Pick<Person, "name" | "email">> & {
      rank_id?: string;
      department_id?: string;
    } = {};

    const trimOrUndefined = (v?: string) =>
      typeof v === "string" ? v.trim() : v;

    const incomingName = trimOrUndefined(values.name);
    const incomingEmail = trimOrUndefined(values.email);
    const incomingRankId = values.rank;
    const incomingDeptId = values.department;

    if (incomingName !== currentValues?.name) patch.name = incomingName!;
    if (incomingEmail !== currentValues?.email) patch.email = incomingEmail!;
    if (incomingRankId !== currentValues?.rank && incomingRankId)
      patch.rank_id = incomingRankId;
    if (incomingDeptId !== currentValues?.department && incomingDeptId)
      patch.department_id = incomingDeptId;

    if (Object.keys(patch).length === 0) {
      message.info("No changes to save.");
      return;
    }

    try {
      setSaving(true);

      await update.mutateAsync({ id, data: patch });

      message.success("Contact updated!");
      router.back();
    } catch (err: any) {
      message.error(err?.message || "Failed to update contact");
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => router.back();

  return (
    <section className="max-w-7xl mx-auto">
      {/* Header */}
      <Space
        align="center"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
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
              Edit Contact
            </Typography.Title>
            <Typography.Text type="secondary" style={{ marginBottom: 0 }}>
              Update contact details
            </Typography.Text>
          </Space>
        </Space>
      </Space>

      {/* Card */}
      <Space
        direction="vertical"
        size={0}
        style={{
          marginTop: 12,
          border: "1px solid #F5F5F5",
          width: "100%",
          borderRadius: 16,
          background: "#fff",
        }}
      >
        {/* Card header */}
        <Space direction="vertical" size={0} style={{ padding: "12px 24px" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Contact Information
          </Typography.Title>
          <Typography.Text type="secondary">
            Modify name, email, rank, and department
          </Typography.Text>
        </Space>

        <Divider style={{ margin: 0 }} />

        <Space
          direction="vertical"
          size={0}
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Avatar banner */}
          <Space
            direction="vertical"
            size={0}
            style={{ padding: 24, width: "100%", justifyContent: "center" }}
          >
            <Space
              direction="vertical"
              style={{
                background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
                borderRadius: 8,
                width: 1020,
                maxWidth: "100%",
                height: 139,
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #D9D9D9",
              }}
            >
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{
                  background: "#FFE8EC",
                  color: "#FF6B81",
                  flex: "0 0 auto",
                }}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Avatar is generated automatically.
              </Typography.Text>
            </Space>
          </Space>

          {/* Form */}
          <div style={{ padding: 12, width: "100%" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark="optional"
              style={{ maxWidth: 1020, margin: "0 auto" }}
              disabled={loading}
            >
              <Space style={{ width: "100%" }} size={22}>
                <Form.Item
                  label={
                    <div className="p-0 m-0 flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          marginTop: "6px",
                          marginBottom: "0px",
                          marginRight: "4px",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Full Name
                      </Typography.Text>
                    </div>
                  }
                  name="name"
                  rules={[
                    { required: true, message: "Full name is required." },
                  ]}
                  style={{ width: 500, maxWidth: "100%" }}
                >
                  <Input size="large" placeholder="Enter full name" />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="p-0 m-0 flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          marginTop: "6px",
                          marginBottom: "0px",
                          marginRight: "4px",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Email Address
                      </Typography.Text>
                    </div>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Please enter email address." },
                    { type: "email", message: "Invalid email format." },
                  ]}
                  style={{ width: 500, maxWidth: "100%" }}
                >
                  <Input size="large" placeholder="Enter email address" />
                </Form.Item>
              </Space>

              <Space style={{ width: "100%" }} size={22}>
                <Form.Item
                  style={{ width: 500, maxWidth: "100%" }}
                  label={
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="p-0 m-0 flex items-center">
                        <Typography.Paragraph
                          style={{
                            color: "red",
                            fontSize: 20,
                            marginTop: "6px",
                            marginBottom: "0px",
                            marginRight: "4px",
                          }}
                        >
                          *
                        </Typography.Paragraph>
                        <Typography.Text style={{ fontSize: 16 }}>
                          Rank
                        </Typography.Text>
                      </div>
                      <Typography.Link
                        onClick={openCreateRank}
                        style={{ fontSize: 14, fontWeight: 500 }}
                      >
                        Create New
                      </Typography.Link>
                    </div>
                  }
                  name="rank"
                  rules={[{ required: true, message: "Please select rank." }]}
                >
                  <Select
                    size="large"
                    placeholder="Select rank"
                    options={ranksData?.map((rank) => ({
                      label: rank.name,
                      value: rank.id,
                    }))}
                    loading={ranksLoading}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="p-0 m-0 flex items-center">
                      <Typography.Paragraph
                        style={{
                          color: "red",
                          fontSize: 20,
                          marginTop: "6px",
                          marginBottom: "0px",
                          marginRight: "4px",
                        }}
                      >
                        *
                      </Typography.Paragraph>
                      <Typography.Text style={{ fontSize: 16 }}>
                        Department
                      </Typography.Text>
                    </div>
                  }
                  name="department"
                  rules={[
                    { required: true, message: "Please select department." },
                  ]}
                  style={{ width: 500, maxWidth: "100%" }}
                >
                  <Select
                    size="large"
                    placeholder="eg. Finance"
                    options={departmentsData?.map((dept) => ({
                      label: dept.name,
                      value: dept.id,
                    }))}
                    loading={departmentsLoading}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Space>

              <Form.Item style={{ width: "100%" }}>
                <Space
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    Save Changes
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        </Space>
      </Space>

      {/* Create Rank Modal */}
      <Modal
        title="Create Rank"
        open={rankModalOpen}
        onCancel={() => setRankModalOpen(false)}
        onOk={() => handleCreateRank({ name: newRank })}
        okText="Add Rank"
      >
        <Input
          size="large"
          placeholder="Enter rank name (e.g., Associate)"
          value={newRank}
          onChange={(e) => setNewRank(e.target.value)}
          onPressEnter={() => handleCreateRank({ name: newRank })}
        />
      </Modal>
    </section>
  );
}
