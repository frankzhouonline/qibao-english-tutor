import { UP2_READINGS } from './up2-readings.mjs';
// Printed Unit Packet 2 (pp. 1–21). p12, p26 and p30 are intentionally excluded.
// Audio filenames are frozen only after the source/word audit; IDs are stable progress keys.
const root = "./assets/audio/official/up2";
const audio = (name) => `${root}/${name}.mp3`;
const page = (number) => `./assets/up2/pages/p${number}.jpg`;
const item = (id, text, meaning, level, index, fallback = "") => ({
  id, text: text.split(' / ')[0], sourceText:text, pastForm:text.split(' / ')[1] || '', meaning:meaning.split('；过去式')[0], level,
  audioSrc: audio(text.includes(' / ') ? `base-${text.split(' / ')[0]}` : fallback ? `tts-${fallback}` : `${level === 4 ? "core" : "recognition"}-item-${String(index).padStart(2, "0")}`),
  audioKind: fallback ? "offline-voice" : "official",
  page: level === 4 ? index <= 9 ? 3 : index <= 21 ? 4 : 5 : index <= 12 ? 5 : 6
});

export const UP2_VOCAB = [
  item("animal", "animal", "动物", 4, 1), item("tail", "tail", "尾巴", 4, 2),
  item("beaver", "beaver", "海狸", 4, 3), item("quite", "quite", "相当", 4, 4),
  item("be-proud-of", "be proud of", "为……自豪", 4, 5), item("spend-spent", "spend / spent", "花费；过去式 spent", 4, 6),
  item("thick", "thick", "厚的", 4, 7), item("splendid", "splendid", "极好的", 4, 8),
  item("brag-bragged", "brag / bragged", "夸耀；过去式 bragged", 4, 9),
  item("april", "April", "四月", 4, 10), item("chop-chopped", "chop / chopped", "砍；过去式 chopped", 4, 11),
  item("eight", "eight", "八", 4, 12, "eight"), item("sway-swayed", "sway / swayed", "摇摆", 4, 13),
  item("tug-tugged", "tug / tugged", "用力拉", 4, 14), item("gasp-gasped", "gasp / gasped", "喘气、倒吸气", 4, 15),
  item("flat", "flat", "扁平的", 4, 16, "flat"), item("wail-wailed", "wail / wailed", "哭喊", 4, 17),
  item("about", "about", "关于", 4, 18, "about"), item("special", "special", "特别的", 4, 19),
  item("our", "our", "我们的", 4, 20), item("give-gave", "give / gave", "给；过去式 gave", 4, 21),
  item("carry", "carry", "搬、带、载", 4, 22, "carry"),
  item("agent", "agent", "代理人", 3, 1), item("basic", "basic", "基本的", 3, 2),
  item("pay-paid", "pay / paid", "付钱", 3, 3), item("stain-stained", "stain / stained", "染上污渍", 3, 4),
  item("train", "train", "火车", 3, 5), item("mail", "mail", "邮件", 3, 6),
  item("rain", "rain", "雨", 3, 7), item("explain-explained", "explain / explained", "解释", 3, 8),
  item("may", "may", "可能", 3, 9, "may"), item("play", "play", "玩耍", 3, 10, "play"),
  item("clay", "clay", "黏土", 3, 11), item("stay", "stay", "停留", 3, 12, "stay"),
  item("signal", "signal", "信号", 3, 13), item("slap", "slap", "拍打", 3, 14, "slap"),
  item("pal", "pal", "伙伴", 3, 15)
];
export const UP2_VOCAB_BY_ID = new Map(UP2_VOCAB.map((entry) => [entry.id, entry]));

const vocab = (ids, title) => ids.reduce((groups, id, index) => {
  if (index % 4 === 0) groups.push({ type: "vocab", id: `${title}-${groups.length + 1}`, title, ids: [] });
  groups.at(-1).ids.push(id);
  return groups;
}, []);
const choice = (id, prompt, options, answer, sourcePage, audioSrc = "") => ({ type: "choice", id, prompt, options, answer, sourcePage, audioSrc });
const story = (id, title, text, sourcePage, audioSrc) => ({ type: "story", id, title, text, sourcePage, audioSrc });
const multi = (id, prompt, options, answers, sourcePage) => ({ type: "multi", id, prompt, options, answers, sourcePage });
const speak = (id, title, prompt, keywords, sourcePage, example = "") => ({ type: "speak", id, title, prompt, keywords, sourcePage, example });

export const UP2_PHONICS_WORDS = ["may", "play", "days", "paid", "stained", "trains", "clay", "mail", "staying", "April", "agent", "basic"].map((text, index) => ({ text, audioSrc: audio(`phonics-word-item-${String(index + 1).padStart(2, "0")}`) }));
export const UP2_PHONICS_PAIRS = [
  { id: "mail-man", prompt: "听词，选出听到的拼写", answer: "mail", options: ["mail", "man"], audioSrc: audio("tts-mail") },
  { id: "ham-hay", prompt: "听词，选出听到的拼写", answer: "hay", options: ["ham", "hay"], audioSrc: audio("tts-hay") },
  { id: "snail-sad", prompt: "听词，选出听到的拼写", answer: "snail", options: ["snail", "sad"], audioSrc: audio("tts-snail") },
  { id: "crayon-crab", prompt: "听词，选出听到的拼写", answer: "crayon", options: ["crayon", "crab"], audioSrc: audio("tts-crayon") }
];

const kayText = "It is a rainy day. Kay waits for mail. The mailman! Kay gets crayons, paints, and clay! With paints and crayons, Kay makes a rail. With gray clay, Kay makes a gray train. A gray train on the rail! A happy rainy day!";
const snailText = "A crayon, some clay. The children play. This is the gray snail. He waits all day. The rain is wet. Where is the train? Here is the tray! The snail has mail! What a long day!";

export const UP2_CHAPTERS = [
  { id: "room", title: "房间小能手", subtitle: "课本与 UP 的小桥梁", nodeIds: ["room-place", "room-tell"], imagePage: 6 },
  { id: "rain", title: "雨天的发现", subtitle: "长 a 拼读与两篇故事", nodeIds: ["rain-sounds", "rain-kay", "rain-snail"], imagePage: 8 },
  { id: "tail", title: "尾巴的秘密", subtitle: "动物本领与 Ray 的故事", nodeIds: ["tail-question", "tail-proud", "tail-tree", "tail-flat", "tail-help"], imagePage: 13 }
];

const legacyNodes = [
  { id: "room-place", chapterId: "room", title: "东西放哪里", reward: 2, sourcePages: [6], activities: [
    choice("room-books", "Put the books ...", ["on the shelf", "under the bed", "in the box"], "on the shelf", 6, "./assets/audio/official/unit2/line-put-books-on-shelf.mp3"),
    choice("room-toys", "What about the toys?", ["in the box", "on the shelf", "under the bed"], "in the box", 6, "./assets/audio/official/unit2/line-ok-what-about-toys-in-box.mp3"),
    choice("room-box", "Where should the box go?", ["under the bed", "on the desk", "in the box"], "under the bed", 6, "./assets/audio/official/unit2/line-oh-no-put-it-under-bed.mp3")
  ] },
  { id: "room-tell", chapterId: "room", title: "一起整理吧", reward: 2, sourcePages: [6], activities: [
    story("room-tidy-line", "先听妈妈怎么说", "Let's tidy the room together.", 6, "./assets/audio/official/unit2/line-lets-tidy-room-together.mp3"),
    speak("room-my-turn", "我来安排", "看着房间图，告诉麒宝物品放哪里，再礼貌回应妈妈。", ["books", "toys", "shelf", "box", "together"], 6, "Put the books on the shelf. Put the toys in the box. Let's tidy the room together.")
  ] },
  { id: "rain-sounds", chapterId: "rain", title: "长 a 的声音", reward: 2, sourcePages: [7], activities: [
    ...vocab(["agent", "basic", "pay-paid", "stain-stained", "train", "mail", "rain"], "雨天词语"),
    { type: "phonics", id: "long-a-words-1", title: "a · ai · ay · 第一组", words: UP2_PHONICS_WORDS.slice(0, 4), sourcePage: 7 },
    { type: "phonics", id: "long-a-words-2", title: "a · ai · ay · 第二组", words: UP2_PHONICS_WORDS.slice(4, 8), sourcePage: 7 },
    { type: "phonics", id: "long-a-words-3", title: "a · ai · ay · 第三组", words: UP2_PHONICS_WORDS.slice(8, 12), sourcePage: 7 },
    story("long-a-sentence-1", "读第一句", "Will David stay inside if it rains?", 7, audio("phonics-sentence-item-01")),
    story("long-a-sentence-2", "读第二句", "David and Ray may play with trains.", 7, audio("phonics-sentence-item-02")),
    ...UP2_PHONICS_PAIRS.map(({ id, prompt, options, answer, audioSrc }) => choice(`phonics-${id}`, prompt, options, answer, 7, audioSrc))
  ] },
  { id: "rain-kay", chapterId: "rain", title: "Kay 的雨天", reward: 3, sourcePages: [8, 9], activities: [
    ...vocab(["explain-explained", "may", "play", "clay", "stay"], "故事里的词"),
    story("kay-story", "Kay 等邮件", kayText, 8, audio("story-kay")),
    multi("kay-find", "在故事中找出这三个词", ["gets", "makes", "with", "tail", "box"], ["gets", "makes", "with"], 8),
    choice("kay-q1", "Kay waits for ___ .", ["tail", "mail"], "mail", 9),
    choice("kay-q2", "Kay gets crayons, paints, and ___ .", ["clay", "snail"], "clay", 9),
    choice("kay-q3", "With paints and ___, Kay makes a rail.", ["crayons", "trains"], "crayons", 9),
    choice("kay-q4", "With gray clay, Kay makes a ___ train.", ["gray", "spray"], "gray", 9),
    choice("kay-q5", "A gray ___ on the rail!", ["rain", "train"], "train", 9),
    choice("kay-q6", "It is a rainy day.", ["YES", "NO"], "YES", 9),
    choice("kay-q7", "Kay waits for a train.", ["YES", "NO"], "NO", 9)
  ] },
  { id: "rain-snail", chapterId: "rain", title: "蜗牛的一天", reward: 3, sourcePages: [10, 11], activities: [
    story("snail-story", "What a Long Day!", snailText, 10, audio("story-long-day")),
    choice("snail-q1", "This is the gray ___ .", ["rain", "snail"], "snail", 11),
    choice("snail-q2", "Here is the ___ !", ["tray", "crayon"], "tray", 11),
    choice("snail-match-1", "The children play. 选对应画面", ["a · 蜗牛等候", "b · 孩子玩耍", "c · 想起火车", "d · 收到邮件"], "b · 孩子玩耍", 11),
    choice("snail-match-2", "This is the gray snail. 选对应画面", ["a · 蜗牛等候", "b · 孩子玩耍", "c · 想起火车", "d · 收到邮件"], "a · 蜗牛等候", 11),
    choice("snail-match-3", "Where is the train? 选对应画面", ["a · 蜗牛等候", "b · 孩子玩耍", "c · 想起火车", "d · 收到邮件"], "c · 想起火车", 11),
    choice("snail-match-4", "The snail has mail! 选对应画面", ["a · 蜗牛等候", "b · 孩子玩耍", "c · 想起火车", "d · 收到邮件"], "d · 收到邮件", 11)
  ] },
  { id: "tail-question", chapterId: "tail", title: "动物的本领", reward: 2, sourcePages: [2, 13], activities: [
    choice("animal-elephant", "大象用什么取食、喝水？", ["鼻子", "龟壳", "长脖子"], "鼻子", 2, audio("animal-item-01")),
    choice("animal-turtle", "乌龟用什么保护自己？", ["鼻子", "龟壳", "长脖子"], "龟壳", 2, audio("animal-item-02")),
    choice("animal-giraffe", "长颈鹿用什么吃树叶？", ["鼻子", "龟壳", "长脖子"], "长脖子", 2, audio("animal-item-03")),
    ...vocab(["animal", "tail", "beaver", "quite"], "认识 Ray"),
    choice("folktale", "A Tale of a Tail 是什么类型的故事？", ["民间故事", "科学实验记录"], "民间故事", 13),
    multi("long-a-tail", "找出长 a 的词", ["tail", "Ray", "day", "April", "swayed", "way", "wailed", "explained", "beaver", "special"], ["tail", "Ray", "day", "April", "swayed", "way", "wailed", "explained"], 13)
  ] },
  { id: "tail-proud", chapterId: "tail", title: "Ray 的大尾巴", reward: 3, sourcePages: [14, 15], activities: [
    ...vocab(["be-proud-of", "spend-spent", "thick", "splendid", "brag-bragged"], "骄傲的尾巴"),
    story("ray-p14", "Ray 和尾巴", "Long ago, there lived a beaver named Ray. Ray was quite proud of his nice, thick tail. He spent a lot of time brushing and fluffing it.", 14, audio("story-p14")),
    story("ray-p15", "Ray 怎么说", "I have a splendid tail, Ray bragged. It is the best tail that an animal can have.", 15, audio("story-p15")),
    choice("ray-proud-why", "Ray 为什么花很多时间整理尾巴？", ["他为尾巴自豪", "他想把尾巴藏起来"], "他为尾巴自豪", 15)
  ] },
  { id: "tail-tree", chapterId: "tail", title: "树倒下了", reward: 3, sourcePages: [16, 17], activities: [
    ...vocab(["april", "chop-chopped", "eight", "sway-swayed", "tug-tugged", "gasp-gasped"], "树下的动作"),
    story("ray-p16", "砍树", "One fine day in April, Ray went out. It is a nice day to chop wood, he said, so Ray got his axe. He chopped, chopped, chopped a big tree eight times.", 16, audio("story-p16")),
    story("ray-p17", "树压住尾巴", "The big tree swayed this way and that, then it fell on top of Ray's tail. Ray tugged and tugged at his tail. He gasped when he pulled it out.", 17, audio("story-p17")),
    choice("ray-cause", "尾巴为什么变了样？", ["大树压住了尾巴", "Ray 把尾巴染了色"], "大树压住了尾巴", 17)
  ] },
  { id: "tail-flat", chapterId: "tail", title: "扁尾巴的新本领", reward: 3, sourcePages: [18, 19], activities: [
    ...vocab(["flat", "wail-wailed", "about", "special"], "新尾巴"),
    story("ray-p18", "Ray 很伤心", "My tail is flat, Ray wailed. The sun looked down at him. She could tell that Ray felt bad about his tail.", 18, audio("story-p18")),
    story("ray-p19", "太阳的解释", "A flat tail will help you swim fast, the sun explained. A flat tail can send a signal too. Just slap it on the water. That made Ray happy.", 19, audio("story-p19")),
    choice("ray-flat-use", "扁尾巴能帮助 Ray 做什么？", ["游得快并传信号", "像鸟一样飞"], "游得快并传信号", 19)
  ] },
  { id: "tail-help", chapterId: "tail", title: "特别的帮助", reward: 3, sourcePages: [20, 21], activities: [
    ...vocab(["our", "give-gave", "carry"], "帮助朋友"),
    ...vocab(["signal", "slap", "pal"], "伙伴与信号"),
    story("ray-p20", "呼唤伙伴", "I have a special tail, yelled Ray. Then Ray slapped his tail on the water. Slap, slap, slap. His pals came running. Do you want our help? they asked.", 20, audio("story-p20")),
    story("ray-p21", "带伙伴过河", "I want to give you a ride, said Ray. Hop on my tail. I will carry you across the lake. And happy Ray swam off as fast as a fish.", 21, audio("story-p21")),
    speak("ray-final-expression", "Ray 的新尾巴", "看图，用自己的话说：Ray 的新尾巴怎样帮助他和伙伴？", ["flat tail", "swim", "signal", "carry friends"], 21, "Ray's flat tail helps him swim fast, send a signal and carry his friends across the lake.")
  ] }
];

// Keep only the old ID order as the explicit index-to-ID migration contract.
export const UP2_LEGACY_ORDER = Object.fromEntries(legacyNodes.map(n => [n.id, n.activities.map(a => a.id)]));
export const UP2_CONTENT_REVISION = 3;
// Retire extra story-word drills without discarding their old recordings/evidence.
// Word time remains restricted to the textbook's 22 four-skill / 15 three-skill entries.
export const UP2_RETIRED_ACTIVITY_NEXT = Object.freeze({
  'kay-words-1':'kay-q1-write', 'kay-words-2':'kay-q1-write', 'kay-words-3':'kay-q1-write',
  'snail-words-1':'snail-q1', 'snail-words-2':'snail-q1', 'snail-words-3':'snail-q1',
  'snail-words-4':'snail-q1', 'snail-words-5':'snail-q1',
  'phonics-mail-man':'long-a-sentence-2', 'phonics-ham-hay':'long-a-sentence-2',
  'phonics-snail-sad':'long-a-sentence-2', 'phonics-crayon-crab':'long-a-sentence-2'
});
const art = (sheet, panel, alt) => ({ src: `./assets/up2/${sheet}.png`, panel, columns: sheet === 'animals' ? 3 : 2, rows: sheet === 'animals' ? 1 : 2, alt });
const roomArt = (name, alt) => ({ src: `./assets/${name}.png`, alt });
export const UP2_ART = {
  room: roomArt('20260910_Unit2整理书和玩具_v01', 'Qibao and Mum tidy the room'),
  desk: roomArt('20260911_Unit2词组_书在桌上_v01', 'Books on the desk'),
  boxDesk: roomArt('20260910_Unit2箱子放桌上_v01', 'Qibao puts the box on the desk'),
  box: roomArt('20260911_Unit2词组_玩具在箱里_v01', 'Toys in the box'),
  bed: roomArt('20260911_Unit2听力_箱子在床下_v01', 'The box under the bed'),
  shelf: roomArt('20260911_Unit2实践_书在书架上_v01', 'Books on the shelf'),
  kay: [0,1,2,3].map((i) => art('kay', i, ['Kay waits for mail on a rainy day','Kay receives crayons, paints and clay','Kay draws a rail','Kay makes a gray clay train'][i])),
  snail: [0,1,2,3].map((i) => art('snail', i, ['The children play','The gray snail waits','The snail wonders where the train is','The snail receives mail on a tray'][i])),
  ray: [0,1,2,3,4,5,6,7].map((i) => art(i < 4 ? 'ray-a' : 'ray-b', i % 4, ['Ray brushes his thick tail','Ray is proud of his tail','Ray chops a tree','A tree falls on Ray’s tail','Ray looks at his flat tail','Ray slaps his tail on water','His pals come to help','Ray carries his friends across the lake'][i])),
  animals: [0,1,2].map((i) => art('animals', i, ['An elephant uses its trunk','A turtle has a protective shell','A giraffe reaches leaves with its long neck'][i]))
};
UP2_CHAPTERS.forEach((c,i) => { c.art = [UP2_ART.room, UP2_ART.kay[0], UP2_ART.ray[7]][i]; c.subtitle = ['My room','Phonics & stories','A Tale of a Tail'][i]; });
const reading = (id, title, page, scene, supportIds = []) => ({ type:'reading', id, title, sourcePage:page, lines:UP2_READINGS[id], art:scene, supportIds });
const readStory = (a, scene, ids) => ({...reading(a.id, 'Listen and repeat.', a.sourcePage, scene, ids),audioSrc:a.audioSrc,
  ...(UP2_READINGS[a.id].length>1 ? {paragraph:{id:`${a.id}-paragraph`,text:UP2_READINGS[a.id].map(l=>l.text).join(' '),lines:UP2_READINGS[a.id]}} : {})});
const find = (id, sections, targets, sourcePage, scene) => ({ type:'find', id, title:'Find and circle.', text:sections.map(s=>s.text).join(' '), sections, targets, sourcePage, art:scene });
const roomLines = UP2_READINGS['room-sentences'];
const old = (id) => legacyNodes.find(n => n.id === id);
export const UP2_NODES = legacyNodes.map(n => ({ ...n, supportIds:n.activities.filter(a => a.type === 'vocab').flatMap(a => a.ids), activities:[] }));
const set = (id, activities) => { UP2_NODES.find(n=>n.id===id).activities = activities; };
set('room-place', [
  {type:'reading',id:'room-sentences-a',title:'Listen and repeat.',sourcePage:6,lines:roomLines.slice(0,3),art:UP2_ART.desk},
  ...old('room-place').activities.map(a=>({...a,title:'Listen and choose.',prompt:'Listen and choose.',art:null}))
]);
set('room-tell', [
  {type:'reading',id:'room-sentences-b',title:'Listen and repeat.',sourcePage:6,lines:roomLines.slice(3),art:UP2_ART.room},
  {...old('room-tell').activities[1], id:'room-my-turn-v2',title:'My turn!',prompt:'Where will you put the books and toys?',art:UP2_ART.room}
]);
set('rain-sounds', [
  {type:'notice',id:'long-a-discover',title:'a · ai · ay',text:'The letters a, ai and ay make the long a sound in apron, paint and gray.',sourcePage:7},
  ...old('rain-sounds').activities.filter(a=>['phonics','story'].includes(a.type)).map(a=>a.type === 'story' ? readStory(a,UP2_ART.kay[0],['stay','may','play','rain']) : {...a,title:'Listen and read.',purpose:'sound-pattern'})
]);
const kay = old('rain-kay').activities.find(a=>a.type==='story');
set('rain-kay', [
  readStory(kay,UP2_ART.kay[0],['mail','rain','clay']),
  find('kay-find-in-story',[
    {text:UP2_READINGS['kay-story'].slice(0,4).map(l=>l.text).join(' '),art:UP2_ART.kay[1]},
    {text:UP2_READINGS['kay-story'].slice(4).map(l=>l.text).join(' '),art:UP2_ART.kay[3]}
  ],['gets','makes','with'],8,UP2_ART.kay[3]),
  ...old('rain-kay').activities.filter(a=>a.type==='choice').map((a,i)=>({...a,id:i<5?`${a.id}-write`:a.id,type:i<5?'write-choice':'choice',title:i<5?'Read, choose and write.':'YES or NO?',art:UP2_ART.kay[[0,1,2,3,3,0,0][i]]}))
]);
const snail = old('rain-snail').activities.find(a=>a.type==='story');
const pictureOptions = [{value:'a',art:UP2_ART.snail[1]},{value:'b',art:UP2_ART.snail[0]},{value:'c',art:UP2_ART.snail[3]},{value:'d',art:UP2_ART.snail[2]}];
set('rain-snail', [
  readStory(snail,UP2_ART.snail[0],['train','play','mail','clay']),
  ...old('rain-snail').activities.filter(a=>a.id==='snail-q1'||a.id==='snail-q2').map((a,i)=>({...a,title:'Look and circle.',art:UP2_ART.snail[i?3:1]})),
  ...['The children play.','This is the gray snail.','Where is the train?','The snail has mail!'].map((prompt,i)=>({type:'picture-choice',id:`snail-match-picture-${i+1}`,title:'Read and match.',prompt,options:pictureOptions,answer:['b','a','d','c'][i],sourcePage:11}))
]);
set('tail-question', [
  ...old('tail-question').activities.filter(a=>a.id.startsWith('animal-')).map((a,i)=>({...a,id:`${a.id}-listen-v2`,type:'picture-choice',title:'Listen and choose.',prompt:'Which animal do you hear?',options:UP2_ART.animals.map((art,j)=>({value:String(j),art})),answer:String(i)})),
  {type:'notice',id:'folktale-read',title:'A Tale of a Tail',text:'A folktale is a story from long ago. It teaches us something good or tells about nature. It has animals or people who do special things. It comes from different countries and families.',sourcePage:13,art:UP2_ART.ray[0]},
]);
const nodeWriting = {'tail-proud':['animal','tail','beaver','quite','be-proud-of','spend-spent','thick','splendid','brag-bragged'],'tail-tree':['april','chop-chopped','eight','sway-swayed','tug-tugged','gasp-gasped'],'tail-flat':['flat','wail-wailed','about'],'tail-help':['special','our','give-gave','carry']};
for (const [j,id] of ['tail-proud','tail-tree','tail-flat','tail-help'].entries()) {
  const entries = old(id).activities.filter(a=>a.type==='story');
  const activities = entries.map((a,k)=>readStory(a,UP2_ART.ray[j*2+k],nodeWriting[id]));
  if(id==='tail-flat') activities[1].supportIds.push('explain-explained','signal','slap');
  if(id==='tail-help') {
    activities[0].supportIds.push('pal');
    const sections = Object.entries(UP2_READINGS).filter(([id])=>id.startsWith('ray-p')).map(([,lines],i)=>({text:lines.map(line=>line.text).join(' '),art:UP2_ART.ray[i]}));
    activities.push(find('ray-find-in-story',sections,['tail','Ray','day','April','swayed','way','wailed','explained'],13,UP2_ART.ray[7]));
    activities.push({...old(id).activities.find(a=>a.type==='speak'),id:'ray-final-expression-v2',title:'My turn!',prompt:"How did Ray’s new tail help him?",art:UP2_ART.ray[7]});
  }
  set(id,activities);
}
export const UP2_NODE_BY_ID = new Map(UP2_NODES.map((node) => [node.id, node]));
// Vocabulary is practised in context, one focus word at a time; one group recording
// cannot satisfy every word. Existing sentence evidence is reusable only by line ID.
const wordLocations = {
  'long-a-sentence-2':['agent','basic','pay-paid','stain-stained','train','may','play','stay'],
  'kay-story':['mail','rain','clay'],
  'ray-p14':['animal','tail','beaver','quite','be-proud-of','spend-spent','thick'],
  'ray-p15':['splendid','brag-bragged'],
  'ray-p16':['april','chop-chopped','eight'],
  'ray-p17':['sway-swayed','tug-tugged','gasp-gasped'],
  'ray-p18':['flat','wail-wailed','about'],
  'ray-p19':['explain-explained','signal','slap'],
  'ray-p20':['special','our','pal'],
  'ray-p21':['give-gave','carry']
};
for(const node of UP2_NODES) {
  node.activities=node.activities.flatMap(a=>{
    const targets=wordLocations[a.id]||[];
    return [a,...targets.map(id=>{
      const w=UP2_VOCAB_BY_ID.get(id);
      const forms=w.text.split(' / ');
      const match=a.lines?.find(l=>forms.every(form=>new RegExp(`\\b${form.replaceAll(' ','\\s+')}\\b`,'i').test(l.text)));
      return {type:'word-practice',id:`word-path-${id}`,wordId:id,title:w.level===4?'Read and write.':'Listen and read.',sourcePage:w.page,art:a.art,
        audioSrc:w.audioSrc,answer:w.text,legacyAnswer:w.pastForm?w.sourceText:'',
        context:match?.text||'',contextActivityId:a.id,contextLineId:match?.id||''};
    })];
  });
}
export const UP2_TOTAL_STARS = UP2_NODES.reduce((sum, node) => sum + node.reward, 0);
// v2 numeric-only saves need the old order; stable activity IDs still take priority.
export const UP2_V2_ORDER = Object.fromEntries(UP2_NODES.map(node => [node.id,
  node.id === 'rain-sounds' ? ['long-a-discover','long-a-words-1','long-a-words-2','long-a-words-3','long-a-sentence-1','long-a-sentence-2','word-path-agent','word-path-basic','word-path-pay-paid','word-path-stain-stained','word-path-train','word-path-may','word-path-play','word-path-stay','phonics-mail-man','phonics-ham-hay','phonics-snail-sad','phonics-crayon-crab'] :
  node.id === 'rain-kay' ? ['kay-story','word-path-mail','word-path-rain','word-path-clay','kay-find-in-story','kay-words-1','kay-words-2','kay-words-3','kay-q1-write','kay-q2-write','kay-q3-write','kay-q4-write','kay-q5-write','kay-q6','kay-q7'] :
  node.id === 'rain-snail' ? ['snail-story','snail-words-1','snail-words-2','snail-words-3','snail-words-4','snail-words-5','snail-q1','snail-q2','snail-match-picture-1','snail-match-picture-2','snail-match-picture-3','snail-match-picture-4'] : node.activities.map(a=>a.id)
]));
export const UP2_INCLUDED_PAGES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21];
export const UP2_EXCLUDED_PAGES = [12, 26, 30];
export const UP2_PAGE_IMAGE = page;
