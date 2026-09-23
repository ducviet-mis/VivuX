import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchAllPages } from './fetch-all-pages.ts';

test('loads every page so lessons after the first 1000 questions are counted', async () => {
  const questions = Array.from({ length: 1120 }, (_, index) => ({ id: index, lessonId: index < 1000 ? 'older' : 'bai-2-da-thuc' }));
  const calls = [];
  const result = await fetchAllPages(async (from, to) => {
    calls.push([from, to]);
    return { data: questions.slice(from, to + 1), error: null };
  });
  assert.equal(result.length, 1120);
  assert.equal(result.filter((question) => question.lessonId === 'bai-2-da-thuc').length, 120);
  assert.deepEqual(calls, [[0, 499], [500, 999], [1000, 1499]]);
});

test('handles an exact page boundary and does not return incomplete results on error', async () => {
  const rows = Array.from({ length: 1000 }, (_, id) => ({ id }));
  assert.equal((await fetchAllPages(async (from, to) => ({ data: rows.slice(from, to + 1), error: null }))).length, 1000);
  await assert.rejects(fetchAllPages(async (from) => from === 0
    ? { data: rows.slice(0, 500), error: null }
    : { data: null, error: { message: 'page failed' } }), /page failed/);
});
