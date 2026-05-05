type Props = {
  type: "posts" | "comments" | "users";
};

export default function ReportHeader({ type }: Props) {
  const getTitle = () => {
    switch (type) {
      case "posts":
        return "Reported Post";
      case "comments":
        return "Reported Comment";
      case "users":
        return "Reported User";
      default:
        return "Report Details";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 space-y-3 transition-colors">
      <div>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {getTitle()}
        </h1>
      </div>
    </div>
  );
}