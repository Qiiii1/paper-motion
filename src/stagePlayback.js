import { useCallback, useEffect, useRef, useState } from 'react';
import { openingScreens, presets, presetStop } from './presets';

const chapters = [
  ['studio',[.07,.273,.505,.679,.98]],
  ['distort',[.12,.34,.59,.84]],
  ['mcp',[.05,.29,.49,.68,.87]],
  ['devices',[.05,.33,.57,.88]],
  ['formats',[.08,.25,.42,.58,.75,.92]],
];

function stageStops() {
  const height=document.querySelector('.stage').clientHeight;
  const stops=[0,.30,.64,1].map(p=>p*openingScreens*height);
  for(let i=0;i<presets.length;i++) stops.push((openingScreens+presetStop(i))*height);
  stops.push((openingScreens+5.76)*height);
  for(const [id,steps] of chapters) {
    const el=document.getElementById(id);
    const top=el.getBoundingClientRect().top+window.scrollY;
    const span=el.offsetHeight-el.firstElementChild.offsetHeight;
    for(const p of steps) stops.push(top+p*span);
  }
  stops.push(document.getElementById('pricing').getBoundingClientRect().top+window.scrollY);
  return stops;
}

export function useStagePlayback() {
  const run=useRef(null);
  const [position,setPosition]=useState({index:0,managed:true});
  const [playing,setPlaying]=useState(false);
  const command=useRef(null);
  const step=useCallback((direction=1)=>command.current?.(direction),[]);
  useEffect(()=>{
    let stops=stageStops(), frame=0, down=null, dragged=false, playbackY=0;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    function isManaged(y) {
      return y<stops.at(-1)-2;
    }
    function sync() {
      const y=window.scrollY;
      const managed=isManaged(y);
      const index=stops.findLastIndex(at=>at<=y+2);
      setPosition(old=>old.index===index && old.managed===managed?old:{index,managed});
    }
    function cancel() {
      cancelAnimationFrame(frame); run.current=null; setPlaying(false);
    }
    function onScroll() {
      // Native scrolling, including dragging the scrollbar, can take over
      // from the animation. Its own scroll events leave playback running.
      if(run.current && window.scrollY!==playbackY) cancel();
      sync();
    }
    function onWheel(event) {
      if(run.current && event.deltaY && !event.ctrlKey) cancel();
    }
    function render(now) {
      if(window.scrollY!==playbackY) {
        cancel(); sync();
        return;
      }
      const {from,to,start,duration}=run.current;
      const f=media.matches?1:Math.min(1,(now-start)/duration);
      const eased=f*f*(3-2*f);
      window.scrollTo({top:from+(stops[to]-from)*eased,behavior:'instant'});
      playbackY=window.scrollY;
      if(f<1) frame=requestAnimationFrame(render);
      else {cancel();sync()}
    }
    function advance(direction=1) {
      const from=window.scrollY;
      if(run.current || !isManaged(from)) return;
      const to=direction>0?stops.findIndex(at=>at>from+2):stops.findLastIndex(at=>at<from-2);
      if(to<0) return;
      const openingDurations=[0,1650,3000,2550];
      const duration=openingDurations[Math.max(0,to+(direction<0?1:0))] || 1000;
      playbackY=from;
      run.current={from,to,start:performance.now(),duration};
      setPlaying(true); render(performance.now());
    }
    function pointerDown(event) {
      down=[event.clientX,event.clientY]; dragged=false;
    }
    function pointerMove(event) {
      if(down && Math.hypot(event.clientX-down[0],event.clientY-down[1])>8) dragged=true;
    }
    function pointerEnd() { down=null }
    function pointerCancel(event) {
      pointerEnd();
      if(event.pointerType==='touch' && run.current) cancel();
    }
    function click(event) {
      if(event.detail>0 && dragged) return;
      if(event.defaultPrevented || event.target.closest('button,a,input,select,textarea,label,[contenteditable="true"]')) return;
      if(window.getSelection()?.toString()) return;
      advance();
    }
    function key(event) {
      if(event.defaultPrevented || event.repeat || event.altKey || event.metaKey || event.ctrlKey ||
        !isManaged(window.scrollY) ||
        event.target.closest('input,select,textarea,[contenteditable="true"]')) return;
      if(event.target.closest('button,a') && [' ','Enter'].includes(event.key)) return;
      if([' ','Enter','ArrowRight','ArrowDown','PageDown','ArrowLeft','ArrowUp','PageUp'].includes(event.key)) {
        event.preventDefault();
        advance(['ArrowLeft','ArrowUp','PageUp'].includes(event.key)?-1:1);
      }
    }
    function resize() {
      const old=stops;
      stops=stageStops();
      const index=old.findIndex(y=>Math.abs(window.scrollY-y)<3);
      if(!run.current && index>=0) window.scrollTo({top:stops[index],behavior:'instant'});
      sync();
    }
    // Direct links and the chapter's own controls own their navigation.
    function control(event) {
      if(event.target.closest('a,button,input') && !event.target.closest('[data-playback]')) cancel();
    }
    command.current=advance;
    sync();
    const observer=new ResizeObserver(resize);
    observer.observe(document.querySelector('.stage'));
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('wheel',onWheel,{passive:true});
    window.addEventListener('pointerdown',pointerDown);
    window.addEventListener('pointermove',pointerMove);
    window.addEventListener('pointerup',pointerEnd);
    window.addEventListener('pointercancel',pointerCancel);
    window.addEventListener('click',click);
    window.addEventListener('click',control,true);
    window.addEventListener('keydown',key);
    window.addEventListener('hashchange',cancel);
    return ()=>{
      cancelAnimationFrame(frame);run.current=null;command.current=null;observer.disconnect();
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('wheel',onWheel);
      window.removeEventListener('pointerdown',pointerDown);
      window.removeEventListener('pointermove',pointerMove);
      window.removeEventListener('pointerup',pointerEnd);
      window.removeEventListener('pointercancel',pointerCancel);
      window.removeEventListener('click',click);
      window.removeEventListener('click',control,true);
      window.removeEventListener('keydown',key);
      window.removeEventListener('hashchange',cancel);
    };
  },[]);
  return {...position,step,playing};
}
