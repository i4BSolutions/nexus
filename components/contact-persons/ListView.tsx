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
import { useRouter } from "next/navigation";

export default function ListView({
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
      <Flex
        wrap="wrap"
        gap={16}
        style={{
          maxWidth: 1440,
          margin: "0 auto",
        }}
      >
        {data?.map((item: PersonInterface) => {
          const items: MenuProps["items"] = [
            {
              key: "view",
              label: "View",
              icon: <EyeOutlined />,
              onClick: () => router.push(`/contacts/${item.id}`),
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
                // Two-column responsive layout with graceful wrap
                flex: "1 1 660px",
                minWidth: 320,
                maxWidth: "calc(50% - 8px)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: 16,
                  background: "#fff",
                  border: "1px solid #F0F0F0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  padding: 16,
                  display: "flex",
                  gap: 16,
                }}
              >
                {/* Avatar */}
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  style={{
                    background: "#FFE8EC",
                    color: "#FF6B81",
                    flex: "0 0 auto",
                  }}
                />

                {/* Text block */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    style={{
                      fontWeight: 600,
                      fontSize: 16,
                      lineHeight: "22px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </Typography>
                  {item.rank && (
                    <Typography
                      style={{
                        fontSize: 12,
                        color: "#7D7D7D",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.rank}
                    >
                      {item.rank}
                    </Typography>
                  )}
                  {item.email && (
                    <Typography
                      style={{
                        fontSize: 12,
                        color: "#9E9E9E",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.email}
                    >
                      {item.email}
                    </Typography>
                  )}
                </div>

                {/* Right side actions */}
                {hasPermission && (
                  <div style={{ marginLeft: "auto" }}>
                    <Dropdown
                      menu={{ items }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        aria-label="More"
                        icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
                        style={{
                          borderRadius: 10,
                          background: "#F6F7F9",
                          border: "1px solid #EEF0F3",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </Dropdown>
                  </div>
                )}
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
