export function PostContent({ description, className = "" }: { description: string, className?: string; }) {
  return (
    <p className={`px-4 text-slate-900/90 dark:text-slate-200/90 pb-2 ${className}`}>
      {description}
    </p>
  );
}