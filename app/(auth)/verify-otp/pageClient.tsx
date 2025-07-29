"use client";

import { App, Input, Space, Spin, Typography } from "antd";
import { OTPProps } from "antd/es/input/OTP";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";

export default function VerifyOtpClientPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, startVerifying] = useTransition();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const userData = searchParams.get("data");

  const verifyOtp = async (email: string, token: string) => {
    if (!email || !token) {
      message.error("Email and token are required for OTP verification");
      return;
    }

    let metadata = null;
    if (userData) {
      try {
        metadata = decodeURIComponent(userData);
      } catch (error) {
        message.error("Invalid user data format");
        return;
      }
    }

    try {
      const res = await fetch(`/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: token,
          isAdmin: metadata === "map[]",
        }),
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
      startVerifying(async () => {
        verifyOtp(email, token);
      });
    }
  }, [email, token]);

  const onChange: OTPProps["onChange"] = async (code) => {
    if (code && code.length === 6 && email) {
      startVerifying(async () => {
        await verifyOtp(email, code);
      });
    }
  };

  const onInput: OTPProps["onInput"] = (value) => {
    console.log("onInput:", value);
  };

  if ((email && token) || verifying) {
    return (
      <section className="!h-screen bg-[url(/loginBg.jpg)] bg-cover flex flex-col items-center justify-start pt-20">
        <Typography.Title className="text-white">
          Verifying {email}
        </Typography.Title>
        <Spin size="large" />
      </section>
    );
  }

  return (
    <section className="!h-screen bg-[url(/loginBg.jpg)] bg-cover flex flex-col items-center justify-start pt-20">
      <Typography.Title>Check your email for the OTP</Typography.Title>
      <Space direction="horizontal" size="large" className="mt-6">
        <Input.OTP onChange={onChange} onInput={onInput} size="large" />
      </Space>
    </section>
  );
}
