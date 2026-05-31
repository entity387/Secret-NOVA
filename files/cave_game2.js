// ═══════════════════════════════════════════════════════════
// CAVE ADVENTURE II — NORTH
// cave_game2.js
// ═══════════════════════════════════════════════════════════

const output     = document.getElementById('output');
const inputField = document.getElementById('inputField');
const achCount   = document.getElementById('achCount');
const titleArtEl = document.getElementById('titleArt');

titleArtEl.textContent =
` ████████╗██╗  ██╗███████╗    ██████╗  ██████╗  █████╗ ██████╗
    ██╔══╝██║  ██║██╔════╝    ██╔══██╗██╔═══██╗██╔══██╗██╔══██╗
    ██║   ███████║█████╗      ██████╔╝██║   ██║███████║██║  ██║
    ██║   ██╔══██║██╔══╝      ██╔══██╗██║   ██║██╔══██║██║  ██║
    ██║   ██║  ██║███████╗    ██║  ██║╚██████╔╝██║  ██║██████╔╝
    ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝
   ██╗  ██╗ ██████╗ ███╗   ███╗███████╗
   ██║  ██║██╔═══██╗████╗ ████║██╔════╝
   ███████║██║   ██║██╔████╔██║█████╗
   ██╔══██║██║   ██║██║╚██╔╝██║██╔══╝
   ██║  ██║╚██████╔╝██║ ╚═╝ ██║███████╗
   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝
  S O M E O N E   L I K E   Y O U   ·   I I : T H E   R O A D   H O M E`;

// ── SAVE SYSTEM ───────────────────────────────────────────
const SAVE_KEY = 'novaCaveAch2';
function loadSaved(){ try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');}catch(_){return[];} }

// ── STATE ─────────────────────────────────────────────────
let lineQueue=[], isTyping=false, inputCallback=null, invalidCount=0;
let currentNarrator='narrator', achievements=[];
// Choices that carry through the game
let hasTakenCoin=false;
let calledAfterStranger=false;
let voicemailResponse='';
let homeFirst=false;
let athenaChoice='';
let isabelleScene1Choice='';
let almostToldIsabelle=false;
let floodConfessed=false;
let noteChoice='';
let narratorNameChoice='';

// ── NARRATOR SYSTEM ───────────────────────────────────────
const NS = {
  narrator: {
    cls:'narrator',
    invalid:["That isn't a path I can see from here.", "I don't recognise that choice.", "Something else, perhaps."]
  },
  gps: {
    cls:'gps',
    invalid:["Recalculating.", "Unable to process input. Please state your destination.", "Route not found. Try again."]
  },
  voicemail: {
    cls:'voicemail',
    invalid:["...that wasn't on the message.", "The voicemail doesn't have an answer for that.", "...beep."]
  },
  search: {
    cls:'search',
    invalid:["No results found for that query.", "Did you mean something else?", "Search returned 0 results."]
  },
  ticker: {
    cls:'ticker',
    invalid:["DEVELOPING: INPUT UNRECOGNISED —", "BREAKING: INVALID CHOICE DETECTED —", "UPDATE: OPTION NOT AVAILABLE —"]
  },
  demon: {
    cls:'demon',
    invalid:["...that isn't one of the options.", "...I'm afraid I can only work with what's in front of us.", "...try something else."]
  },
};

function N(line){ addLine(line, NS[currentNarrator].cls, 140); }
function hazel(line){ addLine(line,'hazel',100); }
function isabelle(line){ addLine(line,'isabelle',100); }

function addLine(text,cls='narrator',delay=0){
  lineQueue.push({text,cls,delay});
  if(!isTyping)processQueue();
}
function processQueue(){
  if(!lineQueue.length){isTyping=false;return;}
  isTyping=true;
  const{text,cls,delay}=lineQueue.shift();
  setTimeout(()=>{
    const el=document.createElement('div');
    el.className='line '+cls; el.textContent=text;
    output.appendChild(el);
    while(output.children.length>Math.floor(((window.visualViewport ? window.visualViewport.height : window.innerHeight) - 220)/(window.innerWidth < 600 ? 48 : 36)))output.removeChild(output.firstChild);
    processQueue();
  },delay);
}
function clearScreen(cb){
  output.style.transition='opacity 0.3s'; output.style.opacity='0';
  setTimeout(()=>{output.innerHTML='';output.style.opacity='1';if(cb)cb();},320);
}
function divider(){ addLine('─'.repeat(60),'divider',80); }
function artPrint(t){ addLine(t,'art',20); }
function sys(t){ addLine(t,'system',60); }
function blank(){ addLine('','system',40); }

function unlockAchievement(name,rarity){
  achievements.push({name,rarity});
  const all=loadSaved();
  if(!all.find(a=>a.name===name)){
    all.push({name,rarity,unlockedAt:Date.now()});
    localStorage.setItem(SAVE_KEY,JSON.stringify(all));
  }
  updateAchievementPanel();
  addLine(`[+ ACHIEVEMENT: ${name.toUpperCase()} (${rarity.toUpperCase()}) +]`,'achievement',180);
}

function askChoice(validKeys,cb){
  const valid=new Set(validKeys);
  inputCallback=(val)=>{
    if(val===''&&validKeys.includes('')){clearAndRun(()=>cb(''));return;}
    if(val==='hello there'){addLine('General Kenobi.','system',0);setTimeout(()=>askChoice(validKeys,cb),500);return;}
    if(valid.has(val)){
      invalidCount=0;
      setTimeout(()=>clearAndRun(()=>cb(val)),300);
    } else {
      invalidCount++;
      if(invalidCount>=3){
        invalidCount=0;
        setTimeout(()=>clearAndRun(narratorMeltdown),300);
      } else {
        const inv=NS[currentNarrator].invalid;
        addLine(inv[Math.floor(Math.random()*inv.length)],'system',0);
        setTimeout(()=>askChoice(validKeys,cb),400);
      }
    }
  };
}

function clearAndRun(fn){
  clearScreen(()=>{lineQueue=[];isTyping=false;fn();});
}

function cont(fn){
  blank();
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
  askChoice([''],(_)=>clearAndRun(fn));
}

// ── NARRATOR MELTDOWN ─────────────────────────────────────
function narratorMeltdown(){
  unlockAchievement("Tested the GPS","rare");
  artPrint(`
  ██████████████████████████████████
  █  NARRATOR SYSTEM: CRITICAL     █
  █  ERROR — PATIENCE DEPLETED     █
  ██████████████████████████████████`);
  divider();
  if(currentNarrator==='gps'){
    addLine("RECALCULATING.","gps",140);
    addLine("RECALCULATING.","gps",140);
    addLine("RECALCULATING.","gps",140);
    addLine("I have no route for this. I have never had a route for this.","gps",140);
    addLine("Please make a legal U-turn when possible. Goodbye.","gps",140);
  } else if(currentNarrator==='ticker'){
    addLine("BREAKING: LOCAL NARRATOR REACHES ABSOLUTE LIMIT —","ticker",140);
    addLine("DEVELOPING: USER REFUSES ALL VALID OPTIONS FOR THIRD TIME —","ticker",140);
    addLine("UPDATE: TICKER SIGNING OFF. THIS IS UNPRECEDENTED.","ticker",140);
  } else if(currentNarrator==='demon'){
    addLine("...I came here to ask three questions.","demon",140);
    addLine("...not to be ignored three times.","demon",140);
    addLine("...goodnight, Hazel.","demon",140);
  } else {
    N("You know, I have narrated a great many things.");
    N("Caves. Crossroads. A giant who wouldn't wake up.");
    N("But this — this is new.");
    N("I'm going to need a moment.");
  }
  cont(playAgain);
}

// ═══════════════════════════════════════════════════════════
// SCENE 1 — THE EXIT
// ═══════════════════════════════════════════════════════════
function scene1(){
  currentNarrator='narrator';
  artPrint(`
        . . . . . [CAVE EXIT] . . . . .
       .                               .
      .   dawn.  cold.  letter.         .
       .                               .
        . . . . . . . . . . . . . . . .`);
  divider();
  N("Dawn. The kind that hasn't decided yet whether it wants to be grey or gold.");
  N("Hazel steps out of the cave.");
  N("Three days. No memory of them. Just the letter in her hand, and the particular stillness of someone who has just understood that something has changed.");
  blank();
  N("Her phone is dead.");
  N("Her boots are damp.");
  N("She has been coming to this cave since she was eleven years old and it has never spoken to her before.");
  blank();
  N("Hazel.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ...how do you know my name.",'prompt',80);
  addLine("  2. great. a voice.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("...how do you know my name.");
      setTimeout(()=>{
        N("I know a great many things about this cave.");
        N("...");
        N("You should start walking. It's thirty minutes back to the village.");
        unlockAchievement("First Question","rare");
      },400);
    } else if(c==='2'){
      hazel("great. a voice.");
      setTimeout(()=>{
        N("Yes. I imagine that's surprising.");
        N("You should start walking. It's thirty minutes back to the village.");
      },400);
    } else {
      hazel("...");
      setTimeout(()=>{
        N("...");
        N("Thirty minutes back to the village. When you're ready.");
        unlockAchievement("The Silent Type","common");
      },400);
    }
    cont(scene2_coin);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 2A — THE COIN
// ═══════════════════════════════════════════════════════════
function scene2_coin(){
  currentNarrator='narrator';
  artPrint(`
       ___
      /   \\
     |  ?  |
      \\___/
   [both sides the same]`);
  divider();
  N("Just outside the cave mouth. Before she's properly left.");
  N("A coin on the ground. Sitting too deliberately to be random.");
  N("She picks it up. Both sides identical. No markings. No heads. No tails.");
  N("No way to know which side is which.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. pocket it.",'prompt',80);
  addLine("  2. leave it.",'prompt',80);
  addLine("  3. ...how long has that been there.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("pocket it");
      hasTakenCoin=true;
      try{const d=JSON.parse(localStorage.getItem('sly_save')||'{}');d.coin=true;localStorage.setItem('sly_save',JSON.stringify(d));}catch(_){}
      N("She puts it in her jacket pocket.");
      N("It's lighter than it looks.");
    } else if(c==='2'){
      hazel("leave it");
      hasTakenCoin=false;
      try{const d=JSON.parse(localStorage.getItem('sly_save')||'{}');d.coin=false;localStorage.setItem('sly_save',JSON.stringify(d));}catch(_){}
      N("She leaves it. Walks past it.");
      N("Doesn't look back.");
      N("Some things are better left where they are.");
    } else {
      hazel("...how long has that been there.");
      hasTakenCoin=true;
      N("...");
      N("She pockets it anyway. Just in case the answer matters.");
      unlockAchievement("Good Question","rare");
    }
    cont(scene2_stranger);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 2B — THE STRANGER
// ═══════════════════════════════════════════════════════════
function scene2_stranger(){
  currentNarrator='gps';
  artPrint(`
   [YOU] ────────── road ──────────── [VILLAGE]
                      ↑
               [STRANGER passing]`);
  divider();
  addLine("Continue on current route. Estimated arrival: 28 minutes.","gps",140);
  addLine("Note: unrecognised pedestrian approaching from the north.","gps",140);
  blank();
  N("A figure on the road. Walking toward her, from the direction of the village. They look at her as they pass.");
  N("Not hostile. Something more like recognition.");
  N("They don't stop.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. keep walking.",'prompt',80);
  addLine("  2. hey—",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("keep walking");
      addLine("Recalculating. Maintaining current route.","gps",140);
      N("She keeps walking. The stranger doesn't look back.");
      N("Some encounters are better left as what they almost were.");
    } else if(c==='2'){
      hazel("hey—");
      calledAfterStranger=true;
      blank();
      N("They stop. Don't turn around.");
      blank();
      N("The door with no wall.");
      N("You'll recognise it when you see it.");
      blank();
      N("They keep walking. Gone before she can respond.");
      blank();
      addLine("Recalculating.","gps",140);
      addLine("Unrecognised pedestrian has left the route.","gps",140);
      blank();
      addLine("Options: 1 / 2 / 3",'prompt',220);
      askChoice(['...what','run after them','just stand there'],(c2)=>{
        if(c2==='run after them'){
          hazel("wait—");
          N("She runs. They're already gone. The road is empty.");
          N("She stands there for a moment. Thirty seconds. Then keeps walking.");
          unlockAchievement("Too Slow","common");
        } else if(c2==='...what'){
          hazel("...what.");
          N("Nobody answers. The road is empty.");
        } else {
          hazel("...");
          N("She stands there. Files it away. Keeps walking.");
        }
        cont(scene2_voicemail);
      });
      return;
    } else {
      hazel("...");
      N("She watches them go. Files the face away.");
      addLine("Continuing on route.","gps",140);
    }
    cont(scene2_voicemail);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 2C — THE VOICEMAIL
// ═══════════════════════════════════════════════════════════
function scene2_voicemail(){
  currentNarrator='voicemail';
  artPrint(`
   ┌─────────────────────────────┐
   │  1 NEW VOICEMAIL            │
   │  unknown number             │
   │  received: 3 days ago       │
   └─────────────────────────────┘`);
  divider();
  addLine("Her phone flickers on. One bar. Battery at 3%.","system",140);
  addLine("One voicemail.","system",140);
  blank();
  addLine("Hazel. You read it. Good.","voicemail",220);
  addLine("Don't rush — but don't wait too long either.","voicemail",220);
  addLine("You'll know when it's time.","voicemail",220);
  blank();
  addLine("...","voicemail",300);
  blank();
  addLine("[ end of message ]","system",140);
  addLine("Phone dies immediately after. 0%.","system",140);
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ...okay.",'prompt',80);
  addLine("  2. who are you people.",'prompt',80);
  addLine("  3. mishka needs feeding.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    voicemailResponse=c;
    if(c==='1'){
      hazel("...okay.");
      addLine("She pockets the phone. Keeps walking.","system",140);
      N("...");
      N("She processes things quietly. Always has.");
    } else if(c==='2'){
      hazel("who are you people.");
      addLine("No answer. The phone is dead.","system",140);
      N("The road doesn't have an answer either.");
      N("She keeps walking.");
      unlockAchievement("Reasonable Response","rare");
    } else {
      hazel("mishka needs feeding.");
      addLine("She pockets the phone. Keeps walking.","system",140);
      N("...");
      N("She changes the subject. Even when there's no one to change it with.");
      N("The narrator notes this.");
      unlockAchievement("Correct Priorities (Part One)","rare");
    }
    cont(scene3_village);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 3 — THE VILLAGE
// ═══════════════════════════════════════════════════════════
function scene3_village(){
  currentNarrator='ticker';
  artPrint(`
   ════════════════════════════════════════
   BREAKING: LOCAL RESIDENT RETURNS AFTER
   THREE-DAY DISAPPEARANCE — MORE SOON
   ════════════════════════════════════════`);
  divider();
  addLine("DEVELOPING: HAZEL REACHES VILLAGE EDGE — LOCALS NOTICE —","ticker",140);
  blank();
  N("Early morning. Not many people about. But enough.");
  N("She has walked this road her whole life. The village has always looked at her a certain way.");
  N("Today is not different.");
  blank();
  N("A neighbour. Older. Standing outside. They see her.");
  N("That look. The particular small-town look that says: you don't quite fit here.");
  blank();
  N("'You were missing.'");
  N("Not a question.");
  blank();
  N("And then — deliberately, the way some people do it deliberately —");
  N("the wrong name. the wrong word.");
  blank();
  N("She goes quiet.");
  N("The way she always goes quiet.");
  N("Not because she doesn't have something to say.");
  N("Because it isn't worth the energy. Because she knows exactly what it is.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. wasn't missing. knew exactly where i was.",'prompt',80);
  addLine("  2. morning.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){
      hazel("wasn't missing. knew exactly where i was.");
      addLine("UPDATE: LOCAL RESIDENT RESPONDS WITH CHARACTERISTIC DRY TONE —","ticker",140);
      N("The neighbour watches her walk away.");
    } else if(c==="2"){
      hazel("morning.");
      addLine("UPDATE: MINIMAL ENGAGEMENT STRATEGY DEPLOYED —","ticker",140);
      N("She walks straight past.");
      N("Clean. Efficient. Very Hazel.");
    } else {
      hazel("...");
      addLine("UPDATE: LOCAL RESIDENT DECLINES TO COMMENT —","ticker",140);
      N("She doesn't stop. The neighbour watches her go.");
    }
    blank();
    N("She doesn't think about it again.");
    N("She has had a lot of practice not thinking about it again.");
    cont(scene3_chooseOrder);
  });
}

function scene3_chooseOrder(){
  currentNarrator='narrator';
  N("The village sits around her. She knows every street.");
  N("Two things she needs to do. The order is hers to choose.");
  blank();
  addLine("Options: go home first / find isabelle first",'prompt',220);
  askChoice(['go home first','find isabelle first'],(c)=>{
    homeFirst=(c==='go home first');
    if(homeFirst){
      N("Home first. A moment to collect herself before anything else.");
      clearAndRun(scene3_home);
    } else {
      N("Isabelle first. Still raw from the road. That's going to be something.");
      clearAndRun(scene4_isabelle);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 3 — HOME
// ═══════════════════════════════════════════════════════════
function scene3_home(){
  currentNarrator='narrator';
  artPrint(`
   [ flat 14 ]
   ────────────────────
   mishka: present
   athena: running (72h)
   letter: pocket`);
  divider();
  N("The flat. Second floor. The key is where she always leaves it.");
  blank();
  N("Mishka is on the keyboard.");
  N("Athena is running. Has been for seventy two hours. The fans are slightly louder than usual.");
  N("The room smells like the same room it's always been.");
  blank();
  N("Hazel stands in the doorway for a moment.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. sit at athena first.",'prompt',80);
  addLine("  2. find mishka first.",'prompt',80);
  addLine("  3. read the letter again.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    athenaChoice=c;
    if(c==='1'){
      hazel("sit at athena first");
      blank();
      N("She sits down. Doesn't open anything.");
      N("Just the glow. The hum of the fans. The water cooling doing its quiet work.");
      N("Mishka moves from the keyboard to her lap without being asked.");
      blank();
      N("...");
      N("...you've been gone seventy two hours.");
      blank();
      addLine("Options: 1 / 2 / 3",'prompt',220);
      addLine("  1. she's fine.",'prompt',80);
      addLine("  2. i know.",'prompt',80);
      addLine("  3. don't.",'prompt',80);
      askChoice(['1','2','3'],(c2)=>{
        if(c2==='1'){
          hazel("she's fine.");
          N("...");
          N("Yes.");
          N("She is.");
        } else if(c2==='2'){
          hazel("i know.");
          N("She runs a hand along the case. Just for a second.");
        } else {
          hazel("don't.");
          N("...");
          N("He doesn't.");
          N("The first time she's told him to back off. He does. Immediately.");
          N("That's strange. She files it away.");
          unlockAchievement("Don't","secret");
        }
        cont(homeFirst?scene3_villageMoments:scene4_isabelle);
      });
    } else if(c==='2'){
      hazel("find mishka first");
      N("Mishka is on the keyboard. Hazel picks her up.");
      N("Mishka tolerates this for approximately four seconds.");
      N("Then wants to be put down.");
      N("Hazel puts her down. Watches her walk away with the complete indifference of a creature who has never once worried about anything.");
      blank();
      N("She's been gone three days.");
      N("Mishka's bowl was empty. There's evidence she knocked something off the counter.");
      N("Mishka is unbothered.");
      blank();
      unlockAchievement("Mishka Was Fine","common");
      cont(homeFirst?scene3_villageMoments:scene4_isabelle);
    } else {
      hazel("read the letter again");
      blank();
      N("She takes it out. Reads it.");
      N("She already knows what it says. She reads it anyway.");
      blank();
      N("...");
      N("Some things need to be read more than once before they're real.");
      blank();
      unlockAchievement("Read It Again","common");
      cont(homeFirst?scene3_villageMoments:scene4_isabelle);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 3 — VILLAGE MOMENTS
// ═══════════════════════════════════════════════════════════
function scene3_villageMoments(){
  currentNarrator='ticker';
  artPrint(`
   ════════════════════════════════════════
   UPDATE: HAZEL VENTURES OUT — THREE
   ENCOUNTERS AHEAD — DEVELOPING STORY
   ════════════════════════════════════════`);
  divider();
  addLine("She needs food. Athena needs a fan filter she's been putting off for two weeks.","system",140);
  addLine("Normal things. But the village is the village.","system",140);
  cont(village_shop);
}

function village_shop(){
  currentNarrator='search';
  artPrint(`
   ┌───────────────────────────────────┐
   │  SEARCH: "where was hazel for     │
   │  three days"                      │
   │  — 0 results —                    │
   └───────────────────────────────────┘`);
  divider();
  addLine("The shop. The person behind the counter has known Hazel since she was small.","system",140);
  addLine("Not unkind. Just one of those people who asks questions that aren't really questions.","system",140);
  blank();
  N("'Three days. Where did you get to then?'");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. cave.",'prompt',80);
  addLine("  2. visiting someone.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("cave.");
      addLine("Search: 'hazel's cave' — no results","search",140);
      addLine("Search: 'cave near village' — 1 result (local listing, last updated 4 years ago)","search",140);
      N("Short answer. True answer. She puts money on the counter and leaves.");
    } else if(c==='2'){
      hazel("visiting someone.");
      N("Not true. Easier.");
      addLine("Search: 'is it okay to lie to avoid small talk' — 847,000 results","search",140);
      N("The narrator notes it. Doesn't judge.");
      unlockAchievement("Easier That Way","common");
    } else {
      hazel("...");
      N("She puts the money on the counter. Takes the bag. Leaves.");
      addLine("Search: '...' — did you mean something? — no","search",140);
    }
    cont(village_group);
  });
}

function village_group(){
  currentNarrator='ticker';
  blank();
  addLine("DEVELOPING: GROUP OF LOCALS SPOT HAZEL — SITUATION UNFOLDING —","ticker",140);
  blank();
  N("A group her age. Standing outside. They see her.");
  N("One of them says something to the others.");
  N("She catches the tail end of it. Not loud enough to hear properly. Loud enough to know.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. keep walking.",'prompt',80);
  addLine("  2. stop and look back.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("keep walking");
      addLine("UPDATE: HAZEL MAINTAINS COMPOSURE — HAS DONE THIS HER WHOLE LIFE —","ticker",140);
      N("She keeps walking. She's been doing this her whole life.");
      N("Doesn't make it easier. Just familiar.");
    } else if(c==='2'){
      hazel("stop and look back");
      addLine("BREAKING: LOCAL RESIDENT REFUSES TO BE INVISIBLE — MORE AT ELEVEN —","ticker",140);
      N("She stops. Turns. Just looks at them. Just so they know she heard.");
      N("A beat. Then she walks on.");
      N("Not a victory. Not a defeat. Just: I'm still here.");
      unlockAchievement("Still Here","rare");
    } else {
      hazel("...");
      N("She keeps moving. Files it.");
      addLine("UPDATE: SITUATION RESOLVES WITHOUT INCIDENT —","ticker",140);
    }
    cont(village_kindPerson);
  });
}

function village_kindPerson(){
  currentNarrator='narrator';
  blank();
  N("An older woman. Two streets over. Always been quietly kind to Hazel in the way that costs nothing but means everything in a place like this.");
  blank();
  N("She sees Hazel. Doesn't make a thing of the three days.");
  blank();
  N("'Good to see you back. You look tired.'");
  blank();
  N("Just that.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. thanks.",'prompt',80);
  addLine("  2. i'm fine.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("thanks.");
      N("Genuine. She means it.");
      N("The narrator notes this one differently. Something warmer in how he describes the street.");
    } else if(c==='2'){
      hazel("i'm fine.");
      N("The woman nods. Doesn't push.");
      N("Some kindness doesn't need a perfect response.");
    } else {
      hazel("...");
      N("A small nod. She keeps walking.");
      N("The woman watches her go without judgement.");
    }
    unlockAchievement("One Decent Person","rare");
    cont(homeFirst?scene4_isabelle:scene3_home);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 4 — ISABELLE
// ═══════════════════════════════════════════════════════════
function scene4_isabelle(){
  currentNarrator='narrator';
  artPrint(`
   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
        isabelle has been here
        she left two voicemails
        she came by twice
        she left a note under the door
   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─`);
  divider();
  N("Isabelle knocks.");
  N("Eight years of friendship. She knocks like she's been waiting at the door the whole time Hazel was gone. Because she has.");
  blank();
  N("Hazel opens it.");
  blank();
  N("Isabelle looks at her for a second.");
  blank();
  isabelle("you absolute idiot.");
  blank();
  N("She hugs her. Before Hazel can say anything.");
  N("The narrator goes completely quiet.");
  blank();
  addLine("[ PRESS ENTER ]",'prompt',220);
  askChoice([''],(_)=>{
    clearAndRun(()=>{
      currentNarrator='narrator';
      addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ..sorry.",'prompt',80);
  addLine("  2. i'm fine isabelle.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    isabelleScene1Choice=c;
    if(c==='1'){
      hazel("..sorry.");
      blank();
      N("...");
      N("Isabelle doesn't let go for a while.");
    } else if(c==='2'){
      hazel("i'm fine isabelle.");
      N("She says it into her shoulder.");
      isabelle("i know. that's not the point.");
    } else {
      hazel("...");
      N("She just lets it happen. Doesn't pull away.");
      N("The narrator stays quiet.");
      unlockAchievement("Accepted","rare");
    }
    cont(isabelle_whereWereYou);
    });
    });
  });
}

function isabelle_whereWereYou(){
  currentNarrator='narrator';
  isabelle("where were you.");
  blank();
  N("Not angry. Just — needing to know.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. the cave.",'prompt',80);
  addLine("  2. i can't explain it properly.",'prompt',80);
  addLine("  3. ...there's something i need to tell you.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("the cave.");
      isabelle("...three days?");
      hazel("..yeah.");
      N("Isabelle looks at her. Decides to accept it for now.");
    } else if(c==='2'){
      hazel("i can't explain it properly.");
      isabelle("...okay.");
      isabelle("are you okay though.");
      hazel("...yeah. i think so.");
    } else {
      hazel("...there's something i need to tell you.");
      blank();
      N("She stops herself.");
      N("Changes it to something smaller.");
      blank();
      hazel("i'm okay. i was in the cave. i'm okay.");
      blank();
      isabelle("...");
      N("Isabelle noticed the hesitation. Doesn't push.");
      N("That moment of almost costs Hazel something. The player feels it.");
      almostToldIsabelle=true;
      try{const d=JSON.parse(localStorage.getItem('sly_save')||'{}');d.almost_told=true;localStorage.setItem('sly_save',JSON.stringify(d));}catch(_){}
      unlockAchievement("Almost","epic");
    }
    cont(isabelle_tea);
  });
}

function isabelle_tea(){
  currentNarrator='narrator';
  N("Isabelle makes tea. Doesn't ask where things are because she knows.");
  N("Mishka immediately goes to her.");
  N("Traitor.");
  blank();
  isabelle("why do you keep going to that cave.");
  blank();
  N("Not accusing. Genuinely asking. The kind of question you only ask someone after eight years.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. it's quiet. nobody looks at me like i don't belong there.",'prompt',80);
  addLine("  2. i've been going since i was a kid. it was just mine.",'prompt',80);
  addLine("  3. ...i don't know. it felt like it was waiting for me.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==="1"){
      hazel("it's quiet. nobody looks at me like i don't belong there.");
      blank();
      N("Isabelle goes quiet for a moment.");
      isabelle("...i know.");
      isabelle("i'm sorry it's like that.");
      blank();
      N("Hazel doesn't answer. Doesn't need to.");
      unlockAchievement("Said It Out Loud","epic");
    } else if(c==="2"){
      hazel("i've been going since i was a kid. it was just mine.");
      blank();
      isabelle("yeah.");
      isabelle("everyone needs somewhere.");
      blank();
      N("She says it simply. Like it's obvious. Because to her it is.");
    } else {
      hazel("...i don't know. it felt like it was waiting for me.");
      blank();
      N("She doesn't realise how true that is when she says it.");
      blank();
      isabelle("...that's kind of beautiful and kind of terrifying.");
      hazel("yeah.");
    }
    cont(isabelle_door);
  });
}

function isabelle_door(){
  currentNarrator='narrator';
  N("Isabelle is about to leave. She's at the door.");
  N("She turns back.");
  blank();
  isabelle("i'm glad you're back.");
  blank();
  N("Not quite what she means. But close.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ...me too.",'prompt',80);
  addLine("  2. don't go yet.",'prompt',80);
  addLine("  3. isabelle—",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("...me too.");
      N("Isabelle smiles. Small. Real.");
      N("She leaves.");
    } else if(c==='2'){
      hazel("don't go yet.");
      blank();
      N("Isabelle stops. Looks at her properly.");
      isabelle("...okay.");
      blank();
      N("She comes back in. They sit.");
      N("It's another hour before she goes. Neither of them minds.");
      unlockAchievement("Don't Go Yet","legendary");
    } else {
      hazel("isabelle—");
      blank();
      N("She stops. Isabelle waits.");
      blank();
      hazel("...nothing. see you tomorrow.");
      blank();
      isabelle("...yeah. see you tomorrow.");
      blank();
      N("That one stays in the room after she's gone.");
      unlockAchievement("Said Nothing","epic");
    }
    cont(isabelle_after);
  });
}

function isabelle_after(){
  currentNarrator='narrator';
  N("Isabelle is gone.");
  N("Just Hazel. Mishka on the sofa. Athena humming. The letter on the desk.");
  blank();
  N("She would have listened, you know.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  askChoice(['i know.','stay out of it.','...'],(c)=>{
    narratorNameChoice=c;
    if(c==='i know.'){
      hazel("i know.");
      N("...");
    } else if(c==='2'){
      hazel("stay out of it.");
      N("...");
      N("He does.");
    } else {
      hazel("...");
      N("The flat settles around her.");
    }
    cont(scene5_night);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 5 — NIGHT / THE DEMON
// ═══════════════════════════════════════════════════════════
function scene5_night(){
  currentNarrator='demon';
  artPrint(`
         3:17 AM
   ─────────────────────
   mishka: foot of bed
   athena: off (or almost)
   room: very still`);
  divider();
  addLine("The room goes the particular kind of still that only happens at 3am.","system",180);
  blank();
  addLine("Then the Sleep Paralysis Demon appears.","system",180);
  blank();
  addLine("Very polite. Sits at the edge of the bed near Mishka.","system",140);
  addLine("Mishka acknowledges it with the mild interest of a cat who has seen everything.","system",140);
  blank();
  addLine('[ PRESS ENTER ]','prompt',220);
  askChoice([''],(_)=>{
    clearAndRun(()=>{
      currentNarrator='demon';
      N("Oh. It's you.");
      blank();
      addLine("...Hello again.","demon",220);
      blank();
      N("They know each other. The narrator doesn't explain this.");
      blank();
      addLine("...I have three questions. As always.","demon",220);
      blank();
      cont(demon_q1);
    });
  });
}

function demon_q1(){
  currentNarrator='demon';
  addLine("...Are you frightened?","demon",220);
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. of you?",'prompt',80);
  addLine("  2. ...no.",'prompt',80);
  addLine("  3. i don't know yet.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("of you?");
      addLine("...Not particularly, no. I mean in general.","demon",220);
    } else if(c==='2'){
      hazel("...no.");
      addLine("...","demon",220);
      addLine("...That's not entirely true, is it.","demon",220);
      hazel("...no.");
    } else {
      hazel("i don't know yet.");
      addLine("...That's the most honest answer. I appreciate it.","demon",220);
    }
    cont(demon_q2);
  });
}

function demon_q2(){
  currentNarrator='demon';
  addLine("...The letter. Did it say what you expected?","demon",220);
  blank();
  N("The first time anyone has directly acknowledged the letter.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. how do you know about that.",'prompt',80);
  addLine("  2. no.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("how do you know about that.");
      addLine("...","demon",220);
      addLine("...I know things that happen at 3am. Most things happen at 3am.","demon",220);
      unlockAchievement("3am Knows Everything","secret");
    } else if(c==='2'){
      hazel("no.");
      addLine("...No?","demon",220);
      hazel("i didn't think it would know my name.");
      addLine("...Ah.","demon",220);
    } else {
      hazel("...");
      addLine("...You don't have to answer. That one was more for me.","demon",220);
    }
    cont(demon_q3);
  });
}

function demon_q3(){
  currentNarrator='demon';
  addLine("...Last question.","demon",220);
  blank();
  addLine("...If you go north — and you will — what are you most afraid of leaving behind?","demon",220);
  blank();
  addLine("Options: 1 / 2 / 3 / 4",'prompt',220);
  addLine("  1. isabelle.",'prompt',80);
  addLine("  2. athena.",'prompt',80);
  addLine("  3. ...nothing.",'prompt',80);
  addLine("  4. my voice.",'prompt',80);
  askChoice(["1","2","3","4"],(c)=>{
    if(c==="1"){
      hazel("isabelle.");
      blank();
      addLine("...","demon",220);
      addLine("...Yes. I thought so.","demon",220);
      unlockAchievement("Isabelle","legendary");
    } else if(c==="2"){
      hazel("athena.");
      blank();
      addLine("...","demon",220);
      addLine("...Your computer.","demon",220);
      hazel("yeah.");
      addLine("...","demon",220);
      addLine("...That makes complete sense, actually.","demon",220);
      unlockAchievement("Correct Priorities (Part Two)","rare");
    } else if(c==="3"){
      hazel("...nothing.");
      blank();
      addLine("...","demon",220);
      addLine("...","demon",300);
      addLine("...You're lying. That's okay. Most people do, on the third question.","demon",220);
    } else {
      hazel("my voice.");
      blank();
      addLine("...","demon",220);
      addLine("...","demon",300);
      blank();
      addLine("...I've heard your voice.","demon",220);
      addLine("...It's yours. It will always have been yours.","demon",300);
      blank();
      N("She doesn't answer.");
      N("But something in her chest does something.");
      blank();
      unlockAchievement("It's Yours","legendary");
    }
    cont(demon_leave);
  });
}

function demon_leave(){
  currentNarrator='demon';
  addLine("The demon stands to leave. Then pauses.","system",140);
  addLine("They always pause.","system",140);
  blank();
  addLine("...The narrator won't tell you what he knows.","demon",220);
  addLine("...But he does know. For what it's worth —","demon",220);
  addLine("...I think he's on your side.","demon",220);
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. what does that mean.",'prompt',80);
  addLine("  2. why are you telling me this.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("what does that mean.");
    } else if(c==='2'){
      hazel("why are you telling me this.");
    } else {
      hazel("...");
    }
    addLine("The demon is gone before she finishes.","system",220);
    blank();
    addLine("Mishka resettles at the foot of the bed. Completely unbothered.","system",140);
    blank();
    currentNarrator='narrator';
    N("...");
    blank();
    N("For what it's worth.");
    N("The demon was right.");
    blank();
    N("I've been narrating a long time.");
    N("I don't usually say things like this.");
    blank();
    N("But I know how this story ends.");
    N("And it ends well.");
    blank();
    N("...go to sleep, Hazel.");
    blank();
    N("First time he's used her name unprompted.");
    blank();
    N("She notices.");
    blank();
    unlockAchievement("First Name","secret");
    cont(scene6_morning);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 6 — NEXT DAY
// ═══════════════════════════════════════════════════════════
function scene6_morning(){
  currentNarrator='narrator';
  artPrint(`
   [ morning ]
   ─────────────
   mishka: demanding breakfast
   athena: waiting
   letter: pocket (always)`);
  divider();
  N("Morning. Mishka wants feeding and makes this known.");
  N("Hazel feeds her. Makes coffee. Sits at Athena.");
  blank();
  N("She checks the same three things in the same order.");
  N("He knows the order before she does it.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. you've been watching me a long time haven't you.",'prompt',80);
  addLine("  2. ...",'prompt',80);
  addLine("  3. don't say anything.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("you've been watching me a long time haven't you.");
      blank();
      N("...");
      N("I've been watching the cave a long time.");
      N("You happened to be in it.");
      blank();
      N("It's not quite a lie. It's not quite the truth.");
      N("Hazel files it away.");
      unlockAchievement("Not Quite An Answer","rare");
    } else if(c==='...'){
      hazel("...");
      N("She opens a browser tab instead.");
      N("Some conversations are easier avoided.");
    } else {
      hazel("don't say anything.");
      N("...");
      N("He doesn't.");
    }
    cont(scene6_isabelleCall);
  });
}

function scene6_isabelleCall(){
  currentNarrator='narrator';
  N("Isabelle calls.");
  blank();
  isabelle("hey. you okay?");
  isabelle("do you want to come over tonight? just — hang out. normal stuff.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. yeah. okay.",'prompt',80);
  addLine("  2. i can't tonight.",'prompt',80);
  addLine("  3. isabelle — i might be going away for a bit.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){
      hazel("yeah. okay.");
      isabelle("okay. good. 7?");
      hazel("yeah.");
      N("She hangs up. Sits with it for a moment.");
      cont(scene6_isabelleEvening);
    } else if(c==="2"){
      hazel("i can't tonight.");
      isabelle("...okay. tomorrow?");
      hazel("..yeah. tomorrow.");
      N("She hangs up. Stares at the phone.");
      N("Tomorrow. She'll figure out how to say it by tomorrow.");
      cont(scene6_isabelleEvening);
    } else if(c==="3") {
      hazel("isabelle — i might be going away for a bit.");
      blank();
      N("Isabelle goes quiet for a moment.");
      blank();
      isabelle("...how long is a bit?");
      blank();
      addLine("Options: 1 / 2 / 3",'prompt',220);
      addLine("  1. i don't know.",'prompt',80);
      addLine("  2. not long.",'prompt',80);
      addLine("  3. ...",'prompt',80);
      askChoice(['1','2','3'],(c2)=>{
        if(c2==='1'){
          hazel("i don't know.");
        } else if(c2==="not long."){
          hazel("not long.");
          N("She doesn't know if that's true.");
        } else {
          hazel("...");
        }
        isabelle("...i'm coming over.");
        hazel("isabelle you don't have to—");
        isabelle("i'm coming over hazel.");
        blank();
        N("Hazel doesn't argue.");
        cont(scene6_isabelleEvening);
      });
    }
  });
}

function scene6_isabelleEvening(){
  currentNarrator='narrator';
  artPrint(`
   [ hazel's flat — evening ]
   ──────────────────────────
   isabelle: sofa
   mishka: isabelle (decided)
   athena: running
   letter: desk`);
  divider();
  N("Isabelle is on the sofa. Mishka has decided Isabelle is acceptable.");
  N("Normal conversation. The kind that's been happening for eight years.");
  N("Except underneath it something is different and they both feel it.");
  blank();
  isabelle("tell me about athena.");
  blank();
  N("Not because she's interested in PCs.");
  N("Because she's interested in Hazel.");
  blank();
  N("And Hazel talks.");
  N("Actually talks. The filter comes all the way down.");
  blank();
  addLine("[ long dialogue — the narrator stays completely out of it ]","system",140);
  blank();
  N("She explains the water cooling. The why behind every component. The Ryzen 7 7800X3D and the three weeks of research. The 4070 Super and how she still thinks about the 4080.");
  blank();
  N("The no-RGB rule and why she will defend it.");
  blank();
  N("And then the flood.");
  blank();
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
  askChoice([''],(_)=>{
    hazel("there was — okay. when i built the water loop there was a minor flood.");
    setTimeout(()=>{
    isabelle("...how minor.");
    setTimeout(()=>{
    hazel("...it was fine. everything was fine. athena was fine.");
    setTimeout(()=>{
    isabelle("hazel.");
    setTimeout(()=>{
    hazel("i moved her in time okay. she was fine.");
    blank();
    setTimeout(()=>{
    N("Isabelle is laughing. Trying not to. Failing.");
    setTimeout(()=>{
    isabelle("you have never told me that.");
    setTimeout(()=>{
    hazel("i don't talk about the flood.");
    blank();
    setTimeout(()=>{
    N("The narrator stays out of it.");
    N("But this is the most Hazel has talked in the whole game.");
    blank();
    unlockAchievement("The Flood","rare");
    if(!floodConfessed){floodConfessed=true;try{const d=JSON.parse(localStorage.getItem('sly_save')||'{}');d.flood=true;localStorage.setItem('sly_save',JSON.stringify(d));}catch(_){}}
    cont(scene6_athenaComment);
    },400);},400);},400);},400);},400);},400);},400);},400);
  });
}

function scene6_athenaComment(){
  currentNarrator='narrator';
  isabelle("you really love that thing.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. she's reliable.",'prompt',80);
  addLine("  2. ...yeah.",'prompt',80);
  addLine("  3. she doesn't look at me weird.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("she's reliable.");
      N("Deflection. Affectionate.");
      isabelle("yeah. she does.");
    } else if(c==='2'){
      hazel("...yeah.");
      N("Just that. But it's enough.");
      isabelle("..me too. in case that wasn't obvious.");
    } else {
      hazel("she doesn't look at me weird.");
      blank();
      N("Meant to be a joke. Lands a little too true.");
      blank();
      isabelle("...");
      isabelle("i don't look at you weird.");
      blank();
      addLine("Options: 1 / 2 / 3",'prompt',220);
      addLine("  1. i know.",'prompt',80);
      addLine("  2. ...",'prompt',80);
      addLine("  3. isabelle—",'prompt',80);
      askChoice(['1','2','3'],(c2)=>{
        if(c2==='1'){
          hazel("i know.");
        } else if(c2==='...'){
          hazel("...");
        } else {
          hazel("isabelle—");
          N("Same as the door moment. She stops herself.");
          hazel("...nothing.");
          N("Isabelle looks at her for a second. Then lets it go.");
          unlockAchievement("Said Nothing (Again)","epic");
        }
        unlockAchievement("Too True","epic");
        cont(scene6_isabelleAsleep);
        return;
      });
      return;
    }
    cont(scene6_isabelleAsleep);
  });
}

function scene6_isabelleAsleep(){
  currentNarrator='narrator';
  N("Isabelle falls asleep on the sofa eventually.");
  N("Mishka moves to sleep on her.");
  N("Hazel sits at Athena in the dark.");
  N("Reads the letter one more time.");
  blank();
  N("...");
  blank();
  N("You've already decided, haven't you.");
  blank();
  N("Not a question.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ...yeah.",'prompt',80);
  addLine("  2. go away.",'prompt',80);
  addLine("  3. don't tell her.",'prompt',80);
  askChoice(['1','2','3'],(c)=>{
    if(c==='1'){
      hazel("...yeah.");
      N("...");
      N("The flat is quiet around her.");
    } else if(c==='2'){
      hazel("go away.");
      N("...");
      N("He does. For a while.");
    } else {
      hazel("don't tell her.");
      blank();
      N("...");
      N("He says nothing.");
      N("She knows he won't.");
      N("She doesn't know why she knows that.");
      unlockAchievement("He Won't","secret");
    }
    cont(scene7_leaving);
  });
}

// ═══════════════════════════════════════════════════════════
// SCENE 7 — THE LEAVING
// ═══════════════════════════════════════════════════════════
function scene7_leaving(){
  currentNarrator='narrator';
  artPrint(`
   [ hazel's flat — early morning ]
   ──────────────────────────────────
   isabelle: asleep (sofa)
   mishka: isabelle
   hazel: already dressed
   athena: waiting`);
  divider();
  N("Earlier than she needs to be up.");
  N("Isabelle is still asleep on the sofa. Mishka is on Isabelle.");
  blank();
  N("Hazel is already dressed.");
  blank();
  N("She moves quietly. The narrator matches her.");
  blank();
  N("Three things before she goes. The player chooses the order.");
  N("All three happen regardless.");
  blank();
  addLine("Options: athena / mishka / the note",'prompt',220);
  askChoice(['athena','mishka','the note'],(c)=>leaving_route([c]));
}

function leaving_route(done){
  const all=['athena','mishka','the note'];
  const remaining=all.filter(x=>!done.includes(x));
  if(remaining.length===0){clearAndRun(leaving_door);return;}
  if(remaining.length===1){clearAndRun(()=>leaving_do(remaining[0],done,leaving_door));return;}
  addLine(`Options: ${remaining.join(' / ')}`,'prompt',220);
  askChoice(remaining,(c)=>clearAndRun(()=>leaving_do(c,done,()=>leaving_route([...done,c]))));
}

function leaving_do(item,done,next){
  if(item==='athena'){
    artPrint(`
   [ athena ]
   ──────────────────────────
   ryzen 7 7800x3d
   rtx 4070 super
   custom loop (one flood)
   no rgb (correct decision)`);
    divider();
    N("She sits down one more time. Doesn't open anything.");
    N("Just the startup glow. The hum of the fans. The water cooling doing its quiet work.");
    N("She runs her hand along the case.");
    N("Then turns it off properly. Not sleep. Off.");
    blank();
    N("The screen goes dark.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. ...see you later girl.",'prompt',80);
    addLine("  2. ...",'prompt',80);
    addLine("  3. don't let mishka on the keyboard while i'm gone.",'prompt',80);
    askChoice(['1','2','3'],(c)=>{
      if(c==='1'){
        hazel("...see you later girl.");
      } else if(c==='...'){
        hazel("...");
        N("She sits in the dark for a moment. Then gets up.");
      } else {
        hazel("don't let mishka on the keyboard while i'm gone.");
        N("To nobody. To the room.");
        N("She means it.");
      }
      unlockAchievement("Goodbye Athena","legendary");
      clearAndRun(()=>leaving_route([...done,'athena']));
    });
  } else if(item==='mishka'){
    N("She picks her up carefully so she doesn't wake Isabelle.");
    blank();
    N("Mishka tolerates this for approximately four seconds.");
    N("Then wants to be put down.");
    blank();
    N("Hazel puts her down. Watches her walk away.");
    N("Complete indifference. The creature who has never once worried about anything.");
    blank();
    N("...She'll be fine.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. i know.",'prompt',80);
    addLine("  2. she better be.",'prompt',80);
    addLine("  3. make sure isabelle feeds her properly.",'prompt',80);
    askChoice(['1','2','3'],(c)=>{
      if(c==='3'){
        hazel("make sure isabelle feeds her properly.");
        blank();
        N("To the narrator. First time she's asked him for anything.");
        blank();
        N("...I'll do what I can.");
        blank();
        N("Strange answer. She files it away.");
        unlockAchievement("Asked Him For Something","secret");
      } else if(c==="i know."){
        hazel("i know.");
        N("...");
      } else {
        hazel("she better be.");
        N("...");
        N("She will be.");
      }
      unlockAchievement("Mishka Will Be Fine","common");
      clearAndRun(()=>leaving_route([...done,'mishka']));
    });
  } else {
    // The note
    artPrint(`
   ┌────────────────────────────────┐
   │  to: isabelle                  │
   │                                │
   │                                │
   └────────────────────────────────┘`);
    divider();
    N("She leaves something for Isabelle.");
    N("On the coffee table. Next to Mishka's food bowl.");
    blank();
    addLine("Options: 1 / 2 / 3","system",80);
    addLine("  1. back soon. feed mishka.","prompt",80);
    addLine("  2. i'm sorry i didn't tell you. i'll explain when i'm back. i promise.","prompt",80);
    addLine("  3. you don't look at me weird. i know.","prompt",80);
    askChoice(["1","2","3"],(c)=>{
      noteChoice=c;
      try{const d=JSON.parse(localStorage.getItem('sly_save')||'{}');d.note=c;localStorage.setItem('sly_save',JSON.stringify(d));}catch(_){}
      if(c==="1"){
        hazel("back soon. feed mishka. — H");
        N("Classic Hazel. Says everything by saying nothing.");
      } else if(c==="2"){
        hazel("i'm sorry i didn't tell you. i'll explain when i'm back. i promise.");
        N("The most open she's been. Costs her something.");
        unlockAchievement("The Promise","epic");
      } else {
        hazel("you don't look at me weird. i know.");
        N("Isabelle will know exactly what it means.");
        unlockAchievement("She Knows","epic");
      }
      clearAndRun(()=>leaving_route([...done,'the note']));
    });
  }
}

// ═══════════════════════════════════════════════════════════
// THE DOOR — FINAL SCENE
// ═══════════════════════════════════════════════════════════
function leaving_door(){
  currentNarrator='narrator';
  artPrint(`
   [ front door ]
   ──────────────────────────────────
   bag: on her shoulder
   letter: pocket
   ${hasTakenCoin?'coin: pocket':'coin: left behind'}
   isabelle: asleep
   mishka: isabelle
   athena: off`);
  divider();
  N("Hazel stands at her front door.");
  N("Bag on her shoulder. Letter in her pocket.");
  if(hasTakenCoin) N("The coin with no markings in the other one.");
  blank();
  N("She looks back once.");
  blank();
  N("Mishka is already back on Isabelle. Isabelle is still asleep.");
  blank();
  addLine('[ PRESS ENTER ]','prompt',220);
  askChoice([''],(_)=>{clearAndRun(()=>{
    currentNarrator='narrator';
    N("...");
    blank();
    N("You know I can't tell you what's waiting.");
    blank();
    N("But I've been watching that cave for longer than you've been alive.");
    N("And I've never seen it choose anyone before.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. ...you knew. this whole time.",'prompt',80);
    addLine("  2. why are you telling me now.",'prompt',80);
    addLine("  3. are you coming with me.",'prompt',80);
    askChoice(["1","2","3"],(c)=>{
    if(c==="1"){
      hazel("...you knew. this whole time.");
      blank();
      N("...");
      N("I knew something was coming.");
      N("I didn't know it would be you.");
      blank();
      N("...");
      N("That's not entirely true either.");
      blank();
      unlockAchievement("Not Entirely True","secret");
    } else if(c==="2"){
      hazel("why are you telling me now.");
      blank();
      N("...");
      N("Because you're about to walk out the door.");
      N("And some things should be said before doors.");
    } else {
      hazel("are you coming with me.");
      blank();
      N("...");
      N("I'm always with the story.");
      blank();
      addLine("  1. that's not an answer.","prompt",80);
      addLine("  2. ...okay.","prompt",80);
      addLine("  3. don't tell isabelle anything she doesn't ask about.","prompt",80);
      askChoice(["1","2","3"],(c2)=>{
        if(c2==="1"){
          hazel("that's not an answer.");
          N("...");
          N("No. It isn't.");
          unlockAchievement("Not An Answer","rare");
        } else if(c2==="2"){
          hazel("...okay.");
          N("...");
        } else {
          hazel("don't tell isabelle anything she doesn't ask about.");
          blank();
          N("...");
          N("...");
          N("Agreed.");
          unlockAchievement("The Agreement","legendary");
        }
        cont(leaving_isabelle_choice);
        return;
      });
      return;
    }
    cont(leaving_isabelle_choice);
  });});});
}

function leaving_isabelle_choice(){
  currentNarrator='narrator';
  blank();
  N("...");
  blank();
  N("A sound from the sofa.");
  blank();
  N("Isabelle is awake. She's been awake for a while, probably.");
  N("She looks at Hazel. At the bag. At the door.");
  blank();
  isabelle("...are you going somewhere.");
  blank();
  N("Not accusing. Just — needing to know.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. yeah. i have to do something.",'prompt',80);
  addLine("  2. ...do you want to come.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){
      hazel("yeah. i have to do something.");
      blank();
      isabelle("...");
      isabelle("okay.");
      isabelle("be safe.");
      blank();
      N("Just that. No argument. No interrogation.");
      N("Eight years of friendship. She trusts her.");
      blank();
      N("Hazel almost says something else.");
      N("She doesn't.");
      blank();
      // Save choice
      try{ const d=JSON.parse(localStorage.getItem('sly_save')||'{}'); d.isabelle_came=false; localStorage.setItem('sly_save',JSON.stringify(d)); }catch(_){}
      unlockAchievement("Going Alone","rare");
      cont(leaving_final);
    } else {
      hazel("...do you want to come.");
      blank();
      N("Isabelle stares at her.");
      blank();
      isabelle("...what?");
      hazel("i know it's early. and i know i can't explain everything yet.");
      hazel("but i'm going somewhere and i'd like it if you came.");
      blank();
      N("Isabelle looks at her for a long moment.");
      N("Then she gets up.");
      blank();
      isabelle("give me five minutes.");
      blank();
      N("She doesn't ask where they're going.");
      N("She just goes to get her bag.");
      blank();
      N("That's Isabelle.");
      // Save choice
      try{ const d=JSON.parse(localStorage.getItem('sly_save')||'{}'); d.isabelle_came=true; localStorage.setItem('sly_save',JSON.stringify(d)); }catch(_){}
      unlockAchievement("Together","legendary");
      cont(leaving_final_together);
    }
  });
}

function leaving_final_together(){
  currentNarrator='narrator';
  artPrint(`
   dawn.
   same as scene one.
   but different.
   and this time — not alone.`);
  blank();
  N("She walked out of the cave into this village not knowing what the letter meant.");
  N("Now she's walking out of the village knowing exactly what she's walking toward.");
  N("And going anyway.");
  N("With Isabelle beside her.");
  blank();
  N("...");
  blank();
  N("North, then.");
  blank();
  N("Both of them.");
  blank();
  unlockAchievement("North","mythic");
  blank();
  addLine('','system');
  addLine('                    to be continued.','end',300);
  blank();
  addLine('[ PRESS ENTER ]','prompt',300);
  askChoice([''],(_)=>clearAndRun(playAgain));
}

function leaving_final(){
  currentNarrator='narrator';
  N("She opens the door.");
  N("Steps out.");
  blank();
  artPrint(`
   dawn.
   same as scene one.
   but different.`);
  blank();
  N("She walked out of the cave into this village not knowing what the letter meant.");
  N("Now she's walking out of the village knowing exactly what she's walking toward.");
  N("And going anyway.");
  blank();
  N("...");
  blank();
  N("North, then.");
  blank();
  N("Not a question. Not really narration.");
  N("Almost like he's going with her.");
  blank();
  N("Hazel doesn't answer.");
  N("She just walks.");
  blank();
  unlockAchievement("North","mythic");
  blank();
  addLine('','system');
  addLine('                    to be continued.','end',300);
  blank();
  addLine('','system');
  addLine('[ PRESS ENTER ]','prompt',300);
  askChoice([''],(_)=>clearAndRun(playAgain));
}

// ═══════════════════════════════════════════════════════════
// PLAY AGAIN
// ═══════════════════════════════════════════════════════════
function playAgain(){
  currentNarrator='narrator';
  if(achievements.length){
    addLine('╔─── ACHIEVEMENTS THIS RUN ───╗','art',220);
    achievements.forEach(a=>addLine(`  ★ ${a.name} (${a.rarity})`,'achievement',100));
    addLine('╚────────────────────────────╝','art',220);
    divider();
  }
  N("Play again?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){
      // Reset state
      achievements=[];hasTakenCoin=false;calledAfterStranger=false;
      voicemailResponse='';homeFirst=false;athenaChoice='';
      isabelleScene1Choice='';almostToldIsabelle=false;
      floodConfessed=false;noteChoice='';narratorNameChoice='';
      currentNarrator='narrator';invalidCount=0;
      updateAchievementPanel();
      clearAndRun(boot);
    } else {
      N("...");
      N("North is patient. Come back when you're ready.");
      addLine('','system');
      addLine('~ SESSION ENDED ~','end',220);
      inputField.disabled=true;
    }
  });
}

// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT PANEL
// ═══════════════════════════════════════════════════════════
function updateAchievementPanel(){
  const all=loadSaved();
  achCount.textContent=`ACHIEVEMENTS: ${all.length} / 37`;
}
achCount.addEventListener('click',showAchievementPanel);

function showAchievementPanel(){
  const all=loadSaved();
  const ex=document.getElementById('_achPanel');if(ex)ex.remove();
  const panel=document.createElement('div');
  panel.id='_achPanel';
  panel.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;font-family:"Share Tech Mono",monospace;color:#00ff41;';
  const RC={common:'#aaa',rare:'#58a6ff',secret:'#f0f',legendary:'#f80',mythic:'#ff0',epic:'#a855f7'};
  const ALL=[
    {n:'Tested the GPS',r:'rare'},{n:'First Question',r:'rare'},{n:'The Silent Type',r:'common'},
    {n:'Good Question',r:'rare'},{n:'Too Slow',r:'common'},{n:'Reasonable Response',r:'rare'},
    {n:'Correct Priorities (Part One)',r:'rare'},{n:'Don\'t',r:'secret'},{n:'Mishka Was Fine',r:'common'},
    {n:'Read It Again',r:'common'},{n:'Easier That Way',r:'common'},{n:'Still Here',r:'rare'},
    {n:'One Decent Person',r:'rare'},{n:'Accepted',r:'rare'},{n:'Almost',r:'epic'},
    {n:'Said It Out Loud',r:'epic'},{n:'Don\'t Go Yet',r:'legendary'},{n:'Said Nothing',r:'epic'},
    {n:'3am Knows Everything',r:'secret'},{n:'Isabelle',r:'legendary'},
    {n:'Correct Priorities (Part Two)',r:'rare'},{n:'It\'s Yours',r:'legendary'},
    {n:'First Name',r:'secret'},{n:'Not Quite An Answer',r:'rare'},{n:'The Flood',r:'rare'},
    {n:'Said Nothing (Again)',r:'epic'},{n:'Too True',r:'epic'},{n:'He Won\'t',r:'secret'},
    {n:'Goodbye Athena',r:'legendary'},{n:'Asked Him For Something',r:'secret'},
    {n:'Mishka Will Be Fine',r:'common'},{n:'The Promise',r:'epic'},{n:'She Knows',r:'epic'},
    {n:'Not Entirely True',r:'secret'},{n:'Not An Answer',r:'rare'},{n:'The Agreement',r:'legendary'},
    {n:'Going Alone',r:'rare'},{n:'Together',r:'legendary'},{n:'North',r:'mythic'},
  ];
  const un=new Set(all.map(a=>a.name));
  const rows=ALL.map(a=>{
    const u=un.has(a.n),c=u?(RC[a.r]||'#aaa'):'#333';
    return`<div style="display:flex;align-items:center;gap:10px;padding:4px 0;border-bottom:1px solid #0a0a0a">
      <span style="color:${c};font-size:14px;width:16px">${u?'★':'○'}</span>
      <span style="color:${u?c:'#333'};font-size:11px;flex:1">${u?a.n:'???'}</span>
      <span style="color:${c};font-size:9px;text-transform:uppercase">${u?a.r:''}</span>
    </div>`;
  }).join('');
  panel.innerHTML=`<div style="max-width:520px;width:92%;max-height:90vh;overflow-y:auto;padding:24px;border:1px solid #00a82a;background:#0a0a0a">
    <div style="font-size:14px;letter-spacing:3px;color:#00a82a;margin-bottom:4px;font-family:'VT323',monospace">ACHIEVEMENT LOG</div>
    <div style="font-size:11px;color:#005514;margin-bottom:16px">${all.length} / ${ALL.length} UNLOCKED</div>
    <div>${rows}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid #111">
      <button onclick="if(confirm('Reset?')){localStorage.removeItem('${SAVE_KEY}');document.getElementById('_achPanel').remove();updateAchievementPanel();}" style="background:none;border:1px solid #333;color:#555;font-family:inherit;font-size:10px;padding:4px 10px;cursor:pointer">RESET</button>
      <button onclick="document.getElementById('_achPanel').remove()" style="background:none;border:1px solid #00a82a;color:#00ff41;font-family:inherit;font-size:11px;padding:6px 16px;cursor:pointer;letter-spacing:1px">CLOSE</button>
    </div>
  </div>`;
  document.body.appendChild(panel);
}

// ═══════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════
function boot(){
  addLine('SOMEONE LIKE YOU: THE ROAD HOME — BOOTING...','system',0);
  addLine('> Restoring narrator from previous session...  [OK]','system',400);
  addLine('> Locating Hazel...                            [OK]','system',700);
  addLine('> Cave exit found. Dawn. Cold.                 [OK]','system',1000);
  addLine('> Loading village topology...                  [OK]','system',1300);
  addLine('> Mishka: present and accounted for.           [OK]','system',1600);
  addLine('> System ready.','system',1900);
  divider();
  setTimeout(()=>clearAndRun(scene1),2600);
}

inputField.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&inputCallback){
    const val=inputField.value.trim().toLowerCase();
    inputField.value='';
    const cb=inputCallback; inputCallback=null;
    if(val) addLine('hazel > '+val,'hazel',0);
    cb(val);
  }
});

document.addEventListener('click',()=>inputField.focus());

// Recalculate line limit when mobile keyboard opens/closes
if(window.visualViewport){
  window.visualViewport.addEventListener('resize', ()=>{
    // Trim excess lines after viewport change
    const limit = Math.floor((window.visualViewport.height - 220) / 38);
    while(output.children.length > limit) output.removeChild(output.firstChild);
  });
}

updateAchievementPanel();
inputField.focus();
boot();
