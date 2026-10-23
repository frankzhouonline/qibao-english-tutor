import { EXTRA_READING_BOOKS } from './reading-extensions.mjs';
const SCENE_ROOT = "./assets/reading/scenes";
const AUDIO_ROOT = "./assets/reading/audio";

const page = (id, printedPage, text, audioFile, imageFile, imagePosition = "center") => Object.freeze({
  id,
  printedPage,
  text,
  audioSrc: `${AUDIO_ROOT}/${audioFile}`,
  imageSrc: imageFile.startsWith("./") ? imageFile : `${SCENE_ROOT}/${imageFile}`,
  imagePosition
});

const spread = (id, sourceSlide, layout, left, right, imageFile = "") => Object.freeze({
  id,
  sourceSlide,
  layout,
  imageSrc: imageFile ? `${SCENE_ROOT}/${imageFile}` : layout === "shared" && left.imageSrc === right.imageSrc ? left.imageSrc : "",
  pages: Object.freeze([left, right])
});

export const READING_BOOKS = Object.freeze([
  Object.freeze({
    id: "how-bat-got-its-wings",
    title: "How Bat Got Its Wings",
    genre: "Folktale",
    cover: "./assets/reading/how-bat-got-its-wings.png",
    spreads: Object.freeze([
      spread("how-bat-spread-01", 1, "paired",
        page("how-bat-p11-left", 11, "How Bat Got Its Wings.", "01_how-bat-p11-left.mp3", "./assets/reading/how-bat-got-its-wings.png", "center"),
        page("how-bat-p10-right", 10, "How do animals' bodies help them? Read about how a little bat got its wings.", "02_how-bat-p10-right.mp3", "scene-01-how-bat-intro.png", "64% center")),
      spread("how-bat-spread-02", 2, "shared",
        page("how-bat-p12-left", 12, "A long time ago, the animals had a big game of ball.", "03_how-bat-p12-left.mp3", "scene-02-how-bat-teams.png", "28% center"),
        page("how-bat-p13-right", 13, "They broke up into teams. One side had birds, or animals with wings. The other side had animals with legs. But they did not have wings.", "04_how-bat-p13-right.mp3", "scene-02-how-bat-teams.png", "74% center")),
      spread("how-bat-spread-03", 3, "shared",
        page("how-bat-p14-left", 14, "The animals who did not have wings were big and fast. They could toss a ball a long way and run like the wind.", "05_how-bat-p14-left.mp3", "scene-03-how-bat-strength-flight.png", "28% center"),
        page("how-bat-p15-right", 15, "The birds were fast but not as big. Yet with their wings, they could carry a ball way up in the air. The animals with legs could not jump up and grab it.", "06_how-bat-p15-right.mp3", "scene-03-how-bat-strength-flight.png", "74% center")),
      spread("how-bat-spread-04", 4, "shared",
        page("how-bat-p16-left", 16, "At last, game day came. The animals and birds met on the playing field. Both teams felt very excited. We will win, came the calls.", "07_how-bat-p16-left.mp3", "scene-04-how-bat-game-day.png", "70% center"),
        page("how-bat-p17-right", 17, "Just then, an animal with four very little legs stepped up. It was a gray bat. He went to the animals.", "08_how-bat-p17-right.mp3", "scene-04-how-bat-game-day.png", "35% center")),
      spread("how-bat-spread-05", 5, "shared",
        page("how-bat-p18-left", 18, "Can I play on this team? he asked. You are much too small to play, laughed the animals. And look at those little legs. We can't win with you.", "09_how-bat-p18-left.mp3", "scene-05-how-bat-rejected.png", "28% center"),
        page("how-bat-p19-right", 19, "Next, Gray Bat went to the birds. Can I play on this team? he asked. The birds shook their heads. Our team has wings, they explained.", "10_how-bat-p19-right.mp3", "scene-05-how-bat-rejected.png", "74% center")),
      spread("how-bat-spread-06", 6, "shared",
        page("how-bat-p20-left", 20, "Then Blue Jay spoke up. Maybe there is a way for Gray Bat to play with us. Tell us about it, said Raven. We can give him wings! said Blue Jay.", "11_how-bat-p20-left.mp3", "scene-06-how-bat-wings-made.png", "70% center"),
        page("how-bat-p21-right", 21, "So the birds took the skin off the top of a big drum. Then they took sticks and made special wings for Gray Bat.", "12_how-bat-p21-right.mp3", "scene-06-how-bat-wings-made.png", "36% center")),
      spread("how-bat-spread-07", 7, "shared",
        page("how-bat-p22-left", 22, "Let's see if he can fly, said Blue Jay. Gray Bat flapped his wings. He went zig and zag. He could not go in a line like a real bird.", "13_how-bat-p22-left.mp3", "scene-07-how-bat-test-flight.png", "34% center"),
        page("how-bat-p23-right", 23, "That's the best I can do, Gray Bat said and smiled. Just sit and wait until we need you, said the birds.", "14_how-bat-p23-right.mp3", "scene-07-how-bat-test-flight.png", "75% center")),
      spread("how-bat-spread-08", 8, "shared",
        page("how-bat-p24-left", 24, "At last, the game began. The animals and birds ran, jumped, and flew after the ball.", "15_how-bat-p24-left.mp3", "scene-08-how-bat-game-pressure.png", "72% center"),
        page("how-bat-p25-right", 25, "When the end of the game was close, the birds needed one more good play.", "16_how-bat-p25-right.mp3", "scene-08-how-bat-game-pressure.png", "34% center")),
      spread("how-bat-spread-09", 9, "shared",
        page("how-bat-p26-left", 26, "Just then, Gray Bat stood up. Let me help, he said. He flew up, up, up with his special wings. He grabbed the ball and carried it in his zig-zag way. The animals could not catch him.", "17_how-bat-p26-left.mp3", "scene-09-how-bat-climax.png", "35% center"),
        page("how-bat-p27-right", 27, "We win! yelled the birds. Gray Bat did it! To this day, Gray Bat plays on the bird team. He flies in his own way. And that is how the bat got wings.", "18_how-bat-p27-right.mp3", "scene-09-how-bat-climax.png", "70% center"))
    ])
  }),
  Object.freeze({
    id: "animal-teams",
    title: "Animal Teams",
    genre: "Nonfiction",
    cover: "./assets/reading/animal-teams.png",
    spreads: Object.freeze([
      spread("animal-teams-spread-01", 11, "shared",
        page("animal-teams-p38-left", 38, "Can a small bird help a big giraffe? Can a shrimp help a fish? Yes, they can!", "21_animal-teams-p38-left.mp3", "scene-11-animal-intro.png", "23% center"),
        page("animal-teams-p39-right", 39, "These may seem like odd friends. But many animals work together in teams. These animals help each other in lots of ways. Let's find out how.", "22_animal-teams-p39-right.mp3", "scene-11-animal-intro.png", "78% center")),
      spread("animal-teams-spread-02", 12, "shared",
        page("animal-teams-p40-left", 40, "Some birds live off the backs of big animals. Why do the animals let the birds stay? The birds help. They eat bugs off the animals' skin.", "23_animal-teams-p40-left.mp3", "scene-12-animal-birds-mammal.png", "38% center"),
        page("animal-teams-p41-right", 41, "The big animals help the birds, too. They keep the birds safe. And it is a good deal for them because they have lots of sweet bugs to eat!", "24_animal-teams-p41-right.mp3", "scene-12-animal-birds-mammal.png", "62% center"),
        "scene-12-animal-birds-mammal.png"),
      spread("animal-teams-spread-03", 13, "shared",
        page("animal-teams-p42-left", 42, "The goby fish and the blind shrimp are a team. The shrimp cannot see, so the goby helps. The goby can help the shrimp look for danger.", "25_animal-teams-p42-left.mp3", "scene-13-animal-goby-shrimp.png", "38% center"),
        page("animal-teams-p43-right", 43, "The shrimp can help goby fish too. The shrimp can make a house for them to hide.", "26_animal-teams-p43-right.mp3", "scene-13-animal-goby-shrimp.png", "72% center")),
      spread("animal-teams-spread-04", 14, "shared",
        page("animal-teams-p44-left", 44, "Zebras and wildebeests live together. They like to eat grass all day. The zebras can help the wildebeest look for grass.", "27_animal-teams-p44-left.mp3", "scene-14-animal-zebra-wildebeest.png", "36% center"),
        page("animal-teams-p45-right", 45, "The wildebeest can also help the zebra be safe. If they see a scary animal, it can run away.", "28_animal-teams-p45-right.mp3", "scene-14-animal-zebra-wildebeest.png", "68% center"),
        "scene-14-animal-zebra-wildebeest.png"),
      spread("animal-teams-spread-05", 15, "shared",
        page("animal-teams-p46-left", 46, "The clown fish and sea anemone are a team too. The clown fish can chase away big fish that want to eat the sea anemone.", "29_animal-teams-p46-left.mp3", "scene-15-animal-clownfish-anemone.png", "36% center"),
        page("animal-teams-p47-right", 47, "The sea anemone helps the fish too. The sea anemone helps the fish have a safe home.", "30_animal-teams-p47-right.mp3", "scene-15-animal-clownfish-anemone.png", "68% center"),
        "scene-15-animal-clownfish-anemone.png"),
      spread("animal-teams-spread-06", 16, "shared",
        page("animal-teams-p48-left", 48, "The ant and the caterpillar make a good team. The ants help keep the caterpillar safe from bigger bugs.", "31_animal-teams-p48-left.mp3", "scene-16-animal-ant-caterpillar.png", "68% center"),
        page("animal-teams-p49-right", 49, "The ants are happy too. The ants can drink a sweet water on the caterpillar's body.", "32_animal-teams-p49-right.mp3", "scene-16-animal-ant-caterpillar.png", "28% center")),
      spread("animal-teams-spread-07", 17, "shared",
        page("animal-teams-p50-left", 50, "When a cleaner fish wants to eat, it looks for a bigger fish. The cleaner fish helps clean the big fish. It can eat the dirt on the fish's body.", "33_animal-teams-p50-left.mp3", "scene-17-animal-cleaner-fish.png", "35% center"),
        page("animal-teams-p51-right", 51, "The cleaner fish is happy too. He can get some food to eat.", "34_animal-teams-p51-right.mp3", "scene-17-animal-cleaner-fish.png", "68% center"),
        "scene-17-animal-cleaner-fish.png"),
      spread("animal-teams-spread-08", 18, "shared",
        page("animal-teams-p52-left", 52, "One is big, and one is small. But the two are a team.", "35_animal-teams-p52-left.mp3", "scene-18-animal-wrap.png", "34% center"),
        page("animal-teams-p53-right", 53, "When animals team up, they do what is best for both of them.", "36_animal-teams-p53-right.mp3", "scene-18-animal-wrap.png", "68% center"),
        "scene-18-animal-wrap.png")
    ])
  }),
  Object.freeze({
    id: "busy-as-a-bee",
    title: "Busy as a Bee",
    genre: "Nonfiction",
    cover: "./assets/reading/busy-as-a-bee.png",
    spreads: Object.freeze([
      spread("busy-bee-spread-01", 19, "shared",
        page("busy-bee-p56-left", 56, "Bees can make a hive in a tree. Bees are at home in a hive. All of them have jobs that help the hive.", "37_busy-bee-p56-left.mp3", "scene-19-busy-worker-hive.png", "26% center"),
        page("busy-bee-p57-right", 57, "Worker bees make wax cups called honeycombs. Lots of worker bees help make honey. They help keep the hive clean, too.", "38_busy-bee-p57-right.mp3", "scene-19-busy-worker-hive.png", "74% center")),
      spread("busy-bee-spread-02", 21, "shared",
        page("busy-bee-p58-left", 58, "Every hive has a queen bee. She lays all the eggs. A hive has drone bees, too. A drone's job is to help the queen make eggs. A queen bee is with her drones in the hive.", "39_busy-bee-p58-left.mp3", "scene-20-busy-queen-eggs.png", "30% center"),
        page("busy-bee-p59-right", 59, "The queen lays eggs inside wax cups. New bees hatch from these eggs. Worker bees feed them. A big hive is a busy place! How are the bees like the animals in Animal Teams?", "40_busy-bee-p59-right.mp3", "scene-20-busy-queen-eggs.png", "72% center"))
    ])
  }),
  ...EXTRA_READING_BOOKS
]);

export const READING_BOOK_BY_ID = new Map(READING_BOOKS.map(book => [book.id, book]));

export function createReadingState() {
  return {
    books: Object.fromEntries(READING_BOOKS.map(book => [book.id, {
      spreadIndex: 0,
      viewedSpreadIds: [],
      reachedEndAt: 0,
      recordingIds: {},
      ...(book.semantic ? {questionEvidence:Object.fromEntries(book.questions.map(q=>[q.id,{saidAt:0,referenceAt:0,lookedBackAt:0}]))} : {})
    }]))
  };
}

export function normalizeReadingState(value = {}) {
  const fresh = createReadingState();
  for (const book of READING_BOOKS) {
    const incoming = value?.books?.[book.id] || {};
    const validSpreadIds = new Set(book.spreads.map(item => item.id));
    const validPageIds = new Set([...book.spreads.flatMap(item => item.pages.map(itemPage => itemPage.id)), ...(book.questions || []).map(q=>q.id)]);
    fresh.books[book.id] = {
      spreadIndex: Math.min(book.spreads.length - 1, Math.max(0, Math.trunc(Number(incoming.spreadIndex) || 0))),
      viewedSpreadIds: [...new Set(Array.isArray(incoming.viewedSpreadIds) ? incoming.viewedSpreadIds.filter(id => validSpreadIds.has(id)) : [])],
      reachedEndAt: Math.max(0, Number(incoming.reachedEndAt) || 0),
      recordingIds: Object.fromEntries(Object.entries(incoming.recordingIds || {}).filter(([id, recordId]) => validPageIds.has(id) && recordId)),
      ...(book.semantic ? {questionEvidence:Object.fromEntries((book.questions||[]).map(q=>[q.id,Object.fromEntries(['saidAt','referenceAt','lookedBackAt'].map(key=>[key,Math.max(0,Number(incoming.questionEvidence?.[q.id]?.[key])||0)]))]))} : {})
    };
  }
  return fresh;
}

export function readingProgress(reading) {
  const normalized = normalizeReadingState(reading);
  const completedUnits = READING_BOOKS.filter(book => normalized.books[book.id].reachedEndAt > 0).length;
  return {
    completedUnits,
    totalUnits: READING_BOOKS.length,
    percent: Math.round(completedUnits / READING_BOOKS.length * 100)
  };
}

export function readingPageById(book, pageId) {
  return [...(book?.spreads.flatMap(item => item.pages) || []), ...(book?.questions || [])].find(item => item.id === pageId) || null;
}
