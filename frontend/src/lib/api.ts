export const API_URL = import.meta.env.VITE_API_URL;

// ✅ TOUJOURS inclure /api
export const ALERTES_API_URL = `${API_URL}/api/alertes/`;
export const ANNONCES_API_URL = `${API_URL}/api/annonces/`;
export const USERS_API = `${API_URL}/api/users/`;

export const loginUser = async (data: any) => {
  const res = await fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("API ERROR:", text);
    throw new Error("Erreur API");
  }

  return res.json();
};
