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
export function getUserRole(): string {
  const userJS = localStorage.getItem("user");
  if (!userJS) return "";

  try {
    const user = JSON.parse(userJS);
    const token = user?.token;
    if (!token) return "";

    const payloadBase64 = token.split('.')[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    return payload.role || ""; 
  } catch  {
    return "";
  }
}
export function isTokenValid(): boolean {
  const userJS = localStorage.getItem("user");
  if (!userJS) return false;

  try {
    const user = JSON.parse(userJS);
    const token = user?.token;
    if (!token) return false;

    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));

    if (!payload.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000); // Convert ms to seconds
    
    // Returns true only if the token is "SuperAdmin" AND not expired
    return  payload.exp > currentTime;
  } catch {
    return false;
  }
}