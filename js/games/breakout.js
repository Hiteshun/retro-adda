(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var W=cv.width, H=cv.height, KEY='breakout';
  var COLS=8, ROWS=6, BW=36, BH=12, GAP=4, TOP=48, LEFT=(W-(COLS*BW+(COLS-1)*GAP))/2;
  var COLORS=['#ff3b3b','#ff9a3b','#ffe600','#39ff14','#3bd6ff','#c14bff'];
  var paddle, ball, bricks, score, lives, level, state, speed;
  Retro.bestLine(bestEl,KEY);
  function buildBricks(){
    bricks=[];
    for(var r=0;r<ROWS;r++) for(var c=0;c<COLS;c++){
      bricks.push({x:LEFT+c*(BW+GAP), y:TOP+r*(BH+GAP), w:BW, h:BH, alive:true, color:COLORS[r], pts:(ROWS-r)*10});
    }
  }
  function resetBall(){
    ball={x:paddle.x+paddle.w/2, y:paddle.y-6, r:5, dx:0, dy:0, stuck:true};
  }
  function launch(){
    if(state==='over'){ newGame(); return; }
    if(state!=='play') return;
    if(ball.stuck){
      var a=-Math.PI/2 + (Math.random()*0.6-0.3);
      ball.dx=speed*Math.cos(a); ball.dy=speed*Math.sin(a); ball.stuck=false;
      msg.textContent='';
    }
  }
  function newGame(){
    paddle={w:64,h:8,x:(W-64)/2,y:H-30};
    score=0; lives=3; level=1; speed=3.2; state='play';
    buildBricks(); resetBall();
    scoreEl.textContent='0'; msg.textContent='TAP OR SPACE TO LAUNCH';
    draw();
  }
  function nextLevel(){
    level++; speed=Math.min(6.5, speed+0.5); buildBricks(); resetBall(); msg.textContent='LEVEL '+level+' - TAP TO LAUNCH';
    Retro.sfx('win');
  }
  function loseLife(){
    lives--; Retro.sfx('lose');
    if(lives<=0){
      state='over'; msg.textContent='GAME OVER - TAP TO PLAY AGAIN';
      if(Retro.hiSet(KEY,score)) bestEl.textContent=score;
    } else { resetBall(); msg.textContent='LIFE LOST - TAP TO LAUNCH'; }
  }
  function update(){
    if(state!=='play') { draw(); return; }
    if(ball.stuck){ ball.x=paddle.x+paddle.w/2; ball.y=paddle.y-ball.r-1; draw(); return; }
    ball.x+=ball.dx; ball.y+=ball.dy;
    if(ball.x-ball.r<0){ ball.x=ball.r; ball.dx=Math.abs(ball.dx); Retro.sfx('hit'); }
    if(ball.x+ball.r>W){ ball.x=W-ball.r; ball.dx=-Math.abs(ball.dx); Retro.sfx('hit'); }
    if(ball.y-ball.r<0){ ball.y=ball.r; ball.dy=Math.abs(ball.dy); Retro.sfx('hit'); }
    // paddle
    if(ball.dy>0 && ball.y+ball.r>=paddle.y && ball.y-ball.r<=paddle.y+paddle.h && ball.x>=paddle.x-ball.r && ball.x<=paddle.x+paddle.w+ball.r){
      var rel=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);
      rel=Math.max(-0.9,Math.min(0.9,rel));
      var a=rel*1.05;
      ball.dx=speed*Math.sin(a); ball.dy=-speed*Math.cos(a);
      ball.y=paddle.y-ball.r;
      Retro.sfx('pop');
    }
    // bricks
    for(var i=0;i<bricks.length;i++){
      var b=bricks[i]; if(!b.alive) continue;
      var cx=Math.max(b.x,Math.min(ball.x,b.x+b.w)), cy=Math.max(b.y,Math.min(ball.y,b.y+b.h));
      var dx=ball.x-cx, dy=ball.y-cy;
      if(dx*dx+dy*dy<=ball.r*ball.r){
        b.alive=false; score+=b.pts; scoreEl.textContent=score; Retro.sfx('clear');
        if(Math.abs(dx)>Math.abs(dy)) ball.dx=-ball.dx; else ball.dy=-ball.dy;
        break;
      }
    }
    if(bricks.every(function(b){return !b.alive;})){ nextLevel(); }
    if(ball.y-ball.r>H){ loseLife(); }
    draw();
  }
  function draw(){
    ctx.fillStyle='#050510'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#1b1b2f'; for(var y=0;y<H;y+=4) ctx.fillRect(0,y,W,1);
    bricks.forEach(function(b){
      if(!b.alive) return;
      ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h);
      ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(b.x,b.y,b.w,2);
      ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(b.x,b.y+b.h-2,b.w,2);
    });
    ctx.fillStyle='#fff'; ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
    ctx.fillStyle='#8be9ff'; ctx.fillRect(paddle.x,paddle.y,paddle.w,2);
    ctx.fillStyle='#ffe600'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ff3b3b';
    for(var l=0;l<lives;l++) ctx.fillRect(8+l*12,H-12,8,6);
    ctx.fillStyle='#fff'; ctx.font='8px monospace'; ctx.fillText('LVL '+level,W-54,H-6);
    if(state==='over'){ ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,0,W,H); }
  }
  function setPaddleFromX(clientX){
    var rect=cv.getBoundingClientRect();
    var x=(clientX-rect.left)*(W/rect.width);
    paddle.x=Math.max(0,Math.min(W-paddle.w, x-paddle.w/2));
    if(ball.stuck){ ball.x=paddle.x+paddle.w/2; }
  }
  cv.addEventListener('mousemove',function(e){ setPaddleFromX(e.clientX); });
  cv.addEventListener('touchmove',function(e){ e.preventDefault(); setPaddleFromX(e.touches[0].clientX); },{passive:false});
  cv.addEventListener('touchstart',function(e){ setPaddleFromX(e.touches[0].clientX); },{passive:true});
  cv.addEventListener('click',launch);
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'||e.key==='a'){ paddle.x=Math.max(0,paddle.x-14); if(ball.stuck) ball.x=paddle.x+paddle.w/2; e.preventDefault(); }
    else if(e.key==='ArrowRight'||e.key==='d'){ paddle.x=Math.min(W-paddle.w,paddle.x+14); if(ball.stuck) ball.x=paddle.x+paddle.w/2; e.preventDefault(); }
    else if(e.key===' '){ e.preventDefault(); launch(); }
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-dir]'),function(b){
    var d=b.getAttribute('data-dir'); var timer=null;
    function go(){ paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x+(d==='left'?-8:8))); if(ball.stuck) ball.x=paddle.x+paddle.w/2; }
    b.addEventListener('pointerdown',function(){ go(); timer=setInterval(go,30); });
    ['pointerup','pointerleave','pointercancel'].forEach(function(ev){ b.addEventListener(ev,function(){ clearInterval(timer); }); });
  });
  document.getElementById('again').addEventListener('click',newGame);
  setInterval(update,1000/60);
  newGame();
})();
