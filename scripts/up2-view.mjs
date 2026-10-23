import { UP2_CHAPTERS, UP2_NODES, UP2_NODE_BY_ID, UP2_ART, UP2_VOCAB_BY_ID } from './up2-content.mjs';
import { canOpenUp2Node, isUp2ActivityComplete, beginUp2Spelling, up2ReadingSteps, up2FindSections, up2FindSection } from './up2-progress.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button = (text,action,extra='',kind='secondary') => `<button class="${kind}-button" data-action="${action}" ${extra}>${text}</button>`;
export function up2ArtMarkup(art,extra='') {
  if(!art)return '';
  const cols=art.columns||1,rows=art.rows||1,p=art.panel||0;
  return `<div class="up-scene ${cols===3?"portrait":""} ${extra}" role="img" aria-label="${esc(art.alt)}" style="background-image:url('${esc(art.src)}');background-size:${cols*100}% ${rows*100}%;background-position:${cols>1?(p%cols)/(cols-1)*100:50}% ${rows>1?Math.floor(p/cols)/(rows-1)*100:50}%"></div>`;
}
export function up2HomeMarkup(up) {
  const groups=UP2_CHAPTERS.map(chapter=>{
    const nodes=chapter.nodeIds.map((id,i)=>{
      const node=UP2_NODE_BY_ID.get(id),done=up.completedNodeIds.includes(id),current=up.verifiedNodeIds.includes(id),open=canOpenUp2Node(up,id);
      return `<button class="up-node-card ${done?'done':''}" data-action="open-up-node" data-node-id="${id}" ${open?'':'disabled'}><span>${i+1}</span><strong>${esc(node.title)}</strong><small>${current?'已完成，可再练':done?'原进度已保留 · 新内容可学':open?'开始学习':'完成上一小节后开放'}</small></button>`;
    }).join('');
    return `<section class="up-chapter up-theme">${up2ArtMarkup(chapter.art)}<div class="up-chapter-heading"><div><small lang="en">${esc(chapter.subtitle)}</small><h2>${esc(chapter.title)}</h2></div><span>${chapter.nodeIds.filter(id=>up.completedNodeIds.includes(id)).length}/${chapter.nodeIds.length}</span></div><div class="up-node-grid">${nodes}</div></section>`;
  }).join('');
  return `<section class="lesson-card up2-home"><header class="up2-heading"><div><p class="eyebrow">UP 2 · Creature Features</p><h1>一起探索，读出故事</h1></div>${button('返回 UP 主页','open-up-world')}</header><div class="up2-summary"><strong>${up.completedNodeIds.length}/${UP2_NODES.length} 小节</strong>${up.completedEver&&!up.review.active?button('开始完整复习','start-up2-review','','primary'):up.review.active?'<span>完整复习中</span>':'<span>选一章，继续探索</span>'}</div><div class="up-theme-grid">${groups}</div></section>`;
}
export function up2ReadingLine(a,e) { const lines=up2ReadingSteps(a);return lines[Math.min(lines.length-1,Math.max(0,Number(e.lineIndex)||0))]; }
export function up2SceneFor(a,e) {
  if(a.type==='find')return up2FindSection(a,e).art||a.art;
  const i=Math.min(a.lines?.length-1||0,Number(e.lineIndex)||0);
  if(a.id==='kay-story')return UP2_ART.kay[a.lines[i].sceneIndex];
  if(a.id==='snail-story')return UP2_ART.snail[a.lines[i].sceneIndex];
  if(a.id==='room-sentences-a')return [UP2_ART.desk,UP2_ART.boxDesk,UP2_ART.bed][i];
  return a.art;
}
const recording = (a,id,disabled=false,lineId='',kind='up2') => `<div class="practice-actions">${button(id?'再读一次':'录下我的声音','record',`data-record-kind="${kind}" data-item-id="${a.id}" ${lineId?`data-record-line="${lineId}"`:''} ${disabled?'disabled':''}`,'record')}${id?button('听我的录音','play-saved-recording',`data-id="${id}"`):''}</div>`;
const finish = (a,e) => button('完成这一小段','up-finish-activity',isUp2ActivityComplete(a,e)?'':'disabled','primary');
const input = (value,attrs) => `<input class="up-write-input" type="text" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" lang="en" value="${esc(value)}" ${attrs} />`;
const pastNote = w => w.pastForm?`<p>过去的说法：<span lang="en">${esc(w.pastForm)}</span>（了解即可）</p>`:'';
export const up2HideWordHelp = (a,e) => a.type==='word-practice' && (e.phase||0)>=1 || a.type==='write-choice' && Boolean(e.choice);
const spellingHint = text => text.split(/(\s+|\/)/).map(part=>/^[a-z]+$/i.test(part)?part[0]+' _'.repeat(part.length-1):part).join('');
function spellingMarkup(a,e,{audio=false,prefix='up'}={}) {
  e=beginUp2Spelling(e);
  if(e.showSpelling)return `<p class="stage-instruction">看清楚，再收起来自己拼。</p><p class="up-focus-word" lang="en">${esc(a.answer)}</p>${button('收起，再试一次',`${prefix}-spelling-retry`,'','primary')}`;
  return `<p class="stage-instruction">${audio?'听一听，自己拼出来。':'把刚才选的词自己拼出来。'}需要时可以用提示。</p>${audio?button('听词',`${prefix}-word-hear`):''}${e.spellingHint?`<p class="up-spelling-hint" lang="en">${esc(spellingHint(a.answer))}</p>`:''}<label class="up-write-label"><span lang="en">${audio?'Listen and spell.':'Write the word.'}</span>${input(e.draft||'',`data-${prefix}-answer="true" aria-label="Spell the word" ${audio&&!e.writeHeard?'disabled':''}`)}</label><div class="practice-actions">${button('检查拼写',`${prefix}-check-answer`,audio&&!e.writeHeard?'disabled':'','primary')}${button(e.spellingHint?'看一遍，再试':'给我提示',`${prefix}-spelling-help`,audio&&!e.writeHeard?'disabled':'')}</div>`;
}
export function wordPracticeMarkup(a,e,w,prefix='up',kind='up2') {
  const phase=e.phase||0,title=`<h1 class="up-task-title" lang="en">${esc(a.title||a.prompt)}</h1>`;
  const path=w.level===4?`<ol class="up-word-path"><li class="${phase<3?'active':'done'}">听读与开口</li><li class="${phase===3?'active':''}">写一写</li></ol>`:'';
  if(phase<2)return `${title}${path}<p class="up-focus-word" lang="en">${esc(w.text)}</p>${a.context?`<p class="up-word-context" lang="en">${esc(a.context)}</p>`:''}<p class="stage-instruction">听清楚，看看词形，再自己读出来。</p>${button('听词',`${prefix}-word-hear`)}<details class="up-word-meaning"><summary>看看意思</summary><p>${esc(w.meaning)}</p>${pastNote(w)}</details>${button('我来读',`${prefix}-word-next`,e.learned?'':'disabled','primary')}`;
  if(phase===2)return `${title}${path}<p class="up-focus-word" lang="en">${esc(w.text)}</p>${a.context?`<p class="up-word-context" lang="en">${esc(a.context)}</p>`:''}${e.contextRecordingId?'<p class="up-word-success">✓ 这一词已在刚才的短句中开口练习</p>':''}${recording(a,e.recordingId||e.contextRecordingId,false,'',kind)}${button(w.level===4?'再写一写':'完成这个词',`${prefix}-word-next`,e.recordingId||e.contextRecordingId?'':'disabled','primary')}`;
  return `${title}${path}${spellingMarkup(a,e,{audio:true,prefix})}`;
}
export function up2ActivityMarkup(a,e={}) {
  const title=`<h1 class="up-task-title" lang="en">${esc(a.title||a.prompt)}</h1>`;
  if(a.type==='word-practice') {
    return wordPracticeMarkup(a,e,UP2_VOCAB_BY_ID.get(a.wordId));
  }
  if(a.type==='reading') {
    const steps=up2ReadingSteps(a),line=up2ReadingLine(a,e),i=steps.indexOf(line),whole=line===a.paragraph,heard=e.heardIds?.includes(line.id),rec=e.lineRecordings?.[line.id];
    if(a.audioSrc&&a.lines.length>1&&!e.heard)return `${title}<p class="stage-instruction">先完整听一遍，再一句句跟读。</p>${button('完整听一遍','up-play-activity-audio','','primary')}`;
    return `${title}<p class="stage-instruction">${whole?'句子读好了，听一整段，再连起来读。':'听这一句，再自己读。'}</p><div class="practice-actions">${button(whole?'听这一段':'听这一句','up-play-line','','primary')}${!whole&&a.audioSrc&&a.lines.length>1?button('再听完整故事','up-play-activity-audio'):''}</div><p class="up-reading-line ${whole?'up-reading-paragraph':''}" lang="en">${esc(line.text)}</p>${recording(a,rec,!heard,line.id)}<div class="up-line-nav">${button(whole?'返回逐句':'上一句','up-reading-step',`data-delta="-1" ${i===0?'disabled':''}`)}<span>${whole?'整段朗读':`${i+1} / ${a.lines.length}`}</span>${i<steps.length-1?button(i===a.lines.length-1?'连起来读':'下一句','up-reading-step',`data-delta="1" ${rec&&heard?'':'disabled'}`,'primary'):finish(a,e)}</div>`;
  }
  if(a.type==='notice')return `${title}<p class="up-reading-line" lang="en">${esc(a.text)}</p>${button('我读好了','up-notice-done','','primary')}`;
  if(a.type==='phonics') {
    const i=Math.min(a.words.length-1,Math.max(0,e.wordIndex||0)),w=a.words[i],rec=e.wordRecordings?.[w.text];
    const marked=text=>esc(text).replace(/ai|ay|a/i,part=>`<mark>${part}</mark>`);
    return `${title}<p class="stage-instruction">听听相同的长 a 音，看看 a、ai、ay。点词比较，再读当前词。</p><div class="up-phonics-family" lang="en">${a.words.map((word,index)=>`<button class="up-choice ${i===index?'selected':''}" data-action="up-play-phonics" data-word="${esc(word.text)}" aria-pressed="${i===index}">${marked(word.text)}</button>`).join('')}</div><p class="up-focus-word" lang="en">${marked(w.text)}</p>${button('听当前词','up-play-phonics',`data-word="${esc(w.text)}"`)}${recording(a,rec,!e.heardIds?.includes(w.text),w.text)}<div class="up-line-nav">${button('上一个','up-phonics-step',`data-delta="-1" ${i===0?'disabled':''}`)}<span>${i+1} / ${a.words.length}</span>${i<a.words.length-1?button('下一个','up-phonics-step',`data-delta="1" ${rec?'':'disabled'}`,'primary'):finish(a,e)}</div>`;
  }
  if(['choice','picture-choice','write-choice'].includes(a.type)) {
    const prompt=a.prompt && a.prompt!==a.title?`<p class="up-question" lang="en">${esc(a.prompt)}</p>`:'';
    if(a.type==='write-choice'&&e.choice) {
      const masked=a.prompt.replace(new RegExp(`\\b${a.answer.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'gi'),'___');
      return `${title}<p class="up-question" lang="en">${esc(masked)}</p>${spellingMarkup(a,e)}${button('返回选词','up-spelling-back')}`;
    }
    const options=a.options.map((o,i)=>{
      const value=typeof o==='string'?o:o.value;
      return `<button class="up-choice ${typeof o==='object'?'up-picture-choice':''} ${e.choice===value?'selected':''}" data-action="up-choice" data-value="${esc(value)}" ${a.audioSrc&&!e.heard?'disabled':''}>${typeof o==='object'?`${up2ArtMarkup(o.art)}<span>${String.fromCharCode(65+i)}</span>`:`<span lang="en">${esc(value)}</span>`}</button>`;
    }).join('');
    return `${title}${prompt}${a.audioSrc?button('听题','up-play-activity-audio'):''}<div class="up-choice-grid ${a.type==='picture-choice'?'up-picture-grid':''}">${options}</div>`;
  }
  if(a.type==='find') {
    const parts=up2FindSections(a),part=up2FindSection(a,e),index=parts.findIndex(s=>s.id===part.id);
    return `${title}<p class="stage-instruction">在这一段中圈出这些词，每一处都找一找。</p><p class="up-find-targets" lang="en">${part.targets.map(esc).join(' · ')}</p><div class="up-find-passage" lang="en">${part.items.map(({text:t,index:i})=>/^[A-Za-z]/.test(t)?`<button class="up-find-word ${e.selected?.includes(i)?'selected':''}" data-action="up-find-toggle" data-index="${i}" aria-pressed="${e.selected?.includes(i)?'true':'false'}">${esc(t)}</button>`:esc(t)).join('')}</div><div class="up-line-nav">${button('上一段','up-find-back',index===0?'disabled':'')}<span>第 ${index+1} / ${parts.length} 段</span>${button(index===parts.length-1?'完成圈词':'检查，下一段','up-find-check','','primary')}</div>`;
  }
  if(a.type==='speak')return `${title}<p class="up-question" lang="en">${esc(a.prompt)}</p><div class="up-speak-cues">${a.keywords.map(w=>`<span lang="en">${esc(w)}</span>`).join('')}</div>${recording(a,e.recordingId)}${e.recordingId?`${button(e.showReference?'收起参考':'看参考表达','up-show-reference')}${finish(a,e)}`:''}${e.recordingId&&e.showReference?`<p class="up-reference" lang="en">${esc(a.example)}</p>`:''}`;
  return '';
}
export function up2WordHelp(ids=[]) {
  const entries=[...new Set(ids)].map(id=>UP2_VOCAB_BY_ID.get(id)).filter(Boolean);
  return entries.length?`<details class="up-word-help"><summary>Word help · 词语小帮手</summary><div>${entries.map(w=>`<details><summary lang="en">${esc(w.text)}</summary><p>${esc(w.meaning)}</p>${pastNote(w)}${button('听词','up-help-word',`data-word-id="${w.id}"`)}</details>`).join('')}</div></details>`:'';
}
