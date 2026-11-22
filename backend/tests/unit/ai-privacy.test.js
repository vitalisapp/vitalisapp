// tests/unit/ai-privacy.test.js — Section 9: the user's name never reaches the AI provider.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'services', 'ai.service.js'), 'utf8');

// Pull personalize() out without loading the service (it opens the DB pool).
const start = src.indexOf("const NAME_TOKEN = '{{name}}';");
const end = src.indexOf('function personalizeFields');
// eslint-disable-next-line no-new-func
const personalize = new Function(`${src.slice(start, end)}; return personalize;`)();

describe('AI prompts are anonymous', () => {
  it('no prompt template interpolates the first name', () => {
    const prompts = src.match(/const prompt = `[\s\S]*?`\.trim\(\)/g) || [];
    assert.ok(prompts.length >= 3, 'expected the coach prompts to be found');
    for (const p of prompts) {
      assert.doesNotMatch(p, /\$\{\s*firstName/, 'prompt must not contain ${firstName}');
      assert.doesNotMatch(p, /\$\{\s*user\.name/, 'prompt must not contain ${user.name}');
      assert.doesNotMatch(p, /- Name:/, 'prompt must not send a Name field');
    }
  });

  it('personalize() fills the {{name}} token locally', () => {
    assert.equal(personalize('{{name}}, nice 5k today.', 'Ryan'), 'Ryan, nice 5k today.');
    assert.equal(personalize('Solid work {{ Name }}!', 'Ana'), 'Solid work Ana!');
    assert.equal(personalize('{{name}}, keep going.', ''), 'Athlete, keep going.');
    assert.equal(personalize('No token here.', 'Ryan'), 'No token here.');
    assert.equal(personalize(undefined, 'Ryan'), undefined);
  });
});
