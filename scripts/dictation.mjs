export const normalizeAnswer = (value) => String(value).trim().toLowerCase().replace(/\s+/g, " ");

export function newDictation(ids, previous = [], records = {}, random = Math.random, lastId = null) {
  const order = [...ids];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (order.length > 1) {
    for (let n = 0; n < order.length && (order.join() === previous.join() || order[0] === lastId); n++) order.push(order.shift());
  }
  return { order, queue: order.map(id => ({ id, retry: false })), index: 0, draft: "", heard: false, feedback: null, records: structuredClone(records), results: {}, earned: 0 };
}

export function checkDictation(run, answer, expected, help = false) {
  const next = structuredClone(run);
  const item = next.queue[next.index];
  if (!item || next.feedback || !next.heard || (!help && !answer.trim())) return { run: next, awardId: null };
  const correct = !help && normalizeAnswer(answer) === normalizeAnswer(expected);
  const prior = next.records[item.id] || {};
  next.feedback = { correct, answer, expected, help };
  next.results[item.id] = correct ? (item.retry ? "corrected" : "independent") : "pending";
  next.records[item.id] = { ...prior, passed: prior.passed || correct, status: next.results[item.id], updatedAt: Date.now() };
  // Append at most one retry and only when another task separates feedback from retrieval.
  if (!correct && !item.retry && next.index < next.queue.length - 1) next.queue.push({ id: item.id, retry: true });
  return { run: next, awardId: correct ? item.id : null };
}

export function advanceDictation(run) {
  if (!run.feedback) return run;
  return { ...run, index: run.index + 1, draft: "", heard: false, feedback: null };
}
