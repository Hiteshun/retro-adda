(function(){
  var board=document.getElementById('board'), scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var KEY='2048', g, score, won, over;
  Retro.bestLine(bestEl,KEY);
  function empty(){ var a=[]; for(var r=0;r<4;r++){ a.push([0,0,0,0]); } return a; }
  function addTile(){
    var cells=[];
    for(var r=0;r<4;r++) for(var c=0;c<4;c++) if(!g[r][c]) cells.push([r,c]);
    if(!cells.length) return;
    var p=cells[Math.floor(Math.random()*cells.length)];
    g[p[0]][p[1]] = Math.random()<0.9 ? 2 : 4;
  }
  function slide(line){
    var vals=line.filter(function(v){return v;}), out=[], gained=0;
    for(var i=0;i<vals.length;i++){
      if(i+1<vals.length && vals[i]===vals[i+1]){ var v=vals[i]*2; out.push(v); gained+=v; i++; }
      else out.push(vals[i]);
    }
    while(out.length<4) out.push(0);
    return {row:out, gained:gained};
  }
  function canMove(){
    for(var r=0;r<4;r++) for(var c=0;c<4;c++){
      if(!g[r][c]) return true;
      if(c<3 && g[r][c]===g[r][c+1]) return true;
      if(r<3 && g[r][c]===g[r+1][c]) return true;
    }
    return false;
  }
  function render(){
    var html='';
    for(var r=0;r<4;r++) for(var c=0;c<4;c++){
      var v=g[r][c];
      html+='<div class="t'+(v?' t'+v:'')+'">'+(v||'')+'</div>';
    }
    board.innerHTML=html;
    scoreEl.textContent=score;
  }
  function move(dir){
    if(over) return;
    var moved=false, gainedTotal=0;
    for(var i=0;i<4;i++){
      var idx=[];
      for(var j=0;j<4;j++){
        if(dir==='left') idx.push([i,j]);
        else if(dir==='right') idx.push([i,3-j]);
        else if(dir==='up') idx.push([j,i]);
        else idx.push([3-j,i]);
      }
      var line=idx.map(function(p){return g[p[0]][p[1]];});
      var res=slide(line);
      for(var k=0;k<4;k++){
        var p=idx[k];
        if(g[p[0]][p[1]]!==res.row[k]) moved=true;
        g[p[0]][p[1]]=res.row[k];
      }
      gainedTotal+=res.gained;
    }
    if(!moved) return;
    score+=gainedTotal;
    addTile();
    if(!won && g.some(function(r){return r.indexOf(2048)>=0;})){ won=true; msg.textContent='YOU MADE 2048! KEEP GOING'; Retro.sfx('win'); }
    else if(gainedTotal) Retro.sfx('clear'); else Retro.sfx('move');
    render();
    if(Retro.hiSet(KEY,score)) bestEl.textContent=score;
    if(!canMove()){ over=true; msg.textContent='GAME OVER - PRESS NEW GAME'; Retro.sfx('lose'); }
  }
  function newGame(){
    g=empty(); score=0; won=false; over=false; msg.textContent='JOIN THE TILES TO GET 2048';
    addTile(); addTile(); render();
  }
  var map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
  document.addEventListener('keydown',function(e){ var k=map[e.key]; if(k){ e.preventDefault(); move(k); } });
  Retro.swipe(board,move,24);
  Array.prototype.forEach.call(document.querySelectorAll('[data-dir]'),function(b){ b.addEventListener('click',function(){ move(b.getAttribute('data-dir')); }); });
  document.getElementById('again').addEventListener('click',newGame);
  newGame();
})();
