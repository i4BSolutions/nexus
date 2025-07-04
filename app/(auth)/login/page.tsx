"use client";

import { createClient } from "@/lib/supabase/client";
import { GoogleOutlined, MailOutlined } from "@ant-design/icons";
import { App, Button, Image, Input, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { signInWithOtp } from "../actions";

export default function LoginPage() {
  const { message } = App.useApp();
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [otpPending, startOtpRequest] = useTransition();
  const [googlePending, startGoogleRequest] = useTransition();
  const emailRegex = /\.(com|org|net|edu|gov|io|co)$/i;

  const loginHandler = async () => {
    if (!email) return;
    if (!navigator.onLine) {
      message.error("You are offline! Please check your internet connection.");
      return;
    }
    startOtpRequest(async () => {
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
    });
  };

  useEffect(() => {
    if (!navigator.onLine) {
      message.error("You are offline! Please check your internet connection.");
    }
  }, [email]);

  const googleLoginHandler = async () => {
    startGoogleRequest(async () => {
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
    });
  };

  return (
    <section className="!h-screen bg-[url(/loginBg.jpg)] bg-cover grid place-items-center">
      <div className="border border-[#595959] px-10 py-6 rounded-[8px] bg-[rgba(38,38,38,0.75)] backdrop-blur-sm space-y-6 text-center">
        <Typography.Text style={{ color: "white", fontSize: 16 }}>
          Welcome to
        </Typography.Text>
        <div className="flex justify-center mt-2">
          <Image src="nexus.svg" alt="Nexus Logo" />
        </div>
        <div>
          <Input
            prefix={<MailOutlined style={{ color: "white", marginRight: 4 }} />}
            placeholder="yourmail@domain.com"
            style={{
              backgroundColor: "transparent",
              color: "white",
            }}
            className="white-placeholder"
            type="email"
            size="large"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            width="100%"
            autoFocus
          />
        </div>
        <div className="w-full space-y-3">
          <Button
            type="primary"
            onClick={loginHandler}
            style={{ width: "100%" }}
            disabled={!emailRegex.test(email)}
            size="large"
            loading={otpPending}
          >
            Sign In with OTP
          </Button>
          <Button
            type="primary"
            style={{ width: "100%" }}
            onClick={googleLoginHandler}
            disabled={!emailRegex.test(email)}
            size="large"
            loading={googlePending}
          >
            <GoogleOutlined />
            Continue with Google
          </Button>
        </div>
        <Typography.Text style={{ color: "white" }}>
          AUTHORIZED PERSONNEL ONLY
        </Typography.Text>
      </div>
    </section>
  );
}
