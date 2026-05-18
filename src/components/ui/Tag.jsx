export default function Tag({ children }) {
  return <span className="tag">{children}</span>;
}

export function TagGroup({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </div>
  );
}
