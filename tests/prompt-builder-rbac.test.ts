import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
// @ts-ignore compiled runtime import
// @ts-ignore compiled runtime require
const { RBACGuard } = require('../dist-app/app/console/prompt-builder/RBACGuard.js');
// @ts-ignore compiled runtime require
const { BadgeVersioned } = require('../dist-app/app/console/prompt-builder/BadgeVersioned.js');
// @ts-ignore compiled runtime require
const { RoleProvider } = require('../dist-app/src/role-context.js');

test('RBACGuard hides content when role not allowed', () => {
  const html = renderToStaticMarkup(
    React.createElement(RoleProvider, null,
      React.createElement(RBACGuard, {
        roles: ['owner'],
        children: React.createElement('span', { id: 'x' }, 'secret')
      })
    )
  );
  assert.equal(html, '');
});

test('RBACGuard shows content when role allowed', () => {
  const html = renderToStaticMarkup(
    React.createElement(RoleProvider, null,
      React.createElement(RBACGuard, {
        roles: ['viewer'],
        children: React.createElement('span', { id: 'x' }, 'visible')
      })
    )
  );
  assert.ok(html.includes('visible'));
});

test('BadgeVersioned renders label', () => {
  const html = renderToStaticMarkup(React.createElement(BadgeVersioned));
  assert.ok(html.includes('versionné'));
});
