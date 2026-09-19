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

/* DTSTAMP is derived from the fixtures, never from the clock. It used to be
   `new Date()`, which meant every run rewrote all three files with a new
   stamp: the calendars turned up in the diff on any rebuild, whether or not a
   fixture had actually moved, and there was no way to tell the two apart. It
   is now the last dated fixture in the calendar being written, at midnight
   UTC — same fixtures in, same bytes out.

   RFC 5545 wants the object's creation time in this field. Nothing reads it:
   clients decide what has changed from the UID and the event fields, and
   SEQUENCE is what signals a revision. Between a stamp that tracks the build
   machine's clock and one that tracks the data, the data is the more useful.

   The consequence, stated so it is not discovered later: editing a fixture in
   the middle of the season does not move the stamp, only moving the season's
   last dated game does. The event lines carry that change themselves. */
function dtstamp(fixtures) {
  const last = fixtures.map((f) => f.date).filter(Boolean).sort().pop();
  return last.replace(/-/g, "") + "T000000Z";
}

function event(f, label, stampedAt) {
  if (f.status !== "confirmed" || !f.date || !/^\d{2}:\d{2}$/.test(f.time || "")) return null;
  const home = f.home === true;
  const title = home ? `Rathmines BC v ${f.opponent}` : `${f.opponent} v Rathmines BC`;
  const uid = "rbc-" + f.date + "-" + String(f.opponent).toLowerCase().replace(/[^a-z0-9]+/g, "-") + "@rathminesbc.ie";
  return [
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" + stampedAt,
    "DTSTART;TZID=Europe/Dublin:" + stamp(f.date, f.time),
    "DTEND;TZID=Europe/Dublin:" + plus(f.date, f.time, 90),
    "SUMMARY:" + esc(`${title} (${label})`),
    "LOCATION:" + esc(f.venueAddress || f.venue || ""),
    "DESCRIPTION:" + esc(`${home ? "Home" : "Away"} game, ${label}.` + (f.mapUrl ? ` Map: ${f.mapUrl}` : "")),
    "END:VEVENT"
  ].join("\r\n");
}

for (const div of data.divisions || []) {
  /* Filtered before the stamp is taken, so it is the last game that actually
     lands in this file and not the last one in the division. */
  const dated = (div.fixtures || []).filter(
    (f) => f.status === "confirmed" && f.date && /^\d{2}:\d{2}$/.test(f.time || ""));
  if (!dated.length) continue;
  const stampedAt = dtstamp(dated);
  const events = dated.map((f) => event(f, div.label || "", stampedAt)).filter(Boolean);
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
