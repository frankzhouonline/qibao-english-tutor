import { UNIT2_CONTENT } from './unit2-content.mjs';

const art = id => `./assets/unit6/${id}.png`;
const audio = id => `./assets/unit6/${id}.m4a`;
const core = [
  ['dolphin', 'dolphin'],
  ['clownfish', 'clownfish'],
  ['seahorse', 'seahorse'],
  ['in-the-sea', 'in the sea']
];
const phrases = core.map(([id, text]) => ({
  id,
  text,
  kind: 'core',
  imageSrc: art(id === 'in-the-sea' ? 'home' : id),
  audioSrc: audio(id)
}));
const listeningTarget = {
  id: 'dolphin-riddle',
  text: "It's big. It's lovely. It can sing. It can swim fast. It can jump high.",
  kind: 'listening',
  imageSrc: art('dolphin'),
  audioSrc: audio('listen-dolphin')
};
const locationOptions = [
  {
    id: 'location-desk',
    text: 'on the desk',
    kind: 'visual-distractor',
    imageSrc: UNIT2_CONTENT.phrases.find(phrase => phrase.id === 'on-the-desk').imageSrc
  },
  {
    id: 'location-bed',
    text: 'under the bed',
    kind: 'visual-distractor',
    imageSrc: UNIT2_CONTENT.phrases.find(phrase => phrase.id === 'under-the-bed').imageSrc
  }
];

const storyLines = [
  ['nice-place', 'Papa Seahorse', 'What a nice place.', 'story-1'],
  ['lay-eggs', 'Mama Seahorse', 'Let me lay my eggs.', 'story-1'],
  ['my-babies', 'Papa Seahorse', 'Oh, my babies.', 'story-2'],
  ['far-away', 'Little seahorse', 'I like swimming far away.', 'story-3'],
  ['up-down', 'Little seahorse', 'I like moving up and down.', 'story-3'],
  ['papa-goodbye', 'Papa Seahorse', 'My dear babies, goodbye.', 'story-4'],
  ['babies-goodbye', 'Little seahorses', 'Goodbye, Papa. We love you.', 'story-4']
].map(([id, speaker, text, scene]) => ({
  id: `story-${id}`,
  speaker,
  text,
  imageSrc: art(scene),
  audioSrc: audio(`story-${id}`)
}));
const panels = ['story-1', 'story-2', 'story-3', 'story-4'].map(id => ({ id, imageSrc: art(id) }));

const chantPart1 = [
  'Swim in the sea.',
  'Swim in the sea.',
  'What do you see',
  'In the blue sea?'
];
const chantPart2 = [
  'I see a seahorse.',
  'I see a dolphin,',
  'And a clownfish',
  'In the blue sea.'
];
const chantLyrics = [...chantPart1, ...chantPart2];
const subtitles = {
  words: '认识海里的动物',
  listening: '听描述，猜动物',
  story: 'Little seahorses',
  song: 'The blue sea',
  project: '海底发现之旅'
};

export const UNIT6_CONTENT = {
  id: 'unit6',
  number: 6,
  title: 'In the sea',
  homeClass: 'family-unit-scene unit6-family-scene',
  homeArt: art('home'),
  phrases: [...phrases, listeningTarget, ...locationOptions],
  learnPhraseIds: core.map(([id]) => id),
  dictationPhraseIds: core.map(([id]) => id),
  resumeWordsDictation: true,
  wordGroups: [{ title: '海洋动物和情境', ids: core.map(([id]) => id) }],
  phraseQuiz: [
    { id: 'choose-dolphin', targetId: 'dolphin', optionIds: ['seahorse', 'dolphin', 'clownfish'] },
    { id: 'choose-clownfish', targetId: 'clownfish', optionIds: ['dolphin', 'clownfish', 'seahorse'] },
    { id: 'choose-seahorse', targetId: 'seahorse', optionIds: ['clownfish', 'seahorse', 'dolphin'] },
    { id: 'choose-in-the-sea', targetId: 'in-the-sea', optionIds: ['location-desk', 'in-the-sea', 'location-bed'] }
  ],
  listeningQuiz: [{ id: 'dolphin-riddle', targetId: 'dolphin-riddle', optionIds: ['clownfish', 'dolphin-riddle', 'seahorse'] }],
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
    unitTitle: 'In the sea',
    verifiedPages: 'Unit 6 pp.40–43',
    pageRange: '40–43',
    unitHomeVisual: art('home'),
    familyVisual: art('home'),
    officialTracks: {
      topicWords: core.map(([id]) => audio(id)),
      listening: [audio('listen-dolphin')],
      chant: audio('chant-whole'),
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
    song: 'chant-complete',
    project: 'sea-path-complete'
  },
  practiceStages: {
    story: [
      {
        id: 'seahorses-listen',
        type: 'listen',
        title: 'Little seahorses',
        instruction: '先完整听一遍故事，再完成后面的练习。',
        audioSrc: audio('story-whole'),
        gallery: panels
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
        id: 'seahorses-whole',
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
        id: 'clownfish-hide-and-seek',
        type: 'open-speech',
        title: 'Little seahorses see a clownfish.',
        instruction: '看图，说说小海马看见了谁。先自己说，再按需看提示。',
        imageSrc: art('clownfish'),
        showFrameHint: true,
        frames: ['Little seahorses see a clownfish.'],
        rewardStage: 'transfer',
        recordLabel: '录下我的句子',
        finishLabel: '完成故事听说'
      }
    ],
    song: [
      {
        id: 'blue-sea-whole',
        type: 'repeat',
        title: 'The blue sea',
        instruction: '完整听一遍，再按节奏完整唱读。需要时可以重复播放。',
        audioSrc: audio('chant-whole'),
        lyrics: chantLyrics,
        imageSrc: art('home'),
        recordLabel: '录下完整歌谣',
        finishLabel: '完成歌谣唱读'
      }
    ],
    project: [
      {
        id: 'sea-path-speaking',
        type: 'speak-choice',
        title: 'Choose a sea path.',
        instruction: '选一条海底路线，看看会遇见谁，再完整说一次。',
        options: core.slice(0, 3).map(([id, text]) => ({ id, text, imageSrc: art(id) })),
        showFrameHint: true,
        frames: ['I swim in the sea.', 'I see a ___.'],
        recordLabel: '录下我的海底发现',
        finishLabel: '完成海底发现之旅'
      }
    ]
  },
  song: {
    kind: 'rhyme',
    title: 'The blue sea',
    audioSrc: audio('chant-whole'),
    imageSrc: art('home'),
    lyrics: chantLyrics
  },
  projectType: 'guided-speech',
  projectTitle: 'Sea discovery path',
  firstCompletionStars: 29
};

for (const [stage, activities] of Object.entries(UNIT6_CONTENT.practiceStages)) {
  for (const activity of activities) {
    activity.stageLabel = UNIT6_CONTENT.steps.find(step => step.id === stage).title;
  }
}
