import test from 'node:test';
import assert from 'node:assert/strict';
import { Euler, Matrix3, Matrix4, Vector3 } from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { cardPose, COUNT, focusWheelPose } from '../src/choreography.js';
import { keepCardsApart } from '../src/cardClearance.js';
import { galleryPose, presetStop } from '../src/presets.js';
import {
  blendSectionCover, comparisonRingPoses, departGapPapers, questionsCoverPoses,
  researchGapPaperPoses, relatedTitleReveal, sectionCoverPoses,
} from '../src/sectionCoverMotion.js';

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

function apart(poses, width, height) {
  const camera = Math.max(width, height) * 1.65;
  const projectedFootprint = pose => [0, 1, 6, 9].map(axis => pose[axis] / (1 - pose[2] / camera));
  const before = poses.map(projectedFootprint);
  const after = keepCardsApart(poses, camera);
  for (const [i, pose] of after.entries()) {
    const footprint = projectedFootprint(pose);
    for (const [axis, value] of footprint.entries()) {
      assert.ok(Math.abs(value - before[i][axis]) < 1e-8, 'Paper ' + i + ' shifted or resized on screen');
    }
  }
  return after;
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

test('coincident sheets keep their footprints and separate in depth', () => {
  const pose = [0, 0, 0, .2, -.4, .1, 110, .08, 0, 145, 1];
  const [front, middle, back] = apart([pose.slice(), pose.slice(), pose.slice()], 390, 844);
  assert.deepEqual(front, pose);
  assert.ok(front[2] > middle[2] && middle[2] > back[2]);
  assert.ok(!windVolume(front).intersectsOBB(windVolume(middle)));
  assert.ok(!windVolume(middle).intersectsOBB(windVolume(back)));
});

for(const [w,h] of [[320,568],[390,844],[844,390],[1360,880]]) {
  test('wind envelopes stay disjoint at '+w+' × '+h,()=>{
    for(const t of [0,4.6,17.1]) {
      for(let step=0;step<=320;step++) {
        const poses=apart(frame(w,h,t,step), w, h);
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
  const wheel=(blend,turn)=>apart(Array.from({length:COUNT},(_,i)=>
    focusWheelPose(cardPose(i,.64,0,w,h,1.32,0),i,blend,turn,w,h)), w, h).filter(p=>p[6]>.25);
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
      const settled = apart(pose, width, height).filter(card => card[6] >= .25).map(windVolume);
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
      apart(poses, 390, 844);
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
      const boxes = apart(poses, width, height).filter(pose => pose[6] > .25).map(windVolume);
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
      const boxes = apart(rotating, width, height).map(windVolume);
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
      const boxes = apart(frame(step / 20), width, height).filter(pose => pose[6] > .25).map(windVolume);
      for (const [index, box] of boxes.entries()) {
        assert.ok(boxes.slice(0, index).every(other => !box.intersectsOBB(other)));
      }
    }
  }
});

test('the questions cover clears the old sheets and keeps the incoming arcs and ring separated', () => {
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1280, 800]]) {
    const flight = Array.from({ length: COUNT }, (_, i) => cardPose(i, 0, .62, width, height, 1.32, .62));
    assert.deepEqual(departGapPapers(flight, 0, width, height), flight);
    const finish = departGapPapers(flight, 1, width, height);
    assert.ok(finish.every(pose => pose[6] === 0));

    const ribbons = questionsCoverPoses(1, width, height);
    assert.equal(ribbons.filter(pose => pose[6] > 0).length, 27);
    assert.notDeepEqual(questionsCoverPoses(.25, width, height), ribbons);
    assert.notDeepEqual(questionsCoverPoses(1.3, width, height), ribbons);
    const ring = comparisonRingPoses(1, width, height, 135, Math.PI / 2);
    for (let step = 1; step < 20; step++) {
      const progress = step / 20;
      const frames = [
        departGapPapers(flight, progress, width, height),
        questionsCoverPoses(progress, width, height),
        blendSectionCover(ribbons, ring, progress, Math.min(width, height)),
      ];
      for (const poses of frames) {
        const boxes = apart(poses, width, height).filter(pose => pose[6] > .25).map(windVolume);
        for (const [index, box] of boxes.entries()) {
          assert.ok(boxes.slice(0, index).every(other => !box.intersectsOBB(other)));
        }
      }
    }
  }
});
