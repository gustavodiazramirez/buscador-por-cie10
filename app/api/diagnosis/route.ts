export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");

  const res = await fetch(`https://cpockets.com/ajaxsearch10?term=${encodeURIComponent(term || "")}`);
  const data = await res.json();

  return Response.json(data);
}
