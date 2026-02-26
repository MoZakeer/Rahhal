export function PostContent({ description , className = "" }: { description: string,  className?: string;
 }) {
  return <p className={`px-4 text-black/90 pb-2 ${className}`}>{description}</p>;
}
