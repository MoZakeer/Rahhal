// // api/search.api.ts
// import axios from "axios";

// interface SearchParams {
//   keyword: string;
//   tab?: number;       
//   pageNumber?: number; 
//   pageSize?: number;   
//   token: string;       
// }

// export const searchGlobal = async ({
//   keyword,
//   tab = 1,
//   pageNumber = 1,
//   pageSize = 10,
//   token,
// }: SearchParams) => {
//   try {
//     const response = await axios.get(
//       "https://rahhal-api.runasp.net/Search/Global",
//       {
//         params: {
//           Keyword: keyword,
//           Tab: tab,
//           PageNumber: pageNumber,
//           PageSize: pageSize,
//         },
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

    
//     return response.data;
//   } catch (error) {
//     console.error("Search API Error:", error);
//     throw error;
//   }
// };