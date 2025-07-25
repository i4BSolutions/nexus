"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import UserCard from "@/components/users/UserCard";
import { useGetWithParams } from "@/hooks/react-query/useGetWithParams";
import { UserFilterParams, UsersResponse } from "@/types/user/user.type";
import { PlusOutlined, TeamOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Input,
  Pagination,
  Select,
  Spin,
  Typography,
} from "antd";
import { SearchProps } from "antd/es/input";
import { SortOrder } from "antd/es/table/interface";
import { useRouter } from "next/navigation";
import { useState } from "react";

const dummyUsers = [
  {
    id: "1",
    fullName: "John Doe",
    username: "@johndoe",
    email: "johndoe@example.com",
    department: "Finance",
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    fullName: "Jane Smith",
    username: "@janesmith",
    email: "janesmith@example.com",
    department: "Procurement",
    created_at: "2023-01-02T00:00:00Z",
  },
  {
    id: "3",
    fullName: "Alice Johnson",
    username: "@alicejohnson",
    email: "alicejohnson@example.com",
    department: "Administration",
    created_at: "2023-01-03T00:00:00Z",
  },
  {
    id: "4",
    fullName: "Bob Brown",
    username: "@bobbrown",
    email: "bobbrown@example.com",
    department: "Finance",
    created_at: "2023-01-04T00:00:00Z",
  },
  {
    id: "5",
    fullName: "Charlie Davis",
    username: "@charliedavis",
    email: "charliedavis@example.com",
    department: "Procurement",
    created_at: "2023-01-05T00:00:00Z",
  },
];

export default function UsersPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ page: 1, pageSize: 9 });
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>();
  const [department, setDepartment] = useState<number>(0);

  const { data: usersData, isPending: usersDataPending } = useGetWithParams<
    UsersResponse,
    UserFilterParams
  >("users", {
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: sortOrder
      ? `created_at_${sortOrder === "ascend" ? "asc" : "desc"}`
      : undefined,
    department: department,
    search: searchText,
  });

  const clearFiltersHandler = () => {
    setDepartment(0);
  };

  const onSearchHandler: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchText(value);
  };

  const onSortHandler = (value: string) => {
    setSortOrder(value === "Date (Newest First)" ? "descend" : "ascend");
  };

  const departmentChangeHandler = (value: number) => {
    setDepartment(value === 0 ? 0 : value);
  };

  const paginationChangeHandler = (page: number, pageSize?: number) => {
    setPagination({ page, pageSize: pageSize || 9 });
  };

  return (
    <section className="px-6 grid place-items-center w-full">
      <div className="w-full max-w-[1140px]">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Users & Permissions" },
          ]}
        />
        <HeaderSection
          title="Users & Permissions"
          bgColor="#9254DE"
          description="Manage user accounts, permission templates and access rights"
          icon={<TeamOutlined style={{ fontSize: 20, color: "white" }} />}
          onAddNew={() => router.push("/users/create")}
          buttonText="New User"
          buttonIcon={<PlusOutlined />}
        />

        {/* Actions */}
        <Flex justify="space-between" align="center" gap={12}>
          <Input.Search
            placeholder="Search By Full Name, Username or Email Address"
            allowClear
            onSearch={onSearchHandler}
            style={{ width: 420 }}
          />
          <Flex align="center" gap={12}>
            <Flex justify="center" align="center" gap={12}>
              <span>Sort:</span>
              <Select
                defaultValue="Date (Newest First)"
                style={{ width: 160 }}
                onChange={onSortHandler}
                options={[
                  {
                    value: "Date (Newest First)",
                    label: "Date (Newest First)",
                  },
                  {
                    value: "Date (Oldest First)",
                    label: "Date (Oldest First)",
                  },
                ]}
              />
            </Flex>

            <div className="bg-[#D9D9D9] w-[1px] h-7" />

            <Flex justify="center" align="center" gap={12}>
              <span>Filter(s):</span>
              <Select
                defaultValue={0}
                style={{ width: 160 }}
                onChange={departmentChangeHandler}
                options={[
                  {
                    value: 0,
                    label: "All Departments",
                  },
                  {
                    value: 1,
                    label: "Finance",
                  },
                  {
                    value: 2,
                    label: "Administration",
                  },
                ]}
              />
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={clearFiltersHandler}
              >
                Clear Filter(s)
              </Button>
            </Flex>
          </Flex>
        </Flex>

        {usersDataPending ? (
          <div className="flex justify-center items-center h-[500px]">
            <Spin />
          </div>
        ) : usersData ? (
          <div className="grid grid-cols-3 items-center w-full gap-5 mt-4">
            {usersData.dto.map((user) => (
              <UserCard key={user.id} data={user} />
            ))}
          </div>
        ) : (
          <div className="w-full grid place-items-center">
            <Typography.Text type="secondary" className="!text-lg">
              No users found
            </Typography.Text>
          </div>
        )}
      </div>
      {usersData && usersData.total > 9 && (
        <Flex
          justify="space-between"
          align="center"
          className="!pb-10 !pt-6"
          style={{ alignSelf: "end" }}
        >
          <div>
            <Typography.Text type="secondary">
              Total {usersData.total} users
            </Typography.Text>
          </div>
          <Pagination
            defaultCurrent={1}
            current={pagination.page}
            pageSize={pagination.pageSize}
            total={usersData.total}
            onChange={paginationChangeHandler}
          />
        </Flex>
      )}
    </section>
  );
}
