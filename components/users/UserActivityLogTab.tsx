import { UserDetailResponse } from "@/types/user/user-detail.type";
import { HistoryOutlined, LoginOutlined } from "@ant-design/icons";
import { Col, Row, Typography } from "antd";
import dayjs from "dayjs";

export default function UserActivityLog({
  data,
}: {
  data: UserDetailResponse;
}) {
  return (
    <div className="rounded-2xl border-2 border-[#F5F5F5]">
      <div
        className="px-6 py-3 rounded-tl-2xl rounded-tr-2xl flex items-center gap-4 border-b border-[#D3ADF7]"
        style={{ background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)" }}
      >
        <div className="rounded-full bg-[#9254DE] size-8 grid place-items-center">
          <HistoryOutlined style={{ fontSize: 20, color: "white" }} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-medium">Activity Log</span>
          <Typography.Text type="secondary" className="!font-semibold">
            Recent system activity for this user
          </Typography.Text>
        </div>
      </div>
      <div className="px-6">
        <div className="space-y-3 py-6">
          {data.login_audit_log &&
            data.login_audit_log.length > 0 &&
            data.login_audit_log.map((log) => (
              <div
                className="flex w-full gap-3 border-b-2 border-[#F5F5F5]"
                key={log.id}
              >
                <div className="flex flex-col">
                  <div className="rounded-full bg-[#BFBFBF] size-8 grid place-items-center">
                    <LoginOutlined style={{ fontSize: 20, color: "white" }} />
                  </div>
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex justify-between">
                    <span className="font-medium text-base">System Login</span>
                    <Typography.Text type="secondary">
                      {dayjs(log.created_at).format("MMM DD, YYYY HH:mm A")}
                    </Typography.Text>
                  </div>
                  <div className="bg-[#FAFAFA] rounded-lg px-3 py-2 mt-3 space-y-1 mb-3">
                    <Row>
                      <Col span={2}>
                        <Typography.Text type="secondary">
                          IP Address:
                        </Typography.Text>
                      </Col>
                      <Col span={16}>
                        <Typography.Text>{log.ip_address}</Typography.Text>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={2}>
                        <Typography.Text type="secondary">
                          City:
                        </Typography.Text>
                      </Col>
                      <Col span={16}>
                        <Typography.Text>{log.city}</Typography.Text>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={2}>
                        <Typography.Text type="secondary">
                          Country:
                        </Typography.Text>
                      </Col>
                      <Col span={16}>
                        <Typography.Text>{log.country}</Typography.Text>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={2}>
                        <Typography.Text type="secondary">
                          Device:
                        </Typography.Text>
                      </Col>
                      <Col span={16}>
                        <Typography.Text>{log.device}</Typography.Text>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={2}>
                        <Typography.Text type="secondary">
                          Browser:
                        </Typography.Text>
                      </Col>
                      <Col span={16}>
                        <Typography.Text>{log.browser}</Typography.Text>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
