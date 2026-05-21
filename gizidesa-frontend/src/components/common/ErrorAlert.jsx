function ErrorAlert({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-alert">
      <strong>Terjadi kesalahan</strong>
      <p>{message}</p>
    </div>
  );
}

export default ErrorAlert;