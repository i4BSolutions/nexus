import { PersonInterface } from "@/types/person/person.type";
import {
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Flex,
  MenuProps,
  Pagination,
  Typography,
} from "antd";
import React from "react";
import { useRouter } from "next/navigation";
import getAvatarUrl from "@/utils/getAvatarUrl";

export default function CardView({
  data,
  pagination,
  total,
  paginationHandler,
  hasPermission,
}: {
  data: PersonInterface[];
  pagination: { page: number; pageSize: number };
  total: number;
  paginationHandler: (page: number, pageSize: number) => void;
  hasPermission: boolean;
}) {
  const router = useRouter();

  return (
    <section className="py-6 w-full max-w-[1140px]">
      <Flex wrap="wrap" gap={34} style={{ maxWidth: 1440 }}>
        {data?.map((item: PersonInterface) => {
          const items: MenuProps["items"] = [
            {
              key: "view",
              label: "View",
              icon: <EyeOutlined />,
              onClick: () => {
                router.push(`/contacts/${item.id}`);
              },
            },
            {
              key: "edit",
              label: "Edit",
              icon: <EditOutlined />,
              onClick: () => {
                router.push(`/contacts/${item.id}/edit`);
              },
            },
          ];

          return (
            <div
              key={item.id}
              style={{
                width: 356,
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {/* Header */}
              <div
                style={{
                  position: "relative",
                  height: 120,
                  background:
                    "linear-gradient(90deg, #F9F0FF 0%, #FFFFFF 100%)",
                  justifyContent: "space-between",
                  display: "flex",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 126,
                    top: 10,
                    padding: 12,
                  }}
                >
                  <img
                    src={getAvatarUrl(item.name)}
                    alt=""
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 50,
                    }}
                  />
                </div>

                {hasPermission && (
                  <Dropdown
                    menu={{ items }}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      aria-label="More"
                      icon={<EllipsisOutlined style={{ fontSize: 20 }} />}
                      style={{ position: "absolute", right: 8, top: 8 }}
                    />
                  </Dropdown>
                )}
              </div>

              {/* Body */}
              <div
                style={{
                  padding: "8px 16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography.Text
                  type="secondary"
                  style={{ marginTop: 4, fontSize: 16 }}
                >
                  {item.rank || "No Rank"}
                </Typography.Text>

                <Typography.Title
                  level={2}
                  style={{
                    margin: 0,
                    marginTop: 4,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {item.name}
                </Typography.Title>

                <div
                  style={{
                    marginTop: 16,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                    Email
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 16 }}>
                    {item.email}
                  </Typography.Text>
                </div>
              </div>
            </div>
          );
        })}
      </Flex>

      <Flex
        justify="space-between"
        align="center"
        className="!pb-10 !pt-6"
        style={{ alignSelf: "end" }}
      >
        <div>
          <Typography.Text type="secondary">
            Total {total} items
          </Typography.Text>
        </div>
        <Pagination
          defaultCurrent={1}
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onChange={paginationHandler}
        />
      </Flex>
    </section>
  );
}
