import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/helper/getUser";
import { error, success } from "@/lib/api-response";
import {
  BudgetAllocationsInterface,
  BudgetAllocationsResponse,
} from "@/types/budget-allocations/budget-allocations.type";
import { ApiResponse } from "@/types/shared/api-response-type";

const bucket = "core-orbit";

export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BudgetAllocationsResponse | null>>> {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const q = searchParams.get("q") || "";
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let paginatedQuery = supabase
    .from("budget_allocation")
    .select("*", { count: "exact" })
    .neq("status", "Canceled");

  if (q) paginatedQuery = paginatedQuery.ilike("allocation_number", `%${q}%`);
  if (status) paginatedQuery = paginatedQuery.eq("status", status);
  if (startDate)
    paginatedQuery = paginatedQuery.gte("allocation_date", startDate);
  if (endDate) paginatedQuery = paginatedQuery.lte("allocation_date", endDate);

  if (sort === "equivalent_asc") {
    paginatedQuery = paginatedQuery.order("equivalent", { ascending: true });
  } else if (sort === "equivalent_desc") {
    paginatedQuery = paginatedQuery.order("equivalent", { ascending: false });
  } else {
    paginatedQuery = paginatedQuery.order("allocation_date", {
      ascending: false,
    });
  }

  paginatedQuery = paginatedQuery.range(from, to);

  const { data, count, error: fetchError } = await paginatedQuery;

  if (fetchError) {
    return NextResponse.json(error(fetchError.message), { status: 500 });
  }

  let allocatedUSDQuery = supabase
    .from("budget_allocation")
    .select("*")
    .eq("status", "Approved")
    .neq("status", "Canceled");

  if (q)
    allocatedUSDQuery = allocatedUSDQuery.ilike("allocation_number", `%${q}%`);
  if (startDate)
    allocatedUSDQuery = allocatedUSDQuery.gte("allocation_date", startDate);
  if (endDate)
    allocatedUSDQuery = allocatedUSDQuery.lte("allocation_date", endDate);

  const { data: allocatedData, error: allocatedError } =
    await allocatedUSDQuery;

  if (allocatedError) {
    return NextResponse.json(error(allocatedError.message), { status: 500 });
  }

  const totalAllocatedUSD =
    allocatedData?.reduce((sum, curr) => {
      const usd =
        curr.equivalent_usd ||
        (curr.exchange_rate_usd
          ? curr.allocation_amount / curr.exchange_rate_usd
          : 0);
      return sum + usd;
    }, 0) || 0;

  let statsQuery = supabase
    .from("budget_allocation")
    .select("*")
    .neq("status", "Canceled");

  if (q) statsQuery = statsQuery.ilike("allocation_number", `%${q}%`);
  if (status) statsQuery = statsQuery.eq("status", status);
  if (startDate) statsQuery = statsQuery.gte("allocation_date", startDate);
  if (endDate) statsQuery = statsQuery.lte("allocation_date", endDate);

  const { data: statsData, error: statsError } = await statsQuery;
  if (statsError) {
    return NextResponse.json(error(statsError.message), { status: 500 });
  }

  const { totalAllocations, totalPendingUSD } = (statsData || []).reduce(
    (acc, curr) => {
      const usd =
        curr.equivalent_usd ||
        (curr.exchange_rate_usd
          ? curr.allocation_amount / curr.exchange_rate_usd
          : 0);
      acc.totalAllocations += 1;
      if (curr.status === "Pending") acc.totalPendingUSD += usd;
      return acc;
    },
    {
      totalAllocations: 0,
      totalPendingUSD: 0,
    }
  );

  const statistics = {
    totalAllocatedUSD,
    totalPendingUSD,
    totalAllocations,
  };

  // Flatten all file paths from transfer_evidence arrays
  const allFilePaths = (data || [])
    .flatMap((item) =>
      Array.isArray(item.transfer_evidence) ? item.transfer_evidence : []
    )
    .filter((path): path is string => !!path);

  let signedUrlMap = new Map<string, string>();

  if (allFilePaths.length > 0) {
    const { data: signedData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrls(allFilePaths, 60 * 60); // 1 hour

    if (signedUrlError) {
      return NextResponse.json(error(signedUrlError.message), { status: 500 });
    }

    signedData?.forEach((entry) => {
      if (entry.path && entry.signedUrl) {
        signedUrlMap.set(entry.path, entry.signedUrl);
      }
    });
  }

  // Attach transfer_evidence_urls to each allocation
  const items =
    data?.map((item) => ({
      ...item,
      transfer_evidence_urls: Array.isArray(item.transfer_evidence)
        ? item.transfer_evidence.map(
            (key: string) => signedUrlMap.get(key) || null
          )
        : [],
    })) || [];

  // Stats
  // const allQuery = supabase.from("budget_allocation").select("*");
  // const allData = (await allQuery).data || [];

  // const totalAllocations = allData.length;
  // const totalAllocatedUSD = allData.reduce(
  //   (sum, a) => sum + (a.equivalent_usd || 0),
  //   0
  // );
  // const totalPendingUSD = allData
  //   .filter((a) => a.status === "Pending")
  //   .reduce((sum, a) => sum + (a.equivalent_usd || 0), 0);

  const response: BudgetAllocationsResponse = {
    items,
    total: count || 0,
    page,
    pageSize,
    statistics: statistics,
  };

  return NextResponse.json(success(response, "Budget allocations retrieved"), {
    status: 200,
  });
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<BudgetAllocationsInterface | null>>> {
  const supabase = await createClient();
  const formData = await req.formData();
  const user = await getAuthenticatedUser(supabase);
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const po_id = Number(formData.get("po_id"));
  const allocation_number = String(formData.get("allocation_number"));
  const allocation_date = String(formData.get("allocation_date"));
  const allocation_amount = Number(formData.get("allocation_amount"));
  const currency_code = String(formData.get("currency_code"));
  const exchange_rate_usd = Number(formData.get("exchange_rate_usd"));
  const note = formData.get("note")?.toString() || null;
  const allocated_by = formData.get("allocated_by")?.toString() || null;

  const files = formData.getAll("file") as File[];

  if (!files.length || files.some((f) => !(f instanceof File))) {
    return NextResponse.json(
      error("At least one valid image is required", 400)
    );
  }

  const { data: po, error: poError } = await supabase
    .from("purchase_order")
    .select("budget_id")
    .eq("id", po_id)
    .maybeSingle();

  if (poError) return NextResponse.json(error(poError.message, 500));

  if (!po?.budget_id)
    return NextResponse.json(
      error("Invalid PO or missing budget linkage", 400)
    );

  const { data: inserted, error: insertError } = await supabase
    .from("budget_allocation")
    .insert([
      {
        po_id,
        budget_id: po.budget_id,
        allocation_number,
        allocation_date,
        allocation_amount,
        currency_code,
        exchange_rate_usd,
        transfer_evidence: [],
        status: "Pending",
        created_by: user.id,
        allocated_by,
        note,
      },
    ])
    .select()
    .single();

  if (insertError) return NextResponse.json(error(insertError.message, 500));

  const allocationId = inserted.id;

  const uploadedPaths: string[] = [];

  for (const file of files) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${fileExt}`;
    const filePath = `budget-allocation-transfer-evidence/${allocationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        error(`Upload failed: ${uploadError.message}`, 500)
      );
    }

    uploadedPaths.push(filePath);
  }

  // Update allocation with file path
  const { data: updated, error: updateError } = await supabase
    .from("budget_allocation")
    .update({ transfer_evidence: uploadedPaths })
    .eq("id", allocationId)
    .select()
    .single();

  if (updateError) return NextResponse.json(error(updateError.message, 500));

  // Audit log
  await supabase.from("budget_allocation_activity_logs").insert([
    {
      user_id: user.id,
      role: user.name,
      action_type: "Create",
      po_id,
      allocation_id: allocationId,
      amount: allocation_amount,
      currency_code,
      notes: note,
    },
  ]);

  return NextResponse.json(
    success(updated, "Allocation created successfully"),
    {
      status: 201,
    }
  );
}
