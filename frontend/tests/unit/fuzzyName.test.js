// frontend tests/unit/fuzzyName.test.js — people-search fuzzy matching (pure, no DB).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { scoreName, rankByName, editDistance, normalize } from '../../src/lib/fuzzyName.js';

const names = (list) => list.map((n) => ({ name: n }));
const top = (q, list) => rankByName(q, names(list)).map((u) => u.name);

describe('normalize', () => {
  it('lowercases, strips accents and punctuation', () => {
    assert.equal(normalize('  José  O\'Neil-Cruz '), 'jose o neil cruz');
  });
});

describe('editDistance', () => {
  it('counts an adjacent swap as one edit', () => {
    assert.equal(editDistance('jhon', 'john', 2), 1);
  });
  it('stops early once over the limit', () => {
    assert.equal(editDistance('abcdef', 'zzzzzz', 1), 2);
  });
});

describe('scoreName', () => {
  it('still finds plain substrings', () => {
    assert.ok(scoreName('user', 'user2') > 0);
    assert.ok(scoreName('riv', 'Kai Rivera') > 0);
  });

  it('matches letters typed close together, with missing letters', () => {
    assert.ok(scoreName('usr2', 'user2') > 0);
    assert.ok(scoreName('kai rvra', 'Kai Rivera') > 0);
  });

  it('tolerates small typos', () => {
    assert.ok(scoreName('jhon', 'John Smith') > 0);
    assert.ok(scoreName('rivrea', 'Kai Rivera') > 0);
    assert.ok(scoreName('ryna', 'ryan') > 0);
  });

  it('ignores spaces and accents', () => {
    assert.ok(scoreName('user 2', 'user2') > 0);
    assert.ok(scoreName('jose', 'José Cruz') > 0);
  });

  it('rejects unrelated names', () => {
    assert.equal(scoreName('xyz', 'Kai Rivera'), 0);
    assert.equal(scoreName('sre', 'user2'), 0);
    assert.equal(scoreName('maria', 'ryan'), 0);
  });

  it('does not let a 1-2 letter query typo-match everything', () => {
    assert.equal(scoreName('zq', 'user2'), 0);
  });
});

describe('rankByName', () => {
  it('ranks exact > prefix > word prefix > fuzzy', () => {
    const list = ['Kai Rivera', 'Rivers Kai', 'Kaiden', 'Kai', 'Mika Ito'];
    assert.deepEqual(top('kai', list).slice(0, 4), ['Kai', 'Kai Rivera', 'Kaiden', 'Rivers Kai']);
  });

  it('puts the closest typo match first', () => {
    assert.deepEqual(top('usr2', ['User Four', 'user3', 'user2']), ['user2']);
  });
});
