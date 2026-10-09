#!/usr/bin/env node
/* Checks results.json against itself and against fixtures.json.
   Fails (exit 1) if, for any record:
     - the quarters do not sum to the final, for either team
     - the box score points do not sum to the final, for either team
     - the opponent and date do not match the fixtures.json fixture with
       the same division and round
   Also fails on an unknown division, a duplicate division and round, or a
   malformed record. No dependencies. Run from anywhere:
     node scripts/checkresults.js */

"use strict";

var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var results = JSON.parse(fs.readFileSync(path.join(root, "results.json"), "utf8"));
var fixtures = JSON.parse(fs.readFileSync(path.join(root, "fixtures.json"), "utf8"));

var errors = [];

function sum(list) {
  return list.reduce(function (a, b) { return a + b; }, 0);
}

function isCount(n) {
  return typeof n === "number" && isFinite(n) && n >= 0 && Math.floor(n) === n;
}

var known = {};
(results.divisions || []).forEach(function (d) { known[d.id] = true; });

var fixtureDivisions = {};
(fixtures.divisions || []).forEach(function (d) { fixtureDivisions[d.id] = d; });

var seen = {};

(results.results || []).forEach(function (r, i) {
  var tag = "record " + (i + 1) + " (" + r.division + " round " + r.round + ")";

  function fail(msg) { errors.push(tag + ": " + msg); }

  if (!known[r.division]) {
    fail("division is not listed in results.json divisions");
  }
  var key = r.division + "/" + r.round;
  if (seen[key]) {
    fail("duplicate division and round");
  }
  seen[key] = true;

  var q = r.quarters || {};
  var f = r.final || {};
  var b = r.boxscore || {};

  ["rbc", "opponent"].forEach(function (team) {
    var quarters = q[team];
    if (!Array.isArray(quarters) || quarters.length !== 4 || !quarters.every(isCount)) {
      fail(team + " quarters must be four whole numbers");
    } else if (isCount(f[team]) && sum(quarters) !== f[team]) {
      fail(team + " quarters sum to " + sum(quarters) + ", final is " + f[team]);
    }

    if (!isCount(f[team])) {
      fail(team + " final must be a whole number");
    }

    var rows = b[team];
    if (!Array.isArray(rows) || !rows.length || !rows.every(function (p) { return isCount(p.pts) && isCount(p.kit); })) {
      fail(team + " box score must be rows of kit and pts");
    } else {
      if (isCount(f[team]) && sum(rows.map(function (p) { return p.pts; })) !== f[team]) {
        fail(team + " box score sums to " + sum(rows.map(function (p) { return p.pts; })) + ", final is " + f[team]);
      }
      if (team === "opponent" && rows.some(function (p) { return "player" in p || "name" in p; })) {
        fail("opponent box score must not carry names");
      }
      if (team === "rbc" && rows.some(function (p) { return !p.player; })) {
        fail("rbc box score rows need a player name");
      }
    }
  });

  var div = fixtureDivisions[r.division];
  var fx = div && (div.fixtures || []).filter(function (x) { return x.round === r.round; })[0];
  if (!fx) {
    fail("no fixtures.json fixture for this division and round");
  } else {
    if (fx.opponent !== r.opponent) {
      fail("opponent \"" + r.opponent + "\" does not match fixture \"" + fx.opponent + "\"");
    }
    if (fx.date !== r.date) {
      fail("date " + r.date + " does not match fixture date " + fx.date);
    }
    if (fx.home !== r.home) {
      fail("home is " + r.home + " but the fixture says " + fx.home);
    }
  }
});

if (errors.length) {
  errors.forEach(function (e) { console.error("FAIL " + e); });
  process.exit(1);
}
console.log("OK: " + (results.results || []).length + " result record(s) checked.");
