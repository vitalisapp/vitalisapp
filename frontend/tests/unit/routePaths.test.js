import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { matchRoutes } from 'react-router-dom';
import { legacyMemberDestination } from '../../src/lib/routePaths.js';
import { MAIN_NAV, MOBILE_MAIN_NAV, MOBILE_MORE_NAV, SIDEBAR_BOTTOM_NAV, getSettingsItems } from '../../src/constants/nav.js';
import * as landingData from '../../src/pages/Landing/landingData.js';

const require = createRequire(import.meta.url);
const { LANDING_MODULES } = require('../../../backend/src/constants/landingModules.js');
// Check links against the actual guarded route declarations, not a test-only copy.
const appRoutes = readFileSync(new URL('../../src/app/routes/AppRoutes.jsx', import.meta.url), 'utf8');
const memberRoutes = [...appRoutes.matchAll(/<Route path="([^"]+)" element=\{<MemberRoute>/g)]
  .map(([, path]) => ({ path }));
const topLevelRoutes = [...appRoutes.matchAll(/<Route path="(\/[^"]*)" element=/g)]
  .map(([, path]) => ({ path }));
const isMemberPage = (path) => Boolean(matchRoutes(memberRoutes, path));

describe('member URL migration', () => {
  it('desktop, mobile and backend module links resolve directly to protected pages', () => {
    const paths = [
      ...[...MAIN_NAV, ...MOBILE_MAIN_NAV, ...MOBILE_MORE_NAV, ...SIDEBAR_BOTTOM_NAV].map((item) => item.path),
      ...LANDING_MODULES.map((item) => item.route),
    ];
    for (const path of paths) {
      assert.ok(isMemberPage(path), `${path} must have a MemberRoute`);
      assert.ok(!path.startsWith('/dashboard/'), `${path} must be a canonical URL`);
    }
    assert.ok(isMemberPage('/meal-tracker'));
    assert.equal(isMemberPage('/dashboard/meal-tracker'), false);
  });

  it('landing-page module links resolve without a legacy redirect', () => {
    const visit = (value) => {
      if (!value || typeof value !== 'object') return;
      if (typeof value.to === 'string' && value.to.startsWith('/')) {
        assert.ok(matchRoutes(topLevelRoutes, value.to), `landing link ${value.to} must resolve`);
        assert.ok(!value.to.startsWith('/dashboard/'), `landing link ${value.to} must be canonical`);
      }
      Object.values(value).forEach(visit);
    };
    visit(landingData);
  });

  it('settings actions stay within the member or admin area', () => {
    const member = [];
    getSettingsItems((path) => member.push(path)).forEach((item) => item.action());
    assert.deepEqual(member, ['/profile', '/preferences', '/notifications', '/help-support']);
    member.forEach((path) => assert.ok(isMemberPage(path)));
    const admin = [];
    getSettingsItems((path) => admin.push(path), '/admin').forEach((item) => item.action());
    assert.deepEqual(admin, member.map((path) => `/admin${path}`));
  });

  it('old bookmarks keep meal actions, plan parameters and fragments', () => {
    for (const { path } of memberRoutes.filter(({ path }) => path !== '/dashboard')) {
      const destination = legacyMemberDestination({
        pathname: `/dashboard${path}`, search: '?scan=1&planId=42&startDay=2', hash: '#details',
      });
      assert.deepEqual(destination, {
        pathname: path, search: '?scan=1&planId=42&startDay=2', hash: '#details',
      });
      assert.ok(isMemberPage(destination.pathname));
    }
    assert.equal(legacyMemberDestination({ pathname: '/dashboard/messenger' }).pathname, '/community/messages');
    assert.equal(legacyMemberDestination({ pathname: '/messenger' }).pathname, '/community/messages');
    assert.equal(legacyMemberDestination({ pathname: '/dashboard/bmi' }).pathname, '/profile');
    assert.equal(legacyMemberDestination({ pathname: '/dashboard/virtual-clinic' }).pathname, '/dashboard');
    assert.equal(legacyMemberDestination({ pathname: '/Dashboard/Meal-Tracker/' }).pathname, '/meal-tracker');
  });

  it('unknown, API and admin URLs are not redirected into member pages', () => {
    for (const pathname of ['/dashboard/missing', '/dashboard/plans/unknown', '/api/dashboard/1', '/admin/profile', '/meal-tracker']) {
      assert.equal(legacyMemberDestination({ pathname }), null);
    }
  });
});
