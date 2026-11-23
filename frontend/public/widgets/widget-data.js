/* VITALIS Windows widgets — data shaping (classic script, no imports).
 * Loaded into the service worker via Workbox importScripts and unit-tested in
 * Node through `vm`. Turns the /api/widgets/summary payload into the flat
 * object the Adaptive Card template binds to. Never invents numbers: missing
 * data becomes the "empty" state, not a sample value.
 */
(function (root) {
  'use strict';

  var pad2 = function (n) { return String(n).padStart(2, '0'); };

  function localTodayIso(now) {
    var d = now instanceof Date ? now : new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function toInt(value) {
    var n = Number(value);
    return isFinite(n) && n > 0 ? Math.round(n) : 0;
  }

  function fmtInt(value) {
    return toInt(value).toLocaleString('en-US');
  }

  function dateLabel(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function timeLabel(now) {
    var d = now instanceof Date ? now : new Date();
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // Shared fields every state needs (the template reads them unconditionally).
  function base(state, now) {
    return {
      state: state,
      title: "Today's Activity",
      updatedLabel: 'Updated ' + timeLabel(now),
      actionTitle: 'Open VITALIS',
      actionVerb: 'open-dashboard',
    };
  }

  /** summary -> template data for the Today's Activity widget. */
  function todayActivity(summary, now) {
    var stats = (summary && summary.stats) || {};
    var steps = toInt(stats.steps);
    var calories = toInt(stats.calories);
    var minutes = toInt(stats.minutes);
    var stepGoal = toInt(summary && summary.stepGoal) || 8000;
    var streak = summary && summary.streak ? toInt(summary.streak.current) : 0;
    var pct = Math.max(0, Math.min(100, Math.round((steps / stepGoal) * 100)));

    var out = base(steps === 0 && calories === 0 && minutes === 0 ? 'empty' : 'ready', now);
    out.dateLabel = dateLabel((summary && summary.today) || localTodayIso(now));
    out.steps = fmtInt(steps);
    out.stepGoal = fmtInt(stepGoal);
    out.pctLabel = pct + '%';
    // Column weights for the progress rail; Adaptive Cards rejects a 0 weight.
    out.pctWeight = Math.max(1, Math.min(99, pct));
    out.restWeight = 100 - out.pctWeight;
    out.calories = fmtInt(calories);
    out.minutes = fmtInt(minutes) + 'm';
    out.streak = streak + (streak === 1 ? ' day' : ' days');
    return out;
  }

  function signedOut(now) {
    var out = base('signedout', now);
    out.actionTitle = 'Sign in';
    out.actionVerb = 'sign-in';
    return out;
  }

  function failed(now) {
    return base('error', now);
  }

  var api = { localTodayIso: localTodayIso, todayActivity: todayActivity, signedOut: signedOut, failed: failed };
  root.VitalisWidgetData = api;
})(typeof self !== 'undefined' ? self : globalThis);
