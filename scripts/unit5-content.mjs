import { UNIT2_CONTENT } from './unit2-content.mjs';
const art=id=>`./assets/unit5/${id}.png`;
const audio=id=>`./assets/unit5/${id}.m4a`;
const core=[['star','star'],['moon','moon'],['sun','sun'],['cloud','cloud'],['in-the-sky','in the sky']];
const phrases=core.map(([id,text])=>({id,text,kind:'core',imageSrc:art(id==='in-the-sky'?'home':id),audioSrc:audio(id)}));
// These two existing pictures contrast location only; they are NOT new learning targets.
const locationOptions=[
 {id:'location-desk',text:'on the desk',kind:'visual-distractor',imageSrc:UNIT2_CONTENT.phrases.find(p=>p.id==='on-the-desk').imageSrc},
 {id:'location-bed',text:'under the bed',kind:'visual-distractor',imageSrc:UNIT2_CONTENT.phrases.find(p=>p.id==='under-the-bed').imageSrc}
];
const lines=[
 ['sun-morning','Mr Sun','Good morning, my friend.','morning'],
 ['rita-morning','Rita','Good morning!','morning'],
 ['rita-cloud','Rita','Miss Cloud, where’s Mr Sun?','cloud'],
 ['cloud-reply','Miss Cloud','He’s behind me.','cloud'],
 ['narrator-high','Narrator','The sun is high in the sky.','afternoon'],
 ['rita-hey','Rita','Hey, Mr Sun!','afternoon'],
 ['sun-afternoon','Mr Sun','Good afternoon, Rita.','afternoon'],
 ['narrator-moon','Narrator','The moon comes out.','night'],
 ['rita-night','Rita','Where’s Mr Sun?','night'],
 ['moon-night','Moon','He goes down at night. Good night, Rita.','night'],
 ['rita-goodnight','Rita','Good night.','night']
].map(([id,speaker,text,scene])=>({id,speaker,text,scene,audioSrc:audio(id),imageSrc:art(`story-${scene}`)}));
const storyPictures=['morning','cloud','afternoon','night'].map(id=>({id,imageSrc:art(`story-${id}`)}));
const lyrics=['Twinkle, twinkle, little star,','How I wonder what you are!','Up above the world so high,','Like a diamond in the sky.','Twinkle, twinkle, little star,','How I wonder what you are!'];
const subtitles={words:'认识天空里的事物',listening:'听一听，看到了什么？',story:'Rita 和太阳的故事',song:'Twinkle, twinkle, little star',project:'My sky log'};
const skyOptions=[
 {id:'sun',text:'sun',imageSrc:art('sun'),frame:'The ___ is in the sky.'},
 {id:'cloud',text:'clouds',imageSrc:art('cloud'),frame:'The ___ are in the sky.'},
 {id:'moon',text:'moon',imageSrc:art('moon'),frame:'The ___ is in the sky.'},
 {id:'star',text:'stars',imageSrc:art('star'),frame:'The ___ are in the sky.'}
];
export const UNIT5_CONTENT={
 id:'unit5',number:5,title:'In the sky',homeClass:'family-unit-scene unit5-family-scene',homeArt:art('home'),
 phrases:[...phrases,...locationOptions],learnPhraseIds:core.map(([id])=>id),dictationPhraseIds:core.map(([id])=>id),resumeWordsDictation:true,
 wordGroups:[{title:'天空中的光',ids:['star','moon','sun']},{title:'云和天空',ids:['cloud','in-the-sky']}],
 phraseQuiz:[
  {id:'choose-star',targetId:'star',optionIds:['moon','star','sun']},
  {id:'choose-moon',targetId:'moon',optionIds:['cloud','sun','moon']},
  {id:'choose-sun',targetId:'sun',optionIds:['sun','moon','star']},
  {id:'choose-cloud',targetId:'cloud',optionIds:['star','cloud','moon']},
  {id:'choose-in-the-sky',targetId:'in-the-sky',optionIds:['location-desk','in-the-sky','location-bed']}
 ],
 listeningQuiz:[],scenes:[],sentences:[],dialogueGroups:[],transferTasks:[],unlockAfter:{},
 steps:UNIT2_CONTENT.steps.map(s=>({...s,subtitle:subtitles[s.id]})),
 textbook:{title:UNIT2_CONTENT.textbook.title,publisher:UNIT2_CONTENT.textbook.publisher,edition:UNIT2_CONTENT.textbook.edition,isbn:UNIT2_CONTENT.textbook.isbn,unitTitle:'In the sky',verifiedPages:'Unit 5 pp.33–38',pageRange:'33–38',unitHomeVisual:art('home'),familyVisual:art('home'),officialTracks:{topicWords:core.map(([id])=>audio(id)),song:audio('song'),songListening:[audio('listen-stars')],talkingTime:lines.map(l=>l.audioSrc)}},
 rewards:{words:1,listening:1,sentences:1,dialogue:2,transfer:3,dictation:2,story:3,song:1,project:3},
 practiceCompletionRewards:{listening:'complete',story:'performance-complete',song:'song',project:'project'},
 practiceStages:{
  listening:[{id:'sky-listening',type:'multi-select',title:'Listen and tick.',instruction:'先听，再勾选听到的天空图。',playLabel:'听一听',audioSrc:audio('listen-stars'),options:[{id:'stars',imageSrc:art('star')},{id:'moon',imageSrc:art('moon')},{id:'clouds',imageSrc:art('cloud')}],answerIds:['stars'],checkLabel:'检查选择'}],
  story:[
   {id:'rita-listen',type:'listen',title:'Rita and Mr Sun',instruction:'先完整听故事，再给图片排顺序。',audioSrc:audio('story-whole'),gallery:storyPictures},
   {id:'rita-order',type:'order',title:'Look and number.',instruction:'第 1 幅已经找好了。接着按顺序点图，点已选图片可撤销。',audioSrc:audio('story-whole'),playLabel:'再听故事',options:[storyPictures[1],storyPictures[0],storyPictures[3],storyPictures[2]],answerIds:['morning','cloud','afternoon','night'],givenOrderIds:['morning']},
   ...lines.map(l=>({...l,type:'repeat',title:l.text,instruction:'先听这一句，再跟读录音。',rewardStage:'sentences'})),
   {id:'rita-whole',type:'repeat',title:'Tell the whole story.',instruction:'看四幅图，连起来读一遍。需要时可以展开课文。',audioSrc:audio('story-whole'),transcript:lines,gallery:storyPictures,recordLabel:'录下完整故事'},
   {id:'rita-role',type:'role-play',title:'Role-play.',instruction:'选一个角色，听对方说话，再接一句。',options:[
    {id:'rita',text:'Rita',imageSrc:art('story-morning'),promptText:'Good morning, my friend.',promptAudioSrc:audio('sun-morning'),replyText:'Good morning!'},
    {id:'sun',text:'Mr Sun',imageSrc:art('story-afternoon'),promptText:'Hey, Mr Sun!',promptAudioSrc:audio('rita-hey'),replyText:'Good afternoon, Rita.'}
   ],playLabel:'听对方说话',recordLabel:'录下我的回答'}
  ],
  song:[{id:'twinkle-sing',type:'repeat',title:'Twinkle, twinkle, little star',instruction:'先听，再跟唱。唱的时候也可以做小星星手势。',audioSrc:audio('song'),lyrics,imageSrc:art('home'),recordLabel:'录下我的演唱',finishLabel:'完成歌谣唱读'}],
  project:[
   {id:'sky-log-day',type:'scene-log',title:'My sky log · Day',instruction:'看白天天空，选你看到的事物，再说一句。',period:'Day',options:skyOptions.filter(o=>['sun','cloud'].includes(o.id)),imageSrc:art('story-afternoon'),recordLabel:'介绍白天天空'},
   {id:'sky-log-night',type:'scene-log',title:'My sky log · Night',instruction:'看夜晚天空，选你看到的事物，再说一句。',period:'Night',options:skyOptions.filter(o=>['star','moon'].includes(o.id)),imageSrc:art('story-night'),recordLabel:'介绍夜晚天空',showLogSummary:true,finishLabel:'完成我的天空日志'}
  ]
 },
 song:{kind:'song',title:'Twinkle, twinkle, little star',audioSrc:audio('song'),imageSrc:art('home'),lyrics},
 projectType:'guided-speech',projectTitle:'My sky log',firstCompletionStars:34
};
for(const [stage,activities] of Object.entries(UNIT5_CONTENT.practiceStages))for(const a of activities)a.stageLabel=UNIT5_CONTENT.steps.find(s=>s.id===stage).title;
