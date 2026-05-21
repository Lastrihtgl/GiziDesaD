export function getAuthToken() {
  return localStorage.getItem("gizidesa_token");
}

export function getAuthUser() {
  const rawUser = localStorage.getItem("gizidesa_user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

export function saveAuthData(token, user) {
  localStorage.setItem("gizidesa_token", token);
  localStorage.setItem("gizidesa_user", JSON.stringify(user));
}

export function clearAuthData() {
  localStorage.removeItem("gizidesa_token");
  localStorage.removeItem("gizidesa_user");
  localStorage.removeItem("gizidesa_remember_role");
}