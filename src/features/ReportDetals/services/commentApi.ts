import axios from "axios";

const BASE_URL = "https://rahhal-api.runasp.net";
function getTokenFromStorage() {
  const userJS = localStorage.getItem("user");
  if (!userJS) return null;
  const { token } = JSON.parse(userJS);
  return token;
}
export const getCommentById = async (id: string) => {
  const token = getTokenFromStorage();
  if (!token) throw new Error("No token found");

  const response = await axios.get(
    `${BASE_URL}/Comment/CommentById`,
    {
      params: { commentId: id },
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};