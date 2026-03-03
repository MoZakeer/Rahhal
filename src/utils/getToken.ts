export function getToken(): string | null {
  const userJSON = localStorage.getItem("user");

  if (!userJSON) return null;

  try {
    const user = JSON.parse(userJSON);
    return user?.token ?? null;
  } catch {
    return null;
  }
}
