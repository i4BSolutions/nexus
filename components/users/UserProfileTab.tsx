import { UserDetailResponse } from "@/types/user/user-detail.type";
import { ContactsOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import dayjs from "dayjs";

export default function UserProfileTab({ data }: { data: UserDetailResponse }) {
  return (
    <div className="rounded-2xl border-2 border-[#F5F5F5]">
      <div
        className="px-6 py-3 rounded-tl-2xl rounded-tr-2xl flex items-center gap-4 border-b border-[#D3ADF7]"
        style={{ background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)" }}
      >
        <div className="rounded-full bg-[#9254DE] size-8 grid place-items-center">
          <ContactsOutlined style={{ fontSize: 20, color: "white" }} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-medium">User Information</span>
          <Typography.Text type="secondary" className="!font-semibold">
            Personal and contact details
          </Typography.Text>
        </div>
      </div>
      <div className="px-6">
        <div className="space-y-3 py-6 border-b-2 border-[#F5F5F5]">
          <div className="flex w-full justify-between">
            <div className="w-full flex flex-col">
              <Typography.Text type="secondary">Full Name</Typography.Text>
              <span className="font-medium text-base">{data.full_name}</span>
            </div>
            <div className="w-full flex flex-col">
              <Typography.Text type="secondary">Username</Typography.Text>
              <span className="font-medium text-base">{data.username}</span>
            </div>
          </div>
          <div className="flex w-full justify-between">
            <div className="w-full flex flex-col">
              <Typography.Text type="secondary">Email</Typography.Text>
              <span className="font-medium text-base">{data.email}</span>
            </div>
            <div className="w-full flex flex-col">
              <Typography.Text type="secondary">Department</Typography.Text>
              <span className="font-medium text-base">
                {data.department.name}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex w-full justify-between py-6">
            <div className="w-full flex flex-col">
              <Typography.Text type="secondary">Created On</Typography.Text>
              <span className="font-medium text-base">
                {dayjs(data.created_at).format("MMM DD, YYYY")}
              </span>
            </div>
            <div className="w-full flex flex-col">
              <Typography.Text type="secondary">
                Last Updated On
              </Typography.Text>
              <span className="font-medium text-base">
                {dayjs(data.updated_at).format("MMM DD, YYYY")}
              </span>
            </div>
          </div>
          <div className="w-full flex flex-col pb-6">
            <Typography.Text type="secondary">Last Login</Typography.Text>
            <span className="font-medium text-base">
              {data.login_audit_log?.length
                ? dayjs(data.login_audit_log[0].created_at).format(
                    "MMM DD, YYYY H:mm A"
                  )
                : "Never"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
