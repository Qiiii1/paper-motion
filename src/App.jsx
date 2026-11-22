import React, { useEffect, useRef, useState } from 'react';
import { cardPose, COUNT, ease } from './choreography';
import { lensAt } from './openingLens';
import { keepCardsApart } from './cardClearance';
import { Continuation } from './Continuation';
import { presets, galleryPose, openingScreens, presetStop } from './presets';
import { loadPages, createRenderer, createDOMRenderer } from './renderer';
import { followScroll } from './scrollProgress';
import { useStagePlayback } from './stagePlayback';

function go(progress) {
  const end = document.querySelector('.stage').clientHeight * openingScreens;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top: progress * end, behavior: reduced ? 'instant' : 'smooth'});
}
export function App() {
  const stage = useRef(null), canvas = useRef(null), fallback = useRef(null);
  const [current,setCurrent] = useState(0);
  const playback=useStagePlayback();
  const [loadError, setLoadError] = useState(false);
  const [preset, setPreset] = useState(0);
  useEffect(() => {
    const host = stage.current, surface = canvas.current;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let cancelled = false, frame = 0, prev = 0, t = 0, flightTime = 0, progress;
    let formationTime = 0, pointerTarget = 0, pointerX = 0;
    function point(event) {
      pointerTarget=Math.max(-1,Math.min(1,event.clientX/w*2-1));
    }
    function resetPointer() { pointerTarget=0 }
    let renderer, images, active = -1, activePreset = -1, w, h, scrollEnd, inView = true;
    function resize() {
      w = host.clientWidth; h = host.clientHeight;
      scrollEnd = h * openingScreens;
    }
    function tick(now) {
      if (cancelled || document.hidden || !inView) return;
      const dt = prev ? Math.min(0.055,(now - prev)/1000) : 0;
      prev = now;
      if (!media.matches) t += dt;
      const target = Math.max(0,scrollY / scrollEnd);
      progress = !dt || media.matches ? target : followScroll(progress,target,dt,scrollEnd);
      pointerX = media.matches ? 0 : pointerX+(pointerTarget-pointerX)*(1-Math.exp(-dt*9));
      const p = Math.min(1,progress);
      const extra = Math.max(0,(progress-1)*openingScreens);
      const gallery = ease(0,0.46,extra)*(1-ease(4.87,5.47,extra));
      const cursor = Math.max(0,Math.min(6,(extra-presetStop(0))/0.70));
      // During a morph its two endpoints stay in place. Wind still runs on
      // its own clock, and an assembled formation can rotate while resting.
      const openingSettled = p < .029 || (p >= .29 && p <= .31) || (p >= .612 && p <= .66) || p >= .999;
      const gallerySettled = extra >= .49 && extra <= 4.86 && cursor % 1 <= .35;
      if (!media.matches && (extra === 0 ? openingSettled : gallerySettled)) formationTime += dt;
      const riding = ease(5.05,6.5,extra);
      host.style.setProperty('--gallery',gallery);
      host.style.setProperty('--picker',cursor);
      host.style.setProperty('--ride',1.35-2.65*riding);
      host.style.setProperty('--marquee',ease(5,5.5,extra)*(1-ease(6.23,6.55,extra)));
      host.style.setProperty('--opening-foot',1-ease(0,.24,extra));
      host.querySelector('.preset-picker').inert = gallery < .35;
      const nextPreset = Math.round(cursor);
      if (nextPreset !== activePreset) {activePreset = nextPreset; setPreset(nextPreset)}
      if (!media.matches) flightTime += dt * (1-ease(0.014,0.033,p));
      const hero = 1-ease(0.015,0.145,p);
      const panel = ease(0.473,0.607,p);
      const swap = ease(0.735,0.875,p);
      host.style.setProperty('--hero',hero);
      host.style.setProperty('--hero-y',(-55*(1-hero))+'px');
      host.style.setProperty('--panel-y',(100*(1-panel+ease(0,.45,extra)))+'%');
      host.style.setProperty('--old-y',(-105*swap)+'%');
      host.style.setProperty('--new-y',(105*(1-swap))+'%');
      host.style.setProperty('--progress',p);
      const index = p < 0.17 ? 0 : p < 0.47 ? 1 : p < 0.79 ? 2 : 3;
      if (active !== index) {setCurrent(index); active = index}
      host.querySelector('.intro').inert = hero === 0;
      host.querySelector('.first-slot').inert = panel < 0.9 || swap > 0.48;
      host.querySelector('.second-slot').inert = swap < 0.52 || extra > .22;
      if (renderer) {
        const poses = Array.from({length:COUNT},(_,i) => {
          const image = images[i % images.length];
          const first = cardPose(i,p,formationTime,w,h,image.naturalHeight/image.naturalWidth,flightTime,pointerX);
          return extra > 0 ? galleryPose(first,i,extra,formationTime,w,h) : first;
        });
        renderer.draw(keepCardsApart(poses),w,h,t,lensAt(progress*openingScreens));
      }
      frame = requestAnimationFrame(tick);
    }
    function visibility() {
      cancelAnimationFrame(frame); prev = 0;
      if (!document.hidden && inView) frame = requestAnimationFrame(tick);
    }
    function useFallback(e) {
      e?.preventDefault();
      renderer?.dispose();
      renderer = images && createDOMRenderer(fallback.current,images);
      surface.hidden = true;
    }
    loadPages().then(loaded => {
      if (cancelled) return;
      images = loaded;
      try { renderer = createRenderer(surface,images) } catch (err) {console.warn(err)}
      if (!renderer) useFallback();
    }).catch(() => {if (!cancelled) setLoadError(true)});
    resize();
    const visible = new IntersectionObserver(([entry])=>{inView=entry.isIntersecting; visibility()});
    visible.observe(host);
    host.addEventListener('pointermove',point);
    host.addEventListener('pointerleave',resetPointer);
    // React mounts the anchors after the browser's initial fragment lookup.
    const anchor = document.getElementById(location.hash.slice(1));
    anchor?.scrollIntoView({block:'start',behavior:'instant'});
    const observer = new ResizeObserver(resize); observer.observe(host);
    window.addEventListener('resize',resize);
    document.addEventListener('visibilitychange',visibility);
    surface.addEventListener('webglcontextlost',useFallback);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); visible.disconnect(); renderer?.dispose();
      host.removeEventListener('pointermove',point);
      host.removeEventListener('pointerleave',resetPointer);
      window.removeEventListener('resize',resize);
      document.removeEventListener('visibilitychange',visibility);
      surface.removeEventListener('webglcontextlost',useFallback);
    };
  },[]);

  return <main><section id="opening" className="scroll-story" aria-label="论文动效">
    <span className="preset-anchor" id="presets" aria-hidden="true" style={{top:((openingScreens+presetStop(0))*100)+'svh'}}/>
    <div className="stage" ref={stage}>
      <canvas ref={canvas} className="scene" aria-hidden="true" />
      <div ref={fallback} className="fallback" aria-hidden="true" />
      <div className="intro">
        <h1 lang="en"><span>Design<br/>research</span><span>Papers in<br/>(motion)</span></h1>
        <div className="intro-caption">
          <p lang="en">Six papers on how AI is changing the way designers work.</p>
          <p>从创意生成到协作决策，<br/>探索人和 AI 的设计实践。</p>
        </div>
      </div>
      <section className="panel" aria-label="论文主题">
        <div className="slot-window">
          <article className="slot first-slot">
            <h2 lang="en">Human–AI<br/>collaboration</h2>
            <div className="slot-copy"><p>设计师与 AI 如何共同决策？</p><p>六篇设计研究论文，涵盖创意收敛、团队协作与信任。</p></div>
          </article>
          <article className="slot second-slot">
            <h2 lang="en">Design in<br/>(orbit)</h2>
            <div className="slot-copy"><p>从单篇研究到共同议题。</p><p>身份、信任与反思，构成人机协作的不同视角。</p></div>
          </article>
        </div>
      </section>
      <nav className="preset-picker" aria-label="动效预设">
        <div className="picker-mask"><div className="picker-track">
          {presets.map((name,i)=><button key={name} aria-current={preset===i?'true':undefined} onClick={()=>go(1+presetStop(i)/openingScreens)}><span aria-hidden="true">{preset===i?'→':''}</span>{name}</button>)}
        </div></div>
      </nav>
      <div className="cross-title" aria-hidden="true"><span>Take the shortcut. Kill the (template) look.</span></div>
      <div className="rail" aria-hidden="true"><i /></div>
      <footer><span>DRS <b>/</b> 2024–2026</span><span>0{current+1} <b>/</b> 04</span></footer>
      {loadError && <p className="load-error">论文图片加载失败。<button onClick={()=>location.reload()}>重新加载</button></p>}
    </div>
  </section><Continuation onPresets={()=>go(1+presetStop(0)/openingScreens)} />
    {playback.managed && <nav className={'step-controls'+(playback.index>=4?' later-steps':'')} aria-label="动画播放">
      {playback.index>0 && <button data-playback onClick={()=>playback.step(-1)} aria-label="上一幕" aria-disabled={playback.playing}>←</button>}
      <button data-playback onClick={()=>playback.step()} aria-disabled={playback.playing}>
        {playback.index===0?'点击探索':'下一幕'} <span aria-hidden="true">→</span>
      </button>
    </nav>}
  </main>;
}
