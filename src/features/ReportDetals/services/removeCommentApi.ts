
import axios from "axios";
const BASE_URL = "https://rahhal-api.runasp.net";
function getTokenFromStorage() {
    const userJS = localStorage.getItem("user");
    if (!userJS) return null;
    const { token } = JSON.parse(userJS);
    return token;
}
export const rejectCommentReport = async (commentId: string) => {
    const token = getTokenFromStorage();
    if (!token) throw new Error("No token found");

    const response = await axios.delete(

        `${BASE_URL}/Comment/Delete`,
        {
            headers: { Authorization: `Bearer ${token}` },
            data: { commentId },
        }
    );

    return response.data;
};