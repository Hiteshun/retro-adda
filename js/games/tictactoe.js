(function(){
  var board=document.getElementById('board'), msg=document.getElementById('msg');
  var winsEl=document.getElementById('score'), drawsEl=document.getElementById('best');
  var KEY='tictactoe';
  var b, busy, wins=0, losses=0, draws=0;
  var LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function winner(bd){
    for(var i=0;i<LINES.length;i++){ var l=LINES[i]; if(bd[l[0]] && bd[l[0]]===bd[l[1]] && bd[l[0]]===bd[l[2]]) return bd[l[0]]; }
    return bd.every(function(x){return x;}) ? 'draw' : null;
  }
  function minimax(bd,turn){
    var w=winner(bd);
    if(w==='O') return 10; if(w==='X') return -10; if(w==='draw') return 0;
    var best = turn==='O' ? -Infinity : Infinity;
    for(var i=0;i<9;i++) if(!bd[i]){
      bd[i]=turn; var s=minimax(bd, turn==='O'?'X':'O'); bd[i]='';
      best = turn==='O' ? Math.max(best,s) : Math.min(best,s);
    }
    return best;
  }
  function cpuPick(){
    var empty=[]; for(var i=0;i<9;i++) if(!b[i]) empty.push(i);
    if(Math.random()<0.3) return empty[Math.floor(Math.random()*empty.length)];
    var bestI=empty[0], best=-Infinity;
    empty.forEach(function(i){ b[i]='O'; var s=minimax(b,'X'); b[i]=''; if(s>best){ best=s; bestI=i; } });
    return bestI;
  }
  function render(){
    board.innerHTML=b.map(function(v,i){
      return '<button class="'+(v==='X'?'x':v==='O'?'o':'')+'" data-i="'+i+'" '+((v||busy)?'disabled':'')+' aria-label="cell '+(i+1)+'">'+v+'</button>';
    }).join('');
    winsEl.textContent=wins; drawsEl.textContent=draws;
  }
  function finish(w){
    busy=true;
    if(w==='X'){ wins++; msg.textContent='YOU WIN! 🎉'; Retro.sfx('win'); if(Retro.hiSet(KEY,wins)){} }
    else if(w==='O'){ losses++; msg.textContent='CPU WINS. TRY AGAIN.'; Retro.sfx('lose'); }
    else { draws++; msg.textContent='DRAW. NICE.'; Retro.sfx('pop'); }
    render();
  }
  function after(){
    var w=winner(b); if(w){ finish(w); return true; } return false;
  }
  board.addEventListener('click',function(e){
    var btn=e.target.closest('button[data-i]'); if(!btn||busy) return;
    var i=parseInt(btn.getAttribute('data-i'),10); if(b[i]) return;
    b[i]='X'; Retro.sfx('flip'); render();
    if(after()) return;
    busy=true; msg.textContent='CPU SOCHRAHA HAI...'; render();
    setTimeout(function(){
      var j=cpuPick(); b[j]='O'; busy=false; Retro.sfx('pop');
      if(!after()) msg.textContent='YOUR TURN (X)';
      render();
    },380);
  });
  document.getElementById('again').addEventListener('click',function(){
    b=['','','','','','','','',''];
    busy=false; msg.textContent='YOUR TURN (X)'; render();
  });
  b=['','','','','','','','','']; busy=false; msg.textContent='YOUR TURN (X)';
  render();
})();
