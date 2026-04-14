export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="page-title truncate">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
