// Textbook-directed activities share the accepted lesson shell, media and recorder.
export const newPractice=()=>({indices:{},evidence:{},recordingIds:{}});
export function reconcilePracticeOrder(content,attempt) {
 const run=attempt?.practice;
 if(!run||!content.practiceRevision||run.revision===content.practiceRevision)return;
 for(const stage of content.revisedPracticeStages||[]) {
  const activities=content.practiceStages[stage];
  const missing=activities.findIndex(a=>!practiceReady(a,run.evidence[a.id],run.recordingIds[a.id]));
  // Reorder by stable evidence, never reuse the old numeric position or erase history.
  run.indices[stage]=missing<0?0:missing;
 }
 run.revision=content.practiceRevision;
}
export function practiceSelectedIds(activity,evidence={}) {
 const given=activity.givenOrderIds||[];
 return [...given,...(evidence.selectedIds||[]).filter(id=>!given.includes(id))];
}
export function practicePlayback(activity,evidence={}) {
 if(activity.type==='role-play')return activity.options.find(o=>o.id===evidence.choice)?.promptAudioSrc;
 return activity.audioSrc;
}
export function objectivePracticeCorrect(activity,evidence={}) {
 const selected=practiceSelectedIds(activity,evidence),answer=activity.answerIds||[];
 if(new Set(selected).size!==selected.length||!answer.length||selected.length!==answer.length)return false;
 return activity.type==='order'?answer.every((id,i)=>id===selected[i]):answer.every(id=>selected.includes(id));
}
export function practiceCanRecord(activity,evidence={}) {
 if(['listen','match','multi-select','order'].includes(activity.type))return false;
 if(activity.type==='open-speech')return true;
 if(activity.type==='scene-log') {
  const selected=evidence.selectedIds||[],min=activity.minSelections||1,max=activity.maxSelections||activity.options.length;
  return Boolean(selected.length>=min&&selected.length<=max&&new Set(selected).size===selected.length&&selected.every(id=>activity.options.some(o=>o.id===id))&&(!activity.secondaryOptions||activity.secondaryOptions.some(o=>o.id===evidence.secondaryChoice)));
 }
 if(activity.type==='role-play')return Boolean(evidence.heard&&activity.options.some(o=>o.id===evidence.choice));
 if(activity.type==='speak-choice')return activity.options.some(o=>o.id===evidence.choice);
 if(activity.type==='compose')return Boolean(evidence.prepared&&[0,1].every(i=>activity.options.some(o=>o.id===evidence.chantChoices?.[i])));
 return evidence.heard===true;
}
export function practiceReady(activity,evidence={},recordingId) {
 if(activity.type==='listen')return evidence.heard===true;
 if(activity.type==='match')return evidence.choice===activity.answer;
 if(['scene-log','role-play'].includes(activity.type))return Boolean(recordingId&&practiceCanRecord(activity,evidence));
 if(['multi-select','order'].includes(activity.type))return Boolean(evidence.checked&&objectivePracticeCorrect(activity,evidence)&&(activity.type==='multi-select'?activity.requireAudio===false||evidence.heard:activity.requireAudio!==true||evidence.heard));
 if(['compose','open-speech'].includes(activity.type))return Boolean(recordingId&&practiceCanRecord(activity,evidence));
 if(activity.type==='speak-choice')return Boolean(recordingId&&activity.options.some(o=>o.id===evidence.choice));
 return Boolean(recordingId&&evidence.heard);
}
export const bookmarkReady=run=>['car','bus','bike'].includes(run.vehicle)&&['sky','sun','leaf'].includes(run.color)&&['by-car','by-bus','on-foot','by-bike'].includes(run.commute);
function personalSpeakingMarkup(activity,evidence,recordingId,e) {
 const selected=activity.options.find(o=>o.id===evidence.choice);
 const choices=activity.options.map(o=>`<button class="phrase-card" data-action="practice-choice" data-value="${e(o.id)}"><img src="${o.imageSrc}" alt=""/><strong lang="en">${e(o.text)}</strong></button>`).join('');
 const frame=evidence.hint?`<div class="project-sentence-frame">${activity.frames.map(t=>`<p lang="en">${e(t)}</p>`).join('')}</div>`:'';
 const speaking=selected?`<div class="personal-speaking-panel"><figure class="personal-speaking-picture"><img src="${selected.imageSrc}" alt=""/><figcaption lang="en">${e(selected.text)}</figcaption></figure><section><h2 lang="en">Your turn!</h2><details class="personal-speaking-switch"><summary>换个方式</summary><div class="practice-actions">${activity.options.map(o=>`<button class="secondary-button" data-action="practice-choice" data-value="${e(o.id)}" aria-pressed="${o.id===selected.id}" lang="en">${e(o.text)}</button>`).join('')}</div></details>${frame}<button class="text-button" data-action="practice-hint">${evidence.hint?'收起提示':'需要句型提示'}</button><div class="practice-actions"><button class="record-button" data-action="record" data-record-kind="practice" data-item-id="${e(activity.id)}">${recordingId?'重新录音':'录下我的回答'}</button>${recordingId?`<button class="secondary-button" data-action="play-saved-recording" data-id="${recordingId}">听我的录音</button><button class="primary-button" data-action="practice-next">完成词组练习</button>`:''}</div></section></div>`:`<div class="phrase-grid">${choices}</div>`;
 return `<p class="word-banner">词组练习 · 说说自己</p><h1 class="personal-speaking-question" tabindex="-1" lang="en">${e(activity.title)}</h1><p class="stage-instruction">${e(activity.instruction)}</p>${speaking}<p id="feedback" class="feedback" role="status">${recordingId?'回答已保存，可以完成词组练习。':selected?'轮到你说啦，看图说一句自己的上学方式。':'词组听写完成！选自己的上学方式，最后说说你自己。'}</p>`;
}
export function practiceMarkup(activity,evidence,recordingId,index,total,escape,context={}) {
 if(activity.presentation==='personal-speaking')return personalSpeakingMarkup(activity,evidence,recordingId,escape);
 const e=escape, heard=Boolean(evidence.heard), hint=Boolean(evidence.hint);
 const playback=practicePlayback(activity,evidence)||activity.lines;
 const listenButton=playback?`<button class="${activity.type==='order'?'secondary-button':'primary-button'}" data-action="practice-play">${e(activity.playLabel||(heard?'再听一次':activity.lines||activity.type==='listen'||activity.lyrics?'完整听一遍':activity.type==='multi-select'?'听题':'听这一句'))}</button>`:'';
 let body='',objectiveCheck='';
 if(['multi-select','order'].includes(activity.type)) {
  const selected=practiceSelectedIds(activity,evidence),blocked=!heard&&(activity.type==='multi-select'?activity.requireAudio!==false:activity.requireAudio===true);
  body=`${activity.type==='multi-select'?`<div class="practice-actions">${listenButton}</div>`:''}<div class="phrase-grid textbook-objective ${e(activity.layoutClass||'')}">${activity.options.map((o,i)=>`<button class="phrase-card ${selected.includes(o.id)?'listened':''}" data-action="practice-toggle" data-value="${e(o.id)}" aria-label="${e(activity.showOptionText&&o.text?o.text:`图片 ${i+1}`)}${activity.givenOrderIds?.includes(o.id)?'，已给出第 1 幅':''}" aria-pressed="${selected.includes(o.id)}" ${blocked||activity.givenOrderIds?.includes(o.id)?'disabled':''}><img src="${o.imageSrc}" alt=""/>${activity.showOptionText&&o.text?`<strong lang="en">${e(o.text)}</strong>`:''}${activity.type==='order'?`<strong>${selected.includes(o.id)?selected.indexOf(o.id)+1:'—'}</strong>`:`<strong class="${activity.showOptionText?'practice-option-state':''}">${selected.includes(o.id)?'已选':'选择'}</strong>`}</button>`).join('')}</div>`;
  objectiveCheck=`<button class="secondary-button" data-action="practice-check" ${blocked||!selected.length?'disabled':''}>${e(activity.checkLabel||('检查'+(activity.type==='order'?'顺序':'配对')))}</button>`;
 } else if(activity.type==='role-play') {
  const selected=activity.options.find(o=>o.id===evidence.choice);
  body=`<div class="practice-actions">${activity.options.map(o=>`<button class="secondary-button" data-action="practice-choice" data-value="${e(o.id)}" aria-pressed="${o.id===evidence.choice}" lang="en">${e(o.text)}</button>`).join('')}</div>${selected?`<p class="speaker-path" lang="en">You are ${e(selected.text)}.</p><button class="text-button" data-action="practice-hint">${hint?'收起提示':'需要一句提示'}</button>${hint||recordingId?`<p class="project-sentence-frame" lang="en">${e(selected.replyText)}</p>`:''}`:''}`;
 } else if(activity.type==='scene-log') {
  const selected=activity.options.filter(o=>evidence.selectedIds?.includes(o.id));
  const atMax=selected.length>=(activity.maxSelections||activity.options.length),secondary=activity.secondaryOptions?.find(o=>o.id===evidence.secondaryChoice);
  const frames=activity.frames||[...new Set(selected.map(o=>o.frame).filter(Boolean)),'It’s / They’re ___.'];
  const primaryChoices=`<p class="sky-log-label">${e(activity.selectionLabel||'练习天空记录')} ${activity.period?`· <span lang="en">${e(activity.period)}</span>`:''}</p><div class="practice-actions">${activity.options.map(o=>`<button class="secondary-button" data-action="practice-log-toggle" data-value="${e(o.id)}" aria-pressed="${selected.some(s=>s.id===o.id)}" ${(atMax&&!selected.some(s=>s.id===o.id))?'disabled':''} lang="en">${e(o.text)}</button>`).join('')}</div>`;
  const secondaryChoices=activity.secondaryOptions?`<p class="sky-log-label">${e(activity.secondaryLabel||'Choose one.')}</p><div class="practice-actions">${activity.secondaryOptions.map(o=>`<button class="secondary-button" data-action="practice-secondary-choice" data-value="${e(o.id)}" aria-pressed="${o.id===evidence.secondaryChoice}" lang="en">${e(o.text)}</button>`).join('')}</div>`:'';
  body=`${activity.secondaryFirst?secondaryChoices+primaryChoices:primaryChoices+secondaryChoices}<div class="sky-log-entry ${e(activity.previewClass||'')}" aria-label="${e(activity.previewLabel||'我选择的天空事物')}">${selected.map(o=>`<figure><img src="${o.imageSrc}" alt=""/><figcaption lang="en">${e(o.text)}</figcaption></figure>`).join('')||`<p>${e(activity.emptyText||'选好后，这里会留下你的天空记录。')}</p>`}${secondary?`${secondary.imageSrc?`<figure><img src="${e(secondary.imageSrc)}" alt=""/><figcaption lang="en">${e(secondary.text)}</figcaption></figure>`:''}<p class="sky-log-recipient" lang="en">${e(activity.secondaryPreviewPrefix??'For my ')}${e(secondary.text)}</p>`:''}</div>${selected.length?`<button class="text-button" data-action="practice-hint">${hint?'收起提示':'需要句型提示'}</button>${hint?`<div class="project-sentence-frame">${frames.filter(Boolean).map(t=>`<p lang="en">${e(t)}</p>`).join('')}</div>`:''}`:''}`;
  if(activity.showLogSummary&&recordingId)body+=`<section class="sky-log-summary"><h2 lang="en">My sky log</h2>${(context.logEntries||[]).map(entry=>`<div><h3 lang="en">${e(entry.activity.period)}</h3><p lang="en">${entry.activity.options.filter(o=>entry.evidence?.selectedIds?.includes(o.id)).map(o=>e(o.text)).join(' · ')}</p>${entry.recordingId?`<button class="secondary-button" data-action="play-saved-recording" data-id="${entry.recordingId}">听${entry.activity.period==='Day'?'白天':'夜晚'}的介绍</button>`:''}</div>`).join('')}</section>`;
 } else if(activity.type==='compose') {
  const choices=evidence.chantChoices||[];
  const chosen=[0,1].map(slot=>activity.options.find(o=>o.id===choices[slot]));
  body=evidence.prepared?`<div class="project-speaking-cues">${chosen.map(o=>`<figure><img src="${o.imageSrc}" alt=""/><figcaption lang="en">${e(o.text)}</figcaption></figure>`).join('')}</div><p class="stage-instruction">看动作，按自己的节奏说完整首歌谣。</p><div class="practice-actions"><button class="text-button" data-action="practice-compose-edit">修改动作</button><button class="text-button" data-action="practice-hint">${hint?'收起提示':'看看歌谣框架'}</button></div>${hint?`<div class="project-sentence-frame">${activity.frames.map(t=>`<p lang="en">${e(t)}</p>`).join('')}</div>`:''}`:`<div class="chant-compose">${[0,1].map(slot=>`<fieldset><legend>第 ${slot+1} 行动作</legend><div class="practice-actions">${activity.options.map(o=>`<button class="secondary-button" data-action="practice-compose" data-slot="${slot}" data-value="${o.id}" aria-pressed="${choices[slot]===o.id}" lang="en">${e(o.text)}</button>`).join('')}</div></fieldset>`).join('')}<div class="song-lyrics" lang="en"><span>Here we go.</span><span>Do our best.</span><span>${e(chosen[0]?.text||'…')}</span><span>${e(chosen[1]?.text||'…')}</span><span>We are the best.</span></div><button class="primary-button" data-action="practice-compose-ready" ${chosen.length===2&&chosen.every(Boolean)?'':'disabled'}>准备好了，自己唱读</button></div>`;
 } else if(activity.type==='open-speech') {
  body=(hint?`<div class="project-sentence-frame">${activity.frames.map(t=>`<p lang="en">${e(t)}</p>`).join('')}</div>`:'')+(activity.showFrameHint?`<button class="text-button" data-action="practice-hint">${hint?'收起提示':'需要句型提示'}</button>`:'');
 } else if(activity.type==='match') {
  const pictures={metro:'<span class="metro-emblem" aria-label="Shanghai Metro symbol">M</span>',underground:'<span class="underground-emblem" aria-label="London Underground symbol"><b>UNDERGROUND</b></span>','red-bus':'<img src="./assets/unit3/red-bus.png" alt="" />','city-bus':'<img src="./assets/unit3/city-bus.png" alt="" />'};
  const picture=pictures[activity.picture]||(activity.imageSrc?`<img src="${e(activity.imageSrc)}" alt="" />`:``);
  body=`<div class="transport-match-art">${picture}</div><div class="practice-actions">${activity.options.map(choice=>`<button class="secondary-button ${evidence.choice===choice?'selected':''}" data-action="practice-choice" data-value="${e(choice)}" lang="en">${e(choice)}</button>`).join('')}</div>`;
 } else if(activity.type==='speak-choice') {
  body=`<div class="phrase-grid">${activity.options.map(o=>`<button class="phrase-card ${evidence.choice===o.id?'listened':''}" data-action="practice-choice" data-value="${e(o.id)}" aria-pressed="${evidence.choice===o.id}"><img src="${o.imageSrc}" alt=""/><strong lang="en">${e(o.text)}</strong></button>`).join('')}</div>${hint?`<div class="project-sentence-frame">${activity.frames.map(t=>`<p lang="en">${e(t)}</p>`).join('')}</div>`:''}<button class="text-button" data-action="practice-hint">${hint?'收起提示':'需要句型提示'}</button>`;
 } else if(activity.lines&&activity.type==='repeat') {
  body=`<div class="story-whole-lines">${activity.lines.map(l=>`<p lang="en"><small>${e(l.speaker)}</small> ${e(l.text)}</p>`).join('')}</div>`;
 }
 if(activity.lyrics)body+=`<div class="song-lyrics">${activity.lyrics.map(t=>`<span lang="en">${e(t)}</span>`).join('')}</div>`;
 if(activity.gallery)body=`<div class="story-picture-strip">${activity.gallery.map((p,i)=>`<figure><img src="${p.imageSrc}" alt="故事场景 ${i+1}"/><figcaption>${i+1}</figcaption></figure>`).join('')}</div>`+body;
 if(activity.transcript)body+=`<details class="practice-example"><summary>展开课文</summary><div class="story-whole-lines">${activity.transcript.map(l=>`<p lang="en"><small>${e(l.speaker)}</small> ${e(l.text)}</p>`).join('')}</div></details>`;
 if(activity.example)body+=`<details class="practice-example"><summary>看看示范，再自己说</summary><div class="project-sentence-frame">${activity.example.map(t=>`<p lang="en">${e(t)}</p>`).join('')}</div></details>`;
 if(activity.showFrameHint) {
  body=body.replace(/<button class="text-button" data-action="practice-hint">[^<]*<\/button>/,'');
  objectiveCheck=`<button class="text-button" data-action="practice-hint">${hint?'收起提示':'需要句型提示'}</button>`;
 }
 const recordable=!['listen','match','multi-select','order'].includes(activity.type);
 const canRecord=practiceCanRecord(activity,evidence);
 return `<p class="word-banner">${activity.type==='speak-choice'?'看图表达':'故事听说'} · ${index+1}/${total}</p><h1 tabindex="-1" lang="en">${e(activity.title)}</h1>${activity.speaker?`<p class="speaker-path" lang="en">${e(activity.speaker)}</p>`:''}<p class="stage-instruction">${e(activity.instruction)}</p>${body}<div class="practice-actions">${objectiveCheck}${activity.type==='multi-select'?'':listenButton}${recordable?`<button class="record-button" data-action="record" data-record-kind="practice" data-item-id="${activity.id}" ${canRecord?'':'disabled'}>${recordingId?'重新录音':e(activity.recordLabel||'开始录音')}</button>`:''}${recordingId?`<button class="secondary-button" data-action="play-saved-recording" data-id="${recordingId}">听我的录音</button>`:''}<button class="primary-button" data-action="practice-next" ${practiceReady(activity,evidence,recordingId)?'':'disabled'}>${index===total-1?e(activity.finishLabel||'完成这一步'):'下一步'}</button></div><p id="feedback" class="feedback" role="status">${recordingId?'录音已经保存。':activity.type==='match'?'看清图片，再选择。':activity.showFrameHint?'说一句就好。不知道怎么开头，可以点句型提示。':'慢慢来，完成后再继续。'}</p>`;
}
export function bookmarkMarkup(content,run,escape) {
 const e=escape, ready=bookmarkReady(run), vehicle=content.bookmarkVehicles.find(v=>v.id===run.vehicle), recording=run.recordingIds.project;
 const options=(field,rows)=>rows.map(([id,label])=>`<button class="secondary-button ${run[field]===id?'selected':''}" data-action="bookmark-select" data-field="${field}" data-value="${id}" aria-pressed="${run[field]===id}" lang="en">${e(label)}</button>`).join('');
 return `<p class="word-banner">第 5 关 · 小小实践</p><h1 tabindex="-1" lang="en">My bookmark</h1><p class="stage-instruction">选一张交通图，做自己的电子书签，再介绍它。</p><div class="bookmark-workspace"><div><h2 lang="en">Think and choose.</h2><div class="phrase-grid">${content.bookmarkVehicles.map(v=>`<button class="phrase-card ${run.vehicle===v.id?'listened':''}" data-action="bookmark-select" data-field="vehicle" data-value="${v.id}" aria-pressed="${run.vehicle===v.id}"><img src="${v.imageSrc}" alt=""/><strong lang="en">${v.text}</strong></button>`).join('')}</div><h2 lang="en">Colour your bookmark.</h2><div class="practice-actions">${options('color',[['sky','Blue'],['sun','Yellow'],['leaf','Green']])}</div><h2 lang="en">How do you go to school?</h2><div class="practice-actions">${options('commute',[['by-car','by car'],['by-bus','by bus'],['on-foot','on foot'],['by-bike','by bike']])}</div></div>${vehicle?`<figure class="digital-bookmark bookmark-${run.color||'sky'}"><img src="${vehicle.imageSrc}" alt=""/><figcaption lang="en">${vehicle.text}</figcaption></figure>`:''}</div>${ready?`<section class="project-speaking"><h2 lang="en">Show and tell.</h2><div class="project-keywords"><span lang="en">1 · ${vehicle.text}</span><span lang="en">2 · I love…</span><span lang="en">3 · ${e(run.commute.replaceAll('-',' '))}</span></div>${run.hintLevel?'<div class="project-sentence-frame"><p lang="en">This is a ___.</p><p lang="en">I love this ___.</p><p lang="en">I go to school ___.</p></div>':''}<div class="practice-actions"><button class="text-button" data-action="bookmark-hint">${run.hintLevel?'收起提示':'看看句型'}</button><button class="record-button" data-action="record" data-record-kind="project" data-item-id="project">${recording?'重新介绍':'开始介绍'}</button>${recording?`<button class="secondary-button" data-action="play-saved-recording" data-id="${recording}">听我的介绍</button><button class="primary-button" data-action="finish-project">完成小小实践</button>`:''}</div></section>`:''}<p id="feedback" class="feedback" role="status">${recording?'作品介绍已保存。':ready?'看自己的书签，完整介绍一遍。':'先选图、选书签颜色，再选自己的出行方式。'}</p>`;
}
