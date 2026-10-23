import { normalizeReview, REVIEW_REWARD_LIMIT } from './core.mjs';
import { UP2_CHAPTERS, UP2_NODE_BY_ID, UP2_NODES, UP2_LEGACY_ORDER, UP2_V2_ORDER, UP2_CONTENT_REVISION, UP2_VOCAB_BY_ID, UP2_RETIRED_ACTIVITY_NEXT } from './up2-content.mjs';
export const up2WritingKey = value => String(value || '').toLowerCase().replace(/[^a-z]+/g,' ').trim();
export const up2Tokens = text => text.match(/[A-Za-z]+(?:['’][A-Za-z]+)?|[^A-Za-z]+/g) || [];
export function beginUp2Spelling(e={}) {
  if(e.writingMode===2)return e;
  const previousSpelling=e.draft || e.written || e.checked ? {draft:e.draft||'',written:Boolean(e.written),checked:Boolean(e.checked)} : e.previousSpelling;
  return {...e,previousSpelling,writingMode:2,draft:'',written:false,checked:false,writeHeard:false,showSpelling:false};
}
export const up2SpellingComplete = (a,e) => e.writingCheckVersion===2 && !e.showSpelling && ['independent','supported'].includes(e.writingResult) && (up2WritingKey(e.draft)===up2WritingKey(a.answer) || Boolean(e.completedAt && a.legacyAnswer && up2WritingKey(e.draft)===up2WritingKey(a.legacyAnswer)));
export const up2TargetIndices = a => up2Tokens(a.text).flatMap((s,i)=>a.targets.some(t=>t.toLowerCase()===s.toLowerCase().replace(/['’]s$/,''))?[i]:[]);
export const up2ReadingSteps = a => [...a.lines,...(a.paragraph?[a.paragraph]:[])];
// Global token indices remain unchanged: old selected words survive pagination.
export function up2FindSections(a) {
  const tokens=up2Tokens(a.text),wanted=new Set(up2TargetIndices(a));
  let offset=0;
  return (a.sections||[{text:a.text,art:a.art}]).map((section,i)=>{
    const start=offset,end=start+section.text.length;offset=end+1;
    let at=0;
    const items=tokens.map((text,index)=>{const pos=at;at+=text.length;return {text,index,pos};})
      .filter(t=>t.pos<end&&t.pos+t.text.length>start)
      .map(t=>({...t,text:t.text.slice(Math.max(0,start-t.pos),end-t.pos)}));
    const indices=items.filter(t=>wanted.has(t.index)).map(t=>t.index);
    return {...section,id:`${a.id}-part-${i+1}`,items,indices,targets:a.targets.filter(target=>items.some(t=>up2WritingKey(t.text.replace(/['’]s$/,''))===up2WritingKey(target)))};
  }).filter(s=>s.indices.length);
}
export const up2FindSection = (a,e={}) => {const parts=up2FindSections(a);return parts[Math.max(0,Math.min(parts.length-1,e.findIndex||0))];};
export const up2FindSectionComplete = (section,e={}) => {
  const selected=(e.selected||[]).filter(i=>section.items.some(t=>t.index===i));
  return new Set(selected).size===section.indices.length && section.indices.every(i=>selected.includes(i));
};
// Reuse only a listened-to, recorded exact target. Page completion is insufficient.
// This is attempt evidence, not a pronunciation or comprehension score.
export function up2EvidenceFor(a, all={}) {
  const e=all[a.id]||{};
  if(a.type!=='word-practice')return e;
  const source=all[a.contextActivityId];
  let recordingId=a.contextLineId && source?.heardIds?.includes(a.contextLineId) ? source.lineRecordings?.[a.contextLineId] : '';
  let evidenceSource=recordingId?`${a.contextActivityId}/${a.contextLineId}`:'';
  if(!recordingId)for(const group of UP2_NODES.flatMap(n=>n.activities).filter(item=>item.type==='phonics')) {
    const word=group.words.find(w=>up2WritingKey(w.text)===up2WritingKey(a.answer)),prior=all[group.id];
    if(word && prior?.heardIds?.includes(word.text) && prior.wordRecordings?.[word.text]) {
      recordingId=prior.wordRecordings[word.text];evidenceSource=`${group.id}/${word.text}`;break;
    }
  }
  if(!recordingId)return e;
  return {...e,learned:true,contextRecordingId:recordingId,contextEvidenceSource:evidenceSource,
    phase:UP2_VOCAB_BY_ID.get(a.wordId).level===4?3:2};
}
export function isUp2ActivityComplete(a,e={}) {
  if (!a) return false;
  if (a.type === 'word-practice') return e.learned === true && Boolean(e.recordingId || e.contextRecordingId) && (UP2_VOCAB_BY_ID.get(a.wordId).level !== 4 || e.written === true && e.writeHeard === true && up2SpellingComplete(a,e));
  if (a.type === 'notice') return e.read === true;
  if (a.type === 'reading') return (!a.audioSrc || a.lines.length===1 || e.heard === true) && a.lines.every(l => Boolean(e.lineRecordings?.[l.id]) && e.heardIds?.includes(l.id)) && (!a.paragraph || Boolean(e.completedAt && !e.readingMode) || Boolean(e.lineRecordings?.[a.paragraph.id] && e.heardIds?.includes(a.paragraph.id)));
  if (a.type === 'speak') return Boolean(e.recordingId);
  if (a.type === 'phonics') return a.words.every(w=>e.heardIds?.includes(w.text) && e.wordRecordings?.[w.text]);
  if (['choice','picture-choice','write-choice'].includes(a.type)) return e.choice === a.answer && (!a.audioSrc || e.heard === true) && (a.type !== 'write-choice' || e.checked === true && up2SpellingComplete(a,e));
  if (a.type === 'find') { const indices = up2TargetIndices(a); return indices.length>0 && e.checked === true && new Set(e.selected).size === indices.length && indices.every(i=>e.selected?.includes(i)); }
  return false;
}
export function newUp2State() {
  return { contentRevision:UP2_CONTENT_REVISION, completedEver:false, completedNodeIds:[], verifiedNodeIds:[], activeNodeId:'', activeActivityId:'',activityIndex:0,nodeCursors:{},nodeActivityIds:{},activityEvidence:{},history:[],review:normalizeReview() };
}
export function normalizeUp2State(saved) {
  const base = newUp2State();
  if (!saved || typeof saved !== 'object') return base;
  const priorOrder=saved.contentRevision===2?UP2_V2_ORDER:UP2_LEGACY_ORDER;
  const next = {...base,...saved,contentRevision:UP2_CONTENT_REVISION,completedEver:Boolean(saved.completedEver),
    completedNodeIds:[...new Set(saved.completedNodeIds || [])].filter(id=>UP2_NODE_BY_ID.has(id)),
    verifiedNodeIds:[...new Set(saved.verifiedNodeIds || [])].filter(id=>UP2_NODE_BY_ID.has(id)),
    nodeCursors:{...saved.nodeCursors},nodeActivityIds:{...saved.nodeActivityIds},activityEvidence:{...saved.activityEvidence},
    history:Array.isArray(saved.history)?saved.history:[],review:normalizeReview(saved.review)};
  // Historical completion is not evidence for newly added tasks.
  for (const node of UP2_NODES) {
    const id = saved.nodeActivityIds?.[node.id] || (saved.contentRevision !== UP2_CONTENT_REVISION ? priorOrder[node.id]?.[saved.nodeCursors?.[node.id] || 0] : '');
    if(id) { const index=node.activities.findIndex(a=>a.id===(UP2_RETIRED_ACTIVITY_NEXT[id]||id)); next.nodeCursors[node.id]=index<0?0:index;next.nodeActivityIds[node.id]=node.activities[next.nodeCursors[node.id]].id; }
  }
  const node=UP2_NODE_BY_ID.get(saved.activeNodeId);
  next.activeNodeId=node?.id||'';
  if(node) {
    const id=saved.activeActivityId || (saved.contentRevision !== UP2_CONTENT_REVISION ? priorOrder[node.id]?.[saved.activityIndex||0] : node.activities[saved.activityIndex||0]?.id);
    next.activityIndex=Math.max(0,node.activities.findIndex(a=>a.id===(UP2_RETIRED_ACTIVITY_NEXT[id]||id)));next.activeActivityId=node.activities[next.activityIndex].id;
  } else {next.activityIndex=0;next.activeActivityId='';}
  return next;
}
export function canOpenUp2Node(up,id) {
  const node=UP2_NODE_BY_ID.get(id); if(!node) return false;
  const chapter=UP2_CHAPTERS.find(c=>c.id===node.chapterId),pos=chapter.nodeIds.indexOf(id);
  return pos===0 || up.completedNodeIds.includes(chapter.nodeIds[pos-1]) || up.completedNodeIds.includes(id);
}
export function openUp2Node(up,id) {
  if(!canOpenUp2Node(up,id)) return up;
  const next=structuredClone(up),node=UP2_NODE_BY_ID.get(id);
  if(next.activeNodeId){next.nodeCursors[next.activeNodeId]=next.activityIndex;next.nodeActivityIds[next.activeNodeId]=next.activeActivityId;}
  let index=node.activities.findIndex(a=>a.id===next.nodeActivityIds[id]);
  if(index<0 || next.completedNodeIds.includes(id)) index=node.activities.findIndex(a=>!isUp2ActivityComplete(a,up2EvidenceFor(a,next.activityEvidence)));
  next.activeNodeId=id;next.activityIndex=Math.max(0,index);next.activeActivityId=node.activities[next.activityIndex].id;
  return next;
}
export function completeUp2Activity(up,nodeId,activityId,evidence) {
  const node=UP2_NODE_BY_ID.get(nodeId),a=node?.activities[up.activityIndex];
  if(!node || up.activeNodeId!==nodeId || !canOpenUp2Node(up,nodeId) || a?.id!==activityId || !isUp2ActivityComplete(a,evidence)) return null;
  const next=structuredClone(up);
  next.activityEvidence[a.id]={...evidence,completedAt:evidence.completedAt||Date.now()};
  for(const item of node.activities) {
    if(item.type==='word-practice')next.activityEvidence[item.id]=up2EvidenceFor(item,next.activityEvidence);
  }
  const pending=node.activities.findIndex(item=>!isUp2ActivityComplete(item,next.activityEvidence[item.id]));
  if(pending>=0) {
    next.activityIndex=pending;next.activeActivityId=node.activities[pending].id;
    next.nodeCursors[nodeId]=pending;next.nodeActivityIds[nodeId]=next.activeActivityId;
    return {up:next,nodeCompleted:false,courseCompleted:false,reviewReward:0};
  }
  next.activeNodeId='';next.activeActivityId='';next.activityIndex=0;
  delete next.nodeCursors[nodeId];delete next.nodeActivityIds[nodeId];
  const nodeCompleted=!next.verifiedNodeIds.includes(nodeId);
  if(nodeCompleted)next.verifiedNodeIds.push(nodeId);
  if(!next.completedNodeIds.includes(nodeId))next.completedNodeIds.push(nodeId);
  const courseCompleted=nodeCompleted && next.verifiedNodeIds.length===UP2_NODES.length;
  let reviewReward=0;
  if(courseCompleted && next.review.active) {
    reviewReward=next.review.rewardedCount<REVIEW_REWARD_LIMIT?5:0;
    next.review={...next.review,active:false,completedCount:next.review.completedCount+1,rewardedCount:next.review.rewardedCount+(reviewReward?1:0),lastAwardedStars:reviewReward,lastCompletedAt:Date.now()};
  }
  if(courseCompleted)next.completedEver=true;
  return {up:next,nodeCompleted,courseCompleted,reviewReward};
}
export function startUp2Review(up,now=Date.now()) {
  if(!up.completedEver || up.review.active)return up;
  const next=newUp2State();next.completedEver=true;
  next.history=[...up.history,{contentRevision:up.contentRevision,completedNodeIds:structuredClone(up.completedNodeIds),activityEvidence:structuredClone(up.activityEvidence),review:structuredClone(up.review),archivedAt:now}];
  next.review={...normalizeReview(up.review),active:true,runId:`up2-review-${up.review.completedCount+1}-${now}`,startedAt:now,lastAwardedStars:0};
  return next;
}
