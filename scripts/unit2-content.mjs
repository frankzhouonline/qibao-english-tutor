const AUDIO_ROOT = "./assets/audio/official/unit2";
const VISUAL_ROOT = "./assets";
const audio = (file) => `${AUDIO_ROOT}/${file}`;
const visual = (file) => `${VISUAL_ROOT}/${file}`;

const visualMaster = visual("20260910_Unit2寻找球与凌乱房间_v01.png");
const visualBooksToys = visual("20260910_Unit2整理书和玩具_v01.png");
const visualBoxDesk = visual("20260910_Unit2箱子放桌上_v01.png");
const visualBoxBall = visual("20260910_Unit2箱子床下找到球_v01.png");
const visualPencilBag = visual("20260910_Unit2铅笔盒放书包_v01.png");
const visualPhraseDesk = visual("20260911_Unit2词组_书在桌上_v01.png");
const visualPhraseBox = visual("20260911_Unit2词组_玩具在箱里_v01.png");
const visualPhraseBed = visual("20260911_Unit2词组_小猫在床下_v01.png");
const visualDollBed = visual("20260911_Unit2听力_玩偶在床上_v01.png");
const visualListeningBoxBed = visual("20260911_Unit2听力_箱子在床下_v01.png");
const visualBooksShelf = visual("20260911_Unit2实践_书在书架上_v01.png");
const visualTidyRoom = visual("20260911_Unit2实践_整洁房间_v01.png");
const visualLikeRoom = visual("20260911_Unit2实践_喜欢我的房间_v01.png");
const visualTogether = visual("20260919_Unit2词汇_一起整理_v01.png");

export const UNIT2_PHRASES = [
  { id: "on-the-desk", text: "on the desk", audioSrc: audio("word-on-the-desk.mp3"), imageSrc: visualPhraseDesk, kind: "core" },
  { id: "in-the-box", text: "in the box", audioSrc: audio("word-in-the-box.mp3"), imageSrc: visualPhraseBox, kind: "core" },
  { id: "under-the-bed", text: "under the bed", audioSrc: audio("word-under-the-bed.mp3"), imageSrc: visualPhraseBed, kind: "core" },
  { id: "put", text: "put", audioSrc: audio("word-put.mp3"), imageSrc: visualBoxDesk, kind: "core" },
  { id: "room", text: "room", audioSrc: audio("word-room.mp3"), imageSrc: visualLikeRoom, kind: "core" },
  { id: "tidy", text: "tidy", audioSrc: audio("word-tidy.mp3"), imageSrc: visualTidyRoom, kind: "core" },
  { id: "mess", text: "mess", audioSrc: audio("word-mess.mp3"), imageSrc: visualMaster, kind: "core" },
  { id: "together", text: "together", audioSrc: audio("word-together.mp3"), imageSrc: visualTogether, kind: "core" },
  { id: "shelf", text: "shelf", audioSrc: audio("word-shelf.mp3"), imageSrc: visualBooksShelf, kind: "core" },
  { id: "pencil-case-in-school-bag", text: "I put my pencil case in my school bag.", audioSrc: audio("listen-pencil-case-in-school-bag.mp3"), imageSrc: visualPencilBag, kind: "listening" },
  { id: "doll-on-bed", text: "I put my doll on my bed.", audioSrc: audio("listen-doll-on-bed.mp3"), imageSrc: visualDollBed, kind: "listening" },
  { id: "box-under-bed", text: "And I put my box under the bed.", audioSrc: audio("listen-box-under-bed.mp3"), imageSrc: visualListeningBoxBed, kind: "listening" }
];

export const UNIT2_PHRASE_QUIZ = [
  { id: "phrase-q1", targetId: "under-the-bed", optionIds: ["on-the-desk", "in-the-box", "under-the-bed"] },
  { id: "phrase-q2", targetId: "on-the-desk", optionIds: ["in-the-box", "under-the-bed", "on-the-desk"] },
  { id: "phrase-q3", targetId: "in-the-box", optionIds: ["under-the-bed", "on-the-desk", "in-the-box"] },
  { id: "word-put", targetId: "put", optionIds: ["room", "tidy", "put"] },
  { id: "word-room", targetId: "room", optionIds: ["put", "room", "tidy"] },
  { id: "word-tidy", targetId: "tidy", optionIds: ["tidy", "put", "room"] },
  { id: "word-mess", targetId: "mess", optionIds: ["shelf", "mess", "together"] },
  { id: "word-together", targetId: "together", optionIds: ["together", "shelf", "mess"] },
  { id: "word-shelf", targetId: "shelf", optionIds: ["mess", "together", "shelf"] }
];

export const UNIT2_LISTENING_QUIZ = [
  { id: "listen-pencil-case-school-bag", targetId: "pencil-case-in-school-bag", optionIds: ["doll-on-bed", "pencil-case-in-school-bag", "on-the-desk"] },
  { id: "listen-doll-on-bed", targetId: "doll-on-bed", optionIds: ["box-under-bed", "pencil-case-in-school-bag", "doll-on-bed"] },
  { id: "listen-box-under-bed", targetId: "box-under-bed", optionIds: ["on-the-desk", "box-under-bed", "doll-on-bed"] }
];

export const UNIT2_SCENES = [
  {
    id: "find-the-ball",
    title: "Where’s my ball?",
    prompt: "look · ask",
    imageSrc: visualMaster,
    transferImageSrcs: [visualMaster],
    lines: [
      { id: "mum-mum-wheres-my-ball", speaker: "Minmin", text: "Mum … Mum! Where’s my ball?", audioSrc: audio("line-mum-wheres-my-ball.mp3") }
    ]
  },
  {
    id: "tidy-together",
    title: "What a mess!",
    prompt: "notice · apologise · tidy",
    imageSrc: visualMaster,
    transferImageSrcs: [visualMaster],
    lines: [
      { id: "what-a-mess", speaker: "Mum", text: "What a mess!", audioSrc: audio("line-what-a-mess.mp3") },
      { id: "sorry", speaker: "Minmin", text: "Sorry.", audioSrc: audio("line-sorry.mp3") },
      { id: "lets-tidy-room-together", speaker: "Mum", text: "Let’s tidy the room together.", audioSrc: audio("line-lets-tidy-room-together.mp3") }
    ]
  },
  {
    id: "books-and-toys",
    title: "Books and toys",
    prompt: "books · toys",
    imageSrc: visualBooksToys,
    transferImageSrcs: [visualBooksToys],
    lines: [
      { id: "put-books-on-shelf", speaker: "Mum", text: "Put the books on the shelf.", audioSrc: audio("line-put-books-on-shelf.mp3") },
      { id: "ok-what-about-toys", speaker: "Minmin", text: "OK. What about the toys? In the box?", audioSrc: audio("line-ok-what-about-toys-in-box.mp3") },
      { id: "yes-thats-right", speaker: "Mum", text: "Yes, that’s right.", audioSrc: audio("line-yes-thats-right.mp3") }
    ]
  },
  {
    id: "move-the-box",
    title: "The box",
    prompt: "box · desk · bed",
    imageSrc: visualBoxDesk,
    transferImageSrcs: [visualBoxDesk],
    lines: [
      { id: "i-can-put-box-on-desk", speaker: "Minmin", text: "I can put the box on the desk.", audioSrc: audio("line-i-can-put-box-on-desk.mp3") },
      { id: "oh-no-put-it-under-bed", speaker: "Mum", text: "Oh, no. Please put it under the bed.", audioSrc: audio("line-oh-no-put-it-under-bed.mp3") },
      { id: "all-right", speaker: "Minmin", text: "All right.", audioSrc: audio("line-all-right.mp3") }
    ]
  },
  {
    id: "find-the-ball-ending",
    title: "A surprise",
    prompt: "look · surprise",
    imageSrc: visualBoxBall,
    transferImageSrcs: [visualBoxBall],
    lines: [
      { id: "oh-my-ball", speaker: "Minmin", text: "Oh! My ball.", audioSrc: audio("line-oh-my-ball.mp3") }
    ]
  }
];

export const UNIT2_SENTENCES = UNIT2_SCENES.flatMap((scene) => scene.lines.map((line) => ({
  ...line,
  sceneId: scene.id,
  sceneTitle: scene.title,
  imageSrc: scene.imageSrc
})));

export const UNIT2_DIALOGUE_GROUPS = [
  { id: "reply-sorry", title: "What a mess!", imageSrc: visualMaster, lines: [UNIT2_SCENES[1].lines[0], UNIT2_SCENES[1].lines[1]] },
  { id: "reply-toys", title: "Books and toys", imageSrc: visualBooksToys, lines: [UNIT2_SCENES[2].lines[0], UNIT2_SCENES[2].lines[1]] },
  { id: "reply-thats-right", title: "In the box?", imageSrc: visualBooksToys, lines: [UNIT2_SCENES[2].lines[1], UNIT2_SCENES[2].lines[2]] },
  { id: "reply-all-right", title: "Under the bed", imageSrc: visualBoxDesk, lines: [UNIT2_SCENES[3].lines[1], UNIT2_SCENES[3].lines[2]] }
];

export const UNIT2_TRANSFER_TASKS = [
  { id: "transfer-find-ball", title: "Where’s my ball?", prompt: "look · ask", imageSrc: visualMaster, transferImageSrcs: [visualMaster], lines: UNIT2_SCENES[0].lines },
  { id: "transfer-tidy", title: "Tidy together", prompt: "notice · apologise · tidy", imageSrc: visualMaster, transferImageSrcs: [visualMaster], lines: UNIT2_SCENES[1].lines },
  { id: "transfer-books-toys", title: "Books and toys", prompt: "books · toys", imageSrc: visualBooksToys, transferImageSrcs: [visualBooksToys], lines: UNIT2_SCENES[2].lines },
  { id: "transfer-box-ball", title: "The box and a surprise", prompt: "box · under · surprise", imageSrc: visualBoxDesk, transferImageSrcs: [visualBoxDesk, visualBoxBall], lines: [...UNIT2_SCENES[3].lines, ...UNIT2_SCENES[4].lines] }
];

export const UNIT2_TEXTBOOK = {
  title: "英语 二年级上册",
  publisher: "上海教育出版社",
  edition: "2025 年 7 月第 1 版，2026 年 7 月第 2 次印刷",
  isbn: "978-7-5720-3608-8",
  verifiedPages: "Unit 2 pp.15–20",
  unitHomeVisual: visualMaster,
  familyVisual: visualBoxBall,
  officialTracks: {
    topicWords: audio("word-under-the-bed.mp3"),
    song: audio("unit2-song-time-full.mp3"),
    songListening: audio("listen-pencil-case-in-school-bag.mp3"),
    talkingTime: audio("line-mum-wheres-my-ball.mp3")
  }
};

export const UNIT2_STEPS = [
  { id: "words", title: "词组练习", subtitle: "听懂词组，再听音默写", imageSrc: visual("20260911_任务卡_词组练习_v01.png") },
  { id: "listening", title: "听力挑战", subtitle: "听清物品放在哪里", imageSrc: visual("20260911_任务卡_听力挑战_v01.png") },
  { id: "story", title: "故事听说", subtitle: "Where’s my ball?", imageSrc: visual("20260911_任务卡_故事听说_v01.png") },
  { id: "song", title: "歌谣唱读", subtitle: "I like my room", imageSrc: visual("20260911_任务卡_歌谣唱读_v01.png") },
  { id: "project", title: "小小实践", subtitle: "My tidy room", imageSrc: visual("20260911_任务卡_小小实践_v01.png") }
];

export const UNIT2_PROJECT_ITEMS = [
  { id: "books", label: "books", answer: "on the shelf", options: ["on the shelf", "in the box", "under the bed"], imageSrc: visualBooksShelf },
  { id: "toys", label: "toys", answer: "in the box", options: ["on the desk", "in the box", "under the bed"], imageSrc: visualPhraseBox },
  { id: "box", label: "box", answer: "under the bed", options: ["on the desk", "in the box", "under the bed"], imageSrc: visualListeningBoxBed }
];

export const UNIT2_REWARD_RULES = Object.freeze({ words: 1, listening: 1, sentences: 1, dialogue: 2, transfer: 3, dictation: 2, song: 1, project: 3 });

export const UNIT2_CONTENT = Object.freeze({
  id: "unit2",
  number: 2,
  title: "My room",
  homeClass: "unit2-family-scene",
  phrases: UNIT2_PHRASES,
  learnPhraseIds: ["on-the-desk", "in-the-box", "under-the-bed", "put", "room", "tidy", "mess", "together", "shelf"],
  dictationPhraseIds: ["on-the-desk", "in-the-box", "under-the-bed", "put", "room", "tidy", "mess", "together", "shelf"],
  phraseQuiz: UNIT2_PHRASE_QUIZ,
  listeningQuiz: UNIT2_LISTENING_QUIZ,
  scenes: UNIT2_SCENES,
  sentences: UNIT2_SENTENCES,
  dialogueGroups: UNIT2_DIALOGUE_GROUPS,
  transferTasks: UNIT2_TRANSFER_TASKS,
  steps: UNIT2_STEPS,
  unlockAfter: {},
  textbook: UNIT2_TEXTBOOK,
  rewards: UNIT2_REWARD_RULES,
  song: {
    title: "I like my room",
    audioSrc: audio("unit2-song-time-full.mp3"),
    lyrics: ["I put my books", "On the desk.", "I put my toys", "In the box.", "My room is tidy.", "I like it very much."],
    reward: 1,
    optional: false
  },
  projectItems: UNIT2_PROJECT_ITEMS,
  projectOutcomeCues: [
    { id: "tidy-room", keyword: "tidy", imageSrc: visualTidyRoom },
    { id: "like-room", keyword: "like my room", imageSrc: visualLikeRoom }
  ]
});
