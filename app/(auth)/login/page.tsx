"use client";

import { createClient } from "@/lib/supabase/client";
import { App, Button, Flex, Input, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithOtp } from "../actions";

export default function LoginPage() {
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const router = useRouter();
  const emailRegex = /\.(com|org|net|edu|gov|io|co)$/i;

  const loginHandler = async () => {
    if (!email) return;
    try {
      await signInWithOtp(email);
      router.push("verify-otp?email=" + encodeURIComponent(email));
    } catch (error) {
      message.error("Account not provisioned in system!");
      await fetch("/api/auth/login-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          method: "OTP",
        }),
      });
    }
  };

  const googleLoginHandler = async () => {
    const data = await fetch(
      `/api/auth/check-user?email=${encodeURIComponent(email)}`
    );
    const { exists } = await data.json();
    if (exists) {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/api/auth/callback`,
        },
      });
    } else {
      message.error("Account not provisioned in system!");
      await fetch("/api/auth/login-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          method: "Google SSO",
        }),
      });
    }
  };

  return (
    <Flex
      justify="start"
      gap={20}
      align="center"
      vertical
      className="!h-screen !pt-20"
    >
      <Typography.Title>Welcome to Nexus</Typography.Title>
      <div>
        <Input
          placeholder="yourmail@domain.com"
          type="email"
          size="large"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </div>
      <Space direction="vertical" size="large">
        <Button
          type="primary"
          onClick={loginHandler}
          disabled={!emailRegex.test(email)}
        >
          Sign In with OTP
        </Button>
        <Button
          type="primary"
          onClick={googleLoginHandler}
          disabled={!emailRegex.test(email)}
        >
          Continue with Google
        </Button>
      </Space>
    </Flex>
  );
}
