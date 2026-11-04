(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var W=cv.width, H=cv.height, KEY='flaphop', GROUND=H-40;
  var GAP=130, PW=48, SPEED=2.2, GRAV=0.38, FLAP=-6.6;
  var bird, pipes, score, state, frame;
  Retro.bestLine(bestEl,KEY);
  function newGame(){
    bird={x:80,y:H/2-40,vy:0,r:11};
    pipes=[]; score=0; state='ready'; frame=0;
    scoreEl.textContent='0'; msg.textContent='TAP OR SPACE TO FLAP';
  }
  function flap(){
    if(state==='over'){ newGame(); return; }
    if(state==='ready'){ state='play'; msg.textContent=''; }
    if(state==='play'){ bird.vy=FLAP; Retro.sfx('jump'); }
  }
  function die(){
    if(state!=='play') return;
    state='over'; Retro.sfx('lose');
    msg.textContent='OOPS! TAP TO RETRY';
    if(Retro.hiSet(KEY,score)) bestEl.textContent=score;
  }
  function update(){
    frame++;
    if(state==='play'){
      bird.vy+=GRAV; bird.y+=bird.vy;
      if(frame%95===0){
        var top=30+Math.random()*(GROUND-GAP-60);
        pipes.push({x:W, top:top, passed:false});
      }
      pipes.forEach(function(p){ p.x-=SPEED; });
      pipes=pipes.filter(function(p){ return p.x+PW>-2; });
      pipes.forEach(function(p){
        if(!p.passed && p.x+PW<bird.x-bird.r){ p.passed=true; score++; scoreEl.textContent=score; Retro.sfx('eat'); }
        var bx=bird.x-bird.r+3, bxr=bird.x+bird.r-3, by=bird.y-bird.r+3, byb=bird.y+bird.r-3;
        if(bxr>p.x && bx<p.x+PW && (by<p.top || byb>p.top+GAP)) die();
      });
      if(bird.y+bird.r>=GROUND || bird.y-bird.r<=0) die();
    } else if(state==='ready'){
      bird.y=H/2-40+Math.sin(frame/12)*6; bird.vy=0;
    } else if(state==='over'){
      if(bird.y+bird.r<GROUND){ bird.vy+=GRAV; bird.y+=bird.vy; if(bird.y+bird.r>GROUND) bird.y=GROUND-bird.r; }
    }
    draw();
  }
  function px(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); }
  function draw(){
    // sky bands
    var bands=['#5ec8ff','#56bdfa','#4eb2f5','#46a7ef'];
    for(var i=0;i<bands.length;i++) px(0,i*(H/bands.length),W,Math.ceil(H/bands.length)+1,bands[i]);
    // clouds
    var off=(frame*0.3)%(W+120);
    [[40,70],[180,120],[260,50]].forEach(function(c,i){
      var x=((c[0]-off)%(W+120)+W+120)%(W+120)-60;
      px(x,c[1],50,12,'#fff'); px(x+12,c[1]-8,26,10,'#fff'); px(x+6,c[1]+12,34,4,'#e6f7ff');
    });
    // pipes
    pipes.forEach(function(p){
      px(p.x,0,PW,p.top,'#2fb83a'); px(p.x,0,4,p.top,'#7cff6b'); px(p.x-4,p.top-14,PW+8,14,'#2fb83a'); px(p.x-4,p.top-14,PW+8,3,'#7cff6b');
      var by=p.top+GAP;
      px(p.x,by,PW,GROUND-by,'#2fb83a'); px(p.x,by,4,GROUND-by,'#7cff6b'); px(p.x-4,by,PW+8,14,'#2fb83a'); px(p.x-4,by,PW+8,3,'#7cff6b');
    });
    // ground
    px(0,GROUND,W,8,'#7be04a'); px(0,GROUND+8,W,H-GROUND-8,'#c8843a');
    for(var g=0;g<W;g+=16) px(g,GROUND+8,8,4,'#a86a2a');
    // bird
    var tilt=Math.max(-0.5,Math.min(1.2,bird.vy/8));
    ctx.save(); ctx.translate(bird.x,bird.y); ctx.rotate(tilt);
    px(-bird.r,-bird.r,bird.r*2,bird.r*2,'#ffe600');
    px(-bird.r,-bird.r,bird.r*2,3,'#fff6a0');
    px(2,-6,6,6,'#fff'); px(5,-4,3,3,'#000');
    px(bird.r-4,-2,8,5,'#ff7a1a'); px(bird.r-4,2,6,3,'#e05a00');
    px(-bird.r+2,2,8,6,'#ffb347');
    ctx.restore();
    if(state==='over'){ ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(0,0,W,H); }
  }
  function onInput(){ flap(); }
  cv.addEventListener('click',onInput);
  document.addEventListener('keydown',function(e){
    if(e.key===' '||e.key==='ArrowUp'||e.key==='w'){ e.preventDefault(); flap(); }
  });
  var flapBtn=document.getElementById('flapbtn');
  if(flapBtn) flapBtn.addEventListener('click',onInput);
  document.getElementById('again').addEventListener('click',newGame);
  newGame();
  setInterval(update,1000/60);
  draw();
})();
