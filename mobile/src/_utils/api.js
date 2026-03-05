// Android emulator: dùng 10.0.2.2 để trỏ về máy tính host
// iOS simulator: có thể dùng localhost
export const API_BASE = "http://10.0.2.2:5000";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}