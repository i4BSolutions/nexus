import { error, success } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  DepartmentInterface,
  DepartmentResponse,
} from "@/types/departments/department.type";
import { ApiResponse } from "@/types/shared/api-response-type";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<DepartmentResponse> | ApiResponse<null>>> {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json(error("Department name is required", 400));
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("departments")
    .insert({ name })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(
      error(`Failed to create department: ${dbError.message}`, 500)
    );
  }

  return NextResponse.json(
    success(data, "Department created successfully", 200)
  );
}

export async function GET(): Promise<
  NextResponse<ApiResponse<DepartmentInterface[]> | ApiResponse<null>>
> {
  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("departments")
    .select("*");

  if (dbError) {
    return NextResponse.json(
      error(`Failed to retrieve departments: ${dbError.message}`, 500)
    );
  }

  return NextResponse.json(
    success(data, "Departments retrieved successfully", 200)
  );
}
