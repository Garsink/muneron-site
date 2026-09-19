/* MUNERON hero field. Lifted verbatim from the v4 homepage (commit 0ac3333), which the 2026-09-09
   rebuild dropped along with the rest of the old page. Two layers: #gl is the WebGL atmosphere
   (dark theme only) and #scene is the raymarched organism, which is what shows on the light
   default. Honours prefers-reduced-motion and pauses when the hero scrolls away. */
(function(){
'use strict';
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var braked=false;
/* ============ THE FIELD - navy/ice atmosphere (offscreen WebGL -> 2D blit) ============ */
var view=document.getElementById('gl');
var vctx=view.getContext('2d');
var cv=document.createElement('canvas');
var gl=cv.getContext('webgl2',{antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
var glOK=false;
if(gl){
try{
var VS='#version 300 es\nlayout(location=0) in vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
var FS=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uT;uniform vec2 uM;uniform float uScroll;
out vec4 O;
float hash(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);
  for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.03+vec2(3.1,1.7);a*=.52;}return v;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  uv.y+=uScroll*.3;
  vec2 m=uM*.06;
  float t=uT*.035;
  vec2 q=vec2(fbm(uv*1.4+t*.5+m),fbm(uv*1.4-t*.35));
  vec2 r=vec2(fbm(uv*1.9+q*1.6+vec2(1.7,9.2)+t*.3),fbm(uv*1.9+q*1.6+vec2(8.3,2.8)-t*.2));
  float f=fbm(uv*2.1+r*1.7+m);
  /* soft light from the top-right + teal warmth from the low-left */
  float glowTR=exp(-length(uv-vec2(.52,.18))*1.6);
  float glowBL=exp(-length(uv-vec2(-.55,-.52))*1.7);
  vec3 navy=vec3(.047,.086,.149);
  vec3 deep=vec3(.06,.13,.23);
  vec3 sky=vec3(.32,.56,.78);
  vec3 teal=vec3(.16,.62,.58);
  vec3 ice=vec3(.66,.84,.95);
  float ridge=pow(smoothstep(.45,.8,f),2.0);
  vec3 col=navy;
  col=mix(col,deep*1.5,smoothstep(.15,.85,f));
  col+=sky*glowTR*(.5+.25*f);
  col+=teal*glowBL*(.55+.2*f);
  col+=ice*ridge*.22*(glowTR+glowBL);
  /* faint drifting motes */
  vec2 sp=uv*30.;vec2 cell=fract(sp)-.5;
  float st=step(.9975,hash(floor(sp)))*smoothstep(.15,.02,length(cell));
  col+=ice*st*.28;
  float vig=smoothstep(1.55,.4,length(uv*vec2(.75,1.05)));
  col*=vig;
  col=1.0-exp(-col*1.9);
  col*=1.-uScroll*.5;
  O=vec4(col,1.);
}`;
function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);
  if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(o);return o;}
var pr=gl.createProgram();
gl.attachShader(pr,sh(gl.VERTEX_SHADER,VS));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));
gl.linkProgram(pr);
if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw gl.getProgramInfoLog(pr);
gl.useProgram(pr);
var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
var uRes=gl.getUniformLocation(pr,'uRes'),uT=gl.getUniformLocation(pr,'uT'),
    uM=gl.getUniformLocation(pr,'uM'),uScroll=gl.getUniformLocation(pr,'uScroll');
glOK=true;
document.getElementById('glfall').style.display='none';
}catch(e){glOK=false;view.style.display='none';}
}else{view.style.display='none';}

var mx=0,my=0,tmx=0,tmy=0,heroVisible=true,scrollN=0,frozenT=0;
window.addEventListener('pointermove',function(e){
  tmx=(e.clientX/window.innerWidth-.5)*2;tmy=(e.clientY/window.innerHeight-.5)*2;
},{passive:true});
function sizeGL(){
  if(!glOK)return;
  var dpr=Math.min(window.devicePixelRatio||1,1.4);
  var w=view.clientWidth,h=view.clientHeight;
  var s=dpr*(w<760?0.8:1);
  cv.width=Math.max(2,Math.round(w*s));cv.height=Math.max(2,Math.round(h*s));
  view.width=cv.width;view.height=cv.height;
  gl.viewport(0,0,cv.width,cv.height);
}
sizeGL();
var hero=document.querySelector('.hero-field');
new IntersectionObserver(function(en){heroVisible=en[0].isIntersecting},{threshold:0}).observe(hero);
window.addEventListener('scroll',function(){
  scrollN=Math.min(1,window.scrollY/(window.innerHeight*.92));
},{passive:true});
function glLoop(t){
  requestAnimationFrame(glLoop);
  if(!glOK||document.hidden||!heroVisible)return;
  if(braked){gl.uniform1f(uT,frozenT/1000);}else{frozenT=t;gl.uniform1f(uT,t/1000);}
  mx+=(tmx-mx)*.045;my+=(tmy-my)*.045;
  gl.uniform2f(uRes,cv.width,cv.height);
  gl.uniform2f(uM,mx,-my);
  gl.uniform1f(uScroll,scrollN);
  gl.drawArrays(gl.TRIANGLES,0,3);
  vctx.drawImage(cv,0,0);
}
function drawOnce(tSec){
  if(!glOK)return;
  gl.uniform2f(uRes,cv.width,cv.height);gl.uniform1f(uT,tSec);
  gl.uniform2f(uM,mx,-my);gl.uniform1f(uScroll,scrollN);
  gl.drawArrays(gl.TRIANGLES,0,3);
  vctx.drawImage(cv,0,0);
}
if(glOK){
  drawOnce(16.0);   /* first frame synchronously - never open on a blank hero */
  window.addEventListener('resize',function(){sizeGL();drawOnce(frozenT/1000||16.0)});
  if(!reduced){requestAnimationFrame(glLoop);}
}

/* ============ THE ORGANISM - raymarched, physically lit, mouse-drawn ============ */
var sview=document.getElementById('scene');
var sctx=sview?sview.getContext('2d'):null;
var scv=document.createElement('canvas');
var sgl=scv.getContext('webgl2',{antialias:false,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
var sOK=false,sU={};
if(sgl&&sview){
try{
var SFS=`#version 300 es
precision highp float;
uniform vec2 uRes;uniform float uT;uniform vec2 uM;uniform float uLight;
out vec4 O;
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float map(vec3 p){
  float t=uT*.5;
  vec3 m=vec3(uM.x*1.05,uM.y*.8,.3);
  float d=length(p-vec3(sin(t*.7)*.62, cos(t*.53)*.5, sin(t*.41)*.34))-.46;
  d=smin(d,length(p-vec3(cos(t*.62)*.88, sin(t*.44)*.64, cos(t*.5)*.4))-.33,.3);
  d=smin(d,length(p-vec3(sin(t*.35+2.1)*.95, cos(t*.66+1.2)*.6, sin(t*.58+.7)*.45))-.26,.3);
  d=smin(d,length(p-vec3(cos(t*.48+4.)*.7, sin(t*.71+3.)*.74, cos(t*.39+1.5)*.36))-.21,.3);
  d=smin(d,length(p-vec3(sin(t*.9+1.)*.5, cos(t*.8+2.5)*.78, sin(t*.6+3.)*.3))-.17,.28);
  d=smin(d,length(p-m)-.23,.38);
  return d;
}
vec3 norm(vec3 p){vec2 e=vec2(.0015,0.);
  return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
float shadow(vec3 ro,vec3 rd){float r=1.,t=.08;
  for(int i=0;i<20;i++){float h=map(ro+rd*t);r=min(r,9.*h/t);t+=clamp(h,.03,.3);if(r<.02||t>4.)break;}
  return clamp(r,0.,1.);}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  uv-=vec2(.47,.13);                       /* the organism lives up-right, cropped by the edges */
  vec3 ro=vec3(uM.x*.22,uM.y*.16,3.0);
  vec3 rd=normalize(vec3(uv,-1.9));
  vec3 col=vec3(0.);
  float t=0.,d=0.;int i;
  for(i=0;i<84;i++){d=map(ro+rd*t);if(d<.001||t>7.)break;t+=d;}
  if(d>=.001){O=vec4(0.);return;}          /* miss = fully transparent: one world, no box */
  if(d<.001){
    vec3 p=ro+rd*t,n=norm(p);
    vec3 key=normalize(vec3(.65,.85,.5));
    vec3 fil=normalize(vec3(-.6,.25,-.4));
    float dif=max(dot(n,key),0.);
    float sh=shadow(p+n*.03,key);
    float bak=max(dot(n,fil),0.);
    float spe=pow(max(dot(reflect(-key,n),-rd),0.),42.);
    float fre=pow(1.-max(dot(n,-rd),0.),3.);
    float ao=clamp(1.-float(i)/84.*1.15,0.,1.);
    vec3 base=mix(vec3(.08,.30,.30),vec3(.10,.45,.44),.5+.5*n.y);
    base=mix(base,vec3(.05,.34,.32),uLight);      /* deeper glass on the light stage */
    col=base*(.22+.9*dif*sh)*ao;
    col+=vec3(.14,.5,.48)*bak*.35*ao;
    col+=vec3(.66,.84,.95)*spe*sh*(.9+.5*uLight);
    col+=mix(vec3(.5,.85,.82),vec3(.75,.97,.94),uLight)*fre*.55;
    col+=vec3(.66,.84,.95)*pow(fre,2.5)*(.35+.3*uLight);
  }
  col=1.-exp(-col*2.3);
  col=pow(col,vec3(.92));
  O=vec4(col,1.);
}`;
function ssh(t,src){var o=sgl.createShader(t);sgl.shaderSource(o,src);sgl.compileShader(o);
  if(!sgl.getShaderParameter(o,sgl.COMPILE_STATUS))throw sgl.getShaderInfoLog(o);return o;}
var spr=sgl.createProgram();
sgl.attachShader(spr,ssh(sgl.VERTEX_SHADER,VS));
sgl.attachShader(spr,ssh(sgl.FRAGMENT_SHADER,SFS));
sgl.linkProgram(spr);
if(!sgl.getProgramParameter(spr,sgl.LINK_STATUS))throw sgl.getProgramInfoLog(spr);
sgl.useProgram(spr);
var sbuf=sgl.createBuffer();sgl.bindBuffer(sgl.ARRAY_BUFFER,sbuf);
sgl.bufferData(sgl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),sgl.STATIC_DRAW);
sgl.enableVertexAttribArray(0);sgl.vertexAttribPointer(0,2,sgl.FLOAT,false,0,0);
sU={res:sgl.getUniformLocation(spr,'uRes'),t:sgl.getUniformLocation(spr,'uT'),
    m:sgl.getUniformLocation(spr,'uM'),light:sgl.getUniformLocation(spr,'uLight')};
sOK=true;
}catch(e){sOK=false;if(sview)sview.style.display='none';}
}else if(sview){sview.style.display='none';}
var smx=0,smy=0;
function sizeScene(){
  if(!sOK)return;
  var dpr=Math.min(window.devicePixelRatio||1,1.5);
  var w=sview.clientWidth,h=sview.clientHeight;
  scv.width=Math.max(2,Math.round(w*dpr));scv.height=Math.max(2,Math.round(h*dpr));
  sview.width=scv.width;sview.height=scv.height;
  sgl.viewport(0,0,scv.width,scv.height);
}
function sceneDraw(tSec){
  if(!sOK)return;
  smx+=(tmx-smx)*.06;smy+=(tmy-smy)*.06;
  sgl.uniform2f(sU.res,scv.width,scv.height);
  sgl.uniform1f(sU.t,tSec);
  sgl.uniform2f(sU.m,smx,-smy);
  sgl.uniform1f(sU.light,document.documentElement.getAttribute('data-theme')==='light'?1:0);
  sgl.drawArrays(sgl.TRIANGLES,0,3);
  sctx.clearRect(0,0,sview.width,sview.height);
  sctx.drawImage(scv,0,0);
}
if(sOK){
  sizeScene();sceneDraw(9.0);
  window.addEventListener('resize',function(){sizeScene();sceneDraw(frozenT/1000||9.0)});
  if(!reduced){(function sLoop(t){requestAnimationFrame(sLoop);
    if(document.hidden||!heroVisible)return;
    if(!braked)sceneDraw(t/1000);})(0);}
}


})();