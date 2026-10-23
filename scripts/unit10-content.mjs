import { UNIT2_CONTENT } from './unit2-content.mjs';

const art = id => `./assets/unit10/${id}.png`;
const audio = id => `./assets/unit10/${id}.m4a`;
const ids = ['draw-a-picture', 'read-a-book', 'make-breakfast'];
const labels = {
  'draw-a-picture': 'draw a picture',
  'read-a-book': 'read a book',
  'make-breakfast': 'make breakfast'
};
const phraseArt = { 'draw-a-picture': 'draw', 'read-a-book': 'read', 'make-breakfast': 'breakfast' };
const phrases = ids.map(id => ({
  id, text: labels[id], kind: 'core', imageSrc: art(phraseArt[id]),
  audioSrc: audio(id), modelAudioSrc: audio(`${id}-model`)
}));
// Vocabulary scenes keep Qibao; listening option art deliberately has no person
// because the publisher does not name the second girl's relationship to Shenshen.
const actionOptions = [
  { id: 'breakfast', text: 'make breakfast', imageSrc: art('listen-breakfast') },
  { id: 'draw', text: 'draw a picture', imageSrc: art('listen-draw') },
  { id: 'read', text: 'read a book', imageSrc: art('listen-read') }
];
const panels = [1, 2, 3, 4].map(n => ({ id: `story-${n}`, imageSrc: art(`story-${n}`) }));
const lines = [
  ['hello', 'Interviewer', 'Hello, what makes you special?', 1],
  ['breakfast', 'Girl', 'I can make breakfast for my family!', 1],
  ['really', 'Interviewer', 'Really? Super!', 1],
  ['kung-fu', 'Boy', 'Look at me. I can do kung fu!', 2],
  ['wow', 'Interviewer', 'Wow! Cool!', 2],
  ['dog', 'Girl', 'I can take care of my dog!', 3],
  ['great-girl', 'Interviewer', "You're a great girl!", 3],
  ['everyone', 'Interviewer', 'Everyone is special.', 4]
].map(([id, speaker, text, panel]) => ({
  id: `story-${id}`, speaker, text, imageSrc: art(`story-${panel}`), audioSrc: audio(`story-${id}`)
}));
const abilityOptions = [
  ...phrases.map(item => ({ id: item.id, text: item.text, imageSrc: item.imageSrc })),
  { id: 'my-own-ability', text: 'my own idea', imageSrc: art('home') }
];
const lyrics = [
  'Look at me. Look at me.',
  'I can run. I can jump.',
  'I love drawing pictures.',
  'I love reading books.',
  'This is me. This is me.'
];
const subtitles = {
  words: '画画、阅读、做早餐',
  listening: '听两段对话，找出动作',
  story: "I'm special",
  song: 'Look at me',
  project: '我的自我介绍'
};

export const UNIT10_CONTENT = {
  id: 'unit10', number: 10, title: 'This is me',
  homeClass: 'family-unit-scene unit10-family-scene',
  homeArt: art('home'),
  phrases,
  learnPhraseIds: ids,
  dictationPhraseIds: ids,
  resumeWordsDictation: true,
  wordGroups: [{ title: '我会做的事', ids }],
  phraseQuiz: [
    { id: 'choose-draw-a-picture', targetId: 'draw-a-picture', optionIds: ids },
    { id: 'choose-read-a-book', targetId: 'read-a-book', optionIds: ['read-a-book', 'make-breakfast', 'draw-a-picture'] },
    { id: 'choose-make-breakfast', targetId: 'make-breakfast', optionIds: ['make-breakfast', 'draw-a-picture', 'read-a-book'] }
  ],
  listeningQuiz: [], scenes: [], sentences: [], dialogueGroups: [], transferTasks: [], unlockAfter: {},
  steps: UNIT2_CONTENT.steps.map(step => ({ ...step, subtitle: subtitles[step.id] })),
  textbook: {
    title: UNIT2_CONTENT.textbook.title,
    publisher: UNIT2_CONTENT.textbook.publisher,
    edition: UNIT2_CONTENT.textbook.edition,
    isbn: UNIT2_CONTENT.textbook.isbn,
    unitTitle: 'This is me', verifiedPages: 'Unit 10 pp.63–68', pageRange: '63–68',
    unitHomeVisual: art('home'), familyVisual: art('home'),
    officialTracks: {
      topicWords: ids.map(id => audio(`${id}-model`)),
      listening: [audio('listen-dialogues')],
      song: audio('song'),
      story: lines.map(line => line.audioSrc)
    }
  },
  rewards: { words: 1, listening: 1, sentences: 1, dialogue: 2, transfer: 3, dictation: 2, story: 3, song: 1, project: 3 },
  practiceCompletionRewards: {
    listening: 'dialogues-actions-complete',
    song: 'look-at-me-song-complete',
    project: 'oral-introduction-complete'
  },
  practiceStages: {
    listening: [
      {
        id: 'dialogues-listen', type: 'listen', title: 'Listen to the two talks.',
        instruction: '先把两段对话完整听完，再想想她们说了哪些事。',
        audioSrc: audio('listen-dialogues'), imageSrc: art('listen-breakfast')
      },
      {
        id: 'mum-makes-breakfast', type: 'multi-select', title: 'What is Mum making?',
        instruction: '根据第一段对话，选出妈妈正在做的事。',
        requireAudio: false, showOptionText: true, options: actionOptions,
        answerIds: ['breakfast'], checkLabel: '检查第一段'
      },
      {
        id: 'shenshen-loves', type: 'multi-select', title: 'What does Shenshen love?',
        instruction: '根据第二段对话，选出深深说自己喜欢做的全部事情。',
        requireAudio: false, showOptionText: true, options: actionOptions,
        answerIds: ['draw', 'read'], checkLabel: '检查第二段', finishLabel: '完成听力挑战'
      }
    ],
    story: [
      {
        id: 'special-story-listen', type: 'listen', title: "I'm special",
        instruction: '先完整听四格故事，看看每个人会做什么。',
        audioSrc: audio('story-whole'), gallery: panels
      },
      {
        id: 'special-abilities', type: 'multi-select', title: 'What can they do?',
        instruction: '选出故事里三位受访者说出的全部英文能力。',
        requireAudio: false, showOptionText: true,
        options: [
          { id: 'breakfast', text: 'make breakfast', imageSrc: art('story-1') },
          { id: 'kung-fu', text: 'do kung fu', imageSrc: art('story-2') },
          { id: 'dog', text: 'take care of my dog', imageSrc: art('story-3') },
          { id: 'read', text: 'read a book', imageSrc: art('listen-read') }
        ],
        answerIds: ['breakfast', 'kung-fu', 'dog'], checkLabel: '检查三种能力'
      },
      ...lines.map(line => ({
        ...line, type: 'repeat', title: line.text,
        instruction: '先听这一句，再录下自己的跟读。',
        rewardStage: 'sentences', recordLabel: '跟读录音'
      })),
      {
        id: 'special-story-whole', type: 'repeat', title: 'Tell the whole story.',
        instruction: '看四幅连续图片，完整跟读一次故事。',
        audioSrc: audio('story-whole'), transcript: lines, gallery: panels,
        rewardStage: 'dialogue', recordLabel: '录下完整故事'
      },
      {
        id: 'special-your-turn', type: 'role-play', title: 'Your turn!',
        instruction: '听麒宝采访，再用自己真实会做的事回答。',
        options: [{
          id: 'yourself', text: 'yourself', imageSrc: art('story-4'),
          promptAudioSrc: audio('story-hello'), replyText: 'I can ...'
        }],
        rewardStage: 'transfer', recordLabel: '录下我的回答', finishLabel: '完成故事听说'
      }
    ],
    song: [
      {
        id: 'look-at-me-song', type: 'repeat', title: 'Look at me',
        instruction: '先完整听两轮歌曲，再录下自己的完整演唱。',
        audioSrc: audio('song'), lyrics, imageSrc: art('home'),
        recordLabel: '录下完整歌曲'
      },
      {
        id: 'look-at-me-my-turn', type: 'speak-choice', title: 'Look at me.',
        instruction: '想一件自己真实会做的事，用一句英语说出来。',
        options: abilityOptions, frames: ['Look at me. I can ...'],
        showFrameHint: true, rewardStage: 'transfer',
        recordLabel: '录下我的一句话', finishLabel: '完成歌谣唱读'
      }
    ],
    project: [{
      id: 'my-oral-introduction', type: 'scene-log', title: 'My introduction',
      instruction: '想好名字或昵称和一件自己会做的事，录一段完整的口头自我介绍。',
      selectionLabel: 'Choose an idea, or use your own.',
      previewLabel: 'My introduction', previewClass: 'sense-selection-preview',
      emptyText: '先选一张提示图。你也可以说自己的其他本领。',
      minSelections: 1, maxSelections: 1, options: abilityOptions,
      frames: ['My name is ...', 'I can ...', 'I am ... (optional)'],
      recordLabel: '录下我的自我介绍', finishLabel: '完成小小实践'
    }]
  },
  song: { kind: 'song', title: 'Look at me', audioSrc: audio('song'), imageSrc: art('home'), lyrics },
  projectType: 'guided-speech', projectTitle: 'My introduction', firstCompletionStars: 30
};

for (const [stage, activities] of Object.entries(UNIT10_CONTENT.practiceStages)) {
  for (const activity of activities) {
    activity.stageLabel = UNIT10_CONTENT.steps.find(step => step.id === stage).title;
  }
}
