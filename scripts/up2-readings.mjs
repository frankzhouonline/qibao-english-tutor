// Whole-page preview and sentence imitation have separate, explicit bindings.
// Cut boundaries refer to the unchanged official page masters (seconds).
const root = './assets/audio/official/up2/';
const u2 = './assets/audio/official/unit2/';
const lines = (id, texts) => texts.map((text, i) => ({ id: `${id}-${i+1}`, text }));
const clips = (id, master, rows) => rows.map(([key,text,start,end,sceneIndex,sourceSegments]) => ({
  id:`${id}-${key}`,text,audioSrc:`${root}sentences/${id}-${key}${sourceSegments?'-model-v2':''}.mp3`,
  sourceAudioSrc:root+master+'.mp3',sourceStart:start,sourceEnd:end,sceneIndex,
  ...(sourceSegments?{sourceSegments,sourceSpeakerId:'kay-adult-model',audioKind:'official-model-edit'}:{})
}));
export const UP2_READINGS = {
  'room-sentences': [
    ['I put my books on the desk.',root+'read-room-books.mp3'],
    ['I can put the box on the desk.',u2+'line-i-can-put-box-on-desk.mp3'],
    ['Oh, no. Please put it under the bed.',u2+'line-oh-no-put-it-under-bed.mp3'],
    ["Mum ... Mum! Where’s my ball?",u2+'line-mum-wheres-my-ball.mp3'],
    ['What a mess!',u2+'line-what-a-mess.mp3'],
    ["Let’s tidy the room together.",u2+'line-lets-tidy-room-together.mp3'],
    ['OK. What about the toys? In the box?',u2+'line-ok-what-about-toys-in-box.mp3'],
    ["Yes, that’s right.",u2+'line-yes-thats-right.mp3'],
    ['All right.',u2+'line-all-right.mp3']
  ].map(([text,audioSrc],i)=>({id:`room-line-${i+1}`,text,audioSrc})),
  'long-a-sentence-1':[{id:'long-a-1-1',text:'Will David stay inside if it rains?',audioSrc:root+'phonics-sentence-item-01.mp3'}],
  'long-a-sentence-2':[{id:'long-a-2-1',text:'David and Ray may play with trains.',audioSrc:root+'phonics-sentence-item-02.mp3'}],
  'kay-story':clips('kay','story-kay',[
    ['1','It is a rainy day.',0,3.35,0],
    ['2','Kay waits for mail.',6.6,9.5,0],
    ['3','The mailman!',13.8,15.65,1],
    ['4','Kay gets crayons, paints, and clay!',18.7,22.85,1],
    // The master alternates model / child repetition at clause boundaries.
    // Join only the model clauses; a contiguous text-matching interval mixes voices.
    ['5','With paints and crayons, Kay makes a rail.',29.68,38.80,2,[
      {start:29.68,end:32.55,speakerId:'kay-adult-model',text:'With paints and crayons,'},
      {start:36.55,end:38.80,speakerId:'kay-adult-model',text:'Kay makes a rail.'}
    ]],
    ['6','With gray clay, Kay makes a gray train.',43.52,52.00,3,[
      {start:43.52,end:45.55,speakerId:'kay-adult-model',text:'With gray clay,'},
      {start:49.12,end:52.00,speakerId:'kay-adult-model',text:'Kay makes a gray train.'}
    ]],
    ['7','A gray train on the rail!',57.1,61.2,3],
    ['8','A happy rainy day!',65.45,68.4,3]
  ]),
  'snail-story':clips('snail','story-long-day',[
    ['1a','A crayon, some clay.',0.65,3.65,0],
    ['1b','The children play.',4.8,7.4,0],
    ['2a','This is the gray snail.',12.35,16.2,1],
    ['2b','He waits all day.',16.8,19.45,1],
    ['3a','The rain is wet.',31.3,33.95,2],
    ['3b','Where is the train?',35.55,38.3,2],
    ['4a','Here is the tray!',43.95,47.1,3],
    ['4b','The snail has mail!',50.7,53.6,3],
    ['4c','What a long day!',56.1,58.75,3]
  ]),
  'ray-p14':clips('ray14','story-p14',[
    ['1','Long ago, there lived a beaver named Ray.',0,3.2],
    ['2','Ray was quite proud of his nice, thick tail.',3.5,6.95],
    ['3','He spent a lot of time brushing and fluffing it.',7.15,11.15]
  ]),
  'ray-p15':clips('ray15','story-p15',[
    ['1','“I have a splendid tail,” Ray bragged.',0,3.55],
    ['2','“It is the best tail that an animal can have!”',3.6,7.1]
  ]),
  'ray-p16':clips('ray16','story-p16',[
    ['1','One fine day in April, Ray went out.',0,3.4],
    ['2','“It is a nice day to chop wood,” he said, so Ray got his axe.',3.7,9.35],
    ['3','He chopped, chopped, chopped a big tree eight times.',9.55,13.75]
  ]),
  'ray-p17':clips('ray17','story-p17',[
    ['1','The big tree swayed this way and that, then it fell on top of Ray’s tail.',0,7.4],
    ['2','Ray tugged and tugged at his tail.',8,11.25],
    ['3','He gasped when he pulled it out.',11.5,14.2]
  ]),
  'ray-p18':clips('ray18','story-p18',[
    ['1','“My tail is flat,” Ray wailed.',0,3.45],
    ['2','The sun looked down at him.',3.9,6.23],
    ['3','She could tell that Ray felt bad about his tail.',6.37,10.2]
  ]),
  'ray-p19':clips('ray19','story-p19',[
    ['1','“A flat tail will help you swim fast,” the sun explained.',0,5],
    ['2a','“A flat tail can send a signal too.”',5.5,8.8],
    ['2b','“Just slap it on the water.”',9,11.55],
    ['3','That made Ray happy.',12.3,14.7]
  ]),
  'ray-p20':clips('ray20','story-p20',[
    ['1','“I have a special tail,” yelled Ray.',0,3.25],
    ['2','Then Ray slapped his tail on the water.',3.8,6.9],
    ['3a','Slap, slap, slap.',7.07,8.8],
    ['3b','His pals came running.',9.15,11.05],
    ['4','“Do you want our help?” they asked.',11.4,14.2]
  ]),
  'ray-p21':clips('ray21','story-p21',[
    ['1','“I want to give you a ride,” said Ray.',0,2.95],
    ['2a','“Hop on my tail.”',3.1,4.7],
    ['2b','“I will carry you across the lake.”',4.85,7.6],
    ['3','And happy Ray swam off as fast as a fish.',8.1,12.05]
  ])
};
