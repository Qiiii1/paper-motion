import test from 'node:test';
import assert from 'node:assert/strict';
import {cardPose,COUNT} from '../src/choreography.js';

const w=390,h=844;
const pose=(i,p,t=0,x=0)=>cardPose(i,p,t,w,h,1.32,t,x);

test('opening sheets leave the centre of the light clear throughout a flight cycle',()=>{
  for(let t=0;t<25;t+=.25) for(let i=0;i<COUNT;i++) {
    const [x,y,z,,,,width,bend,,height]=pose(i,0,t);
    if(width<.25) continue;
    const radius=Math.hypot(width*.55,height*.55,height*bend*1.25);
    const nearest=(Math.hypot(x,y)-radius)/(1-(z-radius)/(h*1.65));
    assert.ok(nearest>w*.09);
  }
});

test('upright sheets share a bend and pass through the same right-rear exit',()=>{
  const gate=pose(0,.31);
  assert.ok(gate[0]>0 && gate[2]<0);
  for(let i=0;i<COUNT;i++) {
    const upright=pose(i,.30);
    for(const k of [4,5,6,7,9,10]) assert.equal(upright[k],gate[k]);
    const depart=.31+i/COUNT*.20;
    const at=pose(i,depart), next=pose(i,depart+.006);
    for(const k of [0,1,2]) assert.ok(Math.abs(at[k]-gate[k])<.00001);
    assert.ok(next[0]>at[0] && next[1]<at[1] && next[2]<at[2]);
  }
});

test('the settled grid is time-invariant and pans evenly in screen pixels',()=>{
  for(let i=0;i<COUNT;i++) {
    const grid=pose(i,.64);
    assert.equal(grid[7],0);
    assert.deepEqual(grid,pose(i,.64,8));
    const moved=pose(i,.64,8,1);
    assert.deepEqual(grid.slice(1),moved.slice(1));
    assert.ok(Math.abs((moved[0]-grid[0])/(1-grid[2]/(h*1.65))-w*.12)<1e-6);
  }
});

test('the lower-left sheet leads a sparse tilted ring of tangent sheets',()=>{
  const cards=Array.from({length:COUNT},(_,i)=>i);
  const orbit=cards.filter(i=>pose(i,1)[6]>.25);
  assert.equal(orbit.length,10);
  const first=orbit.filter(i=>Math.abs(pose(i,.67)[3]-pose(i,.64)[3])>.001);
  assert.equal(first.length,1);
  const start=pose(first[0],.64);
  assert.ok(start[0]<0 && start[1]>0);
  for(const i of orbit) {
    const card=pose(i,1);
    assert.ok(card[5]<0 && card[7]<0 && card[10]===1);
    assert.deepEqual(card,pose(i,1,8));
  }
});
