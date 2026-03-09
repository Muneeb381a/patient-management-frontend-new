import axios from "axios";
import { getToken, logout } from "./auth";

const BASE_URL = "https://new-patient-management-backend-syst.vercel.app";

// Session-level cache for GET requests — cleared on tab close, never stale across logins.
const SESSION_CACHE_PREFIX = "fc:";
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function sessionCacheGet(key) {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(SESSION_CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function sessionCacheSet(key, data) {
  try {
    sessionStorage.setItem(
      SESSION_CACHE_PREFIX + key,
      JSON.stringify({ data, expiresAt: Date.now() + SESSION_CACHE_TTL_MS })
    );
  } catch {
    // sessionStorage quota exceeded — silently skip
  }
}

export const fetchWithRetry = async (
  method = "get",
  endpoint,
  cacheKey,
  body,
  transformResponse = (data) => data,
  retries = 2,
  delay = 300
) => {
  let attempt = 1;

  // Ensure endpoint doesn't include the base URL
  const cleanEndpoint = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  // Return sessionStorage-cached result for GET requests — avoids redundant server calls
  if (method === "get" && cacheKey) {
    const cached = sessionCacheGet(cacheKey);
    if (cached !== null) return cached;
  }

  // POST/PUT/PATCH requests (e.g. batch consultation save) need a longer timeout
  const timeoutMs = method === "get" ? 8000 : 15000;

  while (attempt <= retries) {
    try {
      const token = getToken();
      const response = await axios({
        method,
        url: cleanEndpoint,
        data: body,
        timeout: timeoutMs,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = transformResponse(response.data);

      // Cache successful GET responses
      if (method === "get" && cacheKey) {
        sessionCacheSet(cacheKey, data);
      }

      return data;
    } catch (error) {
      const errorDetails = {
        status: error.response?.status,
        message: error.message,
        url: cleanEndpoint,
        attempt,
        retries,
        cacheKey,
      };

      const status = error.response?.status;

      // Token expired — log out immediately, no retries
      if (status === 401) {
        logout();
        window.location.href = "/";
        throw new Error("Session expired. Please log in again.");
      }

      // 4xx errors are client mistakes — retrying won't help, throw immediately
      if (status >= 400 && status < 500) {
        throw error;
      }

      if (attempt === retries) {
        throw new Error(`Failed to ${method} ${cacheKey}: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt++;
      delay *= 2; // Exponential backoff
    }
  }
};