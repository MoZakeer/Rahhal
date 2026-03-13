const BASE_URL = "https://rahhal-api.runasp.net";
function getToken() {
  const userJS = localStorage.getItem("user");
  if (!userJS) return "";
  const user = JSON.parse(userJS);

  return user?.token;
}

export async function fetchComments(postId: string, page = 1, pageSize = 20) {
          const token = getToken();

  const params = new URLSearchParams({
    PostId: postId,
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
    SortByLastAdded: "true",
  });

  const res = await fetch(`${BASE_URL}/Comment/AllCommentsToPost?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  return text ? JSON.parse(text) : { data: { items: [] } };
}

export async function fetchReplies(commentId: string, page = 1, pageSize =20) {

  const params = new URLSearchParams({
    CommentId: commentId,
    PageNumber: page.toString(),
    PageSize: pageSize.toString(),
  });

  const res = await fetch(`${BASE_URL}/Comment/AllRepliesToComment?${params.toString()}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const text = await res.text();
  return text ? JSON.parse(text) : { data: { items: [] } };
}

type CreateCommentBody = {
  profileId: string;
  postId: string;
  description: string;
  parentCommentId?: string;
};

export async function createComment(
  profileId: string,
  postId: string,
  description: string,
  parentCommentId?: string
) {
  
  const body: CreateCommentBody = { profileId, postId, description };
  if (parentCommentId) body.parentCommentId = parentCommentId;

  const res = await fetch(`${BASE_URL}/Comment/Create`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  return res.json();
}


type EditCommentBody = {
  commentId: string;
  description: string;
};

export async function editComment(commentId: string, description: string) {
  const body: EditCommentBody = {  commentId, description };

  const res = await fetch(`${BASE_URL}/Comment/Update`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" , Authorization: `Bearer ${getToken()}`},
    body: JSON.stringify(body),
  });
  return res.json();
}


export async function deleteComment(commentId: string) {
  const res = await fetch(`${BASE_URL}/Comment/Delete`, {
    method: "DELETE", 
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },

    body: JSON.stringify({ commentId }), 
  });

  if (!res.ok) throw new Error("Failed to delete comment");

  try {
    return await res.json();
  } catch {
    return { isSuccess: res.ok };
  }
}



export async function likeComment(profileId: string, commentId: string) {
  const res = await fetch(`${BASE_URL}/Like/ToComment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ profileId, commentId }),
  });
  if (!res.ok) throw new Error("Failed to like comment");
  return true;
}
export async function reportComment(profileId: string, commentId: string ,type:string,description:string) {
  const res = await fetch(`${BASE_URL}/Report/ReportComment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ profileId, commentId, type, description }),
  });
  if (!res.ok) throw new Error("Failed to report comment");
  return true;
}