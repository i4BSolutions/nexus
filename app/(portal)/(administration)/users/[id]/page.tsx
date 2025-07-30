"use client";

import { useGetById } from "@/hooks/react-query/useGetById";
import { useParams } from "next/navigation";

export default function UserDetailPage() {
  const params = useParams();
  const { data: userDetailData, isLoading } = useGetById(
    "users",
    params.id as string
  );

  console.log("User Detail Data:", userDetailData);
  return <div>User Detail Page</div>;
}
