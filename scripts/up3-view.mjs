import { UP3_BOOK_SCENES, UP3_CHAPTERS, UP3_NODE_BY_ID, UP3_NODES, UP3_VOCAB_BY_ID, UP3_THEME_LINES } from './up3-content.mjs';
import { canOpenUp3Node, findTargets, findSection, findSections, isUp3ActivityComplete, readingSteps, tokenWords, writingKey } from './up3-progress.mjs';
import { wordPracticeMarkup } from './up2-view.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,extra='',kind='secondary')=>`<button class="${kind}-button" data-action="${action}" ${extra}>${label}</button>`;
const example={
  creek:'Fish swim in creeks.',deep:'Fish swim in deep blue seas.',keep:'Fish in a school keep each other safe.',
  'each-other':'The fish help each other.',team:'They are a team.',chief:'What is the chief reason?',reason:'What is the chief reason?',
  blue:'The geese fly in the blue sky.',or:'Do you think the deer will stay or run?',ocean:'Fish swim in oceans.',into:'Let’s dive into the water.',
  alone:'Fish can swim alone.',partner:'Fish can swim with a partner.',small:'Some fish eat small animals.',
  unsafe:'It is unsafe to put your finger into the fan.','stay-away':'This big fish wants to eat. But it stays away.',mess:'Big fish will not mess with them.',
  peek:'Let me peek at the cute cat.',meeting:'We will have a meeting tomorrow.',green:'I like green apples.',bee:'The bee makes sweet honey for us.',leaf:'Look! A bug is on the green leaf.',
  treat:'How do you treat animals?',beast:'The big beast lives in the deep forest.',brief:'Let’s have a brief break to drink water.',thief:'The thief tries to take the small cookie.',
  field:'We play football in the big green field.','in-a-bunch':'Fish can swim in a bunch.',danger:'Mom keeps her cub out of danger.','snap-up':'A fish can get snapped up!',
  'a-neat-trick':'Fish in a school have a neat trick.','crescent-tail-bigeye-fish':'These crescent-tail bigeye fish swim in a school to fool big fish.',fool:'These crescent-tail bigeye fish swim in a school to fool big fish.',
  'barracuda-fish':'Hundreds of barracuda fish swim in a school together.','hundreds-of':'Hundreds of barracuda fish swim in a school together.'
};
export function up3ArtMarkup(art,extra='') {
  if(!art)return '';
  const [x,y,w,h]=art.crop||[0,0,...(art.size||[1041,1347])], [sw,sh]=art.size||[1041,1347];
  return `<div class="up3-art-frame ${extra}" role="img" aria-label="${esc(art.alt)}" style="aspect-ratio:${w}/${h}"><img src="${esc(art.src)}" alt="" draggable="false" style="width:${sw/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></div>`;
}
export function up3WordHelp(ids=[]) {
  const words=[...new Set(ids)].map(id=>UP3_VOCAB_BY_ID.get(id)).filter(Boolean);
  return words.length?`<details class="up-word-help"><summary>Word help · 词语小帮手</summary><div>${words.map(w=>`<details><summary lang="en">${esc(w.text)}</summary><p>${esc(w.meaning)}</p><p lang="en">${esc(example[w.id])}</p>${button('听词','up3-help-word',`data-word-id="${esc(w.id)}"`)}</details>`).join('')}</div></details>`:'';
}
export function up3HelpIds(a,e={}) {
  if(a.type==='spell'||a.type==='word-practice'||a.type==='select-write'&&e.choice&&!a.sharedBank)return [];
  if(a.supportIds)return a.supportIds;
  const text=[a.text,a.prompt,...(a.lines||[]).map(l=>l.text),...(a.options||[]).map(o=>typeof o==='string'?o:o.value)].filter(Boolean).join(' ').toLowerCase();
  const forms={creek:['creeks'],ocean:['oceans'],peek:['peeked'],treat:['treated'],'stay-away':['stays away'],'snap-up':['snapped up']};
  return [...UP3_VOCAB_BY_ID.values()].filter(w=>[w.text,...(forms[w.id]||[])].some(form=>new RegExp(`\\b${form}\\b`,'i').test(text))).map(w=>w.id);
}
export function up3HomeMarkup(up) {
  const groups=UP3_CHAPTERS.map(chapter=>{
    const nodes=chapter.nodeIds.map((id,index)=>{
      const node=UP3_NODE_BY_ID.get(id),done=up.completedNodeIds.includes(id),open=canOpenUp3Node(up,id);
      return `<button class="up-node-card ${done?'done':''}" data-action="open-up3-node" data-node-id="${id}" ${open?'':'disabled'}><span>${index+1}</span><strong>${esc(node.title)}</strong><small>${done?'已完成，可再读':open?'开始学习':'完成上一小节后开放'}</small></button>`;
    }).join('');
    return `<section class="up-chapter up-theme up3-chapter">${up3ArtMarkup(chapter.art)}<div class="up-chapter-heading"><div><small lang="en">${esc(chapter.subtitle)}</small><h2>${esc(chapter.title)}</h2></div><span>${chapter.nodeIds.filter(id=>up.completedNodeIds.includes(id)).length}/${chapter.nodeIds.length}</span></div><div class="up-node-grid">${nodes}</div></section>`;
  }).join('');
  const bookDone=up.completedNodeIds.includes('queen-pea');
return `<section class="lesson-card up2-home up3-home"><header class="up2-heading"><div><p class="eyebrow">UP 3 · Team Up!</p><h1>一起学会合作</h1></div>${button('返回 UP 主页','open-up-world')}</header><div class="up2-summary"><strong>主线 ${up.completedNodeIds.filter(id=>id!=='queen-pea').length}/5 · 家庭阅读 ${bookDone?'1':'0'}/1</strong>${up.completedEver&&!up.review.active?button('开始完整复习','start-up3-review','','primary'):up.review.active?'<span>完整复习中</span>':'<span>听故事，练词句，一起读</span>'}</div><p class="section-copy" lang="en">How do animals help each other?</p><details class="up-word-help"><summary>主题共读 · Team Up!</summary>${UP3_THEME_LINES.map(text=>`<p class="section-copy" lang="en">${esc(text)}</p>`).join('')}${button('听主题原文','up3-theme-listen')}</details>${up3WordHelp([...UP3_VOCAB_BY_ID.keys()])}<div class="up-theme-grid">${groups}</div>${button('去 Unit 3 看看交通词句','open-unit','data-unit-id="unit3"')}<button class="up3-book-entry" data-action="open-up3-node" data-node-id="queen-pea">${up3ArtMarkup(UP3_BOOK_SCENES[0].art)}<span><small>家庭阅读</small><strong>The Queen and the Pea</strong><em>${bookDone?'已读完 · 可再读':'打开，一起读'}</em></span><b>打开图书 →</b></button></section>`;
}
const recording=(a,id='',lineId='',disabled=false,optional=false)=>`<div class="practice-actions">${button(id?'再读一次':optional?'跟我读':'录下我的声音','record',`data-record-kind="up3" data-item-id="${esc(a.id)}" ${lineId?`data-record-line="${esc(lineId)}"`:''} ${disabled?'disabled':''}`,'record')}${id?button('听我的录音','play-saved-recording',`data-id="${esc(id)}"`):''}</div>`;
const spellHint=text=>text.split(/(\s+)/).map(part=>/^[a-z]+$/i.test(part)?part[0]+' _'.repeat(part.length-1):part).join('');
const textInput=(e,label='Write the word.')=>`<label class="up-write-label"><span lang="en">${label}</span><input class="up-write-input" data-up3-answer="true" aria-label="${esc(label)}" type="text" lang="en" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" value="${esc(e.draft||'')}" /></label>`;
function choiceMarkup(a,e) {
  const writing=['select-write','letter-write'].includes(a.type),selected=a.type==='letter-write'||Boolean(e.choice);
  const opts=a.sharedBank||selected&&a.type==='select-write'?'':`<div class="up3-option-grid">${a.options.map(option=>{
    const value=typeof option==='string'?option:option.value;
    const art=option.art?up3ArtMarkup(option.art):'';
    return selected&&writing?`<div class="up3-option">${art}<strong lang="en">${esc(value)}</strong></div>`:`<button class="up3-option" data-action="up3-select" data-value="${esc(value)}">${art}<strong lang="en">${esc(value)}</strong></button>`;
  }).join('')}</div>`;
  const bank=a.sharedBank?`<div class="up3-shared-bank" aria-label="共用词库">${a.sharedBank.map(word=>selected?`<span lang="en">${esc(word)}</span>`:`<button class="up3-bank-choice" data-action="up3-select" data-value="${esc(word)}" lang="en">${esc(word)}</button>`).join('')}</div>`:'';
  if(!selected||!writing)return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1>${bank}<p class="up3-question" lang="en">${esc(a.prompt)}</p>${opts}`;
  if(e.showModel)return `<p class="stage-instruction">看清楚，再收起来自己写。</p><p class="up-focus-word" lang="en">${esc(a.answer)}</p>${button('收起，再试一次','up3-retry','','primary')}`;
  return `<h1 class="up-task-title" lang="en">${esc(a.type==='letter-write'?'Read and write the correct alphabet.':a.sharedBank?'Complete the sentence.':'Write the word.')}</h1>${bank}${a.sharedBank?'<p class="stage-instruction">从词库选词，补全句子。</p>':''}<p class="up3-question" lang="en">${esc(a.prompt)}</p>${opts}${e.hintLevel?`<p class="up-spelling-hint" lang="en">${esc(spellHint(a.answer))}</p>`:''}${textInput(e,a.type==='letter-write'?'Write a, b, c or d.':a.sharedBank?'Fill in the blank.':'Write the word.')}<div class="practice-actions">${button('检查','up3-check','','primary')}${a.sharedBank||a.type==='letter-write'?'':button(e.hintLevel?'看一遍，再试':'给我提示','up3-hint')}</div>`;
}
export function up3ReadingStep(a,e={}) {const steps=readingSteps(a);return steps[Math.max(0,Math.min(steps.length-1,e.stepIndex||0))];}
export function up3SceneFor(a,e={}) {
  if(a.type==='spell'||a.type==='word-practice'&&e.phase===3)return null;
  if(a.type==='reading')return up3ReadingStep(a,e).art||a.art;
  if(a.type==='find')return findSection(a,e)?.art||a.art;
  if(a.type==='book')return a.scenes[e.sceneIndex||0]?.art;
  return a.art;
}
export function up3ActivityMarkup(a,e={}) {
  if(a.type==='word-practice')return wordPracticeMarkup(a,e,UP3_VOCAB_BY_ID.get(a.wordId),'up3','up3');
  if(a.type==='reading') {
    const steps=readingSteps(a),i=Math.max(0,Math.min(steps.length-1,e.stepIndex||0)),step=steps[i],heard=e.heardIds?.includes(step.id),rec=e.recordingIds?.[step.id];
    if(a.audioSrc&&!e.heardWhole)return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1><p class="stage-instruction">先完整听故事，再分幅跟读。</p>${button('完整听一遍','up3-play-whole','','primary')}`;
    const whole=step.kind==='paragraph';
return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1><p class="stage-instruction">${whole?'听完整故事，再把整篇连起来读。':a.optionalRecording?'先听一听，再跟着读。':'听一听，再录下这一'+a.stepNoun+'的朗读。'}</p><p class="up-reading-line ${whole?'up-reading-paragraph':''}" lang="en">${esc(step.text)}</p><div class="practice-actions">${button(whole?'听完整故事':'听这一'+a.stepNoun,'up3-play-current','','primary')}${a.audioSrc&&!whole?button('再听完整故事','up3-play-whole'):''}</div>${recording(a,rec,step.id,!heard,a.optionalRecording)}<div class="up-line-nav">${button(whole?'返回分幅':'上一'+a.stepNoun,'up3-read-step',`data-delta="-1" ${i===0?'disabled':''}`)}<span>${whole?'整篇跟读':`${i+1} / ${a.lines.length}`}</span>${i<steps.length-1?button(steps[i+1].kind==='paragraph'?'连起来读':'下一'+a.stepNoun,'up3-read-step',`data-delta="1" ${heard&&(a.optionalRecording||rec)?'':'disabled'}`,'primary'):button('继续学习','up3-finish',isUp3ActivityComplete(a,e)?'':'disabled','primary')}</div>`;
  }
  if(a.type==='phonics'){
    const marked=word=>esc(word).replace(/ee|ea|ie|e/i,part=>`<mark>${part}</mark>`);
return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1><p class="stage-instruction" lang="en">The letters <strong>${a.patterns.slice(0,-1).map(esc).join(', ')}, and ${esc(a.patterns.at(-1))}</strong> make the long e sound in <span>${a.examples.slice(0,-1).map(marked).join(', ')}, and ${marked(a.examples.at(-1))}</span>.</p><p class="up3-phonics-words" lang="en">${a.words.map(word=>`<span>${marked(word)}</span>`).join('')}</p>${button('听这些词','up3-play-model','','primary')}${button('我发现了长 e 的声音','up3-noticed',e.heard?'':'disabled')}`;
  }
  if(a.type==='notice')return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1><p class="up-reading-line" lang="en">${esc(a.text)}</p>${a.audioSrc?button('听读本开头','up3-play-model'):''}${button('继续读故事','up3-notice-done',a.audioSrc&&!e.heard?'disabled':'','primary')}`;
  if(a.type==='word-group')return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1><p class="stage-instruction">听听这些词，再一起说一遍。</p><div class="up3-phonics-words">${a.wordIds.map(id=>button(esc(UP3_VOCAB_BY_ID.get(id).text)+(e.heardIds?.includes(id)?' ✓':''),'up3-group-listen',`data-word-id="${id}"`)).join('')}</div>${recording(a,e.recordingId,'',!a.wordIds.every(id=>e.heardIds?.includes(id)))}${button('继续学习','up3-finish',isUp3ActivityComplete(a,e)?'':'disabled','primary')}`;
  if(a.type==='speak'||a.type==='word-say') {
    const w=a.type==='word-say'?UP3_VOCAB_BY_ID.get(a.wordId):null;
    return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1><p class="up3-question" lang="en">${esc(w?.text||a.prompt)}</p>${w&&example[a.wordId]?`<p class="up-word-context" lang="en">${esc(example[a.wordId])}</p>`:''}${a.audioSrc||w?button('听一听','up3-play-model','','primary'):''}${recording(a,e.recordingId,'',Boolean((a.audioSrc||w)&&!e.heard))}${button('完成这一项','up3-finish',isUp3ActivityComplete(a,e)?'':'disabled','primary')}`;
  }
  if(a.type==='choice'||a.type==='select-write'||a.type==='letter-write')return choiceMarkup(a,e);
  if(a.type==='spell') {
    const w=UP3_VOCAB_BY_ID.get(a.wordId);
    if(e.showModel)return `<p class="stage-instruction">看清楚，再收起来自己写。</p><p class="up-focus-word" lang="en">${esc(w.text)}</p>${button('收起，再试一次','up3-retry','','primary')}`;
    return `<h1 class="up-task-title" lang="en">Listen and write.</h1><p class="stage-instruction">听词，拼出刚才故事里遇到的词。</p>${button('听词','up3-play-model','','primary')}${e.hintLevel?`<p class="up-spelling-hint" lang="en">${esc(spellHint(w.text))}</p>`:''}${e.heard?textInput(e):''}<div class="practice-actions">${e.heard?button('检查拼写','up3-check','','primary'):''}${e.heard?button(e.hintLevel?'看一遍，再试':'给我提示','up3-hint'):''}</div>${a.record&&e.checked?`${recording(a,e.recordingId,'',false)}${button('完成这一词','up3-finish',isUp3ActivityComplete(a,e)?'':'disabled','primary')}`:''}`;
  }
  if(a.type==='find') {
    const sections=findSections(a),i=Math.max(0,Math.min(sections.length-1,e.findIndex||0)),section=sections[i],selected=new Set(e.selected||[]),tokens=tokenWords(a.text);
    const count=selected.size,total=a.matchOnce?a.targets.length:findTargets(a).length;
    return `<h1 class="up-task-title" lang="en">${esc(a.title)}</h1><p class="stage-instruction">在英文里找出这些词：<span lang="en">${esc(section.targets.join(' · '))}</span>${a.matchOnce?'。每个词找到一次就好。':''}</p><div class="up3-find-text" lang="en">${section.items.map(({text,index})=>/^[A-Za-z]/.test(text)?`<button data-action="up3-find-toggle" data-index="${index}" class="up3-find-token ${selected.has(index)?'selected':''}" aria-pressed="${selected.has(index)}">${esc(text)}</button>`:esc(text)).join('')}</div>${sections.length>1?`<div class="up-line-nav">${button('上一段','up3-find-section',`data-delta="-1" ${i===0?'disabled':''}`)}<span>${i+1} / ${sections.length}</span>${button('下一段','up3-find-section',`data-delta="1" ${i===sections.length-1?'disabled':''}`)}</div>`:''}<div class="practice-actions">${button('检查圈词','up3-find-check','','primary')}<span>已圈 ${count} 处 · 目标 ${total} ${a.matchOnce?'词':'处'}</span></div>`;
  }
  return '';
}
export function up3BookMarkup(a,e={},singlePage=false) {
  const spread=Math.max(0,Math.min(3,e.spreadIndex||0)),side=Math.max(0,Math.min(1,e.side||0));
  const pages=singlePage?[a.scenes[spread*2+side]]:a.scenes.slice(spread*2,spread*2+2);
  const content=pages.map(scene=>`<article class="up3-book-page" data-scene-id="${scene.id}">${up3ArtMarkup(scene.art)}${scene.textOrigin==='provided-audio-transcription'?'<small>音频旁白</small>':''}<p lang="en">${esc(scene.text)}</p><div class="practice-actions">${button('听这一页','up3-book-listen',`data-scene-id="${scene.id}"`,'primary')}${recording(a,e.recordingIds?.[scene.id],scene.id,false,true)}</div></article>`).join('');
  const first=spread===0&&(!singlePage||side===0),last=spread===3&&(!singlePage||side===1);
  return `<section class="up3-book-shell"><header class="lesson-toolbar">${button('返回 UP3','back-up3-home')}<strong lang="en">The Queen and the Pea</strong><span>${e.viewedIds?.length||0}/8 幅图</span></header><div class="up3-book-spread">${content}</div><div class="up3-book-nav">${button('上一页','up3-book-turn',`data-delta="-1" ${first?'disabled':''}`)}<span>${singlePage?`${spread*2+side+1} / 8`:`${spread+1} / 4`}</span>${last?button('读完了','up3-book-finish',a.scenes.every(s=>e.viewedIds?.includes(s.id))?'':'disabled','primary'):button('翻下一页','up3-book-turn','data-delta="1"','primary')}</div></section>`;
}
