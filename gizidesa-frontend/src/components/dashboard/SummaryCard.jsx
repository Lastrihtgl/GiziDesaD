function SummaryCard({ title, value, description, icon: Icon, tone = "green" }) {
    return (
    <article className={`summary-card summary-card-${tone}`}>
        <div className="summary-card-icon">{Icon && <Icon size={22} />}</div>
        <div>
            <p>{title}</p>
            <strong>{value}</strong>
            {description && <span>{description}</span>}
        </div>
    </article>
    );
}

export default SummaryCard;