export const API_URL = import.meta.env.VITE_API_URL;
export const USERS_API = `${API_URL}/api/users/`;
export const ADMINS_API = `${API_URL}/api/admins/`;
export const ALERTES_API_URL = `${API_URL}/api/alertes/`;
export const ANNONCES_API_URL = `${API_URL}/api/annonces/`;

// Fonction utilitaire pour les appels API
export const fetchAPI = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  // Débogage
  console.log(`API Call: ${options.method || 'GET'} ${url}`, {
    status: response.status,
    statusText: response.statusText
  });

  // Vérifiez si c'est du HTML
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    const text = await response.text();
    console.error('HTML Response (first 500 chars):', text.substring(0, 500));
    throw new Error('Server returned HTML instead of JSON. Check API endpoint.');
  }

  if (!response.ok) {
    // Essayez de parser l'erreur comme JSON
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API Error ${response.status}`);
    } catch (e) {
      // Si ce n'est pas du JSON, lancez l'erreur texte
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
    }
  }

  return response.json();
};

// Fonctions spécifiques
export const loginUser = async (data: any) => {
  return fetchAPI(`${USERS_API}login/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const loginAdmin = async (data: any) => {
  return fetchAPI(`${ADMINS_API}login/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const createUser = async (data: any) => {
  const formData = new FormData();
  // ... remplissez formData
  return fetchAPI(`${USERS_API}create/`, {
    method: "POST",
    headers: {}, // Pas de Content-Type pour FormData
    body: formData,
  });
};

export const createAdmin = async (data: any) => {
  const formData = new FormData();
  // ... remplissez formData
  return fetchAPI(`${ADMINS_API}create/`, {
    method: "POST",
    headers: {}, // Pas de Content-Type pour FormData
    body: formData,
  });
};