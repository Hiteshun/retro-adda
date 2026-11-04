(function(){
  var board=document.getElementById('board'), msg=document.getElementById('msg');
  var minesEl=document.getElementById('score'), timeEl=document.getElementById('best');
  var flagBtn=document.getElementById('flagmode');
  var R=9, C=9, M=10, KEY='minesweeper-time';
  var mine, num, open, flag, over, won, started, t0, timer, flagMode=false, flagsUsed, bestTime;
  bestTime=parseInt(localStorage.getItem('retro-adda-hi-'+KEY)||'0',10)||0;
  function idx(r,c){ return r*C+c; }
  function nb(r,c,fn){ for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){ if(!dr&&!dc) continue; var rr=r+dr, cc=c+dc; if(rr>=0&&rr<R&&cc>=0&&cc<C) fn(rr,cc); } }
  function reset(){
    mine=[]; num=[]; open=[]; flag=[]; for(var i=0;i<R*C;i++){ mine.push(false); num.push(0); open.push(false); flag.push(false); }
    over=false; won=false; started=false; flagsUsed=0; clearInterval(timer); t0=0;
    msg.textContent='TAP A SQUARE TO START'; timeEl.textContent='0'; minesEl.textContent=M;
    render();
  }
  function plant(safeR,safeC){
    var placed=0;
    while(placed<M){
      var p=Math.floor(Math.random()*R*C);
      var r=Math.floor(p/C), c=p%C;
      if(mine[p]) continue;
      if(Math.abs(r-safeR)<=1 && Math.abs(c-safeC)<=1) continue;
      mine[p]=true; placed++;
    }
    for(var r2=0;r2<R;r2++) for(var c2=0;c2<C;c2++){
      var n=0; nb(r2,c2,function(a,b){ if(mine[idx(a,b)]) n++; }); num[idx(r2,c2)]=n;
    }
  }
  function revealAll(){ for(var i=0;i<R*C;i++) open[i]=true; }
  function reveal(r,c){
    var stack=[[r,c]];
    while(stack.length){
      var p=stack.pop(), rr=p[0], cc=p[1], k=idx(rr,cc);
      if(open[k]||flag[k]) continue;
      open[k]=true;
      if(num[k]===0 && !mine[k]) nb(rr,cc,function(a,b){ if(!open[idx(a,b)]) stack.push([a,b]); });
    }
  }
  function checkWin(){
    var left=0; for(var i=0;i<R*C;i++) if(!open[i]) left++;
    if(left===M){
      won=true; over=true; clearInterval(timer);
      for(var i2=0;i2<R*C;i2++) if(mine[i2]) flag[i2]=true;
      var secs=Math.floor((Date.now()-t0)/1000);
      var isBest=(bestTime===0||secs<bestTime);
      if(isBest){ bestTime=secs; try{ localStorage.setItem('retro-adda-hi-'+KEY,String(secs)); }catch(e){} }
      msg.textContent='YOU WIN IN '+secs+'s'+(isBest?' - NEW BEST TIME!':'');
      Retro.sfx('win'); render();
    }
  }
  function lose(hit){
    over=true; clearInterval(timer); revealAll(); Retro.sfx('lose');
    msg.textContent='BOOM! TAP "NEW GAME"';
    render();
  }
  function tap(i,isFlagAction){
    if(over) return;
    var r=Math.floor(i/C), c=i%C;
    if(isFlagAction){
      if(open[i]) return;
      flag[i]=!flag[i]; flagsUsed += flag[i]?1:-1; minesEl.textContent=M-flagsUsed; Retro.sfx('pop'); render(); return;
    }
    if(flag[i]||open[i]) return;
    if(!started){
      started=true; plant(r,c); t0=Date.now();
      timer=setInterval(function(){ timeEl.textContent=Math.floor((Date.now()-t0)/1000); },250);
      msg.textContent='FIND THE MINES';
    }
    if(mine[i]){ open[i]=true; lose(i); return; }
    reveal(r,c); Retro.sfx('flip'); checkWin(); render();
  }
  function render(){
    var html='';
    for(var r=0;r<R;r++) for(var c=0;c<C;c++){
      var i=idx(r,c), cls='', txt='';
      if(open[i]){
        cls='r';
        if(mine[i]){ cls='m'; txt='*'; }
        else if(num[i]){ txt=num[i]; cls='r n'+num[i]; }
      } else if(flag[i]){ cls='f'; txt='F'; }
      html+='<button class="'+cls+'" data-i="'+i+'" aria-label="square '+(r+1)+','+(c+1)+'">'+txt+'</button>';
    }
    board.innerHTML=html;
  }
  board.addEventListener('click',function(e){
    var btn=e.target.closest('button[data-i]'); if(!btn) return;
    tap(parseInt(btn.getAttribute('data-i'),10), flagMode);
  });
  board.addEventListener('contextmenu',function(e){
    var btn=e.target.closest('button[data-i]'); if(!btn) return;
    e.preventDefault(); tap(parseInt(btn.getAttribute('data-i'),10), true);
  });
  flagBtn.addEventListener('click',function(){
    flagMode=!flagMode; flagBtn.textContent='FLAG MODE: '+(flagMode?'ON':'OFF'); flagBtn.setAttribute('aria-pressed',String(flagMode));
  });
  document.getElementById('again').addEventListener('click',reset);
  reset();
})();
