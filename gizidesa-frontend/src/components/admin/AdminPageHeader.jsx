function AdminPageHeader({ label, title, description, action }) {
  return (
    <div className="admin-page-header">
      <div>
        {label && <span>{label}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}

export default AdminPageHeader;