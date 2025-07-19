"use client";

import Breadcrumbs from "@/components/shared/Breadcrumbs";
import HeaderSection from "@/components/shared/HeaderSection";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  return (
    <section className="px-6 grid place-items-center w-full">
      <div className="w-full max-w-[1140px]">
        <Breadcrumbs
          items={[
            { title: "Home", href: "/" },
            { title: "Users & Permissions" },
          ]}
        />
        <HeaderSection
          title="Users & Permissions"
          description="Manage and track all users and permissions"
          icon={<UserOutlined style={{ fontSize: 20, color: "white" }} />}
          onAddNew={() => router.push("/users/create")}
          buttonText="New User"
          buttonIcon={<PlusOutlined />}
        />
      </div>
    </section>
  );
}
