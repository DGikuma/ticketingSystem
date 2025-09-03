
export async function logQuery<T>(
  query: string,
  params: any[],
  executor: (query: string, params: any[]) => Promise<T>
): Promise<T> {
  console.log("📝 SQL Query:", query.trim().replace(/\s+/g, " "));
  console.log("📦 Parameters:", params);

  const start = Date.now();
  try {
    const result = await executor(query, params);
    console.log("✅ Query success in", Date.now() - start, "ms");
    return result;
  } catch (err) {
    console.error("❌ Query failed:", err);
    throw err;
  }
}
