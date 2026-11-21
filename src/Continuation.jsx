import React,{useEffect,useRef,useState} from 'react';
import { papers } from './papers';
import { ease } from './choreography';
import { useScrollScene } from './scrollScene';
import { DistortionCanvas } from './DistortionCanvas';
import './continuation.css';

const images='/studio/';
const sourceEditor='https://app.premotio.com';
const swatches=['black','cream','purple','red'];
const steps=[
  ['Swap the media','把论文放入画面，卡片沿预设路径移动。'],
  ['Add type','标题进入画面，与纸页一起运动。'],
  ['Change the background','点选色样，试试不同的背景。'],
  ['Stack shots','把镜头接入同一条时间线。'],
];
function Options({label,items,selected,choose}) {
  return <div role="group" aria-label={label} className="options">{items.map((item,i)=>
    <button key={item} aria-pressed={i===selected} onClick={()=>choose(i)}>{item}</button>)}</div>;
}
function Sheet({index,className='',style={}}) {
  const [id,,color]=papers[(index%papers.length+papers.length)%papers.length];
  return <span className={'mini-sheet '+className} style={{backgroundColor:color,...style}}><img alt="" loading="lazy" src={'/papers/'+id+'.png'}/></span>;
}
function Editor() {
  const {root,progress:p,seek}=useScrollScene();
  const index=Math.min(3,Math.floor(p/.203));
  const [color,setColor]=useState(null);
  const bg=color??Math.min(3,Math.floor(ease(.41,.64,p)*4));
  const late=ease(.806,.965,p), zoom=ease(.18,.36,p)*(1-ease(.77,.87,p));
  return <section ref={root} className="scrub editor-chapter" id="studio" aria-label="编辑步骤">
    <div className="pin editor-pin" style={{'--late':late,'--zoom':zoom,'--list-shift':Math.max(0,index-1),'--drag':ease(.003,.18,p)}}>
      <div className="edit-stage">
        <div className="editor-screen">
          <img className="editor-shell" src={images+'shot.webp'} alt="编辑器的素材栏、画布与时间线" loading="lazy"/>
          <div className="edit-art" style={{backgroundImage:'url(/studio/'+(p<.07?'drop':swatches[index>=2?bg:1])+'.webp)'}}>
            <div className={'edit-fan fan-'+index}>{Array.from({length:8},(_,i)=><Sheet key={i} index={i} style={{'--i':i,'--turn':(p*440+i*45)+'deg'}}/>)}</div>
            {index>=1&&<strong>Paper Motion</strong>}
          </div>
          {index===0&&<Sheet className="drop-sheet" index={1}/>}
          {index===3&&<div className="timeline-clips">{['Deck','Bloom','Wall'].map((n,i)=><span key={n}><Sheet index={i}/>{n}</span>)}</div>}
        </div>
      </div>
      <div className="edit-list" inert={late>.65}><div>{steps.map(([name,desc],i)=><article key={name} className={index===i?'selected':''}>
        <button className="edit-step" onClick={()=>seek(.203*i+.07)} aria-current={index===i?'step':undefined}><small>0{i+1}</small><b>{name}</b><span>{desc}</span></button>
        {i===2&&<div className="swatches" role="group" aria-label="背景颜色">{swatches.map((s,j)=><button key={s} aria-label={['墨黑','奶油','紫色','朱红'][j]} aria-pressed={bg===j} style={{backgroundImage:'url(/studio/'+s+'.webp)'}} onClick={()=>{setColor(j);if(index!==2)seek(.505)}}/>)}</div>}
      </article>)}</div></div>
      <h2 className="edit-last">→ Start from<br/><em>something finished</em><span>then make it<br/>(yours)</span></h2>
    </div>
  </section>;
}
const filters=['Off','Flare','Prism','Bend'];
function Distort(){
  const {root,progress:p,near,seek}=useScrollScene();
  const mode=Math.min(3,Math.floor(p*4));
  const [override,setOverride]=useState(null);
  const auto=mode===0?0:Math.round(36+62*ease(0,.82,p*4-mode));
  const amount=override?.mode===mode?override.value:auto;
  const fill=ease(0,.10,p)*(1-ease(.91,1,p));
  return <section ref={root} className="scrub distort-chapter" id="distort" aria-label="光学变形">
    <div className="pin distortion-pin" style={{'--fill':fill}}>
      <img className="portal-screen" src={images+'shot.webp'} loading="lazy" alt="" />
      <div className="portal-art">
      <DistortionCanvas mode={mode} amount={amount} progress={p} near={near}/>
      </div><h2>Distort<br/>anything</h2>
      <div className="effect-tools" inert={fill<.5}><Options label="变形模式" items={filters} selected={mode} choose={i=>{setOverride(null);seek((i+.35)/4)}}/>
      <label className="amount"><span>Amount</span><input aria-label="变形强度" type="range" min="0" max="100" disabled={mode===0} value={amount} onChange={e=>setOverride({mode,value:Number(e.target.value)})}/><output>{amount}%</output></label></div>
    </div></section>;
}
const turns=[
  ['用六张论文卡片搭一个圆环。','add_shot','Ring · 6 papers','已加入圆环镜头。','editor-3'],
  ['再加两个镜头。','add_shot ×2','Grid / Carousel','已加入两个镜头。','editor-4'],
  ['用快速摇镜连接它们。','update_shot','Whip · 0.6 s','转场已更新。','editor-5'],
  ['给序列配上背景音乐。','set_sound','soundtrack.mp3','音轨已加入。','editor-6'],
];
function Agents(){
  const {root,progress:p,seek}=useScrollScene();
  const open=ease(.07,.28,p),turn=Math.min(3,Math.max(0,Math.floor((p-.25)/.185)));
  const [prompt,call,detail,reply,screen]=turns[turn];
  return <section className="scrub agents-chapter" ref={root} id="mcp" aria-label="MCP 交互演示">
    <div className="pin agents-pin" style={{'--open':open}}>
      <div className="agent-intro"><h2>Connect your<br/>AI agent<br/>through → MCP</h2><p>给出素材与创作指令，让助手编排镜头。</p><span>Claude　 ChatGPT　 Cursor</span></div>
      <div className="agent-demo"><div className="agent-screen"><img src={images+(open>.9?screen:'editor-2')+'.webp'} alt="随对话更新的镜头预览" loading="lazy"/></div>
      <div className="chat-window"><div className="chat-head"><strong>paper motion</strong> × Claude <span>本地演示</span></div>
        <div className="conversation" key={turn}><span className="message">{prompt}</span><p className="tool-call"><Sheet index={turn}/><span>premotio / {call}<small>{detail}</small></span></p><p>{reply}</p></div>
        <button className="chat-next" onClick={()=>seek(turn===3?.28:.25+(turn+1.4)*.185)}>{turn===3?'重播演示':'下一条指令'}<span>↵</span></button>
      </div></div>
    </div></section>;
}
function Devices(){
  const {root,progress:p,near}=useScrollScene(),canvas=useRef(null),model=useRef(null);
  const latest=useRef(p);latest.current=p;
  const [loadModel,setLoadModel]=useState(false);
  useEffect(()=>{if(near)setLoadModel(true)},[near]);
  useEffect(()=>{
    if(!loadModel)return;
    let cancelled=false;
    import('./phone').then(({mountPhone})=>{if(!cancelled)model.current=mountPhone(canvas.current,()=>latest.current)}).catch(()=>{});
    return ()=>{cancelled=true;model.current?.dispose();model.current=null};
  },[loadModel]);
  useEffect(()=>{model.current?.draw()},[p]);
  const img=['screen-loop-b','screen-editor','screen-library','screen-loop-a'][Math.min(3,Math.floor(p*4))];
  return <section className="scrub device-chapter" ref={root} id="devices" aria-label="跨设备展示"><div className="pin devices-pin">
    <h2>On every<br/>→ device</h2>
    <div className="phone-view"><img src={images+img+'.webp'} loading="lazy" alt="手机端编辑与浏览界面"/><canvas ref={canvas} aria-hidden="true"/></div>
    <div className="device-text"><p>从桌面上的编辑器，<br/>到手中的论文动效。</p><p>继续滚动，转动手机查看不同画面。</p></div>
  </div></section>;
}
const ratios=['3:4','4:5','9:16','1:1','4:3','16:9'];
function ExportView(){
  const {root,progress:p,seek}=useScrollScene();
  const ratio=Math.min(5,Math.floor(6*p));
  const [resolution,setResolution]=useState(1),[fps,setFps]=useState(2);
  const [x,y]=ratios[ratio].split(':').map(Number);
  const selection={aspectRatio:x/y,'--ratio':x/y,'--frames':10*[24,25,30,60][fps]};
  return <section className="scrub export-chapter" ref={root} id="formats" aria-label="导出设置预览"><div className="pin export-pin">
    <h2>Make it once.<br/>→ Send it out</h2>
    <div className="format-field"><div className="format-image" style={selection}>
      <div className="format-orbit">{Array.from({length:16},(_,i)=><Sheet key={i} index={i} style={{'--turn':(i*22.5)+'deg'}}/>)}</div>
    </div></div>
    <div className="format-tools"><Options label="画幅" items={ratios} selected={ratio} choose={i=>seek((i+.5)/6)}/>
      <Options label="分辨率" items={['720p','1080p','2K','4K']} selected={resolution} choose={setResolution}/>
      <div className="frame-rates"><Options label="帧率" items={['24','25','30','60']} selected={fps} choose={setFps}/><span>MP4 or WebM</span></div>
      <p>导出规格预览 · {ratios[ratio]} / {['720p','1080p','2K','4K'][resolution]} / {[24,25,30,60][fps]} fps</p>
    </div>
  </div></section>;
}
const plans=[
  ['Guest','Just try it',['无需账号','使用自己的素材','在浏览器中运行','本地保存项目','最高 720p MP4']],
  ['Free','Save your work',['云端项目','跨设备访问','1 GB 媒体空间','最高 720p MP4']],
  ['Pro','Remove the limits',['50 GB 媒体空间','不限导出次数','最高 4K · MP4 / WebM','MCP 应用支持']],
];
function Pricing(){
  const [period,setPeriod]=useState(0);
  return <section id="pricing" className="price-section"><h2>Try the whole editor before we ask for your email</h2>
    <p>Premotio 编辑器方案</p><Options label="计费周期" selected={period} choose={setPeriod} items={['Monthly','Yearly −33%']}/>
    <div className="plan-grid">{plans.map(([name,tag,features],i)=><article key={name} className={'plan plan-'+i}>
      <small>{name}</small><h3>{tag}</h3><div className="price"><b key={period}>{i===2?(period?'$10':'$15'):'$0'}</b>{i===2&&' / month'}</div>
      <p>{i===0?'No signup':i===1?'With a free account':period?'$120 billed yearly':'Billed monthly'}</p>
      <ul>{features.map(f=><li key={f}>{f}</li>)}</ul>
      <a className="action" target="_blank" rel="noreferrer" href={sourceEditor+(i===0?'':i===1?'/?signin':'/?upgrade='+(period?'year':'month'))}>{['Open premotio','Create free account','Go Pro'][i]} ↗</a>
    </article>)}</div>
  </section>;
}
function Closing({onPresets}){
  return <><section className="closing" id="closing"><div className="outro-sheets" aria-hidden="true">{Array.from({length:12},(_,i)=><Sheet key={i} index={i} style={{'--i':i,'--angle':(i*30)+'deg'}}/>)}</div>
    <h2>Put your work in.<br/>See where it <span>(<i className="moving-word" aria-label="moves"><i aria-hidden="true">moves moves </i></i>)</span></h2>
    <div className="outro-actions"><a href={sourceEditor} target="_blank" rel="noreferrer" className="action">打开编辑器 ↗</a><button className="action" onClick={onPresets}>浏览预设 ↑</button></div></section>
    <footer className="end-footer"><div><h3>Motion ready<br/>before you are.</h3><nav aria-label="页尾导航"><a href="#opening">首页</a><a href="#studio">Editor</a><a href="#distort">Distortion</a><a href="#mcp">MCP</a><a href="#devices">Devices</a><a href="#formats">Export</a><a href="#pricing">Pricing</a><a href="https://premotio.com/" target="_blank" rel="noreferrer">Premotio ↗</a></nav></div>
      <strong>paper motion</strong><button onClick={()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}>回到开场 ↑</button>
    </footer></>;
}
export function Continuation({onPresets}){
  return <div className="continuation"><Editor/><Distort/><Agents/><Devices/><ExportView/><Pricing/><Closing onPresets={onPresets}/></div>;
}
