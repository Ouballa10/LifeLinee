export const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

function buildUrl(path = "") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, token, headers = {} } = options;
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller
    ? globalThis.setTimeout(() => controller.abort(), 15000)
    : null;
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
      signal: controller?.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        "L'API LifeLine met trop de temps a repondre. Reessayez ou verifiez le deploy Vercel."
      );
    }

    throw new Error(
      "Impossible de joindre l'API LifeLine. Verifiez la configuration Vercel/API locale."
    );
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
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
        "Le frontend ne parvient pas a joindre l'API LifeLine. Verifiez les variables Supabase/Firebase cote serveur."
      );
    }

    throw new Error(`Request failed (${response.status}).`);
  }

  return data;
}
