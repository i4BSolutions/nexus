import { UserInterface } from "@/types/user/user.type";
import getAvatarUrl from "@/utils/getAvatarUrl";
import { EditOutlined, EllipsisOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, MenuProps, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function UserCard({ data }: { data: UserInterface }) {
  const router = useRouter();

  const items: MenuProps["items"] = [
    {
      label: <div className="text-sm !w-32">View</div>,
      key: "view",
      icon: <EyeOutlined />,
      onClick: () => {
        router.push(`/users/${data.id}`);
      },
    },
    {
      label: <span className="text-sm !w-32">Edit</span>,
      key: "edit",
      icon: <EditOutlined />,
      onClick: () => {
        router.push(`/users/${data.id}/edit`);
      },
    },
  ];

  return (
    <div className="border-2 border-[#F5F5F5] rounded-xl relative">
      <div
        className="rounded-lg grid place-items-center p-3"
        style={{ background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)" }}
      >
        <img
          src={getAvatarUrl(data.username)}
          alt="avatar"
          className="rounded-full w-30 h-30 object-cover"
        />
      </div>
      <div className="px-6 py-3">
        <div className="text-center flex flex-col mb-3">
          <Typography.Text type="secondary" style={{ fontSize: 16 }}>
            {data.department.name}
          </Typography.Text>
          <span className="text-[30px] font-medium">{data.full_name}</span>
          <Typography.Text type="secondary">{data.username}</Typography.Text>
        </div>
        <Flex justify="space-between" align="center" className="!mb-3">
          <Typography.Text type="secondary">Email</Typography.Text>
          <span className="font-medium text-base">{data.email}</span>
        </Flex>
        <Flex justify="space-between" align="center" className="!mb-3">
          <Typography.Text type="secondary">Created Date</Typography.Text>
          <span className="font-medium text-base">
            {dayjs(data.created_at).format("MMMM D, YYYY")}
          </span>
        </Flex>
      </div>

      {/* Card Menu Dropdown */}
      <div className="absolute top-3 right-3">
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <Button icon={<EllipsisOutlined />} />
        </Dropdown>
      </div>
    </div>
  );
}
