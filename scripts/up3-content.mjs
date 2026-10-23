// UP3 v03: source-task order is the product contract; source-page crops are never runtime art.
const sound=id=>`./assets/audio/official/up3/${id}${id.startsWith('word-')||id==='pea-3'?'-v06':''}.m4a`;
const fishSound=id=>`./assets/audio/official/up3/fish-provided/${id}.mp3`;
const storySound=id=>`./assets/audio/official/up3/${id}-${id.startsWith('queen-panel-')?'v06':'v05'}.mp3`;
const hiveArt={src:'./assets/up3/phonics-hives-v05.png',size:[1536,1024],alt:'Jean带孩子们观察田野里的蜂箱，蜜蜂忙碌工作'};
const sprite=(name,crop,alt,size=[1536,1024])=>({src:`./assets/up3/${name}`,crop,size,alt});
const quad=(name,i,alt)=>sprite(name,[(i%2)*768,Math.floor(i/2)*512,768,512],alt);
const queenArt=['女王展示绿色牙齿和脚','女王吃肉后仍是绿色','女王吃种子后仍是绿色','女王吃树后仍是绿色','蜜蜂叮了女王，她疼痛惊慌','女王被蜜蜂叮后变红并哭泣'].map((alt,i)=>i===4?{src:'./assets/up3/queen-bee-sting-v03.png',size:[1254,1254],alt}:sprite('queen-story-v03-corrected.png',[(i%3)*512,Math.floor(i/3)*512,512,512],alt));
const beeArt=['麒宝发现泥脚和种子','麒宝看见叶子','麒宝看见树上喝茶的蜜蜂','蜜蜂睡在麒宝膝盖上'].map((alt,i)=>quad('bee-qibao-four-scenes-v1.png',i,alt));
const fishArt=Array.from({length:8},(_,i)=>quad(i<4?'fish-pages-13-16-v03.png':'fish-pages-17-20-v03.png',i%4,`鱼群阅读第 ${i+13} 页忠实重绘插图`));
const peaArt=Array.from({length:8},(_,i)=>quad(i<4?'pea-pages-1-4-v03.png':'pea-pages-5-8-v04.png',i%4,`女王与豌豆第 ${i+1} 幅忠实重绘插图`));
const fishCaptionArt=page=>sprite('fish-captions-v04.png',[page===16?0:1086,0,1086,724],page===16?'条纹鳗鲶一起进食':'红色新月尾大眼鱼结群',[2172,724]);
const p11Art=i=>i===3?fishArt[2]:[4,6,7].includes(i)?sprite('p11-actions-v04.png',[[4,6,7].indexOf(i)*724,0,724,724],['孩子在沙滩一起玩','受伤的脚','树下的猫'][[4,6,7].indexOf(i)],[2172,724]):sprite('p11-cues-v03.png',[(i%5)*354.8,Math.floor(i/5)*443.5,354.8,443.5],`原题第 ${i+1} 题重绘提示图`,[1774,887]);
const vocabRows=[
  ['creek','小溪'],['deep','深的'],['keep','保持'],['each other','彼此'],['team','团队'],['chief','主要的'],['reason','原因'],['blue','蓝色'],['or','或者'],['ocean','海洋'],['into','进入'],['alone','独自'],['partner','伙伴'],['small','小的'],['unsafe','不安全'],['stay away','远离'],['mess','招惹'],
  ['peek','偷看'],['meeting','会议'],['green','绿色'],['bee','蜜蜂'],['leaf','叶子'],['treat','对待'],['beast','野兽'],['brief','短暂的'],['thief','小偷'],['field','田野'],['in a bunch','成群'],['danger','危险'],['snap up','迅速抓走'],['a neat trick','妙招'],['crescent-tail bigeye fish','新月尾大眼鱼'],['fool','欺骗'],['barracuda fish','梭鱼'],['hundreds of','数百']
];
export const UP3_VOCAB=vocabRows.map(([text,meaning],i)=>({id:text.replaceAll(' ','-'),text,meaning,level:i<17?4:3,sourcePage:i<17?i<13?3:4:i<25?4:5,audioSrc:sound(`word-${text.replaceAll(' ','-')}`)}));
export const UP3_VOCAB_BY_ID=new Map(UP3_VOCAB.map(w=>[w.id,w]));
const line=(id,text,page,art)=>({id,text,sourcePage:page,audioSrc:sound(id),art});
const read=(id,title,page,lines,art,optionalRecording=false)=>({type:'reading',id,title,sourcePage:page,lines,art,paragraphs:false,optionalRecording,stepNoun:'幅'});
const choice=(id,prompt,options,answer,page,art,type='choice')=>({type,id,title:type==='letter-write'?'Read and write the correct alphabet.':type==='select-write'?'Read, check and write.':'Look and circle.',prompt,options,answer,sourcePage:page,art});
const wordPractice=(id,page,art,context='')=>({type:'word-practice',id:`${UP3_VOCAB_BY_ID.get(id).level===4?'spell':'practice'}-${id}`,wordId:id,answer:UP3_VOCAB_BY_ID.get(id).text,level:UP3_VOCAB_BY_ID.get(id).level,title:'Word practice',sourcePage:page,art,context});
const find=(id,text,targets,page,art)=>({type:'find',id,title:'Find and circle.',text,targets,sourcePage:page,art});
const queenTexts=['The queen is green! Her teeth are green. Her feet are green.','She eats meat. Still green.','She eats seeds. Still green.','She eats a tree. Still green like a leaf.','A bee! Eat a bee? Buzzzzz...','The queen is red now.'];
const beeTexts=['My feet are not clean. I see a seed.','Oh, no! A leaf! Is that a bean?','No, it is a tree. A bee has tea.','The bee is asleep. Asleep on my knee!'];
export const UP3_THEME_LINES=['Many animals live and travel as a group. Working as a group, animals can help each other stay safe.','Fish: The fish work together as a team. They look for food. They swim together to stay safe. They help each other.','Ants: Ants live in big groups. They build nests and look for food together.','Dolphins: Dolphins live in groups. They stay safe together.','Penguins: Penguins also walk together to keep themselves warm in cold weather.'];
const queenLines=queenTexts.map((text,i)=>({id:`queen-${i+1}`,text,sourcePage:7,art:queenArt[i],audioSrc:storySound(`queen-panel-${i+1}`)}));
const beeLines=beeTexts.map((text,i)=>({id:`bee-${i+1}`,text,sourcePage:9,art:beeArt[i],audioSrc:storySound(`bee-panel-${i+1}`)}));
const fishRows=[
  [13,['Fish swim in lakes and creeks. Fish swim in deep blue seas or oceans. Let’s dive into the water. Let’s look at fish!'],['p13'],['creek','deep','blue','ocean','into','or']],
  [14,['Fish can swim alone. Fish can swim with a partner. Fish can swim in a bunch, too. A bunch of fish is called a school.'],['p14'],['alone','partner','in-a-bunch']],
  [15,['A school has lots of fish. They are a team. The fish help each other. They look for food together.'],['p15'],['team','each-other']],
  [16,['Fish eat lots of things. Some fish eat small animals. Some fish eat other fish!','These catfish eat together for safety.'],['p16-1','p16-2'],['small']],
  [17,['It can be unsafe to swim alone. What is the chief reason? Danger! A fish can get snapped up! But a fish can hide in a school.'],['p17'],['unsafe','chief','reason','danger','snap-up']],
  [18,['Fish in a school have a neat trick. The fish swim close together. Big fish will not mess with them because they look like one huge fish.','These crescent-tail bigeye fish swim in a school to fool big fish.'],['p18-1','p18-2'],['mess','a-neat-trick','crescent-tail-bigeye-fish','fool']],
  [19,['This big fish wants to eat. But it stays away. The school looks like a huge fish that may eat him!'],['p19'],['stay-away']],
  [20,['Fish in a school keep each other safe. A school is a good place for a fish to be!','Hundreds of barracuda fish swim in a school together.'],['p20-1','p20-2'],['keep','barracuda-fish','hundreds-of']]
];
const fishRead=([page,texts,clips,supportIds])=>({...read(`fish-page-${page}`,'A Team of Fish',page,texts.map((text,i)=>({id:`fish-${page}-${i+1}`,text,audioSrc:fishSound(clips[i]),sourcePage:page,art:i===1&&[16,18].includes(page)?fishCaptionArt(page):fishArt[page-13]})),fishArt[page-13],true),supportIds,stepNoun:'段'});
const p11Bank=['meat','tree','beach','leaf','team','feet','clean','green','treat','creeks'];
const p11Prompts=['This is a green ___.','How do you ___ animals?','He likes to eat ___.','They are a ___.','They play on the ___.','Fish swim in ___.','I hurt my ___.','There is a cat under the ___.','The bananas are still ___.','The classroom is ___.'];
const p11Answers=['leaf','treat','meat','team','beach','creeks','feet','tree','green','clean'];
const p11Activities=p11Prompts.map((prompt,i)=>({...choice(`p11-${i+1}`,prompt,p11Bank,p11Answers[i],11,p11Art(i),'select-write'),title:'Choose the correct word to complete the sentences.',sharedBank:p11Bank,itemNumber:i+1,itemCount:10}));
const fishText=fishRows.flatMap(([,parts])=>parts).join(' ');
export const UP3_BOOK_SCENES=[
  '“Sweet King,” said the queen, “will you put a pea in my bed? I want to see if I can feel it.”',
  'The king thought, “She will not sleep if she cannot feel the pea. And then I will not sleep.”',
  'He put a pea in her bed. “She may not feel this,” he said. “I need something bigger.”',
  'He put a grape in her bed. Then he put a peach in her bed.',
  '“Bigger!” he said. He stuck in the wheel from his bike.',
  'He put in a rake, a kite, a pipe, and a small tree. “She will feel this,” he said with pride.',
  'The queen got in her bed. “I can feel it!” she said. “That’s some pea!”',
  '“Sweet King,” said the queen, “I cannot sleep. There is a pea in my bed.”'
].map((text,i)=>({id:`pea-${i+1}`,text,audioSrc:sound(`pea-${i+1}`),art:peaArt[i],sourcePage:37,textOrigin:i===2||i===3?'provided-audio-transcription':'printed-page'}));
export const UP3_CHAPTERS=[
  {id:'sounds',title:'长 e 与两个故事',subtitle:'Sounds and stories',nodeIds:['long-e','green-queen','bee-knee'],art:queenArt[0]},
  {id:'sentences',title:'词句练习',subtitle:'Read and write',nodeIds:['word-bank'],art:p11Art(0)},
  {id:'fish',title:'鱼群共读',subtitle:'A Team of Fish',nodeIds:['fish-reading'],art:fishArt[2]}
];
// Freeze the interrupted v03 order before inserting gap-fill activities; indices are not semantic IDs.
export const UP3_PREVIOUS_ORDER={
  'long-e':['long-e-words','long-e-lines'],
  'green-queen':['queen-story','queen-find','p8-1','p8-2','p8-3','p8-4','p8-5','p8-yes-no-1','p8-yes-no-2'],
  'bee-knee':['bee-story','bee-find-seed','bee-find-leaf','bee-find-tea','bee-find-bee','p10-a1','p10-a2','p10-b1','p10-b2','p10-b3','p10-b4'],
  'word-bank':Array.from({length:10},(_,i)=>`p11-${i+1}`),
  'fish-reading':['fish-nonfiction',...fishRows.flatMap(row=>[`fish-page-${row[0]}`,...row[3].filter(id=>UP3_VOCAB_BY_ID.get(id).level===4).map(id=>`spell-${id}`)]),'fish-long-e-find','fish-final'],
  'queen-pea':['pea-book']
};
export const UP3_REV4_ORDER={...UP3_PREVIOUS_ORDER,
  'long-e':['long-e-words','long-e-lines','phonics-gap-1','phonics-gap-2'],
  'word-bank':['p11-1','p11-2','p11-3','p11-4','p11-5','p11-6','p11-7','p11-8','p11-9','p11-10','p11-treat-say'],
  'fish-reading':['fish-nonfiction','fish-page-13','fish-page-14','fish-page-15','fish-page-16','fish-page-17','fish-page-18','fish-page-19','fish-page-20','fish-long-e-find','fish-final','fish-words-13-1','fish-words-13-2','spell-creek','spell-deep','spell-blue','spell-ocean','spell-into','spell-or','fish-words-14-1','spell-alone','spell-partner','fish-words-15-1','spell-team','spell-each-other','fish-words-16-1','spell-small','fish-words-17-1','fish-words-17-2','spell-unsafe','spell-chief','spell-reason','fish-words-18-1','spell-mess','fish-words-19-1','spell-stay-away','fish-words-20-1','spell-keep']
};
export const UP3_REMOVED_ACTIVITY_RESUME={'phonics-gap-1':'practice-peek','phonics-gap-2':'practice-thief','p11-treat-say':'practice-treat','fish-words-13-1':'spell-creek','fish-words-13-2':'spell-ocean','fish-words-14-1':'spell-alone','fish-words-15-1':'spell-team','fish-words-16-1':'spell-small','fish-words-17-1':'spell-unsafe','fish-words-17-2':'practice-danger','fish-words-18-1':'spell-mess','fish-words-19-1':'spell-stay-away','fish-words-20-1':'spell-keep'};
const fishActivities=[{type:'notice',id:'fish-nonfiction',title:'Nonfiction · A Team of Fish',text:'Nonfiction tells about real people, places or things. It tells about real events. It gives information and facts.',sourcePage:12,art:fishArt[0],audioSrc:fishSound('p12')}];
fishActivities.push(...fishRows.map(fishRead));
fishActivities.push({...find('fish-long-e-find',fishText,['team','creeks','deep','seas','the','each','eat','be','chief','reason','neat','keep'],12,fishArt[7]),matchOnce:true,sections:fishRows.map(([page,texts])=>({text:texts.join(' '),art:fishArt[page-13]}))});
fishActivities.push({type:'speak',id:'fish-final',title:'How can fish help each other?',prompt:'How can fish help each other?',sourcePage:20,art:fishArt[7]});
// Read all source pages without a per-page vocabulary gate; fill evidence gaps at task closure.
for(const [page,texts,,ids] of fishRows)for(const id of ids)fishActivities.push(wordPractice(id,page,fishArt[page-13],texts.join(' ')));
export const UP3_NODES=[
  {id:'long-e',chapterId:'sounds',title:'长 e 拼读',reward:2,sourcePages:[6],activities:[
    {type:'phonics',id:'long-e-words',title:'Long e · e / ee / ea / ie',patterns:['e','ee','ea','ie'],examples:['he','bees','eat','chief'],words:['me','see','each','she','leaf','peek','brief','treated','thief','meeting','green','beast'],supportIds:['peek','brief','thief','meeting','green','beast','leaf','bee','field','treat'],audioSrc:'./assets/audio/official/up3/phonics-master.mp3',sourcePage:6,art:hiveArt},
    {...read('long-e-lines','Listen and repeat.',6,[line('phonics-sentence-1','We peeked at Jean’s hives in the field.',6,hiveArt),line('phonics-sentence-2','She told us, “Each bee works hard.”',6,hiveArt)],hiveArt),optionalRecording:false,stepNoun:'句'},
    ...['peek','meeting','brief','thief','beast'].map(id=>wordPractice(id,6,hiveArt))
  ]},
  {id:'green-queen',chapterId:'sounds',title:'The Green Queen',reward:4,sourcePages:[7,8],activities:[
    {...read('queen-story','The Green Queen',7,queenLines,queenArt[0]),audioSrc:storySound('queen-whole'),paragraphs:true,supportIds:['green','bee','leaf']},
    {...find('queen-find',queenTexts.join(' '),['are','her','now','still'],7,queenArt[5]),sections:queenTexts.map((text,i)=>({text,art:queenArt[i]}))},
    ...[['The queen is ___.',['green','bee'],'green'],['Her ___ are green.',['leaf','feet'],'feet'],['She eats ___. Still green.',['meat','feet'],'meat'],['She eats a tree. Still green like a ___.',['leaf','meat'],'leaf'],['A bee! Eat a ___? Buzzz...',['tree','bee'],'bee']].map(([prompt,options,answer],i)=>({...choice(`p8-${i+1}`,prompt,options,answer,8,null,'select-write'),title:'Read and check. Then write.'})),
    choice('p8-yes-no-1','She eats seeds.',['YES','NO'],'NO',8,queenArt[3]),choice('p8-yes-no-2','She is still green.',['YES','NO'],'YES',8,queenArt[3])
  ]},
  {id:'bee-knee',chapterId:'sounds',title:'A Bee on My Knee',reward:4,sourcePages:[9,10],activities:[
    {...read('bee-story','A Bee on My Knee',9,beeLines,beeArt[0]),audioSrc:storySound('bee-whole'),paragraphs:true,supportIds:['bee','leaf']},
    ...beeTexts.map((text,i)=>find(`bee-find-${['seed','leaf','tea','bee'][i]}`,text,[['seed','leaf','tea','bee'][i]],9,beeArt[i])),
    choice('p10-a1','My feet are not ___.',['clean','leaf'],'clean',10,beeArt[0]),choice('p10-a2','The bee is ___.',['tree','asleep'],'asleep',10,beeArt[3]),
    ...['I see a seed.','Oh, no! A leaf!','A bee has tea.','Asleep on my knee!'].map((prompt,i)=>choice(`p10-b${i+1}`,prompt,[3,0,1,2].map((scene,j)=>({value:'abcd'[j],art:beeArt[scene]})),['b','c','d','a'][i],10,null,'letter-write'))
  ]},
  {id:'word-bank',chapterId:'sentences',title:'十题词句',reward:3,sourcePages:[11],activities:[...p11Activities,wordPractice('treat',11,p11Art(1),'How do you treat animals?')]},
  {id:'fish-reading',chapterId:'fish',title:'A Team of Fish',reward:6,sourcePages:[12,13,14,15,16,17,18,19,20],activities:fishActivities},
  {id:'queen-pea',chapterId:'book',title:'The Queen and the Pea',reward:1,sourcePages:[37],activities:[{type:'book',id:'pea-book',title:'The Queen and the Pea',scenes:UP3_BOOK_SCENES,sourcePage:37}]}
];
export const UP3_NODE_BY_ID=new Map(UP3_NODES.map(n=>[n.id,n]));
export const UP3_TOTAL_STARS=UP3_NODES.reduce((sum,n)=>sum+n.reward,0);
export const UP3_INCLUDED_PAGES=[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,37];
export const UP3_OFFLINE_PAGES=Array.from({length:16},(_,i)=>i+21);
