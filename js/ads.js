(function(){
  var cfg = (window.AD_CONFIG && window.AD_CONFIG.monetagSnippet) || '';
  cfg = String(cfg).trim();
  var slots = document.querySelectorAll('[data-ad-slot]');
  if(!cfg){ return; }
  var tpl = document.createElement('template');
  tpl.innerHTML = cfg;
  var nodes = Array.prototype.slice.call(tpl.content.childNodes);
  nodes.forEach(function(n){
    if(n.nodeName === 'SCRIPT'){
      // innerHTML does not run scripts; re-create each one so the ad network's code executes.
      var s = document.createElement('script');
      Array.prototype.forEach.call(n.attributes, function(a){ s.setAttribute(a.name, a.value); });
      s.textContent = n.textContent;
      document.body.appendChild(s);
    } else if(n.nodeType === 1){
      document.body.appendChild(n.cloneNode(true));
    }
  });
  slots.forEach(function(s){ s.hidden = false; });
})();
