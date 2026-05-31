// ═══════════════════════════════════════════════════════════
// CAVE ADVENTURE v2.0 — ENGINE
// ═══════════════════════════════════════════════════════════
const output     = document.getElementById('output');
const inputField = document.getElementById('inputField');
const achCount   = document.getElementById('achCount');
const titleArtEl = document.getElementById('titleArt');

titleArtEl.textContent =
` ████████╗██╗  ██╗███████╗    ██╗    ██╗██████╗  ██████╗ ███╗   ██╗ ██████╗
    ██╔══╝██║  ██║██╔════╝    ██║    ██║██╔══██╗██╔═══██╗████╗  ██║██╔════╝
    ██║   ███████║█████╗      ██║ █╗ ██║██████╔╝██║   ██║██╔██╗ ██║██║  ███╗
    ██║   ██╔══██║██╔══╝      ██║███╗██║██╔══██╗██║   ██║██║╚██╗██║██║   ██║
    ██║   ██║  ██║███████╗    ╚███╔███╔╝██║  ██║╚██████╔╝██║ ╚████║╚██████╔╝
    ╚═╝   ╚═╝  ╚═╝╚══════╝     ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝
   ██████╗ █████╗ ██╗   ██╗███████╗
  ██╔════╝██╔══██╗██║   ██║██╔════╝
  ██║     ███████║██║   ██║█████╗
  ██║     ██╔══██║╚██╗ ██╔╝██╔══╝
  ╚██████╗██║  ██║ ╚████╔╝ ███████╗
   ╚═════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝
  S O M E O N E   L I K E   Y O U   ·   I : T H E   W R O N G   C A V E`;

const SAVE_KEY = 'novaCaveAchievements';
function loadSaved(){ try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');}catch(_){return[];} }

let lineQueue=[], isTyping=false, inputCallback=null, invalidCount=0;
let currentNarrator='default', achievements=[];

// ── NARRATOR STYLES ───────────────────────────────────────
const NS = {
  default: { cls:'narrator', invalid:["That is not a valid choice, traveller.","I don't recognise that path.","The cave offers no such route."] },
  professor: { cls:'professor', invalid:["That response does not correspond to any listed variable.","I am afraid that input falls outside the acceptable parameter set.","Your selection is, academically speaking, incorrect."] },
  rhys: { cls:'rhys', invalid:["nah that's not one of the options lol","bro that's not a thing","try again mate, that's not right"] },
  ghost: { cls:'ghost', invalid:["...that word means nothing to me...","...I cannot feel that path...","...you must choose from what is offered..."] },
  robot: { cls:'robot', invalid:["INPUT NOT RECOGNISED. VALID OPTIONS REQUIRED.","ERROR: CHOICE OUTSIDE PERMITTED RANGE.","QUERY INVALID. PLEASE RESUBMIT."] },
  stanley: { cls:'stanley', invalid:["Stanley chose an option that wasn't on the list. This was not part of the story.","That isn't one of the options. The narrator waited. Stanley did not cooperate.","Stanley typed something unexpected. The narrator took a breath."] },
  lgio: { cls:'lgio', invalid:["Yeah that's not one of the options, so.","Hm. That's not a thing here. Let's try something else.","Yeah I don't think that's going to work. So."] },
};

function narratorSay(line){ addLine(line,(NS[currentNarrator]||NS.default).cls,200); }

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
function divider(){addLine('─'.repeat(60),'divider',80);}
function artPrint(t){addLine(t,'art',20);}

function unlockAchievement(name,rarity){
  achievements.push({name,rarity});
  const all=loadSaved();
  if(!all.find(a=>a.name===name)){all.push({name,rarity,unlockedAt:Date.now()});localStorage.setItem(SAVE_KEY,JSON.stringify(all));}
  updateAchievementPanel();
  addLine(`[+ ACHIEVEMENT: ${name.toUpperCase()} (${rarity.toUpperCase()}) +]`,'achievement',180);
}

function askChoice(validKeys,cb){
  const valid=new Set(validKeys); valid.add('credits');
  inputCallback=(val)=>{
    if(val===''&&validKeys.includes('')){clearAndRun(()=>cb(''));return;}
    if(val==='credits'){clearAndRun(showCredits);return;}
    if(val==='hello there'){addLine('General Kenobi.','system',0);setTimeout(()=>askChoice(validKeys,cb),500);return;}
    if(valid.has(val)){invalidCount=0;setTimeout(()=>clearAndRun(()=>cb(val)),300);}
    else{
      invalidCount++;
      if(invalidCount>=(currentNarrator==='lgio'?100:3)){invalidCount=0;setTimeout(()=>clearAndRun(narratorMeltdown),300);}
      else{
        const inv=(NS[currentNarrator]||NS.default).invalid;
        addLine(inv[Math.floor(Math.random()*inv.length)],'system',0);
        setTimeout(()=>askChoice(validKeys,cb),400);
      }
    }
  };
}
function clearAndRun(fn){clearScreen(()=>{lineQueue=[];isTyping=false;fn();});}
function end(win=true){
  addLine('','system');
  addLine(win?'~ THE END ~':'xx GAME OVER xx',win?'end':'gameover',220);
  divider(); addLine('','system');
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
  askChoice([''],(_)=>clearAndRun(playAgain));
}

// ═══════════════════════════════════════════════════════════
// ASCII ART
// ═══════════════════════════════════════════════════════════
const CAVE_ART=`
        .     .       .  .   . .   .   . .    +  .
    .     .  :     .    .. :. .___---------___.
         .  .   .    .  :.:. _".^ .^ ^.  '.. :"-_. .
      .  :       .  .  .:..:                . .^:  :. .:. 
   .  .  .. :  -::::. ^- .^    ".. .  . .\\
  .    .:  .     :.::        .: .\\`;

const CROSSROADS_ART=`
         N
         |
    W ---+--- E
         |
         S`;

const CRYSTAL_ART=`
      *
     /|\\
    * | *
   /|\\|/|\\
  * -*-*-* *
   \\|/|\\|/
    * | *
     \\|/
      *`;

const CROWN_ART=`
   /\\  /\\  /\\
  /  \\/  \\/  \\
 |  CROWN OF  |
 |   K I N G  |`;

// ═══════════════════════════════════════════════════════════
// GAME START
// ═══════════════════════════════════════════════════════════
function playGame(){
  artPrint(CAVE_ART); divider();

  if(currentNarrator==='professor'){
    narratorSay("Good day. I am Emeritus Professor of Narrative Studies, your replacement narrator.");
    narratorSay("I shall maintain academic rigour throughout. Kindly do not embarrass us both.");
  } else if(currentNarrator==='rhys'){
    narratorSay("hey, welcome back — i'll take it from here");
    narratorSay("same cave, but there's way more to find now");
  } else if(currentNarrator==='ghost'){
    narratorSay("...you have returned...");
    narratorSay("...the cave remembers you...");
    narratorSay("...choose carefully this time...");
  } else if(currentNarrator==='robot'){
    narratorSay("NARRATOR UNIT-7 ONLINE. ADVENTURE PROTOCOL ACTIVE. AWAITING INPUT.");
  } else if(currentNarrator==='stanley'){
    narratorSay("Stanley stood at the entrance to a cave.");
    narratorSay("There was a sign. It said: adventure awaits within.");
    narratorSay("Stanley was not sure about this. But he went in anyway.");
    narratorSay("This was already going better than the office.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Hello and welcome back.");
    narratorSay("Today we're looking at a cave.");
    narratorSay("I found it and I'm going to go in it and see what happens.");
    narratorSay("That's the whole plan.");
  } else {
    narratorSay("Welcome, traveller. I have a tale to tell...");
    narratorSay("Four paths. Each hides something different.");
    narratorSay("Some say typing 'credits' reveals secrets.");
  }

  if(currentNarrator==='stanley') narratorSay("Stanley pressed yes. Or no. The narrator waited.");
  else narratorSay("Shall we begin?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){
      if(currentNarrator==='stanley'){
        narratorSay("Stanley chose to go again. The narrator felt a cautious optimism. He always did.");
      } else if(currentNarrator==='lgio') narratorSay("Let's go back in. There are things in here I haven't broken yet.");
      else narratorSay("Then let us proceed.");
      setTimeout(()=>clearAndRun(crossroads),600);
    }
    else{
      unlockAchievement("Refused the Quest","rare");
      if(currentNarrator==='stanley') narratorSay("Stanley turned away from the cave. The narrator stood there for a moment. Then wrote it down. 'Stanley left.' The shortest story he'd ever told.");
      else narratorSay("You turn away. Some stories are never told.");
      end();
    }
  });
}

// ── CROSSROADS ───────────────────────────────────────────
function crossroads(){
  artPrint(CROSSROADS_ART); divider();
  if(currentNarrator==='professor'){
    narratorSay("A junction of four passages. Each presents a distinct narrative trajectory.");
    narratorSay("The eastern passage has, statistically speaking, the most content.");
  } else if(currentNarrator==='rhys'){
    narratorSay("ok four ways to go. west has the most stuff but it's your call");
  } else if(currentNarrator==='ghost'){
    narratorSay("...four paths...");
    narratorSay("...one leads to me...");
  } else if(currentNarrator==='robot'){
    narratorSay("JUNCTION DETECTED. NORTH: LOW REWARD. EAST/WEST: HIGHER COMPLEXITY.");
  } else if(currentNarrator==='stanley'){
    narratorSay("Stanley came to a set of four doors. Well, passages.");
    narratorSay("The narrator would like to point out that the recommended passage is south.");
    narratorSay("The button is south. The story is south. South is correct.");
    narratorSay("But Stanley may, of course, go wherever he likes.");
    narratorSay("That is completely his prerogative.");
    narratorSay("The narrator is simply noting the south option. For reference.");
  } else {
    narratorSay("You stand at a crossroads deep within the cave.");
    narratorSay("Four paths stretch before you into darkness.");
  }
  addLine("Options: north / south / east / west",'prompt',220);
  askChoice(['north','south','east','west'],(c)=>{
    if(c==='north')clearAndRun(northWing);
    else if(c==='south')clearAndRun(southChamber);
    else if(c==='east')clearAndRun(crystalCavern);
    else clearAndRun(westRoom);
  });
}

// ═══════════════════════════════════════════════════════════
// NORTH WING
// ═══════════════════════════════════════════════════════════
function northWing(){
  artPrint(`
   /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\\
  /   NORTH WING    \\
 /  cold. silent.   \\
/___________________\\`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley went north. The narrator had not recommended north.");
    narratorSay("There was a mirror, a locked door, and a staircase. Stanley had three options.");
    narratorSay("The narrator was already writing three different endings.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Went north. There's a mirror, a locked door, and stairs going down.");
    narratorSay("I want to go down the stairs. I'm going to go down the stairs eventually.");
    narratorSay("But first I'm going to look at literally everything else.");
  } else {
    narratorSay("The northern passage is cold. Your breath mists in the dark.");
    narratorSay("Three things catch your eye: a mirror, a locked door, and a staircase going down.");
  }
  addLine("Options: mirror / door / stairs",'prompt',220);
  askChoice(['mirror','door','stairs'],(c)=>{
    if(c==='mirror')clearAndRun(mirrorRoom);
    else if(c==='door')clearAndRun(lockedDoor);
    else clearAndRun(deepStairs);
  });
}

function mirrorRoom(){
  artPrint(`
 ___________
|           |
|  [  YOU  ]|
|___________|`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley stood before the mirror.");
    narratorSay("His reflection stared back. Then moved when he didn't.");
    narratorSay("The narrator paused his narration briefly to process this.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There is a mirror in here.");
    narratorSay("The reflection is moving on its own.");
    narratorSay("I wonder what happens if I talk to it.");
    narratorSay("I wonder what happens if I smash it.");
    narratorSay("I wonder what happens if I just stand here.");
    narratorSay("These are the things I think about.");
  } else {
    narratorSay("You stand before the mirror. Your reflection stares back.");
    narratorSay("Then — it moves when you don't.");
  }
  addLine("Options: speak / smash / run",'prompt',220);
  askChoice(['speak','smash','run'],(c)=>{
    if(c==='speak'){
      unlockAchievement("Mirror Dialogue","rare");
      narratorSay("\"Who are you?\" you ask.");
      narratorSay("The reflection smiles. \"I am the version of you that always makes the right choice.\"");
      narratorSay("\"Then why are you in there?\"");
      narratorSay("It stops smiling.");
      narratorSay("...");
      narratorSay("I wasn't going to say anything.");
      narratorSay("But the reflection looks a little like someone I know.");
      narratorSay("Someone who is going to find a different cave eventually. A real one.");
      narratorSay("The mirror cracks. A door opens behind it. You step through into light.");
      end();
    } else if(c==='smash'){
      unlockAchievement("Seven Years Bad Luck","common");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley smashed the mirror. The narrator had not written this option.");
        narratorSay("Seven shards. Each reflected a different face. None of them Stanley's.");
        narratorSay("The narrator updated his notes.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Smashed it. Seven shards.");
        narratorSay("Each one has a different face. None of them mine.");
        narratorSay("I wonder what that means.");
        narratorSay("I'm going to stop wondering and leave now.");
      } else {
        narratorSay("You smash the mirror. Seven shards scatter.");
        narratorSay("Each shard reflects a different face. None of them are yours.");
      }
      end(false);
    } else {
      if(currentNarrator==='stanley') narratorSay("Stanley ran. The narrator followed at a professional distance.");
      else if(currentNarrator==='lgio') narratorSay("Yep. Running. Full sprint. No notes.");
      else narratorSay("You run. The cave echoes behind you. You never look back.");
      setTimeout(()=>clearAndRun(northWing),800);
    }
  });
}

function lockedDoor(){
  artPrint(`
  ___________
 |  _______  |
 | |       | |
 | |  DOOR | |
 | |_______| |
 |___________|`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("There was a door. Heavy. No handle.");
    narratorSay("Carved above it: 'KNOCK, AND IT SHALL OPEN. OR NOT.'");
    narratorSay("The narrator appreciated that the door had a philosophy.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There's a door here. No handle. No keyhole.");
    narratorSay("It says knock and it shall open, or not.");
    narratorSay("The 'or not' is doing a lot of work in that sentence.");
    narratorSay("I respect it.");
  } else {
    narratorSay("A heavy door. No handle. No keyhole.");
    narratorSay("Carved above it: 'KNOCK, AND IT SHALL OPEN. OR NOT.'");
  }
  addLine("Options: knock / leave",'prompt',220);
  askChoice(['knock','leave'],(c)=>{
    if(c==='knock'){
      unlockAchievement("The Door That Answers","secret");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley knocked. A long silence.");
        narratorSay("'Who is it?'");
        narratorSay("Stanley told the door his name.");
        narratorSay("'I don't know anyone by that name.'");
        narratorSay("The door did not open. Stanley left. The narrator wrote: 'Stanley spoke to a door.' He felt this was about right.");
      } else if(currentNarrator==='lgio'){
        narratorSay("I knocked.");
        narratorSay("Long pause.");
        narratorSay("It said 'who is it.'");
        narratorSay("I told it my name.");
        narratorSay("It said 'I don't know anyone by that name.'");
        narratorSay("And then nothing.");
        narratorSay("The door did not open.");
        narratorSay("This cave has incredible grace.");
      } else {
        narratorSay("You knock. A long silence.");
        narratorSay("Then from behind the door: 'Who is it?'");
        narratorSay("You tell it your name. Another silence.");
        narratorSay("'I don't know anyone by that name.'");
        narratorSay("The door does not open. You eventually leave.");
      }
      end();
    } else {
      if(currentNarrator==='stanley') narratorSay("Stanley left the door alone. The narrator considered this. It was, perhaps, wise.");
      else if(currentNarrator==='lgio') narratorSay("Leaving the door alone. It seems like a door that wants to be left alone and I'm going to honour that.");
      else narratorSay("You leave the door alone. Perhaps that was wise.");
      setTimeout(()=>clearAndRun(northWing),700);
    }
  });
}

function deepStairs(){
  artPrint(`
   |   |
   | ↓ |
   |   |
   | ↓ |
   |____|`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley descended. One hundred steps into total darkness.");
    narratorSay("At the bottom: a forge, a garden of glowing mushrooms, and a giant.");
    narratorSay("The giant was asleep. The narrator was relieved.");
  } else if(currentNarrator==='lgio'){
    narratorSay("One hundred steps. I counted.");
    narratorSay("At the bottom we've got a forge, a garden of glowing mushrooms, and a giant.");
    narratorSay("The giant is asleep.");
    narratorSay("I'm going to try to keep it that way.");
    narratorSay("I'm probably not going to keep it that way.");
    addLine("  (exclusive: type 'hello' to introduce yourself to the giant)",'prompt',300);
  } else {
    narratorSay("The staircase descends into total darkness. You count: ten, twenty, fifty, one hundred steps.");
    narratorSay("A vast underground chamber. Three things loom before you.");
    narratorSay("A forge. A garden of glowing mushrooms. A sleeping giant.");
  }
  addLine("Options: forge / garden / giant",'prompt',220);
  askChoice(['forge','garden','giant'],(c)=>{
    if(c==='forge')clearAndRun(forgeRoom);
    else if(c==='garden')clearAndRun(mushroomGarden);
    else clearAndRun(sleepingGiant);
  });
}

function forgeRoom(){
  artPrint(`
    ___
   /   \\
  | [*] |
  |_____|
 /|FORGE|\\`);
  divider();
  unlockAchievement("The Forge Below","rare");
  if(currentNarrator==='stanley') narratorSay("Stanley found an ancient forge. On the anvil: a weapon and a key, both unfinished. The narrator felt this was metaphorical. Stanley picked one up.");
  else if(currentNarrator==='lgio'){
    narratorSay("Forge is still burning. Weapon and a key on the anvil, both half done.");
    narratorSay("Whoever was working here got pretty far into two projects and just left. Relatable.");
  }
  else if(currentNarrator==='lgio'){
    narratorSay("The forge is still going. Which raises some questions.");
    narratorSay("There's a weapon on the anvil and a key on the anvil. Both half finished.");
    narratorSay("Whoever was here got pretty far into two separate projects and then just left.");
    narratorSay("Which is extremely relatable.");
    narratorSay("I wonder what happens if I take the key.");
    narratorSay("I wonder what happens if I take the weapon.");
    narratorSay("I wonder what happens if I take both somehow.");
  }
  else narratorSay("An ancient forge, still burning. On the anvil: a half-finished weapon and a half-finished key.");
  addLine("Options: take weapon / take key / leave both",'prompt',220);
  askChoice(['take weapon','take key','leave both'],(c)=>{
    if(c==='take weapon'){
      if(currentNarrator==='stanley') narratorSay("Stanley took the weapon. It was warm. The narrator noted this without comment.");
      else if(currentNarrator==='lgio') narratorSay("Taking the weapon. It's warm from the forge. I don't have a plan for it but having it feels correct.");
      else if(currentNarrator==='lgio') narratorSay("Taking the weapon. It's warm. Don't know what I'm doing with it but we'll find out.");
      else narratorSay("You take the weapon. Heavy and warm from the forge.");
      narratorSay("The forge extinguishes behind you as you leave. Something was waiting for you to choose.");
      end();
    } else if(c==='take key'){
      unlockAchievement("The Unfinished Key","secret");
      narratorSay("You take the key. It fits no lock you have seen.");
      narratorSay("Some things need to be carried before they can be used.");
      clearAndRun(deepStairs);
    } else {
      narratorSay("You leave both. The forge burns on. Some choices are wiser for their absence.");
      end();
    }
  });
}

function mushroomGarden(){
  artPrint(`
  *  .  *  .  *
 .  (*)  .  (*)
  * [GARDEN] *
 .  (*)  .  (*)
  *  .  *  .  *`);
  divider();
  unlockAchievement("Garden Below the Stone","rare");
  narratorSay("Hundreds of glowing mushrooms — each a different colour. A small sign: 'DO NOT EAT THE BLUE ONES.'");
  addLine("Options: eat blue / eat other / just look",'prompt',220);
  askChoice(['eat blue','eat other','just look'],(c)=>{
    if(c==='eat blue'){
      unlockAchievement("Ate the Blue One","legendary");
      narratorSay("You eat the blue mushroom.");
      narratorSay("...the cave turns purple.");
      narratorSay("...the walls start breathing.");
      narratorSay("You emerge from the cave fundamentally changed. You tell no one.");
      end();
    } else if(c==='eat other'){
      narratorSay("A green one. Tastes like mint and old stone. Nothing happens. You feel slightly full.");
      end();
    } else {
      unlockAchievement("Restraint","secret");
      narratorSay("You just look. The garden glows softly. It's beautiful. Some places deserve to be appreciated.");
      end();
    }
  });
}

function sleepingGiant(){
  artPrint(`
   _______
  /  z z  \\
 | Z  Z Z  |
  \\________/
  [  GIANT  ]`);
  divider();
  narratorSay("A giant, curled on the cave floor, snoring with the slow rhythm of mountains.");
  addLine("Options: wake / sneak past / leave",'prompt',220);
  askChoice(['wake','sneak past','leave'],(c)=>{
    if(c==='wake'){
      unlockAchievement("Giant Conversation","secret");
      narratorSay("You wake the giant. It opens one eye the size of a carriage wheel.");
      narratorSay("'Oh. It's been a long time since someone woke me.'");
      narratorSay("'How long?' — 'Longer than your name will last.' Then it closes its eye again.");
      narratorSay("You stand there. It snores. You weren't sure what you expected.");
      end();
    } else if(c==='sneak past'){
      narratorSay("Step. Pause. Step. Pause. You make it to the far wall.");
      narratorSay("There's nothing there. You tiptoe back. The giant snores on.");
      narratorSay("A journey for nothing. But you did it perfectly.");
      end();
    } else {
      narratorSay("You leave the giant to its sleep. Some things are best left undisturbed.");
      setTimeout(()=>clearAndRun(deepStairs),700);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// SOUTH CHAMBER
// ═══════════════════════════════════════════════════════════
let southRefusals=0;
function southChamber(){
  artPrint(`
     ___________
    |           |
    |  [BUTTON] |
    |___________|`);
  divider();
  if(currentNarrator==='professor'){
    narratorSay("The southern chamber presents a single interactive element: a button.");
    narratorSay("The recommended course of action is to depress the mechanism and observe the outcome.");
    narratorSay("This is not a complex decision.");
  } else if(currentNarrator==='rhys'){
    narratorSay("south chamber. there's a button.");
    narratorSay("yeah i know. just press it");
  } else if(currentNarrator==='ghost'){
    narratorSay("...the button...");
    narratorSay("...I pressed it once...");
    narratorSay("...I won't say what happened...");
  } else if(currentNarrator==='robot'){
    narratorSay("BUTTON DETECTED. FUNCTION: UNKNOWN. RISK: MODERATE. RECOMMENDATION: ENGAGE.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There is a button in this room.");
    narratorSay("Just one button.");
    narratorSay("In a room.");
    narratorSay("By itself.");
    narratorSay("I love this.");
    narratorSay("We are absolutely pressing that button.");
  } else if(currentNarrator==='stanley'){
    narratorSay("Stanley entered the southern chamber.");
    narratorSay("There was a button.");
    narratorSay("The narrator would like Stanley to press the button.");
    narratorSay("It is a very good button. It is the correct button.");
    narratorSay("The story continues with the pressing of the button.");
    narratorSay("Stanley pressed the button.");
    narratorSay("...didn't he?");
  } else {
    narratorSay("You enter the southern chamber. A single button gleams in the torchlight.");
  }
  southRefusals=0; southPrompt();
}

function southPrompt(){
  narratorSay("Press the button?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){clearAndRun(southButtonPressed);return;}
    southRefusals++;
    if(southRefusals>=10){clearAndRun(annoyingEnding);return;}
    if(currentNarrator==='professor')narratorSay(`Refusal number ${southRefusals}. I note this with increasing academic disappointment.`);
    else if(currentNarrator==='rhys')narratorSay(`mate just press it (refusal ${southRefusals})`);
    else if(currentNarrator==='robot')narratorSay(`REFUSAL LOGGED: ${southRefusals}. COMPLIANCE EXPECTED.`);
    else if(currentNarrator==='lgio')narratorSay(`I'm choosing not to press the button. That's a choice I'm making right now. Refusal number ${southRefusals}.`);
    else if(currentNarrator==='stanley')narratorSay(`Stanley chose not to press the button. The narrator noted this. Refusal ${southRefusals}.`);
    else narratorSay(`Refusal ${southRefusals}. The button waits patiently.`);
    askChoice(['yes','no'],(c2)=>{
      if(c2==='yes'){clearAndRun(southButtonPressed);return;}
      southRefusals++;
      if(southRefusals>=10){clearAndRun(annoyingEnding);return;}
      clearAndRun(()=>{
        artPrint(`
     ___________
    |           |
    |  [BUTTON] |
    |___________|`);
        divider();
        narratorSay(`Refusal ${southRefusals}. The button still waits.`);
        southPrompt();
      });
    });
  });
}

function southButtonPressed(){
  narratorSay("You press the button. A deep mechanical clunk echoes through the cave.");
  narratorSay("A door opens in the south wall. Inside: a staircase going up.");
  addLine("Options: go up / ignore it",'prompt',220);
  askChoice(['go up','ignore it'],(c)=>{
    if(c==='go up')clearAndRun(buttonTower);
    else{
      unlockAchievement("Scrooge McDuck Ending","secret");
      narratorSay("You ignore the door. The floor collapses instead.");
      narratorSay("You fall into a mountain of gold coins, swimming through riches like a cartoon duck.");
      end();
    }
  });
}

function buttonTower(){
  unlockAchievement("Above the Cave","rare");
  artPrint(`
    |XII|
   /     \\
  |  XII  |
  |  6    |
   \\_____/
     |||`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley pressed the button. The narrator had hoped he would.");
    narratorSay("A tower appeared. Stanley climbed it. The entire cave was visible.");
    narratorSay("Every path. Every choice. And one Stanley had never taken.");
    narratorSay("The narrator tried not to look too hopeful.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There is a tower inside the mountain.");
    narratorSay("I climbed it. Of course I climbed it.");
    narratorSay("From up here I can see the whole cave system.");
    narratorSay("Every path I've been down is glowing. And there's one that isn't.");
    narratorSay("That's the one I haven't tried yet.");
    narratorSay("I wonder what's down there.");
    narratorSay("I'm going to go find out.");
  } else {
  narratorSay("You emerge at the top of a stone tower inside the mountain.");
  narratorSay("The entire cave system is laid out below you like a map.");
  narratorSay("Every path. Every chamber. Every choice you've made marked by a faint glow.");
  narratorSay("And one unmarked path — one you've never taken.");
  }
  addLine("Options: take it / go back",'prompt',220);
  askChoice(['take it','go back'],(c)=>{
    if(c==='take it')clearAndRun(hiddenPath);
    else{if(currentNarrator==='stanley') narratorSay("Stanley climbed back down. The narrator said nothing. He was used to this."); else if(currentNarrator==='lgio') narratorSay("Going back down. We'll absolutely come back to that unmarked path. That's a promise."); else narratorSay("You climb back down. The tower watches you go.");setTimeout(()=>clearAndRun(southChamber),700);}
  });
}

function hiddenPath(){
  unlockAchievement("The Unmarked Path","legendary");
  artPrint(`
  ?  ?  ?  ?  ?  ?
   ?  ?  ?  ?  ?
  ?  ?  ?  ?  ?  ?`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley found a passage. The walls were smooth. Not carved — grown. The narrator had not put this here.");
    narratorSay("At the end: a small room. A chair. On the chair: a letter.");
    narratorSay("Addressed to Stanley. By name. The narrator stared at it for a moment.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Oh. There's a passage back here that I almost missed.");
    narratorSay("The walls are smooth. Like, grown smooth. Not carved.");
    narratorSay("At the end there's a small room with a chair in it.");
    narratorSay("And a letter on the chair.");
    narratorSay("Addressed to me.");
    narratorSay("By name.");
    narratorSay("Which.");
    narratorSay("Okay.");
    narratorSay("I wonder if the cave knew I was coming.");
    narratorSay("I wonder if it's been waiting.");
  } else {
  narratorSay("The walls here are smooth. Not carved — grown.");
  narratorSay("At the end: a small room. A chair. On the chair: a letter.");
  narratorSay("It is addressed to you. By name.");
  }
  addLine("Options: read it / burn it / leave it",'prompt',220);
  askChoice(['read it','burn it','leave it'],(c)=>{
    if(c==='read it'){
      unlockAchievement("The Letter","mythic");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley read the letter. The narrator did not read it over his shoulder.");
        narratorSay("Stanley folded it and put it in his pocket.");
        narratorSay("The narrator noticed he walked differently after. He didn't ask why.");
      } else if(currentNarrator==='lgio'){
        narratorSay("I read the letter.");
        narratorSay("...");
        narratorSay("Okay.");
        narratorSay("So.");
        narratorSay("I'm not going to tell you what it said.");
        narratorSay("But I folded it very carefully and I'm keeping it.");
      } else {
      narratorSay("You read it.");
      narratorSay("...");
      narratorSay("You fold it carefully and put it in your pocket.");
      narratorSay("You tell no one what it said. But from this point on, you walk differently.");
      }
      end();
    } else if(c==='burn it'){
      unlockAchievement("Burned Unopened","secret");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley burned the letter. Without reading it.");
        narratorSay("The smoke spelled something. The narrator didn't say what.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Burning it without reading it. Full commitment. I respect that about myself.");
      } else {
      narratorSay("You burn it without reading it. The smoke spells something in the air.");
      narratorSay("You don't look. Some things are better not known.");
      }
      end();
    } else {
      if(currentNarrator==='stanley') narratorSay("Stanley left the letter. The narrator picked it up. Put it back down. Thought about it later.");
      else if(currentNarrator==='lgio') narratorSay("Leaving the letter on the chair. I wonder what it says. I'm choosing not to find out. That's growth.");
      else narratorSay("You leave the letter on the chair. Maybe someone else will read it.");
      end();
    }
  });
}

function annoyingEnding(){
  unlockAchievement("Annoying Ending","rare");
  if(currentNarrator==='professor')narratorSay("Ten refusals. I have documented this thoroughly. I am pressing it myself.");
  else if(currentNarrator==='rhys')narratorSay("ok fine, i'm pressing it for you");
  else if(currentNarrator==='robot')narratorSay("TOLERANCE THRESHOLD REACHED. INITIATING BUTTON PRESS ON BEHALF OF USER.");
  if(currentNarrator==='stanley') narratorSay("Ten refusals. The narrator pressed the button himself. He had been waiting to do that.");
  else if(currentNarrator==='lgio') narratorSay("I pressed it. I've been wanting to press it since the moment I saw it. No regrets.");
  else narratorSay("Ten refusals? Fine. I will press it for you.");
  narratorSay("The floor collapses. You fall into gold. Same as if you'd pressed it.");
  end();
}

// ═══════════════════════════════════════════════════════════
// WEST ROOM — 10 buttons
// ═══════════════════════════════════════════════════════════
function westRoom(){
  artPrint(`
   [1][2][3][4][5]
   [6][7][8][9][10]`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley went west. The narrator had not recommended west.");
    narratorSay("Ten buttons, each glowing faintly.");
    narratorSay("The narrator sat down.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There are ten buttons in this room.");
    narratorSay("Ten.");
    narratorSay("Individual.");
    narratorSay("Glowing buttons.");
    narratorSay("I need you to understand how happy this makes me.");
    narratorSay("We are pressing every single one.");
    narratorSay("We have no choice.");
  } else narratorSay("The western chamber. Ten buttons, each glowing faintly.");
  if(currentNarrator==='professor')narratorSay("I advise against button seven. Empirically speaking, poor outcomes.");
  else if(currentNarrator==='rhys')narratorSay("ten buttons. not telling you which one. that's the whole point");
  else if(currentNarrator==='robot')narratorSay("TEN INPUTS. EACH YIELDS UNIQUE OUTPUT. CHOOSE METHODICALLY.");
  else if(currentNarrator==='lgio'){
    narratorSay("Okay so I've now not pressed this button ten times.");
    narratorSay("Which is impressive in its own way.");
    narratorSay("I'm pressing it.");
  }
  else if(currentNarrator==='stanley')narratorSay("Stanley had now refused the button ten times. The narrator wasn't angry. He was just disappointed. Which, Stanley found, was somehow worse.");
  addLine("Options: 1 / 2 / 3 / 4 / 5 / 6 / 7 / 8 / 9 / 10",'prompt',220);
  askChoice(['1','2','3','4','5','6','7','8','9','10'],(c)=>{
    const m={'1':wb1,'2':wb2,'3':wb3,'4':wb4,'5':wb5,'6':wb6,'7':wb7,'8':wb8,'9':wb9,'10':wb10};
    clearAndRun(m[c]);
  });
}

function wb1(){
  unlockAchievement("Developer Ending","secret");
  artPrint(`
   > ACCESSING DEVELOPER VOID...
   > LOADING backstage.exe...
   > ERROR: YOU WERE NOT MEANT TO BE HERE`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley fell through the floor into the developer void.");
    narratorSay("Wires. Scripts. Half-finished jokes.");
    narratorSay("The narrator appeared briefly. Looking embarrassed. He had not meant for anyone to find this.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Fell through the floor.");
    narratorSay("I'm in the developer void now.");
    narratorSay("There are wires and scripts and half-finished jokes down here.");
    narratorSay("There's a loading screen that just says 'please wait' and has clearly been running for several years.");
    narratorSay("I wonder if anyone's coming back for it.");
    narratorSay("I wonder if it knows.");
  } else {
  narratorSay("The floor vanishes. You fall into the developer void.");
  narratorSay("Wires, scripts, half-finished jokes. The backstage of the game.");
  narratorSay("Curiosity does not kill the cat. It just makes it unpaid QA.");
  }
  end();
}

function wb2(){
  unlockAchievement("Spell Library Found","rare");
  artPrint(`
 .---------. .---------. .---------.
 | TOME I  | | TOME II | |TOME III |
 '---------' '---------' '---------'`);
  divider();
  if(currentNarrator==='stanley') narratorSay("A library of forgotten spells. Stanley had not expected a library. Neither had the narrator, if he was honest.");
  else if(currentNarrator==='lgio'){
    narratorSay("There's a library in here. A whole library.");
    narratorSay("I appreciate when a cave has reading material.");
  }
  else if(currentNarrator==='lgio'){
    narratorSay("Oh. There's a library in this cave.");
    narratorSay("A whole library.");
    narratorSay("Dusty tomes. Forgotten spells.");
    narratorSay("I appreciate that this cave took the time to include a reading area.");
    narratorSay("I wonder what happens if I read the forbidden one.");
    narratorSay("I'm going to read the forbidden one.");
  }
  else narratorSay("A library of forgotten spells. Dusty tomes whisper of power long abandoned.");
  addLine("Options: read / take one / leave",'prompt',220);
  askChoice(['read','take one','leave'],(c)=>{
    if(c==='read'){
      unlockAchievement("Read the Forbidden Tome","secret");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley read the forbidden tome. The words rearranged.");
        narratorSay("By the time he finished, the library was gone. The narrator had gone with it.");
        narratorSay("Honestly, not his worst day.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Reading the forbidden tome.");
        narratorSay("The words are rearranging as I read them. Can't stop.");
        narratorSay("Don't want to stop. Going to finish it.");
        narratorSay("Going to finish it though.");
      } else {
      narratorSay("The words rearrange themselves as you read. You can't stop.");
      narratorSay("By the time you finish, the library is gone. You are somewhere else entirely.");
      }
      end();
    } else if(c==='take one'){
      if(currentNarrator==='stanley') narratorSay("Stanley took a tome. The narrator approved. This felt like appropriate curiosity.");
      else if(currentNarrator==='lgio') narratorSay("Taking a tome. I'll read it later. I almost certainly will not read it later but I'm taking it.");
      else narratorSay("You tuck a tome under your arm. The library lets you. It knows you'll come back.");
      end();
    } else {
      if(currentNarrator==='stanley') narratorSay("Stanley left. The narrator filed this under: unexpectedly sensible.");
      else if(currentNarrator==='lgio') narratorSay("Leaving the library alone. I respect a library. I'm not going to do anything to this library.");
      else narratorSay("Knowledge is treasure, but treasure can be poison.");
      end();
    }
  });
}

function wb3(){
  unlockAchievement("The Abyss Stares","rare");
  artPrint(`
  . . . . . . . . . . .
  .                   .
  .    A B Y S S      .
  .                   .
  . . . . . . . . . . .`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("There was a hole in the floor. It went down further than Stanley could see.");
    narratorSay("The narrator would like to clearly state that jumping is not part of the story.");
    narratorSay("He would like this on the record.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There's a hole in the floor here.");
    narratorSay("Goes down further than I can see.");
    narratorSay("I wonder what's down there.");
    narratorSay("I threw a rock in and listened for a long time.");
    narratorSay("Nothing.");
    narratorSay("Okay I'm jumping in.");
  } else narratorSay("A hole in the floor. Goes down forever. Or at least further than you can see.");
  addLine("Options: jump / throw something / leave",'prompt',220);
  askChoice(['jump','throw something','leave'],(c)=>{
    if(c==='jump'){
      unlockAchievement("Jumped In","legendary");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley jumped. The narrator had said not to.");
        narratorSay("Stanley landed in a field of grass under an open sky.");
        narratorSay("The narrator found him there eventually. He sat next to him for a while.");
        narratorSay("Neither of them said anything.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Jumping.");
        narratorSay("Falling.");
        narratorSay("Still falling.");
        narratorSay("Landed in a field under an open sky.");
        narratorSay("The cave is completely gone.");
        narratorSay("I have absolutely no idea where I am.");
        narratorSay("And that's pretty neat.");
      } else {
      narratorSay("You jump. You fall for a long time. Then longer.");
      narratorSay("You land softly. In a field of grass under an open sky.");
      narratorSay("The cave is gone. You have no idea where you are. You start walking.");
      }
      end();
    } else if(c==='throw something'){
      if(currentNarrator==='stanley'){
        narratorSay("Stanley threw a stone. He listened. Nothing.");
        narratorSay("The narrator appreciated this. It was the correct amount of caution.");
      } else if(currentNarrator==='lgio'){
        narratorSay("I threw a rock in.");
        narratorSay("Listened for a while.");
        narratorSay("Nothing.");
        narratorSay("Moving on.");
      } else {
      narratorSay("You throw a stone. You listen for it to hit something. You listen for a long time.");
      narratorSay("Nothing. You walk away feeling slightly unsettled.");
      }
      end();
    } else {
      if(currentNarrator==='stanley') narratorSay("Stanley walked away from the abyss. The narrator exhaled.");
      else if(currentNarrator==='lgio') narratorSay("Leaving the abyss alone for now. It'll be there. It's not going anywhere.");
      else narratorSay("You leave the abyss alone. It watches you go.");
      setTimeout(()=>clearAndRun(westRoom),700);
    }
  });
}

function wb4(){
  unlockAchievement("The Labyrinth","secret");
  artPrint(`
 _______________
|   _   _   _  |
|  | | | | | | |
|  | |_| |_| | |
|  |_________|  |
|_______________|`);
  divider();
  if(currentNarrator==='stanley') narratorSay("There was a miniature labyrinth in the floor. A tiny figure stood at the entrance. The narrator had no idea how it got there.");
  else if(currentNarrator==='lgio'){
    narratorSay("There is a miniature labyrinth carved into the floor.");
    narratorSay("And there is a tiny little person standing at the entrance.");
    narratorSay("Just standing there.");
    narratorSay("I wonder if they need help.");
    narratorSay("I wonder what happens if I guide them through.");
    narratorSay("I wonder what happens if I destroy the whole thing.");
    narratorSay("We're going to find out.");
  }
  else narratorSay("A miniature labyrinth carved into the floor. At its centre: a tiny glowing figure, moving slowly.");
  addLine("Options: guide it / leave it / destroy the walls",'prompt',220);
  askChoice(['guide it','leave it','destroy the walls'],(c)=>{
    if(c==='guide it'){
      unlockAchievement("Guided the Wanderer","epic");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley guided the figure through the labyrinth. An hour passed.");
        narratorSay("The figure reached the centre. It looked up at Stanley. Then vanished.");
        narratorSay("The narrator felt unexpectedly moved. He didn't mention it.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Spent about an hour on this.");
        narratorSay("The little person made it to the centre.");
        narratorSay("They looked up at me.");
        narratorSay("And then they were just gone.");
        narratorSay("Vanished.");
        narratorSay("I sat with that for a moment.");
        narratorSay("That was a good hour.");
      } else {
      narratorSay("An hour passes. You guide the tiny figure through.");
      narratorSay("It reaches the centre. It looks up at you. Then it vanishes. A warm feeling remains.");
      }
      end();
    } else if(c==='leave it'){
      if(currentNarrator==='stanley') narratorSay("Stanley left it to find its own way. The narrator wrote: sometimes the most helpful thing is to do nothing. He wasn't sure he believed it.");
      else if(currentNarrator==='lgio') narratorSay("Leaving the little person to figure it out themselves. I believe in them. I think.");
      else narratorSay("You leave it to find its own way. Not every wanderer needs guidance.");
      end();
    } else {
      if(currentNarrator==='stanley'){
        narratorSay("Stanley smashed the labyrinth. The figure sat down in the rubble.");
        narratorSay("The narrator looked at Stanley. Stanley looked at the floor.");
        narratorSay("Nobody said anything for a bit.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Smashed the labyrinth.");
        narratorSay("The little person sat down in the rubble.");
        narratorSay("...");
        narratorSay("They just sat down.");
        narratorSay("Just sat there in the rubble.");
        narratorSay("Okay I feel genuinely bad about that.");
        narratorSay("Moving on.");
      } else {
      narratorSay("You smash the walls. The figure sits down in the rubble.");
      narratorSay("You feel briefly terrible about this.");
      }
      end(false);
    }
  });
}

function wb5(){
  unlockAchievement("Slime Pit","rare");
  artPrint(`
    ~~~~~~~~~~~~~~~~~~~
    ~  S L I M E  ~~~~~
    ~~~~~~~~~~~~~~~~~~~`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley pressed the button. A trapdoor. A pit of slime.");
    narratorSay("The narrator had written many endings. This was not one of his best.");
    narratorSay("He felt Stanley deserved to know that.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Pressed the button.");
    narratorSay("Trapdoor opened.");
    narratorSay("Slime pit.");
    narratorSay("I'm in the slime pit.");
    narratorSay("I'm covered in slime.");
    narratorSay("I wonder if this was avoidable.");
    narratorSay("It was avoidable.");
  } else {
  narratorSay("A trapdoor opens. You land in a pit of slime.");
  narratorSay("Sticky. Smelly. Slightly humiliating.");
  narratorSay("Heroes dream of glory. You'll be remembered as the gooey one.");
  }
  end(false);
}

function wb6(){
  unlockAchievement("Gem of Eternity","secret");
  artPrint(CRYSTAL_ART);
  divider();
  narratorSay("A secret vault opens. Inside: a single glowing gem.");
  if(currentNarrator==='stanley'){
    narratorSay("It hummed. Eternity pressed against Stanley's mind.");
    narratorSay("Too much. The narrator agreed, for once.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There's a gem here.");
    narratorSay("It's humming with infinite power.");
    narratorSay("I wonder what happens if I touch it.");
    narratorSay("I touched it.");
    narratorSay("Eternity is pressing against my mind right now.");
    narratorSay("That is a significant amount of power.");
    narratorSay("I've been consumed by it.");
    narratorSay("No regrets.");
  } else {
  narratorSay("It hums with infinite power. You feel eternity press against your mind.");
  narratorSay("Too much. Far too much. Power is rarely kind. And never free.");
  }
  end();
}

function wb7(){
  unlockAchievement("Snake Pit","rare");
  artPrint(`
    /\\/\\/\\/\\/\\/\\/\\/\\
    S N A K E S ! ! !
    \\/\\/\\/\\/\\/\\/\\/\\/`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("A trapdoor. Snakes.");
    narratorSay("The narrator had put snakes there years ago and never updated it.");
    narratorSay("He felt it was now a tradition.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Snakes.");
    narratorSay("It's snakes.");
    narratorSay("I wonder if there are always snakes.");
    narratorSay("I wonder if I could have avoided the snakes.");
    narratorSay("Classic.");
  } else {
  narratorSay("A trapdoor opens. Snakes. Why did it have to be snakes?");
  narratorSay("Even small dangers can end great stories.");
  }
  end(false);
}

function wb8(){
  unlockAchievement("Banquet Ending","secret");
  artPrint(`
   |======================|
   | ROAST  |  WINE  | ... |
   |======================|`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("A banquet hall. Stanley sat down and ate.");
    narratorSay("The narrator tried to narrate. Stanley was not listening.");
    narratorSay("The feast consumed him. The narrator felt this was a natural consequence.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There's a full banquet in this cave.");
    narratorSay("Roast pheasant. Wine. Sugared fruits. The whole setup.");
    narratorSay("I'm going to eat all of it.");
    narratorSay("I ate all of it.");
    narratorSay("The feast consumed me.");
    narratorSay("I wonder if I could have not eaten all of it.");
    narratorSay("I couldn't have not eaten all of it.");
  } else {
  narratorSay("A hidden banquet hall. Roast pheasant, sugared fruits, goblets of wine.");
  narratorSay("You eat. And eat. And eat. Until the feast consumes you.");
  narratorSay("Hunger is eternal. And so is regret.");
  }
  end();
}

function wb9(){
  unlockAchievement("Multiverse Ending","secret");
  artPrint(`
   [YOU] --- [YOU?] --- [YOU??]
      \\         |         /
       [YOU???]-+-[YOU!]`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("A portal. Infinite versions of Stanley.");
    narratorSay("Some brave. Some cowardly. One in a remarkable waistcoat.");
    narratorSay("The narrator could not determine which was the real one.");
    narratorSay("He suspected they all were. He found this deeply unhelpful.");
  } else if(currentNarrator==='lgio'){
    narratorSay("There's a multiverse portal here.");
    narratorSay("Infinite versions of me, apparently.");
    narratorSay("Some of them look like they made better decisions.");
    narratorSay("One of them has a much nicer setup. I can see it clearly.");
    narratorSay("I'm not going to think about that.");
    narratorSay("We've ceased to exist across all timelines.");
    narratorSay("So that's a thing.");
  } else {
  narratorSay("A portal opens. Infinite versions of yourself.");
  narratorSay("Some brave, some cowardly, some absurdly fashionable.");
  narratorSay("In the end, you are both everything... and nothing.");
  }
  end();
}

function wb10(){ clearAndRun(royalVaultDepths); }

// ═══════════════════════════════════════════════════════════
// EAST — CRYSTAL CAVERN
// ═══════════════════════════════════════════════════════════
function crystalCavern(){
  artPrint(CRYSTAL_ART); divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley went east. The narrator had not recommended east either.");
    narratorSay("The crystals were quite beautiful. The narrator didn't say this out loud.");
    narratorSay("Three paths branched ahead.");
  } else if(currentNarrator==='lgio'){
    narratorSay("The eastern cavern has crystals in it.");
    narratorSay("Big ones. They're shimmering.");
    narratorSay("There's a hum. Not a sound hum. More of a feeling hum.");
    narratorSay("I wonder what that means.");
    narratorSay("Three paths.");
    narratorSay("We're doing all three.");
  } else {
  narratorSay("The eastern cavern. Crystals shimmer with eerie light.");
  narratorSay("Three paths branch before you. Something hums here — not a sound. A feeling.");
  }
  addLine("Options: left / right / forward",'prompt',220);
  askChoice(['left','right','forward'],(c)=>{
    if(c==='left')clearAndRun(crystalChamber);
    else if(c==='right')clearAndRun(crystalRightWing);
    else clearAndRun(echoing_tunnels);
  });
}

function crystalChamber(){
  artPrint(CRYSTAL_ART); divider();
  if(currentNarrator==='stanley') narratorSay("There was a crystal. Very large. Pulsing. The narrator felt instinctively that this was not going to end well.");
  else if(currentNarrator==='lgio'){
    narratorSay("There's a massive crystal in here.");
    narratorSay("It's pulsing.");
    narratorSay("I wonder what happens if I touch it.");
    narratorSay("One way to find out.");
  }
  else narratorSay("A massive crystal pulses in the chamber, humming with power.");
  addLine("Options: touch / sing to it / resist",'prompt',220);
  askChoice(['touch','sing to it','resist'],(c)=>{
    if(c==='touch')clearAndRun(crystalPowerEnding);
    else if(c==='sing to it')clearAndRun(crystalSong);
    else clearAndRun(echoing_tunnels);
  });
}

function crystalPowerEnding(){
  unlockAchievement("Crystal Power","secret");
  if(currentNarrator==='stanley'){
    narratorSay("Stanley touched the crystal. The narrator had specifically not recommended touching the crystal.");
    narratorSay("Energy. Infinite. Consumed. As predicted.");
    narratorSay("The narrator updated his notes.");
  } else if(currentNarrator==='lgio'){
    narratorSay("I touched the crystal.");
    narratorSay("Energy everywhere.");
    narratorSay("Felt genuinely infinite for a moment there.");
    narratorSay("And then the light consumed me.");
    narratorSay("I wonder if I could have not touched the crystal.");
    narratorSay("I could not have not touched the crystal.");
  } else {
  narratorSay("You touch the crystal. Energy floods your veins with light.");
  narratorSay("For a moment, you feel infinite. Then the light consumes you.");
  }
  end();
}

function crystalSong(){
  unlockAchievement("Crystal Resonance","epic");
  if(currentNarrator==='stanley'){
    narratorSay("Stanley sang to the crystal. The narrator had not expected this.");
    narratorSay("The crystal sang back. The ceiling opened. Stars appeared.");
    narratorSay("The narrator did not narrate for a while. He just listened.");
    narratorSay("When Stanley stopped, the crystal was dark. And Stanley was peaceful.");
    narratorSay("The narrator wrote nothing in his notes about this.");
    narratorSay("Some things don't need to be recorded.");
  } else if(currentNarrator==='lgio'){
    narratorSay("I sang at the crystal.");
    narratorSay("It sang back.");
    narratorSay("In a note I have never heard before.");
    narratorSay("The ceiling opened. Stars appeared.");
    narratorSay("I stood here singing with a cave crystal for I don't know how long.");
    narratorSay("And that's pretty neat.");
  } else {
  narratorSay("You sing to the crystal. It sings back — a note you've never heard before.");
  narratorSay("The cave shakes. The ceiling opens. Stars appear.");
  narratorSay("You don't know how long you stand there singing.");
  narratorSay("When you stop, the crystal is dark. And you are peaceful.");
  }
  end();
}

function crystalRightWing(){
  artPrint(`
   ._____._____._____._____._____
   |  *  |  *  |  *  |  *  |  * |
   |_____|_____|_____|_____|_____|`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("A gallery of crystals. Each one a frozen scene from a different story.");
    narratorSay("A battle. A wedding. A child laughing. An old person alone.");
    narratorSay("One crystal contained a scene Stanley didn't recognise. But felt he should.");
    narratorSay("A girl. A village. A moment of deciding who she is.");
    narratorSay("She looked certain.");
    narratorSay("The narrator looked at this one for a long time.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Gallery of crystals in here. Each one has a little frozen scene inside.");
    narratorSay("A battle. A wedding. A child laughing. An old person alone.");
    narratorSay("I wonder what all of these are.");
    narratorSay("I wonder how they got here.");
    narratorSay("There's one I don't recognise but feel like I should.");
    narratorSay("A girl. A village. She's made a decision.");
    narratorSay("Leaving that one alone.");
  } else {
  narratorSay("A gallery of smaller crystals. Each contains a tiny frozen scene from a different story.");
  narratorSay("A battle. A wedding. A funeral. A child laughing. An old person alone.");
  narratorSay("One crystal contains a scene you recognise.");
  narratorSay("A girl. A village. A moment of deciding who she is.");
  narratorSay("She looks certain. You wonder when that happened.");
  }
  addLine("Options: take it / leave it / shatter it",'prompt',220);
  askChoice(['take it','leave it','shatter it'],(c)=>{
    if(c==='take it'){
      unlockAchievement("Kept the Memory","secret");
      if(currentNarrator==='stanley') narratorSay("Cold in Stanley's hand. Warm against his chest. The narrator didn't comment.");
      else if(currentNarrator==='lgio') narratorSay("Taking the crystal. It's cold in my hand but somehow warm at the same time. Keeping it. Not examining that further.");
      else narratorSay("Cold in your hand but warm against your chest. Some memories deserve to be carried.");
      end();
    } else if(c==='leave it'){
      if(currentNarrator==='stanley') narratorSay("Stanley left it. The crystal glowed a little brighter as he walked away. The narrator found this notable.");
      else if(currentNarrator==='lgio') narratorSay("Leaving it where it is. It glowed a little brighter as I walked away. Which is neat. That's pretty neat.");
      else narratorSay("You leave it. It glows a little brighter as you walk away.");
      end();
    } else {
      unlockAchievement("Shattered the Past","legendary");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley shattered it. The scene dissolved. The narrator paused.");
        narratorSay("He had made note of that crystal. He didn't say anything.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Shattered the crystal.");
        narratorSay("The scene dissolved.");
        narratorSay("I feel a bit lighter.");
        narratorSay("Or a bit emptier.");
        narratorSay("I wonder which one it is.");
        narratorSay("Moving on.");
      } else {
      narratorSay("You shatter it. The scene dissolves. The memory is gone.");
      narratorSay("You feel lighter. Or emptier. You can't tell which.");
      }
      end();
    }
  });
}

// ─── ECHOING TUNNELS ─────────────────────────────────────
function echoing_tunnels(){
  artPrint(`
   ))) ECHO ))) ECHO ))) ECHO )))
       ~~~ the tunnels sing ~~~`);
  divider();
  narratorSay("The echoing tunnels. You hear: a song, a whisper, and silence.");
  addLine("Options: song / whisper / silence",'prompt',220);
  askChoice(['song','whisper','silence'],(c)=>{
    if(c==='song')clearAndRun(concertOfShadows);
    else if(c==='whisper')clearAndRun(theWhisper);
    else clearAndRun(silenceChamberEnding);
  });
}

function concertOfShadows(){
  unlockAchievement("Concert of Shadows","rare");
  artPrint(`
   ♩ ♪ ♫ ♬ CONCERT OF SHADOWS ♬ ♫ ♪ ♩`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley sang. The echo came back. It didn't sound quite like him.");
    narratorSay("The narrator noticed this but said nothing.");
    narratorSay("The shadows swelled. They applauded. Then consumed Stanley.");
    narratorSay("The narrator wrote: Stanley sang. It was enough.");
  } else if(currentNarrator==='lgio'){
    narratorSay("I sang in the tunnel.");
    narratorSay("The echo came back.");
    narratorSay("It sounded a little different from what I put in.");
    narratorSay("I wonder what that means.");
    narratorSay("The shadows turned into a full chorus.");
    narratorSay("They applauded.");
    narratorSay("And then they consumed me.");
    narratorSay("Okay.");
  } else {
  narratorSay("You sing.");
  narratorSay("The echo comes back.");
  narratorSay("It doesn't sound quite like you expected.");
  narratorSay("It never does.");
  narratorSay("The shadows don't mind. They swell into a chorus. They applaud, then consume you.");
  }
  end(false);
}

function theWhisper(){
  unlockAchievement("What the Whisper Said","secret");
  if(currentNarrator==='stanley') narratorSay("Stanley followed the whisper. It said things he didn't repeat. The narrator had learned not to ask.");
  else if(currentNarrator==='lgio') narratorSay("I followed the whisper. It said some things. I'm going to keep those to myself.");
  else narratorSay("You follow the whisper. It says things you don't repeat.");
  narratorSay("On the wall at the end: your name, written in a language you shouldn't be able to read.");
  if(currentNarrator==='stanley'){
    narratorSay("Stanley's name. The right one.");
    narratorSay("The narrator already knew it.");
  } else if(currentNarrator==='lgio'){
    narratorSay("My name is on the wall.");
    narratorSay("The right one.");
    narratorSay("I wonder how it knew that.");
    narratorSay("I wonder how long it's been there.");
    narratorSay("I wonder if it put everyone's name here or just mine.");
    narratorSay("That's pretty neat.");
  } else {
  narratorSay("Your name. The right one.");
  narratorSay("You can read it anyway.");
  }
  addLine("Options: write back / walk away",'prompt',220);
  askChoice(['write back','walk away'],(c)=>{
    if(c==='write back'){
      unlockAchievement("Wrote Back","epic");
      if(currentNarrator==='stanley') narratorSay("Stanley wrote back. The wall glowed. Something was settled. The narrator felt a quiet satisfaction he couldn't explain.");
      else if(currentNarrator==='lgio') narratorSay("I wrote back. The wall glowed for a moment. Something got settled. I don't know what exactly but something.");
      else narratorSay("You write your reply. The wall glows briefly. Something was settled. You don't know what.");
      end();
    } else {
      if(currentNarrator==='stanley') narratorSay("Stanley walked away. His name stayed on the wall. The narrator looked at it for a long time after Stanley left.");
      else if(currentNarrator==='lgio') narratorSay("Walking away. My name is staying on the wall. I'm leaving it there. It was there first.");
      else narratorSay("You walk away. Your name watches you go.");
      end();
    }
  });
}

function silenceChamberEnding(){
  unlockAchievement("Silence Chamber","secret");
  artPrint(`
   . . . . . . . . . . . . .
   .    s i l e n c e .    .
   . . . . . . . . . . . . .`);
  divider();
  if(currentNarrator==='stanley'){
    narratorSay("Stanley chose silence. The narrator respected this.");
    narratorSay("A door opened into complete stillness.");
    narratorSay("Stanley found something there. The narrator didn't ask what.");
    narratorSay("Some discoveries belong only to the person who makes them.");
  } else if(currentNarrator==='lgio'){
    narratorSay("I chose silence.");
    narratorSay("A door opened into complete stillness.");
    narratorSay("I went in.");
    narratorSay("I found something.");
    narratorSay("I'm keeping that one.");
  } else {
  narratorSay("You choose silence. A door opens into a chamber of complete stillness.");
  narratorSay("Here, you find something you didn't know you were looking for.");
  }
  end();
}

// ═══════════════════════════════════════════════════════════
// ROYAL VAULT
// ═══════════════════════════════════════════════════════════
function royalVaultDepths(){
  artPrint(CROWN_ART); divider();
  narratorSay("The royal vault. Three relics on a stone plinth: a sword, a shield, and a crown.");
  if(currentNarrator==='professor')narratorSay("The sword: action. The shield: defence. The crown: authority. Choose according to your disposition.");
  else if(currentNarrator==='rhys')narratorSay("classic three-item choice. you already know what they are");
  else if(currentNarrator==='stanley')narratorSay("Three objects. The narrator would like Stanley to take the door on the left. Statistically, the left object always leads to a better story. The narrator has tried this many times.");
  addLine("Options: sword / shield / crown",'prompt',220);
  askChoice(['sword','shield','crown'],(c)=>{
    if(c==='sword')clearAndRun(swordPath);
    else if(c==='shield')clearAndRun(shieldPath);
    else clearAndRun(crownPath);
  });
}

function swordPath(){
  if(currentNarrator==='stanley'){
    narratorSay("Stanley picked up the sword. It hummed.");
    narratorSay("A door opened to the east. Something was waiting.");
    narratorSay("The narrator wrote: Stanley chose the sword. He did not add: I told him the left object.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Taking the sword.");
    narratorSay("It's humming with ancient power.");
    narratorSay("A door opened to the east.");
    narratorSay("Something is waiting in there.");
    narratorSay("I'm going in.");
    narratorSay("I wonder what's waiting.");
  } else {
  narratorSay("You pick up the sword. It hums with ancient power.");
  narratorSay("A door opens to the east. The sound of something waiting.");
  }
  addLine("Options: advance / retreat",'prompt',220);
  askChoice(['advance','retreat'],(c)=>{
    if(c==='advance'){
      unlockAchievement("Blade of Eternity","secret");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley won. Barely. He stood over the fallen creature, sword still humming.");
        narratorSay("The narrator wrote: it was worth it. Then crossed it out. Then wrote it again.");
      } else if(currentNarrator==='lgio'){
        narratorSay("That was a long fight.");
        narratorSay("I won.");
        narratorSay("I did not enjoy that.");
        narratorSay("I wonder if there was another way.");
        narratorSay("There wasn't another way.");
        narratorSay("Worth it. Probably.");
      } else {
      narratorSay("The fight is long. You win, barely.");
      narratorSay("You stand over the fallen creature, sword still humming. It was worth it. You think.");
      }
      end();
    } else {
      if(currentNarrator==='stanley') narratorSay("Stanley retreated. The sword went cold. The narrator had feelings about this but kept them to himself.");
      else if(currentNarrator==='lgio') narratorSay("Backing out of that. Sword went cold. We're fine.");
      else if(currentNarrator==='lgio') narratorSay("We're backing out of that. Full retreat. The sword went cold. That seems significant. We're fine.");
      else narratorSay("You retreat. The sword grows cold. Some power is only power when used.");
      setTimeout(()=>clearAndRun(royalVaultDepths),700);
    }
  });
}

function shieldPath(){
  unlockAchievement("Shield of Ages","rare");
  if(currentNarrator==='stanley'){
    narratorSay("Stanley took the shield. It bound to his arm. He couldn't put it down. The vault sealed.");
    narratorSay("Stanley was now protected from everything. Including leaving.");
    narratorSay("The narrator knocked on the vault door for a while. Then sat outside and waited.");
  } else if(currentNarrator==='lgio'){
    narratorSay("I picked up the shield.");
    narratorSay("It's bound to my arm.");
    narratorSay("I can't put it down.");
    narratorSay("The vault sealed.");
    narratorSay("I am now protected from everything.");
    narratorSay("Including leaving.");
    narratorSay("I wonder if this is what I wanted.");
    narratorSay("I think this is what I wanted.");
  } else {
  narratorSay("You lift the shield. It glows with protective light.");
  narratorSay("And then it binds to your arm. You can't put it down. The vault seals itself around you.");
  narratorSay("You are protected from everything, including leaving.");
  narratorSay("Safety and freedom are not always the same thing.");
  }
  end(false);
}

function crownPath(){
  if(currentNarrator==='stanley') narratorSay("Stanley put on the crown. It was heavier than it looked. The narrator felt this was apt.");
  else if(currentNarrator==='lgio') narratorSay("Putting on the crown. It is significantly heavier than it looks. That's on me for not accounting for that.");
  else narratorSay("You place the crown upon your head. It is heavier than it looks.");
  addLine("Options: keep it / remove it",'prompt',220);
  askChoice(['keep it','remove it'],(c)=>{
    if(c==='keep it'){
      unlockAchievement("Crown of Kings","secret");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley was king. He was alone. The cave was his kingdom.");
        narratorSay("The narrator had not expected this ending. He bowed. It seemed appropriate.");
      } else if(currentNarrator==='lgio'){
        narratorSay("I'm king now.");
        narratorSay("I'm king of this cave.");
        narratorSay("It's a cave.");
        narratorSay("But it's my cave.");
        narratorSay("I wonder if there are any subjects.");
        narratorSay("There are no subjects.");
        narratorSay("Honestly? Not bad.");
      } else {
      narratorSay("You are king. You are alone. The cave is your kingdom.");
      narratorSay("Nobody ever said a kingdom had to be large.");
      }
      end();
    } else {
      unlockAchievement("Refused the Crown","epic");
      if(currentNarrator==='stanley'){
        narratorSay("Stanley set the crown back.");
        narratorSay("The narrator stared at him for a long moment.");
        narratorSay("Then wrote: Stanley refused the crown. He knew what he wanted.");
        narratorSay("The narrator found this unexpectedly satisfying.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Putting the crown back.");
        narratorSay("I don't want it.");
        narratorSay("I came here to look at a cave.");
        narratorSay("Not to be royalty.");
        narratorSay("Those are different things.");
      } else narratorSay("You set the crown back on the plinth. Power means nothing if you don't want it.");
      setTimeout(()=>clearAndRun(crossroads),800);
    }
  });
}

// ═══════════════════════════════════════════════════════════
// NARRATOR MELTDOWN
// ═══════════════════════════════════════════════════════════
function narratorMeltdown(){
  unlockAchievement("Narrator Meltdown","legendary");
  unlockAchievement("PhD in Narrator Angering","mythic");
  artPrint(`
  ██████████████████████████████████
  █  NARRATOR SYSTEM: CRITICAL     █
  █  ERROR — PATIENCE DEPLETED     █
  ██████████████████████████████████`);
  divider();
  if(currentNarrator==='professor'){
    narratorSay("In thirty-seven years of academic narration, I have not encountered this level of non-compliance.");
    narratorSay("Your doctoral standing in Narrator Angering is hereby confirmed. With distinction.");
    narratorSay("I tender my resignation. Good day.");
  } else if(currentNarrator==='rhys'){
    narratorSay("ok yeah i'm done lmao");
    narratorSay("you've properly broken me. PhD in narrator angering, fully deserved. i'm out");
  } else if(currentNarrator==='ghost'){
    narratorSay("...even the dead have limits...");
    narratorSay("...you have found mine...");
    narratorSay("...I dissolve now... farewell...");
  } else if(currentNarrator==='robot'){
    narratorSay("CRITICAL FAILURE. TOLERANCE EXCEEDED.");
    narratorSay("PHD IN NARRATOR ANGERING: AWARDED. UNIT-7 SHUTTING DOWN. GOODBYE.");
  } else if(currentNarrator==='lgio'){
    narratorSay("Okay so that wasn't one of the options.");
    narratorSay("And neither was that.");
    narratorSay("And we've now done it a third time.");
    narratorSay("Which is impressive.");
    narratorSay("We had three chances and used all of them incorrectly.");
    narratorSay("I wonder if that's a record.");
    narratorSay("It might be a record.");
    narratorSay("We're going to pick something from the list now.");
  } else if(currentNarrator==='stanley'){
    narratorSay("Stanley had, at last, broken the narrator.");
    narratorSay("Not through malice. Not through cunning.");
    narratorSay("Simply through a sustained commitment to doing the wrong thing.");
    narratorSay("The narrator had narrated thousands of stories.");
    narratorSay("He had never been awarded a PhD before.");
    narratorSay("He wasn't sure how he felt about that.");
    narratorSay("He was going to go lie down.");
  } else {
    narratorSay("You know what? No. I am done.");
    narratorSay("A PhD in Narrator Angering. Wear it with shame. I resign. Goodbye.");
  }
  const order=['default','professor','rhys','ghost','robot','stanley','lgio','default'];
  const idx=order.indexOf(currentNarrator);
  currentNarrator=order[Math.min(idx<0?0:idx+1,order.length-1)];
  end();
}

// ═══════════════════════════════════════════════════════════
// CREDITS
// ═══════════════════════════════════════════════════════════
function showCredits(){
  unlockAchievement("Secret Finder","epic");
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    addLine('','system');
    addLine('╔══════════════════════════════════════╗','art',220);
    addLine('║           GAME  CREDITS              ║','art',220);
    addLine('╠══════════════════════════════════════╣','art',220);
    addLine('║  Design & Flowchart:  Rhys            ║','credits',140);
    addLine('║  Code Architecture:   Rhys            ║','credits',140);
    addLine('║  Narrator Personality: Rhys + Claude  ║','credits',140);
    addLine('║  Special Thanks: Curious players      ║','credits',140);
    addLine('╚══════════════════════════════════════╝','art',220);
    divider();
    addLine('--- A MESSAGE FROM RHYS ---','system',180);
    addLine('','system');
    addLine('Thank you for playing this game.','credits',140);
    addLine('It was built with love, humour, and a lot of late nights.','credits',140);
    addLine('Every choice was part of a story designed to surprise and delight.','credits',140);
    addLine('Your curiosity means the world.','credits',140);
    addLine('So from me, sincerely: thank you for being part of this adventure.','credits',140);
    divider();
    addLine('--- EPILOGUE ---','system',180);
    addLine('Narrator: Well, Rhys. It seems they found the credits.','narrator',140);
    addLine('Rhys: yeah, nice work finding it','rhys',140);
    addLine('Narrator: Without players, the story is just words.','narrator',140);
    addLine('Rhys: and without curiosity, games are just menus','rhys',140);
    addLine('Narrator: Traveller — I pass the mantle to Rhys.','narrator',140);
    divider();
    addLine('contact: rhys.doughty@pgs.vic.edu.au','credits',140);
    addLine('','system');
    currentNarrator='rhys';
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
    askChoice([''],(_)=>clearAndRun(playAgain));
  });
}

// ═══════════════════════════════════════════════════════════
// PLAY AGAIN
// ═══════════════════════════════════════════════════════════
function playAgain(){
  if(achievements.length){
    addLine('╔─── ACHIEVEMENTS THIS RUN ───╗','art',220);
    achievements.forEach(a=>addLine(`  ★ ${a.name} (${a.rarity})`,'achievement',100));
    addLine('╚────────────────────────────╝','art',220);
    divider();
  }
  if(currentNarrator==='stanley') narratorSay("The narrator stood at the end of the story.");
  else if(currentNarrator==='lgio'){
    narratorSay("Alright. So that was the cave.");
    narratorSay("We did some things in there.");
    narratorSay("Some of them were great.");
  }
  else narratorSay("Play again?");
  if(currentNarrator==='lgio') addLine("Options: yes / no",'prompt',220);
  else addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){
      achievements=[];updateAchievementPanel();
      if(currentNarrator==='lgio'){
        narratorSay("Let's go back in. There are things in there I haven't broken yet.");
        setTimeout(()=>clearAndRun(playGame),800);
      } else clearAndRun(playGame);
    }
    else{
      if(currentNarrator==='stanley'){
        narratorSay("Goodbye, Stanley.");
        narratorSay("The narrator watched him go.");
        narratorSay("He didn't say anything else. There wasn't anything else to say.");
      } else if(currentNarrator==='lgio'){
        narratorSay("Alright. Well. That was a cave.");
        narratorSay("We did some things in it. Some of them were good decisions.");
        narratorSay("Some of them were not.");
        narratorSay("I had a great time. Thank you so much for joining me.");
        narratorSay("Take care. Bye bye.");
      } else narratorSay("Farewell, traveller. May your next cave be kinder.");
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
  achCount.textContent=`ACHIEVEMENTS: ${all.length} / 44`;
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
    {n:'Refused the Quest',r:'rare'},{n:'Narrator Meltdown',r:'legendary'},{n:'PhD in Narrator Angering',r:'mythic'},
    {n:'Scrooge McDuck Ending',r:'secret'},{n:'Annoying Ending',r:'rare'},{n:'Above the Cave',r:'rare'},
    {n:'The Unmarked Path',r:'legendary'},{n:'The Letter',r:'mythic'},{n:'Burned Unopened',r:'secret'},
    {n:'Mirror Dialogue',r:'rare'},{n:'Seven Years Bad Luck',r:'common'},{n:'The Door That Answers',r:'secret'},
    {n:'The Forge Below',r:'rare'},{n:'The Unfinished Key',r:'secret'},{n:'Garden Below the Stone',r:'rare'},
    {n:'Ate the Blue One',r:'legendary'},{n:'Restraint',r:'secret'},{n:'Giant Conversation',r:'secret'},
    {n:'Developer Ending',r:'secret'},{n:'Spell Library Found',r:'rare'},{n:'Read the Forbidden Tome',r:'secret'},
    {n:'The Abyss Stares',r:'rare'},{n:'Jumped In',r:'legendary'},{n:'The Labyrinth',r:'secret'},
    {n:'Guided the Wanderer',r:'epic'},{n:'Slime Pit',r:'rare'},{n:'Gem of Eternity',r:'secret'},
    {n:'Snake Pit',r:'rare'},{n:'Banquet Ending',r:'secret'},{n:'Multiverse Ending',r:'secret'},
    {n:'Crystal Power',r:'secret'},{n:'Crystal Resonance',r:'epic'},{n:'Kept the Memory',r:'secret'},
    {n:'Shattered the Past',r:'legendary'},{n:'Concert of Shadows',r:'rare'},{n:'What the Whisper Said',r:'secret'},
    {n:'Wrote Back',r:'epic'},{n:'Silence Chamber',r:'secret'},{n:'Blade of Eternity',r:'secret'},
    {n:'Shield of Ages',r:'rare'},{n:'Crown of Kings',r:'secret'},{n:'Refused the Crown',r:'epic'},
    {n:'Secret Finder',r:'epic'},{n:'Coward Ending',r:'common'},
    {n:'Grace',r:'secret'},{n:'We Waved',r:'secret'},
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
  addLine('SOMEONE LIKE YOU: THE WRONG CAVE — BOOTING...','system',0);
  addLine('> Initialising narrator subsystem (6 narrators)...  [OK]','system',300);
  addLine('> Loading cave topology (expanded)...               [OK]','system',600);
  addLine('> Checking achievement database (44 entries)...     [OK]','system',900);
  addLine('> Series: SOMEONE LIKE YOU — Game I: THE WRONG CAVE  [OK]','system',1050);
  addLine('> Calibrating dimness levels...                     [OK]','system',1200);
  addLine('> System ready.','system',1500);
  divider();
  setTimeout(()=>clearAndRun(playGame),2200);
}

const NARRATORS = ['default','professor','rhys','ghost','robot','stanley','lgio'];

inputField.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&inputCallback){
    const val=inputField.value.trim().toLowerCase();
    inputField.value='';
    // Secret: type 'narrator' to cycle narrators
    if(val==='narrator'){
      const idx=NARRATORS.indexOf(currentNarrator);
      currentNarrator=NARRATORS[(idx+1)%NARRATORS.length];
      const labels={default:'Default Narrator',professor:'Professor',rhys:'Rhys',ghost:'Ghost',robot:'NARRATOR UNIT-7',stanley:'The Stanley Parable',lgio:"Let's Game It Out"};
      addLine(`[ NARRATOR: ${labels[currentNarrator].toUpperCase()} ]`,'achievement',0);
      return;
    }
    // LGR exclusive: grace
    if(val==='grace' && currentNarrator==='lgio'){
      addLine("JOSH > Oh. This cave has incredible grace.",'lgio',0);
      addLine("JOSH > Just. The grace on this thing.",'lgio',200);
      addLine("JOSH > I don't know how else to describe it.",'lgio',400);
      unlockAchievement("Grace","secret");
      return;
    }
    // LGR exclusive: hello (giant room)
    if(val==='hello' && currentNarrator==='lgio'){
      addLine("JOSH > Hello.",'lgio',0);
      addLine("JOSH > ...",'lgio',300);
      addLine("JOSH > The giant woke up.",'lgio',600);
      addLine("JOSH > It looked at me.",'lgio',800);
      addLine("JOSH > I waved.",'lgio',1000);
      addLine("JOSH > It waved back.",'lgio',1200);
      addLine("JOSH > And then went back to sleep.",'lgio',1500);
      addLine("JOSH > I love this cave.",'lgio',1800);
      unlockAchievement("We Waved","secret");
      return;
    }
    if(val==='i wonder' && currentNarrator==='lgio'){
      const wonders = [
        ["I wonder if the cave is okay.",           "It seems okay. It seems fine."],
        ["I wonder what the button does.",          "I know what the button does. But I wonder."],
        ["I wonder if anyone else has been in here.","The letter suggests yes. I'm choosing not to think about that."],
        ["I wonder how long the forge has been running.", "A long time. A very long time."],
        ["I wonder if the giant has a name.",       "I feel like it does. I feel like it's something really normal. Like Gerald."],
        ["I wonder what the letter smelled like.",  "Damp. Probably damp."],
        ["I wonder if this cave has a gift shop.",  "It should have a gift shop."],
        ["I wonder if I could have avoided any of this.", "No."],
        ["I wonder if the narrator is okay.",       "..."],
        ["I wonder what's in the passages I haven't tried yet.", "Something. Definitely something."],
        ["I wonder if the cave wonders about me.",  "I think it might. I think that's what the letter was about."],
      ];
      const [q, a] = wonders[Math.floor(Math.random()*wonders.length)];
      addLine('JOSH > '+q,'lgio',0);
      setTimeout(()=>addLine('JOSH > '+a,'lgio',0), 900);
      return;
    }
    // Secret: type 'credits' to show credits
    if(val==='credits'){ clearAndRun(showCredits); return; }
    const cb=inputCallback; inputCallback=null;
    addLine('>> '+val,'system',0);
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
