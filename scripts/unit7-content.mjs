import { UNIT2_CONTENT } from './unit2-content.mjs';

const art = id => `./assets/unit7/${id}.png`;
const audio = id => `./assets/unit7/${id}.m4a`;
const core = [
  ['spring', 'spring'],
  ['summer', 'summer'],
  ['autumn', 'autumn'],
  ['winter', 'winter']
];
const phrases = core.map(([id, text]) => ({
  id,
  text,
  kind: 'core',
  imageSrc: art(id),
  audioSrc: audio(id),
  modelAudioSrc: audio(`${id}-model`)
}));

const storyLines = [
  ['spring-warm', 'Little apple tree', "It's spring. It's warm.", 'spring'],
  ['white-flowers', 'Little apple tree', 'Look! I have white flowers.', 'spring'],
  ['smell-flowers', 'Little rabbit', 'I can smell the flowers.', 'spring'],
  ['summer-hot', 'Little apple tree', "Summer is coming. It's hot.", 'summer'],
  ['green-leaves', 'Little apple tree', 'I have many green leaves.', 'summer'],
  ['have-rest', 'Little rabbit', 'Let me have a rest.', 'summer'],
  ['autumn-cool', 'Little apple tree', "Here comes autumn. It's cool.", 'autumn'],
  ['red-apples', 'Little apple tree', 'I have red apples.', 'autumn'],
  ['how-sweet', 'Little rabbit', 'How sweet!', 'autumn'],
  ['winter-cold', 'Little apple tree', "It's winter now. It's cold.", 'winter'],
  ['no-leaves', 'Little apple tree', 'I have no leaves.', 'winter'],
  ['keep-warm', 'Little rabbit', 'Keep warm!', 'winter']
].map(([id, speaker, text, season]) => ({
  id: `story-${id}`,
  speaker,
  text,
  imageSrc: art(`story-${season}`),
  audioSrc: audio(`story-${id}`)
}));
const panels = core.map(([id]) => ({ id, imageSrc: art(`story-${id}`) }));
const lyrics = [
  'I love to see pretty flowers in spring.',
  'I love to rest under big trees in summer.',
  'I love to eat yummy fruit in autumn.',
  'I love to play with the white snow in winter.'
];
const subtitles = {
  words: '认识四季',
  listening: '听描述，选季节',
  story: 'The little apple tree',
  song: 'The four seasons',
  project: '四季听音宾果'
};

export const UNIT7_CONTENT = {
  id: 'unit7',
  number: 7,
  title: 'Seasons',
  homeClass: 'family-unit-scene unit7-family-scene',
  homeArt: art('home'),
  phrases,
  learnPhraseIds: core.map(([id]) => id),
  dictationPhraseIds: core.map(([id]) => id),
  resumeWordsDictation: true,
  wordGroups: [{ title: '四季', ids: core.map(([id]) => id) }],
  phraseQuiz: core.map(([id], index) => ({
    id: `choose-${id}`,
    targetId: id,
    optionIds: [core[(index + 1) % 4][0], id, core[(index + 2) % 4][0]]
  })),
  listeningQuiz: [
    { id: 'listen-spring', targetId: 'spring', audioSrc: audio('listen-spring'), optionIds: ['autumn', 'spring'] },
    { id: 'listen-winter', targetId: 'winter', audioSrc: audio('listen-winter'), optionIds: ['summer', 'winter'] }
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
    unitTitle: 'Seasons',
    verifiedPages: 'Unit 7 pp.45–49',
    pageRange: '45–49',
    unitHomeVisual: art('home'),
    familyVisual: art('home'),
    officialTracks: {
      topicWords: core.map(([id]) => audio(`${id}-model`)),
      listening: [audio('listen-spring'), audio('listen-winter')],
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
    song: 'four-seasons-complete',
    project: 'seasons-bingo-complete'
  },
  practiceStages: {
    story: [
      {
        id: 'apple-tree-listen',
        type: 'listen',
        title: 'The little apple tree',
        instruction: '先完整听一遍故事，再完成两道英语理解题。',
        audioSrc: audio('story-whole'),
        gallery: panels
      },
      {
        id: 'apple-tree-autumn-check',
        type: 'match',
        title: 'In autumn, the little apple tree has ...',
        instruction: '根据刚才听到的故事，选出正确的英语信息。',
        imageSrc: art('story-autumn'),
        options: ['red apples', 'a warm scarf'],
        answer: 'red apples'
      },
      {
        id: 'apple-tree-winter-check',
        type: 'match',
        title: 'In winter, the little rabbit brings ...',
        instruction: '根据刚才听到的故事，选出正确的英语信息。',
        imageSrc: art('story-winter'),
        options: ['red apples', 'a warm scarf'],
        answer: 'a warm scarf'
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
        id: 'apple-tree-whole',
        type: 'repeat',
        title: 'Tell the whole story.',
        instruction: '看四幅图，把故事连起来完整跟读一遍。',
        audioSrc: audio('story-whole'),
        transcript: storyLines,
        gallery: panels,
        rewardStage: 'dialogue',
        recordLabel: '录下完整故事'
      },
      {
        id: 'apple-tree-role',
        type: 'role-play',
        title: 'Choose one season and role-play.',
        instruction: '选一个季节，先听苹果树说，再替小兔子接一句。',
        options: [
          { id: 'spring', text: 'Spring', imageSrc: art('story-spring'), promptAudioSrc: audio('story-white-flowers'), replyText: 'I can smell the flowers.' },
          { id: 'summer', text: 'Summer', imageSrc: art('story-summer'), promptAudioSrc: audio('story-green-leaves'), replyText: 'Let me have a rest.' },
          { id: 'autumn', text: 'Autumn', imageSrc: art('story-autumn'), promptAudioSrc: audio('story-red-apples'), replyText: 'How sweet!' },
          { id: 'winter', text: 'Winter', imageSrc: art('story-winter'), promptAudioSrc: audio('story-no-leaves'), replyText: 'Keep warm!' }
        ],
        rewardStage: 'dialogue',
        recordLabel: '录下小兔子的回答',
        finishLabel: '完成故事听说'
      }
    ],
    song: [
      {
        id: 'four-seasons-sing',
        type: 'repeat',
        title: 'The four seasons',
        instruction: '先完整听一遍，再跟着节奏唱读。',
        audioSrc: audio('song'),
        lyrics,
        imageSrc: art('home'),
        recordLabel: '录下完整演唱'
      },
      {
        id: 'favorite-season',
        type: 'speak-choice',
        title: 'Which season do you like?',
        instruction: '选自己喜欢的季节，再用两句话说出理由。',
        options: core.map(([id, text]) => ({ id, text, imageSrc: art(id) })),
        frames: ['I like ___.', 'I love to ___.'],
        showFrameHint: true,
        rewardStage: 'transfer',
        recordLabel: '录下我的季节表达',
        finishLabel: '完成歌谣唱读'
      }
    ],
    project: [
      {
        id: 'seasons-audio-bingo',
        type: 'order',
        title: 'Seasons audio bingo',
        instruction: '先听四季词，再按听到的顺序依次点图；点已选图片可撤销。',
        audioSrc: audio('seasons-bingo'),
        playLabel: '听四季词',
        layoutClass: 'season-bingo-grid',
        options: [phrases[2], phrases[0], phrases[3], phrases[1]],
        answerIds: core.map(([id]) => id),
        checkLabel: '检查四季顺序',
        finishLabel: '完成四季听音宾果'
      }
    ]
  },
  song: {
    kind: 'song',
    title: 'The four seasons',
    audioSrc: audio('song'),
    imageSrc: art('home'),
    lyrics
  },
  projectType: 'audio-order',
  projectTitle: 'Seasons audio bingo',
  firstCompletionStars: 36
};

for (const [stage, activities] of Object.entries(UNIT7_CONTENT.practiceStages)) {
  for (const activity of activities) {
    activity.stageLabel = UNIT7_CONTENT.steps.find(step => step.id === stage).title;
  }
}
