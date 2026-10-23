export const DAYS_TO_KEEP = 7;
export const LEARNING_STEPS = ["words", "sentences", "dialogue", "transfer", "dictation"];
export const REVIEW_BONUS_STARS = 5;
export const REVIEW_REWARD_LIMIT = 3;

export function canOpenStep(tasks, step, steps = LEARNING_STEPS, unlockAfter = {}) {
  const index = steps.indexOf(step);
  if (index < 0) return false;
  if (tasks?.[step]) return true;
  const dependency = unlockAfter[step] ?? (step === "dictation" && steps === LEARNING_STEPS ? "words" : steps[index - 1]);
  return index === 0 || Boolean(tasks?.[dependency]);
}

export function completedStepCount(tasks, steps = LEARNING_STEPS) {
  return steps.filter((step) => Boolean(tasks?.[step])).length;
}

// Cumulative coverage, not the progress of a fresh review attempt.
export function courseProgressSummary(courses) {
  const open = courses.filter(course => course.available !== false && course.taskIds.length > 0);
  let completedUnits=0, completedTasks=0, totalTasks=0;
  for(const course of open) {
    const ids=[...new Set(course.taskIds)], done=new Set(course.completedIds || []);
    const complete=Boolean(course.completedEver) || ids.every(id=>done.has(id));
    totalTasks+=ids.length;
    completedTasks+=complete?ids.length:ids.filter(id=>done.has(id)).length;
    if(complete)completedUnits++;
  }
  return {completedUnits,totalUnits:open.length,completedTasks,totalTasks,percent:totalTasks?Math.round(completedTasks/totalTasks*100):0};
}

export function migrateLearningState(saved, defaults, contentVersion) {
  const base = structuredClone(defaults);
  if (!saved || typeof saved !== "object") return base;
  const merged = {
    ...base,
    ...saved,
    contentVersion,
    tasks: { ...base.tasks, ...saved.tasks },
    rewards: { ...base.rewards, ...saved.rewards },
    evidence: { ...base.evidence, ...saved.evidence },
    settings: { ...base.settings, ...saved.settings },
    wish: { ...base.wish, ...saved.wish }
  };
  if (saved.contentVersion !== contentVersion) {
    merged.tasks = structuredClone(base.tasks);
    merged.evidence = structuredClone(base.evidence);
    merged.draftOrder = [];
  }
  return merged;
}

export function starsForPrice(price) {
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.ceil((amount * 0.8) / 10) * 10;
}

export function normalizeStarTarget(value, max = 9999) {
  const target = Number(value);
  if (!Number.isInteger(target) || target < 1 || target > max) return 0;
  return target;
}

export function saveWishTitle(wish, title) {
  const nextTitle = String(title || "").trim();
  if (!nextTitle) return wish;
  if (nextTitle === wish?.title && wish?.status !== "redeemed") return { ...wish, title: nextTitle };
  return { title: nextTitle, price: 0, target: 0, status: "draft", targetUpdatedAt: 0 };
}

export function appendEvent(state, event) {
  if (!event?.id || !event?.type) return state;
  const events = Array.isArray(state.events) ? state.events : [];
  if (events.some(({ id }) => id === event.id)) return state;
  return { ...state, events: [...events, { ...event, createdAt: Number(event.createdAt) || Date.now(), deltaStars: Number(event.deltaStars) || 0 }] };
}

export function lifetimeStarsFromState(state) {
  if (Number.isFinite(Number(state?.lifetimeStars)) && Number(state.lifetimeStars) >= 0) return Number(state.lifetimeStars);
  return Object.values(state?.rewards || {}).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
}

function freshWish(title, now) {
  return {
    id: `wish-${now}`,
    title,
    price: 0,
    target: 0,
    status: "submitted",
    submittedAt: now,
    updatedAt: now,
    targetUpdatedAt: 0,
    achievedAt: 0,
    redeemedAt: 0,
    revisions: []
  };
}

export function normalizeWish(wish = {}) {
  const title = String(wish.title || "").trim();
  if (!title) return { title: "", price: 0, target: 0, status: "empty", targetUpdatedAt: 0, submittedAt: 0, updatedAt: 0, achievedAt: 0, redeemedAt: 0, revisions: [] };
  const status = wish.status === "draft" ? "submitted" : wish.status || "submitted";
  const anchor = Number(wish.submittedAt || wish.targetUpdatedAt || 0);
  return {
    id: wish.id || `legacy-wish-${anchor || "current"}`,
    title,
    price: Number(wish.price) || 0,
    target: Number(wish.target) || 0,
    status,
    submittedAt: anchor,
    updatedAt: Number(wish.updatedAt || anchor),
    targetUpdatedAt: Number(wish.targetUpdatedAt || 0),
    achievedAt: Number(wish.achievedAt || 0),
    redeemedAt: Number(wish.redeemedAt || 0),
    revisions: Array.isArray(wish.revisions) ? wish.revisions : []
  };
}

export function normalizeReview(review = {}) {
  return {
    active: Boolean(review.active),
    runId: String(review.runId || ""),
    startedAt: Number(review.startedAt || 0),
    completedCount: Math.max(0, Number(review.completedCount) || 0),
    rewardedCount: Math.min(REVIEW_REWARD_LIMIT, Math.max(0, Number(review.rewardedCount) || 0)),
    lastAwardedStars: Math.max(0, Number(review.lastAwardedStars) || 0),
    lastCompletedAt: Number(review.lastCompletedAt || 0)
  };
}

export function normalizeAttempt(savedAttempt = {}, defaultAttempt = {}) {
  const base = structuredClone(defaultAttempt);
  const saved = savedAttempt && typeof savedAttempt === "object" ? savedAttempt : {};
  const unique = (value, fallback = []) => [...new Set(Array.isArray(value) ? value : fallback)];
  return {
    ...base,
    ...saved,
    tasks: { ...base.tasks, ...saved.tasks },
    words: { ...base.words, ...saved.words, listenedIds: unique(saved.words?.listenedIds, base.words?.listenedIds) },
    listening: {
      ...base.listening,
      ...saved.listening,
      correctIds: unique(saved.listening?.correctIds, base.listening?.correctIds)
    },
    sentences: {
      ...base.sentences,
      ...saved.sentences,
      listenedIds: unique(saved.sentences?.listenedIds, base.sentences?.listenedIds),
      recordingIds: { ...base.sentences?.recordingIds, ...saved.sentences?.recordingIds }
    },
    dialogue: {
      ...base.dialogue,
      ...saved.dialogue,
      listenedIds: unique(saved.dialogue?.listenedIds, base.dialogue?.listenedIds),
      recordingIds: { ...base.dialogue?.recordingIds, ...saved.dialogue?.recordingIds }
    },
    transfer: {
      ...base.transfer,
      ...saved.transfer,
      recordingIds: { ...base.transfer?.recordingIds, ...saved.transfer?.recordingIds },
      comparedIds: unique(saved.transfer?.comparedIds, base.transfer?.comparedIds)
    },
    dictation: {
      ...base.dictation,
      ...saved.dictation,
      records: { ...base.dictation?.records, ...saved.dictation?.records },
      results: { ...base.dictation?.results, ...saved.dictation?.results }
    },
    song: {
      ...base.song,
      ...saved.song,
      recordingIds: { ...base.song?.recordingIds, ...saved.song?.recordingIds }
    },
    project: {
      ...base.project,
      ...saved.project,
      placements: { ...base.project?.placements, ...saved.project?.placements },
      recordingIds: { ...base.project?.recordingIds, ...saved.project?.recordingIds }
    }
  };
}

function normalizeProductUnit(savedUnit = {}, defaultUnit = {}) {
  return {
    ...structuredClone(defaultUnit),
    ...savedUnit,
    completedEver: Boolean(savedUnit.completedEver),
    attempt: normalizeAttempt(savedUnit.attempt, defaultUnit.attempt),
    review: normalizeReview(savedUnit.review)
  };
}

export function migrateProductState(saved, defaults, contentVersion) {
  const base = structuredClone(defaults);
  if (!saved || typeof saved !== "object") return base;
  const legacyUnit1 = saved.units?.unit1 || {
    completedEver: saved.completedEver,
    attempt: saved.attempt,
    review: saved.review
  };
  const loaded = {
    ...base,
    ...saved,
    contentVersion,
    rewards: { ...base.rewards, ...saved.rewards },
    lifetimeStars: lifetimeStarsFromState(saved),
    events: Array.isArray(saved.events) ? saved.events : [],
    settings: { ...base.settings, ...saved.settings },
    wish: normalizeWish(saved.wish),
    wishHistory: Array.isArray(saved.wishHistory) ? saved.wishHistory.map(normalizeWish) : [],
    redemptions: Array.isArray(saved.redemptions) ? saved.redemptions : [],
    auth: { ...base.auth, ...saved.auth },
    units: {}
  };
  for (const [unitId, defaultUnit] of Object.entries(base.units || {})) {
    const source = unitId === "unit1" ? legacyUnit1 : saved.units?.[unitId];
    loaded.units[unitId] = normalizeProductUnit(source, defaultUnit);
  }
  delete loaded.completedEver;
  delete loaded.attempt;
  delete loaded.review;
  delete loaded.parentPin;
  return refreshWishAchievement(loaded);
}

export function migrateUnit2TaskStructure(attempt = {}) {
  const next = structuredClone(attempt);
  const previousTasks = attempt.tasks || {};
  next.tasks = {
    ...previousTasks,
    words: Boolean(previousTasks.words && previousTasks.dictation),
    listening: Boolean(previousTasks.words),
    story: Boolean(previousTasks.sentences && previousTasks.dialogue && previousTasks.transfer),
    song: Boolean(previousTasks.song),
    project: Boolean(previousTasks.project)
  };
  return next;
}

export function createParentTestState(state, {
  unitId, freshAttempt, stepIds = [], scenario = "course", stepId = "", reviewPass = 1, now = Date.now()
} = {}) {
  if (!state?.units?.[unitId]) throw new Error("Unknown test unit");
  if (!Array.isArray(stepIds) || !stepIds.length) throw new Error("Missing test steps");
  if (!["course", "step", "review"].includes(scenario)) throw new Error("Unknown test scenario");
  if (scenario === "step" && !stepIds.includes(stepId)) throw new Error("Unknown test step");

  const sandbox = structuredClone(state);
  delete sandbox.completedEver;
  delete sandbox.attempt;
  delete sandbox.review;
  sandbox.stars = 0;
  sandbox.lifetimeStars = 0;
  sandbox.rewards = {};
  sandbox.events = [];

  const unit = {
    completedEver: false,
    attempt: structuredClone(freshAttempt),
    review: normalizeReview()
  };
  if (scenario === "step") {
    const targetIndex = stepIds.indexOf(stepId);
    stepIds.slice(0, targetIndex).forEach((id) => { unit.attempt.tasks[id] = true; });
  }
  if (scenario === "review") {
    const pass = Math.min(REVIEW_REWARD_LIMIT + 1, Math.max(1, Math.trunc(Number(reviewPass) || 1)));
    const completedCount = pass - 1;
    const rewardedCount = Math.min(completedCount, REVIEW_REWARD_LIMIT);
    unit.completedEver = true;
    unit.review = normalizeReview({
      active: true,
      runId: `parent-test-${unitId}-${now}`,
      startedAt: now,
      completedCount,
      rewardedCount
    });
    for (let index = 1; index <= rewardedCount; index += 1) {
      sandbox.rewards[`${unitId}:review:${index}`] = REVIEW_BONUS_STARS;
    }
    sandbox.stars = rewardedCount * REVIEW_BONUS_STARS;
    sandbox.lifetimeStars = sandbox.stars;
  }
  sandbox.units[unitId] = unit;
  sandbox.lastUnitId = unitId;
  return sandbox;
}

export function startProductUnitReview(state, unitId, freshAttempt, now = Date.now()) {
  const unit = state.units?.[unitId];
  if (!unit?.completedEver) return state;
  return {
    ...state,
    units: { ...state.units, [unitId]: startUnitReview(unit, freshAttempt, unitId, now) }
  };
}

export function settleProductUnitRun(state, unitId, unitTitle, now = Date.now()) {
  const unit = state.units?.[unitId];
  if (!unit) return state;
  if (!unit.completedEver) {
    const next = { ...state, units: { ...state.units, [unitId]: { ...unit, completedEver: true } } };
    return appendEvent(next, {
      id: `${unitId}:first-complete`, type: "unit-complete", unitId,
      title: `完成 Unit ${unitTitle}`, detail: "首次完成五个学习任务", createdAt: now
    });
  }
  const review = normalizeReview(unit.review);
  if (!review.active) return state;
  const completedCount = review.completedCount + 1;
  const canReward = review.rewardedCount < REVIEW_REWARD_LIMIT;
  const rewardedCount = canReward ? review.rewardedCount + 1 : review.rewardedCount;
  let next = {
    ...state,
    units: {
      ...state.units,
      [unitId]: {
        ...unit,
        review: { ...review, active: false, completedCount, rewardedCount, lastAwardedStars: canReward ? REVIEW_BONUS_STARS : 0, lastCompletedAt: now }
      }
    }
  };
  if (canReward) {
    return grantMilestone(next, `${unitId}:review:${rewardedCount}`, REVIEW_BONUS_STARS, {
      type: "review-complete", unitId, title: `完成第 ${completedCount} 次复习`, detail: `复习奖励 ${rewardedCount}/${REVIEW_REWARD_LIMIT}`,
      createdAt: now, eventId: `${unitId}:review-run:${review.runId || completedCount}`
    });
  }
  return appendEvent(next, {
    id: `${unitId}:review-run:${review.runId || completedCount}`, type: "review-complete", unitId,
    title: `完成第 ${completedCount} 次复习`, detail: "复习奖励已全部领取", createdAt: now
  });
}

export function resetProductUnitProgress(state, unitId, freshAttempt, now = Date.now()) {
  const unit = state.units?.[unitId];
  if (!unit) return state;
  const nextUnit = unit.completedEver ? startUnitReview(unit, freshAttempt, unitId, now) : { ...unit, attempt: structuredClone(freshAttempt) };
  return { ...state, units: { ...state.units, [unitId]: nextUnit } };
}

export function resetProductUnitFresh(state, unitId, freshAttempt) {
  if (!state.units?.[unitId]) return state;
  const rewards = Object.fromEntries(Object.entries(state.rewards || {}).filter(([key]) => !key.startsWith(`${unitId}:`)));
  return {
    ...state,
    stars: 0,
    rewards,
    units: {
      ...state.units,
      [unitId]: { completedEver: false, attempt: structuredClone(freshAttempt), review: normalizeReview() }
    }
  };
}

export function submitWish(state, title, now = Date.now()) {
  const nextTitle = String(title || "").trim();
  if (!nextTitle) return { state, changed: false, reason: "请先写下心愿。" };
  const current = normalizeWish(state.wish);
  if (current.status === "achieved") return { state, changed: false, reason: "心愿已经达成，请让家长先兑现或更换。" };
  if (!current.title || current.status === "redeemed") {
    const history = current.title ? [...(state.wishHistory || []), current] : [...(state.wishHistory || [])];
    const wish = freshWish(nextTitle, now);
    const next = appendEvent({ ...state, wish, wishHistory: history }, {
      id: `wish:${wish.id}:submitted`, type: "wish-submitted", wishId: wish.id, title: "许下心愿", detail: nextTitle, createdAt: now
    });
    return { state: next, changed: true, reason: "心愿已提交。" };
  }
  if (current.title === nextTitle) return { state: { ...state, wish: current }, changed: false, reason: "心愿没有变化。" };
  const wish = {
    ...current,
    title: nextTitle,
    price: 0,
    target: 0,
    status: "submitted",
    updatedAt: now,
    targetUpdatedAt: 0,
    achievedAt: 0,
    revisions: [...current.revisions, { title: current.title, changedAt: now }]
  };
  const next = appendEvent({ ...state, wish }, {
    id: `wish:${wish.id}:updated:${now}`, type: "wish-updated", wishId: wish.id, title: "调整心愿", detail: nextTitle, createdAt: now
  });
  return { state: next, changed: true, reason: "心愿已调整，请家长重新设置目标。" };
}

export function refreshWishAchievement(state, now = Date.now()) {
  const wish = normalizeWish(state.wish);
  if (wish.status !== "confirmed" || !wish.target || Number(state.stars) < wish.target) return { ...state, wish };
  const achieved = { ...wish, status: "achieved", achievedAt: now };
  return appendEvent({ ...state, wish: achieved }, {
    id: `wish:${wish.id}:achieved`, type: "wish-achieved", wishId: wish.id, title: "心愿达成", detail: wish.title, createdAt: now
  });
}

export function setWishTargetState(state, value, price = 0, now = Date.now()) {
  const target = normalizeStarTarget(value);
  const wish = normalizeWish(state.wish);
  if (!wish.title || !target || ["achieved", "redeemed"].includes(wish.status)) return { state, changed: false };
  let next = appendEvent({
    ...state,
    wish: { ...wish, target, price: Number(price) || 0, status: "confirmed", targetUpdatedAt: now, achievedAt: 0 }
  }, {
    id: `wish:${wish.id}:target:${now}`, type: "wish-target-confirmed", wishId: wish.id, title: "确定心愿目标", detail: `${target} 星`, createdAt: now
  });
  next = refreshWishAchievement(next, now);
  return { state: next, changed: true };
}

export function startUnitReview(state, freshAttempt, unitId = "unit1", now = Date.now()) {
  if (!state.completedEver) return state;
  const review = normalizeReview(state.review);
  return {
    ...state,
    attempt: structuredClone(freshAttempt),
    review: { ...review, active: true, runId: `${unitId}-review-${review.completedCount + 1}-${now}`, startedAt: now, lastAwardedStars: 0 }
  };
}

export function settleUnitRun(state, unitId = "unit1", now = Date.now()) {
  if (!state.completedEver) {
    return appendEvent({ ...state, completedEver: true }, {
      id: `${unitId}:first-complete`, type: "unit-complete", unitId, title: "完成 Unit 1", detail: "首次完成五个学习任务", createdAt: now
    });
  }
  const review = normalizeReview(state.review);
  if (!review.active) return state;
  const completedCount = review.completedCount + 1;
  const canReward = review.rewardedCount < REVIEW_REWARD_LIMIT;
  const rewardedCount = canReward ? review.rewardedCount + 1 : review.rewardedCount;
  let next = {
    ...state,
    review: { ...review, active: false, completedCount, rewardedCount, lastAwardedStars: canReward ? REVIEW_BONUS_STARS : 0, lastCompletedAt: now }
  };
  if (canReward) {
    return grantMilestone(next, `${unitId}:review:${rewardedCount}`, REVIEW_BONUS_STARS, {
      type: "review-complete", unitId, title: `完成第 ${completedCount} 次复习`, detail: `复习奖励 ${rewardedCount}/${REVIEW_REWARD_LIMIT}`,
      createdAt: now, eventId: `${unitId}:review-run:${review.runId || completedCount}`
    });
  }
  return appendEvent(next, {
    id: `${unitId}:review-run:${review.runId || completedCount}`, type: "review-complete", unitId,
    title: `完成第 ${completedCount} 次复习`, detail: "复习奖励已全部领取", createdAt: now
  });
}

export function setWishTarget(wish, value, now = Date.now()) {
  const target = normalizeStarTarget(value);
  if (!wish?.title || !target) return wish;
  return { ...wish, target, status: "confirmed", targetUpdatedAt: Number(now) };
}

export function resetUnitProgress(state, freshAttempt, now = Date.now()) {
  if (state.completedEver) return startUnitReview(state, freshAttempt, "unit1", now);
  return { ...state, attempt: structuredClone(freshAttempt) };
}

export function clearStarBalance(state) {
  return { ...state, stars: 0 };
}

export function resetUnitFresh(state, freshAttempt) {
  return { ...state, stars: 0, rewards: {}, completedEver: false, attempt: structuredClone(freshAttempt), review: normalizeReview() };
}

export function reconcileRecordingProgress(attempt, validRecordIds, requiredIds) {
  const next = structuredClone(attempt);
  const valid = new Set([...validRecordIds].map(String));
  for (const kind of ["sentences", "dialogue", "transfer"]) {
    for (const [itemId, recordId] of Object.entries(next[kind]?.recordingIds || {})) {
      if (!valid.has(String(recordId))) delete next[kind].recordingIds[itemId];
    }
  }
  const sentenceIds = requiredIds.sentences || [];
  const dialogueIds = requiredIds.dialogue || [];
  const transferIds = requiredIds.transfer || [];
  const firstMissing = (ids, recordings) => {
    const index = ids.findIndex((id) => !recordings?.[id]);
    return index < 0 ? 0 : index;
  };
  next.sentences.itemIndex = firstMissing(sentenceIds, next.sentences.recordingIds);
  next.dialogue.sceneIndex = firstMissing(dialogueIds, next.dialogue.recordingIds);
  next.transfer.itemIndex = firstMissing(transferIds, next.transfer.recordingIds);
  next.transfer.comparedIds = (next.transfer.comparedIds || []).filter((id) => Boolean(next.transfer.recordingIds[id]));
  next.tasks.sentences = Boolean(next.tasks.words && sentenceIds.length && sentenceIds.every((id) => next.sentences.recordingIds[id]));
  next.tasks.dialogue = Boolean(next.tasks.sentences && dialogueIds.length && dialogueIds.every((id) => next.dialogue.recordingIds[id]));
  next.tasks.transfer = Boolean(next.tasks.dialogue && transferIds.length && transferIds.every((id) => next.transfer.recordingIds[id]));
  return { attempt: next, changed: JSON.stringify(next) !== JSON.stringify(attempt) };
}

export function isExpired(createdAt, pinned, now = Date.now()) {
  if (pinned) return false;
  return now - Number(createdAt) >= DAYS_TO_KEEP * 24 * 60 * 60 * 1000;
}

export function awardCompletion(state, stars = 13) {
  if (state.completed) return { ...state, awarded: false };
  return { ...state, completed: true, stars: state.stars + stars, awarded: true };
}

export function learningStatus(completed, completedTasks, totalTasks = 5) {
  const total = Math.max(1, Number(totalTasks) || 1);
  const tasks = Math.max(0, Math.min(total, Number(completedTasks) || 0));
  return {
    runComplete: tasks === total,
    reviewing: Boolean(completed) && tasks < total,
    semesterTasks: completed ? total : tasks
  };
}

export function redemptionSummary(entries, now = Date.now(), limit = 500, days = 30) {
  const cutoff = Number(now) - days * 24 * 60 * 60 * 1000;
  const recent = (Array.isArray(entries) ? entries : [])
    .filter((entry) => Number.isFinite(Number(entry?.price)) && Number(entry.price) > 0 && Number.isFinite(Number(entry?.createdAt)) && Number(entry.createdAt) > cutoff && Number(entry.createdAt) <= Number(now))
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
  const total = Number(recent.reduce((sum, entry) => sum + Number(entry.price), 0).toFixed(2));
  return { recent, total, remaining: Math.max(0, Number((Number(limit) - total).toFixed(2))) };
}

export function redemptionCheck(wish, stars, entries, now = Date.now(), limit = 500) {
  const summary = redemptionSummary(entries, now, limit);
  const price = Number(wish?.price);
  const target = Number(wish?.target);
  if (!["confirmed", "achieved"].includes(wish?.status)) return { ...summary, allowed: false, reason: "请先设置心愿目标。" };
  if (!normalizeStarTarget(target)) return { ...summary, allowed: false, reason: "心愿目标无效。" };
  if (Number(stars) < target) return { ...summary, allowed: false, reason: `还差 ${target - Number(stars)} 星，暂不能兑现。` };
  if (Number.isFinite(price) && price > 0 && summary.total + price > Number(limit)) return { ...summary, allowed: false, reason: `近 30 天还可兑现 ${summary.remaining} 元，本次会超过 ${limit} 元边界。` };
  return { ...summary, allowed: true, reason: "已经达到心愿目标。" };
}

export function redeemWish(state, now = Date.now(), limit = 500) {
  const check = redemptionCheck(state?.wish, state?.stars, state?.redemptions, now, limit);
  if (!check.allowed) return { state, check };
  const price = Number(state.wish.price);
  const wishId = state.wish.id || `legacy-wish-${now}`;
  const entry = { id: `redeem-${wishId}`, wishId, title: state.wish.title, price: Number.isFinite(price) && price > 0 ? price : null, targetStars: Number(state.wish.target), createdAt: now };
  let next = {
    ...state,
    stars: Number(state.stars) - entry.targetStars,
    redemptions: [...(state.redemptions || []), entry],
    wish: { ...normalizeWish(state.wish), id: wishId, status: "redeemed", redeemedAt: now }
  };
  next = appendEvent(next, { id: `wish:${wishId}:redeemed`, type: "wish-redeemed", wishId, title: "心愿已兑现", detail: entry.title, createdAt: now, deltaStars: -entry.targetStars });
  return { state: next, check };
}

export function grantMilestone(state, key, stars, event = {}) {
  if (state.rewards?.[key]) return state;
  const amount = Math.max(0, Number(stars) || 0);
  const createdAt = Number(event.createdAt) || Date.now();
  let next = {
    ...state,
    stars: Number(state.stars || 0) + amount,
    lifetimeStars: lifetimeStarsFromState(state) + amount,
    rewards: { ...state.rewards, [key]: amount }
  };
  next = appendEvent(next, {
    id: event.eventId || `reward:${key}`,
    type: event.type || "stars-earned",
    unitId: event.unitId || "unit1",
    title: event.title || "获得学习星星",
    detail: event.detail || key,
    createdAt,
    deltaStars: amount
  });
  return refreshWishAchievement(next, createdAt);
}

export function moveItem(items, index, direction) {
  const next = direction === "up" ? index - 1 : index + 1;
  if (!Array.isArray(items) || next < 0 || next >= items.length) return items;
  const copy = [...items];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

export function appendOrderItem(items, word, limit = 3) {
  if (!Array.isArray(items) || !word || items.includes(word) || items.length >= limit) return items;
  return [...items, word];
}

export function undoOrderItem(items) {
  if (!Array.isArray(items) || !items.length) return items;
  return items.slice(0, -1);
}
