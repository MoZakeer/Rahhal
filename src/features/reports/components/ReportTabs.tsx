import { NavLink } from "react-router-dom";

export const ReportTabs = () => {
  return (
    <div className="flex gap-6 border-b mb-6">
      <NavLink
        to="/admin/reports/users"
        className={({ isActive }) =>
          isActive ? "border-b-2 border-black pb-2" : "pb-2"
        }
      >
        Users
      </NavLink>

      <NavLink
        to="/admin/reports/posts"
        className={({ isActive }) =>
          isActive ? "border-b-2 border-black pb-2" : "pb-2"
        }
      >
        Posts
      </NavLink>

      <NavLink
        to="/admin/reports/comments"
        className={({ isActive }) =>
          isActive ? "border-b-2 border-black pb-2" : "pb-2"
        }
      >
        Comments
      </NavLink>
    </div>
  );
};