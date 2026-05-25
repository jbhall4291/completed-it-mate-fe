const BACKEND_API_URL = process.env.BACKEND_API_URL;
const API_KEY = process.env.API_KEY;

async function handler(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!BACKEND_API_URL || !API_KEY) {
    return Response.json(
      { message: "Missing BACKEND_API_URL or API_KEY" },
      { status: 500 }
    );
  }

  const { path } = await params;
  const url = new URL(request.url);

  const cleanBaseUrl = BACKEND_API_URL.replace(/\/$/, "");
  const targetUrl = `${cleanBaseUrl}/${path.join("/")}${url.search}`;

  console.log("Proxying request to:", targetUrl);

  const headers = new Headers(request.headers);
  headers.set("x-api-key", API_KEY);
  headers.delete("host");

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers(response.headers);

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;