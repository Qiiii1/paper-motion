import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LITERATURE_CARD_COUNT, literatureCardPose, literatureTurn,
} from '../src/literatureOrbit.js';

test('one card feeds through the same gate while previous cards turn', () => {
  const pairs = LITERATURE_CARD_COUNT / 2;
  for (let index = 0; index < LITERATURE_CARD_COUNT; index++) {
    const local = Math.floor(index / 2) + (index % 2) * .375;
    const before = (local + .06) / pairs;
    const after = (local + .16) / pairs;
    const gate = literatureCardPose(index, (local + .375 * .62) / pairs);
    const incoming = literatureCardPose(index, after);
    assert.ok(Math.abs(gate.x - 88) < 1e-9);
    assert.ok(Math.abs(gate.y - 50) < 1e-9);
    assert.ok(Math.abs(gate.angle - 90) < 1e-9);
    assert.ok(Math.abs(gate.travel) < 1e-9);
    assert.ok(incoming.travel < literatureCardPose(index, before).travel);
    assert.ok(literatureTurn(after) > literatureTurn(before));
    if (index > 0) {
      const previous = literatureCardPose(index - 1, before);
      const turned = literatureCardPose(index - 1, after);
      assert.notDeepEqual([turned.x, turned.y], [previous.x, previous.y]);
    }
    for (let later = index + 1; later < LITERATURE_CARD_COUNT; later++) {
      assert.equal(literatureCardPose(later, after).opacity, 0);
    }
  }
  assert.equal(literatureTurn(1), 360);
});

test('incoming cards have clearly different arcs and travel rates at the visible edge', () => {
  const pairs = LITERATURE_CARD_COUNT / 2;
  const halfway = Array.from({ length: 5 }, (_, index) => {
    const local = Math.floor(index / 2) + (index % 2) * .375;
    return literatureCardPose(index, (local + .375 * .62 / 2) / pairs);
  });
  assert.ok(halfway.some(card => card.travel < .4) && halfway.some(card => card.travel > .6));
  const nearEdge = [0, 1].map(index => {
    const start = index * .375;
    const samples = Array.from({ length: 101 }, (_, step) =>
      literatureCardPose(index, (start + step * .002325) / pairs));
    return samples.find(card => Math.abs(card.travel - .36) < .02);
  });
  assert.ok(nearEdge[0].y < 41 && nearEdge[0].angle < 74);
  assert.ok(nearEdge[1].y > 58 && nearEdge[1].angle > 103);
});

const dot = ([x, y], [u, v]) => x * u + y * v;

function envelope(pose, width, entryDistance) {
  const radians = pose.angle * Math.PI / 180;
  const u = [Math.cos(radians), Math.sin(radians)];
  const v = [-u[1], u[0]];
  return { x: pose.x + pose.travel * entryDistance, y: pose.y, u, v, width };
}

function intersects(a, b) {
  const delta = [a.x - b.x, a.y - b.y];
  const projection = (box, axis) => box.width / 2 *
    (Math.abs(dot(box.u, axis)) + Math.abs(dot(box.v, axis)) / .76);
  return [a.u, a.v, b.u, b.v].every(axis =>
    Math.abs(dot(axis, delta)) + .001 < projection(a, axis) + projection(b, axis));
}

test('both rings and the feed path keep an open slot for each incoming card', () => {
  for (const entryDistance of [24, 40, 101, 200]) {
    for (let frame = 0; frame <= 2400; frame++) {
      const progress = frame / 2400;
      const turn = literatureTurn(progress);
      const boxes = [];
      for (let index = 0; index < LITERATURE_CARD_COUNT; index++) {
        const card = literatureCardPose(index, progress, turn);
        if (card.opacity === 0) continue;
        // Match the inner and outer card widths in the diagram.
        const box = envelope(card, index % 2 === 0 ? 7.1 : 13.3, entryDistance);
        assert.ok(boxes.every(previous => !intersects(box, previous)), `Card ${index} at ${progress}`);
        boxes.push(box);
      }
    }
  }
});
