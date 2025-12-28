const WINDOW = 20;
const STRONG_BIAS = 0.62;
const STABLE_VOL = 0.30;
const MIN_CONF = 80;

// store history
let history = [];

function isBig(n){ return n >= 5; }

function calcVolatility(arr){
  let s = 0;
  for(let i=1;i<arr.length;i++){
    if(isBig(arr[i]) !== isBig(arr[i-1])) s++;
  }
  return s/Math.max(1,arr.length);
}

function clusterNum(arr){
  const last7 = arr.slice(-7);
  const freq = {};
  last7.forEach(n => freq[n]=(freq[n]||0)+1);
  return Object.entries(freq)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,3)
    .map(x=>+x[0]);
}

function getSignal(){
  if(history.length < WINDOW) 
    return {signal:"WAIT", conf:0, nums:[], vol:0, biasText:"—"};

  const slice = history.slice(-WINDOW);
  const big = slice.filter(isBig).length;
  const small = WINDOW - big;

  const bigR = big/WINDOW; 
  const smallR = small/WINDOW;

  const vol = calcVolatility(slice);
  const last = slice[WINDOW-1];
  const prev = slice[WINDOW-2];
  const sameSide = isBig(last) === isBig(prev);

  let signal = "WAIT", biasText="NEUTRAL";
  let bias = 0.5;

  if(vol < STABLE_VOL && sameSide){
    if(bigR > STRONG_BIAS){signal="BIG";bias=bigR; biasText="BIG BIAS";}
    if(smallR > STRONG_BIAS){signal="SMALL";bias=smallR; biasText="SMALL BIAS";}
  }

  const nums = clusterNum(slice);
  let conf = Math.abs(bias-0.5)*140 + (0.45-vol)*120;
  conf = Math.max(0,Math.min(90,Math.floor(conf)));

  if(conf < MIN_CONF) signal = "WAIT";

  return {signal,conf,nums,vol,biasText};
}

// auto every 30 sec
setInterval(()=>{
  // simulate number (demo purpose)
  const randomNumber = Math.floor(Math.random()*10);
  history.push(randomNumber);

  const out = getSignal();
  window.dispatchEvent(new CustomEvent("HPAE_SIGNAL",{detail:out}));

}, 30000);
