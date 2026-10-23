import {UNIT2_CONTENT} from './unit2-content.mjs';
const art=id=>`./assets/unit4/${id}.png`;
const audio=id=>`./assets/unit4/${id}.m4a`;
const core=[['run','run'],['jump','jump'],['play-ping-pong','play ping-pong'],['play-basketball','play basketball'],['play-football','play football']];
const options=core.map(([id,text])=>({id,text,imageSrc:art(id),audioSrc:audio(id)}));
const lines=[
 ['ping-1','Girl','Wow, you can play ping-pong very well. Can I have a go?','story-invite'],
 ['ping-2','Boy','Yes, of course. But you should do a warm-up.','story-warmup'],
 ['ping-3','Girl','OK.','story-warmup'],
 ['ping-4','Children','One, two, three, four. Five, six, seven, eight.','story-warmup'],
 ['ping-5','Girl','Oh, no! The ball’s out.','story-miss'],
 ['ping-6','Boy','Try again!','story-miss'],
 ['ping-7','Boy','Well done!','story-success'],
 ['ping-8','Girl','Thank you.','story-success']
].map(([id,speaker,text,image])=>({id,speaker,text,audioSrc:audio(id),imageSrc:art(image)}));
const lyrics=['Here we go.','Do our best.','Run and jump.','Run and jump.','Play ping-pong.','Play basketball.','Play football.','We are the best.'];
// Four distinct speech purposes, not one recording for every repeated board square.
// Stable IDs preserve recordings from the previous eight-square flow.
const board=[
 {id:'board-3',type:'open-speech',title:'I can…',instruction:'看跑步图，用 I can… 说一句，再录下来。',imageSrc:art('run'),frames:['I can ___.']},
 {id:'board-11',type:'speak-choice',title:'Let’s play!',instruction:'选一项球类运动，用 Let’s… 邀请朋友，再录下来。',options:options.slice(2),frames:['Let’s play ___.']},
 {id:'board-2',type:'open-speech',title:'Before we play…',instruction:'运动前要做什么？看图，用 We should… 提醒朋友。',imageSrc:art('story-warmup'),frames:['We should do a ___.']},
 {id:'board-8',type:'open-speech',title:'Play safely.',instruction:'看安全提示图，用 We should… 提醒朋友注意安全。',imageSrc:art('safety'),frames:['We should be ___.']}
].map(a=>({...a,showFrameHint:true,recordLabel:'录下这一句',finishLabel:'完成小小实践'}));
export const UNIT4_CONTENT={
 id:'unit4',number:4,title:'Playing sports',homeClass:'family-unit-scene unit4-family-scene',
 phrases:options.map(o=>({...o,kind:'core'})),learnPhraseIds:core.map(([id])=>id),dictationPhraseIds:core.map(([id])=>id),
 wordGroups:[{title:'跑和跳',ids:['run','jump']},{title:'三种球类',ids:['play-ping-pong','play-basketball','play-football']}],resumeWordsDictation:true,
 phraseQuiz:core.map(([id],i)=>({id:`choose-${id}`,targetId:id,optionIds:i<2?['jump','run']:i===2?['play-basketball','play-ping-pong','play-football']:i===3?['play-football','play-basketball','play-ping-pong']:['play-ping-pong','play-football','play-basketball']})),
 listeningQuiz:[],scenes:[],sentences:[],dialogueGroups:[],transferTasks:[],unlockAfter:{},
 steps:UNIT2_CONTENT.steps.map(s=>({...s,subtitle:({words:'认识五种运动',listening:'他们会什么运动？',story:'一起打乒乓球',song:'一起编运动歌谣',project:'用英语约朋友运动'})[s.id]})),
 textbook:{title:UNIT2_CONTENT.textbook.title,publisher:UNIT2_CONTENT.textbook.publisher,edition:UNIT2_CONTENT.textbook.edition,isbn:UNIT2_CONTENT.textbook.isbn,unitTitle:'Playing sports',verifiedPages:'Unit 4 pp.27–32',pageRange:'27–32',unitHomeVisual:art('home'),familyVisual:art('run'),officialTracks:{topicWords:core.map(([id])=>audio(id)),song:audio('chant'),songListening:[audio('listen-whole')],talkingTime:lines.map(l=>l.audioSrc)}},
 rewards:{words:1,listening:1,sentences:1,dialogue:2,transfer:3,dictation:2,song:1,project:3},
 practiceCompletionRewards:{listening:'complete',song:'song',project:'project'},
 practiceRevision:2,
 revisedPracticeStages:['story','project'],
 practiceStages:{
  listening:[
   {id:'sports-listen',type:'listen',title:'Listen and match.',instruction:'先听完整对话，再找出每个人会的运动。',audioSrc:audio('listen-whole')},
    {id:'sports-speaker-1',type:'multi-select',title:'Listen and match.',instruction:'听第一位回答的小朋友。选出这位小朋友会的所有运动。',speaker:'1',audioSrc:audio('listen-first'),options:options.slice(2),answerIds:['play-ping-pong','play-football']},
    {id:'sports-speaker-2',type:'multi-select',title:'Listen and match.',instruction:'听第二位回答的小朋友。选出这位小朋友会的所有运动。',speaker:'2',audioSrc:audio('listen-second'),options:options.slice(2),answerIds:['play-ping-pong']}
  ],
  story:[
   {id:'ping-listen',type:'listen',title:'Look and listen.',instruction:'先听完整故事，接下来给图片排顺序。',lines,imageSrc:art('story-invite')},
   {id:'ping-order',type:'order',title:'Look and number.',instruction:'按刚才故事的先后点图片。忘了可以再听；点已选图片可撤销。',lines,playLabel:'再听一遍故事',options:[{id:'success',imageSrc:art('story-success')},{id:'miss',imageSrc:art('story-miss')},{id:'warmup',imageSrc:art('story-warmup')}],answerIds:['warmup','miss','success']},
   ...lines.map(l=>({...l,type:'repeat',title:l.text,instruction:'先听这一句，再跟读录音。',rewardStage:'sentences'})),
   {id:'ping-whole',type:'repeat',title:'Tell the whole story.',instruction:'从请求尝试到成功，完整读一遍。',lines,imageSrc:art('story-invite'),rewardStage:'dialogue'},
   {id:'ping-invitation',type:'speak-choice',title:'Think and speak.',instruction:'邀请朋友做一项运动，再替朋友回应并提醒热身。',options:options.slice(2),frames:['Let’s ___.','Great! We should ___.'],example:['Let’s play football.','Great! We should do a warm-up.'],rewardStage:'transfer'}
  ],
  song:[
   {id:'chant-original',type:'repeat',title:'Let’s play sports',instruction:'先完整听一遍，再按节奏录下你的歌谣。',audioSrc:audio('chant'),lyrics,imageSrc:art('run')},
   {id:'chant-own',type:'compose',title:'Make a new chant.',instruction:'选两行动作，编一首自己的运动歌谣。',options,frames:['Here we go.','Do our best.','…','…','We are the best.']}
  ],
  project:board
 },
 song:{kind:'rhyme',title:'Let’s play sports',audioSrc:audio('chant'),imageSrc:art('run'),lyrics},
 projectType:'guided-speech',projectTitle:'Let’s play sports!'
};
for(const [stage,activities] of Object.entries(UNIT4_CONTENT.practiceStages)) {
 for(const activity of activities)activity.stageLabel=UNIT4_CONTENT.steps.find(s=>s.id===stage).title;
}
