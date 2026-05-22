function EmptyState({ title = "Data belum tersedia", message = "Belum ada data yang dapat ditampilkan." }) {
    return (
    <div className="empty-state">
        <h3>{title}</h3>
        <p>{message}</p>
    </div>
    );
}

export default EmptyState;