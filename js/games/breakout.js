(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var W=cv.width, H=cv.height, KEY='breakout';
  var COLS=8, ROWS=6, BW=36, BH=12, GAP=4, TOP=48, LEFT=(W-(COLS*BW+(COLS-1)*GAP))/2;
  var COLORS=['#ff3b3b','#ff9a3b','#ffe600','#39ff14','#3bd6ff','#c14bff'];
  var PU={W:{c:'#3bd6ff',t:'WIDE'},M:{c:'#ff4fd8',t:'x3'},S:{c:'#ffe600',t:'SLOW'},L:{c:'#ff3b3b',t:'+1'},F:{c:'#ff9a3b',t:'FIRE'}};
  var paddle, balls, bricks, drops, parts, score, lives, level, state, speed, wideT, slowT, fireT, combo, shake;
  Retro.bestLine(bestEl,KEY);
  function layout(l){
    var k=(l-1)%4;
    return function(r,c){
      if(k===0) return true;
      if(k===1) return (r+c)%2===0 || r<2;
      if(k===2) return !(c===3||c===4) || r<1;
      return !(r===2 && c%3===1) && !(r===4 && c%3===0);
    };
  }
  function buildBricks(){
    bricks=[]; var ok=layout(level);
    for(var r=0;r<ROWS;r++) for(var c=0;c<COLS;c++){
      if(!ok(r,c)) continue;
      var hp = (level>=2 && r<2) ? 2 : 1;
      bricks.push({x:LEFT+c*(BW+GAP), y:TOP+r*(BH+GAP), w:BW, h:BH, hp:hp, alive:true, color:COLORS[r], pts:(ROWS-r)*10});
    }
  }
  function burst(x,y,col,n){ for(var i=0;i<n;i++){ var a=Math.random()*6.28,v=.8+Math.random()*2.2; parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:20+Math.random()*10,c:col}); } }
  function resetBall(){
    balls=[{x:paddle.x+paddle.w/2, y:paddle.y-6, r:5, dx:0, dy:0, stuck:true}];
  }
  function launch(){
    if(state==='over'){ newGame(); return; }
    if(state!=='play') return;
    if(balls.length===1 && balls[0].stuck){
      var a=-Math.PI/2 + (Math.random()*0.6-0.3), b=balls[0];
      b.dx=speed*Math.cos(a); b.dy=speed*Math.sin(a); b.stuck=false;
      msg.textContent='';
    }
  }
  function newGame(){
    paddle={w:64,h:8,x:(W-64)/2,y:H-30};
    score=0; lives=3; level=1; speed=3.2; state='play'; drops=[]; parts=[]; wideT=0; slowT=0; fireT=0; combo=0; shake=0;
    buildBricks(); resetBall();
    scoreEl.textContent='0'; msg.textContent='TAP OR SPACE TO LAUNCH';
    draw();
  }
  function nextLevel(){
    level++; speed=Math.min(6.2, speed+0.4); drops=[]; buildBricks(); resetBall(); wideT=slowT=fireT=0; paddle.w=64;
    msg.textContent='LEVEL '+level+' - TAP TO LAUNCH'; Retro.sfx('win');
  }
  function loseLife(){
    lives--; Retro.sfx('lose'); shake=8; wideT=slowT=fireT=0; paddle.w=64; combo=0;
    if(lives<=0){
      state='over'; msg.textContent='GAME OVER - TAP TO PLAY AGAIN';
      if(Retro.hiSet(KEY,score)) bestEl.textContent=score;
    } else { resetBall(); msg.textContent='LIFE LOST - TAP TO LAUNCH'; }
  }
  function applyPU(k){
    Retro.sfx('win');
    if(k==='W'){ wideT=600; paddle.w=100; paddle.x=Math.min(paddle.x,W-paddle.w); }
    else if(k==='M'){
      var src=balls[0];
      for(var i=0;i<2;i++){ var a=(i?0.5:-0.5); balls.push({x:src.x,y:src.y,r:5,dx:speed*Math.sin(a),dy:-speed*Math.cos(a),stuck:false}); }
    }
    else if(k==='S'){ slowT=480; }
    else if(k==='L'){ lives=Math.min(5,lives+1); }
    else if(k==='F'){ fireT=420; }
    msg.textContent=PU[k].t+'!'; setTimeout(function(){ if(state==='play' && !(balls[0]&&balls[0].stuck)) msg.textContent=''; },900);
  }
  function update(){
    if(state!=='play') { draw(); return; }
    if(wideT>0){ wideT--; if(wideT===0){ paddle.w=64; } }
    if(slowT>0) slowT--;
    if(fireT>0) fireT--;
    var sp = slowT>0 ? 0.65 : 1;
    if(balls[0] && balls[0].stuck){ balls[0].x=paddle.x+paddle.w/2; balls[0].y=paddle.y-balls[0].r-1; draw(); return; }
    balls.forEach(function(ball){
      ball.x+=ball.dx*sp; ball.y+=ball.dy*sp;
      if(ball.x-ball.r<0){ ball.x=ball.r; ball.dx=Math.abs(ball.dx); Retro.sfx('hit'); }
      if(ball.x+ball.r>W){ ball.x=W-ball.r; ball.dx=-Math.abs(ball.dx); Retro.sfx('hit'); }
      if(ball.y-ball.r<0){ ball.y=ball.r; ball.dy=Math.abs(ball.dy); Retro.sfx('hit'); }
      if(ball.dy>0 && ball.y+ball.r>=paddle.y && ball.y-ball.r<=paddle.y+paddle.h && ball.x>=paddle.x-ball.r && ball.x<=paddle.x+paddle.w+ball.r){
        var rel=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2);
        rel=Math.max(-0.9,Math.min(0.9,rel));
        var a=rel*1.05;
        ball.dx=speed*Math.sin(a); ball.dy=-speed*Math.cos(a);
        ball.y=paddle.y-ball.r; combo=0;
        Retro.sfx('pop');
      }
      for(var i=0;i<bricks.length;i++){
        var b=bricks[i]; if(!b.alive) continue;
        var cx=Math.max(b.x,Math.min(ball.x,b.x+b.w)), cy=Math.max(b.y,Math.min(ball.y,b.y+b.h));
        var dx=ball.x-cx, dy=ball.y-cy;
        if(dx*dx+dy*dy<=ball.r*ball.r){
          b.hp--;
          if(b.hp<=0){
            b.alive=false; combo++; var gain=b.pts*(1+Math.min(combo-1,4)*0.5); score+=Math.round(gain); scoreEl.textContent=score; Retro.sfx('clear');
            burst(b.x+b.w/2,b.y+b.h/2,b.color,9);
            if(Math.random()<0.16){ var keys=['W','M','S','L','F']; var k=keys[Math.floor(Math.random()*keys.length)]; drops.push({x:b.x+b.w/2,y:b.y,k:k}); }
          } else { Retro.sfx('hit'); burst(ball.x,ball.y,'#fff',3); }
          if(fireT<=0){ if(Math.abs(dx)>Math.abs(dy)) ball.dx=-ball.dx; else ball.dy=-ball.dy; }
          break;
        }
      }
    });
    balls=balls.filter(function(b){ return b.y-b.r<=H; });
    if(balls.length===0){ loseLife(); draw(); return; }
    drops.forEach(function(d){ d.y+=1.6; });
    drops=drops.filter(function(d){
      if(d.y>paddle.y-4 && d.y<paddle.y+paddle.h+8 && d.x>paddle.x-6 && d.x<paddle.x+paddle.w+6){ applyPU(d.k); return false; }
      return d.y<H+10;
    });
    if(bricks.every(function(b){return !b.alive;})){ nextLevel(); }
    draw();
  }
  function draw(){
    var ox=0,oy=0; if(shake>0){ ox=(Math.random()-.5)*shake; oy=(Math.random()-.5)*shake; shake=Math.max(0,shake-.5); }
    ctx.save(); ctx.translate(ox,oy);
    ctx.fillStyle='#050510'; ctx.fillRect(-10,-10,W+20,H+20);
    ctx.fillStyle='#1b1b2f'; for(var y=0;y<H;y+=4) ctx.fillRect(0,y,W,1);
    bricks.forEach(function(b){
      if(!b.alive) return;
      ctx.fillStyle=b.hp>1?'#9aa0b4':b.color; ctx.fillRect(b.x,b.y,b.w,b.h);
      ctx.fillStyle='rgba(255,255,255,.35)'; ctx.fillRect(b.x,b.y,b.w,2);
      ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(b.x,b.y+b.h-2,b.w,2);
      if(b.hp>1){ ctx.fillStyle=b.color; ctx.fillRect(b.x+4,b.y+4,b.w-8,b.h-8); }
    });
    drops.forEach(function(d){
      var p=PU[d.k]; ctx.fillStyle=p.c; ctx.fillRect(d.x-11,d.y-6,22,12);
      ctx.fillStyle='#000'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.fillText(d.k,d.x,d.y+3); ctx.textAlign='left';
    });
    ctx.fillStyle=wideT>0?'#3bd6ff':'#fff'; ctx.fillRect(paddle.x,paddle.y,paddle.w,paddle.h);
    ctx.fillStyle='#8be9ff'; ctx.fillRect(paddle.x,paddle.y,paddle.w,2);
    balls.forEach(function(ball){
      ctx.fillStyle=fireT>0?'#ff6a00':'#ffe600'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
      if(fireT>0){ ctx.fillStyle='rgba(255,140,0,.4)'; ctx.beginPath(); ctx.arc(ball.x-ball.dx*1.5,ball.y-ball.dy*1.5,ball.r,0,Math.PI*2); ctx.fill(); }
    });
    parts=parts.filter(function(p){ return p.life>0; });
    parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.vy+=.05; p.life--; ctx.globalAlpha=Math.max(0,p.life/26); ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,3,3); });
    ctx.globalAlpha=1;
    ctx.fillStyle='#ff3b3b';
    for(var l=0;l<lives;l++) ctx.fillRect(8+l*12,H-12,8,6);
    ctx.fillStyle='#fff'; ctx.font='8px monospace';
    ctx.fillText('LVL '+level,W-54,H-6);
    var st=[]; if(wideT>0) st.push('WIDE'); if(slowT>0) st.push('SLOW'); if(fireT>0) st.push('FIRE'); if(combo>2) st.push('COMBO x'+combo);
    if(st.length) ctx.fillText(st.join(' '),8,14);
    if(state==='over'){ ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,0,W,H); }
    ctx.restore();
  }
  function setPaddleFromX(clientX){
    var rect=cv.getBoundingClientRect();
    var x=(clientX-rect.left)*(W/rect.width);
    paddle.x=Math.max(0,Math.min(W-paddle.w, x-paddle.w/2));
    if(balls[0] && balls[0].stuck){ balls[0].x=paddle.x+paddle.w/2; }
  }
  cv.addEventListener('mousemove',function(e){ setPaddleFromX(e.clientX); });
  cv.addEventListener('touchmove',function(e){ e.preventDefault(); setPaddleFromX(e.touches[0].clientX); },{passive:false});
  cv.addEventListener('touchstart',function(e){ setPaddleFromX(e.touches[0].clientX); },{passive:true});
  cv.addEventListener('click',launch);
  function nudge(d){ paddle.x=Math.max(0,Math.min(W-paddle.w,paddle.x+d)); if(balls[0]&&balls[0].stuck) balls[0].x=paddle.x+paddle.w/2; }
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'||e.key==='a'){ nudge(-14); e.preventDefault(); }
    else if(e.key==='ArrowRight'||e.key==='d'){ nudge(14); e.preventDefault(); }
    else if(e.key===' '){ e.preventDefault(); launch(); }
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-dir]'),function(b){
    var d=b.getAttribute('data-dir'); var timer=null;
    function go(){ nudge(d==='left'?-8:8); }
    b.addEventListener('pointerdown',function(){ go(); timer=setInterval(go,30); });
    ['pointerup','pointerleave','pointercancel'].forEach(function(ev){ b.addEventListener(ev,function(){ clearInterval(timer); }); });
  });
  document.getElementById('again').addEventListener('click',newGame);
  setInterval(update,1000/60);
  newGame();
})();
