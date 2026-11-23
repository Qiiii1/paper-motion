import { useEffect, useRef, useState } from 'react';
import { followScroll } from './scrollProgress';

// Each chapter owns its scroll distance. Adjacent chapters can enter and leave
// the viewport naturally while their internal picture stays pinned.
export function useScrollScene() {
  const root = useRef(null);
  const [progress,setProgress] = useState(0);
  const [near,setNear] = useState(false);
  const [{top,bottom},setBounds] = useState({top:0,bottom:Infinity});
  useEffect(()=>{
    const el=root.current;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0, watching=false, previousTime, current=0;
    function update(now){
      frame=0;
      const box=el.getBoundingClientRect();
      const distance=Math.max(1,box.height-el.firstElementChild.offsetHeight);
      const target=Math.max(0,Math.min(1,-box.top/distance));
      const dt=previousTime===undefined ? 1/60 : Math.min(.055,(now-previousTime)/1000);
      current=now===undefined || media.matches ? target : followScroll(current,target,dt,distance);
      setProgress(current);
      setBounds(bounds => bounds.top === box.top && bounds.bottom === box.bottom
        ? bounds : {top:box.top,bottom:box.bottom});
      previousTime=current===target ? undefined : now;
      if(watching && current!==target) queue();
    }
    function queue(){ if (!frame && watching) frame=requestAnimationFrame(update) }
    const obs=new IntersectionObserver(([entry])=>{
      cancelAnimationFrame(frame);
      watching=entry.isIntersecting;setNear(watching);update();
    },{rootMargin:'15% 0px'});
    obs.observe(el);
    const resize=new ResizeObserver(queue);resize.observe(el);
    window.addEventListener('scroll',queue,{passive:true});
    media.addEventListener('change',queue);
    update();
    return ()=>{
      obs.disconnect();resize.disconnect();cancelAnimationFrame(frame);
      window.removeEventListener('scroll',queue);
      media.removeEventListener('change',queue);
    };
  },[]);
  function seek(value) {
    const el=root.current;
    const y=scrollY+el.getBoundingClientRect().top+value*(el.offsetHeight-el.firstElementChild.offsetHeight);
    window.scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  return {root,progress,top,bottom,near,seek};
}
