// Semantic units follow the verified English, not the PDF's illustration-only pages.
const art = id => `./assets/reading/scenes/${id}.png`;
const audio = id => `./assets/reading/audio/${id}.mp3`;
const unit = (id, sourceTextPages, lines, alt, help = []) => Object.freeze({
  id, sourceTextPages, text: lines.join('\n'), imageSrc: art(id), imagePosition: 'center', alt,
  audioSrc: audio(id), help: help.map(([word, meaning]) => ({word, meaning}))
});
const question = (id, text, sourceUnitId, reference, evidence) => Object.freeze({
  id, text, sourceUnitId, reference, evidence, audioSrc: audio(id)
});
const vulturePages = [
  unit('vv-sun-and-warming-air', [63,64], ['The sun is rising.','Up, up.','It heats the air.','Up, up.','Wings stretch wide','to catch a ride','on warming air.','Going where?'],
    'A turkey vulture spreads its wings and rises on sun-warmed air.', [['warming air','太阳使空气变暖；秃鹫借上升的暖空气飞起来。'],['stretch','伸展；这里是把翅膀展开。']]),
  unit('vv-scan-for-food', [67], ['Up, up!','Turkey vultures tilt, soar, scan','to find the food that vultures can . . .','. . . eat!'],
    'A turkey vulture tilts its wings and scans the ground below.', [['tilt','倾斜。'],['soar','翱翔；借气流滑翔。'],['scan','仔细察看；这里是寻找地面的食物。']]),
  unit('vv-living-animals-and-scent', [68,69,70,72], ['That snake over there?','No, no.','That fox over there?','No, no.','That bear over there?','No, no.','Vultures smell the air.','They sniff, search, seek','for foods that . . .','. . . REEK!'],
    'Living snake, fox and bear in separate views; a turkey vulture sniffs the air without hunting them.', [['sniff','用鼻子嗅。'],['seek','寻找。'],['reek','发出很难闻的气味；这里指腐肉的气味。']]),
  unit('vv-which-smell-means-food', [74,75], ['Those fragrant flowers?','No, no.','That spicy smoke?','No, no.','That stinky dead deer?','Yes, yes!'],
    'Three scent sources: flowers, smoke and a dead deer. The deer is food for the vulture.', [['fragrant','芳香的。'],['spicy smoke','这里形容烟有刺激性气味，不是食物辣椒。'],['stinky','发臭的。']]),
  unit('vv-eat-then-clean', [76,78], ['Vultures like a mess.','They land and dine.','Rotten is fine.','They eat, then clean.','Splash! Dry. Preen.'],
    'Sequence: vultures eat carrion, then wash, dry and preen their feathers.', [['dine','进食。'],['rotten','腐烂的；这里是秃鹫的食物。'],['preen','用喙整理羽毛。']]),
  unit('vv-afternoon-search', [81], ['They hop, flap, soar','to look for more.','All afternoon.','But soon . . .'],
    'An afternoon sequence of hopping, flapping and soaring.', [['hop','跳跃。'],['flap','拍动翅膀。']]),
  unit('vv-sunset-and-descent', [82,83], ['. . . the sun starts to sink.','Down, down.','The air starts to cool.','Down, down.','Wings glide, wings ride','through cooling air.','Going where?','Going down, down, down!'],
    'The sun sets and vultures glide down toward their roost.', [['sink','下沉；这里是太阳落下。'],['glide','滑翔。'],['cooling air','正在变冷的空气，与开头的暖空气相对照。']]),
  unit('vv-night-roost', [85], ['The vultures gather in vulture trees,','settle and sleep, like families.','Until . . .'],
    'A group of turkey vultures rests together in a tree at night.', [['gather','聚集。'],['settle','安顿下来。'],['until','直到……；故事接着来到第二天早晨。']]),
  unit('vv-next-morning', [86], ['. . . the morning sun rises.','Up, up.','It heats the air.','Up, up.','Wings stretch wide','to catch a ride','on warming air.','Going where?','Up, up!'],
    'The next morning: vultures spread their wings in rising warm air again.', [['catch a ride','这里指借助暖空气上升，不是乘坐交通工具。']])
];
const snow = unit('snow-whole', [1], ['Little Mouse, with narrow feet','that you keep so white and neat,','when it’s snowing, freezing, blowing,','do you get enough to eat?','','You’re too little, Mouse, to stray','from your house on such a day.','Weren’t you wise to gather scores','of munchy seeds to eat indoors!'],
  'Outside, snow and wind; inside a sheltered burrow, a white-footed mouse eats its stored seeds.',
  [['neat','整洁的。'],['stray','离开原处、走远；这里是离开自己的家。'],['scores','许多、大量；这里不是分数。'],['munchy seeds','可以咀嚼的种子。'],['indoors','在屋内；诗中是小老鼠的家里。']]);
const book = (id,title,genre,author,pages,questions,extra={}) => Object.freeze({
  id,title,genre,author,semantic:true,cover:pages[0].imageSrc,wholeAudioSrc:audio(id==='vulture-view'?'vv-whole':'snow-whole'),
  spreads:Object.freeze(pages.map(p=>Object.freeze({id:`${p.id}-unit`,layout:'single',pages:Object.freeze([p])}))),
  questions:Object.freeze(questions),...extra
});
export const EXTRA_READING_BOOKS = Object.freeze([
  book('vulture-view','Vulture View','Nonfiction','April Pulley Sayre',vulturePages,[
    question('vv-question-1','What is Vulture View about?','vv-scan-for-food',
      'It is about how turkey vultures find food and live through a day.', 'Turkey vultures tilt, soar, scan\nto find the food that vultures can . . .\n. . . eat!'),
    question('vv-question-2','Why didn’t the turkey vulture eat the snake or the fox?','vv-living-animals-and-scent',
      'They are alive. The vulture looks for dead animals to eat.', 'That snake over there?\nNo, no.\nThat fox over there?\nNo, no.\n\nThat stinky dead deer?\nYes, yes!'),
    question('vv-question-3','How can you tell that Vulture View is nonfiction?','vv-sun-and-warming-air',
      'It tells real facts about turkey vultures: how they fly, find food, clean themselves and sleep.', 'Wings stretch wide\nto catch a ride\non warming air.\n\nThey eat, then clean.\nSplash! Dry. Preen.')
  ],{
    introduction:['How do animals survive in nature?','Read about how a very unusual animal gets its food.'],
    originalIllustrator:'Steve Jenkins',
    aboutSections:[
      {heading:'Meet the Author',text:'April Pulley Sayre loves science. She especially likes to come up with creative ways to tell stories about things in nature.'},
      {heading:'Meet the Illustrator',text:'Steve Jenkins loves science, too. When he was growing up, he thought he would be a scientist, but he went to art school instead. Many of the books he illustrates are about animals.'},
      {heading:'Author’s Purpose',text:'April Pulley Sayre wanted to write about what a turkey vulture eats. Draw a picture of another bird eating. Write what the bird eats.'}
    ],
    retell:'Use your own words to retell the main idea and important details in Vulture View.',
    connection:'Think of a wild animal you know. What does it eat and how does it get its food?'
  }),
  book('when-its-snowing','When It’s Snowing','Poetry','Aileen Fisher',[snow],[
    question('snow-question-1','What does the little mouse do to survive?','snow-whole',
      'It gathers many seeds and eats them indoors when the weather is cold and snowy.',
      'Weren’t you wise to gather scores\nof munchy seeds to eat indoors!')
  ],{stanzaAudio:[audio('snow-stanza-1'),audio('snow-stanza-2')]})
]);
