export const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

function buildUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token, headers = {} } = options;
  let response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error(
      "Impossible de joindre le serveur. Verifiez que le backend LifeLine est lance et accessible."
    );
  }

  const rawText = await response.text();
  let data = {};

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { message: rawText };
    }
  }

  if (!response.ok) {
    const responseMessage =
      typeof data?.message === "string" ? data.message.trim() : "";

    if (responseMessage) {
      throw new Error(responseMessage);
    }

    if ([502, 503, 504].includes(response.status)) {
      throw new Error(
        "Le frontend ne parvient pas a joindre le backend. Verifiez que le serveur Node est bien lance sur le port 5001."
      );
    }

    throw new Error(`Request failed (${response.status}).`);
  }

  return data;
}
