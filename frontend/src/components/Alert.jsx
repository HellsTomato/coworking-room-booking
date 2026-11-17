export function Alert({ tone = 'error', title, children, action }) {
  const role = tone === 'success' ? 'status' : 'alert'
  return (
    <div className={`alert alert--${tone}`} role={role}>
      {title ? <p className="alert__title">{title}</p> : null}
      {children ? <div className="alert__body">{children}</div> : null}
      {action ? <div className="alert__action">{action}</div> : null}
    </div>
  )
}
