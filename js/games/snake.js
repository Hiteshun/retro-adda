(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var N=16, C=cv.width/N, HI='snake';
  var snake, dir, queue, food, bonus, walls, score, over, running, timer, speed, level, eaten, combo, lastEat, parts, shake, tickN;
  Retro.bestLine(bestEl,HI);
  function rnd(n){ return Math.floor(Math.random()*n); }
  function occupied(p){
    return snake.some(function(s){return s.x===p.x&&s.y===p.y;}) || walls.some(function(w){return w.x===p.x&&w.y===p.y;}) ||
      (food && food.x===p.x && food.y===p.y) || (bonus && bonus.x===p.x && bonus.y===p.y);
  }
  function free(){
    for(var i=0;i<600;i++){ var p={x:rnd(N),y:rnd(N)}; if(!occupied(p) && Math.abs(p.x-snake[0].x)+Math.abs(p.y-snake[0].y)>3) return p; }
    return null;
  }
  function burst(x,y,col,n){
    for(var i=0;i<n;i++){ var a=Math.random()*6.28, v=1+Math.random()*2.5;
      parts.push({x:x*C+C/2,y:y*C+C/2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:18+Math.random()*10,c:col}); }
  }
  function buildWalls(){
    walls=[];
    if(level<2) return;
    var n=Math.min(4+level*2, 22);
    for(var i=0;i<n;i++){
      var p=free(); if(!p) break;
      if(p.y>5&&p.y<11&&p.x<7) continue;
      walls.push(p);
    }
  }
  function reset(){
    snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}]; dir={x:1,y:0}; queue=[]; score=0; over=false; running=false; speed=135;
    level=1; eaten=0; combo=0; lastEat=0; parts=[]; shake=0; tickN=0; walls=[]; food=null; bonus=null;
    scoreEl.textContent='0'; msg.textContent='TAP OR PRESS AN ARROW TO START';
    food=free(); draw();
    clearInterval(timer); timer=setInterval(step,speed);
  }
  function restartTimer(){ clearInterval(timer); timer=setInterval(step,speed); }
  function turn(name){
    if(over) return;
    var d={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}}[name];
    if(!d) return;
    if(!running){ running=true; msg.textContent=''; }
    var last = queue.length ? queue[queue.length-1] : dir;
    if(d.x===last.x && d.y===last.y) return;
    if(d.x===-last.x && d.y===-last.y) return;
    if(queue.length<3) queue.push(d);
  }
  function end(){
    over=true; running=false; clearInterval(timer);
    Retro.sfx('lose'); shake=10;
    if(Retro.hiSet(HI,score)) bestEl.textContent=score;
    msg.textContent='GAME OVER · LEVEL '+level+' · TAP TO PLAY AGAIN';
    draw();
  }
  function levelUp(){
    level++; eaten=0;
    if(speed>70){ speed-=9; restartTimer(); }
    buildWalls(); Retro.sfx('win');
    msg.textContent='LEVEL '+level+'! WALLS GROW'; setTimeout(function(){ if(!over&&running) msg.textContent=''; },1400);
  }
  function step(){
    if(!running||over) return;
    tickN++;
    if(queue.length) dir=queue.shift();
    var h={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(function(s){return s.x===h.x&&s.y===h.y;})||walls.some(function(w){return w.x===h.x&&w.y===h.y;})){ return end(); }
    snake.unshift(h);
    var ate=false;
    if(food && h.x===food.x&&h.y===food.y){
      var now=Date.now(); combo = (now-lastEat<3200) ? Math.min(combo+1,5) : 1; lastEat=now;
      var gain=10*combo; score+=gain; ate=true; eaten++;
      burst(h.x,h.y,'#ff6b6b',12); Retro.sfx('eat');
      if(combo>1) msg.textContent='COMBO x'+combo+'!';
      food=null; food=free();
      if(!bonus && eaten%3===0 && Math.random()<0.9){ bonus=free(); if(bonus) bonus.ttl=44; }
      if(eaten>=6) levelUp();
    } else if(bonus && h.x===bonus.x&&h.y===bonus.y){
      score+=50; ate=true; burst(h.x,h.y,'#ffe600',22); Retro.sfx('win'); bonus=null; shake=4;
      msg.textContent='GOLDEN +50!'; setTimeout(function(){ if(!over&&running) msg.textContent=''; },900);
    }
    if(!ate){ snake.pop(); Retro.sfx('move'); }
    scoreEl.textContent=score;
    if(bonus){ bonus.ttl--; if(bonus.ttl<=0) bonus=null; }
    if(combo && Date.now()-lastEat>3200){ combo=0; }
    draw();
  }
  function draw(){
    var ox=0, oy=0;
    if(shake>0){ ox=(Math.random()-.5)*shake; oy=(Math.random()-.5)*shake; shake=Math.max(0,shake-1); }
    ctx.save(); ctx.translate(ox,oy);
    ctx.fillStyle='#0b1f0b'; ctx.fillRect(-10,-10,cv.width+20,cv.height+20);
    ctx.strokeStyle='#123012'; ctx.lineWidth=1;
    for(var i=0;i<=N;i++){ ctx.beginPath(); ctx.moveTo(i*C,0); ctx.lineTo(i*C,cv.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*C); ctx.lineTo(cv.width,i*C); ctx.stroke(); }
    walls.forEach(function(w){ ctx.fillStyle='#6b6b78'; ctx.fillRect(w.x*C+1,w.y*C+1,C-2,C-2); ctx.fillStyle='#9a9aa8'; ctx.fillRect(w.x*C+1,w.y*C+1,C-2,3); ctx.fillStyle='#3d3d48'; ctx.fillRect(w.x*C+1,w.y*C+C-4,C-2,3); });
    if(food){ ctx.fillStyle='#ff3b3b'; ctx.fillRect(food.x*C+3,food.y*C+3,C-6,C-6); ctx.fillStyle='#ff9a9a'; ctx.fillRect(food.x*C+5,food.y*C+5,4,4); }
    if(bonus){
      var blink = bonus.ttl>14 || (bonus.ttl%2===0);
      if(blink){ ctx.fillStyle='#ffe600'; ctx.fillRect(bonus.x*C+2,bonus.y*C+2,C-4,C-4); ctx.fillStyle='#fff6a0'; ctx.fillRect(bonus.x*C+4,bonus.y*C+4,5,5);
        ctx.fillStyle='#000'; ctx.font='bold 9px monospace'; ctx.fillText('$',bonus.x*C+6,bonus.y*C+C-5); }
    }
    snake.forEach(function(s,i){
      ctx.fillStyle = i===0 ? '#e6ff5c' : (i%2? '#39ff14':'#2fd610');
      ctx.fillRect(s.x*C+1,s.y*C+1,C-2,C-2);
    });
    var hd=snake[0]; ctx.fillStyle='#000';
    ctx.fillRect(hd.x*C+5+dir.x*2,hd.y*C+5+dir.y*2,3,3); ctx.fillRect(hd.x*C+C-8+dir.x*2,hd.y*C+5+dir.y*2,3,3);
    parts=parts.filter(function(p){ return p.life>0; });
    parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.life--; ctx.globalAlpha=Math.max(0,p.life/24); ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,3,3); });
    ctx.globalAlpha=1;
    ctx.fillStyle='rgba(255,255,255,.75)'; ctx.font='8px monospace'; ctx.fillText('LVL '+level+(combo>1?'  x'+combo:''),6,12);
    if(over){ ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(0,0,cv.width,cv.height); }
    ctx.restore();
  }
  setInterval(function(){ if(parts.length||shake>0) draw(); },33);
  var map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down',A:'left',D:'right',W:'up',S:'down'};
  document.addEventListener('keydown',function(e){
    var k=map[e.key];
    if(k){ e.preventDefault(); turn(k); }
  });
  Retro.swipe(cv,turn,20);
  cv.addEventListener('click',function(){ if(over) reset(); else if(!running) turn(dir.x===1?'right':dir.x===-1?'left':dir.y===1?'down':'up'); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-dir]'),function(b){
    b.addEventListener('click',function(){ turn(b.getAttribute('data-dir')); });
  });
  document.getElementById('again').addEventListener('click',reset);
  reset();
})();
