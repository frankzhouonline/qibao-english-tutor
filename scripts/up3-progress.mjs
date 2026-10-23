import { normalizeReview, REVIEW_REWARD_LIMIT } from './core.mjs';
import { UP3_NODE_BY_ID, UP3_NODES, UP3_PREVIOUS_ORDER, UP3_REV4_ORDER, UP3_REMOVED_ACTIVITY_RESUME } from './up3-content.mjs';

export const writingKey = value => String(value||'').toLowerCase().trim().replace(/\s+/g,' ');
export const tokenWords = text => String(text||'').match(/[A-Za-z]+(?:['’][A-Za-z]+)?|[^A-Za-z]+/g)||[];
export function findTargets(a) {
  const wanted=new Set(a.targets.map(writingKey));
  return tokenWords(a.text).flatMap((text,i)=>wanted.has(writingKey(text))?[i]:[]);
}
export function findSelectionComplete(a,e={}) {
  const targets=findTargets(a),selected=new Set(e.selected||[]);
  if(!targets.length||[...selected].some(i=>!targets.includes(i)))return false;
  if(!a.matchOnce)return selected.size===targets.length&&targets.every(i=>selected.has(i));
  const tokens=tokenWords(a.text),found=new Set([...selected].map(i=>writingKey(tokens[i])));
  return a.targets.every(word=>found.has(writingKey(word)));
}
export function findSections(a) {
  const tokens=tokenWords(a.text);let offset=0;
  return (a.sections||[{text:a.text,art:a.art}]).map((section,i)=>{
    const start=offset,end=start+section.text.length;offset=end+1;let at=0;
    const items=tokens.map((text,index)=>{const pos=at;at+=text.length;return {text,index,pos};})
      .filter(t=>t.pos<end&&t.pos+t.text.length>start)
      .map(t=>({...t,text:t.text.slice(Math.max(0,start-t.pos),end-t.pos)}));
    return {...section,id:`${a.id}-part-${i+1}`,items,targets:a.targets.filter(word=>items.some(t=>writingKey(t.text)===writingKey(word)))};
  }).filter(s=>s.targets.length);
}
export function findSection(a,e={}) {const sections=findSections(a);return sections[Math.max(0,Math.min(sections.length-1,e.findIndex||0))];}
export function readingSteps(a) {
  const breaks=a.paragraphBreaks||(!a.paragraphs||a.lines.length<2?[]:[a.lines.length]);
  const result=[];
  a.lines.forEach((item,index)=>{
    result.push({...item,kind:'line'});
    if(breaks.includes(index+1)) {
      const before=breaks.filter(n=>n<index+1).at(-1)||0;
      const slice=a.lines.slice(before,index+1);
      result.push({id:`${a.id}-paragraph-${breaks.indexOf(index+1)+1}`,kind:'paragraph',text:slice.map(l=>l.text).join(' '),audioSrc:a.audioSrc,lines:slice,art:slice.at(-1).art});
    }
  });
  return result;
}
export function canRecordUp3(a,e={},lineId='') {
  if(!a)return false;
  if(a.type==='book')return a.scenes.some(scene=>scene.id===lineId);
  if(a.type==='reading')return (!a.audioSrc||e.heardWhole===true)&&readingSteps(a)[e.stepIndex||0]?.id===lineId&&e.heardIds?.includes(lineId)===true;
  if(a.type==='word-practice')return e.phase===2&&e.learned===true;
  if(a.type==='word-group')return a.wordIds.every(id=>e.heardIds?.includes(id));
  if(a.type==='speak'||a.type==='word-say')return !(a.audioSrc||a.type==='word-say')||e.heard===true;
  return a.type==='spell'&&a.record===true&&e.heard===true&&e.checked===true&&!e.showModel;
}
export function isUp3ActivityComplete(a,e={}) {
  if(!a)return false;
  if(a.type==='reading')return (!a.audioSrc||e.heardWhole===true)&&readingSteps(a).every(step=>e.heardIds?.includes(step.id)&&(a.optionalRecording||Boolean(e.recordingIds?.[step.id])));
  if(a.type==='word-practice')return e.learned===true&&Boolean(e.recordingId)&&(a.level===3?e.phase===2:e.phase===3&&e.writeHeard===true&&e.written===true&&e.writingCheckVersion===2&&['independent','supported'].includes(e.writingResult)&&e.showSpelling!==true&&writingKey(e.draft)===writingKey(a.answer));
  if(a.type==='phonics')return e.heard===true&&e.noticed===true;
  if(a.type==='notice')return e.read===true&&(!a.audioSrc||e.heard===true);
  if(a.type==='word-group')return a.wordIds.every(id=>e.heardIds?.includes(id))&&Boolean(e.recordingId);
  if(a.type==='speak'||a.type==='word-say')return Boolean(e.recordingId)&&(!(a.audioSrc||a.type==='word-say')||e.heard===true);
  if(a.type==='object-find')return e.found===true;
  if(a.type==='choice')return e.choice===a.answer;
  if(a.type==='select-write'||a.type==='letter-write')return e.choice===a.answer&&e.checked===true&&writingKey(e.draft)===writingKey(a.answer)&&e.showModel!==true;
  if(a.type==='spell')return e.heard===true&&e.checked===true&&writingKey(e.draft)===writingKey(a.wordId.replaceAll('-',' '))&&(!a.record||Boolean(e.recordingId))&&e.showModel!==true;
  if(a.type==='find')return e.checked===true&&findSelectionComplete(a,e);
  if(a.type==='book')return e.finished===true&&a.scenes.every(scene=>e.viewedIds?.includes(scene.id));
  return false;
}
export function newUp3State() {
  return {contentRevision:5,completedEver:false,completedNodeIds:[],verifiedNodeIds:[],activeNodeId:'',activeActivityId:'',activityIndex:0,
    nodeCursors:{},nodeActivityIds:{},activityEvidence:{},history:[],review:normalizeReview()};
}
export function normalizeUp3State(saved) {
  const base=newUp3State();
  if(!saved||typeof saved!=='object')return base;
  const valid=new Set(UP3_NODES.map(n=>n.id));
  if(![3,4,5].includes(saved.contentRevision))return {...base,history:[...(Array.isArray(saved.history)?saved.history:[]),{kind:'withdrawn-up3-v02',archivedAt:Date.now(),snapshot:saved}]};
  const previousOrder=saved.contentRevision===3?UP3_PREVIOUS_ORDER:saved.contentRevision===4?UP3_REV4_ORDER:null;
  const resumeId=id=>UP3_REMOVED_ACTIVITY_RESUME[id]||id;
  const next={...base,...saved,contentRevision:5,
    completedNodeIds:[...new Set(saved.completedNodeIds||[])].filter(id=>valid.has(id)),
    verifiedNodeIds:[...new Set(saved.verifiedNodeIds||[])].filter(id=>valid.has(id)),
    nodeCursors:{...saved.nodeCursors},nodeActivityIds:{...saved.nodeActivityIds},activityEvidence:structuredClone(saved.activityEvidence||{}),
    history:Array.isArray(saved.history)?structuredClone(saved.history):[],review:normalizeReview(saved.review)};
  if(saved.contentRevision===3)next.history.push({kind:'interrupted-up3-v03',archivedAt:Date.now(),snapshot:structuredClone(saved)});
  if(saved.contentRevision===4)next.history.push({kind:'up3-before-teaching-parity-repair',archivedAt:Date.now(),snapshot:structuredClone(saved)});
  for(const node of UP3_NODES){
    const id=resumeId(saved.nodeActivityIds?.[node.id]||previousOrder?.[node.id]?.[saved.nodeCursors?.[node.id]||0]);
    if(id){const i=node.activities.findIndex(a=>a.id===id);next.nodeCursors[node.id]=Math.max(0,i);next.nodeActivityIds[node.id]=node.activities[Math.max(0,i)].id;}
  }
  const complete=id=>UP3_NODE_BY_ID.get(id).activities.every(a=>isUp3ActivityComplete(a,next.activityEvidence[a.id]));
  next.completedNodeIds=next.completedNodeIds.filter(complete);next.verifiedNodeIds=next.verifiedNodeIds.filter(complete);
  const active=UP3_NODE_BY_ID.get(saved.activeNodeId);
  next.activeNodeId=active?.id||'';
  const activeId=resumeId(saved.activeActivityId||previousOrder?.[active?.id]?.[saved.activityIndex||0]);
  next.activityIndex=active?activeId?Math.max(0,active.activities.findIndex(a=>a.id===activeId)):Math.max(0,Math.min(active.activities.length-1,Number(saved.activityIndex)||0)):0;
  next.activeActivityId=active?.activities[next.activityIndex].id||'';
  return next;
}
export function canOpenUp3Node(up,id) {
  const node=UP3_NODE_BY_ID.get(id);
  if(!node)return false;
  if(node.chapterId==='book')return true;
  const main=UP3_NODES.filter(item=>item.chapterId!=='book'),position=main.findIndex(item=>item.id===id);
  return position===0||up.completedNodeIds.includes(main[position-1].id)||up.completedNodeIds.includes(id);
}
export function openUp3Node(up,id) {
  if(!canOpenUp3Node(up,id))return up;
  const next=structuredClone(up),node=UP3_NODE_BY_ID.get(id);
  if(next.activeNodeId){next.nodeCursors[next.activeNodeId]=next.activityIndex;next.nodeActivityIds[next.activeNodeId]=next.activeActivityId;}
  let index=next.nodeCursors[id]||0;
  if(next.completedNodeIds.includes(id))index=node.activities.findIndex(a=>!isUp3ActivityComplete(a,next.activityEvidence[a.id]));
  next.activeNodeId=id;next.activityIndex=Math.min(node.activities.length-1,Math.max(0,index));next.activeActivityId=node.activities[next.activityIndex].id;
  return next;
}
export function completeUp3Activity(up,nodeId,activityId,evidence) {
  const node=UP3_NODE_BY_ID.get(nodeId),a=node?.activities[up.activityIndex];
  if(!node||up.activeNodeId!==nodeId||!canOpenUp3Node(up,nodeId)||a?.id!==activityId||!isUp3ActivityComplete(a,evidence))return null;
  const next=structuredClone(up);
  next.activityEvidence[a.id]={...evidence,completedAt:evidence.completedAt||Date.now()};
  const pending=node.activities.findIndex(item=>!isUp3ActivityComplete(item,next.activityEvidence[item.id]));
  if(pending>=0){next.activityIndex=pending;next.activeActivityId=node.activities[pending].id;next.nodeCursors[nodeId]=pending;next.nodeActivityIds[nodeId]=next.activeActivityId;return {up:next,nodeCompleted:false,courseCompleted:false,reviewReward:0};}
  next.activeNodeId='';next.activeActivityId='';next.activityIndex=0;delete next.nodeCursors[nodeId];delete next.nodeActivityIds[nodeId];
  const nodeCompleted=!next.verifiedNodeIds.includes(nodeId);
  if(nodeCompleted)next.verifiedNodeIds.push(nodeId);
  if(!next.completedNodeIds.includes(nodeId))next.completedNodeIds.push(nodeId);
  const courseCompleted=nodeCompleted&&node.chapterId!=='book'&&UP3_NODES.filter(item=>item.chapterId!=='book').every(item=>next.verifiedNodeIds.includes(item.id));
  let reviewReward=0;
  if(courseCompleted&&next.review.active){
    reviewReward=next.review.rewardedCount<REVIEW_REWARD_LIMIT?5:0;
    next.review={...next.review,active:false,completedCount:next.review.completedCount+1,
      rewardedCount:next.review.rewardedCount+(reviewReward?1:0),lastAwardedStars:reviewReward,lastCompletedAt:Date.now()};
  }
  if(courseCompleted)next.completedEver=true;
  return {up:next,nodeCompleted,courseCompleted,reviewReward};
}
export function startUp3Review(up,now=Date.now()) {
  if(!up.completedEver||up.review.active)return up;
  const next=newUp3State();next.completedEver=true;
  next.history=[...up.history,{completedNodeIds:structuredClone(up.completedNodeIds),activityEvidence:structuredClone(up.activityEvidence),review:structuredClone(up.review),archivedAt:now}];
  next.review={...normalizeReview(up.review),active:true,runId:`up3-review-${up.review.completedCount+1}-${now}`,startedAt:now,lastAwardedStars:0};
  return next;
}
