
import type { LikesResponse } from "../../../../types/post";

const BASE_URL = "https://rahhal-api.runasp.net";

interface GetLikesParams {
  type: "post" | "comment";
  id: string;
  pageNumber?: number;
  pageSize?: number;
  sortByLastAdded?: boolean;
}

export async function getLikes({
  type,
  id,
  pageNumber = 1,
  pageSize = 10,
  sortByLastAdded = true,
}: GetLikesParams): Promise<LikesResponse> {
  const token = localStorage.getItem("token");

  if (type === "comment") {
    const query = new URLSearchParams({
      CommentId: id,
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
      SortByLastAdded: sortByLastAdded.toString(),
    });

    const res = await fetch(
      `${BASE_URL}/Like/GetCommentLikers?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch comment likes");

    return res.json();
  }
  if (type === "post") {

   const query = new URLSearchParams({
      PostId: id,
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
      SortByLastAdded: sortByLastAdded.toString(),
    });

    const res = await fetch(
      `${BASE_URL}/Like/GetPostLikes?${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  if (!res.ok) throw new Error("Failed to fetch post likes");

  return res.json();
}
  throw new Error("Invalid like type");

}