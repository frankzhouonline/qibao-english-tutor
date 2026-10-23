const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button = (action, label, data = '') => `<button class="${action==='record'?'reading-record-button':action==='play-reading-recording'?'reading-replay-button':'reading-listen-button'}" data-action="${action}" ${data}>${label}</button>`;
const record = (book, item, recordings, label = '跟我读') => `${button('record', recordings[item.id] ? (label==='跟我读'?'再读一次':'再答一次') : label, `data-record-kind="reading" data-book-id="${book.id}" data-item-id="${item.id}"`)}${recordings[item.id] ? button('play-reading-recording','听我的',`data-recording-id="${recordings[item.id]}"`) : ''}`;

export function readingToolbarMarkup(book, index, score, {questionCount = 0} = {}) {
  const totalPages=book.spreads.flatMap(s=>s.pages).length;
  return `<header class="reading-reader-toolbar">
      <button class="reading-toolbar-button" data-action="back-reading-library">返回书架</button>
      <div><small>${escape(book.genre)}</small><h1 lang="en">${escape(book.title)}</h1></div>
      <span><b>${index+1}</b> / ${questionCount||book.spreads.length}${questionCount?'<small>读后聊一聊</small>':`<small class="reading-score-long">本书 ${score}/${totalPages} 星</small><small class="reading-score-short">${score}/${totalPages} 星</small>`}</span>
    </header>`;
}

export function readingPageActionsMarkup(book, item, recordingId) {
  return `<div class="reading-page-actions">
        <button class="reading-listen-button" data-action="play-reading-page" data-page-id="${item.id}">听一听</button>
        <button class="reading-record-button" data-action="record" data-record-kind="reading" data-book-id="${book.id}" data-item-id="${item.id}">${recordingId?'再读一次':'跟我读'}</button>
        ${recordingId?`<button class="reading-replay-button" data-action="play-reading-recording" data-recording-id="${recordingId}">听我的</button>`:''}
      </div>`;
}

export function semanticReadingMarkup(book, run, score, {questionIndex = null, referenceOpen = false, returnToQuestion = false, turnDirection = 'forward'} = {}) {
  const isQuestion = questionIndex !== null;
  const index = Math.min(isQuestion ? book.questions.length - 1 : book.spreads.length - 1, Math.max(0,isQuestion ? questionIndex : run.spreadIndex));
  const item = isQuestion ? book.questions[index] : book.spreads[index].pages[0];
  const final = index === book.spreads.length - 1;
  const count = isQuestion ? book.questions.length : book.spreads.length;
  const header = readingToolbarMarkup(book,index,score,{questionCount:isQuestion?count:0});
  let body;
  if (isQuestion) {
    body = `<section class="reading-discussion" aria-label="读后聊一聊"><h2 lang="en">${escape(item.text)}</h2><p>说说你的想法，也可以回原文找线索。</p><div class="reading-page-actions">${button('play-reading-extra','听问题','data-audio-kind="question"')}${record(book,item,run.recordingIds,'录下我的回答')}${button('reading-find-evidence','回原文找线索')}${button('reading-answer-attempt','我说好了')}</div>
    ${referenceOpen ? `<section class="reading-reference"><h3>参考思路 · 不只有一种说法</h3><p lang="en">${escape(item.reference)}</p><h3>原文线索</h3><blockquote lang="en">${escape(item.evidence)}</blockquote><p class="reading-reference-note">这是参考，不是自动判分。能用自己的话解释，并指出原文依据，才是理解的证据。</p></section>` : ''}
    ${count>1?`<div class="reading-discussion-nav">${button('reading-question-step','上一题',`data-delta="-1" ${index===0?'disabled':''}`)}${button('reading-question-step',index===count-1?'聊好了':'下一题',`data-delta="1"`)}</div>`:''}
    ${book.retell ? `<details class="reading-extra-activities"><summary>再聊一聊</summary><p lang="en">${escape(book.retell)}</p><p lang="en">${escape(book.connection)}</p></details>` : ''}</section>`;
  } else {
    const help = `<details class="reading-word-help"><summary>Word help</summary><div>${item.help.map(({word,meaning})=>`<details><summary lang="en">${escape(word)}</summary><p>${escape(meaning)}</p>${button('play-reading-extra','再听这一段','data-audio-kind="page"')}</details>`).join('')}</div></details>`;
    const credit = `<details class="reading-source-credit"><summary>关于这篇读物</summary><p lang="en">by ${escape(book.author)}${book.originalIllustrator?` · Original illustrations by ${escape(book.originalIllustrator)}`:''}</p>${(book.introduction||[]).map(line=>`<p lang="en">${escape(line)}</p>`).join('')}${(book.aboutSections||[]).map(section=>`<h3 lang="en">${escape(section.heading)}</h3><p lang="en">${escape(section.text)}</p>`).join('')}${book.aboutSections?'<p>也可以拿纸画一画、写一写。这是原书拓展，不计星。</p>':''}<p>英文保留原作；本页插图为辅助理解重绘，朗读为合成配音。</p></details>`;
    const original = book.genre==='Poetry' ? item.text.split('\n\n').map(stanza=>`<span class="reading-stanza">${escape(stanza)}</span>`).join('') : escape(item.text);
    body = `<section class="reading-book-stage">
      <button class="reading-turn-button" data-action="previous-reading-page" ${index===0?'disabled':''} aria-label="上一页">‹</button>
      <div class="reading-book-spread reading-book-spread--semantic" data-spread-id="${book.spreads[index].id}"><article class="reading-semantic-page" data-page-id="${item.id}">
        <div class="reading-page-media" style="--reading-image:url('${item.imageSrc}')"><img src="${item.imageSrc}" alt="${escape(item.alt)}" draggable="false"></div>
        <div class="reading-semantic-copy"><p lang="en" class="reading-original ${book.genre==='Poetry'?'reading-poem':''}">${original}</p>
          ${readingPageActionsMarkup(book,item,run.recordingIds[item.id])}
          ${book.stanzaAudio ? `<div class="reading-page-actions">${button('play-reading-extra','听第一节','data-audio-kind="stanza" data-stanza="0"')}${button('play-reading-extra','听第二节','data-audio-kind="stanza" data-stanza="1"')}</div>` : ''}${help}${credit}
        </div></article></div>
      <button class="reading-turn-button" data-action="${final?'finish-reading-book':'next-reading-page'}" aria-label="${final?'读完并返回书架':'下一页'}">${final?'✓':'›'}</button></section>`;
  }
  return `<main class="reading-reader-world reading-semantic-reader reading-turn-${turnDirection==='backward'?'backward':'forward'}" aria-label="${escape(book.title)} ${isQuestion?'读后聊一聊':'电子书'}">${header}${body}<footer class="reading-reader-footer reading-semantic-footer"><div class="reading-page-actions">${isQuestion?button('reading-return-text','返回阅读'): `${button('play-reading-extra',book.genre==='Poetry'?'听完整首诗':'听完整篇','data-audio-kind="whole"')}${button('reading-open-questions',returnToQuestion?'返回刚才的问题':'读后聊一聊')}`}</div><span>${isQuestion?'原题口答 · 不自动判分':book.genre==='Poetry'?'整首诗 · 两节原文':'读一读，再翻到下一页'}</span></footer><p id="feedback" class="reading-feedback" role="status"></p></main>`;
}
