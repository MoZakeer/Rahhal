export function getUserId(): string {
  const userJS = localStorage.getItem("user");
  if (!userJS) return "";

  try {
    const user = JSON.parse(userJS);
    const token = user?.token;
    if (!token) return "";

    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    return payload.profileId || "";
  } catch (err) {
    console.error("Failed to parse token", err);
    return "";
  }
}
