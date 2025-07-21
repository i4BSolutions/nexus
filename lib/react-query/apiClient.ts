export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || "Fetch error");
  }

  return json.data;
}

export async function apiPost<T>(url: string, data: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || "Post error");
  }

  return json.data;
}

export async function apiPut<T>(url: string, data: any): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || "Put error");
  }

  return json.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
  });

  const json = await res.json();

  if (!res.ok || json.status !== "success") {
    throw new Error(json.message || "Delete error");
  }

  return json.data;
}
