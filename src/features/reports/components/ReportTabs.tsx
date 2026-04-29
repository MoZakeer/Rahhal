import { NavLink } from "react-router-dom";

export const ReportTabs = () => {
  return (
    <div className="flex gap-6  mb-6">
      <NavLink
        to="/admin/reports/users"
        className={({ isActive }) =>
          isActive
            ? "border-b-2 border-black pb-2 text-black dark:text-white dark:border-white"
            : "pb-2 text-gray-700"
        }
      >
        Users
      </NavLink>

      <NavLink
        to="/admin/reports/posts"
        className={({ isActive }) =>
          isActive
            ? "border-b-2 border-black pb-2 text-black dark:text-white dark:border-white"
            : "pb-2 text-gray-600"
        }
      >
        Posts
      </NavLink>

      <NavLink
        to="/admin/reports/comments"
        className={({ isActive }) =>
          isActive
            ? "border-b-2 border-black pb-2 text-black dark:text-white dark:border-white"
            : "pb-2 text-gray-600"
        }
      >
        Comments
      </NavLink>
    </div>
  );
};
