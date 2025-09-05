"use client";

import CardView from "@/components/contact-persons/CardView";
import ListView from "@/components/contact-persons/ListView";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import SearchAndFilters from "@/components/shared/SearchAndFilters";
import { useList } from "@/hooks/react-query/useList";
import { usePermission } from "@/hooks/shared/usePermission";
import { PersonResponse } from "@/types/person/person.type";
import { RankInterface } from "@/types/person/rank/rank.type";
import { ContactsOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Segmented, Select } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactsPage() {
  const router = useRouter();

  const hasPermission = true;

  const [viewMode, setViewMode] = useState<"Card" | "List">("Card");

  const [pagination, setPagination] = useState({ page: 1, pageSize: 9 });

  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const {
    data: personsDataRaw,
    isLoading: personsLoading,
    refetch: refetchPersons,
  } = useList("persons", {
    page: pagination.page,
    pageSize: pagination.pageSize,
    status: statusFilter,
  });

  if (statusFilter) {
    refetchPersons();
  }

  const personsData = personsDataRaw as PersonResponse;

  const { data: ranksDataRaw, isLoading: ranksLoading } = useList("ranks");

  const ranksData = ranksDataRaw as RankInterface[];

  const viewChangeHandler = (value: "Card" | "List") => {
    setViewMode(value);
    if (value === "Card") {
      setPagination({ page: 1, pageSize: 9 });
    }
    if (value === "List") {
      setPagination({ page: 1, pageSize: 10 });
    }
  };

  const paginationHandler = (page: number, pageSize: number) => {
    setPagination({ page, pageSize });
  };

  return (
    <section className="max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { title: "Home", href: "/" },
          { title: "Contacts", href: "/contacts" },
        ]}
      />

      {/* Header */}
      <HeaderSection
        title="Contacts"
        description="Manage contacts referenced across system"
        icon={<ContactsOutlined />}
        onAddNew={() => {
          router.push("/contacts/create");
        }}
        hasPermission={true}
        buttonText="New Contact"
        buttonIcon={<PlusOutlined />}
      />

      {/* Search and Filters */}
      <Flex
        justify="center"
        align="center"
        gap={12}
        style={{ marginBottom: "16px" }}
      >
        <Input.Search
          placeholder="Search By PO Number"
          allowClear
          onSearch={() => {}}
        />
        <div className="bg-transparent w-[425px] h-7" />
        <Flex justify="center" align="center" gap={12}>
          <span>Filter(s):</span>
          <Select
            value={statusFilter ?? ""}
            style={{ width: 160 }}
            loading={ranksLoading}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: "", label: "All Ranks" },
              ...(Array.isArray(ranksData)
                ? ranksData.map((rank: any) => ({
                    value: rank.id,
                    label: rank.name,
                  }))
                : []),
            ]}
            placeholder="Select Rank"
            allowClear
          />
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => {
              setStatusFilter(undefined);
            }}
          >
            Clear Filter(s)
          </Button>
        </Flex>
        <Segmented<"Card" | "List">
          options={["Card", "List"]}
          style={{ borderRadius: 9, border: "1px solid #D9D9D9" }}
          onChange={viewChangeHandler}
        />
      </Flex>

      {viewMode === "Card" ? (
        <CardView
          data={personsData?.items}
          pagination={pagination}
          total={personsData?.total}
          paginationHandler={paginationHandler}
          hasPermission={hasPermission}
        />
      ) : (
        <ListView
          data={personsData?.items}
          pagination={pagination}
          total={personsData?.total}
          paginationHandler={paginationHandler}
          hasPermission={hasPermission}
        />
      )}
    </section>
  );
}
