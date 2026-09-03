interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface2/60 p-8 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primarysoft text-primary">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mb-5 text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}
