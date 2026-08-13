(function(){
  var input=document.getElementById('search-input');
  var box=document.getElementById('search-results');
  if(!input||!box) return;
  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
  // 高亮文本中所有关键词（大小写不敏感），返回带 <mark> 的 HTML
  function highlight(text,q){
    if(!q) return esc(text);
    var lower=text.toLowerCase(), ql=q.toLowerCase(), out='', last=0;
    var i=lower.indexOf(ql);
    while(i>=0){
      out+=esc(text.slice(last,i));
      out+='<mark>'+esc(text.slice(i,i+q.length))+'</mark>';
      last=i+q.length;
      i=lower.indexOf(ql,last);
    }
    out+=esc(text.slice(last));
    return out;
  }
  // 截取关键词周围的一段文字，并高亮关键词
  function makeSnippet(text,q){
    if(!q){ var s0=text.slice(0,90); return esc(s0)+(text.length>90?'…':''); }
    var idx=text.toLowerCase().indexOf(q.toLowerCase());
    if(idx<0){ var s1=text.slice(0,90); return esc(s1)+(text.length>90?'…':''); }
    var start=Math.max(0,idx-30);
    var end=Math.min(text.length,idx+q.length+60);
    var pre=start>0?'…':'', suf=end<text.length?'…':'';
    return pre+highlight(text.slice(start,end),q)+suf;
  }
  var NO_RESULT=(window.LANG==='en')?'No results':'无匹配结果';
  // 把站点相对路径 p 换算成相对当前页面的链接
  var dir=window.PAGE_DIR||'';
  function resolve(p){
    if(!dir) return p;
    var a=dir.split('/'), b=p.split('/'), i=0;
    while(i<a.length&&i<b.length&&a[i]===b[i]) i++;
    var out=[]; for(var k=0;k<a.length-i;k++) out.push('..');
    for(var j=i;j<b.length;j++) out.push(b[j]);
    return out.join('/');
  }
  input.addEventListener('input',function(){
    var raw=input.value.trim();
    var q=raw.toLowerCase();
    if(q.length<1){box.style.display='none';box.innerHTML='';return;}
    var hits=[];
    var idx=window.SEARCH_INDEX||[];
    for(var i=0;i<idx.length;i++){
      var it=idx[i];
      var hay=(it.t+' '+it.c).toLowerCase();
      if(hay.indexOf(q)>=0){
        var score=it.t.toLowerCase().indexOf(q)>=0?0:1;
        hits.push({it:it,score:score});
        if(hits.length>=40) break;
      }
    }
    hits.sort(function(a,b){return a.score-b.score;});
    if(!hits.length){
      box.innerHTML='<div class="empty">'+NO_RESULT+'</div>';
      box.style.display='block';
      return;
    }
    var html='';
    for(var j=0;j<hits.length;j++){
      var h=hits[j].it;
      html+='<a href="'+resolve(h.p)+'"><span class="st">'+highlight(h.t,raw)+'</span><br><span class="sc">'+makeSnippet(h.c,raw)+'</span></a>';
    }
    box.innerHTML=html;
    box.style.display='block';
  });
  document.addEventListener('click',function(e){
    if(!input.contains(e.target)&&!box.contains(e.target)){box.style.display='none';}
  });
})();

// 保持侧边栏滚动位置：跨页面跳转时不回弹到顶部
(function(){
  var sidebar=document.querySelector('.sidebar');
  if(!sidebar) return;
  var KEY='ms-handbook-sidebar-scroll';
  var timer=null;
  function save(){ try{localStorage.setItem(KEY,String(sidebar.scrollTop));}catch(e){} }
  sidebar.addEventListener('scroll',function(){
    if(timer) clearTimeout(timer);
    timer=setTimeout(save,120);
  });
  window.addEventListener('pagehide',save);
  function restore(){
    var saved=0;
    try{ saved=parseInt(localStorage.getItem(KEY)||'0',10)||0; }catch(e){}
    if(saved>0){ sidebar.scrollTop=saved; return; }
    // 首次访问：把当前激活项滚动到侧边栏中部
    var active=sidebar.querySelector('.nav-link.active');
    if(active){
      var st=sidebar.getBoundingClientRect().top;
      var it=active.getBoundingClientRect().top;
      sidebar.scrollTop = sidebar.scrollTop + (it-st) - sidebar.clientHeight/2;
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',restore);
  }else{
    restore();
  }
})();
