#!/usr/bin/env node
/* Builds the subscribable fixture calendars from fixtures.json.
   Run from the repo root whenever fixtures.json changes, then commit
   the files it writes:

     node scripts/buildcalendars.js

   Output: calendars/rathmines<division>fixtures.ics, one per division
   with confirmed, dated fixtures. Each event is 90 minutes, Europe/Dublin.
   The home page links to these as webcal:// (Apple, Outlook) and via
   Google Calendar's "add by URL". Same event UIDs as the per-row links on
   the page, so a subscriber and a one-off importer never get duplicates. */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "fixtures.json"), "utf8"));
const outDir = path.join(root, "calendars");
fs.mkdirSync(outDir, { recursive: true });

const TZ = [
  "BEGIN:VTIMEZONE", "TZID:Europe/Dublin",
  "BEGIN:STANDARD", "DTSTART:19701025T020000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "TZOFFSETFROM:+0100", "TZOFFSETTO:+0000", "END:STANDARD",
  "BEGIN:DAYLIGHT", "DTSTART:19700329T010000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "TZOFFSETFROM:+0000", "TZOFFSETTO:+0100", "END:DAYLIGHT",
  "END:VTIMEZONE"
].join("\r\n");

const esc = (t) => String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const stamp = (iso, time) => iso.replace(/-/g, "") + "T" + time.replace(":", "") + "00";
const two = (n) => (n < 10 ? "0" : "") + n;
function plus(iso, time, minutes) {
  const [y, m, d] = iso.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, h, mi + minutes));
  return dt.getUTCFullYear() + two(dt.getUTCMonth() + 1) + two(dt.getUTCDate()) +
    "T" + two(dt.getUTCHours()) + two(dt.getUTCMinutes()) + "00";
}
const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");

function event(f, label) {
  if (f.status !== "confirmed" || !f.date || !/^\d{2}:\d{2}$/.test(f.time || "")) return null;
  const home = f.home === true;
  const title = home ? `Rathmines BC v ${f.opponent}` : `${f.opponent} v Rathmines BC`;
  const uid = "rbc-" + f.date + "-" + String(f.opponent).toLowerCase().replace(/[^a-z0-9]+/g, "-") + "@rathminesbc.ie";
  return [
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" + now,
    "DTSTART;TZID=Europe/Dublin:" + stamp(f.date, f.time),
    "DTEND;TZID=Europe/Dublin:" + plus(f.date, f.time, 90),
    "SUMMARY:" + esc(`${title} (${label})`),
    "LOCATION:" + esc(f.venueAddress || f.venue || ""),
    "DESCRIPTION:" + esc(`${home ? "Home" : "Away"} game, ${label}.` + (f.mapUrl ? ` Map: ${f.mapUrl}` : "")),
    "END:VEVENT"
  ].join("\r\n");
}

for (const div of data.divisions || []) {
  const events = (div.fixtures || []).map((f) => event(f, div.label || "")).filter(Boolean);
  if (!events.length) continue;
  const name = "rathmines" + String(div.id).replace(/[^a-z0-9]/g, "") + "fixtures.ics";
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "PRODID:-//Rathmines Basketball Club//Fixtures//EN",
    "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:Rathmines BC " + (div.label || div.id),
    "X-WR-TIMEZONE:Europe/Dublin",
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    TZ, events.join("\r\n"), "END:VCALENDAR", ""
  ].join("\r\n");
  fs.writeFileSync(path.join(outDir, name), body);
  console.log(name + ": " + events.length + " events");
}
