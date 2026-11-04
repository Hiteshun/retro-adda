(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var N=16, C=cv.width/N, HI='snake';
  var snake, dir, queue, food, score, over, running, timer, speed;
  Retro.bestLine(bestEl,HI);
  function rnd(n){ return Math.floor(Math.random()*n); }
  function place(){
    for(var i=0;i<500;i++){ var p={x:rnd(N),y:rnd(N)}; if(!snake.some(function(s){return s.x===p.x&&s.y===p.y;})){ food=p; return; } }
  }
  function reset(){
    snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}]; dir={x:1,y:0}; queue=[]; score=0; over=false; running=false; speed=130;
    scoreEl.textContent='0'; msg.textContent='TAP OR PRESS AN ARROW TO START'; place(); draw();
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
    Retro.sfx('lose');
    if(Retro.hiSet(HI,score)) bestEl.textContent=score;
    msg.textContent='GAME OVER - TAP TO PLAY AGAIN';
    draw();
  }
  function step(){
    if(!running||over) return;
    if(queue.length) dir=queue.shift();
    var h={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(function(s){return s.x===h.x&&s.y===h.y;})){ return end(); }
    snake.unshift(h);
    if(h.x===food.x&&h.y===food.y){
      score+=10; scoreEl.textContent=score; Retro.sfx('eat');
      if(score%50===0 && speed>60){ speed-=10; restartTimer(); }
      place();
    } else { snake.pop(); Retro.sfx('move'); }
    draw();
  }
  function draw(){
    ctx.fillStyle='#0b1f0b'; ctx.fillRect(0,0,cv.width,cv.height);
    ctx.strokeStyle='#123012'; ctx.lineWidth=1;
    for(var i=0;i<=N;i++){ ctx.beginPath(); ctx.moveTo(i*C,0); ctx.lineTo(i*C,cv.height); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0,i*C); ctx.lineTo(cv.width,i*C); ctx.stroke(); }
    ctx.fillStyle='#ff3b3b'; ctx.fillRect(food.x*C+3,food.y*C+3,C-6,C-6);
    ctx.fillStyle='#ff9a9a'; ctx.fillRect(food.x*C+5,food.y*C+5,4,4);
    snake.forEach(function(s,i){
      ctx.fillStyle = i===0 ? '#e6ff5c' : '#39ff14';
      ctx.fillRect(s.x*C+1,s.y*C+1,C-2,C-2);
    });
    if(over){ ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(0,0,cv.width,cv.height); }
  }
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
