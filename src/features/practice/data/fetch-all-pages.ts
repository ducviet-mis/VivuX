export const PRACTICE_PAGE_SIZE = 500;

type PageResult<T> = { data: T[] | null; error: { message: string } | null };

/** Supabase/PostgREST caps rows returned by one request, even without a limit(). */
export async function fetchAllPages<T>(
  fetchPage: (from: number, to: number) => Promise<PageResult<T>>,
  pageSize = PRACTICE_PAGE_SIZE,
): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPage(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Không thể tải đầy đủ dữ liệu tự luyện.');
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}
