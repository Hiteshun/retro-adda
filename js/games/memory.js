(function(){
  var board=document.getElementById('board'), scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var KEY='memory';
  var SYM=['🍎','🍌','🍇','🍒','🍉','🍓','🍍','🥝'];
  var cards, first, lock, moves, matched;
  Retro.bestLine(bestEl,KEY);
  function shuffle(a){ for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function newGame(){
    var pairs=SYM.concat(SYM);
    shuffle(pairs);
    cards=pairs.map(function(e,i){ return {e:e,open:false,done:false,id:i}; });
    first=null; lock=false; moves=0; matched=0;
    scoreEl.textContent='0'; msg.textContent='FIND ALL 8 PAIRS';
    render();
  }
  function render(){
    board.innerHTML=cards.map(function(c,i){
      var cls='btn mem'+(c.done?' done':c.open?' open':'');
      var face=(c.open||c.done)?c.e:'?';
      return '<button class="'+cls+'" data-i="'+i+'" aria-label="card '+(i+1)+'">'+face+'</button>';
    }).join('');
  }
  function score(){ return Math.max(0, 300 - moves*10); }
  function flip(i){
    if(lock) return;
    var c=cards[i];
    if(c.open||c.done) return;
    c.open=true; Retro.sfx('flip'); render();
    if(first===null){ first=i; return; }
    moves++; lock=true;
    var a=cards[first], b=c;
    if(a.e===b.e){
      setTimeout(function(){
        a.done=b.done=true; a.open=b.open=false; matched++; first=null; lock=false;
        Retro.sfx('match');
        scoreEl.textContent=moves;
        if(matched===8){
          var s=score(); var isBest=Retro.hiSet(KEY,s);
          msg.textContent='YOU WIN IN '+moves+' MOVES'+(isBest?' - NEW BEST!':'');
          Retro.sfx('win'); if(isBest) bestEl.textContent=s;
        } else msg.textContent='PAIR! '+(8-matched)+' LEFT';
        render();
      },350);
    } else {
      setTimeout(function(){
        a.open=b.open=false; first=null; lock=false; render();
      },800);
    }
    scoreEl.textContent=moves; render();
  }
  board.addEventListener('click',function(e){
    var btn=e.target.closest('button[data-i]'); if(!btn) return;
    flip(parseInt(btn.getAttribute('data-i'),10));
  });
  document.getElementById('again').addEventListener('click',newGame);
  newGame();
})();
