import test from 'node:test';
import assert from 'node:assert/strict';
import { Euler, Matrix3, Matrix4, Vector3 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { cardPose, COUNT } from '../src/choreography.js';
import { keepCardsApart } from '../src/cardClearance.js';
import { galleryPose, presetStop } from '../src/presets.js';

function windVolume(pose) {
  const [x,y,z,yaw,pitch,roll,w,bend,,h]=pose;
  const wind=1.25*Math.abs(bend);
  const rotation=new Matrix4().makeRotationFromEuler(new Euler(pitch,yaw,roll,'ZXY'));
  return new OBB(
    new Vector3(x,y,z),
    new Vector3(w*(.5+.23*wind),h*(.5+.12*wind),h*wind),
    new Matrix3().setFromMatrix4(rotation),
  );
}

function frame(w,h,t,step) {
  const p=Math.min(step/150,1);
  const extra=Math.max(0,step-150)/30;
  return Array.from({length:COUNT},(_,i)=>{
    const original=cardPose(i,p,t,w,h,[1.31,1.20,1.49,1.15,1.65,1.11][i%6],t);
    return extra>0 ? galleryPose(original,i,extra,t,w,h) : original;
  });
}

for(const [w,h] of [[320,568],[390,844],[844,390],[1360,880]]) {
  test('wind envelopes stay disjoint at '+w+' × '+h,()=>{
    for(const t of [0,4.6,17.1]) {
      for(let step=0;step<=320;step++) {
        const poses=keepCardsApart(frame(w,h,t,step));
        const boxes=poses.filter(p=>p[6]>=.25 && p[9]>=.25).map(windVolume);
        for(let i=0;i<boxes.length;i++) {
          for(let j=i+1;j<boxes.length;j++) {
            if(boxes[i].intersectsOBB(boxes[j])) {
              assert.fail('Intersection at step '+step+', phase '+t+', cards '+i+' / '+j);
            }
          }
        }
      }
    }
  });
}

test('settled presets keep their designed footprints during a full turn',()=>{
  for(let preset=0;preset<7;preset++) {
    for(let t=0;t<32;t+=.25) {
      const poses=Array.from({length:COUNT},(_,i)=>galleryPose(cardPose(i,1,t,390,844,1.32,0),i,presetStop(preset),t,390,844));
      const widths=poses.map(p=>p[6]);
      keepCardsApart(poses);
      poses.forEach((p,i)=>assert.ok(p[6]>=widths[i]*.97,'preset '+preset+' card '+i));
    }
  }
});
