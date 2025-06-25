"use client";

import { App, Flex, Input, Space, Spin, Typography } from "antd";
import { OTPProps } from "antd/es/input/OTP";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VerifyOtpPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const verifyOtp = async (
    email: string,
    token: string,
    isAdmin: boolean = false
  ) => {
    if (!email || !token) {
      message.error("Email and token are required for OTP verification");
      return;
    }

    try {
      const res = await fetch(`/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: token, isAdmin }),
      });
      const result = await res.json();
      console.log("OTP verification result:", result);
      if (res.ok) {
        router.push("/");
      }
    } catch (error: any) {
      message.error(
        error.message || "An error occurred during OTP verification"
      );
      throw error;
    }
  };

  useEffect(() => {
    if (email && token) {
      verifyOtp(email, token, true);
    }
  }, [email, token]);

  const onChange: OTPProps["onChange"] = async (code) => {
    if (code && code.length === 6 && email) {
      await verifyOtp(email, code, false);
    }
  };

  const onInput: OTPProps["onInput"] = (value) => {
    console.log("onInput:", value);
  };

  if (email && token) {
    return (
      <Flex
        justify="start"
        gap={20}
        align="center"
        vertical
        className="!h-screen !pt-20"
      >
        <Typography.Title>Verifying {email}</Typography.Title>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <Flex
      justify="start"
      gap={20}
      align="center"
      vertical
      className="!h-screen !pt-20"
    >
      <Typography.Title>Check your email for the OTP</Typography.Title>
      <Space direction="horizontal" size="large">
        <Input.OTP onChange={onChange} onInput={onInput} />
      </Space>
    </Flex>
  );
}
