import { newDictation, checkDictation, advanceDictation } from "./scripts/dictation.mjs";
import {
  REVIEW_REWARD_LIMIT, appendEvent, canOpenStep, completedStepCount, courseProgressSummary, createParentTestState, grantMilestone,
  migrateProductState, migrateUnit2TaskStructure, normalizeReview, normalizeWish, reconcileRecordingProgress, redeemWish, redemptionCheck,
  setWishTargetState, settleProductUnitRun, startProductUnitReview, submitWish
} from "./scripts/core.mjs";
import {
  authLockRemaining, clearAuthFailures, createCredential, createRecoveryCode,
  registerAuthFailure, validateParentPassword, verifyCredential
} from "./scripts/parent-security.mjs";
import { UNIT1_CONTENT } from "./scripts/unit1-content.mjs";
import { UNIT2_CONTENT } from "./scripts/unit2-content.mjs";
import { UNIT3_CONTENT } from "./scripts/unit3-content.mjs";
import { UNIT4_CONTENT } from "./scripts/unit4-content.mjs";
import { UNIT5_CONTENT } from "./scripts/unit5-content.mjs";
import { UNIT6_CONTENT } from "./scripts/unit6-content.mjs";
import { UNIT7_CONTENT } from "./scripts/unit7-content.mjs";
import { UNIT8_CONTENT } from "./scripts/unit8-content.mjs";
import { UNIT9_CONTENT } from "./scripts/unit9-content.mjs";
import { UNIT10_CONTENT } from "./scripts/unit10-content.mjs";
import { newPractice, reconcilePracticeOrder, practiceReady, practiceCanRecord, practiceSelectedIds, practicePlayback, objectivePracticeCorrect, practiceMarkup, bookmarkMarkup, bookmarkReady } from "./scripts/textbook-practice.mjs";
import { UP2_CHAPTERS, UP2_NODE_BY_ID, UP2_NODES, UP2_PAGE_IMAGE, UP2_TOTAL_STARS, UP2_VOCAB_BY_ID } from "./scripts/up2-content.mjs";
import { canOpenUp2Node, completeUp2Activity, newUp2State, normalizeUp2State, startUp2Review, openUp2Node, isUp2ActivityComplete, up2WritingKey, up2TargetIndices, beginUp2Spelling, up2EvidenceFor, up2ReadingSteps, up2FindSections, up2FindSection, up2FindSectionComplete } from "./scripts/up2-progress.mjs";
import { up2HomeMarkup, up2ArtMarkup, up2SceneFor, up2ReadingLine, up2ActivityMarkup, up2WordHelp, up2HideWordHelp } from "./scripts/up2-view.mjs";
import { UP3_CHAPTERS, UP3_NODE_BY_ID, UP3_NODES, UP3_TOTAL_STARS, UP3_VOCAB_BY_ID } from "./scripts/up3-content.mjs";
import { canOpenUp3Node, canRecordUp3, completeUp3Activity, newUp3State, normalizeUp3State, startUp3Review, openUp3Node, isUp3ActivityComplete, writingKey as up3WritingKey, findSelectionComplete as up3FindSelectionComplete, findSections as up3FindSections, tokenWords as up3TokenWords, readingSteps as up3ReadingSteps } from "./scripts/up3-progress.mjs";
import { up3HomeMarkup, up3ArtMarkup, up3SceneFor, up3ReadingStep, up3ActivityMarkup, up3BookMarkup, up3WordHelp, up3HelpIds } from "./scripts/up3-view.mjs";
import { READING_BOOKS, READING_BOOK_BY_ID, createReadingState, normalizeReadingState, readingProgress, readingPageById } from "./scripts/reading-content.mjs";
import { semanticReadingMarkup, readingToolbarMarkup, readingPageActionsMarkup } from "./scripts/reading-view.mjs";

const $app = document.querySelector("#app");
const STORAGE_KEY = "qibao-product-state-v01";
const LEGACY_STORAGE_KEY = "qibao-unit1-state-v09";
const MIGRATION_BACKUP_KEY = "qibao-product-state-backup-before-v19";
const RESET_MARKER_KEY = "qibao-product-reset-pending-v01";
const CONTENT_VERSION = 32;
const APP_RELEASE = "2026.10.17.1";
const MUSIC_VOLUME = .18;
const MUSIC_DUCKED_VOLUME = .045;
const UNITS = Object.freeze({ unit1: UNIT1_CONTENT, unit2: UNIT2_CONTENT, unit3: UNIT3_CONTENT, unit4: UNIT4_CONTENT, unit5: UNIT5_CONTENT, unit6: UNIT6_CONTENT, unit7: UNIT7_CONTENT, unit8: UNIT8_CONTENT, unit9: UNIT9_CONTENT, unit10: UNIT10_CONTENT });
let activeUnitId = "unit1";
let activeContent = UNITS[activeUnitId];
let UNIT_PHRASES = activeContent.phrases;
let UNIT_PHRASE_QUIZ = activeContent.phraseQuiz;
let UNIT_LISTENING_QUIZ = activeContent.listeningQuiz || [];
let UNIT_REWARD_RULES = activeContent.rewards;
let UNIT_SCENES = activeContent.scenes;
let UNIT_SENTENCES = activeContent.sentences;
let UNIT_DIALOGUES = activeContent.dialogueGroups;
let UNIT_TRANSFERS = activeContent.transferTasks;
let UNIT_STEPS = activeContent.steps;
let UNIT_TEXTBOOK = activeContent.textbook;
let phraseById = new Map(UNIT_PHRASES.map((phrase) => [phrase.id, phrase]));

const stepIdsFor = (content = activeContent) => content.steps.map(({ id }) => id);
const stageForScreen = (value = screen) => {
  if (value === "application") return "words";
  if (activeContent.steps.some(s => s.id === "story") && value === "dictation") return "words";
  if (activeUnitId === "unit2" && ["sentences", "dialogue", "transfer"].includes(value)) return "story";
  return value;
};

const newAttempt = (unitId = activeUnitId) => {
  const content = UNITS[unitId];
  return ({
  tasks: Object.fromEntries(content.steps.map(({ id }) => [id, false])),
  words: { mode: "learn", listenedIds: [], groupIndex: 0, supplementOnly: false, questionIndex: 0, heardQuestionId: null },
  listening: { questionIndex: 0, heardQuestionId: null, correctIds: [] },
  sentences: { itemIndex: 0, listenedIds: [], recordingIds: {} },
  dialogue: { sceneIndex: 0, listenedIds: [], recordingIds: {} },
  transfer: { itemIndex: 0, recordingIds: {}, comparedIds: [] },
  dictation: newDictation(content.dictationPhraseIds),
  song: { listened: false, recordingIds: {} },
  project: { placements: {}, recordingIds: {}, hintLevel: 0 },
  ...(content.practiceStages ? {practice: newPractice()} : {})
  });
};
const defaults = {
  contentVersion: CONTENT_VERSION,
  stars: 0,
  rewards: {},
  lifetimeStars: 0,
  units: Object.fromEntries(Object.keys(UNITS).map(id=>[id,{completedEver:false,attempt:newAttempt(id),review:normalizeReview()}])),
  up: { up2: newUp2State(), up3: newUp3State() },
  reading: createReadingState(),
  events: [],
  wish: normalizeWish(),
  wishHistory: [],
  redemptions: [],
  settings: { sound: true, music: false, simple: false },
  auth: { credential: null, recovery: null, needsUpgrade: false, failedAttempts: 0, lockedUntil: 0 }
};

let legacyParentPin = "";
let pendingMigrationRaw = "";
let state = bindActiveUnit(loadState());
let persistedState = stateForStorage(state);
let screen = "course";
let courseMapPage = 1;
let courseMapSwipeStart = null;
let worldMenuOpen = false;
let activeReadingBookId = "";
let readingPortraitSide = 0;
let readingTurnDirection = "forward";
let readingQuestionIndex = 0;
let readingReferenceOpen = false;
let readingFromQuestion = false;
let returnScreen = "course";
let parentSession = false;
let parentReturnScreen = "course";
let parentUnitId = "unit1";
let testSession = null;
let testRecordingId = 0;
const testRecordings = new Map();
let authModal = null;
let authBusy = false;
let dangerBusy = false;
let oneTimeRecoveryCode = "";
let transitioning = false;
let activeLessonAudio = null;
let activeLessonObjectUrl = "";
let audioSequenceToken = 0;
let activeLessonCancel = null;
let recorder = null;
let recordingStartedAt = 0;
let recordingChunks = [];
let recordingContext = null;
let milestoneMessage = "";
let lastCompletedStep = "";
let wishEditing = false;
const pwa = { registration: null, phase: "starting", cached: 0, total: 0, updateReady: false, error: "" };
const watchedWorkers = new WeakSet();
let updateReloadRequested = false;
const backgroundMusic = new Audio("./assets/audio/children-home-ambient-v01.m4a");
backgroundMusic.loop = true;
backgroundMusic.preload = "auto";
backgroundMusic.volume = MUSIC_VOLUME;
let musicStarted = false;
let resumeMusicAfterRecording = false;

function loadState() {
  try {
    const currentRaw = localStorage.getItem(STORAGE_KEY);
    const raw = currentRaw || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return structuredClone(defaults);
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== "object") return structuredClone(defaults);
    legacyParentPin = typeof saved.parentPin === "string" ? saved.parentPin : "";
    if (saved.contentVersion !== CONTENT_VERSION || !currentRaw) pendingMigrationRaw = raw;
    const migrated = migrateProductState(saved, defaults, CONTENT_VERSION);
    migrated.up = { up2: normalizeUp2State(saved.up?.up2), up3: normalizeUp3State(saved.up?.up3) };
    migrated.reading = normalizeReadingState(saved.reading);
    const previousUnit2 = saved.units?.unit2?.attempt;
    if (Number(saved.contentVersion || 0) < 13 && previousUnit2) {
      migrated.units.unit2.attempt = migrateUnit2TaskStructure(migrated.units.unit2.attempt);
    }
    if (Number(saved.contentVersion || 0) < 20 && migrated.units?.unit6) {
      const unit6 = migrated.units.unit6;
      const targetIds = UNIT6_CONTENT.dictationPhraseIds;
      const records = unit6.attempt.dictation?.records || {};
      if (!targetIds.every(id => records[id]?.passed)) {
        unit6.attempt.tasks.words = false;
        unit6.attempt.words.mode = "dictation";
        unit6.attempt.dictation = { ...newDictation(targetIds, [], records), targetIds };
      }
      unit6.attempt.tasks.listening = false;
      unit6.attempt.listening = { questionIndex: 0, heardQuestionId: null, correctIds: [] };
      for (const stage of ["story", "project"]) {
        unit6.attempt.tasks[stage] = false;
        unit6.attempt.practice.indices[stage] = 0;
      }
      unit6.completedEver = false;
      unit6.review.active = false;
    }
    if (Number(saved.contentVersion || 0) < 21 && migrated.units?.unit6) {
      const practice = migrated.units.unit6.attempt.practice;
      delete practice.evidence["match-parents"];
      if ((practice.indices.story || 0) > 1) practice.indices.story -= 1;
    }
    return migrated;
  } catch {
    return structuredClone(defaults);
  }
}

function bindActiveUnit(target) {
  for(const [id,unit] of Object.entries(target.units)) {
    if(UNITS[id])reconcilePracticeOrder(UNITS[id],unit.attempt);
  }
  const unit = target.units[activeUnitId];
  target.completedEver = unit.completedEver;
  target.attempt = unit.attempt;
  target.review = unit.review;
  return target;
}

function syncActiveUnit(target = state) {
  if (!target.units?.[activeUnitId]) return target;
  target.units[activeUnitId] = {
    ...target.units[activeUnitId],
    completedEver: Boolean(target.completedEver),
    attempt: target.attempt,
    review: normalizeReview(target.review)
  };
  target.attempt = target.units[activeUnitId].attempt;
  target.review = target.units[activeUnitId].review;
  return target;
}

function stateForStorage(target) {
  syncActiveUnit(target);
  const stored = structuredClone(target);
  delete stored.completedEver;
  delete stored.attempt;
  delete stored.review;
  return stored;
}

function loadUnitContext(unitId) {
  if (!UNITS[unitId]) return false;
  activeUnitId = unitId;
  activeContent = UNITS[unitId];
  UNIT_PHRASES = activeContent.phrases;
  UNIT_PHRASE_QUIZ = activeContent.phraseQuiz;
  UNIT_LISTENING_QUIZ = activeContent.listeningQuiz || [];
  UNIT_REWARD_RULES = activeContent.rewards;
  UNIT_SCENES = activeContent.scenes;
  UNIT_SENTENCES = activeContent.sentences;
  UNIT_DIALOGUES = activeContent.dialogueGroups;
  UNIT_TRANSFERS = activeContent.transferTasks;
  UNIT_STEPS = activeContent.steps;
  UNIT_TEXTBOOK = activeContent.textbook;
  phraseById = new Map(UNIT_PHRASES.map((phrase) => [phrase.id, phrase]));
  bindActiveUnit(state);
  return true;
}

function activateUnit(unitId) {
  if (!UNITS[unitId]) return false;
  syncActiveUnit();
  return loadUnitContext(unitId);
}

function saveState() {
  if (testSession) return true;
  try {
    if (pendingMigrationRaw && !localStorage.getItem(MIGRATION_BACKUP_KEY)) localStorage.setItem(MIGRATION_BACKUP_KEY, pendingMigrationRaw);
    const stored = stateForStorage(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    pendingMigrationRaw = "";
    persistedState = structuredClone(stored);
    return true;
  } catch {
    state = bindActiveUnit(structuredClone(persistedState));
    showToast("保存失败，请释放一些设备空间后重试。", true);
    return false;
  }
}
function escapeHTML(value = "") { return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function formatLocalTime(value) { return value ? new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "尚未设置"; }
function currentStepNumber() { const ids = stepIdsFor(); return screen === "complete" ? ids.length : Math.max(0, ids.indexOf(stageForScreen())) + 1; }
function unitPercent() { const ids = stepIdsFor(); return Math.round(completedStepCount(state.attempt.tasks, ids) / ids.length * 100); }
function currentTaskCount() { return completedStepCount(state.attempt.tasks, stepIdsFor()); }
function stepIsOpen(step) { return canOpenStep(state.attempt.tasks, stageForScreen(step), stepIdsFor(), activeContent.unlockAfter || {}); }
function recordExists(kind, id) { return Boolean(state.attempt[kind]?.recordingIds?.[id]); }
function unitLabel(content = activeContent) { return `Unit ${content.number}`; }
function unitPercentFor(unitId) { const ids = stepIdsFor(UNITS[unitId]); return Math.round(completedStepCount(state.units[unitId].attempt.tasks, ids) / ids.length * 100); }
function unitStatus(unitId) {
  const unit = state.units[unitId];
  const percent = unitPercentFor(unitId);
  if (unit.completedEver && unit.review?.active) return `复习中 ${percent}%`;
  if (unit.completedEver) return "已完成，可复习";
  return percent ? `学习中 ${percent}%` : "准备开始";
}

function testModeBanner() {
  if (!testSession) return "";
  return `<aside class="test-mode-bar" role="status"><div><strong>家长测试模式 · 不会保存学习记录</strong><span>${escapeHTML(testSession.label)}；退出或刷新后测试痕迹自动清除。</span></div><button class="secondary-button" data-action="exit-parent-test">退出测试</button></aside>`;
}

function shell(content) {
  const globalContext = { wish: "成长与心愿", growth: "成长与心愿", parent: "家长中心" }[screen];
  const contextLabel = globalContext || (screen.startsWith("up2-") ? "UP2 · Creature Features" : screen.startsWith("up3-") ? "UP3 · Team Up!" : `${unitLabel()} · ${activeContent.title}`);
  const testBar = testModeBanner();
  const actions = testSession
    ? `<div class="topbar-actions"><span class="test-star-count">本次测试 ${state.stars} 星</span><button class="icon-button" data-action="exit-parent-test">家长中心</button></div>`
    : `<div class="topbar-actions"><button class="pill-button" data-action="growth" aria-label="打开星星账本，当前 ${state.stars} 星">${state.stars} 星</button><button class="pill-button" data-action="wish">我的心愿</button><button class="icon-button" data-action="parent">家长</button></div>`;
  return `<div class="app-shell"><div class="scene ${testSession ? "test-mode-scene" : ""}">${testBar}<header class="topbar"><div class="brand">麒宝专属英文辅导小老师<small>${escapeHTML(contextLabel)}</small></div>${actions}</header>${content}</div></div>`;
}

function pwaStatusCopy() {
  if (!("serviceWorker" in navigator)) return "当前浏览器不支持离线安装。";
  if (!window.isSecureContext && !["localhost", "127.0.0.1"].includes(location.hostname)) return "请使用 HTTPS 固定地址打开，否则 iPad 无法完整使用录音和离线功能。";
  if (pwa.phase === "error") return `离线课程准备失败：${pwa.error || "请联网后重试"}。${pwa.registration?.active ? "当前已安装版本仍可继续使用。" : "学习记录不会被清除，请联网后重试。"}`;
  if (pwa.phase === "checking") return "正在检查新版本…";
  if (pwa.phase === "downloading") return "正在完整下载课程图片和音频，请保持页面打开…";
  if (pwa.phase === "applying") return "正在切换到完整新版本…";
  if (pwa.phase === "restart-needed") return "其他页面已安装新版本。完成当前操作后重新打开，避免新旧页面同时使用。";
  if (pwa.updateReady) return "新版本已完整下载。安装后会重新打开本页，学习记录不变。";
  if (pwa.cached && pwa.cached === pwa.total) return `离线课程已就绪（${pwa.cached}/${pwa.total} 项）。`;
  return "正在确认离线课程完整性…";
}

function parentDevicePanel() {
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
  const restart = pwa.phase === "restart-needed";
  const readyClass = pwa.updateReady || restart ? "update" : pwa.phase === "error" ? "error" : pwa.cached === pwa.total && pwa.total ? "ready" : "working";
  const badge = restart ? "需重开" : pwa.updateReady ? "可更新" : pwa.phase === "error" ? "需重试" : pwa.cached === pwa.total && pwa.total ? "可离线" : "准备中";
  return `<section class="pwa-device-panel ${readyClass}" id="ipad-device"><header><div><h3>iPad 离线与更新</h3><small>应用版本 ${APP_RELEASE}</small></div><span>${badge}</span></header><p role="status">${escapeHTML(pwaStatusCopy())}</p><div class="pwa-device-actions"><button class="secondary-button" data-action="check-app-update" ${pwa.phase === "checking" || pwa.phase === "downloading" || pwa.phase === "applying" || restart ? "disabled" : ""}>检查更新</button><button class="secondary-button" data-action="repair-offline" ${pwa.phase === "downloading" || pwa.phase === "applying" || restart ? "disabled" : ""}>检查并补全离线课程</button>${pwa.updateReady ? '<button class="primary-button" data-action="apply-app-update">安装完整新版本</button>' : restart ? '<button class="primary-button" data-action="reload-app">重新打开</button>' : ""}</div><small class="pwa-context">${standalone ? "当前从 iPad 主屏 App 模式打开。" : "当前从浏览器打开；iPad 上可用 Safari“添加到主屏幕”安装。"}</small></section>`;
}

function refreshPwaSurface() {
  if (screen === "parent" && parentSession) {
    renderParent();
  }
}

function messageWorker(worker, type, timeout = 12000) {
  return new Promise((resolve, reject) => {
    if (!worker || typeof MessageChannel === "undefined") { reject(new Error("离线服务尚未就绪")); return; }
    const channel = new MessageChannel();
    const timer = setTimeout(() => reject(new Error("请求超时")), timeout);
    channel.port1.onmessage = ({ data }) => { clearTimeout(timer); data?.ok ? resolve(data) : reject(new Error(data?.error || "操作失败")); };
    worker.postMessage({ type }, [channel.port2]);
  });
}

async function refreshReleaseStatus() {
  if (pwa.updateReady) return;
  const worker = navigator.serviceWorker.controller || pwa.registration?.active;
  if (!worker) return;
  try {
    const status = await messageWorker(worker, "QIBAO_GET_RELEASE_STATUS", 5000);
    pwa.cached = status.cached;
    pwa.total = status.total;
    pwa.phase = status.ready ? "ready" : "error";
    pwa.error = status.ready ? "" : `只找到 ${status.cached}/${status.total} 项课程资源`;
  } catch (error) {
    if (!pwa.registration?.waiting) { pwa.phase = "error"; pwa.error = error.message; }
  }
  refreshPwaSurface();
}

function watchInstallingWorker(worker) {
  if (!worker || watchedWorkers.has(worker)) return;
  watchedWorkers.add(worker);
  pwa.phase = "downloading";
  pwa.error = "";
  refreshPwaSurface();
  worker.addEventListener("statechange", () => {
    if (worker.state === "installed" && navigator.serviceWorker.controller) {
      pwa.updateReady = true;
      pwa.phase = "update-ready";
      refreshPwaSurface();
      if (screen !== "parent") showToast("新版本已准备好，请家长在家长中心安装。");
    }
    if (worker.state === "redundant") {
      pwa.phase = "error";
      pwa.error ||= "新版本未能完整下载";
      refreshPwaSurface();
    }
  });
}

async function registerPwa() {
  if (!("serviceWorker" in navigator)) { pwa.phase = "error"; pwa.error = "浏览器不支持离线应用"; refreshPwaSurface(); return; }
  try {
    const controlledAtStart = Boolean(navigator.serviceWorker.controller);
    const registration = await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
    pwa.registration = registration;
    if (registration.waiting) { pwa.updateReady = true; pwa.phase = "update-ready"; }
    if (registration.installing) watchInstallingWorker(registration.installing);
    registration.addEventListener("updatefound", () => watchInstallingWorker(registration.installing));
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (updateReloadRequested) { window.location.reload(); return; }
      if (!controlledAtStart) { refreshReleaseStatus(); return; }
      pwa.updateReady = false;
      pwa.phase = "restart-needed";
      refreshPwaSurface();
      if (screen !== "parent") showToast("新版本已安装，完成当前操作后请重新打开。");
    });
    navigator.serviceWorker.addEventListener("message", ({ data }) => {
      if (data?.type === "QIBAO_RELEASE_FAILED") {
        pwa.phase = "error";
        pwa.error = data.error || "新版本未能完整下载";
        refreshPwaSurface();
        return;
      }
      if (data?.type !== "QIBAO_RELEASE_ACTIVATED" || updateReloadRequested) return;
      pwa.updateReady = false;
      pwa.phase = "restart-needed";
      refreshPwaSurface();
    });
    // Initial install can fail; waiting on ready forever would strand the retry path.
    if (!pwa.updateReady && registration.active) await refreshReleaseStatus();
    else refreshPwaSurface();
  } catch (error) {
    pwa.phase = "error";
    pwa.error = error?.message || "无法准备离线课程";
    refreshPwaSurface();
  }
}

async function checkAppUpdate() {
  if (!pwa.registration || (!pwa.registration.active && !pwa.registration.installing && !pwa.registration.waiting)) {
    await registerPwa();
    return;
  }
  pwa.phase = "checking";
  pwa.error = "";
  refreshPwaSurface();
  try {
    await pwa.registration.update();
    if (pwa.registration.waiting) { pwa.updateReady = true; pwa.phase = "update-ready"; }
    else if (!pwa.registration.installing) await refreshReleaseStatus();
  } catch (error) {
    pwa.phase = "error";
    pwa.error = error?.message || "检查更新失败";
  }
  refreshPwaSurface();
}

async function repairOfflineRelease() {
  if (!navigator.serviceWorker.controller && !pwa.registration?.active) { await checkAppUpdate(); return; }
  pwa.phase = "downloading";
  pwa.error = "";
  refreshPwaSurface();
  try {
    const worker = navigator.serviceWorker.controller || pwa.registration?.active;
    const status = await messageWorker(worker, "QIBAO_REPAIR_RELEASE", 120000);
    pwa.cached = status.cached;
    pwa.total = status.total;
    pwa.phase = status.ready ? "ready" : "error";
    pwa.error = status.ready ? "" : `只下载 ${status.cached}/${status.total} 项资源`;
    try { await navigator.storage?.persist?.(); } catch {}
  } catch (error) {
    pwa.phase = "error";
    pwa.error = error?.message || "下载未完成";
  }
  refreshPwaSurface();
}

function applyAppUpdate() {
  const waiting = pwa.registration?.waiting;
  if (!waiting) return;
  if (recorder?.state === "recording") { showToast("请先完成当前录音。", true); return; }
  updateReloadRequested = true;
  pwa.phase = "applying";
  refreshPwaSurface();
  waiting.postMessage({ type: "QIBAO_ACTIVATE_RELEASE" });
}

// Exact existing illustration crops; no emoji or independently restyled world controls.
function worldArt(name) { return `<span class="world-art art-${name}" aria-hidden="true"></span>`; }
function worldSharedActions() {
  return `<div class="world-actions"><button class="world-control world-stars" data-action="growth" aria-label="打开星星账本，当前 ${state.stars} 星">${worldArt('star')}<span class="world-star-value">${state.stars} 星</span></button>
    <button class="world-control world-wish" data-action="wish" aria-label="打开我的心愿">${worldArt('heart')}<span>心愿</span></button>
    <button class="world-control world-parent" data-action="parent" aria-label="打开家长门">${worldArt('parents')}</button></div>`;
}
function worldMenuItem(world, currentWorld, label, detail, action) {
  const current = world === currentWorld;
  return `<button class="world-menu-item${current ? " current" : ""}" data-action="${action}" role="menuitem" ${current ? 'disabled aria-current="page"' : ""}>
    <span class="world-menu-thumb thumb-${world}" aria-hidden="true"></span><span><strong>${label}</strong><small>${detail}</small></span>${current ? "<b>当前</b>" : ""}</button>`;
}
function worldHeader(world) {
  return `<header class="world-header"><div class="world-brand">${worldArt('brand')}<strong>麒宝专属英文辅导小老师</strong></div>
    <div class="world-switcher${worldMenuOpen ? " open" : ""}"><button class="world-control world-switch" data-action="toggle-world-switch" aria-haspopup="menu" aria-expanded="${worldMenuOpen}">课程切换<span class="world-switch-caret" aria-hidden="true"></span></button>
      <div class="world-switch-menu" role="menu" ${worldMenuOpen ? "" : "hidden"}>${worldMenuItem("course", world, "课本课程", "Unit 1–10", "open-course-world")}${worldMenuItem("up", world, "UP 课程", "综合练习", "open-up-world")}${worldMenuItem("reading", world, "课外阅读", "English Reading", "open-reading-world")}</div></div>${worldSharedActions()}</header>`;
}

function setWorldMenu(open) {
  worldMenuOpen = Boolean(open);
  const switcher = document.querySelector(".world-switcher");
  const button = document.querySelector('[data-action="toggle-world-switch"]');
  const menu = document.querySelector(".world-switch-menu");
  switcher?.classList.toggle("open", worldMenuOpen);
  button?.setAttribute("aria-expanded", String(worldMenuOpen));
  if (menu) menu.hidden = !worldMenuOpen;
}

function textbookProgress() {
  return courseProgressSummary(Object.entries(UNITS).map(([id,content])=>({taskIds:stepIdsFor(content),completedIds:stepIdsFor(content).filter(step=>state.units[id]?.attempt.tasks[step]),completedEver:state.units[id]?.completedEver,available:content.available!==false})));
}
function upProgress() {
  return courseProgressSummary([
    {taskIds:UP2_NODES.map(n=>n.id),completedIds:state.up.up2.completedNodeIds,completedEver:state.up.up2.completedEver},
    {taskIds:UP3_NODES.filter(n=>n.chapterId!=='book').map(n=>n.id),completedIds:state.up.up3.completedNodeIds,completedEver:state.up.up3.completedEver}
  ]);
}
function worldProgress(title, summary, unitLabel = "单元") {
  const text=`${summary.percent}% · ${summary.completedUnits}/${summary.totalUnits} ${unitLabel}完成`;
  return `<section class="world-progress-card" aria-label="${escapeHTML(title)}">${worldArt('book')}<div class="world-progress-copy"><strong class="world-progress-title">${escapeHTML(title)}</strong>
    <span class="world-progress-value">${escapeHTML(text)}</span>
    <span class="world-progress-meter" role="progressbar" aria-label="${escapeHTML(title)}，已完成 ${summary.completedUnits}/${summary.totalUnits} ${unitLabel}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${summary.percent}"><i style="width:${summary.percent}%"></i></span></div>${worldArt('chest')}</section>`;
}

function setCourseMapPage(value) {
  const page = Number(value) === 2 ? 2 : 1;
  courseMapPage = page;
  const viewport = document.querySelector(".course-map-viewport");
  if (!viewport) return page;
  viewport.dataset.mapPage = String(page);
  viewport.querySelectorAll(".course-map-panel").forEach((panel, index) => {
    const active = index === page - 1;
    panel.inert = !active;
    panel.setAttribute("aria-hidden", String(!active));
  });
  document.querySelectorAll(".course-page-choice").forEach((button) => {
    const current = Number(button.dataset.page) === page;
    button.setAttribute("aria-current", current ? "page" : "false");
    button.setAttribute("aria-pressed", String(current));
  });
  document.querySelectorAll(".course-map-arrow").forEach((button) => {
    button.hidden = Number(button.dataset.page) === page;
  });
  document.querySelectorAll(".portrait-course-page").forEach((panel) => {
    panel.hidden = Number(panel.dataset.page) !== page;
  });
  const live = document.querySelector(".course-map-page-live");
  if (live) live.textContent = page === 1 ? "已显示 Unit 1 到 Unit 5" : "已显示 Unit 6 到 Unit 10；全部已开放";
  const portraitHeading = document.querySelector(".course-portrait-heading");
  if (portraitHeading) portraitHeading.textContent = page === 1 ? "继续学习" : "更多课程";
  return page;
}

function renderCourse() {
  const unit1Percent = unitPercentFor("unit1");
  const unit2Percent = unitPercentFor("unit2");
  const unit1State = unitStatus("unit1");
  const unit2State = unitStatus("unit2");
  const unit3State = unitStatus("unit3");
  const unit3Percent = unitPercentFor("unit3");
  const unit4State = unitStatus("unit4"), unit4Percent = unitPercentFor("unit4");
  const unit5State = unitStatus("unit5"), unit5Percent = unitPercentFor("unit5");
  const unit6State = unitStatus("unit6"), unit6Percent = unitPercentFor("unit6");
  const unit7State = unitStatus("unit7"), unit7Percent = unitPercentFor("unit7");
  const unit8State = unitStatus("unit8"), unit8Percent = unitPercentFor("unit8");
  const unit9State = unitStatus("unit9"), unit9Percent = unitPercentFor("unit9");
  const unit10State = unitStatus("unit10"), unit10Percent = unitPercentFor("unit10");
  const courseProgress = textbookProgress();
  const continueUnitId = UNITS[state.lastUnitId] ? state.lastUnitId : unit1Percent ? "unit1" : unit2Percent ? "unit2" : "unit1";
  const continueUnit = state.units[continueUnitId];
  const continuePercent = unitPercentFor(continueUnitId);
  const cta = continueUnit.review?.active || (!continueUnit.completedEver && continuePercent) ? "继续学习" : continueUnit.completedEver ? `进入 Unit ${UNITS[continueUnitId].number}` : "开始学习";
  // Retain the approved art verbatim; replace only UI data that differs from its reference state.
  const referenceStatus = value => value === "准备开始" ? "reference-value" : "";
  const plate = (name, needed) => needed ? `<span class="course-data-plate plate-${name}" aria-hidden="true"></span>` : "";
  $app.innerHTML = `<main class="world-screen immersive-world course-world" aria-label="课程世界，选择学习单元">
    ${worldHeader('course')}
    <section class="course-map-viewport" data-map-page="${courseMapPage}" aria-label="课本课程地图，可左右滑动切换">
      <div class="course-map-track">
        <section class="world-scene immersive-scene course-scene course-five-map course-map-panel" aria-label="Unit 1 到 Unit 5 课程地图" aria-hidden="${courseMapPage !== 1}" ${courseMapPage === 1 ? "" : "inert"}>
          <div class="scene-accessible-copy"><h1>课程世界</h1><p>Unit 1 · My morning，${unit1State}；Unit 2 · My room，${unit2State}；Unit 3 · On the way，${unit3State}；Unit 4 · Playing sports，${unit4State}；Unit 5 · In the sky，${unit5State}</p></div>
          ${plate('one',!referenceStatus(unit1State))}${plate('two',!referenceStatus(unit2State))}${plate('three',!referenceStatus(unit3State))}${plate('four',!referenceStatus(unit4State))}${plate('cta',cta !== '开始学习')}
          <span class="course-cat-blink" aria-hidden="true"></span>
          <span class="scene-live-value course-unit-value ${referenceStatus(unit1State)}" aria-hidden="true">${unit1State}</span>
          <span class="scene-meter course-unit-meter" aria-hidden="true"><i style="width:${unit1Percent}%"></i></span>
          <button class="scene-hotspot course-unit-one" data-action="open-unit" data-unit-id="unit1" aria-label="打开 Unit 1 My morning，${unit1State}"></button>
          <button class="scene-hotspot course-unit-two" data-action="open-unit" data-unit-id="unit2" aria-label="打开 Unit 2 My room，${unit2State}"></button>
          <span class="scene-live-value course-unit-two-value ${referenceStatus(unit2State)}" aria-hidden="true">${unit2State}</span>
          <span class="scene-meter course-unit-two-meter" aria-hidden="true"><i style="width:${unit2Percent}%"></i></span>
          <span class="scene-live-value course-unit-three-value ${referenceStatus(unit3State)}" aria-hidden="true">${unit3State}</span>
          <span class="scene-meter course-unit-three-meter" aria-hidden="true"><i style="width:${unit3Percent}%"></i></span>
          <button class="scene-hotspot course-unit-three" data-action="open-unit" data-unit-id="unit3" aria-label="打开 Unit 3 On the way，${unit3State}"></button>
          <span class="scene-live-value course-unit-four-value ${referenceStatus(unit4State)}" aria-hidden="true">${unit4State}</span>
          <span class="scene-meter course-unit-four-meter" aria-hidden="true"><i style="width:${unit4Percent}%"></i></span>
          <button class="scene-hotspot course-unit-four" data-action="open-unit" data-unit-id="unit4" aria-label="打开 Unit 4 Playing sports，${unit4State}"></button>
          <span class="course-unit-five-status" aria-hidden="true">${unit5State}</span>
          <span class="scene-meter course-unit-five-meter" aria-hidden="true"><i style="width:${unit5Percent}%"></i></span>
          <button class="scene-hotspot course-unit-five" data-action="open-unit" data-unit-id="unit5" aria-label="打开 Unit 5 In the sky，${unit5State}"></button>
          <button class="scene-action course-primary-action" data-action="open-unit" data-unit-id="${continueUnitId}" aria-label="${cta}"><span class="${cta === '开始学习' ? 'reference-value' : ''}">${cta}</span></button>
        </section>
        <section class="world-scene immersive-scene course-map-panel course-future-map" aria-label="Unit 6 到 Unit 10 课程地图；全部已开放" aria-hidden="${courseMapPage !== 2}" ${courseMapPage === 2 ? "" : "inert"}>
          <div class="scene-accessible-copy"><h1>课程世界</h1><p>Unit 6 · In the sea，${unit6State}；Unit 7 · Seasons，${unit7State}；Unit 8 · Yummy fruit，${unit8State}；Unit 9 · The five senses，${unit9State}；Unit 10 · This is me，${unit10State}。</p></div>
          <button class="course-future-sign course-future-six course-future-available" data-action="open-unit" data-unit-id="unit6" aria-label="打开 Unit 6 In the sea，${unit6State}"><strong lang="en">Unit 6 · In the sea</strong><span>${unit6State}</span><b class="course-future-progress" aria-hidden="true"><i style="width:${unit6Percent}%"></i></b></button>
          <button class="course-future-sign course-future-seven course-future-available" data-action="open-unit" data-unit-id="unit7" aria-label="打开 Unit 7 Seasons，${unit7State}"><strong lang="en">Unit 7 · Seasons</strong><span>${unit7State}</span><b class="course-future-progress" aria-hidden="true"><i style="width:${unit7Percent}%"></i></b></button>
          <button class="course-future-sign course-future-eight course-future-available" data-action="open-unit" data-unit-id="unit8" aria-label="打开 Unit 8 Yummy fruit，${unit8State}"><strong lang="en">Unit 8 · Yummy fruit</strong><span>${unit8State}</span><b class="course-future-progress" aria-hidden="true"><i style="width:${unit8Percent}%"></i></b></button>
          <button class="course-future-sign course-future-nine course-future-available" data-action="open-unit" data-unit-id="unit9" aria-label="打开 Unit 9 The five senses，${unit9State}"><strong lang="en">Unit 9 · The five senses</strong><span>${unit9State}</span><b class="course-future-progress" aria-hidden="true"><i style="width:${unit9Percent}%"></i></b></button>
          <button class="course-future-sign course-future-ten course-future-available" data-action="open-unit" data-unit-id="unit10" aria-label="打开 Unit 10 This is me，${unit10State}"><strong lang="en">Unit 10 · This is me</strong><span>${unit10State}</span><b class="course-future-progress" aria-hidden="true"><i style="width:${unit10Percent}%"></i></b></button>
        </section>
      </div>
      ${worldProgress("课本总进度", courseProgress)}
      <button class="course-map-arrow course-map-previous" data-action="course-map-page" data-page="1" aria-label="查看 Unit 1 到 Unit 5" ${courseMapPage === 1 ? "hidden" : ""}><span aria-hidden="true">‹</span></button>
      <button class="course-map-arrow course-map-next" data-action="course-map-page" data-page="2" aria-label="查看 Unit 6 到 Unit 10" ${courseMapPage === 2 ? "hidden" : ""}><span aria-hidden="true">›</span></button>
      <p class="scene-accessible-copy course-map-page-live" aria-live="polite"></p>
    </section>
    <nav class="course-portrait-panel" aria-label="竖屏课程导航">
      <header><strong class="course-portrait-heading">${courseMapPage === 1 ? "继续学习" : "更多课程"}</strong><div><button class="secondary-button course-page-choice" data-action="course-map-page" data-page="1" aria-pressed="${courseMapPage === 1}">Unit 1–5</button><button class="secondary-button course-page-choice" data-action="course-map-page" data-page="2" aria-pressed="${courseMapPage === 2}">Unit 6–10</button></div></header>
      <div class="portrait-course-page" data-page="1" ${courseMapPage === 1 ? "" : "hidden"}>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit1"><span>Unit 1</span><strong lang="en">My morning</strong><small>${escapeHTML(unit1State)} · ${unit1Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit2"><span>Unit 2</span><strong lang="en">My room</strong><small>${escapeHTML(unit2State)} · ${unit2Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit3"><span>Unit 3</span><strong lang="en">On the way</strong><small>${escapeHTML(unit3State)} · ${unit3Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit4"><span>Unit 4</span><strong lang="en">Playing sports</strong><small>${escapeHTML(unit4State)} · ${unit4Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit5"><span>Unit 5</span><strong lang="en">In the sky</strong><small>${escapeHTML(unit5State)} · ${unit5Percent}%</small></button>
        <button class="primary-button portrait-primary" data-action="open-unit" data-unit-id="${continueUnitId}">${cta}</button>
      </div>
      <div class="portrait-course-page portrait-future-page" data-page="2" ${courseMapPage === 2 ? "" : "hidden"}>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit6"><span>Unit 6</span><strong lang="en">In the sea</strong><small>${escapeHTML(unit6State)} · ${unit6Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit7"><span>Unit 7</span><strong lang="en">Seasons</strong><small>${escapeHTML(unit7State)} · ${unit7Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit8"><span>Unit 8</span><strong lang="en">Yummy fruit</strong><small>${escapeHTML(unit8State)} · ${unit8Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit9"><span>Unit 9</span><strong lang="en">The five senses</strong><small>${escapeHTML(unit9State)} · ${unit9Percent}%</small></button>
        <button class="portrait-unit-card" data-action="open-unit" data-unit-id="unit10"><span>Unit 10</span><strong lang="en">This is me</strong><small>${escapeHTML(unit10State)} · ${unit10Percent}%</small></button>
      </div>
    </nav>
  </main>`;
}

function renderUnitHome() {
  const stepIds = stepIdsFor();
  const complete = currentTaskCount();
  const supplementPending = activeUnitId === "unit2" && state.completedEver && activeContent.dictationPhraseIds.some((id) => !state.attempt.dictation.records[id]?.passed);
  const nextStep = stepIds.find((step) => !state.attempt.tasks[step]) || stepIds[0];
  const reviewing = state.completedEver && state.review?.active;
  const primaryLabel = complete === stepIds.length ? (state.completedEver ? "开始复习" : `完成 ${unitLabel()}`) : complete ? (reviewing ? "继续复习" : "继续学习") : reviewing ? "开始复习" : "开始学习";
  $app.innerHTML = `<main class="world-screen immersive-world unit-world" aria-label="${unitLabel()} ${activeContent.title} 学习任务">
    <section class="world-scene immersive-scene unit-scene ${activeContent.homeClass} ${testSession ? "test-mode-scene" : ""}">
      <div class="scene-accessible-copy"><h1>${unitLabel()}</h1><p>已完成 ${complete}/${stepIds.length}</p></div>
      ${testModeBanner()}
      <div class="family-unit-topbar">
        ${testSession ? '<span class="family-test-label">课程验收</span>' : '<button class="family-nav-button" data-action="back-course">返回课程世界</button>'}
        <div class="family-unit-heading"><strong>${unitLabel()}</strong><span lang="en">${escapeHTML(activeContent.title)}</span></div>
        <div class="family-unit-actions">${testSession ? `<span class="test-star-count">本次测试 ${state.stars} 星</span>` : `<button data-action="growth" aria-label="打开星星账本，当前 ${state.stars} 星">${state.stars} 星</button><button data-action="wish">心愿</button><button data-action="parent">家长</button>`}</div>
      </div>
      ${activeContent.homeArt?`<div class="unit-content-home-art" style="--unit-home-art:url('${activeContent.homeArt}')">`:activeUnitId==='unit4'?'<div class="unit4-home-art">':''}<div class="family-progress-badge" aria-label="本次进度 ${complete}/${stepIds.length}"><strong>${complete}/${stepIds.length}</strong><span>本次进度</span></div>${activeContent.homeArt||activeUnitId==='unit4'?'</div>':''}
      <div class="family-step-tray">${UNIT_STEPS.map((step, index) => {
        const done = state.attempt.tasks[step.id];
        const open = stepIsOpen(step.id);
        const justCompleted = lastCompletedStep === step.id;
        const dependency = activeContent.unlockAfter?.[step.id] || stepIds[index - 1];
        const justUnlocked = lastCompletedStep && dependency === lastCompletedStep && open && !done;
        const lockedCopy = activeUnitId === "unit1" && step.id === "dictation" ? "完成词组练习后解锁" : "完成上一步后解锁";
return `<button class="family-step-card ${done ? "done" : ""} ${open && !done ? "active" : ""} ${justCompleted ? "just-completed" : ""} ${justUnlocked ? "just-unlocked" : ""}" data-action="open-step" data-screen="${step.id}" ${open ? "" : "disabled"} aria-label="第 ${index + 1} 步 ${step.title}，${done ? "已完成，可复习" : open ? "可以开始" : lockedCopy}"><img src="${step.imageSrc}" width="600" height="600" alt="" /><span class="family-step-number">${index + 1}</span><strong>${step.title}</strong><small>${done ? "已完成" : open ? step.subtitle : lockedCopy}</small></button>`;
      }).join("")}</div>
      <button class="family-primary-action" data-action="${supplementPending ? "unit2-supplement" : complete === stepIds.length ? "restart" : "start"}" data-screen="${nextStep}">${supplementPending ? "补学 6 个新词" : primaryLabel}</button>
    </section>
  </main>`;
}

function progressBar() {
  const stepIds = stepIdsFor();
  const active = currentStepNumber();
  return `<div class="progress" role="progressbar" aria-label="${unitLabel()} 学习进度" aria-valuemin="1" aria-valuemax="${stepIds.length}" aria-valuenow="${active}">${stepIds.map((step, index) => `<span class="${state.attempt.tasks[step] ? "done" : index + 1 === active ? "active" : ""}"></span>`).join("")}</div>`;
}

function lessonLayout(main, imageSrc = "", imageAlt = "") {
  const visual = imageSrc ? `<aside class="stage-visual ${milestoneMessage ? "scene-milestone" : ""}"><img src="${imageSrc}" width="800" height="600" alt="${escapeHTML(imageAlt)}" /></aside>` : "";
  $app.innerHTML = shell(`<section data-unit="${activeUnitId}" class="lesson-card stage-shell ${activeContent.practiceStages ? 'textbook-practice-shell' : ''}"><div class="lesson-toolbar"><button class="text-button" data-action="back-home">返回 ${unitLabel()}</button><span>第 ${currentStepNumber()} / ${stepIdsFor().length} 关</span></div>${progressBar()}<div class="stage-workspace ${visual ? "with-visual" : ""}"><article class="stage-task">${main}</article>${visual}</div></section>`);
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.querySelector(".stage-task h1")?.focus({ preventScroll: true });
  });
}

function phraseCard(phrase, action, listened = false, imageOnly = false, disabled = false) {
  return `<button class="phrase-card ${listened ? "listened" : ""} ${imageOnly ? "image-only" : ""}" data-action="${action}" data-phrase-id="${phrase.id}" aria-label="${escapeHTML(phrase.text)}" ${disabled ? "disabled" : ""}><img src="${phrase.imageSrc}" width="800" height="600" alt="" />${imageOnly ? "" : `<strong lang="en">${escapeHTML(phrase.text)}</strong>`}</button>`;
}

function renderWords() {
  const run = state.attempt.words;
  if((activeContent.practiceStages?.application||activeContent.resumeWordsDictation)&&run.mode==="dictation") {
    screen=activeContent.practiceStages?.application&&state.attempt.tasks.dictation?"application":"dictation";
    screen==="application"?renderPractice():renderDictation();return;
  }
  if (run.mode === "learn") {
    const learnPhrases = activeContent.learnPhraseIds.map((id) => phraseById.get(id));
    const listenedCount = learnPhrases.filter(({ id }) => run.listenedIds.includes(id)).length;
    const ready = listenedCount === learnPhrases.length;
    const groups = activeContent.wordGroups || (activeUnitId === "unit2" ? ['位置词组','房间词汇','整理词汇'].map((title,i)=>({title,ids:activeContent.learnPhraseIds.slice(i*3,i*3+3)})) : null);
    const grouped = Boolean(groups);
    const groupIndex = grouped ? Math.min(groups.length-1, Math.max(0, run.groupIndex || 0)) : 0;
    const shown = grouped ? groups[groupIndex].ids.map(id=>phraseById.get(id)) : learnPhrases;
    const groupReady = shown.every(({ id }) => run.listenedIds.includes(id));
    const navigation = grouped ? `<div class="word-group-actions"><button class="secondary-button" data-action="word-group-prev" ${groupIndex ? "" : "disabled"}>上一组</button><span>第 ${groupIndex + 1}/${groups.length} 组 · ${groups[groupIndex].title}</span><button class="secondary-button" data-action="word-group-next" ${groupIndex < groups.length-1 && groupReady ? "" : "disabled"}>下一组</button></div>` : "";
    lessonLayout(`<p class="word-banner">第 ${currentStepNumber()} 关 · ${grouped ? "词语练习" : "词组练习"}</p><h1 tabindex="-1" lang="en">Listen and learn.</h1><p class="stage-instruction">点图片，听 ${learnPhrases.length} 个${grouped ? "课本词语" : "核心词组"}。</p>${navigation}<div class="phrase-grid learning-grid ${grouped ? "unit2-learning-grid" : ""}">${shown.map((phrase) => phraseCard(phrase, "learn-phrase", run.listenedIds.includes(phrase.id))).join("")}</div><button class="primary-button stage-continue" data-action="start-word-quiz" ${ready ? "" : "disabled"}>开始听音选图</button><p id="feedback" class="feedback" role="status">${ready ? `${learnPhrases.length} 项都听过了。` : `已听 ${listenedCount}/${learnPhrases.length}`}</p>`);
    return;
  }
  const question = UNIT_PHRASE_QUIZ[run.questionIndex];
  const target = phraseById.get(question.targetId);
  const heard = run.heardQuestionId === question.id;
  const isListeningExtension = target.kind === "listening";
  lessonLayout(`<p class="word-banner">第 ${currentStepNumber()} 关 · ${activeUnitId === "unit2" ? "词语练习" : "词组练习"} · 第 ${run.questionIndex + 1}/${UNIT_PHRASE_QUIZ.length} 题${isListeningExtension ? " · 听力练习" : ""}</p><h1 tabindex="-1" lang="en">Listen and choose.</h1><button class="secondary-button replay-button" data-action="play-question" data-question-id="${question.id}">${heard ? "再听一次" : "听题"}</button><div class="phrase-grid quiz-grid">${question.optionIds.map((id) => phraseCard(phraseById.get(id), "phrase-choice", false, true, !heard)).join("")}</div><p id="feedback" class="feedback" role="status">${heard ? "请选择图片。" : "先听，再选择图片。"}</p>`);
}

function renderListening() {
  if(activeContent.practiceStages?.listening){renderPractice();return;}
  const run = state.attempt.listening;
  const question = UNIT_LISTENING_QUIZ[run.questionIndex];
  if (!question) { completeStep("listening"); screen = "unit-home"; render(); return; }
  const heard = run.heardQuestionId === question.id;
  lessonLayout(`<p class="word-banner">第 2 关 · 听力挑战 · 第 ${run.questionIndex + 1}/${UNIT_LISTENING_QUIZ.length} 题</p><h1 tabindex="-1" lang="en">Listen and tick.</h1><p class="stage-instruction">听完整句子，选择符合内容的图片。</p><button class="secondary-button replay-button" data-action="play-listening-question" data-question-id="${question.id}">${heard ? "再听一次" : "听题"}</button><div class="phrase-grid quiz-grid">${question.optionIds.map((id) => phraseCard(phraseById.get(id), "listening-choice", false, true, !heard)).join("")}</div><p id="feedback" class="feedback" role="status">${heard ? "请选择正确的图片。" : "先听完整句子，再选择。"}</p>`);
}

function renderSentences() {
  const run = state.attempt.sentences;
  const item = UNIT_SENTENCES[Math.min(run.itemIndex, UNIT_SENTENCES.length - 1)];
  const listened = run.listenedIds.includes(item.id);
  const recordingId = run.recordingIds[item.id];
  const sceneNumber = UNIT_SCENES.findIndex((scene) => scene.id === item.sceneId) + 1;
  const scene = UNIT_SCENES[sceneNumber - 1];
  const lineNumber = scene.lines.findIndex((line) => line.id === item.id) + 1;
  lessonLayout(`<p class="word-banner">第 ${currentStepNumber()} 关 · ${activeUnitId === "unit2" ? "故事听说 · 跟读" : "逐句跟读"} · 场景 ${sceneNumber}/${UNIT_SCENES.length} · 第 ${lineNumber}/${scene.lines.length} 句</p><h1 tabindex="-1" lang="en">${escapeHTML(item.text)}</h1><p class="stage-instruction" lang="en">Listen. Pause. Speak.</p><div class="practice-actions"><button class="primary-button" data-action="play-follow-line" data-item-id="${item.id}">听这一句</button><button class="record-button" data-action="record" data-record-kind="sentences" data-item-id="${item.id}" ${listened ? "" : "disabled"}>${recordingId ? "再录一次" : "跟读录音"}</button>${recordingId ? `<button class="secondary-button" data-action="play-saved-recording" data-id="${recordingId}">听我的录音</button>` : ""}</div><p id="feedback" class="feedback ${milestoneMessage ? "milestone" : ""}" role="status">${milestoneMessage || (recordingId ? "这一句完成了。" : listened ? "现在跟着说一遍。" : "先听，再录音。")}</p>`, item.imageSrc, `${activeContent.title} 场景插图`);
}

function renderDialogue() {
  const run = state.attempt.dialogue;
  const scene = UNIT_DIALOGUES[Math.min(run.sceneIndex, UNIT_DIALOGUES.length - 1)];
  const [cue, reply] = scene.lines;
  const listened = run.listenedIds.includes(scene.id);
  const recordingId = run.recordingIds[scene.id];
  lessonLayout(`<p class="word-banner">第 ${currentStepNumber()} 关 · ${activeUnitId === "unit2" ? "故事听说 · 对话接力" : "对话接力"} · ${run.sceneIndex + 1}/${UNIT_DIALOGUES.length}</p><h1 tabindex="-1" lang="en">Listen and answer.</h1><section class="dialogue-turn cue-turn"><small>${escapeHTML(cue.speaker)}</small><strong lang="en">${escapeHTML(cue.text)}</strong><button class="secondary-button" data-action="play-dialogue-cue" data-scene-id="${scene.id}">听上句</button></section><section class="dialogue-turn reply-turn ${recordingId ? "revealed" : ""}"><small>Your turn</small>${recordingId ? `<strong lang="en">${escapeHTML(reply.text)}</strong><button class="secondary-button" data-action="play-dialogue-reply" data-scene-id="${scene.id}">听教材回答</button>` : `<strong class="hidden-answer">Speak before you look.</strong>`}</section><div class="practice-actions"><button class="record-button" data-action="record" data-record-kind="dialogue" data-item-id="${scene.id}" ${listened ? "" : "disabled"}>${recordingId ? "再说一次" : "接下句并录音"}</button>${recordingId ? `<button class="secondary-button" data-action="play-saved-recording" data-id="${recordingId}">听我的回答</button><button class="primary-button" data-action="next-dialogue">${run.sceneIndex === UNIT_DIALOGUES.length - 1 ? "完成对话接力" : "下一组"}</button>` : ""}</div><p id="feedback" class="feedback ${milestoneMessage ? "milestone" : ""}" role="status">${milestoneMessage || (recordingId ? "听听教材回答，再比较。" : listened ? "轮到你接下句。" : "先听上句。")}</p>`, scene.imageSrc, `${activeContent.title} 对话场景插图`);
}

function renderTransfer() {
  const run = state.attempt.transfer;
  const scene = UNIT_TRANSFERS[Math.min(run.itemIndex, UNIT_TRANSFERS.length - 1)];
  const recordingId = run.recordingIds[scene.id];
  const compared = run.comparedIds.includes(scene.id);
  const speakers = scene.lines.map(({ speaker }) => speaker).join(" → ");
  const visuals = scene.transferImageSrcs.map((src, index) => `<img src="${src}" width="800" height="600" alt="${escapeHTML(scene.prompt)} 场景${scene.transferImageSrcs.length > 1 ? ` ${index + 1}` : ""}" />`).join("");
  lessonLayout(`<p class="word-banner">第 ${currentStepNumber()} 关 · ${activeUnitId === "unit2" ? "故事听说 · 看图表达" : "看图表达"} · 场景 ${run.itemIndex + 1}/${UNIT_TRANSFERS.length}</p><h1 tabindex="-1" lang="en">${escapeHTML(scene.prompt)}</h1><p class="stage-instruction">看图，把人物说的话完整说出来。</p><section class="transfer-practice"><div class="transfer-copy"><span class="speaker-path" lang="en">${escapeHTML(speakers)}</span><p lang="en">Look. Think. Tell the whole scene.</p><div class="practice-actions"><button class="record-button" data-action="record" data-record-kind="transfer" data-item-id="${scene.id}">${recordingId ? "再说一次" : "开始讲述"}</button>${recordingId ? `<button class="secondary-button" data-action="play-saved-recording" data-id="${recordingId}">听我的讲述</button><button class="secondary-button" data-action="play-scene-dialogue" data-scene-id="${scene.id}">${compared ? "再听教材对话" : "听教材对话"}</button><button class="primary-button" data-action="next-transfer">${run.itemIndex === UNIT_TRANSFERS.length - 1 ? "完成看图表达" : "下一幅图"}</button>` : ""}</div></div><div class="transfer-scene-images ${scene.transferImageSrcs.length > 1 ? "split" : ""}">${visuals}</div></section><p id="feedback" class="feedback ${milestoneMessage ? "milestone" : ""}" role="status">${milestoneMessage || (recordingId ? "这一幅图完成了。可以听教材对话比较。" : "先自己说，不看完整台词。")}</p>`);
}

function renderStory() {
  if (activeContent.practiceStages?.story) { renderPractice(); return; }
  if (!state.attempt.tasks.sentences) { screen = "sentences"; renderSentences(); return; }
  if (!state.attempt.tasks.dialogue) { screen = "dialogue"; renderDialogue(); return; }
  screen = "transfer";
  renderTransfer();
}

function currentPractice() {
  const activities = activeContent.practiceStages?.[screen] || [];
  const run = state.attempt.practice;
  const index = Math.min(run?.indices?.[screen] || 0, activities.length - 1);
  return {activities,run,index,activity:activities[index]};
}
function renderPractice() {
  const {activity,run,index,activities}=currentPractice();
  if (!activity) {screen="unit-home";render();return;}
  const logEntries=activities.filter(a=>a.type==='scene-log').map(a=>({activity:a,evidence:run.evidence[a.id],recordingId:run.recordingIds[a.id]}));
  let markup=practiceMarkup(activity,run.evidence[activity.id]||{},run.recordingIds[activity.id],index,activities.length,escapeHTML,{logEntries});
  if(activity.showFrameHint)markup=markup.replace('class="stage-instruction"','class="stage-instruction speech-brief"');
  if(activity.stageLabel)markup=markup.replace(/(<p class="word-banner">)[^<]+/,`$1${escapeHTML(activity.stageLabel)} · ${index+1}/${activities.length}`);
  const roleImage=activity.type==='role-play'?activity.options.find(o=>o.id===run.evidence[activity.id]?.choice)?.imageSrc:"";
  const sideImage=['speak-choice','match'].includes(activity.type)?"":roleImage||activity.imageSrc||"";
  lessonLayout(markup,sideImage, "教材情境插图");
}
function renderSong() {
  if(activeContent.practiceStages?.song){renderPractice();return;}
  const run = state.attempt.song;
  const recordingId = run.recordingIds.song;
  const lyrics = activeContent.song.lyrics.map((line) => `<span lang="en">${escapeHTML(line)}</span>`).join("");
  const rhyme=activeContent.song.kind==="rhyme";
  lessonLayout(`<p class="word-banner">第 4 关 · 歌谣唱读</p><h1 tabindex="-1" lang="en">${escapeHTML(activeContent.song.title)}</h1><p class="stage-instruction">${rhyme?'先听完整歌谣，再按节奏完整读一遍。':'先听完整歌曲，再录下自己的演唱。'}</p><section class="song-stage"><div class="song-lyrics">${lyrics}</div><div class="practice-actions"><button class="primary-button" data-action="play-stage-song">${run.listened ? "再听一次" : "完整听一遍"}</button><button class="record-button" data-action="record" data-record-kind="song" data-item-id="song" ${run.listened ? "" : "disabled"}>${recordingId ? "重新录音" : rhyme?'录下我的歌谣':"录下我的演唱"}</button>${recordingId ? `<button class="secondary-button" data-action="play-saved-recording" data-id="${recordingId}">听我的录音</button><button class="primary-button" data-action="finish-song">完成歌谣唱读</button>` : ""}</div></section><p id="feedback" class="feedback" role="status">${recordingId ? "录音已经保存。" : run.listened ? "现在轮到你。" : "先完整听一遍。"}</p>`, activeContent.song.imageSrc||activeContent.steps.find(({ id }) => id === "song")?.imageSrc, "歌谣情境插图");
}

function renderProject() {
  if(activeContent.practiceStages?.project){renderPractice();return;}
  if (activeContent.projectType === "bookmark") { lessonLayout(bookmarkMarkup(activeContent,state.attempt.project,escapeHTML)); return; }
  const run = state.attempt.project;
  const items = activeContent.projectItems || [];
  const arranged = items.filter(({ id, answer }) => run.placements[id] === answer).length;
  const ready = arranged === items.length;
  const recordingId = run.recordingIds.project;
  const hintLevel = Math.max(0, Math.min(3, Number(run.hintLevel) || 0));
  const rows = items.map((item) => `<section class="project-item"><img src="${item.imageSrc}" width="800" height="600" alt="${escapeHTML(item.label)} 摆放场景" /><div><strong lang="en">${escapeHTML(item.label)}</strong><div class="project-options">${item.options.map((option) => `<button class="${run.placements[item.id] === option ? "selected" : ""}" data-action="project-choice" data-item-id="${item.id}" data-value="${escapeHTML(option)}" lang="en">${escapeHTML(option)}</button>`).join("")}</div></div></section>`).join("");
  const script = items.map(({ id, label }) => run.placements[id] ? `I put my ${label} ${run.placements[id]}.` : "").filter(Boolean).join(" ");
  const outcomeCues = activeContent.projectOutcomeCues || [];
  const visualCues = items.map((item, index) => `<figure class="project-speaking-cue"><span>${index + 1}</span><img src="${item.imageSrc}" width="800" height="600" alt="" /></figure>`).join("");
  const outcomeVisualCues = outcomeCues.map((cue, index) => `<figure class="project-speaking-cue"><span>${items.length + index + 1}</span><img src="${cue.imageSrc}" width="800" height="600" alt="" /></figure>`).join("");
  const keywords = `${items.map(({ id, label }) => `<span lang="en">${escapeHTML(label)} · ${escapeHTML(run.placements[id])}</span>`).join("")}${outcomeCues.map(({ keyword }) => `<span lang="en">${escapeHTML(keyword)}</span>`).join("")}`;
  const hintCopy = hintLevel === 1
    ? `<div class="project-keywords" aria-label="关键词提示">${keywords}</div>`
    : hintLevel === 2
      ? `<div class="project-sentence-frame" aria-label="句型提示"><p lang="en">I put my ___ ___.</p><p lang="en">My room is ___.</p><p lang="en">I ___ my room.</p></div>`
      : hintLevel === 3
        ? `<p class="project-reference" lang="en">${escapeHTML(script)} My room is tidy. I like my room.</p>`
        : "";
  const hintLabel = ["看关键词", "看句型", "看完整参考", "收起提示"][hintLevel];
  lessonLayout(`<p class="word-banner">第 5 关 · 小小实践</p><h1 tabindex="-1" lang="en">My tidy room</h1><p class="stage-instruction">先帮物品找到合适的位置，再介绍整洁的房间。</p><div class="project-grid">${rows}</div>${ready ? `<section class="project-speaking"><div class="project-speaking-cues" aria-label="按顺序看图介绍">${visualCues}${outcomeVisualCues}</div>${hintCopy}<div class="practice-actions"><button class="record-button" data-action="record" data-record-kind="project" data-item-id="project">${recordingId ? "重新介绍" : "开始介绍"}</button>${recordingId ? `<button class="secondary-button" data-action="play-saved-recording" data-id="${recordingId}">听我的介绍</button><button class="secondary-button" data-action="project-hint">${hintLabel}</button><button class="primary-button" data-action="finish-project">完成小小实践</button>` : ""}</div></section>` : ""}<p id="feedback" class="feedback" role="status">${recordingId ? "介绍已经保存；可以直接完成，也可以查看提示后再录一次。" : ready ? "先看图片自己介绍；录完后可以按需查看提示。" : `已整理 ${arranged}/${items.length}`}</p>`);
}

function renderDictation() {
  const run = state.attempt.dictation;
  const item = run.queue[run.index];
  if (!item) {
    const labels = { independent: "独立写对", corrected: "复测通过", pending: "下次再练" };
    const allComplete = stepIdsFor().every(step => state.attempt.tasks[step]);
    lessonLayout(`<p class="word-banner">第 ${currentStepNumber()} 关 · ${activeUnitId === "unit2" ? "词组练习 · " : ""}听音默写</p><h1 tabindex="-1">这一轮完成了</h1><p>本轮获得 ${run.earned} 星</p><ul class="dictation-results">${run.order.map(id => `<li><span lang="en">${escapeHTML(phraseById.get(id).text)}</span><strong>${labels[run.results[id]] || "待练"}</strong></li>`).join("")}</ul><div class="practice-actions"><button class="primary-button" data-action="dictation-finish">${allComplete ? `完成 ${unitLabel()}` : `回到 ${unitLabel()}`}</button><button class="secondary-button" data-action="dictation-new">再练一轮</button></div><p class="feedback">已获得的奖励不会重复发放。</p>`);
  } else {
    const result = run.feedback;
    const title = item.retry ? "再试一次" : `第 ${run.index + 1}/${activeContent.dictationPhraseIds.length} 题`;
    const feedback = result ? result.correct ? "写对了！" : "看看不同的地方，下次再试。" : run.heard ? "听清楚了，就写下来。" : "先听，再写。";
    lessonLayout(`<p class="word-banner">第 ${currentStepNumber()} 关 · ${activeUnitId === "unit2" ? "词组练习 · " : ""}听音默写 · ${title}</p><h1 tabindex="-1" lang="en">Listen and write.</h1><button class="secondary-button" data-action="dictation-play">${run.heard ? "再听一次" : "听词组"}</button><label class="dictation-label" for="dictation-answer">写出听到的词组</label><input id="dictation-answer" lang="en" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" maxlength="80" value="${escapeHTML(run.draft)}" ${!run.heard || result ? "disabled" : ""} aria-describedby="feedback" />${result && !result.correct ? `<section class="dictation-correction"><small>你的输入</small><p lang="en">${escapeHTML(result.answer) || "尚未输入"}</p><small>正确写法</small><strong lang="en">${escapeHTML(result.expected)}</strong></section>` : ""}<div class="practice-actions">${result ? '<button class="primary-button" data-action="dictation-next">'+(result.correct ? "继续" : "记住了，遮住答案")+'</button>' : `<button class="primary-button" data-action="dictation-check" ${run.heard ? "" : "disabled"}>检查</button><button class="text-button" data-action="dictation-help" ${run.heard ? "" : "disabled"}>帮我一下</button>`}</div><p id="feedback" class="feedback ${result && !result.correct ? "warn" : ""}" role="status">${feedback}</p>`);
  }
  document.querySelector(".stage-shell")?.classList.add("dictation-shell");
}

function commitDictation(nextState) {
  if (testSession) {
    state = bindActiveUnit(nextState);
    return true;
  }
  try {
    syncActiveUnit(nextState);
    const stored = stateForStorage(nextState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    state = bindActiveUnit(nextState);
    persistedState = structuredClone(stored);
    return true;
  }
  catch { announce("保存失败，请释放一些设备空间后重试。", true); return false; }
}

function renderComplete() {
  const review = normalizeReview(state.review);
  const reviewed = Boolean(review.lastCompletedAt);
  const rewardCopy = reviewed
    ? review.lastAwardedStars ? `第 ${review.completedCount} 次复习完成 · +${review.lastAwardedStars} 星` : `第 ${review.completedCount} 次复习完成 · 奖励已领完`
    : "首次完成五个学习任务";
  const reviewCopy = `复习奖励 ${review.rewardedCount}/${REVIEW_REWARD_LIMIT}`;
  lessonLayout(`<section class="completion"><div class="star-burst">完成</div><p class="eyebrow">${unitLabel()}</p><h1 tabindex="-1" lang="en">${escapeHTML(activeContent.title)}</h1><p class="lead">${rewardCopy}</p><div class="completion-reward"><strong>${state.stars} 星</strong><span>${reviewCopy}</span></div><div class="utility-row"><button class="primary-button" data-action="back-home">回到 ${unitLabel()}</button><button class="secondary-button" data-action="restart">${review.rewardedCount < REVIEW_REWARD_LIMIT ? "再复习一次" : "继续自由复习"}</button></div></section>`, UNIT_TEXTBOOK.familyVisual, `${activeContent.title} 完成场景`);
}

function eventRows(events, emptyCopy = "还没有成长记录。") {
  if (!events.length) return `<p class="timeline-empty">${escapeHTML(emptyCopy)}</p>`;
  return `<ol class="growth-timeline">${events.map((event) => `<li><span class="timeline-dot" aria-hidden="true"></span><div><strong>${escapeHTML(event.title)}</strong><p>${escapeHTML(event.detail || "")}</p><time>${formatLocalTime(event.createdAt)}</time></div>${event.deltaStars ? `<b class="star-delta ${event.deltaStars < 0 ? "spent" : ""}">${event.deltaStars > 0 ? "+" : ""}${event.deltaStars} 星</b>` : ""}</li>`).join("")}</ol>`;
}

function recentEvents(predicate = () => true, limit = 30) {
  return (Array.isArray(state.events) ? state.events : []).filter(predicate).sort((a, b) => Number(b.createdAt) - Number(a.createdAt)).slice(0, limit);
}

function renderWish() {
  const wish = normalizeWish(state.wish);
  const remaining = Math.max(0, Number(wish.target || 0) - state.stars);
  const percent = wish.target ? Math.min(100, Math.round(state.stars / wish.target * 100)) : 0;
  const labels = { submitted: "等待家长设置目标", confirmed: remaining ? `还差 ${remaining} 星` : "目标已达到", achieved: remaining ? `曾经达成，还差 ${remaining} 星可兑现` : "心愿已经达成", redeemed: "心愿已经兑现" };
  const showForm = !wish.title || wish.status === "redeemed" || wishEditing;
  const canEdit = ["submitted", "confirmed"].includes(wish.status);
  const wishEvents = wish.id ? recentEvents((event) => event.wishId === wish.id, 8) : [];
  const formTitle = wish.status === "redeemed" ? "许下下一个心愿" : wishEditing ? "调整我的心愿" : "写下想要的礼物";
  const formValue = wishEditing ? wish.title : "";
  const card = wish.title ? `<section class="active-wish"><div class="wish-heading"><div><p class="eyebrow">当前心愿</p><h1>${escapeHTML(wish.title)}</h1></div><span class="wish-status ${wish.status}">${escapeHTML(labels[wish.status] || "等待设置")}</span></div><div class="wish-progress-copy"><strong>${state.stars} / ${wish.target || "待设置"} 星</strong><span>${wish.target ? `${percent}%` : "家长设置目标后开始累计"}</span></div><div class="wish-meter" aria-label="心愿进度 ${percent}%"><i style="width:${percent}%"></i></div>${canEdit && !showForm ? '<button class="text-button" data-action="edit-wish">调整心愿</button>' : ""}</section>` : "";
  const form = showForm ? `<section class="wish-form"><p class="eyebrow">${formTitle}</p><label for="wish-title">我想要的礼物</label><input id="wish-title" name="wish-title" autocomplete="off" maxlength="30" value="${escapeHTML(formValue)}" aria-describedby="wish-feedback" /><p id="wish-feedback" class="field-note" role="status">一次保留一个心愿，最多 30 个字。</p><div class="utility-row"><button class="primary-button" data-action="save-wish">提交心愿</button>${wishEditing ? '<button class="secondary-button" data-action="cancel-wish-edit">取消</button>' : ""}</div></section>` : "";
  $app.innerHTML = shell(`<section class="lesson-card center-card wish-card"><nav class="center-tabs" aria-label="成长中心"><button class="active" aria-current="page">我的心愿</button><button data-action="growth">成长足迹</button></nav>${card}${form}<section class="milestone-section"><div class="section-heading"><h2>心愿里程碑</h2><span>${wishEvents.length} 条</span></div>${eventRows(wishEvents, wish.title ? "完整里程碑从本次升级开始记录。" : "许下心愿后，这里会记录它的成长。")}</section><button class="secondary-button center-back" data-action="back-hub">返回</button></section>`);
}

function renderGrowth() {
  const events = recentEvents(() => true, 40);
  const totalRewardedReviews = Object.values(state.units).reduce((sum, unit) => sum + normalizeReview(unit.review).rewardedCount, 0) + state.up.up2.review.rewardedCount;
  const completedUnitCount = Object.values(state.units).filter(({ completedEver }) => completedEver).length + Number(state.up.up2.completedEver);
  const migrationNote = state.lifetimeStars > 0 && !events.length ? '<p class="history-note">已有星星已保留；完整成长足迹从本次升级开始记录。</p>' : "";
  $app.innerHTML = shell(`<section class="lesson-card center-card growth-card"><nav class="center-tabs" aria-label="成长中心"><button data-action="wish">我的心愿</button><button class="active" aria-current="page">成长足迹</button></nav><header class="growth-heading"><div><p class="eyebrow">我的成长</p><h1>每一步都算数</h1></div><button class="secondary-button" data-action="back-hub">返回</button></header><div class="growth-summary"><div><span>可用星星</span><strong>${state.stars}</strong></div><div><span>累计获得</span><strong>${state.lifetimeStars}</strong></div><div><span>完成课程</span><strong>${completedUnitCount}</strong></div><div><span>奖励复习</span><strong>${totalRewardedReviews}/${REVIEW_REWARD_LIMIT * (Object.keys(state.units).length + 1)}</strong></div></div>${migrationNote}<section class="milestone-section"><div class="section-heading"><h2>成长足迹</h2><span>${events.length} 条</span></div>${eventRows(events)}</section></section>`);
}



function dictationRecordsFor(unitId, content) {
  const labels = { independent: "独立写对", corrected: "订正后复测通过", pending: "待练" };
  const attempt = state.units[unitId].attempt;
  const phrases = new Map(content.phrases.map((phrase) => [phrase.id, phrase]));
  return content.dictationPhraseIds.map((id) => {
    const phrase = phrases.get(id);
    return `<li><span lang="en">${escapeHTML(phrase?.text || "核心词组")}</span><strong>${labels[attempt.dictation.records[id]?.status] || "尚未练习"}</strong></li>`;
  }).join("");
}

function parentTestPanel(content) {
  const stepOptions = content.steps.map(({ id, title }) => `<option value="${id}">${escapeHTML(title)}</option>`).join("");
  return `<section class="parent-test-panel" aria-labelledby="parent-test-title"><header><div><h2 id="parent-test-title">全局功能测试</h2><p>使用当前真实课程、音频、插图、答题、录音与奖励逻辑；所有结果只保留在本次页面内。</p></div><strong>当前：Unit ${content.number}</strong></header><div class="parent-test-options"><div><span><strong>完整闯关</strong><small>从第一关开始，按正式顺序逐关解锁。</small></span><button class="primary-button" data-action="start-parent-test-course">开始测试</button></div><div><span><strong>单项验收</strong><small>只在测试沙盒补齐前置条件，直接检查指定任务。</small></span><label>选择任务<select id="parent-test-step-select">${stepOptions}</select></label><button class="secondary-button" data-action="start-parent-test-step">进入任务</button></div><div><span><strong>复习验收</strong><small>检查第 1–3 次各奖励 5 星，以及第 4 次不再奖励。</small></span><label>本次复习<select id="parent-test-review-select"><option value="1">第 1 次</option><option value="2">第 2 次</option><option value="3">第 3 次</option><option value="4">第 4 次（无新增奖励）</option></select></label><button class="secondary-button" data-action="start-parent-test-review">开始复习</button></div></div></section>`;
}

function parentUpPanel() {
  const up = state.up.up2,up3=state.up.up3;
  const chapterRows = UP2_CHAPTERS.map((chapter) => `<li><strong>${escapeHTML(chapter.title)}</strong><span>${chapter.nodeIds.filter((id) => up.completedNodeIds.includes(id)).length}/${chapter.nodeIds.length} 小节</span></li>`).join("");
  const options = UP2_NODES.map((node) => `<option value="${node.id}">${escapeHTML(node.title)}</option>`).join("");
  const up3Rows=UP3_CHAPTERS.map(chapter=>`<li><strong>${escapeHTML(chapter.title)}</strong><span>${chapter.nodeIds.filter(id=>up3.completedNodeIds.includes(id)).length}/${chapter.nodeIds.length} 小节</span></li>`).join('');
  const up3Options=UP3_NODES.map(node=>`<option value="${node.id}">${escapeHTML(node.title)}</option>`).join('');
  return `<section class="parent-test-panel parent-up-panel" aria-labelledby="parent-up-title"><header><div><h2 id="parent-up-title">UP 课程 · 独立进度</h2><p>UP2 与 UP3 的进度分开保存，共用星星与心愿账本。</p></div><strong>UP2 ${up.completedNodeIds.length}/${UP2_NODES.length} · UP3 ${up3.completedNodeIds.length}/${UP3_NODES.length}</strong></header><h3>UP2 · Creature Features</h3><ul class="parent-up-chapters">${chapterRows}</ul><p class="section-copy">首学 ${UP2_TOTAL_STARS} 星；完整复习 ${up.review.rewardedCount}/${REVIEW_REWARD_LIMIT} 次已奖励。</p><div class="parent-test-options"><div><span><strong>UP2 完整测试</strong><small>独立沙盒，从三章的可开放小节开始。</small></span><button class="secondary-button" data-action="start-parent-test-up2" data-scenario="course">开始测试</button></div><div><span><strong>UP2 单项测试</strong><small>直接检查一个小节。</small></span><label>选择节点<select id="parent-up-node-select">${options}</select></label><button class="secondary-button" data-action="start-parent-test-up2" data-scenario="node">进入节点</button></div><div><span><strong>UP2 复习测试</strong><small>第 1–3 次各 5 星，第 4 次无新奖励。</small></span><label>本次复习<select id="parent-up-review-select"><option value="1">第 1 次</option><option value="2">第 2 次</option><option value="3">第 3 次</option><option value="4">第 4 次</option></select></label><button class="secondary-button" data-action="start-parent-test-up2" data-scenario="review">开始测试</button></div></div><h3>UP3 · Team Up!</h3><ul class="parent-up-chapters">${up3Rows}<li><strong>女王与豌豆</strong><span>${up3.completedNodeIds.includes('queen-pea')?'已读完':'待阅读'}</span></li></ul><p class="section-copy">首学 ${UP3_TOTAL_STARS} 星；完整复习 ${up3.review.rewardedCount}/${REVIEW_REWARD_LIMIT} 次已奖励。朗读表示尝试，写词分独立与提示后完成。</p><div class="parent-test-options"><div><span><strong>UP3 完整测试</strong><small>独立沙盒，正式学习记录不变。</small></span><button class="secondary-button" data-action="start-parent-test-up3" data-scenario="course">开始测试</button></div><div><span><strong>UP3 单项测试</strong><small>直接检查一个小节。</small></span><label>选择节点<select id="parent-up3-node-select">${up3Options}</select></label><button class="secondary-button" data-action="start-parent-test-up3" data-scenario="node">进入节点</button></div><div><span><strong>UP3 复习测试</strong><small>第 1–3 次各 5 星，第 4 次无新奖励。</small></span><label>本次复习<select id="parent-up3-review-select"><option value="1">第 1 次</option><option value="2">第 2 次</option><option value="3">第 3 次</option><option value="4">第 4 次</option></select></label><button class="secondary-button" data-action="start-parent-test-up3" data-scenario="review">开始测试</button></div></div></section>`;
}

// Register UP courses once; the parent centre renders only the selected course.
function parentUpCourses(){return [
  {id:'up2',label:'UP 2 · Creature Features',nodes:UP2_NODES,chapters:UP2_CHAPTERS,stars:UP2_TOTAL_STARS,testAction:'start-parent-test-up2',nodeSelect:'parent-up-node-select',reviewSelect:'parent-up-review-select'},
  {id:'up3',label:'UP 3 · Team Up!',nodes:UP3_NODES,chapters:UP3_CHAPTERS,stars:UP3_TOTAL_STARS,testAction:'start-parent-test-up3',nodeSelect:'parent-up3-node-select',reviewSelect:'parent-up3-review-select'}
];}
let parentUpCourseId='up2';
function up3ParentFacts(up) {
  const all=UP3_NODES.flatMap(n=>n.activities),done=a=>isUp3ActivityComplete(a,up.activityEvidence[a.id]);
  const fills=all.filter(a=>['choice','select-write','letter-write','find'].includes(a.type)&&done(a)).length;
  const spelling=all.filter(a=>(a.type==='spell'||a.type==='word-practice'&&a.level===4)&&done(a)),independent=spelling.filter(a=>up.activityEvidence[a.id].writingResult==='independent').length;
  const oral=all.reduce((count,a)=>count+(a.type==='word-group'||a.type==='word-practice'||a.type==='speak'?Boolean(up.activityEvidence[a.id]?.recordingId):(a.type==='reading'?Object.keys(up.activityEvidence[a.id]?.recordingIds||{}).length:0)),0);
  const book=up.activityEvidence['pea-book']||{};
  return `<p class="section-copy">原题完成 ${fills} 项 · 录音尝试 ${oral} 段 · 四会键盘写词 ${spelling.length}/17（独立 ${independent}，提示支持 ${spelling.length-independent}） · 家庭读本已看 ${book.viewedIds?.length||0}/8 幅，跟读 ${Object.keys(book.recordingIds||{}).length} 幅。</p>`;
}
function parentUpPanelV03() {
  const courses=parentUpCourses(),course=courses.find(item=>item.id===parentUpCourseId)||courses[0];
  const progress=state.up[course.id];
  const mainNodes=course.nodes.filter(node=>node.chapterId!=='book');
  const rows=course.chapters.map(chapter=>`<li><strong>${escapeHTML(chapter.title)}</strong><span>${chapter.nodeIds.filter(id=>progress.completedNodeIds.includes(id)).length}/${chapter.nodeIds.length} 任务</span></li>`).join('');
  const nodeOptions=course.nodes.map(node=>`<option value="${node.id}">${escapeHTML(node.title)}</option>`).join('');
  const selector=courses.map(item=>`<option value="${item.id}" ${item.id===course.id?'selected':''}>${escapeHTML(item.label)}</option>`).join('');
  const extra=course.id==='up3'?`<p class="section-copy">主线 ${mainNodes.filter(node=>progress.completedNodeIds.includes(node.id)).length}/5 · 家庭阅读 ${progress.completedNodeIds.includes('queen-pea')?'1':'0'}/1。录音仅表示尝试，不代表发音达标；键盘写词不等于纸上书写。</p>`:'';
  return `<section class="parent-test-panel parent-up-panel" aria-labelledby="parent-up-title"><header><div><h2 id="parent-up-title">UP 课程 · 独立进度</h2><p>切换查看对象不会改变孩子正在学习的课程；总星账本仍合并显示。</p></div><label>选择 UP<select id="parent-up-select" aria-label="选择要查看的 UP 课程">${selector}</select></label></header><h3>${escapeHTML(course.label)}</h3><ul class="parent-up-chapters">${rows}</ul><p class="section-copy">首学 ${course.stars} 星；完整复习 ${progress.review.rewardedCount}/${REVIEW_REWARD_LIMIT} 次已奖励。</p>${extra}${course.id==='up3'?up3ParentFacts(progress):''}<div class="parent-test-options"><div><span><strong>完整测试</strong><small>独立沙盒，不改正式学习记录。</small></span><button class="secondary-button" data-action="${course.testAction}" data-scenario="course">开始测试</button></div><div><span><strong>单项测试</strong><small>直接检查所选任务。</small></span><label>选择任务<select id="${course.nodeSelect}">${nodeOptions}</select></label><button class="secondary-button" data-action="${course.testAction}" data-scenario="node">进入任务</button></div><div><span><strong>复习测试</strong><small>第 1–3 次各 5 星，第 4 次无新奖励。</small></span><label>本次复习<select id="${course.reviewSelect}"><option value="1">第 1 次</option><option value="2">第 2 次</option><option value="3">第 3 次</option><option value="4">第 4 次</option></select></label><button class="secondary-button" data-action="${course.testAction}" data-scenario="review">开始测试</button></div></div></section>`;
}

function startParentTestUp2(scenario) {
  const formalState = structuredClone(stateForStorage(state));
  const sandbox = structuredClone(formalState);
  sandbox.stars = 0;
  sandbox.lifetimeStars = 0;
  sandbox.rewards = {};
  sandbox.events = [];
  sandbox.up.up2 = newUp2State();
  const nodeId = scenario === "node" ? document.querySelector("#parent-up-node-select")?.value : "";
  const reviewPass = scenario === "review" ? Number(document.querySelector("#parent-up-review-select")?.value || 1) : 1;
  if (scenario === "node") {
    const node = UP2_NODE_BY_ID.get(nodeId);
    if (!node) return;
    const chapter = UP2_CHAPTERS.find(({ id }) => id === node.chapterId);
    sandbox.up.up2.completedNodeIds = chapter.nodeIds.slice(0, chapter.nodeIds.indexOf(nodeId));
    sandbox.up.up2.activeNodeId = nodeId;
  }
  if (scenario === "review") {
    sandbox.up.up2.completedEver = true;
    sandbox.up.up2.review = normalizeReview({ active: true, runId: `up2-test-review-${reviewPass}`, completedCount: reviewPass - 1, rewardedCount: Math.min(reviewPass - 1, REVIEW_REWARD_LIMIT) });
    for (let index = 1; index < reviewPass && index <= REVIEW_REWARD_LIMIT; index += 1) {
      sandbox.rewards[`up2:review:${index}`] = 5;
      sandbox.stars += 5;
      sandbox.lifetimeStars += 5;
    }
  }
  testSession = {
    kind: "up2", formalState, formalUnitId: activeUnitId, parentUnitId,
    scenario, label: `UP2 · ${scenario === "review" ? `第 ${reviewPass} 次复习验收` : scenario === "node" ? `${UP2_NODE_BY_ID.get(nodeId).title}验收` : "完整课程验收"}`
  };
  testRecordings.clear();
  testRecordingId = 0;
  state = bindActiveUnit(sandbox);
  parentSession = true;
  screen = scenario === "node" ? "up2-node" : "up2-home";
  render();
  showToast("已进入 UP2 安全测试沙盒，真实学习记录保持不变。");
}

function startParentTestUp3(scenario) {
  const formalState=structuredClone(stateForStorage(state)),sandbox=structuredClone(formalState);
  sandbox.stars=0;sandbox.lifetimeStars=0;sandbox.rewards={};sandbox.events=[];
  sandbox.up.up3=newUp3State();
  const nodeId=scenario==='node'?document.querySelector('#parent-up3-node-select')?.value:'';
  const reviewPass=scenario==='review'?Number(document.querySelector('#parent-up3-review-select')?.value||1):1;
  if(scenario==='node') {
    const node=UP3_NODE_BY_ID.get(nodeId);if(!node)return;
    const main=UP3_NODES.filter(n=>n.chapterId!=='book');
    sandbox.up.up3.completedNodeIds=node.chapterId==='book'?[]:main.slice(0,main.findIndex(n=>n.id===nodeId)).map(n=>n.id);
    sandbox.up.up3.activeNodeId=nodeId;sandbox.up.up3.activeActivityId=node.activities[0].id;
  }
  if(scenario==='review') {
    sandbox.up.up3.completedEver=true;
    sandbox.up.up3.review=normalizeReview({active:true,runId:`up3-test-review-${reviewPass}`,
      completedCount:reviewPass-1,rewardedCount:Math.min(reviewPass-1,REVIEW_REWARD_LIMIT)});
    for(let index=1;index<reviewPass&&index<=REVIEW_REWARD_LIMIT;index++){
      sandbox.rewards[`up3:review:${index}`]=5;sandbox.stars+=5;sandbox.lifetimeStars+=5;
    }
  }
  testSession={kind:'up3',formalState,formalUnitId:activeUnitId,parentUnitId,scenario,
    label:`UP3 · ${scenario==='review'?`第 ${reviewPass} 次复习验收`:scenario==='node'?`${UP3_NODE_BY_ID.get(nodeId).title}验收`:'完整课程验收'}`};
  testRecordings.clear();testRecordingId=0;state=bindActiveUnit(sandbox);parentSession=true;
  screen=scenario==='node'?'up3-node':'up3-home';render();
  showToast('已进入 UP3 安全测试沙盒，真实学习记录保持不变。');
}

function startParentTest(scenario) {
  const unitId = UNITS[parentUnitId] ? parentUnitId : Object.keys(UNITS)[0];
  const content = UNITS[unitId];
  const stepId = scenario === "step" ? document.querySelector("#parent-test-step-select")?.value || content.steps[0].id : "";
  const reviewPass = scenario === "review" ? Number(document.querySelector("#parent-test-review-select")?.value || 1) : 1;
  const formalState = structuredClone(stateForStorage(state));
  const scenarioLabel = scenario === "course" ? "完整闯关" : scenario === "review" ? `第 ${reviewPass} 次复习验收` : `${content.steps.find(({ id }) => id === stepId)?.title || "单项"}验收`;
  const sandbox = createParentTestState(formalState, {
    unitId,
    freshAttempt: newAttempt(unitId),
    stepIds: stepIdsFor(content),
    scenario,
    stepId,
    reviewPass
  });
  testSession = {
    formalState,
    formalUnitId: activeUnitId,
    parentUnitId: unitId,
    scenario,
    label: `Unit ${content.number} · ${scenarioLabel}`
  };
  testRecordings.clear();
  testRecordingId = 0;
  state = sandbox;
  loadUnitContext(unitId);
  parentSession = true;
  screen = scenario === "step" ? stepId : "unit-home";
  render();
  showToast("已进入安全测试沙盒，正式学习记录保持不变。");
}

function discardActiveTestRecording() {
  if (recorder?.state === "recording") {
    recorder.onstop = null;
    recorder.stop();
  }
  recordingContext?.stream?.getTracks().forEach((track) => track.stop());
  recordingContext = null;
  recordingChunks = [];
  recorder = null;
}

function exitParentTest() {
  if (!testSession) return;
  stopLessonAudio();
  stopBackgroundMusic();
  discardActiveTestRecording();
  const formalState = structuredClone(testSession.formalState);
  const formalUnitId = testSession.formalUnitId;
  const selectedUnitId = testSession.parentUnitId;
  testSession = null;
  testRecordings.clear();
  testRecordingId = 0;
  state = formalState;
  loadUnitContext(formalUnitId);
  parentUnitId = selectedUnitId;
  parentSession = true;
  screen = "parent";
  returnScreen = "parent";
  render();
  showToast("测试已退出，正式学习进度、星星和记录均未改变。");
}

function renderParent() {
  syncActiveUnit();
  const wish = normalizeWish(state.wish);
  const price = wish.status === "redeemed" ? "" : wish.price || "";
  const redemption = redemptionCheck(state.wish, state.stars, state.redemptions);
  const wishName = wish.title ? escapeHTML(wish.title) : "孩子还没有填写心愿";
  const targetValue = wish.status === "redeemed" ? "" : wish.target || "";
  const targetEditable = wish.title && !["achieved", "redeemed"].includes(wish.status);
  const redemptionItems = state.redemptions.slice(-3).reverse().map((entry) => `<li><span><strong>${escapeHTML(entry.title)}</strong><small>${formatLocalTime(entry.createdAt)}</small></span><strong>${entry.targetStars} 星</strong></li>`).join("");
  const growthItems = recentEvents((event) => ["unit-complete", "review-complete", "wish-submitted", "wish-achieved", "wish-redeemed"].includes(event.type), 6);
  const {completedTasks:allSteps,totalTasks:totalSteps} = textbookProgress();
  const totalReviews = Object.values(state.units).reduce((sum, unit) => sum + normalizeReview(unit.review).rewardedCount, 0) + state.up.up3.review.rewardedCount;
  if (!UNITS[parentUnitId]) parentUnitId = "unit1";
  const selectedContent = UNITS[parentUnitId];
  const selectedUnit = state.units[parentUnitId];
  const selectedSteps = stepIdsFor(selectedContent);
  const nextStep = selectedContent.steps.find(({ id }) => !selectedUnit.attempt.tasks[id])?.title || "全部完成";
  const passedDictation = selectedContent.dictationPhraseIds.filter((id) => selectedUnit.attempt.dictation.records[id]?.passed).length;
  const dictationSummary = selectedContent.dictationPhraseIds.length
    ? `<details class="dictation-parent"><summary>Unit ${selectedContent.number} 听音默写 · ${passedDictation}/${selectedContent.dictationPhraseIds.length} 已达标</summary><ul class="dictation-results">${dictationRecordsFor(parentUnitId, selectedContent)}</ul></details>`
    : "";
  const unitCards = Object.entries(UNITS).map(([unitId, content]) => {
    const done = completedStepCount(state.units[unitId].attempt.tasks, stepIdsFor(content));
    return `<article class="parent-unit-card ${unitId === parentUnitId ? "selected" : ""}"><span>Unit ${content.number}</span><strong lang="en">${escapeHTML(content.title)}</strong><small>${escapeHTML(unitStatus(unitId))} · 本次 ${done}/${stepIdsFor(content).length}</small></article>`;
  }).join("");
  $app.innerHTML = shell(`<section class="lesson-card parent-card"><header class="parent-heading"><div><h1>家长中心</h1><p>先看全局，再查看单个 Unit；任何 Unit 都不会覆盖其他课程记录。</p></div><button class="secondary-button" data-action="back-hub">退出家长中心</button></header><div class="parent-summary" aria-label="全部课程概览"><div><span>课本累计完成任务</span><strong>${allSteps}/${totalSteps}</strong></div><div><span>UP 累计完成小节</span><strong>${upProgress().completedTasks}/${upProgress().totalTasks}</strong></div><div><span>可用 / 累计</span><strong>${state.stars} / ${state.lifetimeStars} 星</strong></div><div><span>全产品复习获奖</span><strong>${totalReviews + state.up.up2.review.rewardedCount} 次</strong></div></div><section class="parent-unit-overview"><div class="section-heading"><h2>分 Unit 状态</h2><label>查看课程<select id="parent-unit-select" aria-label="选择要查看的 Unit">${Object.entries(UNITS).map(([unitId, content]) => `<option value="${unitId}" ${unitId === parentUnitId ? "selected" : ""}>Unit ${content.number} · ${escapeHTML(content.title)}</option>`).join("")}</select></label></div><div class="parent-unit-grid">${unitCards}</div><p class="section-copy"><strong>当前查看：Unit ${selectedContent.number}</strong> · ${escapeHTML(unitStatus(parentUnitId))} · 下一任务：${escapeHTML(nextStep)}</p></section><div class="parent-columns"><section class="parent-section"><h2>心愿目标</h2><p class="section-copy"><strong>${wishName}</strong><br />${wish.status === "achieved" ? "星星已经达标，确认现实中兑现后再记录。" : "目标调整不会改变已经获得的星星。"}</p><div class="wish-target-fields"><label>兑换所需星星<input id="wish-target" name="wish-target" autocomplete="off" inputmode="numeric" type="number" min="1" max="9999" value="${targetValue}" ${targetEditable ? "" : "disabled"} /></label><label>礼物价格（可选）<input id="wish-price" name="wish-price" autocomplete="off" inputmode="decimal" type="number" min="0" max="500" step="0.01" value="${price}" ${targetEditable ? "" : "disabled"} /></label></div><div class="target-save-row"><p class="field-note">最近调整：${formatLocalTime(wish.targetUpdatedAt)}</p><button class="primary-button" data-action="save-wish-target" ${targetEditable ? "" : "disabled"}>保存目标</button></div><div class="redemption-block"><label class="safety-confirm"><input id="wish-safe" name="wish-safe" type="checkbox" />已确认礼物适龄、安全并已兑现</label><button class="secondary-button" data-action="record-redemption" ${redemption.allowed ? "" : "disabled"}>扣除星星并记录兑现</button><p>${escapeHTML(redemption.reason)}</p></div>${redemptionItems ? `<details class="redemption-history"><summary>最近兑现记录</summary><ul class="ledger-list">${redemptionItems}</ul></details>` : ""}</section><section class="parent-section"><h2>课程与设备</h2>${dictationSummary}<div class="setting-row"><span><strong>示范与提示音</strong><small>教材语音不受此开关影响</small></span><button class="secondary-button" data-action="sound-toggle">${state.settings.sound ? "已开启" : "已关闭"}</button></div><div class="setting-row"><span><strong>背景音乐</strong><small>播放教材语音和录音时会自动降低</small></span><button class="secondary-button" data-action="music-toggle">${state.settings.music ? "已开启" : "已关闭"}</button></div><div class="setting-row"><span><strong>家长密码</strong><small>6–32 位，需同时包含字母和数字</small></span><button class="secondary-button" data-action="change-parent-password">修改密码</button></div><details class="parent-growth"><summary>最近成长足迹</summary>${eventRows(growthItems, "完整成长足迹从本次升级开始记录。")}</details></section></div><details class="danger-zone"><summary>更换使用者</summary><div class="danger-actions"><button class="danger-strong" data-action="request-factory-reset">恢复产品初始状态</button></div><p>自由复习不会删除历史。只有更换使用者时，才在这里经过双重确认清空全部个人数据。</p></details><p id="parent-feedback" class="feedback" role="status"></p></section>`);
  document.querySelector(".parent-unit-overview")?.insertAdjacentHTML("afterend", parentTestPanel(selectedContent));
  document.querySelector(".parent-test-panel")?.insertAdjacentHTML("afterend", parentUpPanelV03());
  document.querySelector(".parent-growth")?.insertAdjacentHTML("beforebegin", parentDevicePanel());
}

function renderUpWorld() {
  const up = state.up.up2;
  const done = up.completedNodeIds.length;
  const up3=state.up.up3,up3MainTotal=UP3_NODES.filter(node=>node.chapterId!=='book').length,done3=up3.completedNodeIds.filter(id=>id!=='queen-pea').length;
  const progressPercent = upProgress().percent;
  const up2Action = up.review.active ? "继续复习" : up.completedEver ? "已完成，可复习" : done ? "继续学习" : "进入学习";
  const up3Action = up3.review.active ? "继续复习" : up3.completedEver ? "已完成，可复习" : done3 ? "继续学习" : "进入学习";
  $app.innerHTML = `<main class="world-screen immersive-world up-world" aria-label="UP 课程世界">
    ${worldHeader('up')}
    <section class="world-scene up-world-scene" aria-label="麒宝和布布的 UP 课程地图">
      <div class="scene-accessible-copy"><h1>UP 课程世界</h1><p>UP 2 已完成 ${done}/${UP2_NODES.length} 小节；UP 3 主线已完成 ${done3}/${up3MainTotal} 任务；UP 4 待更新；UP 总进度 ${progressPercent}%。</p></div>
      ${worldProgress("UP 总进度", upProgress())}
      <button class="up-map-sign up-map-two" data-action="open-up2" aria-label="打开 UP 2 Creature Features，动物的本领，${up2Action}，已完成 ${done}/${UP2_NODES.length} 小节"><strong>UP 2</strong><small>动物的本领</small><span>${up2Action}</span></button>
      <button class="up-map-sign up-map-three" data-action="open-up3" aria-label="打开 UP 3 Team Up，${up3Action}，主线已完成 ${done3}/${up3MainTotal} 任务"><strong>UP 3</strong><small>Team Up!</small><span>${up3Action}</span></button>
      <button class="up-map-sign up-map-four" disabled aria-label="UP 4 待更新"><strong>UP 4</strong><span>待更新</span></button>
    </section>
    <nav class="course-portrait-panel up-portrait-panel" aria-label="竖屏 UP 课程导航">
      <header><strong>继续学习</strong></header>
      <button class="portrait-unit-card" data-action="open-up2"><span>UP 2</span><strong>动物的本领</strong><small>${up2Action} · ${done}/${UP2_NODES.length} 小节</small></button>
      <button class="portrait-unit-card" data-action="open-up3"><span>UP 3</span><strong>Team Up!</strong><small>${up3Action} · 主线 ${done3}/${up3MainTotal}</small></button>
      <button class="portrait-unit-card portrait-coming-card" disabled aria-label="UP 4 待更新"><span>UP 4</span><strong>待更新</strong></button>
      <button class="primary-button portrait-primary" data-action="open-up3">进入 UP 3</button>
    </nav>
  </main>`;
}

function readingPageRewardKey(bookId, pageId) { return `reading:${bookId}:page:${pageId}`; }
function readingBookScore(book) {
  return book.spreads.flatMap(item => item.pages).filter(pageItem => state.rewards[readingPageRewardKey(book.id, pageItem.id)]).length;
}
function settleReadingView(book) {
  const run = state.reading.books[book.id];
  const spreadItem = book.spreads[run.spreadIndex];
  if (!run.viewedSpreadIds.includes(spreadItem.id)) run.viewedSpreadIds.push(spreadItem.id);
  const visiblePages = readingUsesSinglePage() ? [spreadItem.pages[Math.min(readingPortraitSide,spreadItem.pages.length-1)]] : spreadItem.pages;
  let earned = 0;
  for (const pageItem of visiblePages) {
    const before = state.stars;
    state = grantMilestone(state, readingPageRewardKey(book.id, pageItem.id), 1, {
      type: "stars-earned", unitId: `reading:${book.id}`, title: "课外阅读 · 阅读一页", detail: `${book.title} · 第一次读到这一页`
    });
    earned += state.stars - before;
  }
  const currentRun = state.reading.books[book.id];
  if (!book.semantic && currentRun.spreadIndex === book.spreads.length - 1 && (!readingUsesSinglePage() || readingPortraitSide === spreadItem.pages.length-1) && !currentRun.reachedEndAt) currentRun.reachedEndAt = Date.now();
  return earned;
}

function readingBookCard(book) {
  const progress = state.reading.books[book.id];
  const viewed = progress.viewedSpreadIds.length;
  const totalPages = book.spreads.flatMap(item=>item.pages).length;
  const score = readingBookScore(book);
  const status = progress.reachedEndAt ? `读完一遍 · ${score}/${totalPages} 星` : viewed ? `继续阅读 · ${score}/${totalPages} 星` : "开始阅读";
  return `<button class="reading-book-card" data-action="open-reading-book" data-book-id="${book.id}" aria-label="打开 ${escapeHTML(book.title)}，${book.genre}，${status}">
    <span class="reading-book-cover"><img src="${book.cover}" alt="" draggable="false"></span>
    <span class="reading-book-copy"><strong lang="en">${escapeHTML(book.title)}</strong><small lang="en">${escapeHTML(book.genre)}</small><b>${status}</b></span></button>`;
}

function renderReadingWorld() {
  const summary = readingProgress(state.reading);
  $app.innerHTML = `<main class="world-screen immersive-world reading-world" aria-label="课外阅读世界">
    ${worldHeader('reading')}
    <section class="world-scene reading-world-scene" aria-label="麒宝和布布的课外阅读图书馆">
      <div class="scene-accessible-copy"><h1>课外阅读</h1><p>进入图书馆，从 ${READING_BOOKS.length} 本英文读物中选择一本。</p></div>
      <button class="reading-library-entrance" data-action="open-reading-library" aria-label="进入课外阅读图书馆，当前有 ${READING_BOOKS.length} 本读物"><strong>课外阅读</strong><span>进入图书馆</span></button>
      ${worldProgress("课外阅读进度", summary, "本")}
    </section>
    <nav class="course-portrait-panel reading-portrait-panel" aria-label="竖屏课外阅读导航">
      <header><strong>课外阅读</strong><small>${READING_BOOKS.length} 本读物</small></header>
      <button class="primary-button portrait-primary" data-action="open-reading-library">进入图书馆</button>
    </nav>
  </main>`;
}

function renderReadingLibrary() {
  $app.innerHTML = `<main class="world-screen immersive-world reading-library-world" aria-label="课外阅读图书馆">
    ${worldHeader('reading')}
    <section class="reading-library-scene">
      <div class="reading-library-panel"><header><button class="reading-library-back" data-action="back-reading-world">返回课外阅读</button><div><p>English Reading</p><h1>选择一本书</h1></div><strong>${READING_BOOKS.length} 本读物</strong></header>
        <div class="reading-book-grid">${[...READING_BOOKS.filter(book=>book.semantic),...READING_BOOKS.filter(book=>!book.semantic)].map(readingBookCard).join("")}</div>
        <p class="reading-library-note">选一本书，听一听，再跟着读。</p>
      </div>
    </section>
  </main>`;
}

function readingUsesSinglePage() {
  return window.matchMedia?.("(orientation: portrait), (max-width: 720px)").matches ?? false;
}

function readingPageMarkup(book, pageItem, side, layout) {
  const recordingId = state.reading.books[book.id].recordingIds[pageItem.id];
  const compact = pageItem.text.length > 145 ? " reading-page-copy--compact" : "";
  const mediaClass = layout === "shared" ? " reading-mobile-media" : "";
  return `<article class="reading-page reading-page--${side}" data-page-id="${pageItem.id}">
    <div class="reading-page-media${mediaClass}" style="--reading-image:url('${pageItem.imageSrc}')"><img src="${pageItem.imageSrc}" alt="" draggable="false" style="object-position:${pageItem.imagePosition}"></div>
    <div class="reading-page-copy${compact}">
      <p lang="en">${escapeHTML(pageItem.text)}</p>
      ${readingPageActionsMarkup(book,pageItem,recordingId)}
    </div>
  </article>`;
}

function renderReadingBook() {
  const book = READING_BOOK_BY_ID.get(activeReadingBookId);
  if (!book) { screen = "reading-library"; renderReadingLibrary(); return; }
  const run = state.reading.books[book.id];
  if (book.semantic) { $app.innerHTML = semanticReadingMarkup(book,run,readingBookScore(book),{returnToQuestion:readingFromQuestion,turnDirection:readingTurnDirection}); return; }
  const spreadIndex = Math.min(book.spreads.length - 1, Math.max(0, run.spreadIndex));
  const spreadItem = book.spreads[spreadIndex];
  const [leftPage, rightPage] = spreadItem.pages;
  const singleClass = readingPortraitSide ? " reading-single-right" : " reading-single-left";
  const sharedMedia = spreadItem.layout === "shared" ? `<div class="reading-shared-media" style="--reading-image:url('${spreadItem.imageSrc}')"><img src="${spreadItem.imageSrc}" alt="" draggable="false"></div>` : "";
  const previousDisabled = spreadIndex === 0 && readingPortraitSide === 0;
  const finalPage = spreadIndex === book.spreads.length - 1 && (!readingUsesSinglePage() || readingPortraitSide === 1);
  $app.innerHTML = `<main class="reading-reader-world${singleClass} reading-turn-${readingTurnDirection}" aria-label="${escapeHTML(book.title)} 电子书">
    ${readingToolbarMarkup(book,spreadIndex,readingBookScore(book))}
    <section class="reading-book-stage">
      <button class="reading-turn-button reading-turn-button--previous" data-action="previous-reading-page" ${previousDisabled ? "disabled" : ""} aria-label="上一页">‹</button>
      <div class="reading-book-spread reading-book-spread--${spreadItem.layout}" data-spread-id="${spreadItem.id}">
        ${sharedMedia}
        ${readingPageMarkup(book, leftPage, "left", spreadItem.layout)}
        ${readingPageMarkup(book, rightPage, "right", spreadItem.layout)}
        <div class="reading-book-gutter" aria-hidden="true"></div>
      </div>
      <button class="reading-turn-button reading-turn-button--next" data-action="${finalPage ? "finish-reading-book" : "next-reading-page"}" aria-label="${finalPage ? "读完并返回书架" : "下一页"}">${finalPage ? "✓" : "›"}</button>
    </section>
    <footer class="reading-reader-footer"><span>${spreadIndex === 0 ? "从故事开始" : "可以往前翻"}</span><strong>${finalPage ? "读完了，回到书架" : "翻到下一页"}</strong></footer>
    <p id="feedback" class="reading-feedback" role="status"></p>
  </main>`;
}

function renderReadingQuestions() {
  const book=READING_BOOK_BY_ID.get(activeReadingBookId);
  if(!book?.questions?.length){screen='reading-library';renderReadingLibrary();return;}
  $app.innerHTML=semanticReadingMarkup(book,state.reading.books[book.id],readingBookScore(book),{questionIndex:readingQuestionIndex,referenceOpen:readingReferenceOpen});
}

function renderUp2Home() { $app.innerHTML = shell(up2HomeMarkup(state.up.up2)); }

function up2Evidence(activity) { return up2EvidenceFor(activity,state.up.up2.activityEvidence); }


function renderUp2Node() {
  const up = state.up.up2, node = UP2_NODE_BY_ID.get(up.activeNodeId);
  if (!node) { screen = "up2-home"; renderUp2Home(); return; }
  const activity = node.activities[up.activityIndex], evidence = up2Evidence(activity);
  const art = up2SceneFor(activity, evidence);
  $app.innerHTML = shell(`<section class="lesson-card stage-shell up2-stage"><div class="lesson-toolbar"><button class="text-button" data-action="back-up2-home">返回 UP2 任务</button><span>${escapeHTML(node.title)} · ${up.activityIndex+1}/${node.activities.length}</span></div><div class="progress" role="progressbar" aria-label="当前小节进度" aria-valuemin="0" aria-valuemax="${node.activities.length}" aria-valuenow="${up.activityIndex}">${node.activities.map((a,i)=>`<span class="${isUp2ActivityComplete(a,up.activityEvidence[a.id])?'done':i===up.activityIndex?'active':''}"></span>`).join('')}</div><div class="up-learning-workspace ${art?'has-scene':''}">${art?`<aside class="up-learning-scene">${up2ArtMarkup(art)}</aside>`:''}<article class="stage-task"><p class="word-banner">UP 2 · ${escapeHTML(node.title)}</p>${up2ActivityMarkup(activity,evidence)}<p id="feedback" class="feedback" role="status">${escapeHTML(evidence.feedback||'')}</p>${up2HideWordHelp(activity,evidence)?'':up2WordHelp(activity.supportIds||node.supportIds)}</article></div></section>`);
}

function renderUp2Complete() {
  const up = state.up.up2;
  $app.innerHTML = shell(`<section class="lesson-card completion"><div class="star-burst">完成</div><p class="eyebrow">UP2 · Creature Features</p><h1>动物的本领</h1><p class="lead">十个学习节点都走过了。你读了雨天故事，也知道 Ray 的尾巴能帮助朋友。</p><div class="completion-reward"><strong>${state.stars} 星</strong><span>UP2 完整复习已奖励 ${up.review.rewardedCount}/${REVIEW_REWARD_LIMIT} 次</span></div><div class="utility-row"><button class="primary-button" data-action="back-up2-home">查看 UP2 任务</button><button class="secondary-button" data-action="open-up-world">返回 UP 主页</button></div></section>`);
}

function up3CurrentActivity() {const up=state.up.up3;return UP3_NODE_BY_ID.get(up.activeNodeId)?.activities[up.activityIndex]||null;}
function renderUp3Home() {$app.innerHTML=shell(up3HomeMarkup(state.up.up3));}
function renderUp3Node() {
  const up=state.up.up3,node=UP3_NODE_BY_ID.get(up.activeNodeId);
  if(!node){screen='up3-home';renderUp3Home();return;}
  const activity=node.activities[up.activityIndex],evidence=up.activityEvidence[activity.id]||{};
  if(activity.type==='book') {
    const single=window.matchMedia('(orientation: portrait)').matches;
    const spread=Math.max(0,Math.min(3,evidence.spreadIndex||0)),side=Math.max(0,Math.min(1,evidence.side||0));
    const visible=single?[activity.scenes[spread*2+side]]:activity.scenes.slice(spread*2,spread*2+2);
    const viewedIds=[...new Set([...(evidence.viewedIds||[]),...visible.map(scene=>scene.id)])];
    if(viewedIds.length!==(evidence.viewedIds||[]).length){up.activityEvidence[activity.id]={...evidence,viewedIds};if(!saveState())return;}
    $app.innerHTML=shell(up3BookMarkup(activity,up.activityEvidence[activity.id]||evidence,single));return;
  }
  const art=up3SceneFor(activity,evidence);
  const pages=node.activities.filter(a=>a.type==='reading');
  const position=activity.itemNumber?`第 ${activity.itemNumber}/${activity.itemCount} 题`:node.id==='fish-reading'&&activity.type==='reading'?`第 ${pages.findIndex(a=>a.id===activity.id)+1}/${pages.length} 页`:activity.type==='word-practice'?'词语练习':activity.type==='spell'?'拼写练习':`${up.activityIndex+1}/${node.activities.length}`;
  $app.innerHTML=shell(`<section class="lesson-card stage-shell up2-stage up3-stage"><div class="lesson-toolbar"><button class="text-button" data-action="back-up3-home">返回 UP3 任务</button><span>${escapeHTML(node.title)} · ${position}</span></div><div class="progress" role="progressbar" aria-label="当前小节进度" aria-valuemin="0" aria-valuemax="${node.activities.length}" aria-valuenow="${up.activityIndex}">${node.activities.map((a,i)=>`<span class="${isUp3ActivityComplete(a,up.activityEvidence[a.id])?'done':i===up.activityIndex?'active':''}"></span>`).join('')}</div><div class="up-learning-workspace ${art?'has-scene':''}">${art?`<aside class="up-learning-scene">${up3ArtMarkup(art)}</aside>`:''}<article class="stage-task"><p class="word-banner">UP 3 · ${escapeHTML(node.title)}</p>${up3ActivityMarkup(activity,evidence)}<p id="feedback" class="feedback" role="status">${escapeHTML(evidence.feedback||'')}</p>${up3WordHelp(up3HelpIds(activity,evidence))}</article></div></section>`);
}
function renderUp3Complete() {
  const up=state.up.up3;
  $app.innerHTML=shell(`<section class="lesson-card completion"><div class="star-burst">完成</div><p class="eyebrow">UP3 · Team Up!</p><h1>读完故事，也认识鱼群的合作</h1><div class="completion-reward"><strong>${state.stars} 星</strong><span>UP3 完整复习已奖励 ${up.review.rewardedCount}/${REVIEW_REWARD_LIMIT} 次</span></div><div class="utility-row"><button class="primary-button" data-action="back-up3-home">查看 UP3 任务</button><button class="secondary-button" data-action="open-up-world">返回 UP 主页</button></div></section>`);
}

function render() {
  stopLessonAudio();
  if (testSession && ["course", "parent", "wish", "growth"].includes(screen)) screen = testSession.kind === "up2" ? "up2-home" : testSession.kind === "up3" ? "up3-home" : "unit-home";
  if (screen.startsWith("reading")) {
    ({ "reading-world": renderReadingWorld, "reading-library": renderReadingLibrary, "reading-book": renderReadingBook, "reading-questions":renderReadingQuestions }[screen] || renderReadingWorld)();
    return;
  }
  if (screen.startsWith("up")) {
    ({ "up-world": renderUpWorld, "up2-home": renderUp2Home, "up2-node": renderUp2Node, "up2-complete": renderUp2Complete,
       "up3-home":renderUp3Home,"up3-node":renderUp3Node,"up3-complete":renderUp3Complete }[screen] || renderUpWorld)();
    return;
  }
  const lessonScreens = new Set([...stepIdsFor(), "dictation", "sentences", "dialogue", "transfer", "application"]);
  if (lessonScreens.has(screen) && !stepIsOpen(stageForScreen(screen))) screen = "unit-home";
  ({ course: renderCourse, "unit-home": renderUnitHome, words: renderWords, listening: renderListening, story: renderStory, application:renderPractice, sentences: renderSentences, dialogue: renderDialogue, transfer: renderTransfer, dictation: renderDictation, song: renderSong, project: renderProject, complete: renderComplete, wish: renderWish, growth: renderGrowth, parent: renderParent }[screen] || renderCourse)();
}

async function startBackgroundMusic() {
  if (!state.settings.music || document.hidden) return;
  musicStarted = true;
  backgroundMusic.volume = MUSIC_VOLUME;
  try { await backgroundMusic.play(); } catch {}
}
function stopBackgroundMusic() { backgroundMusic.pause(); }
function duckBackgroundMusic() { if (!backgroundMusic.paused) backgroundMusic.volume = MUSIC_DUCKED_VOLUME; }
function restoreBackgroundMusic() { if (!backgroundMusic.paused) backgroundMusic.volume = MUSIC_VOLUME; }
function stopLessonAudio() {
  audioSequenceToken += 1;
  const cancel = activeLessonCancel;
  activeLessonCancel = null;
  window.speechSynthesis?.cancel();
  const playback = activeLessonAudio;
  activeLessonAudio = null;
  if (playback) {
    playback.onended = playback.onerror = playback.onpause = null;
    playback.pause();
    playback.currentTime = 0;
  }
  if (activeLessonObjectUrl) URL.revokeObjectURL(activeLessonObjectUrl);
  activeLessonObjectUrl = "";
  cancel?.(); // Cancellation restores controls, but never supplies completion evidence.
}
function say(text, audioSrc = "", onEnded = null, onFailed = null) {
  if (!audioSrc && !state.settings.sound) return;
  stopLessonAudio();
  if (audioSrc) {
    const resumeMusic = musicStarted && !backgroundMusic.paused;
    stopBackgroundMusic();
    const playback = new Audio(audioSrc);
    activeLessonAudio = playback;
    let settled = false;
    const finish = () => {
      if (settled || activeLessonAudio !== playback) return false;
      settled = true;
      playback.onended = playback.onerror = playback.onpause = null;
      playback.pause();
      activeLessonAudio = null; activeLessonCancel = null;
      if (resumeMusic) startBackgroundMusic();
      return true;
    };
    activeLessonCancel = () => { if (!settled) { settled = true; onFailed?.(); } };
    playback.preload = "auto";
    playback.volume = 1;
    playback.onended = () => { if(finish()) onEnded?.(); };
    const fail = () => { if(!finish())return; announce("声音没有播放，请再点一次。", true); onFailed?.(); };
    playback.onerror = fail;
    playback.onpause = () => { if(!playback.ended)fail(); };
    playback.play().catch(fail);
    return;
  }
  if (!text || !window.speechSynthesis) return;
  duckBackgroundMusic();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = .72;
  utterance.onend = restoreBackgroundMusic;
  utterance.onerror = restoreBackgroundMusic;
  window.speechSynthesis.speak(utterance);
}
function playCue(kind = "success") {
  if (!state.settings.sound || !window.AudioContext) return;
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = kind === "retry" ? 392 : 659;
    gain.gain.setValueAtTime(.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.05, context.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .2);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .21);
  } catch {}
}
function playSceneAudio(scene, onEnded = null, onFailed = null) {
  stopLessonAudio();
  const token = audioSequenceToken;
  const resumeMusic = musicStarted && !backgroundMusic.paused;
  stopBackgroundMusic();
  let index = 0;
  let settled = false;
  activeLessonCancel = () => { if(!settled) {settled=true;onFailed?.();} };
  const finish = (failed=false) => {
    if(settled || token!==audioSequenceToken)return;
    settled=true;
    if(activeLessonAudio) { activeLessonAudio.onended=activeLessonAudio.onerror=activeLessonAudio.onpause=null;activeLessonAudio.pause(); }
    activeLessonAudio=null;activeLessonCancel=null;
    if(resumeMusic)startBackgroundMusic();
    if(failed) {announce("声音没有播放，请再点一次。",true);onFailed?.();} else onEnded?.();
  };
  const fail = () => finish(true);
  const next = () => {
    if (settled || token !== audioSequenceToken) return;
    if (index >= scene.lines.length) { finish(); return; }
    const playback = new Audio(scene.lines[index].audioSrc);
    activeLessonAudio = playback;
    playback.preload = "auto";
    playback.volume = 1;
    playback.onended = () => { if(settled||token!==audioSequenceToken)return;playback.onended=playback.onerror=playback.onpause=null;index += 1; setTimeout(next, 260); };
    playback.onerror = fail;
    playback.onpause = () => {if(!playback.ended)fail();};
    playback.play().catch(fail);
  };
  next();
}
function announce(text, warning = false) {
  const element = document.querySelector("#feedback");
  if (!element) return;
  element.textContent = text;
  element.classList.toggle("warn", warning);
}

function rewardDetail(stage, itemId) {
  if (["words", "dictation"].includes(stage)) return phraseById.get(itemId)?.text || "核心词组";
  if (stage === "sentences") return UNIT_SENTENCES.find(({ id }) => id === itemId)?.text || "故事跟读";
  if (stage === "dialogue") return UNIT_DIALOGUES.find(({ id }) => id === itemId)?.title || "故事对话";
  if (stage === "transfer") return UNIT_TRANSFERS.find(({ id }) => id === itemId)?.prompt || "故事表达";
  if (stage === "listening") return "教材听力选图";
  if (stage === "song") return activeContent.song?.title || "教材歌谣";
  if (stage === "project") return activeContent.projectTitle || "My tidy room";
  return "学习任务";
}

function awardItem(stage, itemId) {
  const before = state.stars;
  const stageTitles = { words: "词组练习", listening: "听力挑战", sentences: "故事听说 · 逐句跟读", dialogue: "故事听说 · 对话接力", transfer: "故事听说 · 看图表达", dictation: "听音默写", song: "歌谣唱读", project: "小小实践" };
  state = grantMilestone(state, `${activeUnitId}:${stage}:${itemId}`, UNIT_REWARD_RULES[stage], {
    type: "stars-earned", unitId: activeUnitId, title: stageTitles[stage] || "学习奖励", detail: `${unitLabel()} · ${rewardDetail(stage, itemId)}`
  });
  return state.stars - before;
}

function completeStep(step, evidence = {}) {
  if (!stepIsOpen(step)) return false;
  const stepIds = stepIdsFor();
  const wasComplete = stepIds.every((item) => state.attempt.tasks[item]);
  state.attempt.tasks[step] = true;
  state.attempt[step] = { ...state.attempt[step], ...evidence };
  if (!wasComplete && stepIds.every((item) => state.attempt.tasks[item])) {
    syncActiveUnit();
    state = bindActiveUnit(settleProductUnitRun(state, activeUnitId, activeContent.number));
  }
  milestoneMessage = "";
  lastCompletedStep = step;
  setTimeout(() => { lastCompletedStep = ""; }, 1200);
  if(!saveState())return false;
  playCue();
  return true;
}

function restartUnit() {
  if (completedStepCount(state.attempt.tasks, stepIdsFor()) && !window.confirm(`${state.completedEver ? "开始一次完整复习" : "重新开始本次学习"}？已经获得的星星会保留。`)) return;
  if (state.completedEver) {
    syncActiveUnit();
    state = bindActiveUnit(startProductUnitReview(state, activeUnitId, newAttempt()));
  } else {
    state.attempt = newAttempt();
  }
  if (!saveState()) return;
  milestoneMessage = "";
  screen = stepIdsFor()[0];
  render();
}

async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("qibao-unit1-media-v01", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("recordings", { keyPath: "id", autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function storeRecording(blob, meta) {
  if (testSession) {
    const id = -(++testRecordingId);
    testRecordings.set(String(id), { id, blob, createdAt: Date.now(), pinned: false, unit: activeUnitId, ...meta });
    return id;
  }
  const database = await openDatabase();
  const id = await new Promise((resolve, reject) => {
    const transaction = database.transaction("recordings", "readwrite");
    const request = transaction.objectStore("recordings").add({ blob, createdAt: Date.now(), pinned: false, unit: activeUnitId, ...meta });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return id;
}
async function listRecordings() {
  if (testSession) return [...testRecordings.values()];
  const database = await openDatabase();
  const records = await new Promise((resolve, reject) => {
    const request = database.transaction("recordings", "readonly").objectStore("recordings").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return records;
}
async function playSavedRecording(id) {
  stopLessonAudio();
  const token=audioSequenceToken;
  const record = (await listRecordings()).find((item) => String(item.id) === String(id));
  if(token!==audioSequenceToken || document.hidden)return;
  if (!record?.blob) { announce("这条录音已经清除。", true); return; }
  const url = URL.createObjectURL(record.blob);
  const release = () => {
    if (activeLessonObjectUrl === url) activeLessonObjectUrl = "";
    URL.revokeObjectURL(url);
  };
  say("",url,release,release);
  activeLessonObjectUrl = url;
}
async function deleteRecordings(unitId = "") {
  if (testSession) {
    for (const [id, record] of testRecordings) if (!unitId || record.unit === unitId) testRecordings.delete(id);
    return;
  }
  const database = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction("recordings", "readwrite");
    const cursor = transaction.objectStore("recordings").openCursor();
    cursor.onsuccess = () => {
      const current = cursor.result;
      if (!current) return;
      const inScope = !unitId || current.value.unit === unitId;
      if (inScope) current.delete();
      current.continue();
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}
async function validateRecordingEvidence() {
  const records = await listRecordings();
  let changed = false;
  syncActiveUnit();
  for (const [unitId, content] of Object.entries(UNITS)) {
    const validIds = new Set(records.filter((record) => (record.unit || "unit1") === unitId).map(({ id }) => String(id)));
    const unit = state.units[unitId];
    const result = reconcileRecordingProgress(unit.attempt, validIds, {
      sentences: content.sentences.map(({ id }) => id),
      dialogue: content.dialogueGroups.map(({ id }) => id),
      transfer: content.transferTasks.map(({ id }) => id)
    });
    const checked = result.attempt;
    for (const kind of ["song", "project"]) {
      for (const [itemId, recordId] of Object.entries(checked[kind]?.recordingIds || {})) {
        if (!validIds.has(String(recordId))) delete checked[kind].recordingIds[itemId];
      }
    }
    if (unitId === "unit2") {
      checked.tasks.sentences = Boolean(content.sentences.length && content.sentences.every(({ id }) => checked.sentences.recordingIds[id]));
      checked.tasks.dialogue = Boolean(content.dialogueGroups.length && content.dialogueGroups.every(({ id }) => checked.dialogue.recordingIds[id]));
      checked.tasks.transfer = Boolean(content.transferTasks.length && content.transferTasks.every(({ id }) => checked.transfer.recordingIds[id]));
      checked.tasks.story = Boolean(checked.tasks.sentences && checked.tasks.dialogue && checked.tasks.transfer);
      checked.tasks.song = Boolean(checked.song?.listened && checked.song?.recordingIds?.song);
      const projectReady = (content.projectItems || []).every(({ id, answer }) => checked.project?.placements?.[id] === answer);
      checked.tasks.project = Boolean(projectReady && checked.project?.recordingIds?.project);
    }
    if(content.practiceStages) {
      for(const [id,recordId] of Object.entries(checked.practice.recordingIds)) {
        if(!validIds.has(String(recordId)))delete checked.practice.recordingIds[id];
      }
      for(const [stage,activities] of Object.entries(content.practiceStages)) {
        const task=stage==="application"?"words":stage;
        if(checked.tasks[task]&&!activities.every(a=>practiceReady(a,checked.practice.evidence[a.id],checked.practice.recordingIds[a.id]))) checked.tasks[task]=false;
        const missing=activities.findIndex(a=>!practiceReady(a,checked.practice.evidence[a.id],checked.practice.recordingIds[a.id]));
        if(missing>=0&&(checked.practice.indices[stage]||0)>missing)checked.practice.indices[stage]=missing;
      }
      if(!content.practiceStages.song&&checked.tasks.song&&!checked.song.recordingIds.song)checked.tasks.song=false;
      if(content.projectType==='bookmark'&&checked.tasks.project&&(!bookmarkReady(checked.project)||!checked.project.recordingIds.project))checked.tasks.project=false;
    }
    if (JSON.stringify(checked) === JSON.stringify(unit.attempt)) continue;
    state.units[unitId] = { ...unit, attempt: checked };
    changed = true;
  }
  const upRecordingIds = new Set(records.filter((record) => record.unit === "up2").map(({ id }) => String(id)));
  for (const evidence of Object.values(state.up.up2.activityEvidence)) {
    for (const field of ['recordingId','contextRecordingId']) {
      if (evidence[field] && !upRecordingIds.has(String(evidence[field]))) {delete evidence[field];changed=true;}
    }
    for(const field of ['lineRecordings','wordRecordings'])for(const [id,value] of Object.entries(evidence[field]||{})) {
      if(!upRecordingIds.has(String(value))){delete evidence[field][id];changed=true;}
    }
  }
  const up3RecordingIds=new Set(records.filter(record=>record.unit==='up3').map(({id})=>String(id)));
  let up3EvidenceChanged=false;
  for(const evidence of Object.values(state.up.up3.activityEvidence)) {
    if(evidence.recordingId&&!up3RecordingIds.has(String(evidence.recordingId))){delete evidence.recordingId;changed=true;up3EvidenceChanged=true;}
    for(const [lineId,value] of Object.entries(evidence.recordingIds||{})) {
      if(!up3RecordingIds.has(String(value))){delete evidence.recordingIds[lineId];changed=true;up3EvidenceChanged=true;}
    }
  }
  if(up3EvidenceChanged)state.up.up3=normalizeUp3State(state.up.up3);
  for (const book of READING_BOOKS) {
    const validIds = new Set(records.filter(record => record.unit === `reading:${book.id}`).map(({ id }) => String(id)));
    const run = state.reading.books[book.id];
    for (const [pageId, recordId] of Object.entries(run.recordingIds)) {
      if (!validIds.has(String(recordId))) { delete run.recordingIds[pageId]; changed = true; }
    }
  }
  if (!changed) return false;
  bindActiveUnit(state);
  saveState();
  render();
  return true;
}

function practiceRecordingSelection() {
  const {activity,run}=currentPractice();
  const evidence=run?.evidence?.[activity?.id]||{};
  if(activity?.type==='role-play')return JSON.stringify([activity.id,evidence.choice]);
  if(activity?.type==='scene-log')return JSON.stringify([activity.id,[...(evidence.selectedIds||[])].sort(),evidence.secondaryChoice||null]);
  if(activity?.type==='speak-choice')return JSON.stringify([activity.id,evidence.choice]);
  return null;
}
async function beginRecording(button) {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { announce("这台设备暂时不能录音。", true); return; }
  const requestedUnit=activeUnitId,requestedScreen=screen;
  const requestedBookId=button.dataset.recordKind==='reading'?button.dataset.bookId:"";
  const readingItemIsCurrent=()=>{
    const book=READING_BOOK_BY_ID.get(requestedBookId);
    return activeReadingBookId===requestedBookId && (screen==='reading-book'
      ? book?.spreads[state.reading.books[book.id].spreadIndex].pages.some(p=>p.id===button.dataset.itemId)
      : screen==='reading-questions' && book?.questions?.[readingQuestionIndex]?.id===button.dataset.itemId);
  };
  if(requestedBookId && !readingItemIsCurrent())return;
  const requestedSelection=button.dataset.recordKind==='practice'?practiceRecordingSelection():null;
  const up3Position=()=>{const a=up3CurrentActivity(),e=state.up.up3.activityEvidence[a?.id]||{};return `${a?.id}/${e.phase||0}/${e.stepIndex||0}/${e.spreadIndex||0}/${e.side||0}`;};
  const requestedUp3Position=button.dataset.recordKind==='up3'?up3Position():null;
  if(requestedUp3Position!==null&&(screen!=='up3-node'||up3CurrentActivity()?.id!==button.dataset.itemId||!canRecordUp3(up3CurrentActivity(),state.up.up3.activityEvidence[button.dataset.itemId],button.dataset.recordLine)))return;
  if(button.dataset.recordKind==="practice") {
    const {activity,run}=currentPractice(),e=run?.evidence?.[activity?.id]||{};
    if(!activity||activity.id!==button.dataset.itemId||!practiceCanRecord(activity,e))return;
    run.evidence[activity.id]={...e,hint:false};
  }
  if(button.dataset.recordKind==="project"&&activeContent.projectType==="bookmark")state.attempt.project.hintLevel=0;
  stopLessonAudio();
  stopBackgroundMusic();
  resumeMusicAfterRecording = musicStarted;
  try {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    } catch (error) {
      if (!["OverconstrainedError", "TypeError"].includes(error?.name)) throw error;
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    if(activeUnitId!==requestedUnit||screen!==requestedScreen||(requestedBookId&&!readingItemIsCurrent())) {stream.getTracks().forEach(track=>track.stop());return;}
    if(requestedSelection!==null&&requestedSelection!==practiceRecordingSelection()) {stream.getTracks().forEach(track=>track.stop());render();return;}
    document.querySelectorAll('.project-sentence-frame').forEach(node=>node.remove());
    recordingChunks = [];
    recordingStartedAt = Date.now();
    if (button.dataset.recordKind === "up2" && (screen !== "up2-node" || up2CurrentActivity()?.id !== button.dataset.itemId)) { stream.getTracks().forEach(track=>track.stop()); return; }
    if (button.dataset.recordKind === "up3" && (screen !== "up3-node" || up3CurrentActivity()?.id !== button.dataset.itemId || requestedUp3Position!==up3Position())) { stream.getTracks().forEach(track=>track.stop()); return; }
    recordingContext = { kind: button.dataset.recordKind, itemId: button.dataset.itemId, lineId:button.dataset.recordLine, unitId:requestedUnit, bookId:requestedBookId, selection:requestedSelection, stream };
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (event) => recordingChunks.push(event.data);
    recorder.onstop = finishRecording;
    recorder.start();
    button.textContent = "结束录音";
    button.dataset.action = "stop-record";
    announce("布布在听。慢慢说。", false);
  } catch {
    announce(button.dataset.recordKind === "reading" ? "没有开启麦克风，也可以继续阅读。" : "需要开启麦克风，才能完成这一项。", true);
    if (resumeMusicAfterRecording) startBackgroundMusic();
  }
}
function stopRecording() { if (recorder?.state === "recording") recorder.stop(); }
function cancelRecording() {
  if (recorder?.state !== "recording") return;
  if (recordingContext) recordingContext.cancelled = true;
  recorder.stop();
}
async function finishRecording() {
  const context = recordingContext;
  if (!context) return;
  const duration = Date.now() - recordingStartedAt;
  const blob = new Blob(recordingChunks, { type: recorder?.mimeType || "audio/webm" });
  context.stream.getTracks().forEach((track) => track.stop());
  recordingContext = null;
  recorder = null;
  if (context.cancelled) {
    if (!document.hidden) render();
    return;
  }
  if (duration < 300 || blob.size < 200) {
    if (resumeMusicAfterRecording) startBackgroundMusic();
    render();
    setTimeout(() => announce("这段太短，再说一次。", true), 0);
    return;
  }
  let id;
  try {
    id = await storeRecording(blob, { step: context.kind, itemId: context.itemId, bookId: context.bookId || "", unit: context.kind === "up2" ? "up2" : context.kind === "up3" ? "up3" : context.kind === "reading" ? `reading:${context.bookId}` : context.unitId });
  } catch {
    if (resumeMusicAfterRecording) startBackgroundMusic();
    render();
    setTimeout(() => announce("录音没有保存，请再试一次。", true), 0);
    return;
  }
  if (context.kind === "reading") {
    const book = READING_BOOK_BY_ID.get(context.bookId);
    if (book && readingPageById(book, context.itemId)) {
      state.reading.books[book.id].recordingIds[context.itemId] = id;
      saveState();
    }
    if (resumeMusicAfterRecording) startBackgroundMusic();
    if (screen === "reading-book" && activeReadingBookId === context.bookId) renderReadingBook();
    if (screen === "reading-questions" && activeReadingBookId === context.bookId) renderReadingQuestions();
    return;
  }
  if(context.unitId!==activeUnitId) {if(resumeMusicAfterRecording)startBackgroundMusic();return;}
  if (context.kind === "up2") {
    const current = up2CurrentActivity();
    if (current?.id === context.itemId) {
      const previous = up2Evidence(current);
      const field = current.type === "phonics" ? "wordRecordings" : "lineRecordings";
      state.up.up2.activityEvidence[current.id] = context.lineId
        ? {...previous,[field]:{...previous[field],[context.lineId]:id}}
        : {...previous,recordingId:id};
      saveState();
    }
    if (resumeMusicAfterRecording) startBackgroundMusic();
    render();
    return;
  }
  if (context.kind === "up3") {
    const current=up3CurrentActivity();
    if(screen==='up3-node'&&current?.id===context.itemId) {
      const previous=state.up.up3.activityEvidence[current.id]||{};
      const recordingIds=context.lineId?{...previous.recordingIds,[context.lineId]:id}:previous.recordingIds;
      state.up.up3.activityEvidence[current.id]={...previous,recordingIds,...(context.lineId?{}:{recordingId:id})};
      saveState();
    }
    if(resumeMusicAfterRecording)startBackgroundMusic();
    render();return;
  }
  if (context.kind === "practice") {
    const {activity,run}=currentPractice();
    const selectionMatches=context.selection==null||context.selection===practiceRecordingSelection();
    if(activity?.id===context.itemId&&selectionMatches) {
      run.recordingIds[activity.id]=id;
      if(activity.rewardStage) awardItem(activity.rewardStage,activity.id);
      saveState();
    }
    if (resumeMusicAfterRecording) startBackgroundMusic();
    render();return;
  }
  if (context.kind === "sentences") {
    const run = state.attempt.sentences;
    run.recordingIds[context.itemId] = id;
    const finishedIndex = run.itemIndex;
    const earned = awardItem("sentences", context.itemId);
    if (finishedIndex === UNIT_SENTENCES.length - 1) {
      state.attempt.tasks.sentences = true;
      if (activeUnitId === "unit2") {
        saveState();
        screen = "dialogue";
      } else {
        completeStep("sentences");
        screen = "unit-home";
      }
    } else {
      const sceneDone = UNIT_SENTENCES[finishedIndex].sceneId !== UNIT_SENTENCES[finishedIndex + 1].sceneId;
      run.itemIndex += 1;
      const completedScene = UNIT_SCENES.findIndex(({ id }) => id === UNIT_SENTENCES[finishedIndex].sceneId) + 1;
      milestoneMessage = sceneDone ? `场景 ${completedScene}/${UNIT_SCENES.length} 完成${earned ? ` · +${earned} 星` : ""}` : earned ? `完成上一句 · +${earned} 星` : "";
      saveState();
    }
  }
  if (context.kind === "dialogue") {
    state.attempt.dialogue.recordingIds[context.itemId] = id;
    const earned = awardItem("dialogue", context.itemId);
    milestoneMessage = earned ? `这组对话完成 · +${earned} 星` : "这组对话已经完成。";
    saveState();
  }
  if (context.kind === "transfer") {
    state.attempt.transfer.recordingIds[context.itemId] = id;
    const earned = awardItem("transfer", context.itemId);
    milestoneMessage = earned ? `这幅图完成 · +${earned} 星` : "这幅图已经完成。";
    saveState();
  }
  if (context.kind === "song") {
    state.attempt.song.recordingIds.song = id;
    const earned = awardItem("song", "song");
    milestoneMessage = earned ? `演唱完成 · +${earned} 星` : "演唱已经保存。";
    saveState();
  }
  if (context.kind === "project") {
    state.attempt.project.recordingIds.project = id;
    const earned = awardItem("project", "project");
    milestoneMessage = earned ? `作品介绍完成 · +${earned} 星` : "介绍已经保存。";
    saveState();
  }
  if (resumeMusicAfterRecording) startBackgroundMusic();
  render();
}

const dangerDefinitions = {
  "factory-reset": {
    title: "恢复产品初始状态",
    description: "仅用于更换使用者或彻底重新建档。将删除全部 Unit 进度、星星、奖励、录音、成长与心愿记录、设置、家长密码和恢复码；教材与产品功能不会删除。此操作无法撤销。",
    confirm: "永久清空全部数据"
  }
};

function showToast(message, warning = false) {
  document.querySelector(".app-toast")?.remove();
  document.body.insertAdjacentHTML("beforeend", `<div class="app-toast ${warning ? "warn" : ""}" role="status">${escapeHTML(message)}</div>`);
  window.setTimeout(() => document.querySelector(".app-toast")?.remove(), 3200);
}

function closeParentModal() {
  authModal = null;
  authBusy = false;
  dangerBusy = false;
  $app.inert = false;
  document.querySelector(".modal-backdrop")?.remove();
}

function openParentModal(mode, options = {}) {
  authModal = { mode, error: "", ...options };
  $app.inert = true;
  renderParentModal();
}

function modalField(id, label, type = "password", autocomplete = "current-password") {
  return `<label>${label}<span class="password-field"><input id="${id}" name="${id}" type="${type}" autocomplete="${autocomplete}" minlength="6" maxlength="32" required /><button type="button" class="reveal-button" data-action="toggle-password" data-target="${id}" aria-label="显示或隐藏密码">显示</button></span></label>`;
}

function renderParentModal() {
  document.querySelector(".modal-backdrop")?.remove();
  if (!authModal) return;
  $app.inert = true;
  if (authModal.mode === "recovery-success") {
    document.body.insertAdjacentHTML("beforeend", `<div class="modal-backdrop"><section class="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="parent-modal-title"><h2 id="parent-modal-title">保存恢复码</h2><p>密码已设置。忘记密码时，需要这组恢复码。</p><code class="recovery-code">${escapeHTML(oneTimeRecoveryCode)}</code><p class="field-note">恢复码只显示这一次，请保存在家长可找到的地方。</p><div class="modal-actions"><button class="primary-button" data-action="recovery-code-saved">我已保存</button></div></section></div>`);
    document.querySelector('[data-action="recovery-code-saved"]')?.focus();
    return;
  }
  const mode = authModal.mode;
  const lockedSeconds = Math.ceil(authLockRemaining(state.auth) / 1000);
  let title = "家长验证";
  let copy = "请输入家长密码。";
  let fields = modalField("parent-password", "家长密码");
  let submit = "进入家长中心";
  let extra = mode === "login" && state.auth.recovery ? `<button type="button" class="text-button" data-action="open-parent-recovery">忘记密码</button>` : "";
  if (mode === "setup") {
    title = "设置家长密码";
    copy = "首次进入时设置。密码需为 6–32 位，并同时包含字母和数字。";
    fields = `${modalField("new-parent-password", "新密码", "password", "new-password")}${modalField("confirm-parent-password", "再次输入", "password", "new-password")}`;
    submit = "保存密码";
  }
  if (mode === "upgrade") {
    title = "升级家长密码";
    copy = "旧四位 PIN 已验证，请换成字母与数字组合的新密码。";
    fields = `${modalField("new-parent-password", "新密码", "password", "new-password")}${modalField("confirm-parent-password", "再次输入", "password", "new-password")}`;
    submit = "完成升级";
  }
  if (mode === "change") {
    title = "修改家长密码";
    copy = "先验证当前密码，再设置新密码。";
    fields = `${modalField("parent-password", "当前密码")}${modalField("new-parent-password", "新密码", "password", "new-password")}${modalField("confirm-parent-password", "再次输入", "password", "new-password")}`;
    submit = "保存新密码";
  }
  if (mode === "recovery") {
    title = "使用恢复码";
    copy = "输入首次设置时保存的恢复码，并设置新密码。";
    fields = `<label>恢复码<input id="parent-recovery" name="parent-recovery" autocomplete="off" maxlength="20" required /></label>${modalField("new-parent-password", "新密码", "password", "new-password")}${modalField("confirm-parent-password", "再次输入", "password", "new-password")}`;
    submit = "重设密码";
    extra = "";
  }
  if (mode === "danger") {
    const definition = dangerDefinitions[authModal.dangerAction];
    title = definition.title;
    copy = definition.description;
    fields += '<label>输入“清空全部数据”确认<input id="factory-reset-confirmation" name="factory-reset-confirmation" autocomplete="off" maxlength="6" required /></label>';
    submit = definition.confirm;
    extra = "";
  }
  const lockMessage = lockedSeconds ? `尝试次数过多，请 ${lockedSeconds} 秒后再试。` : "";
  const disabled = lockedSeconds || authBusy || dangerBusy;
  document.body.insertAdjacentHTML("beforeend", `<div class="modal-backdrop"><section class="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="parent-modal-title"><h2 id="parent-modal-title">${escapeHTML(title)}</h2><p>${escapeHTML(copy)}</p><form data-parent-form="${mode}" novalidate>${fields}<p class="form-error" role="alert">${escapeHTML(lockMessage || authModal.error)}</p><div class="modal-actions"><button type="button" class="secondary-button" data-action="close-parent-modal">取消</button>${extra}<button type="submit" class="${mode === "danger" ? "danger-button" : "primary-button"}" ${disabled ? "disabled" : ""}>${escapeHTML(submit)}</button></div></form></section></div>`);
  document.querySelector(".auth-modal input")?.focus();
}

function normalizeRecoveryCode(value) { return String(value || "").toUpperCase().replace(/[^A-Z2-9]/g, ""); }

async function installParentPassword(password, rotateRecovery) {
  const credential = await createCredential(password);
  let recovery = state.auth.recovery;
  if (rotateRecovery || !recovery) {
    oneTimeRecoveryCode = createRecoveryCode();
    recovery = await createCredential(normalizeRecoveryCode(oneTimeRecoveryCode));
  }
  state.auth = { credential, recovery, needsUpgrade: false, failedAttempts: 0, lockedUntil: 0 };
  saveState();
}

async function verifyParentSecret(secret, recovery = false) {
  const remaining = authLockRemaining(state.auth);
  if (remaining) return { ok: false, error: `尝试次数过多，请 ${Math.ceil(remaining / 1000)} 秒后再试。` };
  const credential = recovery ? state.auth.recovery : state.auth.credential;
  const ok = await verifyCredential(secret, credential);
  if (!ok) {
    state.auth = registerAuthFailure(state.auth);
    saveState();
    const locked = authLockRemaining(state.auth);
    return { ok: false, error: locked ? "尝试次数过多，已锁定 30 秒。" : recovery ? "恢复码不正确。" : "密码不正确。" };
  }
  state.auth = clearAuthFailures(state.auth);
  saveState();
  return { ok: true, error: "" };
}

function enterParentCenter() {
  closeParentModal();
  parentSession = true;
  parentUnitId = activeUnitId;
  if (screen !== "parent") returnScreen = screen;
  screen = "parent";
  render();
}

function exitParentCenter() {
  parentSession = false;
  screen = parentReturnScreen === "parent" ? "course" : parentReturnScreen;
  returnScreen = screen;
  render();
}

async function runDangerAction(action) {
  if (testSession) {
    closeParentModal();
    showToast("测试模式不会删除任何正式数据。");
    return;
  }
  if (action !== "factory-reset") return;
  localStorage.setItem(RESET_MARKER_KEY, "pending");
  await deleteRecordings();
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("qibao-")) localStorage.removeItem(key);
  }
  activeUnitId = "unit1";
  state = bindActiveUnit(structuredClone(defaults));
  activateUnit("unit1");
  persistedState = stateForStorage(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  closeParentModal();
  parentSession = false;
  screen = "course";
  render();
  showToast("产品已恢复初始状态。");
}

async function handleParentForm(form) {
  if (authBusy || dangerBusy) return;
  const mode = form.dataset.parentForm;
  const currentPassword = form.querySelector("#parent-password")?.value || "";
  const newPassword = form.querySelector("#new-parent-password")?.value || "";
  const confirmation = form.querySelector("#confirm-parent-password")?.value || "";
  const passwordError = ["setup", "upgrade", "change", "recovery"].includes(mode) ? validateParentPassword(newPassword) : "";
  if (passwordError) { authModal.error = passwordError; renderParentModal(); return; }
  if (["setup", "upgrade", "change", "recovery"].includes(mode) && newPassword !== confirmation) { authModal.error = "两次输入的密码不一致。"; renderParentModal(); return; }
  authBusy = true;
  renderParentModal();
  try {
    if (mode === "setup" || mode === "upgrade") {
      await installParentPassword(newPassword, true);
      parentSession = true;
      authModal = { mode: "recovery-success", error: "" };
      renderParentModal();
      return;
    }
    if (mode === "login") {
      const result = await verifyParentSecret(currentPassword);
      if (!result.ok) { authModal.error = result.error; return; }
      if (state.auth.needsUpgrade) { authModal = { mode: "upgrade", error: "" }; return; }
      enterParentCenter();
      return;
    }
    if (mode === "change") {
      const result = await verifyParentSecret(currentPassword);
      if (!result.ok) { authModal.error = result.error; return; }
      await installParentPassword(newPassword, false);
      closeParentModal();
      renderParent();
      showToast("家长密码已修改。");
      return;
    }
    if (mode === "recovery") {
      const code = normalizeRecoveryCode(form.querySelector("#parent-recovery")?.value);
      const result = await verifyParentSecret(code, true);
      if (!result.ok) { authModal.error = result.error; return; }
      await installParentPassword(newPassword, true);
      parentSession = true;
      authModal = { mode: "recovery-success", error: "" };
      renderParentModal();
      return;
    }
    if (mode === "danger") {
      if (authModal.dangerAction === "factory-reset" && form.querySelector("#factory-reset-confirmation")?.value.trim() !== "清空全部数据") {
        authModal.error = "请输入“清空全部数据”后再确认。";
        return;
      }
      const result = await verifyParentSecret(currentPassword);
      if (!result.ok) { authModal.error = result.error; return; }
      dangerBusy = true;
      await runDangerAction(authModal.dangerAction);
      return;
    }
  } catch {
    authModal.error = mode === "danger" ? "操作未完成，课程数据没有改变。请重试。" : "暂时无法保存，请重试。";
  } finally {
    authBusy = false;
    dangerBusy = false;
    if (authModal) renderParentModal();
  }
}

async function migrateLegacyParentPin() {
  if (!legacyParentPin || state.auth.credential) return;
  state.auth = { ...state.auth, credential: await createCredential(legacyParentPin), needsUpgrade: true, failedAttempts: 0, lockedUntil: 0 };
  legacyParentPin = "";
  saveState();
}

function parentGate() {
  if (!parentSession && screen !== "parent") parentReturnScreen = screen;
  if (parentSession) { enterParentCenter(); return; }
  openParentModal(state.auth.credential ? "login" : "setup");
}

function up2CurrentActivity() {
  const up = state.up.up2;
  return UP2_NODE_BY_ID.get(up.activeNodeId)?.activities[up.activityIndex] || null;
}

function up2UpdateEvidence(activityId, change) {
  const up = state.up.up2;
  up.activityEvidence[activityId] = { ...up.activityEvidence[activityId], ...change };
  if (!saveState()) return false;
  renderUp2Node();
  return true;
}



function finishUp2Activity(evidence) {
  const up = state.up.up2;
  const node = UP2_NODE_BY_ID.get(up.activeNodeId);
  const activity = node?.activities[up.activityIndex];
  if (!activity) return;
  const result = completeUp2Activity(up, node.id, activity.id, evidence);
  if (!result) return;
  const nodeAwarded = result.nodeCompleted && !state.rewards[`up2:node:${node.id}`];
  let next = structuredClone(state);
  next.up.up2 = result.up;
  if (result.nodeCompleted) next = grantMilestone(next, `up2:node:${node.id}`, node.reward, {
    type: "stars-earned", unitId: "up2", title: `${node.title} · UP2`, detail: `UP2 · ${UP2_CHAPTERS.find(({ id }) => id === node.chapterId)?.title}`
  });
  if (result.courseCompleted) {
    if (result.reviewReward) next = grantMilestone(next, `up2:review:${result.up.review.rewardedCount}`, result.reviewReward, {
      type: "review-complete", unitId: "up2", title: `完成 UP2 第 ${result.up.review.completedCount} 次复习`, detail: `复习奖励 ${result.up.review.rewardedCount}/${REVIEW_REWARD_LIMIT}`
    });
    else next = appendEvent(next, {
      id: result.up.review.completedCount ? `up2:review-run:${result.up.review.runId}` : "up2:first-complete",
      type: result.up.review.completedCount ? "review-complete" : "unit-complete", unitId: "up2",
      title: result.up.review.completedCount ? `完成 UP2 第 ${result.up.review.completedCount} 次复习` : "完成 UP2",
      detail: "十个学习节点全部完成"
    });
  }
  state = next;
  if (!saveState()) return;
  screen = result.courseCompleted ? "up2-complete" : result.nodeCompleted ? "up2-home" : "up2-node";
  render();
  if (result.nodeCompleted) showToast(result.courseCompleted ? "UP2 全部完成！" : nodeAwarded ? `${node.title} 完成 · +${node.reward} 星` : `${node.title} 复习完成`);
}

async function handleUpAction(button, action) {
  if (action === "open-up-world") { worldMenuOpen = false; if (testSession) exitParentTest(); else { screen = "up-world"; render(); } return true; }
  if (action === "open-up2" || action === "back-up2-home") { screen = "up2-home"; render(); return true; }
  if (action === "open-up-node") {
    state.up.up2 = openUp2Node(state.up.up2,button.dataset.nodeId);
    if (saveState()) {screen = "up2-node";render();} return true;
  }
  if (action === "start-up2-review") {
    if (!state.up.up2.completedEver || state.up.up2.review.active) return true;
    if (!window.confirm("开始一次 UP2 完整复习？此前的星星、心愿和学习历史会保留。")) return true;
    state.up.up2 = startUp2Review(state.up.up2);
    if (saveState()) renderUp2Home(); return true;
  }
  if (screen !== "up2-node") return false;
  const activity = up2CurrentActivity(); if (!activity) return false;
  const evidence = up2Evidence(activity);
  const update = change => up2UpdateEvidence(activity.id,change);
  const listen = (src,change,lines=null) => {
    button.disabled = true;
    const done=()=> { if(up2CurrentActivity()?.id===activity.id) update(change); };
    const failed=()=> {button.disabled=false;};
    if(lines)playSceneAudio({lines},done,failed);else say("",src,done,failed);
  };
  if (action === "up-help-word") { const w=UP2_VOCAB_BY_ID.get(button.dataset.wordId);if(w)say("",w.audioSrc);return true; }
  if (action === "up-play-activity-audio" && activity.audioSrc) {listen(activity.audioSrc,{heard:true});return true;}
  if (action === "up-play-line" && activity.type === "reading") {
    const line=up2ReadingLine(activity,evidence);
    if(activity.audioSrc&&activity.lines.length>1&&!evidence.heard)return true;
    listen(line.audioSrc,{readingMode:2,heardIds:[...new Set([...(evidence.heardIds||[]),line.id])]},line.lines);return true;
  }
  if (action === "up-reading-step" && activity.type === "reading") {
    const line=up2ReadingLine(activity,evidence),delta=Number(button.dataset.delta);
    if(delta>0&&(!evidence.lineRecordings?.[line.id]||!evidence.heardIds?.includes(line.id)))return true;
    stopLessonAudio();
    update({lineIndex:Math.max(0,Math.min(up2ReadingSteps(activity).length-1,(evidence.lineIndex||0)+delta)),feedback:""});return true;
  }
  if (action === "up-play-phonics" && activity.type === "phonics") {
    const word=activity.words.find(w=>w.text===button.dataset.word);
    if(word)listen(word.audioSrc,{wordIndex:activity.words.indexOf(word),heardIds:[...new Set([...(evidence.heardIds||[]),word.text])]});return true;
  }
  if (action === "up-phonics-step" && activity.type === "phonics") {
    const i=evidence.wordIndex||0,delta=Number(button.dataset.delta);
    if(delta>0&&!evidence.wordRecordings?.[activity.words[i].text])return true;
    update({wordIndex:Math.max(0,Math.min(activity.words.length-1,i+delta)),feedback:""});return true;
  }
  if (activity.type === "word-practice") {
    const w=UP2_VOCAB_BY_ID.get(activity.wordId),phase=evidence.phase||0;
    if(action==="up-word-hear") {listen(w.audioSrc,phase===3?{...beginUp2Spelling(evidence),writeHeard:true}:{learned:true});return true;}
    if(action==="up-word-next") {
      if(phase<2 && evidence.learned)update({phase:2,feedback:""});
      if(phase===2 && (evidence.recordingId||evidence.contextRecordingId)) {
        if(w.level===4)update({...beginUp2Spelling(evidence),phase:3,draft:"",written:false,writeHeard:false,showSpelling:false,feedback:""});else finishUp2Activity(evidence);
      }
      return true;
    }
    if(action==="up-check-answer" && phase===3) {
      if(!evidence.writeHeard||evidence.showSpelling)return true;
      const draft=document.querySelector("[data-up-answer]")?.value||"";
      if(up2WritingKey(draft)!==up2WritingKey(activity.answer)){update({draft,written:false,writingAttempts:(evidence.writingAttempts||0)+1,feedback:"还差一点。再听听，或用提示帮忙。"});return true;}
      finishUp2Activity({...evidence,draft,written:true,writingCheckVersion:2,writingResult:evidence.writingSupportUsed?'supported':'independent'});return true;
    }
  }
  if (action === "up-notice-done" && activity.type === "notice") {finishUp2Activity({read:true});return true;}
  if (action === "up-choice" && ["choice","picture-choice","write-choice"].includes(activity.type)) {
    if(activity.audioSrc&&!evidence.heard)return true;
    if(button.dataset.value!==activity.answer){button.classList.add("wrong");announce("再看一看，试一试。",true);playCue("retry");return true;}
    if(activity.type==="write-choice")update({...beginUp2Spelling(evidence),choice:activity.answer,draft:"",showSpelling:false,checked:false,feedback:"选好了，收起选项，自己拼一拼。"});
    else finishUp2Activity({...evidence,choice:activity.answer});return true;
  }
  if(action==="up-check-answer" && activity.type==="write-choice") {
    if(!evidence.choice||evidence.showSpelling)return true;
    const draft=document.querySelector("[data-up-answer]")?.value||"";
    if(up2WritingKey(draft)!==up2WritingKey(activity.answer)){update({draft,checked:false,writingAttempts:(evidence.writingAttempts||0)+1,feedback:"还差一点，想一想，或用提示帮忙。"});return true;}
    finishUp2Activity({...evidence,draft,checked:true,writingCheckVersion:2,writingResult:evidence.writingSupportUsed?'supported':'independent'});return true;
  }
  const spellingActive=activity.type==="write-choice"&&evidence.choice || activity.type==="word-practice"&&evidence.phase===3;
  if(spellingActive&&action==="up-spelling-help") {
    if(activity.type==="word-practice"&&!evidence.writeHeard)return true;
    stopLessonAudio();
    update({...beginUp2Spelling(evidence),writingSupportUsed:true,spellingHint:true,showSpelling:Boolean(evidence.spellingHint),feedback:""});return true;
  }
  if(spellingActive&&action==="up-spelling-retry") {
    stopLessonAudio();update({showSpelling:false,spellingHint:false,draft:"",written:false,checked:false,writeHeard:false,feedback:"收起了，再自己试一遍。"});return true;
  }
  if(activity.type==="write-choice"&&action==="up-spelling-back") {
    update({choice:"",draft:"",checked:false,showSpelling:false,writingSupportUsed:true,feedback:""});return true;
  }
  if(action==="up-find-toggle" && activity.type==="find") {
    const selected=new Set(evidence.selected||[]),index=Number(button.dataset.index);
    if(selected.has(index))selected.delete(index);else selected.add(index);
    update({selected:[...selected],checked:false,feedback:""});return true;
  }
  if(action==="up-find-check" && activity.type==="find") {
    const parts=up2FindSections(activity),part=up2FindSection(activity,evidence),index=parts.findIndex(s=>s.id===part.id);
    if(!up2FindSectionComplete(part,evidence)){update({feedback:"这一段还有漏掉或圈错的词，再找一找。"});return true;}
    if(index<parts.length-1){update({findIndex:index+1,feedback:""});return true;}
    const ready={...evidence,checked:true};
    if(isUp2ActivityComplete(activity,ready))finishUp2Activity(ready);
    else update({feedback:"还有漏掉或圈错的词，再找一找。"});return true;
  }
  if(action==="up-find-back" && activity.type==="find") {update({findIndex:Math.max(0,(evidence.findIndex||0)-1),feedback:""});return true;}
  if(action==="up-show-reference" && activity.type==="speak" && evidence.recordingId) {update({showReference:!evidence.showReference});return true;}
  if(action==="up-finish-activity") {
    if(isUp2ActivityComplete(activity,evidence))finishUp2Activity(evidence);
    else announce("先完成这一小段。",true);return true;
  }
  return false;
}

function up3UpdateEvidence(activityId,change) {
  const up=state.up.up3;
  up.activityEvidence[activityId]={...up.activityEvidence[activityId],...change};
  if(!saveState())return false;
  renderUp3Node();return true;
}
function finishUp3Activity(evidence) {
  const up=state.up.up3,node=UP3_NODE_BY_ID.get(up.activeNodeId),activity=node?.activities[up.activityIndex];
  if(!activity)return;
  const result=completeUp3Activity(up,node.id,activity.id,evidence);
  if(!result)return;
  const nodeAwarded=result.nodeCompleted&&!state.rewards[`up3:node:${node.id}`];
  let next=structuredClone(state);next.up.up3=result.up;
  if(result.nodeCompleted)next=grantMilestone(next,`up3:node:${node.id}`,node.reward,{
    type:'stars-earned',unitId:'up3',title:`${node.title} · UP3`,detail:`UP3 · ${UP3_CHAPTERS.find(c=>c.id===node.chapterId)?.title||'翻书小剧场'}`
  });
  if(result.courseCompleted) {
    if(result.reviewReward)next=grantMilestone(next,`up3:review:${result.up.review.rewardedCount}`,result.reviewReward,{
      type:'review-complete',unitId:'up3',title:`完成 UP3 第 ${result.up.review.completedCount} 次复习`,detail:'完整复习'
    });
    else next=appendEvent(next,{id:result.up.review.completedCount?`up3:review-run:${result.up.review.runId}`:'up3:first-complete',
      type:result.up.review.completedCount?'review-complete':'unit-complete',unitId:'up3',title:'完成 UP3',detail:'五个原课件主线任务全部完成'});
  }
  state=next;if(!saveState())return;
  screen=result.courseCompleted?'up3-complete':result.nodeCompleted?'up3-home':'up3-node';render();
  if(result.nodeCompleted)showToast(result.courseCompleted?'UP3 全部完成！':nodeAwarded?`${node.title} 完成 · +${node.reward} 星`:`${node.title} 复习完成`);
}
async function handleUp3Action(button,action) {
  if(action==='up3-theme-listen'&&screen==='up3-home'){say('','./assets/audio/official/up3/theme-whole-v05.mp3');return true;}
  if(action==='up3-help-word'&&['up3-home','up3-node'].includes(screen)){const word=UP3_VOCAB_BY_ID.get(button.dataset.wordId);if(word)say('',word.audioSrc);return true;}
  if(action==='open-up3'||action==='back-up3-home'){screen='up3-home';render();return true;}
  if(action==='open-up3-node'){
    const id=button.dataset.nodeId;
    if(!canOpenUp3Node(state.up.up3,id))return true;
    state.up.up3=openUp3Node(state.up.up3,id);
    if(saveState()){screen='up3-node';render();}return true;
  }
  if(action==='start-up3-review'){
    if(!state.up.up3.completedEver||state.up.up3.review.active)return true;
    if(!window.confirm('开始一次 UP3 完整复习？此前的星星、心愿和学习历史会保留。'))return true;
    state.up.up3=startUp3Review(state.up.up3);
    if(saveState())renderUp3Home();return true;
  }
  if(screen!=='up3-node')return false;
  const a=up3CurrentActivity();if(!a)return false;
  const e=state.up.up3.activityEvidence[a.id]||{};
  const update=change=>up3UpdateEvidence(a.id,change);
  const listen=(src,change,lines=null)=>{
    button.disabled=true;
    const done=()=>{const current=state.up.up3.activityEvidence[a.id]||{};if(up3CurrentActivity()?.id===a.id&&(current.stepIndex||0)===(e.stepIndex||0)&&(current.phase||0)===(e.phase||0))update(change);};
    const failed=()=>{button.disabled=false;};
    if(lines)playSceneAudio({lines},done,failed);else say('',src,done,failed);
  };
  if(a.type==='book'){
    if(action==='up3-book-turn'){
      const single=window.matchMedia('(orientation: portrait)').matches;
      const pos=(e.spreadIndex||0)*2+(e.side||0),delta=Number(button.dataset.delta);
      const next=single?Math.max(0,Math.min(7,pos+delta)):Math.max(0,Math.min(3,(e.spreadIndex||0)+delta))*2;
      update({spreadIndex:Math.floor(next/2),side:next%2});return true;
    }
    if(action==='up3-book-listen'){
      const scene=a.scenes.find(scene=>scene.id===button.dataset.sceneId);
      if(scene)say('',scene.audioSrc);return true;
    }
    if(action==='up3-book-finish'){
      if(a.scenes.every(scene=>e.viewedIds?.includes(scene.id)))finishUp3Activity({...e,finished:true});
      return true;
    }
    return false;
  }
  if(action==='up3-play-whole'&&a.type==='reading'){
    if(a.audioSrc)listen(a.audioSrc,{heardWhole:true});else listen('',{heardWhole:true},a.lines);return true;
  }
  if(action==='up3-play-current'&&a.type==='reading'){
    if(a.audioSrc&&!e.heardWhole)return true;
    const step=up3ReadingStep(a,e),heardIds=[...new Set([...(e.heardIds||[]),step.id])];
    listen(step.audioSrc||'',{heardIds},step.audioParts?.map(audioSrc=>({audioSrc}))||null);return true;
  }
  if(action==='up3-read-step'&&a.type==='reading'){
    if(a.audioSrc&&!e.heardWhole)return true;
    const steps=up3ReadingSteps(a),step=up3ReadingStep(a,e),delta=Number(button.dataset.delta);
    if(delta>0&&(!e.heardIds?.includes(step.id)||!a.optionalRecording&&!e.recordingIds?.[step.id]))return true;
    stopLessonAudio();update({stepIndex:Math.max(0,Math.min(steps.length-1,(e.stepIndex||0)+delta)),feedback:''});return true;
  }
  if(action==='up3-play-model'){
    const src=a.type==='word-say'?UP3_VOCAB_BY_ID.get(a.wordId)?.audioSrc:a.type==='spell'?UP3_VOCAB_BY_ID.get(a.wordId)?.audioSrc:a.audioSrc;
    if(src)listen(src,{heard:true});return true;
  }
  if(a.type==='word-practice'){
    const phase=e.phase||0,w=UP3_VOCAB_BY_ID.get(a.wordId);
    if(action==='up3-word-hear'){listen(w.audioSrc,phase===3?{...beginUp2Spelling(e),writeHeard:true}:{learned:true});return true;}
    if(action==='up3-word-next'){
      if(phase<2&&e.learned)update({phase:2,feedback:''});
      if(phase===2&&e.recordingId){if(a.level===4)update({...beginUp2Spelling(e),phase:3,draft:'',written:false,writeHeard:false,showSpelling:false,feedback:''});else finishUp3Activity(e);}
      return true;
    }
    if(action==='up3-check-answer'&&phase===3){
      if(!e.writeHeard||e.showSpelling)return true;
      const draft=document.querySelector('[data-up3-answer]')?.value||'';
      if(up3WritingKey(draft)!==up3WritingKey(a.answer)){update({draft,written:false,writingAttempts:(e.writingAttempts||0)+1,feedback:'还差一点。再听听，或用提示帮忙。'});return true;}
      finishUp3Activity({...e,draft,written:true,writingCheckVersion:2,writingResult:e.writingSupportUsed?'supported':'independent'});return true;
    }
    if(action==='up3-spelling-help'&&phase===3&&e.writeHeard){stopLessonAudio();update({writingSupportUsed:true,spellingHint:true,showSpelling:Boolean(e.spellingHint),feedback:''});return true;}
    if(action==='up3-spelling-retry'&&phase===3){stopLessonAudio();update({showSpelling:false,spellingHint:false,draft:'',written:false,writeHeard:false,writingSupportUsed:true,feedback:'收起了，再自己试一遍。'});return true;}
  }
  if(action==='up3-group-listen'&&a.type==='word-group'){
    const id=button.dataset.wordId;if(!a.wordIds.includes(id))return true;
    listen(UP3_VOCAB_BY_ID.get(id).audioSrc,{heardIds:[...new Set([...(e.heardIds||[]),id])]});return true;
  }
  if(action==='up3-noticed'&&a.type==='phonics'&&e.heard){finishUp3Activity({...e,noticed:true});return true;}
  if(action==='up3-notice-done'&&a.type==='notice'){finishUp3Activity({...e,read:true});return true;}
  if(action==='up3-select'&&['choice','select-write','letter-write'].includes(a.type)){
    if(button.dataset.value!==a.answer){button.classList.add('wrong');announce('再看一看，试一试。',true);playCue('retry');return true;}
    if(a.type==='choice')finishUp3Activity({...e,choice:a.answer});
    else update({...e,choice:a.answer,draft:'',checked:false,showModel:false,feedback:a.sharedBank?'选好了，把答案填进空格。':'选好了，收起选项，自己拼一拼。'});
    return true;
  }
  if(action==='up3-check'&&['select-write','letter-write','spell'].includes(a.type)){
    if(a.type==='spell'&&!e.heard||e.showModel)return true;
    const answer=a.type==='spell'?UP3_VOCAB_BY_ID.get(a.wordId).text:a.answer;
    const draft=document.querySelector('[data-up3-answer]')?.value||'';
    if(up3WritingKey(draft)!==up3WritingKey(answer)){update({draft,checked:false,writingAttempts:(e.writingAttempts||0)+1,feedback:a.type==='letter-write'?'再读句子，看看对应图片的字母。':a.sharedBank?'再读句子，检查所选词的拼写。':a.type==='spell'?'还差一点，再听听，或用提示帮忙。':'还差一点，想一想，或用提示帮忙。'});return true;}
    const ready={...e,...(a.type==='letter-write'?{choice:a.answer}:{}),draft,checked:true,writingResult:a.type==='spell'?e.writingSupportUsed?'supported':'independent':'worksheet-supported',feedback:''};
    if(a.type==='spell'&&a.record)update(ready);else finishUp3Activity(ready);
    return true;
  }
  if(action==='up3-hint'&&['select-write','letter-write','spell'].includes(a.type)){
    update({hintLevel:Math.min(2,(e.hintLevel||0)+1),writingSupportUsed:true,showModel:Boolean(e.hintLevel),feedback:''});return true;
  }
  if(action==='up3-retry'&&['select-write','letter-write','spell'].includes(a.type)){
    update({showModel:false,hintLevel:0,draft:'',checked:false,writingSupportUsed:true,feedback:'收起来，再自己试一次。'});return true;
  }
  if(action==='up3-find-toggle'&&a.type==='find'){
    const index=Number(button.dataset.index),selected=new Set(e.selected||[]);
    if(!Number.isInteger(index)||!/^[A-Za-z]/.test(up3TokenWords(a.text)[index]||''))return true;
    if(selected.has(index))selected.delete(index);else selected.add(index);
    update({selected:[...selected],checked:false,feedback:''});return true;
  }
  if(action==='up3-find-check'&&a.type==='find'){
    if(up3FindSelectionComplete(a,e))finishUp3Activity({...e,checked:true});
    else update({checked:false,feedback:'还有漏掉或圈错的词，再找一找。'});return true;
  }
  if(action==='up3-find-section'&&a.type==='find'){update({findIndex:Math.max(0,Math.min(up3FindSections(a).length-1,(e.findIndex||0)+Number(button.dataset.delta))),feedback:''});return true;}
  if(action==='up3-find-object'&&a.type==='object-find'){update({found:true});return true;}
  if(action==='up3-finish'){
    if(isUp3ActivityComplete(a,e))finishUp3Activity(e);
    else announce('先完成这一小段。',true);return true;
  }
  return false;
}

document.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) { if (worldMenuOpen && !event.target.closest?.(".world-switcher")) setWorldMenu(false); return; }
  if (button.disabled) return;
  const action = button.dataset.action;

  if (recorder?.state === "recording" && !["stop-record","exit-parent-test"].includes(action)) { showToast("请先结束这一段录音。", true); return; }

  if (action === "toggle-world-switch") { setWorldMenu(!worldMenuOpen); return; }
  if (action === "open-course-world") { worldMenuOpen = false; if (testSession) exitParentTest(); else { screen = "course"; render(); } return; }
  if (action === "open-reading-world") { worldMenuOpen = false; if (testSession) exitParentTest(); else { screen = "reading-world"; render(); } return; }
  if (action === "open-reading-library") { worldMenuOpen = false; screen = "reading-library"; render(); return; }
  if (action === "back-reading-world") { worldMenuOpen = false; screen = "reading-world"; render(); return; }
  if (action === "back-reading-library") { screen = "reading-library"; activeReadingBookId = ""; readingPortraitSide = 0; render(); return; }
  if (action === "open-reading-book") {
    const book = READING_BOOK_BY_ID.get(button.dataset.bookId);
    if (!book) return;
    activeReadingBookId = book.id;
    readingFromQuestion = false;
    readingPortraitSide = 0;
    readingTurnDirection = "forward";
    const earned = settleReadingView(book);
    if(!saveState())return;
    screen = "reading-book";
    render();
    if (earned) showToast(`第一次读到这一页 · +${earned} 星`);
    return;
  }
  if (["previous-reading-page", "next-reading-page"].includes(action)) {
    const book = READING_BOOK_BY_ID.get(activeReadingBookId);
    if (!book) return;
    const run = state.reading.books[book.id];
    const forward = action === "next-reading-page";
    readingTurnDirection = forward ? "forward" : "backward";
    if (readingUsesSinglePage() && !book.semantic) {
      if (forward && readingPortraitSide === 0) readingPortraitSide = 1;
      else if (!forward && readingPortraitSide === 1) readingPortraitSide = 0;
      else {
        run.spreadIndex = Math.min(book.spreads.length - 1, Math.max(0, run.spreadIndex + (forward ? 1 : -1)));
        readingPortraitSide = forward ? 0 : 1;
      }
    } else run.spreadIndex = Math.min(book.spreads.length - 1, Math.max(0, run.spreadIndex + (forward ? 1 : -1)));
    const earned = settleReadingView(book);
    if (saveState()) {
      render();
      if (earned) showToast(`第一次读到这一页 · +${earned} 星`);
    }
    return;
  }
  if (action === "finish-reading-book") {
    const book = READING_BOOK_BY_ID.get(activeReadingBookId);
    if(book?.semantic && state.reading.books[book.id].spreadIndex!==book.spreads.length-1)return;
    if (book && !state.reading.books[book.id].reachedEndAt) { state.reading.books[book.id].reachedEndAt = Date.now(); if(!saveState())return; }
    screen = "reading-library"; activeReadingBookId = ""; readingPortraitSide = 0; render();
    return;
  }
  if (action === "play-reading-page") {
    const book = READING_BOOK_BY_ID.get(activeReadingBookId);
    const pageItem = readingPageById(book, button.dataset.pageId);
    const current = book?.spreads[state.reading.books[book.id].spreadIndex];
    if (!pageItem || !current?.pages.some(item => item.id === pageItem.id)) return;
    button.disabled = true; button.textContent = "播放中…";
    const bookId = book.id, pageId = pageItem.id;
    const restore = label => {
      if (screen !== "reading-book" || activeReadingBookId !== bookId) return;
      const control = document.querySelector(`[data-action="play-reading-page"][data-page-id="${pageId}"]`);
      if (control) { control.disabled = false; control.textContent = label; }
    };
    say("", pageItem.audioSrc, () => restore("再听一次"), () => restore("重新播放"));
    return;
  }
  if (action === "play-reading-recording") {
    await playSavedRecording(button.dataset.recordingId);
    return;
  }

  if (['reading-open-questions','reading-return-text','reading-question-step','reading-find-evidence','reading-answer-attempt','play-reading-extra'].includes(action)) {
    const book=READING_BOOK_BY_ID.get(activeReadingBookId);
    if(!book?.semantic || !['reading-book','reading-questions'].includes(screen))return;
    const run=state.reading.books[book.id], question=book.questions[readingQuestionIndex];
    if(action==='reading-open-questions') {if(!readingFromQuestion)readingQuestionIndex=0;readingFromQuestion=false;readingReferenceOpen=false;screen='reading-questions';render();return;}
    if(action==='reading-return-text') {screen='reading-book';render();return;}
    if(action==='reading-question-step') {
      if(screen!=='reading-questions')return;
      if(button.dataset.delta==='1' && readingQuestionIndex===book.questions.length-1)screen='reading-book';
      else readingQuestionIndex=Math.max(0,Math.min(book.questions.length-1,readingQuestionIndex+(button.dataset.delta==='1'?1:-1)));
      readingReferenceOpen=false;render();return;
    }
    if(action==='reading-answer-attempt') {
      if(screen!=='reading-questions')return;
      run.questionEvidence[question.id]={...run.questionEvidence[question.id],saidAt:Date.now(),referenceAt:Date.now()};
      if(saveState()){readingReferenceOpen=true;render();}return;
    }
    if(action==='reading-find-evidence') {
      if(screen!=='reading-questions')return;
      run.questionEvidence[question.id]={...run.questionEvidence[question.id],lookedBackAt:Date.now()};
      run.spreadIndex=book.spreads.findIndex(s=>s.pages.some(p=>p.id===question.sourceUnitId));
      settleReadingView(book);
      if(saveState()){readingFromQuestion=true;screen='reading-book';readingPortraitSide=0;render();}return;
    }
    const kind=button.dataset.audioKind, current=book.spreads[run.spreadIndex].pages[0];
    const src=kind==='whole'?book.wholeAudioSrc:kind==='stanza'?book.stanzaAudio?.[Number(button.dataset.stanza)]:kind==='question'&&screen==='reading-questions'?question.audioSrc:kind==='page'&&screen==='reading-book'?current.audioSrc:'';
    if(!src)return;
    const label=button.textContent;button.disabled=true;button.textContent='播放中…';
    const restore=()=>{button.disabled=false;button.textContent=label;};
    say('',src,restore,restore);return;
  }

  if (await handleUp3Action(button, action)) return;
  if (await handleUpAction(button, action)) return;

  if (action === "check-app-update") { await checkAppUpdate(); return; }
  if (action === "repair-offline") { await repairOfflineRelease(); return; }
  if (action === "apply-app-update") { applyAppUpdate(); return; }
  if (action === "reload-app") {
    if (recorder?.state === "recording") { showToast("请先完成当前录音。", true); return; }
    window.location.reload();
    return;
  }
  if (action === "course-map-page") {
    setCourseMapPage(button.dataset.page);
    (button.classList.contains("course-map-arrow") ? document.querySelector(".course-map-arrow:not([hidden])") : button)?.focus();
    return;
  }

  if (action.startsWith("practice-")) {
    const {activity,run,index,activities}=currentPractice();
    if(!activity||!stepIsOpen(stageForScreen()))return;
    const evidence=run.evidence[activity.id]||{};
    const update=patch=>{run.evidence[activity.id]={...evidence,...patch};if(saveState())renderPractice();};
    if(action==="practice-play") {
      button.disabled=true;button.textContent="播放中…";
      const stage=screen,unit=activeUnitId;
      const success=()=>{if(screen===stage&&activeUnitId===unit&&currentPractice().activity?.id===activity.id&&(activity.type!=='role-play'||run.evidence[activity.id]?.choice===evidence.choice))update({heard:true});};
      const fail=()=>{button.disabled=false;button.textContent="重新播放";};
      if(activity.lines)playSceneAudio(activity,success,fail);else {
        const src=practicePlayback(activity,evidence);
        if(!src){fail();return;}
        say("",src,success,fail);
      }
    }
    if(action==="practice-hint")update({hint:!evidence.hint});
    if(action==="practice-toggle"&&['multi-select','order'].includes(activity.type)) {
      if(!evidence.heard&&(activity.type==='multi-select'?activity.requireAudio!==false:activity.requireAudio===true))return;
      const value=button.dataset.value;
      if(!activity.options.some(o=>o.id===value))return;
      if(activity.givenOrderIds?.includes(value))return;
      const selected=practiceSelectedIds(activity,evidence);
      update({selectedIds:selected.includes(value)?selected.filter(id=>id!==value):[...selected,value],checked:false});
    }
    if(action==="practice-log-toggle"&&activity.type==='scene-log') {
      const value=button.dataset.value;
      if(!activity.options.some(o=>o.id===value))return;
      const selected=evidence.selectedIds||[];
      if(!selected.includes(value)&&selected.length>=(activity.maxSelections||activity.options.length))return;
      delete run.recordingIds[activity.id];
      update({selectedIds:selected.includes(value)?selected.filter(id=>id!==value):[...selected,value]});
    }
    if(action==="practice-secondary-choice"&&activity.type==='scene-log') {
      const value=button.dataset.value;
      if(!activity.secondaryOptions?.some(o=>o.id===value))return;
      if(evidence.secondaryChoice!==value)delete run.recordingIds[activity.id];
      update({secondaryChoice:value});
    }
    if(action==="practice-check"&&['multi-select','order'].includes(activity.type)) {
      if(!evidence.heard&&(activity.type==='multi-select'?activity.requireAudio!==false:activity.requireAudio===true))return;
      if(!objectivePracticeCorrect(activity,evidence)){announce(activity.type==='order'?'再想想：先做什么，再做什么？':'再听听，有没有漏选或多选？',true);playCue('retry');return;}
      update({checked:true});announce('完成了，可以继续。');
    }
    if(action==="practice-compose"&&activity.type==='compose') {
      const slot=Number(button.dataset.slot),value=button.dataset.value;
      if(![0,1].includes(slot)||!activity.options.some(o=>o.id===value))return;
      const choices=[...(evidence.chantChoices||[])];
      if(choices[slot]!==value)delete run.recordingIds[activity.id];
      choices[slot]=value;update({chantChoices:choices,prepared:false});
    }
    if(action==="practice-compose-ready"&&activity.type==='compose'&&practiceCanRecord(activity,{...evidence,prepared:true}))update({prepared:true});
    if(action==="practice-compose-edit"&&activity.type==='compose')update({prepared:false});
    if(action==="practice-choice") {
      const value=button.dataset.value;
      if(activity.type==='role-play')stopLessonAudio();
      if(activity.type==="match") {
        if(!activity.options.includes(value))return;
        if(value!==activity.answer){announce("再看看图片。",true);playCue("retry");return;}
      } else if(!activity.options?.some(o=>o.id===value))return;
      if(evidence.choice!==value)delete run.recordingIds[activity.id];
      update({choice:value,...(activity.type==='role-play'&&evidence.choice!==value?{heard:false,hint:false}:{})});
    }
    if(action==="practice-next"&&practiceReady(activity,evidence,run.recordingIds[activity.id])) {
      run.evidence[activity.id]={...evidence,done:true};
      if(index===activities.length-1) {
        if(!activities.every(a=>practiceReady(a,run.evidence[a.id],run.recordingIds[a.id])))return;
        const stage=screen==="application"?"words":screen;
        if(activeContent.practiceCompletionRewards?.[stage])awardItem(stage,activeContent.practiceCompletionRewards[stage]);
        if(!completeStep(stage))return;
        screen=stepIdsFor().every(id=>state.attempt.tasks[id])?"complete":"unit-home";render();
      }else{run.indices[screen]=index+1;if(saveState())renderPractice();}
    }
    return;
  }
  if(action.startsWith("bookmark-")&&activeContent.projectType==="bookmark"&&screen==="project") {
    const run=state.attempt.project;
    if(action==="bookmark-select") {
      const {field,value}=button.dataset;
      const allowed={vehicle:['car','bus','bike'],color:['sky','sun','leaf'],commute:['by-car','by-bus','on-foot','by-bike']};
      if(!allowed[field]?.includes(value))return;
      if(run[field]!==value&&field!=="color")delete run.recordingIds.project;
      run[field]=value;
    }
    if(action==="bookmark-hint")run.hintLevel=run.hintLevel?0:1;
    if(saveState())renderProject();return;
  }
  if (action.startsWith("dictation-")) {
    if (screen !== "dictation" || !stepIsOpen("dictation")) return;
    const run = state.attempt.dictation;
    const item = run.queue[run.index];
    if (action === "dictation-play" && item) {
      const phrase = phraseById.get(item.id);
      button.disabled = true;
      button.textContent = "播放中…";
      document.querySelectorAll('[data-action="dictation-check"], [data-action="dictation-help"]').forEach(control => { control.disabled = true; });
      const token = run.index;
      say("", phrase.audioSrc, () => {
        if (screen !== "dictation" || state.attempt.dictation.index !== token) return;
        const next = structuredClone(state); next.attempt.dictation.heard = true;
        if (commitDictation(next)) renderDictation();
        else { renderDictation(); announce("保存失败，请释放一些设备空间后重试。", true); }
      }, () => {
        if (screen !== "dictation" || state.attempt.dictation.index !== token) return;
        renderDictation(); announce("声音没有播放，请再点一次。", true);
      });
    }
    if ((action === "dictation-check" || action === "dictation-help") && item && !run.feedback) {
      if (activeLessonAudio || !run.heard) return;
      const input = document.querySelector("#dictation-answer");
      if (!input.value.trim() && action === "dictation-check") { announce("先写下你的答案。", true); return; }
      const result = checkDictation(run, input.value, phraseById.get(item.id).text, action === "dictation-help");
      let next = structuredClone(state); next.attempt.dictation = result.run;
      if (result.awardId) {
        const before = next.stars;
        next = grantMilestone(next, `${activeUnitId}:dictation:${result.awardId}`, UNIT_REWARD_RULES.dictation, {
          type: "stars-earned", unitId: activeUnitId, title: "听音默写", detail: phraseById.get(result.awardId)?.text || result.awardId
        });
        next.attempt.dictation.earned += next.stars - before;
      }
      if (activeContent.dictationPhraseIds.every((id) => next.attempt.dictation.records[id]?.passed)) {
        next.attempt.tasks.dictation = true;
        if (!activeContent.practiceStages?.application) next.attempt.tasks[activeContent.steps.some(s=>s.id==="story") ? "words" : "dictation"] = true;
      }
      if (stepIdsFor().every(step => next.attempt.tasks[step])) {
        syncActiveUnit(next);
        next = bindActiveUnit(settleProductUnitRun(next, activeUnitId, activeContent.number));
      }
      if (commitDictation(next)) { renderDictation(); playCue(result.awardId ? "success" : "retry"); }
    }
    if (action === "dictation-next") {
      const next = structuredClone(state); next.attempt.dictation = advanceDictation(run);
      if (commitDictation(next)) renderDictation();
    }
    if (action === "dictation-new" && !item) {
      const next = structuredClone(state);
      next.attempt.dictation = { ...newDictation(run.targetIds || activeContent.dictationPhraseIds, run.order, run.records, Math.random, run.queue.at(-1)?.id), targetIds: run.targetIds || activeContent.dictationPhraseIds };
      if (commitDictation(next)) renderDictation();
    }
    if (action === "dictation-finish" && !item) { screen = activeContent.practiceStages?.application ? "application" : stepIdsFor().every(step => state.attempt.tasks[step]) ? "complete" : "unit-home"; render(); }
    return;
  }

  if (action === "close-parent-modal") { closeParentModal(); return; }
  if (action === "toggle-password") {
    const input = document.querySelector(`#${button.dataset.target}`);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
    button.textContent = input.type === "password" ? "显示" : "隐藏";
    return;
  }
  if (action === "open-parent-recovery") { openParentModal("recovery"); return; }
  if (action === "recovery-code-saved") { oneTimeRecoveryCode = ""; enterParentCenter(); return; }
  if (action === "change-parent-password") { openParentModal("change"); return; }
  if (action === "exit-parent-test") { exitParentTest(); return; }
  if (action === "start-parent-test-course") { startParentTest("course"); return; }
  if (action === "start-parent-test-step") { startParentTest("step"); return; }
  if (action === "start-parent-test-review") { startParentTest("review"); return; }
  if (action === "start-parent-test-up2") { startParentTestUp2(button.dataset.scenario || "course"); return; }
  if (action === "start-parent-test-up3") { startParentTestUp3(button.dataset.scenario || "course"); return; }
  if (action.startsWith("request-")) {
    if (testSession) { showToast("测试模式不会执行正式数据操作。"); return; }
    const dangerAction = action.replace("request-", "");
    if (dangerDefinitions[dangerAction]) openParentModal("danger", { dangerAction });
    return;
  }

  if (action === "open-unit") { if (!activateUnit(button.dataset.unitId || "unit1")) return; state.lastUnitId = activeUnitId; saveState(); startBackgroundMusic(); screen = "unit-home"; render(); }
  if (action === "back-course") { worldMenuOpen = false; if (testSession) exitParentTest(); else { screen = "course"; render(); } }
  if (action === "start") { screen = stepIdsFor().find((step) => !state.attempt.tasks[step]) || button.dataset.screen || stepIdsFor()[0]; render(); }
  if (action === "unit2-supplement" && activeUnitId === "unit2") {
    state.attempt.words = { mode: "learn", listenedIds: activeContent.learnPhraseIds.slice(0, 3), groupIndex: 1, supplementOnly: true, questionIndex: 3, heardQuestionId: null };
    if (!saveState()) return;
    screen = "words";
    render();
  }
  if (action === "restart") restartUnit();
  if (action === "open-step") {
    const next = button.dataset.screen;
    if (!stepIsOpen(next)) { announce("先完成上一步。", true); return; }
    if (next === "words" && state.attempt.tasks.words) state.attempt.words = { mode: "quiz", listenedIds: [...activeContent.learnPhraseIds], groupIndex: 0, supplementOnly: false, questionIndex: 0, heardQuestionId: null };
    if (next === "sentences" && state.attempt.tasks.sentences) state.attempt.sentences.itemIndex = 0;
    if (next === "dialogue" && state.attempt.tasks.dialogue) state.attempt.dialogue.sceneIndex = 0;
    if (next === "transfer" && state.attempt.tasks.transfer) state.attempt.transfer.itemIndex = 0;
    if (next === "story" && state.attempt.tasks.story) {
      state.attempt.sentences.itemIndex = 0;
      state.attempt.dialogue.sceneIndex = 0;
      state.attempt.transfer.itemIndex = 0;
    }
    milestoneMessage = "";
    screen = next === "story" && state.attempt.tasks.story && !activeContent.practiceStages?.story ? "sentences" : next;
    if (activeContent.practiceStages?.[next] && state.attempt.tasks[next]) state.attempt.practice.indices[next]=0;
    saveState();
    render();
  }
  if (action === "back-home") { screen = "unit-home"; render(); }
  if (action === "back-hub") {
    if (screen === "parent") {
      exitParentCenter();
      return;
    }
    screen = returnScreen;
    render();
    return;
  }
  if (action === "wish" && !testSession) { worldMenuOpen = false; if (!["wish", "growth"].includes(screen)) returnScreen = screen; wishEditing = false; screen = "wish"; render(); }
  if (action === "growth" && !testSession) { worldMenuOpen = false; if (!["wish", "growth"].includes(screen)) returnScreen = screen; screen = "growth"; render(); }
  if (action === "parent") { worldMenuOpen = false; if (testSession) exitParentTest(); else parentGate(); }
  if (action === "edit-wish") { wishEditing = true; renderWish(); }
  if (action === "cancel-wish-edit") { wishEditing = false; renderWish(); }

  if (action === "learn-phrase") {
    const phrase = phraseById.get(button.dataset.phraseId);
    if (!phrase) return;
    document.querySelectorAll('[data-action="learn-phrase"]').forEach((card) => { card.disabled = true; });
    announce("正在播放。");
    say(phrase.text, phrase.modelAudioSrc || phrase.audioSrc, () => {
      if (!state.attempt.words.listenedIds.includes(phrase.id)) state.attempt.words.listenedIds.push(phrase.id);
      saveState();
      renderWords();
    }, renderWords);
  }
  if (action === "word-group-prev" || action === "word-group-next") {
    const words = state.attempt.words;
    const groups=activeContent.wordGroups?.map(g=>g.ids)||(activeUnitId==='unit2'?[0,1,2].map(i=>activeContent.learnPhraseIds.slice(i*3,i*3+3)):[]);
    if (words.mode !== "learn" || !groups.length) return;
    const current = Math.min(groups.length-1, Math.max(0, words.groupIndex || 0));
    const group = groups[current];
    if (action === "word-group-next" && !group.every((id) => words.listenedIds.includes(id))) return;
    words.groupIndex = Math.min(groups.length-1, Math.max(0, current + (action === "word-group-next" ? 1 : -1)));
    saveState();
    renderWords();
  }
  if (action === "play-song" && activeContent.song) {
    button.disabled = true;
    button.textContent = "播放中…";
    say("", activeContent.song.audioSrc, () => { button.disabled = false; button.textContent = "再听歌曲"; }, () => { button.disabled = false; button.textContent = "重新播放"; });
  }
  if (action === "start-word-quiz") {
    if (!activeContent.learnPhraseIds.every((id) => state.attempt.words.listenedIds.includes(id))) return;
    state.attempt.words.mode = "quiz";
    state.attempt.words.questionIndex = state.attempt.words.supplementOnly ? 3 : 0;
    state.attempt.words.heardQuestionId = null;
    saveState(); renderWords();
  }
  if (action === "play-question") {
    const run = state.attempt.words;
    const question = UNIT_PHRASE_QUIZ[run.questionIndex];
    if (!question || question.id !== button.dataset.questionId) return;
    const target = phraseById.get(question.targetId);
    button.disabled = true;
    button.textContent = "播放中…";
    const restoreQuestionButton = (label) => {
      button.disabled = false;
      button.textContent = label;
    };
    say(target.text, question.audioSrc || target.audioSrc, () => {
      if (screen !== "words" || UNIT_PHRASE_QUIZ[state.attempt.words.questionIndex]?.id !== question.id) return;
      restoreQuestionButton("再听一次");
      run.heardQuestionId = question.id;
      saveState();
      document.querySelectorAll('[data-action="phrase-choice"]').forEach((choice) => { choice.disabled = false; });
      announce("请选择图片。");
    }, () => restoreQuestionButton("重新播放"));
  }
  if (action === "phrase-choice") {
    if (transitioning) return;
    const run = state.attempt.words;
    const question = UNIT_PHRASE_QUIZ[run.questionIndex];
    if (run.heardQuestionId !== question.id) return;
    if (button.dataset.phraseId !== question.targetId) {
      button.classList.add("wrong");
      announce("再听一次。", true);
      playCue("retry");
      return;
    }
    button.classList.add("correct");
    document.querySelectorAll(".phrase-card").forEach((card) => { card.disabled = true; });
    transitioning = true;
    const earned = awardItem("words", question.id);
    if (!saveState()) { transitioning = false; renderWords(); return; }
    announce(earned ? `答对了 · +${earned} 星` : "答对了。");
    playCue();
    if (run.questionIndex === UNIT_PHRASE_QUIZ.length - 1) {
      if (activeContent.steps.some(s=>s.id==="story")) {
        if (!activeContent.dictationPhraseIds.length && !activeContent.practiceStages?.application) {
          if (!completeStep("words", { questionIndex: 0, heardQuestionId: null })) {
            transitioning = false;
            renderWords();
            return;
          }
          setTimeout(() => { transitioning = false; screen = "unit-home"; render(); }, 700);
          return;
        }
        if(activeContent.practiceStages?.application||activeContent.resumeWordsDictation)run.mode="dictation";
        const targetIds = run.supplementOnly ? activeContent.dictationPhraseIds.slice(3) : activeContent.dictationPhraseIds;
        state.attempt.dictation = { ...newDictation(targetIds, [], state.attempt.dictation.records), targetIds };
        if (!saveState()) { transitioning = false; renderWords(); return; }
        setTimeout(() => { transitioning = false; screen = "dictation"; render(); }, 700);
      } else {
        completeStep("words", { questionIndex: 0 });
        setTimeout(() => { transitioning = false; screen = "unit-home"; render(); }, 700);
      }
    } else {
      run.questionIndex += 1;
      run.heardQuestionId = null;
      saveState();
      setTimeout(() => { transitioning = false; renderWords(); }, 650);
    }
  }

  if (action === "play-listening-question") {
    const run = state.attempt.listening;
    const question = UNIT_LISTENING_QUIZ[run.questionIndex];
    if (!question || question.id !== button.dataset.questionId) return;
    const target = phraseById.get(question.targetId);
    button.disabled = true;
    button.textContent = "播放中…";
    say(target.text, question.audioSrc || target.audioSrc, () => {
      if (screen !== "listening" || UNIT_LISTENING_QUIZ[state.attempt.listening.questionIndex]?.id !== question.id) return;
      run.heardQuestionId = question.id;
      saveState();
      document.querySelectorAll('[data-action="listening-choice"]').forEach((choice) => { choice.disabled = false; });
      button.disabled = false;
      button.textContent = "再听一次";
      announce("请选择正确的图片。");
    }, () => { button.disabled = false; button.textContent = "重新播放"; });
  }
  if (action === "listening-choice") {
    if (transitioning) return;
    const run = state.attempt.listening;
    const question = UNIT_LISTENING_QUIZ[run.questionIndex];
    if (!question || run.heardQuestionId !== question.id) return;
    if (button.dataset.phraseId !== question.targetId) {
      button.classList.add("wrong");
      announce("再听一次。", true);
      playCue("retry");
      return;
    }
    if (!run.correctIds.includes(question.id)) run.correctIds.push(question.id);
    button.classList.add("correct");
    document.querySelectorAll(".phrase-card").forEach((card) => { card.disabled = true; });
    transitioning = true;
    playCue();
    if (run.questionIndex === UNIT_LISTENING_QUIZ.length - 1) {
      const earned = awardItem("listening", "complete");
      if (!completeStep("listening", { questionIndex: 0, heardQuestionId: null })) { transitioning = false; renderListening(); return; }
      announce(earned ? `听力挑战完成 · +${earned} 星` : "听力挑战完成。");
      setTimeout(() => { transitioning = false; screen = "unit-home"; render(); }, 700);
    } else {
      run.questionIndex += 1;
      run.heardQuestionId = null;
      saveState();
      announce("答对了。");
      setTimeout(() => { transitioning = false; renderListening(); }, 650);
    }
  }

  if (action === "play-stage-song") {
    button.disabled = true;
    button.textContent = "播放中…";
    say("", activeContent.song.audioSrc, () => {
      if (screen !== "song") return;
      state.attempt.song.listened = true;
      saveState();
      renderSong();
      announce(activeContent.song.kind==="rhyme"?"歌谣听完了，现在轮到你读一读。":"歌曲听完了，现在轮到你唱一唱。");
    }, () => { button.disabled = false; button.textContent = "重新播放"; });
  }
  if (action === "finish-song") {
    if (!state.attempt.song.listened || !state.attempt.song.recordingIds.song) return;
    if (!completeStep("song")) return;
    screen = "unit-home";
    render();
  }
  if (action === "project-choice") {
    const item = activeContent.projectItems?.find(({ id }) => id === button.dataset.itemId);
    if (!item) return;
    if (button.dataset.value !== item.answer) {
      button.classList.add("wrong");
      announce("再看看房间，换一个位置。", true);
      playCue("retry");
      return;
    }
    state.attempt.project.placements[item.id] = item.answer;
    saveState();
    playCue();
    renderProject();
  }
  if (action === "project-hint") {
    if (!state.attempt.project.recordingIds.project) return;
    const current = Math.max(0, Math.min(3, Number(state.attempt.project.hintLevel) || 0));
    state.attempt.project.hintLevel = current === 3 ? 0 : current + 1;
    saveState();
    renderProject();
  }
  if (action === "finish-project") {
    const ready = activeContent.projectType==="bookmark"?bookmarkReady(state.attempt.project):(activeContent.projectItems || []).every(({ id, answer }) => state.attempt.project.placements[id] === answer);
    if (!ready || !state.attempt.project.recordingIds.project) return;
    if (!completeStep("project")) return;
    screen = "complete";
    render();
  }

  if (action === "play-follow-line") {
    const item = UNIT_SENTENCES.find((line) => line.id === button.dataset.itemId);
    if (!item) return;
    const run = state.attempt.sentences;
    milestoneMessage = "";
    button.disabled = true;
    button.textContent = "播放中…";
    say(item.text, item.audioSrc, () => {
      button.disabled = false;
      button.textContent = "再听一次";
      if (!run.listenedIds.includes(item.id)) run.listenedIds.push(item.id);
      saveState();
      const recordButton = document.querySelector(`[data-action="record"][data-item-id="${item.id}"]`);
      if (recordButton) { recordButton.disabled = false; announce("现在跟着说一遍。"); }
    }, () => { button.disabled = false; button.textContent = "重新播放"; });
  }
  if (action === "play-dialogue-cue") {
    const scene = UNIT_DIALOGUES.find((item) => item.id === button.dataset.sceneId);
    if (!scene) return;
    const run = state.attempt.dialogue;
    milestoneMessage = "";
    button.disabled = true;
    button.textContent = "播放中…";
    say(scene.lines[0].text, scene.lines[0].audioSrc, () => {
      button.disabled = false;
      button.textContent = "再听一次";
      if (!run.listenedIds.includes(scene.id)) run.listenedIds.push(scene.id);
      saveState();
      const recordButton = document.querySelector(`[data-action="record"][data-item-id="${scene.id}"]`);
      if (recordButton) { recordButton.disabled = false; announce("轮到你接下句。"); }
    }, () => { button.disabled = false; button.textContent = "重新播放"; });
  }
  if (action === "play-dialogue-reply") {
    const scene = UNIT_DIALOGUES.find((item) => item.id === button.dataset.sceneId);
    if (scene) say(scene.lines[1].text, scene.lines[1].audioSrc);
  }
  if (action === "play-scene-dialogue") {
    const scene = UNIT_TRANSFERS.find((item) => item.id === button.dataset.sceneId);
    if (!scene) return;
    button.disabled = true;
    button.textContent = "播放中…";
    playSceneAudio(scene, () => {
      if (!state.attempt.transfer.comparedIds.includes(scene.id)) state.attempt.transfer.comparedIds.push(scene.id);
      saveState();
      button.disabled = false;
      button.textContent = "再听教材对话";
      announce("听完了。和自己的讲述比一比。");
    }, () => { button.disabled = false; button.textContent = "重新播放"; });
  }
  if (action === "next-dialogue") {
    const run = state.attempt.dialogue;
    const scene = UNIT_DIALOGUES[run.sceneIndex];
    if (!run.recordingIds[scene.id]) return;
    if (run.sceneIndex === UNIT_DIALOGUES.length - 1) {
      if (activeUnitId === "unit2") {
        state.attempt.tasks.dialogue = true;
        saveState();
        screen = "transfer";
      } else {
        completeStep("dialogue");
        screen = "unit-home";
      }
    } else {
      milestoneMessage = `对话 ${run.sceneIndex + 1}/${UNIT_DIALOGUES.length} 完成。`;
      run.sceneIndex += 1;
      saveState();
    }
    render();
  }
  if (action === "record") beginRecording(button);
  if (action === "stop-record") stopRecording();
  if (action === "play-saved-recording") await playSavedRecording(button.dataset.id);
  if (action === "next-transfer") {
    const run = state.attempt.transfer;
    const scene = UNIT_TRANSFERS[run.itemIndex];
    if (!run.recordingIds[scene.id]) return;
    if (run.itemIndex === UNIT_TRANSFERS.length - 1) {
      if (activeUnitId === "unit2") {
        state.attempt.tasks.transfer = true;
        completeStep("story");
      } else {
        completeStep("transfer");
      }
      screen = stepIdsFor().every((step) => state.attempt.tasks[step]) ? "complete" : "unit-home";
    } else {
      milestoneMessage = `场景 ${run.itemIndex + 1}/${UNIT_TRANSFERS.length} 完成。`;
      run.itemIndex += 1;
      saveState();
    }
    render();
  }

  if (action === "save-wish") {
    const input = document.querySelector("#wish-title");
    const title = input?.value.trim() || "";
    const result = submitWish(state, title);
    if (!result.changed) {
      const feedback = document.querySelector("#wish-feedback");
      if (feedback) { feedback.textContent = result.reason; feedback.classList.add("warn"); }
      return;
    }
    state = result.state;
    if (!saveState()) return;
    wishEditing = false;
    renderWish();
    showToast(result.reason);
  }
  if (action === "save-wish-target") {
    const target = Number(document.querySelector("#wish-target")?.value);
    const priceInput = document.querySelector("#wish-price")?.value.trim() || "";
    const price = priceInput ? Number(priceInput) : 0;
    const feedback = document.querySelector("#parent-feedback");
    if (!Number.isInteger(target) || target < 1 || target > 9999) { if (feedback) { feedback.textContent = "目标星星需为 1–9999 的整数。"; feedback.classList.add("warn"); } return; }
    if (!Number.isFinite(price) || price < 0 || price > 500) { if (feedback) { feedback.textContent = "礼物价格可留空；填写时需在 0–500 元之间。"; feedback.classList.add("warn"); } return; }
    const result = setWishTargetState(state, target, price);
    if (!result.changed) { if (feedback) { feedback.textContent = "当前心愿不能调整目标。"; feedback.classList.add("warn"); } return; }
    state = result.state;
    if (!saveState()) return;
    renderParent();
    showToast("心愿目标已更新。");
  }
  if (action === "record-redemption") {
    if (!document.querySelector("#wish-safe")?.checked) return;
    const result = redeemWish(state);
    if (!result.check.allowed) return;
    state = result.state;
    if (!saveState()) return;
    renderParent();
    showToast("心愿已兑现并记录。");
  }
  if (action === "sound-toggle") { state.settings.sound = !state.settings.sound; if (!state.settings.sound) stopLessonAudio(); saveState(); render(); }
  if (action === "music-toggle") { state.settings.music = !state.settings.music; saveState(); if (state.settings.music) startBackgroundMusic(); else stopBackgroundMusic(); render(); }
});

document.addEventListener("input", event => {
  if(screen==='up3-node'&&event.target.matches('[data-up3-answer]')) {
    const activity=up3CurrentActivity();
    if(!activity||!['select-write','letter-write','spell','word-practice'].includes(activity.type))return;
    state.up.up3.activityEvidence[activity.id]={...state.up.up3.activityEvidence[activity.id],draft:event.target.value,checked:false,written:false};
    saveState();return;
  }
  if (screen === "up2-node" && event.target.matches("[data-up-answer]")) {
    const activity=up2CurrentActivity();
    if(!activity || !["write-choice","word-practice"].includes(activity.type))return;
    state.up.up2.activityEvidence[activity.id]={...beginUp2Spelling(up2Evidence(activity)),draft:event.target.value,checked:false,written:false};
    saveState(); return;
  }
  if (event.target.id !== "dictation-answer" || screen !== "dictation") return;
  const next = structuredClone(state); next.attempt.dictation.draft = event.target.value;
  commitDictation(next);
});
document.addEventListener("pointerdown", (event) => {
  const viewport = event.target.closest?.(".course-map-viewport");
  if (screen !== "course" || !viewport || event.target.closest?.("button")) return;
  courseMapSwipeStart = { x: event.clientX, y: event.clientY, width: viewport.clientWidth };
});
document.addEventListener("pointerup", (event) => {
  if (!courseMapSwipeStart) return;
  const { x, y, width } = courseMapSwipeStart;
  courseMapSwipeStart = null;
  const dx = event.clientX - x, dy = event.clientY - y;
  if (Math.abs(dx) < Math.min(96, width * .14) || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
  setCourseMapPage(dx < 0 ? 2 : 1);
});
document.addEventListener("pointercancel", () => { courseMapSwipeStart = null; });
document.addEventListener("focusin", (event) => {
  if (!event.target.matches("input, textarea, select")) return;
  setTimeout(() => event.target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" }), 280);
});
document.addEventListener("change", (event) => {
  if(event.target.id==='parent-up-select'&&screen==='parent'){
    if(!parentUpCourses().some(item=>item.id===event.target.value))return;
    parentUpCourseId=event.target.value;renderParent();return;
  }
  if (event.target.id !== "parent-unit-select" || screen !== "parent") return;
  if (!UNITS[event.target.value]) return;
  parentUnitId = event.target.value;
  renderParent();
});
document.addEventListener("keydown", event => {
  if (screen === "reading-book" && !event.target.matches("input, textarea, select") && ["ArrowLeft","ArrowRight"].includes(event.key)) {
    event.preventDefault();
    document.querySelector(`[data-action="${event.key === "ArrowRight" ? "next-reading-page" : "previous-reading-page"}"]`)?.click();
    return;
  }
  if (screen === "course" && !event.target.matches("input, textarea, select") && ["ArrowLeft","ArrowRight"].includes(event.key)) {
    event.preventDefault();
    setCourseMapPage(event.key === "ArrowRight" ? 2 : 1);
    document.querySelector(".course-map-arrow:not([hidden])")?.focus();
    return;
  }
  if (event.target.id === "dictation-answer" && event.key === "Enter" && !event.isComposing) {
    event.preventDefault(); document.querySelector('[data-action="dictation-check"]')?.click();
  }
});
document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-parent-form]");
  if (!form) return;
  event.preventDefault();
  handleParentForm(form);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && worldMenuOpen) { setWorldMenu(false); document.querySelector('[data-action="toggle-world-switch"]')?.focus(); return; }
  if (event.key === "Escape" && authModal && authModal.mode !== "recovery-success" && !authBusy && !dangerBusy) closeParentModal();
});
window.addEventListener("pagehide", () => { stopBackgroundMusic(); stopLessonAudio(); cancelRecording(); });
const up3PortraitMedia = window.matchMedia?.("(orientation: portrait)");
const refreshUp3BookOrientation = () => {
  if (screen === "up3-node" && up3CurrentActivity()?.type === "book") renderUp3Node();
};
if (up3PortraitMedia?.addEventListener) up3PortraitMedia.addEventListener("change", refreshUp3BookOrientation);
else up3PortraitMedia?.addListener?.(refreshUp3BookOrientation);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopBackgroundMusic();
    stopLessonAudio();
    cancelRecording();
    if (screen === "parent") { parentSession = false; screen = returnScreen; closeParentModal(); render(); }
    else if (screen === "dictation") renderDictation();
  } else {
    if (musicStarted && recorder?.state !== "recording") startBackgroundMusic();
    pwa.registration?.update().catch(() => {});
  }
});
document.documentElement.classList.toggle("simple", state.settings.simple);

async function bootstrap() {
  try { await migrateLegacyParentPin(); } catch {}
  try { await validateRecordingEvidence(); } catch {}
  if (pendingMigrationRaw && !saveState()) {
    $app.innerHTML = '<p role="alert">升级保存未完成。现有学习数据没有被覆盖，请释放一些设备空间后刷新重试。</p>';
    return;
  }
  render();
  registerPwa();
}

bootstrap();
