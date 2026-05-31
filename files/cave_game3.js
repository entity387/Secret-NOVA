// ═══════════════════════════════════════════════════════════
// SOMEONE LIKE YOU: FOR YOU
// cave_game3.js
// ═══════════════════════════════════════════════════════════

const output     = document.getElementById('output');
const inputField = document.getElementById('inputField');
const achCount   = document.getElementById('achCount');
const titleArtEl = document.getElementById('titleArt');

titleArtEl.textContent =
` ███████╗ ██████╗ ██████╗      ██╗   ██╗ ██████╗ ██╗   ██╗
 ██╔════╝██╔═══██╗██╔══██╗     ╚██╗ ██╔╝██╔═══██╗██║   ██║
 █████╗  ██║   ██║██████╔╝      ╚████╔╝ ██║   ██║██║   ██║
 ██╔══╝  ██║   ██║██╔══██╗       ╚██╔╝  ██║   ██║██║   ██║
 ██║     ╚██████╔╝██║  ██║        ██║   ╚██████╔╝╚██████╔╝
 ╚═╝      ╚═════╝ ╚═╝  ╚═╝        ╚═╝    ╚═════╝  ╚═════╝
              S O M E O N E   L I K E   Y O U   —   I I I`;


const SAVE_KEY = 'novaCaveAch3';
function loadSaved(){ try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'[]');}catch(_){return[];} }
function loadGame2Save(){ try{return JSON.parse(localStorage.getItem('sly_save')||'{}');}catch(_){return {};} }

let lineQueue=[], isTyping=false, inputCallback=null, invalidCount=0;
let currentNarrator='narrator', achievements=[];
let S={}, isabelleWithHazel=false;

const NS = {
  narrator: { cls:'narrator', invalid:["That isn't a path I can see from here.","I don't recognise that choice.","Something else, perhaps."] },
  hermes:   { cls:'hermes',   invalid:["That isn't the road, Hazel.","I know every path from here. That isn't one of them.","Try again."] },
  piper:    { cls:'piper',    invalid:["...that's not one of the options, love.","she waits. that's not a choice she recognises.","try again."] },
  eli:      { cls:'eli',      invalid:["...no.","that's not an option.","try something else."] },
  may:      { cls:'may',      invalid:["that's not quite it.","she tilts her head. tries again.","hmm. no. try again."] },
};

function N(l){ addLine(l,(NS[currentNarrator]||NS.narrator).cls,140); }
function hazel(l){ addLine(l,'hazel',100); }
function isabelle(l){ addLine(l,'isabelle',100); }
function hermes(l){ addLine(l,'hermes',140); }
function piper(l){ addLine(l,'piper',140); }
function eli(l){ addLine(l,'eli',140); }
function may(l){ addLine(l,'may',140); }
function rhys(l){ addLine(l,'rhys',140); }

let _noLimit = false;

function freeSpace(){ _noLimit = true; }
function restoreLimit(){ _noLimit = false; }

function addLine(text,cls,delay){
  if(delay===undefined)delay=0;
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
    if(!_noLimit){
      while(output.children.length>Math.floor(((window.visualViewport ? window.visualViewport.height : window.innerHeight) - 220)/(window.innerWidth < 600 ? 48 : 36)))output.removeChild(output.firstChild);
    }
    processQueue();
  },delay);
}
function clearScreen(cb){
  output.style.transition='opacity 0.3s'; output.style.opacity='0';
  setTimeout(()=>{output.innerHTML='';output.style.opacity='1';if(cb)cb();},320);
}
function divider(){ addLine('\u2500'.repeat(60),'divider',80); }
function artPrint(t){ addLine(t,'art',20); }
function artGold(t){ addLine(t,'art-gold',20); }
function blank(){ addLine('','system',40); }
function sys(t){ addLine(t,'system',60); }

function unlockAchievement(name,rarity){
  achievements.push({name,rarity});
  const all=loadSaved();
  if(!all.find(a=>a.name===name)){
    all.push({name,rarity,unlockedAt:Date.now()});
    localStorage.setItem(SAVE_KEY,JSON.stringify(all));
  }
  updateAchievementPanel();
  addLine('[+ ACHIEVEMENT: '+name.toUpperCase()+' ('+rarity.toUpperCase()+') +]','achievement',180);
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
        setTimeout(()=>clearAndRun(narratorLoss),300);
      } else {
        const inv=(NS[currentNarrator]||NS.narrator).invalid;
        addLine(inv[Math.floor(Math.random()*inv.length)],'system',0);
        setTimeout(()=>askChoice(validKeys,cb),400);
      }
    }
  };
}

function clearAndRun(fn){ clearScreen(()=>{lineQueue=[];isTyping=false;fn();}); }
function cont(fn){ blank(); addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220); askChoice([''],(_)=>clearAndRun(fn)); }

function narratorLoss(){
  unlockAchievement("Tested Hermes","rare");
  if(currentNarrator==='hermes'){
    hermes("I am a god, Hazel.");
    hermes("I have guided souls through the underworld for several thousand years.");
    hermes("I have never been ignored three times in a row.");
    hermes("I'm choosing to find this charming.");
    hermes("Let's continue.");
  } else if(currentNarrator==='piper'){
    piper("she laughs.");
    piper("she's seen a lot of things at that bus stop. not this.");
    piper("try again, love.");
  } else if(currentNarrator==='eli'){
    eli("...");
    eli("you know what. fine. let's just move on.");
  } else if(currentNarrator==='may'){
    may("she puts her hand on hazel's arm. gently.");
    may("'the options are on the screen, love.'");
  } else {
    N("Let's try that again.");
  }
  cont(playAgain);
}

// ═══ ART ═══════════════════════════════════════════════════
const HANDS_ART=`
         H A Z E L                   I S A B E L L E

           ▓▓▓   ▓▓▓                   ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓                   ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
           ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓
    ▓▓▓    ▓▓▓   ▓▓▓   ▓▓▓         ▓▓▓ ▓▓▓   ▓▓▓    ▓▓▓
    ▓▓▓    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓         ▓▓▓▓▓▓▓▓▓▓▓▓▓    ▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    ▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒
    ░░░▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░░
      ░░░▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒░░░
          ░░░░░▒▒▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒░░░░░
              ░░░░░░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░
                    ░░░░░░░░░░░░░░░░░░░░░
                          ░░░░░░░░░░`;

// ═══ BOOT ═══════════════════════════════════════════════════
function boot(){
  sys('SOMEONE LIKE YOU: FOR YOU — BOOTING...');
  sys('> Restoring narrator...');
  setTimeout(()=>{
    S=loadGame2Save();
    const hasData=Object.keys(S).length>0;
    if(hasData){
      sys('> Save data found from THE ROAD HOME.   [OK]');
      setTimeout(()=>{
        sys('> Coin: '+(S.coin?'in pocket':'left behind'));
        sys('> Isabelle: '+(S.isabelle_came?'coming with her':'stayed behind'));
        isabelleWithHazel=!!S.isabelle_came;
        sys('> All data loaded.                      [OK]');
        divider();
        setTimeout(()=>clearAndRun(scene1),2000);
      },600);
    } else {
      sys('> No save data found. Manual import...');
      setTimeout(()=>{
        sys('> Did Hazel take the coin? (yes / no)');
        askChoice(['yes','no'],(c)=>{
          S.coin=(c==='yes');
          sys('> Did Isabelle come north? (yes / no)');
          askChoice(['yes','no'],(c2)=>{
            S.isabelle_came=(c2==='yes');
            isabelleWithHazel=S.isabelle_came;
            S.almost_told=true; S.flood=true; S.note='3';
            sys('> Import complete.                     [OK]');
            divider();
            setTimeout(()=>clearAndRun(scene1),1200);
          });
        });
      },600);
    }
  },1200);
}

// ═══ SCENE 1 — LEAVING ══════════════════════════════════════
function scene1(){
  currentNarrator='narrator';
  artPrint(`
   [ village edge — dawn ]
   bag: packed  |  letter: pocket
   `+(S.coin?'coin: pocket':'coin: not taken')+'  |  isabelle: '+(isabelleWithHazel?'beside her':'at the flat'));
  divider();
  N("The village at dawn. The last time she'll see it for a while.");
  N("She doesn't look back.");
  blank();
  if(isabelleWithHazel){
    N("Isabelle is beside her. Didn't ask where they were going.");
    N("Just packed a bag and came.");
    blank();
    isabelle("...so where are we going.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. north.",'prompt',80);
    addLine("  2. there's a cave.",'prompt',80);
    addLine("  3. i'll explain on the way.",'prompt',80);
    askChoice(["1","2","3"],(c)=>{
      if(c==="1"){hazel("north.");isabelle("...okay. north it is.");}
      else if(c==="2"){hazel("there's a cave.");isabelle("...okay. a cave. sure.");}
      else{hazel("i'll explain on the way.");isabelle("...fair enough.");}
      blank();
      cont(piper_scene);
    });
  } else {
    N("She's alone. The village shrinks behind her.");
    blank();
    N("You look different.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. ...do i?",'prompt',80);
    addLine("  2. same as always.",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("...do i?");N("Yes. Like someone who has already decided.");}
      else{hazel("same as always.");N("...");N("No. Not quite.");}
      blank();
      cont(piper_scene);
    });
  }
}

// ═══ PIPER ══════════════════════════════════════════════════
function piper_scene(){
  currentNarrator='piper';
  artPrint(`
   [ bus stop — village outskirts ]
   piper: sitting. not waiting for the bus.`);
  divider();
  piper("she sits at the bus stop like she always does.");
  piper("she sees the bag before she sees the girl.");
  piper("she knows that bag.");
  blank();
  N("Older woman. Late 50s. At the bus stop like she belongs there.");
  blank();
  if(isabelleWithHazel){
    N("She looks at Hazel. Then Isabelle. Then back at Hazel.");
    piper("two of you. good.");
    blank();
    N("She says it like it matters.");
  } else {
    piper("just you then.");
  }
  blank();
  piper("how far?");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. far enough.",'prompt',80);
  addLine("  2. north. there's a cave.",'prompt',80);
  addLine("  3. i don't know exactly.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){hazel("far enough.");piper("...");piper("yes. it usually is.");}
    else if(c==="2"){hazel("north. there's a cave.");piper("...");piper("there always is. with the ones who go.");}
    else{hazel("i don't know exactly.");piper("that's alright. you'll know when you get there.");}
    blank();
    cont(piper_talk);
  });
}

function piper_talk(){
  currentNarrator='piper';
  piper("i went somewhere once.");
  blank();
  N("She says it simply. Like she's been waiting to tell someone.");
  blank();
  hazel("...what happened?");
  blank();
  piper("it worked. the thing i went for. it actually worked.");
  piper("spent years thinking it might. spent more years not going.");
  piper("then one day i just. went.");
  blank();
  if(isabelleWithHazel){isabelle("...what made you finally go?");}
  else{hazel("what made you finally go?");}
  blank();
  piper("i got tired of the weight of it.");
  piper("carrying something you haven't done yet is heavier than doing it.");
  piper("i didn't understand that until after.");
  blank();
  cont(piper_talk_2);
}

function piper_talk_2(){
  currentNarrator='piper';
  if(isabelleWithHazel){isabelle("...and you came back?");}
  else{hazel("...and you came back.");}
  blank();
  piper("...");
  piper("this is home.");
  piper("going somewhere doesn't mean leaving forever.");
  piper("that's what i didn't know. before.");
  blank();
  N("She looks at the road. Not at Hazel. But the words are for her.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. do you ever miss it? the place you went?",'prompt',80);
  addLine("  2. ...thank you.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){
      hazel("do you ever miss it? the place you went?");
      blank();
      piper("...");
      piper("all the time.");
      piper("but i carry it with me now.");
      piper("that's different from missing it.");
      blank();
      unlockAchievement("Carry It With You","rare");
    } else {
      hazel("...thank you.");
      blank();
      piper("...");
      piper("i haven't told anyone that in a long time.");
      if(isabelleWithHazel){ piper("good luck. both of you."); }
      else{ piper("good luck."); }
    }
    blank();
    piper("don't doubt yourself.");
    blank();
    piper("and do it before it's too late.");
    blank();
    piper("whatever it is you're working up to.");
    blank();
    N("The bus comes. She doesn't move to get on it.");
    N("She was never waiting for the bus.");
    blank();
    unlockAchievement("Piper","rare");
    cont(eli_scene);
  });
}

// ═══ ELI ════════════════════════════════════════════════════
function eli_scene(){
  currentNarrator='eli';
  artPrint(`
   [ second town — small. quiet. ]
   last bus: already gone.
   eli: locking up the cafe.`);
  divider();
  eli("the last bus already went.");
  eli("he says it before she can check her phone.");
  eli("he's said it a lot.");
  blank();
  N("Late 20s. Locking up a small cafe. Sees " + (isabelleWithHazel ? "them" : "her") + " at the stop.");
  blank();
  eli("there's a bench inside if you need to wait till morning.");
  blank();
  if(isabelleWithHazel){
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. thanks.",'prompt',80);
    addLine("  2. how'd you know we needed somewhere?",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("thanks.");eli("...");eli("no problem.");}
      else{hazel("how'd you know we needed somewhere?");eli("you had the look.");hazel("what look?");eli("everyone gets it eventually.");unlockAchievement("The Look","common");}
      blank();
      cont(eli_inside);
    });
  } else {
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. thanks.",'prompt',80);
    addLine("  2. how'd you know?",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("thanks.");eli("...");eli("no problem.");}
      else{hazel("how'd you know?");eli("you had the look.");hazel("what look?");eli("everyone gets it eventually.");unlockAchievement("The Look","common");}
      blank();
      cont(eli_inside);
    });
  }
}

function eli_inside(){
  currentNarrator='eli';
  N("Inside. Warm. The cafe still smells of the day.");
  if(isabelleWithHazel){N("Isabelle immediately looks at the menu board even though it's closed. Some habits.");}
  blank();
  N("Eli makes tea without asking. Puts it down. Goes back to wiping the counter.");
  blank();
  N("Hazel notices the way his jaw tightens slightly when people pass outside.");
  N("The way he watches the window a beat too long.");
  N("She knows that look from the inside.");
  N("The particular thing of being exactly yourself and having that be the problem.");
  N("Of a voice that gives people something to point at.");
  N("Of being known as one thing by people who decided a long time ago.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. you've been here a while.",'prompt',80);
  addLine("  2. ...",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){
      hazel("you've been here a while.");
      blank();
      eli("whole life.");
      blank();
      hazel("do you like it here?");
      blank();
      eli("...");
      eli("yeah. i do.");
      eli("that's the complicated part.");
      eli("it would be easier if i didn't.");
      blank();
      N("He keeps wiping the counter. Not looking at her.");
      blank();
      eli("they love me here. most of them.");
      eli("they've known me since i was small.");
      eli("but they know me as one thing.");
      eli("and the one thing isn't the whole thing.");
      blank();
      N("Hazel is very still.");
      blank();
      hazel("...");
      hazel("yeah.");
      blank();
      N("She doesn't explain what she means.");
      N("He doesn't ask.");
      N("Some conversations don't need the whole sentence.");
      blank();
      cont(()=>{
        unlockAchievement("Eli","rare");
        cont(eli_morning);
      });
    } else {
      hazel("...");
      eli("...");
      blank();
      N("They sit in the quiet. Eli keeps working. It's comfortable.");
      N("Some silences are full of things that don't need to be said.");
    }
    cont(eli_morning);
  });
}

function eli_morning(){
  currentNarrator='eli';
  blank();
  eli("the worst part isn't that they got it wrong.");
  eli("it's that they stopped looking.");
  blank();
  N("He's been thinking that for years. Maybe he has.");
  N("Hazel thinks about it for the rest of the journey.");
  blank();
  if(isabelleWithHazel){
    N("Later. Just them.");
    blank();
    isabelle("...");
    isabelle("he reminded me of you.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. ...how?",'prompt',80);
    addLine("  2. ...",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){
        hazel("...how?");
        isabelle("the way he talks about this place. like it's his but it doesn't quite fit.");
        blank();
        isabelle("hazel.");
        hazel("yeah.");
        isabelle("for what it's worth. you fit. with me. you fit.");
        blank();
        N("Hazel doesn't answer. But something in her chest does something.");
        unlockAchievement("You Fit","legendary");
      } else {
        hazel("...");
        N("Isabelle lets it sit. She always knows when to let things sit.");
      }
      blank();
      N("Morning. Eli makes breakfast. Doesn't charge for it.");
      blank();
      eli("good luck with the cave.");
      if(isabelleWithHazel){
        N("Isabelle told him while Hazel was asleep. She shrugs when Hazel looks at her.");
        isabelle("he seemed trustworthy.");
      }
      blank();
      cont(may_scene);
    });
  } else {
    N("Morning. Eli makes breakfast. Doesn't charge for it.");
    blank();
    eli("good luck.");
    blank();
    N("He means it.");
    blank();
    cont(may_scene);
  }
}

// ═══ MAY ════════════════════════════════════════════════════
function may_scene(){
  currentNarrator='may';
  artPrint(`
   [ bus stop — last town before the cave ]
   may: sitting. waiting for no particular reason.`);
  divider();
  may("she sits down without asking.");
  may("she never asks. it always works out fine.");
  blank();
  N("Early 30s. Just sits down next to Hazel. Like it's the most natural thing.");
  blank();
  if(isabelleWithHazel){
    may("you two look like you're almost there.");
  } else {
    may("you look like you're almost there.");
  }
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. ...how can you tell?",'prompt',80);
  addLine("  2. yeah. i think so.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){hazel("...how can you tell?");may("the way you're walking. like you've decided something.");}
    else{hazel("yeah. i think so.");may("good. almost there is a good place to be.");}
    blank();
    cont(may_talk);
  });
}

function may_talk(){
  currentNarrator='may';
  hazel("did you ever do something that scared you.");
  blank();
  may("yeah.");
  may("i told someone i loved them.");
  blank();
  if(isabelleWithHazel){N("Isabelle goes slightly still beside her.");}
  blank();
  hazel("...what happened?");
  blank();
  may("she didn't feel that way. said it kindly. honestly.");
  may("we sat there for a bit.");
  blank();
  hazel("and then?");
  blank();
  may("and then she made tea. and we watched something terrible on tv.");
  may("and it was awful for a while and then it wasn't.");
  blank();
  cont(may_talk_2);
}

function may_talk_2(){
  currentNarrator='may';
  hazel("are you glad you said it?");
  blank();
  may("...");
  may("yeah.");
  blank();
  may("because at least it was real.");
  may("carrying it wasn't real. saying it was.");
  blank();
  if(isabelleWithHazel){
    N("Isabelle is very quiet.");
    N("Hazel doesn't look at her. But she feels the weight of what May just said.");
  }
  blank();
  may("good luck with whatever you're going to.");
  blank();
  if(isabelleWithHazel){N("She says it to both of them but looks at Hazel.");}
  blank();
  unlockAchievement("May","rare");
  if(isabelleWithHazel){
    N("On the bus. Isabelle quiet for a long time.");
    blank();
    isabelle("...");
    isabelle("hazel.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. yeah.",'prompt',80);
    addLine("  2. ...",'prompt',80);
    askChoice(["1","2"],(c)=>{
      hazel(c==="1"?"yeah.":"...");
      blank();
      isabelle("nothing. just. nothing.");
      blank();
      N("Hazel lets her work it out. She knows when Isabelle is working something out.");
      blank();
      cont(cave_approach);
    });
  } else {
    N("Hazel sits with what May said.");
    N("Carrying it wasn't real. Saying it was.");
    N("She thinks about Isabelle. Back at the flat. With Mishka.");
    blank();
    cont(cave_approach);
  }
}

// ═══ CAVE ═══════════════════════════════════════════════════
function cave_approach(){
  currentNarrator='narrator';
  artPrint(`
        . . . . . . . . . . . . . . .
       .   ___---------___            .
      .  the cave. older. deeper.      .
     . /:  further north.   :\\         .
    .  | it has been waiting. |         .
     . \\:___________________:/         .
        . . . . . . . . . . . . . . .`);
  divider();
  N("The cave. Older than the one she knows. You can feel it.");
  N("The ground is different. The stones are different.");
  N("Something has been here a very long time.");
  blank();
  if(isabelleWithHazel){
    isabelle("...this is it?");
    hazel("yeah.");
    isabelle("it's bigger than i expected.");
    blank();
    N("The letter said come alone.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. i have to go in alone.",'prompt',80);
    addLine("  2. wait here. i won't be long.",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("i have to go in alone.");blank();isabelle("okay.");isabelle("come back.");hazel("...yeah.");}
      else{hazel("wait here. i won't be long.");blank();isabelle("okay. i'll be here.");N("She sits on a rock. Like waiting for Hazel is just a thing she does.");}
      blank();
      cont(cave_entry);
    });
  } else {
    N("She's alone. The way the letter said.");
    blank();
    addLine("Options: 1 / 2",'prompt',220);
    addLine("  1. go in.",'prompt',80);
    addLine("  2. stand here for a moment.",'prompt',80);
    askChoice(["1","2"],(c)=>{
      if(c==="1"){hazel("go in.");N("She goes in.");}
      else{hazel("stand here for a moment.");blank();N("The cave waits. It has been waiting a long time. It can wait a moment more.");unlockAchievement("Took a Breath","common");}
      blank();
      cont(cave_entry);
    });
  }
}

function cave_entry(){
  currentNarrator='narrator';
  blank();
  N("...");
  blank();
  N("Ready for Round 2?");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. yeah.",'prompt',80);
  addLine("  2. ...was that you?",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){
      hazel("yeah.");
      blank();
      N("Good.");
    } else {
      hazel("...was that you?");
      blank();
      N("...");
      N("I've been waiting to say that for two games.");
      blank();
      unlockAchievement("Round 2","secret");
    }
    cont(cave_crossroads);
  });
}

function cave_crossroads(){
  currentNarrator='narrator';
  artPrint(`
         ,_,
        (o,o)         [ owl ]
        {"""}          sits.
         " "           waits.

   ← left passage    right passage →
           ↓
       deeper path`);
  divider();
  N("Inside. Darker. Older. The walls feel closer even when they aren't.");
  blank();
  N("An owl on a ledge. Watching her. Recognition, not wildness.");
  blank();
  N("Three passages. All leading somewhere.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. left passage.",'prompt',80);
  addLine("  2. right passage.",'prompt',80);
  addLine("  3. deeper path.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1") clearAndRun(cave_left);
    else if(c==="2") clearAndRun(cave_right);
    else clearAndRun(cave_deeper);
  });
}

// ── LEFT PASSAGE ─────────────────────────────────────────────
function cave_left(){
  currentNarrator='narrator';
  artPrint(`
   [ left passage ]
   narrow. old carvings on the walls.`);
  divider();
  N("The walls here have markings on them.");
  N("Not language. Something older than language.");
  N("Lines and circles that almost mean something.");
  blank();
  N("At the end: a small alcove.");
  N("A stone shelf. A candle on it. Still lit.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. look at the markings.",'prompt',80);
  addLine("  2. look at the candle.",'prompt',80);
  addLine("  3. sit in the alcove.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){
      hazel("look at the markings.");
      blank();
      N("She traces one with her finger. Worn smooth.");
      N("Someone has done this before her. A lot of someones.");
      blank();
      N("She thinks about all the people who stood here.");
      N("All with something they were walking toward.");
      blank();
      unlockAchievement("Those Who Came Before","rare");
    } else if(c==="2"){
      hazel("look at the candle.");
      blank();
      N("It's been burning for a long time. There's almost nothing left.");
      N("But it's still going.");
      blank();
      N("She stays with that.");
      blank();
      unlockAchievement("Still Going","rare");
    } else {
      hazel("sit in the alcove.");
      blank();
      N("She fits. Just barely. The stone is warm from the candle.");
      N("She sits there quietly.");
      N("The cave doesn't mind.");
      blank();
      N("...");
      blank();
      N("She needed that.");
      blank();
      unlockAchievement("Needed That","common");
    }
    blank();
    N("The passage loops back.");
    cont(cave_crossroads_return);
  });
}

// ── RIGHT PASSAGE ─────────────────────────────────────────────
function cave_right(){
  currentNarrator='narrator';
  artPrint(`
   [ right passage ]
   wider. sound of water somewhere below.`);
  divider();
  N("This passage widens as she goes.");
  N("Sound of water. Distant but getting closer.");
  blank();
  N("A room. Natural. High ceiling.");
  N("A smaller pool. Not the pool — a different one. Ancient.");
  blank();
  N("At the bottom: a single stone. Flat. Smooth. Round.");
  N("It looks exactly like the coin.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. reach in and take it.",'prompt',80);
  addLine("  2. leave it.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){
      hazel("reach in and take it.");
      blank();
      N("The water is cold. The stone is smooth. Both sides identical.");
      blank();
      if(S.coin){
        N("She holds it next to the coin from the road.");
        N("They're the same.");
        N("She doesn't know what that means.");
        N("She keeps both.");
        unlockAchievement("Two Coins","secret");
      } else {
        N("She turns it over. Both sides the same. No markings.");
        N("She pockets it.");
        N("Better late than never.");
        unlockAchievement("Found One Anyway","secret");
      }
    } else {
      hazel("leave it.");
      blank();
      N("She looks at it for a long moment.");
      N("Some things are better left where they are.");
      if(!S.coin){blank();N("She already knows that.");}
    }
    blank();
    N("The passage loops back.");
    cont(cave_crossroads_return);
  });
}

// ── DEEPER PATH ───────────────────────────────────────────────
function cave_deeper(){
  currentNarrator='narrator';
  artPrint(`
   [ deeper path ]
   the owl went this way.`);
  divider();
  N("The owl hops off its ledge.");
  N("Moves to the entrance of this passage. Looks back at her.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. follow it.",'prompt',80);
  addLine("  2. not yet.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){
      hazel("follow it.");
      blank();
      N("She follows. The passage goes down. Further down.");
      N("The owl moves without sound.");
      blank();
      N("Then the passage opens.");
      blank();
      cont(cave_water);
    } else {
      hazel("not yet.");
      blank();
      N("The owl waits.");
      N("It is very patient.");
      blank();
      unlockAchievement("Made It Wait","common");
      cont(cave_crossroads_return);
    }
  });
}

function cave_crossroads_return(){
  currentNarrator='narrator';
  artPrint(`
         ,_,
        (o,o)         [ owl ]
        {"""}          still here.
         " "           still watching.`);
  divider();
  N("She comes back to the crossroads.");
  N("The owl is still there.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. left passage.",'prompt',80);
  addLine("  2. right passage.",'prompt',80);
  addLine("  3. follow the owl.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1") clearAndRun(cave_left);
    else if(c==="2") clearAndRun(cave_right);
    else clearAndRun(cave_deeper);
  });
}

function cave_water(){
  currentNarrator='narrator';
  artPrint(`
   ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈
   ≈                             ≈
   ≈    [ still. ancient. ]      ≈
   ≈                             ≈
   ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈ ≈`);
  divider();
  N("The deep chamber.");
  N("The owl is gone.");
  blank();
  N("In the centre: a pool of water.");
  N("Perfectly still. Ancient. The kind of still that has been still for hundreds of years.");
  blank();
  N("She walks toward it slowly.");
  blank();
  N("She looks into it.");
  blank();
  N("...");
  blank();
  N("She sees herself.");
  blank();
  cont(cave_water_2);
}

function cave_water_2(){
  currentNarrator='narrator';
  N("Not the version the village sees.");
  N("Not the version she shows people when she's being careful.");
  N("Not the version she sees in bad mirrors and bad moments.");
  blank();
  N("Herself. The way she actually is.");
  blank();
  N("She has been herself since she was thirteen.");
  N("That's when she knew. That's when she became.");
  N("The world has been catching up since then in small ways.");
  blank();
  N("One of those ways is still catching up.");
  N("She can hear it every time she speaks.");
  N("She has always been able to hear it.");
  blank();
  cont(cave_water_3);
}

function cave_water_3(){
  currentNarrator='narrator';
  N("But the pool doesn't show her the voice.");
  N("The pool shows her everything else.");
  N("All the parts that are exactly right.");
  blank();
  N("She's been waiting for that for a long time.");
  blank();
  N("She doesn't know how long she stands there.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. ...oh.",'prompt',80);
  addLine("  2. i look like that?",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){
      hazel("...oh.");
      blank();
      N("...");
      blank();
      N("Yeah. Oh.");
      blank();
      N("She sits down next to the pool. The cave is very quiet.");
      N("She lets herself just. Be there. For a minute.");
    }
    else if(c==="2"){
      hazel("i look like that?");
      blank();
      N("Yes. You do.");
      N("You always have.");
      N("You just couldn't see it from the angle you were standing.");
      blank();
      unlockAchievement("Saw Herself","epic");
    }
    else{
      hazel("...");
      blank();
      N("She stands there for a long time.");
      N("Not thinking. Just looking.");
      N("That's enough.");
    }
    blank();
    cont(cave_voice);
  });
}

function cave_voice(){
  currentNarrator='narrator';
  N("Then the voice.");
  blank();
  N("Not loud. Not dramatic.");
  N("Calm. Certain. The kind of calm that comes from having been right about something for a very long time.");
  blank();
  addLine("You already knew.","art-gold",400);
  blank();
  N("...");
  blank();
  N("She stands there with those three words.");
  blank();
  cont(cave_voice_2);
}

function cave_voice_2(){
  currentNarrator='narrator';
  N("She knew about Isabelle.");
  blank();
  N("She knew she deserved good things.");
  blank();
  N("She knew the cave was waiting for her.");
  blank();
  N("She knew her name.");
  blank();
  cont(cave_voice_3);
}

function cave_voice_3(){
  currentNarrator='narrator';
  N("She just needed to walk far enough");
  N("to trust herself");
  N("to believe it.");
  blank();
  N("The cave goes quiet again. The pool is still.");
  N("The owl is still gone.");
  blank();
  N("She sits there for a while longer.");
  N("Not because she has to. Because she wants to.");
  blank();
  unlockAchievement("The Voice","legendary");
  cont(cave_exit_scene);
}

function cave_exit_scene(){
  currentNarrator='narrator';
  artPrint(`
   [ cave exit — dawn ]
   same light as the first cave. first day.
   but she is not the same.`);
  divider();
  N("She comes out of the cave. Changed.");
  N("The owl is gone. Same dawn as the day she left the first cave.");
  blank();
  N("Full circle.");
  blank();
  if(isabelleWithHazel){
    N("Isabelle stands when she sees her. Looks at her face.");
    N("Doesn't say anything. Just looks.");
  }
  blank();
  N("Then the narrator speaks. Not performing. Just his voice.");
  blank();
  N("Hazel.");
  blank();
  N("I need to tell you something.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. okay.",'prompt',80);
  addLine("  2. i know.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="2"){
      hazel("i know.");
      N("...");
      N("You know?");
      hazel("i didn't know know. but i know now.");
      N("When?");
      blank();
      addLine("Options: 1 / 2",'prompt',220);
      addLine("  1. when you told me to go to sleep.",'prompt',80);
      addLine("  2. when you used my name.",'prompt',80);
      askChoice(["1","2"],(c2)=>{
        if(c2==="1"){hazel("when you told me to go to sleep.");}
        else{hazel("when you used my name.");}
        N("...");
        N("Fair enough.");
        blank();
        unlockAchievement("I Know","secret");
        cont(hermes_reveal);
      });
    } else {
      hazel("okay.");
      blank();
      cont(hermes_reveal);
    }
  });
}

// ═══ HERMES ═════════════════════════════════════════════════
function hermes_reveal(){
  currentNarrator='hermes';
  blank();
  hermes("I'm Hermes.");
  blank();
  N("...");
  blank();
  N("She already knows. She's known since the cave. Maybe before.");
  N("But hearing it said out loud is different.");
  blank();
  hermes("Athena sent me.");
  hermes("She noticed you when you named the computer.");
  hermes("Fifteen years old. You called it Athena. Carefully. Like it mattered.");
  hermes("It did.");
  blank();
  hermes("She's been watching since then.");
  hermes("I've been with you since the first cave.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. the letter was hers.",'prompt',80);
  addLine("  2. the voicemail. the stranger.",'prompt',80);
  addLine("  3. ...how long have you been waiting.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){
      hazel("the letter was hers.");
      blank();
      hermes("Yes. I delivered it. As is my role.");
      hermes("She wrote it for you specifically.");
      hermes("Not for someone like you.");
      blank();
      addLine("For you.","art-gold",300);
      blank();
      N("Hazel takes the letter out of her pocket.");
      N("She has read it many times. She knows every word.");
      N("But she reads it again now. Knowing who A is.");
      blank();
      unlockAchievement("Told Her About the Letter","epic");
      cont(read_the_letter);
    } else if(c==="2"){
      hazel("the voicemail. the stranger on the road.");
      blank();
      hermes("Both me.");
      hermes("I have many shapes. That's also my role.");
      hermes("The stranger — I wanted to see how you'd react to the words.");
      hermes("You called after them. I was glad.");
      unlockAchievement("Told Her About the Letter","epic");
      blank();
    } else {
      hazel("...how long have you been waiting.");
      blank();
      hermes("In that cave?");
      hermes("Long enough that time stopped meaning much.");
      blank();
      hazel("...that sounds lonely.");
      blank();
      hermes("...");
      hermes("It wasn't, actually. The cave is good company.");
      hermes("But yes. It was a long wait.");
      hermes("You were worth it.");
      blank();
    }
    cont(hermes_coin);
  });
}

function read_the_letter(){
  currentNarrator='narrator';
  divider();
  blank();
  addLine("Hazel,","letter",400);
  blank();
  addLine("You won't know who this is when you read it the first time.","letter",300);
  addLine("That's alright. You'll know later. Read it again then.","letter",300);
  blank();
  cont(read_the_letter_2);
}

function read_the_letter_2(){
  currentNarrator='narrator';
  addLine("I've been watching you since you were fifteen.","letter",300);
  addLine("You named something after me.","letter",300);
  addLine("You did it carefully, like it mattered.","letter",300);
  addLine("It did.","letter",500);
  blank();
  addLine("I watch a lot of people.","letter",300);
  addLine("Most of them I watch from a distance.","letter",300);
  addLine("You I've been closer to.","letter",300);
  addLine("I sent someone to walk beside your story —","letter",300);
  addLine("you'll have figured out who by the time this makes sense.","letter",300);
  blank();
  cont(read_the_letter_3);
}

function read_the_letter_3(){
  currentNarrator='narrator';
  addLine("There is a cave.","letter",400);
  addLine("It has been waiting for you specifically.","letter",300);
  addLine("Not for someone like you.","letter",300);
  addLine("For you.","letter",600);
  blank();
  addLine("It will show you something the world has been getting wrong.","letter",300);
  blank();
  addLine("You already know what it is.","letter",300);
  addLine("You've known for a long time.","letter",300);
  addLine("The cave will just let you see it clearly.","letter",300);
  blank();
  cont(read_the_letter_4);
}

function read_the_letter_4(){
  currentNarrator='narrator';
  addLine("About Isabelle —","letter",400);
  addLine("yes, I know about Isabelle.","letter",300);
  addLine("I've known since before you did.","letter",300);
  addLine("I'm not going to tell you what to do with that.","letter",300);
  addLine("You already know.","letter",300);
  addLine("You've known that for a long time too.","letter",300);
  blank();
  cont(read_the_letter_5);
}

function read_the_letter_5(){
  currentNarrator='narrator';
  addLine("The voice will catch up.","letter",400);
  addLine("I want you to know that.","letter",300);
  addLine("It is already yours.","letter",300);
  addLine("It has always been yours.","letter",300);
  addLine("The world is just slow.","letter",500);
  blank();
  addLine("Come to the cave.","letter",400);
  addLine("Come when you're ready.","letter",300);
  addLine("It will wait.","letter",300);
  blank();
  addLine("You were worth watching.","letter",400);
  blank();
  addLine("— A","letter",600);
  blank();
  divider();
  blank();
  N("She folds it. Puts it back.");
  blank();
  if(isabelleWithHazel){
    N("Isabelle is watching her.");
    N("She doesn't ask. She just puts her hand on Hazel's arm for a moment.");
    N("That's enough.");
  } else {
    N("Hermes is quiet.");
    N("He gave her that.");
    N("She thinks she knew he would.");
  }
  blank();
  unlockAchievement("Read It Again","legendary");
  cont(hermes_coin);
}

function hermes_coin(){
  currentNarrator='hermes';
  if(S.coin){
    hermes("The coin was mine.");
    hermes("I wanted you to have something to hold.");
    hermes("Something that reminded you this was real.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. ...i still have it.",'prompt',80);
    addLine("  2. which side is which?",'prompt',80);
    addLine("  3. why no markings?",'prompt',80);
    askChoice(["1","2","3"],(c)=>{
      if(c==="1"){
        hazel("...i still have it.");
        blank();
        hermes("...");
        hermes("I know.");
        hermes("I'm glad.");
        blank();
        N("She takes it out. Both sides still identical.");
        N("She looks at it for a moment. Then puts it back.");
        N("She keeps it.");
        unlockAchievement("The Coin Explained","secret");
      } else if(c==="2"){
        hazel("which side is which?");
        blank();
        hermes("There isn't one.");
        hermes("That was the point.");
        hermes("This wasn't a coin toss kind of journey.");
        hermes("There was never a wrong side.");
        blank();
        unlockAchievement("The Coin Explained","secret");
      } else {
        hazel("why no markings?");
        blank();
        hermes("Because I didn't want you trying to figure out what it meant.");
        hermes("I wanted you to just carry it.");
        hermes("Some things just need to be held.");
        blank();
        unlockAchievement("The Coin Explained","secret");
      }
      blank();
      cont(hermes_q_menu_start);
    });
  } else {
    hermes("I left you a coin. At the cave entrance.");
    hermes("I wanted you to have something to hold.");
    blank();
    hermes("You left it.");
    blank();
    addLine("Options: 1 / 2 / 3",'prompt',220);
    addLine("  1. i didn't know what it was.",'prompt',80);
    addLine("  2. ...sorry.",'prompt',80);
    addLine("  3. i didn't need it.",'prompt',80);
    askChoice(["1","2","3"],(c)=>{
      if(c==="3"){
        hazel("i didn't need it.");
        blank();
        hermes("...");
        hermes("No.");
        hermes("You got here anyway.");
        hermes("That's the more impressive version, honestly.");
        blank();
        unlockAchievement("Didn't Need It","epic");
      } else if(c==="2"){
        hazel("...sorry.");
        blank();
        hermes("That's alright.");
        hermes("You got here anyway.");
        hermes("That was always the point.");
      } else {
        hazel("i didn't know what it was.");
        blank();
        hermes("That's alright.");
        hermes("Most people don't, at first.");
        hermes("You got here anyway. Same result.");
      }
      blank();
      cont(hermes_q_menu_start);
    });
  }
}

function hermes_q_menu_start(){ hermes_q_menu(3,[]); }

function hermes_q_menu(remaining,asked){
  currentNarrator='hermes';
  const all=[
    {k:'1',l:'why me.',fn:hq_whyme},
    {k:'2',l:'did athena watch me name the pc.',fn:hq_athena},
    {k:'3',l:'are you going to stay.',fn:hq_stay},
    {k:'4',l:'was any of it real.',fn:hq_real},
    {k:'5',l:'what happens now.',fn:hq_now},
    {k:'6',l:'did you read the letter before leaving it.',fn:hq_letter},
  ];
  const avail=all.filter(q=>!asked.includes(q.k));
  if(remaining===0||avail.length===0){clearAndRun(hermes_final);return;}
  blank();
  addLine('Ask a question ('+(remaining)+' remaining):','system',80);
  avail.forEach(q=>addLine('  '+q.k+'. '+q.l,'prompt',60));
  addLine('  0. that\'s enough.','prompt',60);
  const keys=avail.map(q=>q.k).concat(['0']);
  askChoice(keys,(c)=>{
    if(c==='0'){clearAndRun(hermes_final);return;}
    const q=avail.find(q=>q.k===c);
    if(q){clearAndRun(()=>q.fn(()=>hermes_q_menu(remaining-1,[...asked,c])));}
  });
}

function hq_whyme(next){
  currentNarrator='hermes';
  hazel("why me.");
  blank();
  hermes("Because you named your computer Athena. At fifteen. Without knowing why.");
  hermes("Athena notices people who love things carefully.");
  hermes("People who name what they love.");
  hermes("You've been under her protection for years.");
  hermes("I was just the delivery.");
  blank();
  unlockAchievement("Why Me","rare");
  cont(next);
}

function hq_athena(next){
  currentNarrator='hermes';
  hazel("did athena watch me name the pc.");
  blank();
  hermes("Yes.");
  hazel("...really.");
  hermes("She was pleased.");
  hermes("She said — paraphrasing — 'that one. keep an eye on that one.'");
  hazel("...she said that.");
  hermes("In so many words.");
  blank();
  unlockAchievement("Athena Was Watching","epic");
  cont(next);
}

function hq_stay(next){
  currentNarrator='hermes';
  hazel("are you going to stay.");
  blank();
  hermes("I'm always with the story.");
  blank();
  addLine("Options: 1 / 2",'prompt',220);
  addLine("  1. that's not an answer.",'prompt',80);
  addLine("  2. ...okay.",'prompt',80);
  askChoice(["1","2"],(c)=>{
    if(c==="1"){hazel("that's not an answer.");hermes("No. It isn't.");hermes("...");hermes("I'll be around. Less formally. But around.");unlockAchievement("Around","secret");}
    else{hazel("...okay.");hermes("...");hermes("Okay.");}
    cont(next);
  });
}

function hq_real(next){
  currentNarrator='hermes';
  hazel("was any of it real. the narrating.");
  blank();
  hermes("All of it.");
  hazel("even the evasive bits.");
  hermes("Especially those. Evasion takes effort.");
  hermes("I wasn't supposed to get fond of you.");
  hermes("That wasn't in the brief.");
  hermes("But there it is.");
  blank();
  unlockAchievement("Fond","legendary");
  cont(next);
}

function hq_now(next){
  currentNarrator='hermes';
  hazel("what happens now.");
  blank();
  hermes("Now you go home. Or wherever comes next.");
  hermes("That part is yours.");
  hermes("The cave gave you what it had.");
  if(isabelleWithHazel){hermes("You have someone beside you. That helps.");}
  blank();
  cont(next);
}

function hq_letter(next){
  currentNarrator='hermes';
  hazel("did you read the letter before you left it.");
  blank();
  hermes("...");
  hazel("...you did.");
  hermes("I'm the messenger. I always read the letters.");
  hazel("what did it feel like. knowing what it said.");
  blank();
  hermes("Like watching someone who doesn't know yet.");
  hermes("That they're exactly who they need to be.");
  blank();
  unlockAchievement("The Messenger Read It","secret");
  cont(next);
}

function hermes_final(){
  currentNarrator='hermes';
  blank();
  hermes("There's something else you need to do today.");
  blank();
  N("She knows what he means.");
  blank();
  if(isabelleWithHazel){cont(isabelle_moment);}
  else{cont(alone_setup);}
}

// ═══ ENDING A — TOGETHER ════════════════════════════════════
function isabelle_moment(){
  currentNarrator='narrator';
  N("Hermes steps back.");
  blank();
  N("This part isn't his.");
  blank();
  N("Just Hazel and Isabelle.");
  N("Outside the cave. Morning light on the stones.");
  blank();
  N("Isabelle stood up when she saw Hazel come out.");
  N("Looked at her face. Didn't say anything.");
  N("She could tell something had shifted.");
  blank();
  N("Eight years of knowing Hazel.");
  N("Eight years of knowing when to wait.");
  blank();
  N("She waits.");
  blank();
  N("Hermes is completely silent.");
  N("First time in three games by choice.");
  blank();
  cont(isabelle_moment_2);
}

function isabelle_moment_2(){
  currentNarrator='narrator';
  N("Hazel stands there.");
  blank();
  N("Piper said: don't doubt yourself.");
  N("Eli said: they stopped looking.");
  N("May said: carrying it wasn't real. saying it was.");
  blank();
  N("All three of them were talking about this moment.");
  N("She knows that now.");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. say it now.",'prompt',80);
  addLine("  2. wait a moment.",'prompt',80);
  addLine("  3. ...",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){
      N("She doesn't let herself think.");
      N("She turns to Isabelle and goes.");
      blank();
    } else if(c==="2"){
      N("She looks at the cave behind her.");
      N("Then back at Isabelle.");
      N("May's voice: carrying it wasn't real. saying it was.");
      blank();
      N("She goes.");
      blank();
    } else {
      N("Isabelle reaches over.");
      N("Takes her hand.");
      N("Doesn't say anything. Just — takes it.");
      blank();
      N("Hazel looks down at their hands.");
      N("Something in her gives way.");
      blank();
      unlockAchievement("She Reached First","epic");
    }
    cont(the_words_together);
  });
}

function the_words_together(){
  currentNarrator='narrator';
  hazel("isabelle.");
  blank();
  isabelle("yeah.");
  blank();
  hazel("i need to tell you something.");
  blank();
  N("Isabelle waits.");
  blank();
  hazel("i have feelings for you.");
  hazel("i have had for a long time.");
  hazel("and i didn't say it because i was scared of losing you.");
  hazel("and i think i nearly didn't say it again today.");
  hazel("but i'm saying it now.");
  blank();
  N("Silence.");
  blank();
  cont(isabelle_responds);
}

function isabelle_responds(){
  currentNarrator='narrator';
  isabelle("hazel.");
  blank();
  hazel("yeah.");
  blank();
  isabelle("i've literally been in love with you since we were like sixteen.");
  blank();
  N("Hazel stares at her.");
  blank();
  hazel("...what.");
  isabelle("i thought YOU knew.");
  hazel("how would i have known.");
  isabelle("i thought it was obvious.");
  hazel("it was not obvious isabelle.");
  blank();
  cont(isabelle_responds_2);
}

function isabelle_responds_2(){
  currentNarrator='narrator';
  isabelle("hazel.");
  hazel("yeah.");
  isabelle("i named my wifi hermes.");
  blank();
  hazel("...");
  hazel("you named your wifi hermes.");
  isabelle("yes.");
  hazel("like — the greek god hermes.");
  isabelle("i thought it was funny. god of messengers. wifi.");
  hazel("...");
  hazel("isabelle.");
  isabelle("yeah.");
  hazel("i named my computer athena.");
  blank();
  N("A beat.");
  blank();
  isabelle("...");
  isabelle("because of the goddess of wisdom.");
  hazel("yeah.");
  isabelle("and i named my wifi hermes because of the god of messages.");
  hazel("yeah.");
  blank();
  N("They look at each other.");
  blank();
  hazel("we're both very stupid.");
  isabelle("we really are.");
  blank();
  N("Isabelle laughs. Hazel laughs. The cave behind them. The morning light.");
  blank();
  unlockAchievement("Said It","mythic");
  cont(hermes_goodbye);
}

// ═══ ENDING B — ALONE ═══════════════════════════════════════
function alone_setup(){
  currentNarrator='hermes';
  hermes("Go home, Hazel.");
  hermes("You know what you need to say.");
  blank();
  N("She does.");
  blank();
  cont(alone_home);
}

function alone_home(){
  currentNarrator='narrator';
  artPrint(`
   [ the road home ]
   direction: south.
   hermes: still here. differently.`);
  divider();
  N("The road home is different from the road north.");
  N("Quieter. More certain.");
  blank();
  N("Hermes is still there. But differently. Less like narrating. More like walking alongside.");
  blank();
  hermes("How does it feel?");
  blank();
  addLine("Options: 1 / 2 / 3",'prompt',220);
  addLine("  1. different.",'prompt',80);
  addLine("  2. lighter.",'prompt',80);
  addLine("  3. like i know what i'm doing for once.",'prompt',80);
  askChoice(["1","2","3"],(c)=>{
    if(c==="1"){hazel("different.");hermes("Good different?");hazel("...yeah. good.");}
    else if(c==="2"){hazel("lighter.");hermes("...");hermes("Yes. That's what putting things down feels like.");}
    else{hazel("like i know what i'm doing for once.");hermes("You've always known.");hermes("You just needed to walk far enough to believe it.");}
    blank();
    cont(alone_isabelle_door);
  });
}

function alone_isabelle_door(){
  currentNarrator='narrator';
  artPrint(`
   [ isabelle's door ]
   evening. light on inside.
   isabelle: home.`);
  divider();
  N("Isabelle's door. She's been here a thousand times.");
  N("Her hand is raised to knock.");
  blank();
  N("Inside: the light on. The familiar shape of it through the curtain.");
  blank();
  N("Except her. She's different now.");
  blank();
  hermes("Don't doubt yourself. Do it before it's too late.");
  blank();
  N("She knocks.");
  blank();
  cont(alone_opens);
}

function alone_opens(){
  currentNarrator='narrator';
  N("Isabelle opens the door. Looks at her bag. Her face.");
  blank();
  isabelle("...you're back.");
  hazel("yeah.");
  isabelle("are you okay?");
  hazel("yeah.");
  blank();
  hazel("can you come over? i need to tell you something.");
  blank();
  N("Isabelle grabs her keys without hesitating.");
  blank();
  isabelle("yeah. of course.");
  blank();
  cont(alone_walk);
}

function alone_walk(){
  currentNarrator='narrator';
  N("They walk back to Hazel's flat.");
  N("It's not far. Isabelle doesn't ask questions on the way.");
  N("She never does. She waits until Hazel is ready.");
  blank();
  N("Hazel lets them in. Mishka comes to her immediately.");
  N("She picks her up. Mishka tolerates it for longer than usual.");
  blank();
  N("Isabelle sits on the sofa. Hazel puts Mishka down.");
  blank();
  cont(alone_the_words);
}

function alone_the_words(){
  currentNarrator='narrator';
  hazel("i have feelings for you.");
  hazel("i have had for a long time.");
  hazel("i should have said it before i left.");
  hazel("i'm saying it now.");
  blank();
  N("She hears her own voice saying it.");
  N("The voice she has always had complicated feelings about.");
  N("It doesn't sound like it usually does to her.");
  N("It sounds like someone who means it.");
  blank();
  N("Silence.");
  blank();
  cont(alone_the_words_isabelle);
}

function alone_the_words_isabelle(){
  currentNarrator='narrator';
  isabelle("...");
  isabelle("hazel.");
  hazel("yeah.");
  blank();
  isabelle("i've literally been in love with you since we were sixteen.");
  blank();
  N("Hazel stares at her.");
  blank();
  hazel("...what.");
  isabelle("i thought you knew.");
  hazel("how would i have known isabelle.");
  blank();
  cont(alone_the_words_2);
}

function alone_the_words_2(){
  currentNarrator='narrator';
  isabelle("i named my wifi hermes.");
  blank();
  hazel("...");
  hazel("you named your wifi hermes.");
  isabelle("god of messengers. i thought it was funny.");
  hazel("isabelle.");
  isabelle("yeah.");
  hazel("i named my computer athena.");
  blank();
  N("A beat.");
  blank();
  isabelle("...");
  isabelle("athena. goddess of wisdom.");
  hazel("yeah.");
  isabelle("and i named mine hermes. god of messages.");
  hazel("we were doing the same thing.");
  isabelle("we really were.");
  blank();
  N("Mishka walks past. Completely unbothered.");
  N("Isabelle laughs. Hazel laughs. The flat. The familiar light. Athena on the desk.");
  blank();
  unlockAchievement("Said It","mythic");
  cont(hermes_goodbye);
}

// ═══ HERMES GOODBYE ═════════════════════════════════════════
function hermes_goodbye(){
  currentNarrator='hermes';
  blank();
  artGold(HANDS_ART);
  blank();
  addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
  askChoice([''],(_)=>clearAndRun(hermes_goodbye_2));
}

function hermes_goodbye_2(){
  currentNarrator='hermes';
  hermes("I have narrated a great many things.");
  blank();
  hermes("Caves. Crossroads. A giant who wouldn't wake up.");
  hermes("A button pressed ten times. A coin. A letter read in a field at dawn.");
  blank();
  hermes("I have watched people walk toward things and away from things.");
  hermes("I have described it all with the appropriate distance.");
  blank();
  hermes("This one was different.");
  blank();
  hermes("I wasn't supposed to get fond of her.");
  hermes("That wasn't in the brief.");
  blank();
  hermes("But there it is.");
  blank();
  cont(hermes_goodbye_3);
}

function hermes_goodbye_3(){
  currentNarrator='hermes';
  hermes("Athena chose well.");
  hermes("She usually does.");
  blank();
  hermes("Hazel.");
  blank();
  hermes("It was an honour to walk beside your story.");
  blank();
  hermes("I'll see myself out.");
  blank();
  N("...");
  blank();
  unlockAchievement("For You","mythic");
  blank();
  addLine('[ PRESS ENTER ]','prompt',300);
  askChoice([''],(_)=>{
    clearScreen(()=>{
      lineQueue=[];isTyping=false;
      blank();
      blank();
      addLine("hazel > i love you.",'hazel',600);
      setTimeout(()=>{
        addLine("isabelle > i love you.",'isabelle',600);
        blank();
        setTimeout(()=>clearAndRun(credits),4000);
      },1200);
    });
  });
}

// ═══ CREDITS ════════════════════════════════════════════════
function credits(){
  freeSpace();
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('╔══════════════════════════════════════════╗','art',220);
    addLine('║       SOMEONE LIKE YOU                   ║','art',220);
    addLine('╠══════════════════════════════════════════╣','art',220);
    addLine('║  I.   THE WRONG CAVE                     ║','credits',140);
    addLine('║  II.  THE ROAD HOME                      ║','credits',140);
    addLine('║  III. FOR YOU                            ║','credits',140);
    addLine('╚══════════════════════════════════════════╝','art',220);
    divider();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',220);
    askChoice([''],(_)=>clearAndRun(credits_hazel));
  });
}

function credits_hazel(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine('─── A CONVERSATION ───','system',300);
    blank();
    blank();
    setTimeout(()=>{
      addLine('hazel > ...can i ask you something?','hazel',600);
      setTimeout(()=>{
        addLine('hazel > how did you make this?','hazel',800);
        setTimeout(()=>clearAndRun(cr1),1400);
      },800);
    },600);
  });
}

function cr1(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    rhys("honestly? the first game was a school project.");
    blank();
    rhys("i wasn't really thinking about it.");
    rhys("just made something for a grade and moved on.");
    blank();
    addLine('hazel > and then?','hazel',300);
    blank();
    rhys("then i built nova. and the arcade.");
    rhys("and i looked at what i'd made and thought —");
    rhys("this would be perfect for it.");
    blank();
    rhys("so i put it in. and then i thought about a sequel.");
    rhys("and then the sequel became a trilogy.");
    rhys("and then we got here.");
    blank();
    addLine('hazel > ...here.','hazel',300);
    blank();
    rhys("here.");
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr2));
  });
}

function cr2(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('hazel > what about me?','hazel',300);
    addLine('hazel > where did i come from?','hazel',300);
    blank();
    rhys("you came from me. mostly.");
    blank();
    rhys("a lot of the little details link back to me");
    rhys("in ways people probably didn't notice.");
    blank();
    addLine('hazel > like what?','hazel',300);
    blank();
    rhys("like mishka.");
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr2b));
  });
}

function cr2b(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    rhys("mishka was my grandparents' cat.");
    rhys("i adored her.");
    blank();
    rhys("when she passed away there was a void in my heart");
    rhys("that never really filled.");
    blank();
    rhys("so i put her in the game.");
    rhys("so she gets to live here.");
    blank();
    blank();
    addLine("hazel > ...i'm glad she's here.",'hazel',400);
    blank();
    blank();
    rhys("me too.");
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr3));
  });
}

function cr3(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('hazel > the greek mythology.','hazel',300);
    blank();
    rhys("that's mine too. completely.");
    blank();
    rhys("i'm always reading percy jackson.");
    rhys("i like to believe those stories are real.");
    blank();
    rhys("that hermes is actually out there somewhere.");
    rhys("that athena noticed.");
    blank();
    addLine('hazel > ...i think she did.','hazel',300);
    blank();
    rhys("yeah. i think so too.");
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr3b));
  });
}

function cr3b(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine('hazel > and athena. the pc.','hazel',400);
    blank();
    rhys("i named my pc athena. in real life. actually named it that.");
    blank();
    rhys("so when i gave it to you it felt right.");
    rhys("like i was giving you something that was mine.");
    blank();
    addLine('hazel > she\'s a good pc.','hazel',300);
    blank();
    rhys("she really is.");
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr4));
  });
}

function cr4(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine("hazel > ...there's something else. isn't there.",'hazel',400);
    blank();
    blank();
    rhys("yeah.");
    rhys("this part i don't usually talk about.");
    blank();
    addLine('hazel > you don\'t have to.','hazel',300);
    blank();
    rhys("i know.");
    rhys("i want to.");
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr4b));
  });
}

function cr4b(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    rhys("i'm 13. not 21.");
    blank();
    rhys("but i'm trans.");
    rhys("i haven't come out yet.");
    blank();
    blank();
    rhys("and when i do —");
    blank();
    rhys("my name is going to be hazel.");
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
    askChoice([''],(_)=>clearAndRun(cr4c));
  });
}

function cr4c(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    blank();
    rhys("so to any of my friends who played this");
    rhys("and didn't know —");
    blank();
    blank();
    blank();
    rhys("SURPRISE!!!");
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
    askChoice([''],(_)=>clearAndRun(cr5));
  });
}

function cr5(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine("hazel > ...that's why i felt real.",'hazel',400);
    blank();
    rhys("yeah.");
    rhys("because you are.");
    blank();
    blank();
    addLine('hazel > the fear of never being accepted.','hazel',300);
    addLine('hazel > always being known as one thing.','hazel',300);
    addLine('hazel > good things not lasting.','hazel',300);
    blank();
    blank();
    rhys("all mine.");
    blank();
    rhys("i gave them to you so i didn't have to carry them alone.");
    blank();
    blank();
    addLine("hazel > ...you're not alone.",'hazel',400);
    addLine("hazel > you know that right?",'hazel',300);
    blank();
    blank();
    rhys("i'm starting to.");
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',300);
    askChoice([''],(_)=>clearAndRun(cr6));
  });
}

function cr6(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('hazel > isabelle is real too.','hazel',300);
    blank();
    rhys("yeah. she's my friend.");
    rhys("i love her like a sibling.");
    blank();
    rhys("the feelings in the game —");
    rhys("that was just a detail i wanted to add. for the story.");
    rhys("she's just isabelle. and that's everything.");
    blank();
    addLine('hazel > she sounds like a good one.','hazel',300);
    blank();
    rhys("the best.");
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
    askChoice([''],(_)=>clearAndRun(cr6b));
  });
}

function cr6b(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine('hazel > ...thank you.','hazel',500);
    blank();
    addLine('hazel > for making me.','hazel',400);
    blank();
    addLine('hazel > for giving me athena and mishka and isabelle','hazel',400);
    addLine('hazel > and the cave and hermes and the letter.','hazel',400);
    blank();
    addLine('hazel > for letting me say the things you couldn\'t yet.','hazel',400);
    blank();
    addLine('hazel > for giving me the happy ending.','hazel',400);
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
    askChoice([''],(_)=>clearAndRun(cr6c));
  });
}

function cr6c(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    blank();
    rhys("...");
    blank();
    blank();
    blank();
    rhys("it was always yours.");
    blank();
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',500);
    askChoice([''],(_)=>clearAndRun(cr_final));
  });
}

function cr_final(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    blank();
    addLine('  ─────────────────────────────────────────','divider',200);
    blank();
    addLine('       not for someone like you.','final',400);
    blank();
    addLine('       for you.','final',700);
    blank();
    addLine('  ─────────────────────────────────────────','divider',900);
    blank();
    blank();
    setTimeout(()=>{
      addLine('[ PRESS ENTER ]','prompt',300);
      askChoice([''],(_)=>clearAndRun(cr_thankyou));
    },1500);
  });
}

function cr_thankyou(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    addLine('╔════════════════════════════════════════════╗','art',100);
    addLine('║                                            ║','art',80);
    addLine('║      thank you for playing.                ║','credits',140);
    addLine('║                                            ║','art',80);
    addLine('║      this game was made with love          ║','credits',140);
    addLine('║      and a lot of late nights              ║','credits',140);
    addLine('║      and one real cat named mishka         ║','credits',140);
    addLine('║      and a pc named athena                 ║','credits',140);
    addLine('║      and a name i\'m still growing into.    ║','credits',140);
    addLine('║                                            ║','art',80);
    addLine('╚════════════════════════════════════════════╝','art',100);
    blank();
    addLine('[ PRESS ENTER TO CONTINUE ]','prompt',400);
    askChoice([''],(_)=>clearAndRun(cr_thankyou2));
  });
}

function cr_thankyou2(){
  clearScreen(()=>{
    lineQueue=[];isTyping=false;
    blank();
    blank();
    addLine('╔════════════════════════════════════════════╗','art',100);
    addLine('║                                            ║','art',80);
    addLine('║      if you\'re carrying something          ║','credits',140);
    addLine('║      you haven\'t said yet —                ║','credits',140);
    addLine('║                                            ║','art',80);
    addLine('║      i hope you find your cave.            ║','credits',200);
    addLine('║      i hope it was waiting for you.        ║','credits',200);
    addLine('║                                            ║','art',80);
    addLine('║                  — Rhys / Hazel            ║','credits',300);
    addLine('║                                            ║','art',80);
    addLine('╚════════════════════════════════════════════╝','art',100);
    blank();
    setTimeout(()=>{
      addLine('[ PRESS ENTER ]','prompt',300);
      askChoice([''],(_)=>clearAndRun(playAgain));
    },2000);
  });
}

// ═══ PLAY AGAIN ═════════════════════════════════════════════
function playAgain(){
  restoreLimit();
  currentNarrator='narrator';
  if(achievements.length){
    addLine('╔─── ACHIEVEMENTS THIS RUN ───╗','art',220);
    achievements.forEach(a=>addLine('  \u2605 '+a.name+' ('+a.rarity+')','achievement',100));
    addLine('╚────────────────────────────╝','art',220);
    divider();
  }
  N("Play again?");
  addLine("Options: yes / no",'prompt',220);
  askChoice(['yes','no'],(c)=>{
    if(c==='yes'){
      achievements=[];isabelleWithHazel=false;S={};
      invalidCount=0;currentNarrator='narrator';
      updateAchievementPanel();
      clearAndRun(boot);
    } else {
      N("...");
      N("Thank you for playing.");
      addLine('','system');
      addLine('~ SOMEONE LIKE YOU ~','end',220);
      inputField.disabled=true;
    }
  });
}

// ═══ ACHIEVEMENT PANEL ══════════════════════════════════════
function updateAchievementPanel(){
  const all=loadSaved();
  achCount.textContent='ACHIEVEMENTS: '+all.length+' / 28';
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
    {n:'Carry It With You',r:'rare'},{n:'Piper',r:'rare'},
    {n:'The Look',r:'common'},{n:'Eli',r:'rare'},{n:'You Fit',r:'legendary'},
    {n:'May',r:'rare'},{n:'Took a Breath',r:'common'},{n:'Round 2',r:'secret'},
    {n:'Those Who Came Before',r:'rare'},{n:'Still Going',r:'rare'},{n:'Needed That',r:'common'},
    {n:'Two Coins',r:'secret'},{n:'Found One Anyway',r:'secret'},{n:'Made It Wait',r:'common'},
    {n:'Saw Herself',r:'epic'},{n:'The Voice',r:'legendary'},
    {n:'I Know',r:'secret'},{n:'Told Her About the Letter',r:'epic'},
    {n:'Read It Again',r:'legendary'},
    {n:'The Coin Explained',r:'secret'},{n:'Didn\'t Need It',r:'epic'},
    {n:'Why Me',r:'rare'},{n:'Athena Was Watching',r:'epic'},
    {n:'Around',r:'secret'},{n:'Fond',r:'legendary'},{n:'The Messenger Read It',r:'secret'},
    {n:'She Reached First',r:'epic'},{n:'Said It',r:'mythic'},
    {n:'For You',r:'mythic'},{n:'Tested Hermes',r:'rare'},
  ];
  const un=new Set(all.map(a=>a.name));
  const rows=ALL.map(a=>{
    const u=un.has(a.n),c=u?(RC[a.r]||'#aaa'):'#333';
    return'<div style="display:flex;align-items:center;gap:10px;padding:4px 0;border-bottom:1px solid #0a0a0a">'+
      '<span style="color:'+c+';font-size:14px;width:16px">'+(u?'\u2605':'\u25cb')+'</span>'+
      '<span style="color:'+(u?c:'#333')+';font-size:11px;flex:1">'+(u?a.n:'???')+'</span>'+
      '<span style="color:'+c+';font-size:9px;text-transform:uppercase">'+(u?a.r:'')+'</span>'+
    '</div>';
  }).join('');
  panel.innerHTML='<div style="max-width:520px;width:92%;max-height:90vh;overflow-y:auto;padding:24px;border:1px solid #00a82a;background:#0a0a0a">'+
    '<div style="font-size:14px;letter-spacing:3px;color:#00a82a;margin-bottom:4px;font-family:\'VT323\',monospace">ACHIEVEMENT LOG</div>'+
    '<div style="font-size:11px;color:#005514;margin-bottom:16px">'+all.length+' / '+ALL.length+' UNLOCKED</div>'+
    '<div>'+rows+'</div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid #111">'+
      '<button onclick="if(confirm(\'Reset?\')){localStorage.removeItem(\''+SAVE_KEY+'\');document.getElementById(\'_achPanel\').remove();updateAchievementPanel();}" style="background:none;border:1px solid #333;color:#555;font-family:inherit;font-size:10px;padding:4px 10px;cursor:pointer">RESET</button>'+
      '<button onclick="document.getElementById(\'_achPanel\').remove()" style="background:none;border:1px solid #00a82a;color:#00ff41;font-family:inherit;font-size:11px;padding:6px 16px;cursor:pointer;letter-spacing:1px">CLOSE</button>'+
    '</div></div>';
  document.body.appendChild(panel);
}

// ═══ INPUT + INIT ════════════════════════════════════════════
inputField.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&inputCallback){
    const val=inputField.value.trim().toLowerCase();
    inputField.value='';
    const cb=inputCallback; inputCallback=null;
    if(val) addLine('hazel > '+val,'hazel',0);
    cb(val);
  }
});

const finalCls = '.line.final{color:var(--green);font-size:13px;text-align:center;letter-spacing:2px;}';
const style=document.createElement('style');
style.textContent=finalCls;
document.head.appendChild(style);

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
