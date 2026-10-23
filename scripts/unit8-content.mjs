import { UNIT2_CONTENT } from './unit2-content.mjs';

const art = id => `./assets/unit8/${id}.png`;
const audio = id => `./assets/unit8/${id}.m4a`;
const core = [
  ['fruit', 'fruit'],
  ['apple', 'apple'],
  ['pear', 'pear'],
  ['banana', 'banana'],
  ['grape', 'grape'],
  ['orange', 'orange']
];
const phrases = core.map(([id, text]) => ({
  id,
  text,
  kind: 'core',
  imageSrc: art(id),
  audioSrc: audio(id),
  modelAudioSrc: audio(`${id}-model`)
}));
const storyFruit = [
  ['kiwi', 'kiwi'],
  ['strawberry', 'strawberry'],
  ['watermelon', 'watermelon']
].map(([id, text]) => ({ id, text, kind: 'story', imageSrc: art(id) }));
const allPhrases = [...phrases, ...storyFruit];

const storyLines = [
  ['what-need', 'Grandma', 'What do you need, Shenshen?', 'story-1'],
  ['banana-kiwi', 'Shenshen', 'I need a banana and a kiwi, Grandma.', 'story-1'],
  ['two-grapes', 'Shenshen', 'Two grapes, please.', 'story-2'],
  ['here-you-are', 'Grandma', 'Here you are.', 'story-2'],
  ['an-apple', 'Grandma', 'An apple?', 'story-3'],
  ['yes-please', 'Shenshen', 'Yes, please.', 'story-3'],
  ['what-else', 'Grandma', 'What else?', 'story-3'],
  ['need-orange', 'Shenshen', 'I need an orange.', 'story-3'],
  ['thank-grandma', 'Shenshen', 'Thank you, Grandma.', 'story-4'],
  ['nice-plate', 'Shenshen', "Wow, it's a nice plate.", 'story-4'],
  ['for-you', 'Grandma', 'A fruit plate for you.', 'story-5']
].map(([id, speaker, text, scene]) => ({
  id: `story-${id}`,
  speaker,
  text,
  imageSrc: art(scene),
  audioSrc: audio(`story-${id}`)
}));
const panels = [1, 2, 3, 4, 5].map(number => ({ id: `story-${number}`, imageSrc: art(`story-${number}`) }));
const lyrics = [
  'Apples red. Apples red.',
  'Pears yellow. Pears yellow.',
  'Apples and pears.',
  'Red and yellow.',
  'I love fruit. I love fruit.'
];
const subtitles = {
  words: '认识水果',
  listening: '听描述，选水果',
  story: "Shenshen's fruit plate",
  song: 'I love fruit',
  project: '制作水果盘介绍'
};

export const UNIT8_CONTENT = {
  id: 'unit8',
  number: 8,
  title: 'Yummy fruit',
  homeClass: 'family-unit-scene unit8-family-scene',
  homeArt: art('home'),
  phrases: allPhrases,
  learnPhraseIds: core.map(([id]) => id),
  dictationPhraseIds: core.map(([id]) => id),
  resumeWordsDictation: true,
  wordGroups: [
    { title: '常见水果', ids: ['apple', 'pear', 'banana'] },
    { title: '水果和类别', ids: ['grape', 'orange', 'fruit'] }
  ],
  phraseQuiz: [
    { id: 'choose-fruit', targetId: 'fruit', optionIds: ['banana', 'fruit', 'apple'] },
    { id: 'choose-apple', targetId: 'apple', optionIds: ['pear', 'apple', 'orange'] },
    { id: 'choose-pear', targetId: 'pear', optionIds: ['banana', 'grape', 'pear'] },
    { id: 'choose-banana', targetId: 'banana', optionIds: ['orange', 'banana', 'apple'] },
    { id: 'choose-grape', targetId: 'grape', optionIds: ['grape', 'pear', 'orange'] },
    { id: 'choose-orange', targetId: 'orange', optionIds: ['apple', 'orange', 'grape'] }
  ],
  listeningQuiz: [
    { id: 'listen-orange-juicy', targetId: 'orange', audioSrc: audio('listen-orange-juicy'), optionIds: ['grape', 'orange'] },
    { id: 'listen-orange-sweet', targetId: 'orange', audioSrc: audio('listen-orange-sweet'), optionIds: ['orange', 'pear'] },
    { id: 'listen-red-apple', targetId: 'apple', audioSrc: audio('listen-red-apple'), optionIds: ['banana', 'apple'] },
    { id: 'listen-yellow-pear', targetId: 'pear', audioSrc: audio('listen-yellow-pear'), optionIds: ['apple', 'pear'] }
  ],
  scenes: [],
  sentences: [],
  dialogueGroups: [],
  transferTasks: [],
  unlockAfter: {},
  steps: UNIT2_CONTENT.steps.map(step => ({ ...step, subtitle: subtitles[step.id] })),
  textbook: {
    title: UNIT2_CONTENT.textbook.title,
    publisher: UNIT2_CONTENT.textbook.publisher,
    edition: UNIT2_CONTENT.textbook.edition,
    isbn: UNIT2_CONTENT.textbook.isbn,
    unitTitle: 'Yummy fruit',
    verifiedPages: 'Unit 8 pp.51–56',
    pageRange: '51–56',
    unitHomeVisual: art('home'),
    familyVisual: art('home'),
    officialTracks: {
      topicWords: core.map(([id]) => audio(`${id}-model`)),
      listening: ['listen-orange-juicy', 'listen-orange-sweet', 'listen-red-apple', 'listen-yellow-pear'].map(audio),
      song: audio('song'),
      story: storyLines.map(line => line.audioSrc)
    }
  },
  rewards: {
    words: 1,
    listening: 1,
    sentences: 1,
    dialogue: 2,
    transfer: 3,
    dictation: 2,
    story: 3,
    song: 1,
    project: 3
  },
  practiceCompletionRewards: {
    song: 'fruit-song-complete',
    project: 'fruit-plate-complete'
  },
  practiceStages: {
    story: [
      {
        id: 'fruit-plate-listen',
        type: 'listen',
        title: "Shenshen's fruit plate",
        instruction: '先完整听一遍故事，再根据故事选择水果。',
        audioSrc: audio('story-whole'),
        gallery: panels
      },
      {
        id: 'fruit-needs-a',
        type: 'multi-select',
        title: 'What does Shenshen need?',
        instruction: '根据刚才听到的故事，选出她需要的全部水果。',
        requireAudio: false,
        options: ['banana', 'kiwi', 'grape', 'strawberry'].map(id => allPhrases.find(item => item.id === id)),
        answerIds: ['banana', 'kiwi', 'grape'],
        checkLabel: '检查第一组水果'
      },
      {
        id: 'fruit-needs-b',
        type: 'multi-select',
        title: 'What else does Shenshen need?',
        instruction: '继续根据故事选择，不要漏选，也不要多选。',
        requireAudio: false,
        options: ['apple', 'orange', 'watermelon', 'pear'].map(id => allPhrases.find(item => item.id === id)),
        answerIds: ['apple', 'orange'],
        checkLabel: '检查第二组水果'
      },
      ...storyLines.map(line => ({
        ...line,
        type: 'repeat',
        title: line.text,
        instruction: '先听这一句，再跟读录音。',
        rewardStage: 'sentences',
        recordLabel: '跟读录音'
      })),
      {
        id: 'fruit-plate-whole',
        type: 'repeat',
        title: 'Tell the whole story.',
        instruction: '看五幅图，把故事完整跟读一遍。',
        audioSrc: audio('story-whole'),
        transcript: storyLines,
        gallery: panels,
        rewardStage: 'dialogue',
        recordLabel: '录下完整故事'
      },
      {
        id: 'fruit-plate-role',
        type: 'role-play',
        title: 'Answer Grandma.',
        instruction: '选一个奶奶的问题，先听问题，再替 Shenshen 回答。',
        options: [
          { id: 'what-need', text: 'What do you need?', imageSrc: art('story-1'), promptAudioSrc: audio('story-what-need'), replyText: 'I need a banana and a kiwi, Grandma.' },
          { id: 'an-apple', text: 'An apple?', imageSrc: art('story-3'), promptAudioSrc: audio('story-an-apple'), replyText: 'Yes, please.' },
          { id: 'what-else', text: 'What else?', imageSrc: art('story-3'), promptAudioSrc: audio('story-what-else'), replyText: 'I need an orange.' }
        ],
        rewardStage: 'dialogue',
        recordLabel: '录下 Shenshen 的回答',
        finishLabel: '完成故事听说'
      }
    ],
    song: [
      {
        id: 'fruit-song-sing',
        type: 'repeat',
        title: 'I love fruit',
        instruction: '先完整听一遍，再跟着节奏完整唱读。',
        audioSrc: audio('song'),
        lyrics,
        imageSrc: art('fruit'),
        recordLabel: '录下完整演唱'
      },
      {
        id: 'favorite-fruit',
        type: 'speak-choice',
        title: 'Which fruit do you love?',
        instruction: '选一种水果，说说它的颜色和味道。',
        options: [
          { id: 'apples', text: 'apples', imageSrc: art('apple') },
          { id: 'pears', text: 'pears', imageSrc: art('pear') },
          { id: 'bananas', text: 'bananas', imageSrc: art('banana') },
          { id: 'grapes', text: 'grapes', imageSrc: art('grape') },
          { id: 'oranges', text: 'oranges', imageSrc: art('orange') }
        ],
        frames: ['I love ___.', "They're ___ and ___."],
        showFrameHint: true,
        rewardStage: 'transfer',
        recordLabel: '录下我的水果表达',
        finishLabel: '完成歌谣唱读'
      }
    ],
    project: [
      {
        id: 'my-fruit-plate',
        type: 'scene-log',
        title: 'My fruit plate',
        instruction: '选2–4种水果和赠送对象，再完整介绍自己的水果盘。',
        selectionLabel: 'Choose fruit.',
        previewLabel: 'My fruit plate',
        emptyText: '选好水果后，这里会出现你的水果盘。',
        minSelections: 2,
        maxSelections: 4,
        options: ['apple', 'pear', 'banana', 'grape', 'orange', 'kiwi'].map(id => allPhrases.find(item => item.id === id)),
        secondaryLabel: 'Who is it for?',
        secondaryOptions: [
          { id: 'mother', text: 'mother' },
          { id: 'brother', text: 'brother' },
          { id: 'family', text: 'family' }
        ],
        frames: ['Look! I can make a fruit plate.', 'I need ___.', "It's a fruit plate for my ___."],
        recordLabel: '录下我的水果盘介绍',
        finishLabel: '完成小小实践'
      }
    ]
  },
  song: {
    kind: 'song',
    title: 'I love fruit',
    audioSrc: audio('song'),
    imageSrc: art('fruit'),
    lyrics
  },
  projectType: 'guided-speech',
  projectTitle: 'My fruit plate',
  firstCompletionStars: 41
};

for (const [stage, activities] of Object.entries(UNIT8_CONTENT.practiceStages)) {
  for (const activity of activities) {
    activity.stageLabel = UNIT8_CONTENT.steps.find(step => step.id === stage).title;
  }
}
