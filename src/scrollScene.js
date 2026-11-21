import { useEffect, useRef, useState } from 'react';

// Each chapter owns its scroll distance. Adjacent chapters can enter and leave
// the viewport naturally while their internal picture stays pinned.
export function useScrollScene() {
  const root = useRef(null);
  const [progress,setProgress] = useState(0);
  const [near,setNear] = useState(false);
  useEffect(()=>{
    const el=root.current;
    let frame=0, watching=false;
    function update(){
      frame=0;
      const box=el.getBoundingClientRect();
      const distance = box.height-el.firstElementChild.offsetHeight;
      setProgress(Math.max(0,Math.min(1,-box.top/Math.max(1,distance))));
    }
    function queue(){ if (!frame && watching) frame=requestAnimationFrame(update) }
    const obs=new IntersectionObserver(([entry])=>{
      watching=entry.isIntersecting;setNear(watching);update();
    },{rootMargin:'15% 0px'});
    obs.observe(el);
    const resize=new ResizeObserver(queue);resize.observe(el);
    window.addEventListener('scroll',queue,{passive:true});
    update();
    return ()=>{obs.disconnect();resize.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',queue)};
  },[]);
  function seek(value) {
    const el=root.current;
    const y=scrollY+el.getBoundingClientRect().top+value*(el.offsetHeight-el.firstElementChild.offsetHeight);
    window.scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  return {root,progress,near,seek};
}
