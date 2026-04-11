export function getUserId(): string {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    return payload.profileId || "";
  } catch (err) {
    console.error("Failed to parse token", err);
    return "";
  }
}
export function getUserRole(): string {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";

    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    return payload.role || "";
  } catch {
    return "";
  }
}
export function isTokenValid(): boolean {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const payloadBase64 = token.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));

    if (!payload.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000); // Convert ms to seconds
    return payload.exp > currentTime;
  } catch {
    return false;
  }
}
