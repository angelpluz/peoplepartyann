type BackendApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  requireApiKey?: boolean;
};

type BackendApiResult<T> = {
  data: T | null;
  status: number;
};

function resolveBackendBaseUrl() {
  const baseUrl = process.env.BACKEND_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("BACKEND_API_BASE_URL is not configured");
  }
  return baseUrl.replace(/\/+$/, "");
}

function resolveBackendApiKey() {
  const apiKey = process.env.BACKEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("BACKEND_API_KEY is not configured");
  }
  return apiKey;
}

async function parseBackendBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return (await response.json()) as unknown;
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text ? { error: text } : null;
}

export async function callBackendApi<T = unknown>(
  path: string,
  options: BackendApiOptions = {},
): Promise<BackendApiResult<T>> {
  const method = options.method || "GET";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${resolveBackendBaseUrl()}${normalizedPath}`;

  const headers = new Headers();
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (options.requireApiKey) {
    headers.set("X-API-Key", resolveBackendApiKey());
  }

  const response = await fetch(url, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  const data = (await parseBackendBody(response)) as T | null;
  return {
    data,
    status: response.status,
  };
}

export function readBackendErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "error" in data) {
    const raw = (data as { error?: unknown }).error;
    if (typeof raw === "string" && raw.trim()) {
      return raw;
    }
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return fallback;
}
