const AUDIO_ROOT = "./assets/audio/official/unit1";
const VISUAL_ROOT = "./assets";
const audio = (file) => `${AUDIO_ROOT}/${file}`;
const visual = (file) => `${VISUAL_ROOT}/${file}`;

export const UNIT1_PHRASES = [
  { id: "get-up", text: "get up", audioSrc: audio("word-get-up.mp3"), imageSrc: visual("20260908_动作卡_get-up_v01.png") },
  { id: "brush-teeth", text: "brush my teeth", audioSrc: audio("word-brush-my-teeth.mp3"), imageSrc: visual("20260908_动作卡_brush-my-teeth_v01.png") },
  { id: "wash-face", text: "wash my face", audioSrc: audio("word-wash-my-face.mp3"), imageSrc: visual("20260908_动作卡_wash-my-face_v01.png") },
  { id: "have-breakfast", text: "have breakfast", audioSrc: audio("word-have-breakfast.mp3"), imageSrc: visual("20260908_动作卡_have-breakfast_v01.png") }
];

export const UNIT1_PHRASE_QUIZ = [
  { id: "phrase-q1", targetId: "wash-face", optionIds: ["brush-teeth", "wash-face", "get-up", "have-breakfast"] },
  { id: "phrase-q2", targetId: "get-up", optionIds: ["have-breakfast", "get-up", "wash-face", "brush-teeth"] },
  { id: "phrase-q3", targetId: "have-breakfast", optionIds: ["wash-face", "brush-teeth", "have-breakfast", "get-up"] },
  { id: "phrase-q4", targetId: "brush-teeth", optionIds: ["get-up", "have-breakfast", "brush-teeth", "wash-face"] }
];

export const UNIT1_SCENES = [
  {
    id: "morning-greeting",
    title: "Good morning",
    prompt: "get up",
    imageSrc: visual("20260908_动作卡_get-up_v01.png"),
    transferImageSrcs: [visual("20260908_动作卡_get-up_v01.png")],
    lines: [
      { id: "good-morning-shenshen", speaker: "Mum", text: "Good morning, Shenshen!", audioSrc: audio("line-good-morning-shenshen.mp3") },
      { id: "good-morning-mum", speaker: "Shenshen", text: "Good morning, Mum!", audioSrc: audio("line-good-morning-mum.mp3") }
    ]
  },
  {
    id: "wash-up",
    title: "Wash up",
    prompt: "brush my teeth · wash my face",
    imageSrc: visual("20260908_动作卡_brush-my-teeth_v01.png"),
    transferImageSrcs: [visual("20260908_动作卡_brush-my-teeth_v01.png"), visual("20260908_动作卡_wash-my-face_v01.png")],
    lines: [
      { id: "brush-your-teeth", speaker: "Mum", text: "Brush your teeth.", audioSrc: audio("line-brush-your-teeth.mp3") },
      { id: "ok-mum-brush-wash", speaker: "Shenshen", text: "OK, Mum. I brush my teeth and then I wash my face.", audioSrc: audio("line-ok-mum-brush-wash.mp3") }
    ]
  },
  {
    id: "breakfast",
    title: "Breakfast",
    prompt: "have breakfast",
    imageSrc: visual("20260908_动作卡_have-breakfast_v01.png"),
    transferImageSrcs: [visual("20260908_动作卡_have-breakfast_v01.png")],
    lines: [
      { id: "have-breakfast-shenshen", speaker: "Mum", text: "Have breakfast, Shenshen.", audioSrc: audio("line-have-breakfast-shenshen.mp3") },
      { id: "yes-mum", speaker: "Shenshen", text: "Yes, Mum!", audioSrc: audio("line-yes-mum.mp3") }
    ]
  },
  {
    id: "leave-for-school",
    title: "Let’s go",
    prompt: "ready for school",
    imageSrc: visual("20260908_Unit1麒宝家庭晨间大屋_v01.png"),
    transferImageSrcs: [visual("20260908_Unit1麒宝家庭晨间大屋_v01.png")],
    lines: [
      { id: "ready-for-school-dad", speaker: "Shenshen", text: "I’m ready for school, Dad!", audioSrc: audio("line-ready-for-school-dad.mp3") },
      { id: "coming-lets-go", speaker: "Dad", text: "I’m coming. Let’s go!", audioSrc: audio("line-coming-lets-go.mp3") }
    ]
  }
];

export const UNIT1_SENTENCES = UNIT1_SCENES.flatMap((scene) => scene.lines.map((line) => ({ ...line, sceneId: scene.id, sceneTitle: scene.title, imageSrc: scene.imageSrc })));

export const UNIT1_TEXTBOOK = {
  title: "英语 二年级上册",
  publisher: "上海教育出版社",
  edition: "2025 年 7 月第 1 版，2026 年 7 月第 2 次印刷",
  isbn: "978-7-5720-3608-8",
  verifiedPages: "Starter pp.2–3；Unit 1 pp.9–14",
  requiredPhrases: UNIT1_PHRASES,
  scenes: UNIT1_SCENES,
  unitHomeVisual: visual("20260908_Unit1麒宝家庭晨间大屋_v01.png"),
  familyVisual: visual("20260908_麒宝家庭晨间陪伴卡_v01.png"),
  officialTracks: {
    smallTask: audio("unit1-small-task.mp3"),
    topicWords: audio("unit1-topic-words.mp3"),
    chant: audio("unit1-chant.mp3"),
    talkingTime: audio("unit1-talking-time.mp3"),
    wordBank: audio("unit1-word-bank.mp3")
  },
  excludedOlderEditionItems: ["get dressed", "Head to toe, get dressed.", "Hurry up and get dressed."]
};

export const UNIT1_STEPS = [
  { id: "words", title: "词组练习", subtitle: "听英语，选动作", imageSrc: visual("20260911_任务卡_词组练习_v01.png") },
  { id: "sentences", title: "逐句跟读", subtitle: "听一句，跟一句", imageSrc: visual("20260911_任务卡_逐句跟读_v01.png") },
  { id: "dialogue", title: "对话接力", subtitle: "听上句，接下句", imageSrc: visual("20260911_任务卡_对话接力_v01.png") },
  { id: "transfer", title: "看图表达", subtitle: "逐图说完整对话", imageSrc: visual("20260911_任务卡_看图表达_v01.png") },
  { id: "dictation", title: "听音默写", subtitle: "听词组，自己写", imageSrc: visual("20260911_任务卡_听音默写_v01.png") }
];

export const UNIT1_REWARD_RULES = Object.freeze({ words: 1, sentences: 1, dialogue: 2, transfer: 3, dictation: 2 });

export const UNIT1_CONTENT = Object.freeze({
  id: "unit1",
  number: 1,
  title: "My morning",
  homeClass: "family-unit-scene",
  phrases: UNIT1_PHRASES,
  learnPhraseIds: UNIT1_PHRASES.map(({ id }) => id),
  dictationPhraseIds: UNIT1_PHRASES.map(({ id }) => id),
  phraseQuiz: UNIT1_PHRASE_QUIZ,
  scenes: UNIT1_SCENES,
  sentences: UNIT1_SENTENCES,
  dialogueGroups: UNIT1_SCENES,
  transferTasks: UNIT1_SCENES,
  steps: UNIT1_STEPS,
  unlockAfter: { dictation: "words" },
  textbook: UNIT1_TEXTBOOK,
  rewards: UNIT1_REWARD_RULES,
  song: null
});
