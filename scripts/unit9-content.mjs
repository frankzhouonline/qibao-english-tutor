import { UNIT2_CONTENT } from './unit2-content.mjs';

const art = id => `./assets/unit9/${id}.png`;
const audio = id => `./assets/unit9/${id}.m4a`;
const fruitArt = id => `./assets/unit8/${id}.png`;
const coreIds = ['hear', 'see', 'smell', 'taste', 'touch'];
const phrases = coreIds.map(id => ({
  id, text: id, kind: 'core', imageSrc: art(id),
  audioSrc: audio(id), modelAudioSrc: audio(`${id}-model`)
}));
const senses = Object.fromEntries(phrases.map(item => [item.id, item]));
const storyLines = [
  ['whats-falling', 'Little Frog', "What's falling, Mummy?", 'story-1'],
  ['raindrops', 'Mummy Frog', 'Raindrops!', 'story-1'],
  ['see-raindrops', 'Little Frog', 'Oh, I see raindrops.', 'story-1'],
  ['touch-them', 'Little Frog', 'And I touch them.', 'story-1'],
  ['what-hear', 'Mummy Frog', 'What do you hear, dear?', 'story-2'],
  ['pitter-patter', 'Little Frog', 'Pitter-patter! Pitter-patter!', 'story-2'],
  ['hear-raindrops', 'Little Frog', 'I hear raindrops.', 'story-2'],
  ['what-smell', 'Mummy Frog', 'What do you smell here?', 'story-3'],
  ['smell-grass', 'Little Frog', 'Mmm ... I smell grass in the rain.', 'story-3'],
  ['how-nice', 'Little Frog', 'How nice!', 'story-3'],
  ['rainy-days', 'Little Frog', 'La! La! La! I like rainy days.', 'story-4']
].map(([id, speaker, text, scene]) => ({
  id: `story-${id}`, speaker, text, imageSrc: art(scene), audioSrc: audio(`story-${id}`)
}));
const panels = [1, 2, 3, 4].map(number => ({ id: `story-${number}`, imageSrc: art(`story-${number}`) }));
const lyrics = [
  'I smell the flowers',
  'Under the trees.',
  'I taste the fruit',
  'In the breeze.',
  'I touch the grass,',
  'Soft and green.',
  'I see the lake,',
  'Blue and clean.',
  'I hear the birds',
  'Singing around.',
  'What a wonderful world!'
];
const subtitles = {
  words: '认识五种感官',
  listening: '完整听音，给图片编号',
  story: 'Fun in the rain',
  song: 'In the park',
  project: '水果五感介绍'
};

export const UNIT9_CONTENT = {
  id: 'unit9',
  number: 9,
  title: 'The five senses',
  homeClass: 'family-unit-scene unit9-family-scene',
  homeArt: art('home'),
  phrases,
  learnPhraseIds: coreIds,
  dictationPhraseIds: coreIds,
  resumeWordsDictation: true,
  wordGroups: [
    { title: '听、看、闻', ids: ['hear', 'see', 'smell'] },
    { title: '尝、摸', ids: ['taste', 'touch'] }
  ],
  phraseQuiz: [
    { id: 'choose-hear', targetId: 'hear', optionIds: ['hear', 'see', 'smell'] },
    { id: 'choose-see', targetId: 'see', optionIds: ['touch', 'see', 'taste'] },
    { id: 'choose-smell', targetId: 'smell', optionIds: ['taste', 'smell', 'hear'] },
    { id: 'choose-taste', targetId: 'taste', optionIds: ['see', 'touch', 'taste'] },
    { id: 'choose-touch', targetId: 'touch', optionIds: ['smell', 'touch', 'taste'] }
  ],
  listeningQuiz: [],
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
    unitTitle: 'The five senses',
    verifiedPages: 'Unit 9 pp.57–62',
    pageRange: '57–62',
    unitHomeVisual: art('home'),
    familyVisual: art('home'),
    officialTracks: {
      topicWords: coreIds.map(id => audio(`${id}-model`)),
      listening: [audio('listen-senses-order')],
      song: audio('rhyme'),
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
    listening: 'senses-order-complete',
    song: 'park-rhyme-complete',
    project: 'fruit-senses-complete'
  },
  practiceStages: {
    listening: [{
      id: 'senses-listen-and-number',
      type: 'order',
      title: 'Listen and number.',
      instruction: '先完整听一遍，再按听到的先后顺序点图。小猫这一幅已经是第 1 幅。',
      audioSrc: audio('listen-senses-order'),
      playLabel: '完整听一遍',
      requireAudio: true,
      options: [
        { id: 'touch-grass', imageSrc: art('touch') },
        { id: 'hear-cat', imageSrc: art('listen-cat') },
        { id: 'taste-apple', imageSrc: art('taste') },
        { id: 'see-sky', imageSrc: art('see') },
        { id: 'smell-flowers', imageSrc: art('smell') }
      ],
      givenOrderIds: ['hear-cat'],
      answerIds: ['hear-cat', 'see-sky', 'smell-flowers', 'taste-apple', 'touch-grass'],
      checkLabel: '检查五幅图的顺序',
      finishLabel: '完成听力挑战'
    }],
    story: [
      {
        id: 'rain-story-listen',
        type: 'listen',
        title: 'Fun in the rain',
        instruction: '先完整听故事，看看青蛙妈妈和小青蛙在雨天发现了什么。',
        audioSrc: audio('story-whole'),
        gallery: panels
      },
      {
        id: 'raindrops-senses',
        type: 'multi-select',
        title: 'What can Little Frog do with raindrops?',
        instruction: '选出故事里小青蛙对雨滴用到的全部英文感官词。',
        imageSrc: art('story-1'),
        requireAudio: false,
        showOptionText: true,
        options: ['see', 'taste', 'hear', 'touch'].map(id => senses[id]),
        answerIds: ['see', 'hear', 'touch'],
        checkLabel: '检查雨滴感官'
      },
      {
        id: 'grass-sense',
        type: 'multi-select',
        title: 'What can Little Frog do with grass?',
        instruction: '根据故事，选出和雨后青草对应的英文感官词。',
        imageSrc: art('story-3'),
        requireAudio: false,
        showOptionText: true,
        options: ['taste', 'touch', 'smell', 'see'].map(id => senses[id]),
        answerIds: ['smell'],
        checkLabel: '检查青草感官'
      },
      ...storyLines.map(line => ({
        ...line,
        type: 'repeat',
        title: line.text,
        instruction: '先听这一句，再录下自己的跟读。',
        rewardStage: 'sentences',
        recordLabel: '跟读录音'
      })),
      {
        id: 'rain-story-whole',
        type: 'repeat',
        title: 'Tell the whole story.',
        instruction: '看四幅连续故事图，完整跟读一次。',
        audioSrc: audio('story-whole'),
        transcript: storyLines,
        gallery: panels,
        rewardStage: 'dialogue',
        recordLabel: '录下完整故事'
      },
      {
        id: 'little-frog-try',
        type: 'scene-log',
        title: "Little Frog's turn",
        instruction: '当一回小青蛙，选一个感官与池塘里的事物，用自己的英语说一句。',
        selectionLabel: 'Choose one sense and thing.',
        previewLabel: 'My frog idea',
        previewClass: 'sense-selection-preview',
        emptyText: '选择一件小青蛙能感受到的事物。',
        minSelections: 1,
        maxSelections: 1,
        options: [
          { id: 'see-raindrops', text: 'see · raindrops', imageSrc: art('story-1') },
          { id: 'hear-raindrops', text: 'hear · raindrops', imageSrc: art('story-2') },
          { id: 'smell-grass', text: 'smell · grass', imageSrc: art('story-3') },
          { id: 'touch-raindrops', text: 'touch · raindrops', imageSrc: art('story-1') }
        ],
        frames: ['I see / taste / hear / smell / touch ...'],
        rewardStage: 'transfer',
        recordLabel: '录下小青蛙的回答',
        finishLabel: '完成故事听说'
      }
    ],
    song: [
      {
        id: 'park-rhyme-whole',
        type: 'repeat',
        title: 'In the park',
        instruction: '先完整听歌谣，再按节奏完整读一遍。',
        audioSrc: audio('rhyme'),
        lyrics,
        imageSrc: art('home'),
        recordLabel: '录下完整歌谣'
      },
      {
        id: 'hear-an-animal',
        type: 'speak-choice',
        title: 'What do you hear?',
        instruction: '选择一种声音来源，说出自己听到了什么。',
        options: [
          { id: 'dog', text: 'a dog', imageSrc: art('dog') },
          { id: 'cat', text: 'a cat', imageSrc: art('listen-cat') },
          { id: 'birds', text: 'birds', imageSrc: art('hear') }
        ],
        frames: ['I hear ___.'],
        showFrameHint: true,
        rewardStage: 'transfer',
        recordLabel: '录下我的声音发现',
        finishLabel: '完成歌谣唱读'
      }
    ],
    project: [{
      id: 'fruit-senses-show-and-tell',
      type: 'scene-log',
      title: 'My fruit senses',
      instruction: '先选一种水果，再选至少两种感官，最后完整介绍给大家听。',
      selectionLabel: 'Choose your senses.',
      secondaryLabel: 'Choose one fruit.',
      secondaryFirst: true,
      secondaryPreviewPrefix: 'My fruit: ',
      previewLabel: 'My fruit senses',
      previewClass: 'sense-selection-preview',
      emptyText: '选好感官后，这里会出现你的五感发现。',
      minSelections: 2,
      maxSelections: 5,
      options: phrases,
      secondaryOptions: ['apple', 'pear', 'banana', 'grape', 'orange'].map(id => ({
        id, text: id, imageSrc: fruitArt(id)
      })),
      frames: ['I see ___. It’s / They’re ___.', 'I touch ___. It’s / They’re ___.', 'I smell / taste ___.'],
      recordLabel: '录下我的水果介绍',
      finishLabel: '完成小小实践'
    }]
  },
  song: { kind: 'rhyme', title: 'In the park', audioSrc: audio('rhyme'), imageSrc: art('home'), lyrics },
  projectType: 'guided-speech',
  projectTitle: 'My fruit senses',
  firstCompletionStars: 39
};

for (const [stage, activities] of Object.entries(UNIT9_CONTENT.practiceStages)) {
  for (const activity of activities) {
    activity.stageLabel = UNIT9_CONTENT.steps.find(step => step.id === stage).title;
  }
}
