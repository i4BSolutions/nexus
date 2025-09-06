import { useCreate } from "@/hooks/react-query/useCreate";
import { useGetAll } from "@/hooks/react-query/useGetAll";
import { UserInterface, UsersResponse } from "@/types/user/user.type";
import getAvatarUrl from "@/utils/getAvatarUrl";
import { MailFilled, SendOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Col,
  Form,
  FormProps,
  Input,
  Modal,
  Row,
  Select,
  SelectProps,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type UserOptionType = {
  value: string;
  full_name: string;
  username: string;
};

type EmailFieldType = {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
};

export default function PoEmailModal({
  showEmailModal,
  poEmailData,
  setEmailModal,
}: {
  showEmailModal: boolean;
  poEmailData: any;
  setEmailModal: (show: boolean) => void;
}) {
  const { message } = App.useApp();
  const router = useRouter();
  const [userOptions, setUserOptions] = useState<UserOptionType[]>([]);

  const { data: users } = useGetAll<UsersResponse>("/users", ["users"]);
  const { mutate: sendEmail } = useCreate("/purchase-orders/send-email");

  useEffect(() => {
    if (users) {
      const options = users.dto.map((user: UserInterface) => ({
        value: user.email,
        full_name: user.full_name,
        username: user.username,
      }));
      setUserOptions(options);
    }
  }, [users]);

  const optionByValue = useMemo(() => {
    const optionMap = new Map<string, UserOptionType>();
    userOptions.forEach((option) => optionMap.set(option.value, option));
    return optionMap;
  }, [userOptions]);

  type TagRender = SelectProps["tagRender"];

  const tagRender: TagRender = (props) => {
    const { value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const opt = optionByValue.get(String(value));

    return (
      <Tag
        style={{ display: "flex", alignItems: "center", gap: 6 }}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
      >
        <img
          src={getAvatarUrl(opt?.username || "")}
          className="rounded-full size-3"
        />
        {opt?.full_name} ({value})
      </Tag>
    );
  };

  const onFinish: FormProps<EmailFieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    sendEmail(
      {
        to: values.to,
        cc: values.cc || [],
        bcc: values.bcc || [],
        subject: values.subject,
        body: values.body,
        // For future PDF implementation
        // pdfFileName: `Nexus_PO_${poEmailData?.po_number || "NoNumber"}.pdf`,
        // pdfContent: pdfBuffer.toString("base64"),
      },
      {
        onSuccess: () => {
          message.success("Email sent successfully");
          setEmailModal(false);
          router.push("/purchase-orders");
        },
        onError: (error) => {
          console.error("Error sending email:", error);
          message.error("Failed to send email. Please try again.");
        },
      }
    );
  };

  if (!users) return <Spin fullscreen />;

  return (
    <Modal
      open={showEmailModal}
      closable={false}
      footer={null}
      width={750}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Card
        styles={{
          header: {
            background: "linear-gradient(90deg, #F9F0FF 0%, #FFF 100%)",
            borderBottom: "1px solid #D3ADF7",
          },
        }}
        title={
          <div className="flex items-center justify-center p-6">
            <Space
              style={{
                width: 32,
                height: 32,
                borderRadius: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 20,
                color: "white",
                background: "#9254DE",
                marginRight: 10,
              }}
            >
              <MailFilled />
            </Space>
            <Space direction="vertical" size={0}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Send Purchase Order by Email
              </Typography.Title>
            </Space>
          </div>
        }
        variant="outlined"
      >
        {/* Default Recipients */}
        <div className="mb-2">Default Recipients</div>
        <div className="flex flex-wrap mb-6">
          <Tag style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <img
              src={getAvatarUrl("procurement")}
              className="rounded-full size-3"
            />
            Procurement (procurement@nexus.com)
          </Tag>
          <Tag
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <img
              src={getAvatarUrl("warehouse")}
              className="rounded-full size-3"
            />
            Warehouse (warehouse@nexus.com)
          </Tag>
        </div>

        {/* Additional Recipients */}
        <div className="mb-2">Additional Recipients</div>
        <Form
          name="email-form"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{
            subject: `Nexus Purchase Order ${poEmailData?.po_number || ""}`,
          }}
        >
          <Row align={"middle"} style={{ marginBottom: 8 }}>
            <Col span={2}>To:</Col>
            <Col span={22}>
              <Form.Item<EmailFieldType>
                style={{ marginBottom: 0 }}
                name="to"
                rules={[
                  {
                    required: true,
                    message: "Please input at least one recipient!",
                  },
                ]}
              >
                <Select
                  mode={"multiple"}
                  style={{ width: "100%" }}
                  tagRender={tagRender}
                  options={userOptions}
                  optionRender={({ data }: { data: UserOptionType }) => {
                    return (
                      <div className="flex items-center gap-4">
                        <img
                          src={getAvatarUrl(data.username)}
                          className="rounded-full size-8"
                        />
                        <div>
                          <div>{data.full_name}</div>
                          <div>{data.value}</div>
                        </div>
                      </div>
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row align={"middle"} style={{ marginBottom: 8 }}>
            <Col span={2}>CC:</Col>
            <Col span={22}>
              <Form.Item<EmailFieldType> style={{ marginBottom: 0 }} name="cc">
                <Select
                  mode={"multiple"}
                  style={{ width: "100%" }}
                  tagRender={tagRender}
                  options={userOptions}
                  optionRender={({ data }: { data: UserOptionType }) => {
                    return (
                      <div className="flex items-center gap-4">
                        <img
                          src={getAvatarUrl(data.username)}
                          className="rounded-full size-8"
                        />
                        <div>
                          <div>{data.full_name}</div>
                          <div>{data.value}</div>
                        </div>
                      </div>
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row align={"middle"} style={{ marginBottom: 24 }}>
            <Col span={2}>BCC:</Col>
            <Col span={22}>
              <Form.Item<EmailFieldType> style={{ marginBottom: 0 }} name="bcc">
                <Select
                  mode={"multiple"}
                  style={{ width: "100%" }}
                  tagRender={tagRender}
                  options={userOptions}
                  optionRender={({ data }: { data: UserOptionType }) => {
                    return (
                      <div className="flex items-center gap-4">
                        <img
                          src={getAvatarUrl(data.username)}
                          className="rounded-full size-8"
                        />
                        <div>
                          <div>{data.full_name}</div>
                          <div>{data.value}</div>
                        </div>
                      </div>
                    );
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Subject */}
          <Form.Item<EmailFieldType>
            style={{ marginBottom: 0 }}
            name="subject"
            rules={[
              {
                required: true,
                message: "Please fill the subject!",
              },
            ]}
          >
            <Input placeholder="Subject" style={{ marginBottom: 8 }} />
          </Form.Item>

          {/* Body */}
          <Form.Item<EmailFieldType>
            style={{ marginBottom: 0 }}
            name="body"
            rules={[
              {
                required: true,
                message: "Please fill the email body!",
              },
            ]}
          >
            <Input.TextArea placeholder="Body" rows={6} />
          </Form.Item>

          <div className="w-full flex justify-between mt-4">
            <Button onClick={() => setEmailModal(false)}>Skip for now</Button>
            <Button type="primary" icon={<SendOutlined />} htmlType="submit">
              Send Now
            </Button>
          </div>
        </Form>
      </Card>
    </Modal>
  );
}
