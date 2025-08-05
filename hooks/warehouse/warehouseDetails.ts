// hooks/useWarehouseDetails.ts
import { useEffect, useState } from "react";
import { WarehouseDetailsResponse } from "@/types/warehouse/warehouse.type";

export function useWarehouseDetails(
  id: string,
  tab: string,
  page: number,
  pageSize: number,
  search: string,
  isUpdated: boolean
) {
  const [data, setData] = useState([]);
  const [warehouseData, setWarehouseData] =
    useState<WarehouseDetailsResponse>();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({
      tab,
      page: page.toString(),
      pageSize: pageSize.toString(),
      search,
    });

    fetch(`/api/warehouses/${id}?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        setWarehouseData(res.data);
        setData(
          tab === "inventory"
            ? res.data.inventory
            : res.data.stock_movement_logs
        );
        setTotal(
          tab === "inventory"
            ? res.data.inventory_total
            : res.data.stock_movement_total
        );
      })
      .finally(() => setLoading(false));
  }, [id, tab, page, pageSize, search, isUpdated]);

  return { data, warehouseData, total, loading };
}
