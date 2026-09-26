'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DIST = path.join(__dirname, '..', 'dist');
const shared = ['engine.js', 'messages.js'].map(f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8')).join('\n');

test('the preview carries the shared code byte for byte, once', () => {
  const html = fs.readFileSync(path.join(DIST, 'preview', 'index.html'), 'utf8');
  assert.ok(html.includes(shared), 'no "$\'" or "$&" expansion mangled the calculator');
  assert.equal(html.split('var BOOT =').length, 2, 'the page script appears exactly once');
  assert.doesNotMatch(html, /\/\*@BOOT\*\/|<!--@SHARED-->|<\?/);
});

test('every script block in the preview parses', () => {
  const html = fs.readFileSync(path.join(DIST, 'preview', 'index.html'), 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert.equal(blocks.length, 2);
  blocks.forEach((code, i) => assert.doesNotThrow(() => new vm.Script(code, { filename: 'block' + i })));
});
