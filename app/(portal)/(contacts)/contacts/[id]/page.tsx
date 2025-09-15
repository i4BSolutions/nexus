"use client";

// React & Next
import { useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

// Ant Design
import {
  CloseCircleOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  message,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from "antd";

// Components
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ContactPersonDetailsCard from "@/components/contact-persons/details/DetailsCard";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import Relationships from "@/components/contact-persons/details/Relationships";

// Hooks
import { useGetById } from "@/hooks/react-query/useGetById";
import { useUpdate } from "@/hooks/react-query/useUpdate";
import { usePermission } from "@/hooks/shared/usePermission";

// Types
import { PersonInterface } from "@/types/person/person.type";

// Utils
import getAvatarUrl from "@/utils/getAvatarUrl";

const ContactPersonDetailsPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // const hasPermission = usePermission("can_view_contact_person_related_data");
  const hasPermission = true;

  const {
    data: personData,
    isLoading: personLoading,
    error: personError,
    refetch: refetchPerson,
  } = useGetById<PersonInterface>("persons", id, !!id);

  const update = useUpdate("persons/deactivate");

  if (personLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin />
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await update.mutateAsync({ id, data: { status: false } });
      message.success("Contact person deactivated successfully");
    } catch (error) {
      message.error(
        "Failed to deactivate contact person! There might be related data."
      );
    } finally {
      setIsDeleteModalOpen(false);
      refetchPerson();
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <Breadcrumbs
        items={[
          { title: "Home", href: "/" },
          { title: "Contacts", href: "/contacts" },
        ]}
      />

      {/* Header */}
      <Space
        align="center"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        <Space align="center">
          <img
            src={getAvatarUrl(personData?.name || "unknown")}
            alt=""
            style={{
              width: 64,
              height: 64,
              borderRadius: 50,
            }}
          />
          <Space direction="vertical" size={0}>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              {personData?.name}
            </Typography.Title>
            <Space>
              <Typography.Text type="secondary" style={{ marginBottom: 0 }}>
                {personData?.rank || "No Rank"}
              </Typography.Text>
              {personData?.status === false && (
                <Tag color="red" style={{ marginTop: 0 }}>
                  Deactivated
                </Tag>
              )}
            </Space>
          </Space>
        </Space>

        <Space>
          <DeleteConfirmModal
            btnText="Deactivate"
            open={isDeleteModalOpen}
            title="Contact Person"
            onCancel={() => setIsDeleteModalOpen(false)}
            onConfirm={async () => {
              await handleDelete();
              setIsDeleteModalOpen(false);
            }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              router.push(`/contacts/${id}/edit`);
            }}
          >
            Edit
          </Button>

          {personData?.status !== false ? (
            <Button
              icon={<StopOutlined />}
              type="primary"
              danger
              onClick={() => {
                setIsDeleteModalOpen(true);
              }}
            >
              Deactivate
            </Button>
          ) : (
            <></>
          )}
        </Space>
      </Space>

      {personData?.status === false && (
        <Alert
          message="This contact person has been deactivated."
          description="The contact person is no longer active and won’t be processed."
          type="error"
          icon={<CloseCircleOutlined />}
          showIcon
        />
      )}

      {/* Tabs */}
      <Tabs
        size="large"
        defaultActiveKey="details"
        items={[
          {
            key: "details",
            label: "Details",
            children: (
              <ContactPersonDetailsCard
                name={personData?.name || ""}
                email={personData?.email || ""}
                rank={personData?.rank || ""}
                department={personData?.department || ""}
              />
            ),
          },
          ...(hasPermission
            ? [
                {
                  key: "relationships",
                  label: "Relationships",
                  children: <Relationships id={id} />,
                },
              ]
            : []),
        ]}
      />
    </section>
  );
};

export default ContactPersonDetailsPage;
