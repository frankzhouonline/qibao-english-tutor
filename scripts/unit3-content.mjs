import {UNIT2_CONTENT} from './unit2-content.mjs';
const art=id=>`./assets/unit3/${id}.png`;
const audio=id=>`./assets/unit3/${id}.m4a`;
const core=[['by-car','by car'],['by-bus','by bus'],['on-foot','on foot']];
const lines=[
 ['postcard-1','Shenshen','Hi, Lily, how are you? Look, your postcard!'],
 ['postcard-2','Lily',"Hi, Shenshen. Oh, that’s great."],
 ['postcard-3','Shenshen','I love this red bus.'],
 ['postcard-4','Lily','Yes, you can see it in London.'],
 ['postcard-5','Shenshen',"But what’s this?"],
 ['postcard-6','Lily',"Oh, it’s the London Underground."],
 ['postcard-7','Shenshen','Underground?'],
 ['postcard-8','Lily','Yes, you use “metro” in Shanghai.'],
 ['postcard-9','Shenshen','Haha, I see.']
].map(([id,speaker,text])=>({id,speaker,text,audioSrc:audio(id),imageSrc:art('postcard')}));
const story=[
 {id:'postcard-listen',type:'listen',title:'A postcard from London',instruction:'先听完整对话，再一句句跟读。',lines,imageSrc:art('postcard')},
 ...lines.map(line=>({...line,type:'repeat',title:line.text,instruction:'先听这一句，再跟读录音。',rewardStage:'sentences'})),
 {id:'postcard-whole',type:'repeat',title:'Tell the whole story.',instruction:'跟着对话的顺序，完整读一遍。',lines,imageSrc:art('postcard'),rewardStage:'dialogue'},
 ...[
  ['match-metro','metro','Shanghai'],['match-underground','underground','London'],
  ['match-red-bus','red-bus','London'],['match-city-bus','city-bus','Shanghai']
 ].map(([id,picture,answer])=>({id,type:'match',title:'Look and match.',instruction:'看交通图片，选择课本里对应的城市。',picture,answer,options:['Shanghai','London']})),
 {id:'describe-vehicle',type:'speak-choice',title:'Tick and speak.',instruction:'选喜欢的车，说说它的颜色和大小。',options:[{id:'car',text:'car',imageSrc:art('by-car')},{id:'bus',text:'bus',imageSrc:art('by-bus')}],frames:['I love this ___ ___.','It’s ___.'],rewardStage:'transfer'}
];
export const UNIT3_CONTENT={
 id:'unit3',number:3,title:'On the way',homeClass:'family-unit-scene unit3-family-scene',
 phrases:[...core.map(([id,text])=>({id,text,kind:'core',imageSrc:art(id),audioSrc:audio(id)})),
 {id:'listen-walk',text:'In the morning, I go to school on foot.',kind:'listening',imageSrc:art('on-foot'),audioSrc:audio('listen-walk')},
 {id:'listen-bus',text:'Listen and circle.',kind:'listening',imageSrc:art('by-bus'),audioSrc:audio('listen-bus')}],
 learnPhraseIds:core.map(([id])=>id),dictationPhraseIds:core.map(([id])=>id),
 phraseQuiz:core.map(([id],i)=>({id:`choose-${id}`,targetId:id,optionIds:i===0?['on-foot','by-car','by-bus']:i===1?['by-bus','on-foot','by-car']:['by-car','by-bus','on-foot']})),
 listeningQuiz:[{id:'listen-1',targetId:'listen-walk',optionIds:['listen-walk','by-car']},{id:'listen-2',targetId:'listen-bus',optionIds:['by-car','listen-bus']}],
 scenes:[],sentences:[],dialogueGroups:[],transferTasks:[],unlockAfter:{},
 steps:UNIT2_CONTENT.steps.map(s=>({...s,subtitle:({words:'听懂出行，再说说自己',listening:'听一听，选出交通方式',story:'明信片里的伦敦',song:'Going to school',project:'My bookmark'})[s.id]})),
 textbook:{title:UNIT2_CONTENT.textbook.title,publisher:UNIT2_CONTENT.textbook.publisher,edition:UNIT2_CONTENT.textbook.edition,isbn:UNIT2_CONTENT.textbook.isbn,unitTitle:'On the way',verifiedPages:'Unit 3 pp.21–26',pageRange:'21–26',unitHomeVisual:art('on-foot'),familyVisual:art('on-foot'),officialTracks:{topicWords:core.map(([id])=>audio(id)),song:audio('rhyme'),songListening:[audio('listen-walk'),audio('listen-bus')],talkingTime:lines.map(l=>l.audioSrc)}},
 rewards:{words:1,listening:1,sentences:1,dialogue:2,transfer:3,dictation:2,song:1,project:3},
 practiceStages:{story,application:[{id:'my-commute',type:'speak-choice',presentation:'personal-speaking',title:'How do you go to school?',instruction:'你平时怎么上学？',options:core.map(([id,text])=>({id,text,imageSrc:art(id)})),frames:['I go to school ___.']}]},
 projectType:'bookmark',projectTitle:'My bookmark',bookmarkVehicles:[{id:'car',text:'car',imageSrc:art('by-car')},{id:'bus',text:'bus',imageSrc:art('by-bus')},{id:'bike',text:'bike',imageSrc:art('bike')}],
 song:{kind:'rhyme',title:'Going to school',audioSrc:audio('rhyme'),imageSrc:art('on-foot'),lyrics:['In the morning,','We go to school.','How do you go?','How do you go?','Go by car? No, no, no.','Go on foot? OK. Let’s go!']}
};
