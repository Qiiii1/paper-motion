import test from 'node:test';
import assert from 'node:assert/strict';
import { Euler, Matrix3, Matrix4, Vector3 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { cardPose, COUNT, focusWheelPose } from '../src/choreography.js';
import { keepCardsApart } from '../src/cardClearance.js';
import { galleryPose, presetStop } from '../src/presets.js';
import { blendSectionCover, comparisonRingPoses, researchGapPaperPoses, relatedTitleReveal, sectionCoverPoses } from '../src/sectionCoverMotion.js';

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
  const wheel=Math.max(0,(p-.64)/.36);
  return Array.from({length:COUNT},(_,i)=>{
    const grid=cardPose(i,Math.min(p,.64),t,w,h,[1.31,1.20,1.49,1.15,1.65,1.11][i%6],t,
      0,0,w*.24);
    const original=wheel>0 ? focusWheelPose(grid,i,wheel,p===1 ? t : 0,w,h) : grid;
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

test('the research focus wheel settles before the reveal and keeps its cards during a turn',()=>{
  const w=390,h=844;
  const wheel=(blend,turn)=>keepCardsApart(Array.from({length:COUNT},(_,i)=>
    focusWheelPose(cardPose(i,.64,0,w,h,1.32,0),i,blend,turn,w,h))).filter(p=>p[6]>.25);
  const settled=wheel(.98,0), endpoint=wheel(1,0), turned=wheel(1,Math.PI*.72);
  assert.deepEqual(settled,endpoint);
  assert.equal(settled.length,15);
  assert.equal(turned.length,settled.length);
  assert.ok(settled.every(p=>p[0]<0) && turned.every(p=>p[0]<0));
  assert.ok(turned.some((p,i)=>Math.abs(p[1]-settled[i][1])>h*.1));
});

test('the approach deck morphs into the cover without intersecting', () => {
  for (const [width, height] of [[320, 568], [390, 844], [1360, 880]]) {
    const makeDeck = () => Array.from({ length: COUNT }, (_, index) =>
      cardPose(index, .30, 0, width, height, 1.32, 0, 0, 1));
    const makeRibbons = () => sectionCoverPoses(1, 0, 0, width, height, height * .68);
    assert.deepEqual(blendSectionCover(makeDeck(), makeRibbons(), 0, width), makeDeck());
    assert.deepEqual(blendSectionCover(makeDeck(), makeRibbons(), 1, width), makeRibbons());
    for (let step = 0; step <= 75; step++) {
      const pose = blendSectionCover(makeDeck(), makeRibbons(), step / 75, Math.min(width, height));
      const settled = keepCardsApart(pose).filter(card => card[6] >= .25).map(windVolume);
      for (const [index, box] of settled.entries()) {
        assert.ok(settled.slice(0, index).every(previous => !box.intersectsOBB(previous)));
      }
    }
  }
});

test('the first cover turns the paper positions and their orientations together', () => {
  const posesAt = progress => sectionCoverPoses(1, progress, 0, 390, 844, 844 * .68);
  const initial = posesAt(0);
  const final = posesAt(1);
  const tilt = cards => Math.atan2(cards[19][1] - cards[11][1], cards[19][0] - cards[11][0]);
  assert.ok(tilt(final) - tilt(initial) > .4);
  for (const [index, card] of initial.entries()) {
    if (card[6] > 0) assert.ok(final[index][5] - card[5] > .47);
  }
});

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

test('the related research ribbons assemble and clear one sheet per beat', () => {
  const frame = progress => sectionCoverPoses(2, progress, 0, 390, 574);
  const settled = frame(.54);
  const sheets = settled.filter(p => p[6] > 0).length;
  let lastCount = 0;
  for (let step = 0; step <= 1000; step++) {
    const p = step / 1000;
    const current = frame(p);
    const visible = current.filter(pose => pose[6] > 0).length;
    const moving = current.filter((pose, i) => pose[6] && (
      Math.abs(pose[0] - settled[i][0]) > .001 || Math.abs(pose[1] - settled[i][1]) > .001));
    assert.ok(moving.length <= 2);
    if (relatedTitleReveal(p) > 0) {
      assert.equal(visible, sheets);
      assert.equal(moving.length, 0);
    }
    assert.ok(Math.abs(visible - lastCount) <= 1);
    if (visible > lastCount) assert.ok(moving.every(pose => pose[1] < settled[current.indexOf(pose)][1]));
    if (visible < lastCount) assert.ok(moving.every(pose => pose[0] > settled[current.indexOf(pose)][0]));
    lastCount = visible;
  }
  assert.equal(lastCount, 0);
  assert.equal(relatedTitleReveal(.54), 1);
});

test('the comparison cover builds one upright ring and preserves it as the reading plate rises', () => {
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1360, 880]]) {
    const settled = comparisonRingPoses(1, width, height).filter(pose => pose[6] > 0);
    const published = comparisonRingPoses(1, width, height, 135).filter(pose => pose[6] > 0);
    const camera = Math.max(width, height) * 1.65;
    assert.equal(settled.length, 24);
    let previous = 0;
    for (let step = 0; step <= 100; step++) {
      const poses = comparisonRingPoses(step / 100, width, height);
      const entering = poses.filter(pose => pose[6] > 0);
      assert.ok(entering.length - previous >= 0 && entering.length - previous <= 1);
      assert.ok(entering.every((pose, i) => pose[0] === settled[i][0] && pose[1] <= settled[i][1] + .001));
      assert.ok(entering.filter((pose, i) => Math.abs(pose[1] - settled[i][1]) > .001).length <= 2);
      previous = entering.length;
      const boxes = keepCardsApart(poses).filter(pose => pose[6] > .25).map(windVolume);
      for (const [index, box] of boxes.entries()) {
        assert.ok(boxes.slice(0, index).every(other => !box.intersectsOBB(other)));
      }
    }
    assert.equal(previous, settled.length);
    const radii = settled.map(([x, , z]) => Math.hypot(x, z / Math.cos(.135)));
    assert.ok(Math.max(...radii) - Math.min(...radii) < .001);
    published.forEach((pose, i) => {
      assert.deepEqual([pose[0], ...pose.slice(2)], [settled[i][0], ...settled[i].slice(2)]);
      const rise = (settled[i][1] - pose[1]) / (1 - pose[2] / camera);
      assert.ok(Math.abs(rise - (height - 135) * .28) < .001);
    });
    for (const turn of [.2, .8, 1.6, 2.4, Math.PI]) {
      const rotating = comparisonRingPoses(1, width, height, 135, turn).filter(pose => pose[6] > 0);
      for (const [i, pose] of rotating.entries()) {
        assert.ok(Math.abs(pose[3] - settled[i][3] - turn) < .001);
        assert.ok(Math.abs(Math.hypot(pose[0], pose[2] / Math.cos(.135)) - radii[i]) < .001);
      }
      const boxes = keepCardsApart(rotating).map(windVolume);
      for (const [index, box] of boxes.entries()) {
        assert.ok(boxes.slice(0, index).every(other => !box.intersectsOBB(other)));
      }
    }
  }
});


test('the research gap ring gathers through the center and resolves to the opening flight', () => {
  const aspects = [1.31, 1.2, 1.49, 1.15, 1.65, 1.11];
  const time = .62;
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1280, 800]]) {
    const ring = comparisonRingPoses(1, width, height, height, Math.PI * 1.9);
    const frame = progress => researchGapPaperPoses(ring, progress, time, width, height, aspects);
    assert.deepEqual(frame(0), ring);
    const gathering = frame(.16);
    for (const [index, initial] of ring.entries()) {
      if (initial[6] === 0) continue;
      assert.ok(Math.hypot(...gathering[index].slice(0, 2)) < Math.hypot(...initial.slice(0, 2)));
    }
    assert.deepEqual(frame(1), Array.from({ length: COUNT }, (_, i) =>
      cardPose(i, 0, time, width, height, aspects[i % aspects.length], time)));
    for (let step = 1; step < 20; step++) {
      const boxes = keepCardsApart(frame(step / 20)).filter(pose => pose[6] > .25).map(windVolume);
      for (const [index, box] of boxes.entries()) {
        assert.ok(boxes.slice(0, index).every(other => !box.intersectsOBB(other)));
      }
    }
  }
});
