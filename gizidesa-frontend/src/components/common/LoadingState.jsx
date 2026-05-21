import { Leaf } from "lucide-react";

function LoadingState({ title = "Memuat Data", message = "Sistem sedang mengambil data terbaru." }) {
  return (
    <div className="admin-state-card">
      <div className="admin-state-icon">
        <Leaf size={26} />
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;