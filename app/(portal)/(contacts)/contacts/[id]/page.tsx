"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { EditOutlined, StopOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, message, Space, Spin, Tabs, Typography } from "antd";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useGetById } from "@/hooks/react-query/useGetById";
import { PersonInterface } from "@/types/person/person.type";
import ContactPersonDetailsCard from "@/components/contact-persons/details/DetailsCard";
import { useState } from "react";
import DeleteConfirmModal from "@/components/shared/DeleteConfirmModal";
import Relationships from "@/components/contact-persons/details/Relationships";
import { usePermission } from "@/hooks/shared/usePermission";
import getAvatarUrl from "@/utils/getAvatarUrl";
import { useUpdate } from "@/hooks/react-query/useUpdate";

const ContactPersonDetailsPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const hasPermission = usePermission("can_view_contact_person_related_data");

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
            <Typography.Text type="secondary" style={{ marginBottom: 0 }}>
              {personData?.rank}
            </Typography.Text>
          </Space>
        </Space>

        <Space>
          <DeleteConfirmModal
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
