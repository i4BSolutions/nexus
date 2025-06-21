"use client";

import { createClient } from "@/lib/supabase/client";
import { Button, Flex, Input, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signInWithOtp } from "./action";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const loginHandler = async () => {
    if (!email) return;
    startTransition(() => {
      signInWithOtp(email)
        .then(() => {
          router.push("verify-otp?email=" + encodeURIComponent(email));
        })
        .catch((error) => {
          console.error("Login failed:", error);
        });
    });
  };

  const googleLoginHandler = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
  };

  return (
    <Flex
      justify="start"
      gap={20}
      align="center"
      vertical
      className="!h-screen !pt-20"
    >
      <Typography.Title>Welcome to Core Orbit</Typography.Title>
      <Space direction="horizontal" size="large">
        <Input
          placeholder="yourmail@domain.com"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              loginHandler();
            }
          }}
        />
        <Button
          type="primary"
          onClick={loginHandler}
          disabled={!email}
          loading={pending}
        >
          Login
        </Button>
      </Space>
      <Button type="primary" onClick={googleLoginHandler} loading={pending}>
        Login with google
      </Button>
    </Flex>
  );
}
