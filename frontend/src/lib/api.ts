export const API_URL = import.meta.env.VITE_API_URL;

export const ALERTES_API_URL = `${API_URL}/alertes/`;
export const ANNONCES_API_URL = `${API_URL}/annonces/`;
export const USERS_API = `${API_URL}/users`;
export const loginUser = async (data: any) => {
  const res = await fetch(`${API_URL}/api/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error("Erreur API");
  }

  return res.json();
};
