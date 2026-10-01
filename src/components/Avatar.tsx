export function Avatar({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <div className={`avatar avatar--${size}`} aria-hidden="true">
      G
    </div>
  );
}
