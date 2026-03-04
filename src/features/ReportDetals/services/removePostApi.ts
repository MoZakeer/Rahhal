import axios from "axios";

function getTokenFromStorage() {
  const userJS = localStorage.getItem("user");
  if (!userJS) return null;
  const { token } = JSON.parse(userJS);
  return token;
}

export const rejectPostReport = async (postId: string) => {
  const token = getTokenFromStorage();
  if (!token) throw new Error("No token found");

  const { data } = await axios.delete(
    "https://rahhal-api.runasp.net/Post/Delete",
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { postId }, 
    }
  );

  return data;
};