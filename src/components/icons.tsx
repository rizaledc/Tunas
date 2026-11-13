import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Set ikon SAHABAT ANAK, digambar khusus untuk proyek ini.
 * Grid 24×24, garis 1.75 px dengan ujung membulat, dan aksen duotone
 * (isian currentColor transparan) agar terasa lembut dan ramah anak.
 */

const D = 0.16; // opasitas aksen duotone

const s = (d: string) => <path d={d} />;
const duo = (d: string) => <path d={d} fill="currentColor" fillOpacity={D} stroke="none" />;
const dot = (cx: number, cy: number, r = 1) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;
const ring = (cx: number, cy: number, r: number) => <circle cx={cx} cy={cy} r={r} />;
const disc = (cx: number, cy: number, r: number) => <circle cx={cx} cy={cy} r={r} fill="currentColor" fillOpacity={D} stroke="none" />;

const ICONS = {
  // ---------- navigasi & UI ----------
  home: [duo("M5 10.6 12 4.7l7 5.9V20H5z"), s("M3 11.5 12 4l9 7.5"), s("M5 10.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8.5"), s("M10 20v-5h4v5")],
  list: [duo("M6 6.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"), s("M8 4.5h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z"), s("M9.5 3.5h5v2.5h-5z"), s("M9 10h6M9 13.5h6M9 17h3.5")],
  plus: [s("M12 5v14M5 12h14")],
  sun: [disc(12, 12, 4), ring(12, 12, 4), s("M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4")],
  coin: [disc(12, 12, 8.5), ring(12, 12, 8.5), ring(12, 12, 5.5), s("M12 9.2v5.6M10.4 10.6 12 9.2l1.6 1.4")],
  chart: [duo("M10.5 7h3v13h-3zM17 4h3v16h-3zM4 12h3v8H4z"), <rect key="a" x="4" y="12" width="3" height="8" rx="1" />, <rect key="b" x="10.5" y="7" width="3" height="13" rx="1" />, <rect key="c" x="17" y="4" width="3" height="16" rx="1" />],
  user: [disc(12, 8, 3.5), ring(12, 8, 3.5), s("M5 20a7 7 0 0 1 14 0")],
  users: [disc(9, 8, 3), ring(9, 8, 3), s("M3.5 19.5a5.5 5.5 0 0 1 11 0"), s("M15 5.2a3 3 0 0 1 0 5.6"), s("M17 14.2a5.5 5.5 0 0 1 3.5 5.3")],
  menu: [s("M4 7h16M4 12h16M4 17h10")],
  close: [s("M6 6l12 12M18 6 6 18")],
  check: [s("M5 12.5 9.5 17 19 7.5")],
  "check-circle": [disc(12, 12, 8.5), ring(12, 12, 8.5), s("m8.5 12.2 2.4 2.4 4.6-4.8")],
  "chevron-right": [s("m9.5 6 6 6-6 6")],
  "chevron-left": [s("m14.5 6-6 6 6 6")],
  "chevron-down": [s("m6 9.5 6 6 6-6")],
  "arrow-right": [s("M5 12h14M13 6l6 6-6 6")],
  "arrow-left": [s("M19 12H5M11 6l-6 6 6 6")],
  grid: [duo("M4 4h7v7H4zM13 13h7v7h-7z"), <rect key="a" x="4" y="4" width="7" height="7" rx="2" />, <rect key="b" x="13" y="4" width="7" height="7" rx="2" />, <rect key="c" x="4" y="13" width="7" height="7" rx="2" />, <rect key="d" x="13" y="13" width="7" height="7" rx="2" />],
  search: [ring(11, 11, 6), s("m15.5 15.5 4.5 4.5")],
  lock: [duo("M5 12.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"), <rect key="a" x="5" y="10.5" width="14" height="10" rx="2" />, s("M8 10.5V8a4 4 0 0 1 8 0v2.5"), s("M12 14.5v2")],
  shield: [duo("M12 3.5 19 6.3v5.2c0 4.5-3 7.9-7 9-4-1.1-7-4.5-7-9V6.3z"), s("M12 3.5 19 6.3v5.2c0 4.5-3 7.9-7 9-4-1.1-7-4.5-7-9V6.3z"), s("m9 12 2.2 2.2L15.5 10")],
  eye: [duo("M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"), s("M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"), ring(12, 12, 3)],
  info: [disc(12, 12, 8.5), ring(12, 12, 8.5), s("M12 11v5"), dot(12, 8, 1.1)],
  warning: [duo("M10.3 4.6a2 2 0 0 1 3.4 0l7 12.2A2 2 0 0 1 19 19.8H5a2 2 0 0 1-1.7-3z"), s("M10.3 4.6a2 2 0 0 1 3.4 0l7 12.2A2 2 0 0 1 19 19.8H5a2 2 0 0 1-1.7-3z"), s("M12 9.5v4"), dot(12, 16.5, 1.1)],
  ban: [ring(12, 12, 8.5), s("m6 6 12 12")],
  settings: [s("M4 7h8.5M17.5 7H20M4 12h2.5M11.5 12H20M4 17h10.5M19.5 17h.5"), disc(15, 7, 2.3), ring(15, 7, 2.3), disc(9, 12, 2.3), ring(9, 12, 2.3), disc(17, 17, 2.3), ring(17, 17, 2.3)],
  logout: [s("M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4"), s("m10 8-4 4 4 4"), s("M6 12h9")],
  trash: [s("M4.5 7h15M9.5 7V4.5h5V7"), duo("m6.5 7 1 13h9l1-13z"), s("m6.5 7 1 13h9l1-13"), s("M10.5 10.5v6M13.5 10.5v6")],
  download: [s("M12 4v10M8 10l4 4 4-4"), s("M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3")],
  upload: [s("M12 15V5M8 9l4-4 4 4"), s("M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3")],
  share: [disc(18, 5.5, 2.5), ring(18, 5.5, 2.5), disc(6, 12, 2.5), ring(6, 12, 2.5), disc(18, 18.5, 2.5), ring(18, 18.5, 2.5), s("m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1")],
  send: [duo("M20.5 3.5 3.5 10.6l6.7 2.7 2.7 6.7z"), s("M20.5 3.5 3.5 10.6l6.7 2.7 2.7 6.7z"), s("m10.2 13.3 4.6-4.6")],
  copy: [duo("M9 9h9.5a1.5 1.5 0 0 1 1.5 1.5V20a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 20v-9.5A1.5 1.5 0 0 1 9 9z"), <rect key="a" x="7.5" y="9" width="12.5" height="12.5" rx="1.5" />, s("M16.5 9V5a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 0 4 5v9.5A1.5 1.5 0 0 0 5.5 16h2")],
  link: [s("M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"), s("M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1")],
  printer: [s("M7 9V4h10v5"), duo("M4 11a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5H4z"), <rect key="a" x="4" y="9" width="16" height="7" rx="2" />, <rect key="b" x="7" y="14" width="10" height="6" rx="1" />, dot(16.5, 12, 0.9)],
  refresh: [s("M19.5 12a7.5 7.5 0 0 1-13.1 5M4.5 12a7.5 7.5 0 0 1 13.1-5"), s("M17.6 3.5V7h-3.5M6.4 20.5V17h3.5")],
  pencil: [duo("M15.5 4.5l4 4L8.5 19.5 4 20l.5-4.5z"), s("M15.5 4.5l4 4L8.5 19.5 4 20l.5-4.5z"), s("m13.5 6.5 4 4")],
  note: [duo("M6 3.5h8l4.5 4.5v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"), s("M6 3.5h8l4.5 4.5v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"), s("M14 3.5V8h4.5"), s("M8.5 12.5h7M8.5 16h4.5")],
  file: [s("M6 3.5h8l4.5 4.5v11.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"), s("M14 3.5V8h4.5")],
  receipt: [duo("M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"), s("M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"), s("M9 8h6M9 11.5h6M9 15h3.5")],
  "clipboard-check": [duo("M6 6.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"), s("M8 4.5h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2z"), s("M9.5 3.5h5v2.5h-5z"), s("m9 13 2 2 4-4.2")],
  image: [duo("M4 17l4.5-4.5 3.5 3.5 3-3 5 5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"), <rect key="a" x="3.5" y="4.5" width="17" height="15" rx="2.5" />, ring(9, 9.5, 1.8), s("m4 17 4.5-4.5 3.5 3.5 3-3 5 5")],
  camera: [duo("M3.5 9.5A2.5 2.5 0 0 1 6 7h12a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5z"), <rect key="a" x="3.5" y="7" width="17" height="12" rx="2.5" />, s("m8.5 7 1.2-2.2h4.6L15.5 7"), ring(12, 13, 3.3)],
  mail: [duo("M3.5 8a2.5 2.5 0 0 1 2.5-2.5h12A2.5 2.5 0 0 1 20.5 8v8a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 16z"), <rect key="a" x="3.5" y="5.5" width="17" height="13" rx="2.5" />, s("m4 7.5 8 6 8-6")],
  pin: [duo("M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"), s("M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"), ring(12, 10, 2.4)],
  chat: [duo("M20 11.5c0 4-3.6 7-8 7-1.2 0-2.3-.2-3.3-.6L4.5 19.5l1.2-3.4C4.6 14.8 4 13.2 4 11.5c0-4 3.6-7 8-7s8 3 8 7z"), s("M20 11.5c0 4-3.6 7-8 7-1.2 0-2.3-.2-3.3-.6L4.5 19.5l1.2-3.4C4.6 14.8 4 13.2 4 11.5c0-4 3.6-7 8-7s8 3 8 7z"), dot(8.5, 11.5, 0.9), dot(12, 11.5, 0.9), dot(15.5, 11.5, 0.9)],
  bell: [duo("M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"), s("M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"), s("M10 20.5a2 2 0 0 0 4 0")],
  calendar: [duo("M4 10h16v7.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"), <rect key="a" x="4" y="5.5" width="16" height="14.5" rx="2.5" />, s("M4 10h16M8.5 3.5v4M15.5 3.5v4"), dot(8.5, 14, 0.9), dot(12, 14, 0.9), dot(15.5, 14, 0.9)],
  "calendar-check": [duo("M4 10h16v7.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z"), <rect key="a" x="4" y="5.5" width="16" height="14.5" rx="2.5" />, s("M4 10h16M8.5 3.5v4M15.5 3.5v4"), s("m9.5 15 1.8 1.8 3.4-3.6")],
  clock: [disc(12, 13, 7.5), ring(12, 13, 7.5), s("M12 9.5V13l2.5 1.5"), s("M10 3h4")],
  alarm: [disc(12, 13, 7), ring(12, 13, 7), s("M12 10v3.2l2 1.3"), s("m4 5.5 2.5-2M20 5.5l-2.5-2")],
  "time-15": [ring(12, 12, 8), <path key="w" d="M12 12V4a8 8 0 0 1 8 8z" fill="currentColor" fillOpacity={0.35} stroke="none" />, s("M12 12V4M12 12h8")],
  "time-30": [ring(12, 12, 8), <path key="w" d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" fillOpacity={0.35} stroke="none" />, s("M12 4v16")],
  "time-60": [<circle key="w" cx={12} cy={12} r={8} fill="currentColor" fillOpacity={0.35} stroke="none" />, ring(12, 12, 8), dot(12, 12, 1.2)],
  moon: [duo("M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"), s("M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z")],
  sleep: [duo("M17 15.5A7 7 0 0 1 8.5 7a7 7 0 1 0 8.5 8.5z"), s("M17 15.5A7 7 0 0 1 8.5 7a7 7 0 1 0 8.5 8.5z"), s("M14.5 4h4l-4 4.5h4")],
  hash: [s("M9.5 4 8 20M16 4l-1.5 16M4.5 9h15.5M4 15h15.5")],
  cash: [duo("M3 8.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"), <rect key="a" x="3" y="6.5" width="18" height="11" rx="2" />, ring(12, 12, 2.5), dot(6.5, 9.5, 0.9), dot(17.5, 14.5, 0.9)],
  wallet: [duo("M4 10a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 10v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17z"), s("M4 7.5A2.5 2.5 0 0 1 6.5 5H17v2.5"), <rect key="a" x="4" y="7.5" width="16" height="12" rx="2.5" />, s("M20 11.5h-3.5a2 2 0 0 0 0 4H20"), dot(16.5, 13.5, 0.9)],
  flask: [duo("M10 9 4.8 18a1.8 1.8 0 0 0 1.6 2.5h11.2a1.8 1.8 0 0 0 1.6-2.5L14 9z"), s("M9.5 3.5h5M10 3.5V9L4.8 18a1.8 1.8 0 0 0 1.6 2.5h11.2a1.8 1.8 0 0 0 1.6-2.5L14 9V3.5"), s("M7.5 14.5h9")],
  target: [ring(12, 12, 8.5), disc(12, 12, 5), ring(12, 12, 5), dot(12, 12, 1.6)],
  thumbsUp: [duo("M7.5 10.5h-2.5a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h2.5z"), s("M7.5 10.5V20H5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1z"), s("m7.5 10.5 3.6-6.3a1.6 1.6 0 0 1 3 .9l-.6 4.4h4.9a2 2 0 0 1 2 2.3l-1.1 6.5a2 2 0 0 1-2 1.7H7.5")],
  thumbsDown: [<g key="r" transform="rotate(180 12 12)">{[duo("M7.5 10.5h-2.5a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h2.5z"), s("M7.5 10.5V20H5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1z"), s("m7.5 10.5 3.6-6.3a1.6 1.6 0 0 1 3 .9l-.6 4.4h4.9a2 2 0 0 1 2 2.3l-1.1 6.5a2 2 0 0 1-2 1.7H7.5")].map((c, k) => <g key={k}>{c}</g>)}</g>],

  // ---------- konsep aplikasi ----------
  sprout: [duo("M12 12c-4.5 0-7-2.5-7-6.5 4.5 0 7 2.5 7 6.5zM12 10c0-4 2.5-6.5 7-6.5 0 4-2.5 6.5-7 6.5z"), s("M12 20v-9"), s("M12 12c-4.5 0-7-2.5-7-6.5 4.5 0 7 2.5 7 6.5z"), s("M12 10c0-4 2.5-6.5 7-6.5 0 4-2.5 6.5-7 6.5z"), s("M8 20h8")],
  leaf: [duo("M19 4.5C10 4.5 4.5 9.5 4.5 16.5c0 1.3.3 2.4.8 3 .6.4 1.6.5 2.7.5 7 0 11-6 11-15.5z"), s("M19 4.5C10 4.5 4.5 9.5 4.5 16.5c0 1.3.3 2.4.8 3 .6.4 1.6.5 2.7.5 7 0 11-6 11-15.5z"), s("M5.3 19.5 14 10.5")],
  device: [duo("M7 5.5A2.5 2.5 0 0 1 9.5 3h5A2.5 2.5 0 0 1 17 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 18.5z"), <rect key="a" x="7" y="3" width="10" height="18" rx="2.5" />, s("M11 17.5h2")],
  sparkle: [duo("M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"), s("M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"), s("M18.5 15.5c.2 1.4.9 2.1 2.3 2.3-1.4.2-2.1.9-2.3 2.3-.2-1.4-.9-2.1-2.3-2.3 1.4-.2 2.1-.9 2.3-2.3z")],
  star: [duo("m12 3.8 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.6l-5 2.6.9-5.6-4-3.9 5.6-.8z"), s("m12 3.8 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.6l-5 2.6.9-5.6-4-3.9 5.6-.8z")],
  "star-solid": [<path key="a" d="m12 3.8 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.6l-5 2.6.9-5.6-4-3.9 5.6-.8z" fill="currentColor" />],
  agreement: [duo("M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"), <rect key="a" x="5" y="3.5" width="14" height="17" rx="2" />, s("M8.5 8h7M8.5 11.5h7"), s("M8.5 16.5c1-1.5 2-1.5 2.5 0s1.5 1.5 2.5 0 1.5-1 2 0")],
  scale: [s("M12 4v16M8 20h8M5 7h14"), duo("m5 7-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z"), s("m5 7-2.5 6h5zM19 7l-2.5 6h5z"), s("M2.5 13a2.5 2.5 0 0 0 5 0M16.5 13a2.5 2.5 0 0 0 5 0"), dot(12, 4, 1.2)],
  bulb: [duo("M12 3.5a5.5 5.5 0 0 0-3.3 9.9c.5.4.8 1 .8 1.6v.5h5V15c0-.6.3-1.2.8-1.6A5.5 5.5 0 0 0 12 3.5z"), s("M12 3.5a5.5 5.5 0 0 0-3.3 9.9c.5.4.8 1 .8 1.6v.5h5V15c0-.6.3-1.2.8-1.6A5.5 5.5 0 0 0 12 3.5z"), s("M9.5 18h5M10.5 20.5h3")],
  heart: [duo("M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"), s("M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z")],
  hand: [duo("M8 13V6.5a1.5 1.5 0 0 1 3 0V5a1.5 1.5 0 0 1 3 0v1.5a1.5 1.5 0 0 1 3 0V14c0 3.6-2.4 6.5-6 6.5-2.3 0-3.8-1-5-2.8L4.3 15a1.5 1.5 0 0 1 2.4-1.8L8 15z"), s("M8 15V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 3.6-2.4 6.5-6 6.5-2.3 0-3.8-1-5-2.8L4.3 15a1.5 1.5 0 0 1 2.4-1.8L8 15")],
  child: [disc(12, 7, 3), ring(12, 7, 3), s("M10.6 4.3c.8.7 2 .8 2.9.2"), s("M7 20.5v-2.5a5 5 0 0 1 10 0v2.5"), s("M9.5 20.5V18M14.5 20.5V18")],
  family: [disc(8, 6.5, 2.2), ring(8, 6.5, 2.2), disc(16, 6.5, 2.2), ring(16, 6.5, 2.2), ring(12, 12.8, 1.7), s("M4 20v-4.5a4 4 0 0 1 6.3-3.3M20 20v-4.5a4 4 0 0 0-6.3-3.3M9.5 20v-1.5a2.5 2.5 0 0 1 5 0V20")],
  community: [duo("M5 20v-7l4-3.5 4 3.5v7zM13 20v-9l3.5-3 3.5 3v9z"), s("M3 20h18M5 20v-7l4-3.5 4 3.5v7M13 20v-9l3.5-3 3.5 3v9"), s("M8 20v-3h2v3M16 13.5h1")],
  celebrate: [duo("m4 20 4.5-11 6.5 6.5z"), s("m4 20 4.5-11 6.5 6.5z"), s("M14 3.5v2.5M20.5 10H18M18.5 5.5 17 7M13 10c1-1.5 2.5-2 4-1.5"), dot(20, 15, 0.9), dot(10, 4.5, 0.9)],
  megaphone: [duo("M4 10a1 1 0 0 1 1-1h2l6-4v14l-6-4H5a1 1 0 0 1-1-1z"), s("M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1z"), s("M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11")],
  "wifi-off": [s("M2.5 8.5a14 14 0 0 1 19 0M5.5 12a9.5 9.5 0 0 1 13 0M8.5 15.5a5 5 0 0 1 7 0"), dot(12, 19, 1.2), s("m3.5 3.5 17 17")],
  balloon: [duo("M12 3.5c-3.3 0-6 2.7-6 6.2 0 3.6 3 6.3 6 6.3s6-2.7 6-6.3c0-3.5-2.7-6.2-6-6.2z"), s("M12 3.5c-3.3 0-6 2.7-6 6.2 0 3.6 3 6.3 6 6.3s6-2.7 6-6.3c0-3.5-2.7-6.2-6-6.2z"), s("m11 16-.5 1.5h3L13 16M12 17.5c0 2-2 1.5-2 3.5"), s("M9 8a3 3 0 0 1 2.5-2")],
  quote: [duo("M5 11.5h4.5V17H5zM14.5 11.5H19V17h-4.5z"), s("M5 17v-5.5C5 8.5 6.5 6.5 9.5 6M14.5 17v-5.5c0-3 1.5-5 4.5-5.5"), s("M5 11.5h4.5V17H5zM14.5 11.5H19V17h-4.5z")],

  // ---------- suasana hati ----------
  "face-happy": [disc(12, 12, 8.5), ring(12, 12, 8.5), dot(9.3, 10, 1), dot(14.7, 10, 1), <path key="m" d="M8 13.5h8a4 4 0 0 1-8 0z" fill="currentColor" fillOpacity={0.35} />],
  "face-smile": [disc(12, 12, 8.5), ring(12, 12, 8.5), dot(9.3, 10, 1), dot(14.7, 10, 1), s("M8.8 14a4 4 0 0 0 6.4 0")],
  "face-neutral": [disc(12, 12, 8.5), ring(12, 12, 8.5), dot(9.3, 10, 1), dot(14.7, 10, 1), s("M9 14.8h6")],
  "face-sad": [disc(12, 12, 8.5), ring(12, 12, 8.5), dot(9.3, 10.2, 1), dot(14.7, 10.2, 1), s("M8.8 16a4 4 0 0 1 6.4 0")],
  "face-angry": [disc(12, 12, 8.5), ring(12, 12, 8.5), s("m7.8 8.5 3 1.3M16.2 8.5l-3 1.3"), dot(9.5, 11, 1), dot(14.5, 11, 1), s("M9 16a4 4 0 0 1 6 0")],

  // ---------- lencana ----------
  flame: [duo("M12 21c3.6 0 6-2.5 6-6 0-4-3-6-4-9.5-1 2.5-2.5 3.5-3.5 3.5 0-1.2-.3-2.3-1-3C8 8 6 11 6 15c0 3.5 2.4 6 6 6z"), s("M12 21c3.6 0 6-2.5 6-6 0-4-3-6-4-9.5-1 2.5-2.5 3.5-3.5 3.5 0-1.2-.3-2.3-1-3C8 8 6 11 6 15c0 3.5 2.4 6 6 6z"), s("M12 21c-1.7 0-3-1.2-3-3 0-1.9 1.5-3 3-5 1.5 2 3 3.1 3 5 0 1.8-1.3 3-3 3z")],
  compass: [disc(12, 12, 8.5), ring(12, 12, 8.5), <path key="n" d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" fillOpacity={0.35} />, s("m15.5 8.5-2 5-5 2 2-5z")],
  trophy: [duo("M8 4.5h8v5a4 4 0 0 1-8 0z"), s("M8 4.5h8v5a4 4 0 0 1-8 0z"), s("M8 6.5H5.5a2.5 2.5 0 0 0 2.6 3.4M16 6.5h2.5a2.5 2.5 0 0 1-2.6 3.4M12 13.5V17M8.5 20.5h7M10 17h4v3.5h-4z")],
  rocket: [duo("M14.5 4.5c2.5-1 4.5-1 5 0 1 .5 1 2.5 0 5L13 16l-5-5z"), s("M14.5 4.5c2.5-1 4.5-1 5 0 1 .5 1 2.5 0 5L13 16l-5-5z"), s("m8 11-3.5.5L3 14l4 .5M13 16l-.5 3.5L10 21l-.5-4"), ring(15.5, 8.5, 1.4), s("M6.5 17.5 5 19")],
  medal: [disc(12, 15, 5), ring(12, 15, 5), s("m8.5 3.5 2 6.2M15.5 3.5l-2 6.2M8 3.5h8"), s("m12 12.8.8 1.5 1.6.2-1.2 1.1.3 1.6-1.5-.8-1.5.8.3-1.6-1.2-1.1 1.6-.2z")],

  // ---------- kategori aktivitas ----------
  book: [duo("M5 5.5A2 2 0 0 1 7 3.5h12v14H7a2 2 0 0 0-2 2z"), s("M5 19.5v-14a2 2 0 0 1 2-2h12v14H7a2 2 0 0 0-2 2zM5 19.5a2 2 0 0 0 2 2h12v-4"), s("M9 7.5h6")],
  "book-open": [duo("M12 7c-2-1.7-4.5-2.5-8-2.5v13c3.5 0 6 .8 8 2.5z"), s("M12 7c-2-1.7-4.5-2.5-8-2.5v13c3.5 0 6 .8 8 2.5 2-1.7 4.5-2.5 8-2.5v-13c-3.5 0-6 .8-8 2.5z"), s("M12 7v13")],
  video: [duo("M3.5 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3z"), <rect key="a" x="3.5" y="5" width="17" height="14" rx="3" />, <path key="p" d="M10.5 9.3v5.4l4.5-2.7z" fill="currentColor" stroke="currentColor" />],
  gamepad: [duo("M7.5 8h9a4.5 4.5 0 0 1 4.3 5.8l-1 3.3a2.4 2.4 0 0 1-4 1l-1.8-2H10l-1.8 2a2.4 2.4 0 0 1-4-1l-1-3.3A4.5 4.5 0 0 1 7.5 8z"), s("M7.5 8h9a4.5 4.5 0 0 1 4.3 5.8l-1 3.3a2.4 2.4 0 0 1-4 1l-1.8-2H10l-1.8 2a2.4 2.4 0 0 1-4-1l-1-3.3A4.5 4.5 0 0 1 7.5 8z"), s("M8 11v3M6.5 12.5h3"), dot(15.3, 11.6, 1), dot(17, 13.6, 1)],
  chats: [duo("M15.5 9.5c0 3-2.7 5.3-6 5.3-.8 0-1.6-.1-2.3-.4L4 15.5l.9-2.6C4.3 12 4 10.8 4 9.5c0-3 2.6-5.3 5.8-5.3S15.5 6.5 15.5 9.5z"), s("M15.5 9.5c0 3-2.7 5.3-6 5.3-.8 0-1.6-.1-2.3-.4L4 15.5l.9-2.6C4.3 12 4 10.8 4 9.5c0-3 2.6-5.3 5.8-5.3S15.5 6.5 15.5 9.5z"), s("M10.5 17.3c1 .8 2.3 1.2 3.7 1.2.8 0 1.6-.1 2.3-.4l3.2 1.1-.9-2.6c.6-.9.9-2 .9-3.2 0-1.8-.9-3.4-2.3-4.4")],
  "phone-call": [duo("M6.6 3.5h2.6l1.6 4-2 1.3a11 11 0 0 0 6.4 6.4l1.3-2 4 1.6v2.6a2 2 0 0 1-2.1 2C10.9 19 5 13.1 4.6 5.6a2 2 0 0 1 2-2.1z"), s("M6.6 3.5h2.6l1.6 4-2 1.3a11 11 0 0 0 6.4 6.4l1.3-2 4 1.6v2.6a2 2 0 0 1-2.1 2C10.9 19 5 13.1 4.6 5.6a2 2 0 0 1 2-2.1z")],
  palette: [duo("M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.7-.8 1.7-1.6 0-1.3-1.2-1.7-1.2-2.9 0-.9.8-1.5 1.7-1.5h2.3c2.3 0 4-1.7 4-4 0-3.9-3.8-7-8.5-7z"), s("M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.7-.8 1.7-1.6 0-1.3-1.2-1.7-1.2-2.9 0-.9.8-1.5 1.7-1.5h2.3c2.3 0 4-1.7 4-4 0-3.9-3.8-7-8.5-7z"), dot(7.8, 12, 1.2), dot(9.5, 7.8, 1.2), dot(14.3, 7.5, 1.2)],
  school: [duo("M5 10.5h14V20H5z"), s("M3 10.5 12 5l9 5.5"), s("M5 10.5V20h14v-9.5"), s("M10 20v-4.5h4V20"), s("M8 13h.01M16 13h.01")],
  utensils: [s("M7 3.5v17"), s("M4.5 3.5v4.5a2.5 2.5 0 0 0 5 0V3.5"), duo("M16.5 3.5c-1.9 1-3 3.3-3 6v3.5h3v7.5"), s("M16.5 3.5c-1.9 1-3 3.3-3 6v3.5h3"), s("M16.5 3.5v17")],
  bus: [duo("M5 5.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2V17H5z"), s("M7 3.5h10a2 2 0 0 1 2 2V17H5V5.5a2 2 0 0 1 2-2z"), s("M5 11h14"), s("M7.5 17v2.5M16.5 17v2.5"), dot(8.5, 14), dot(15.5, 14)],
  more: [disc(12, 12, 8.5), ring(12, 12, 8.5), dot(8, 12, 1.2), dot(12, 12, 1.2), dot(16, 12, 1.2)],
  fish: [duo("M7 12c2-3.3 5-5 8.2-5 2.6 0 4.6 1.7 5.8 5-1.2 3.3-3.2 5-5.8 5-3.2 0-6.2-1.7-8.2-5z"), s("M7 12c2-3.3 5-5 8.2-5 2.6 0 4.6 1.7 5.8 5-1.2 3.3-3.2 5-5.8 5-3.2 0-6.2-1.7-8.2-5z"), s("M7 12 3 8.5v7z"), s("M12.5 9.5c.8 1.6.8 3.4 0 5"), dot(17, 10.8, 1)],
  ball: [ring(12, 12, 8.5), duo("m12 8.5 3 2.2-1.1 3.5h-3.8L9 10.7z"), s("m12 8.5 3 2.2-1.1 3.5h-3.8L9 10.7z"), s("M12 8.5V3.6M15 10.7l4.5-1.5M13.9 14.2l2.7 3.9M10.1 14.2l-2.7 3.9M9 10.7 4.5 9.2")],
  broom: [s("m16.5 3-4 7.5"), duo("m8 10 8 3.5-3 7.5-8.5-3.5z"), s("m8 10 8 3.5-3 7.5-8.5-3.5z"), s("m7.5 18.3 1.4-3.2M10.5 19.6l1.4-3.2")],
  mosque: [duo("M6 20v-7.5a6 6 0 0 1 12 0V20z"), s("M6 20v-7.5a6 6 0 0 1 12 0V20M4 20h16M12 4v2.5"), s("M10 20v-3a2 2 0 0 1 4 0v3"), dot(12, 3.5, 1)],
  pencil2: [duo("M15.5 4.5l4 4L8.5 19.5 4 20l.5-4.5z"), s("M15.5 4.5l4 4L8.5 19.5 4 20l.5-4.5z"), s("m13.5 6.5 4 4M4.5 15.5l4 4")],
} satisfies Record<string, ReactNode[]>;

export type IconName = keyof typeof ICONS;

export function isIconName(v: string | null | undefined): v is IconName {
  return !!v && v in ICONS;
}

export function Icon({ name, className, strokeWidth = 1.75, title, ...rest }: { name: IconName; className?: string; strokeWidth?: number; title?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block h-5 w-5 shrink-0", className)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...rest}
    >
      {title && <title>{title}</title>}
      {ICONS[name].map((c, i) => (
        <g key={i}>{c}</g>
      ))}
    </svg>
  );
}


/** Ikon pilihan untuk kategori aktivitas (dikelola superadmin). */
export const CATEGORY_ICONS: Array<{ key: IconName; label: string }> = [
  { key: "book", label: "Buku / belajar" },
  { key: "book-open", label: "Membaca" },
  { key: "video", label: "Video / hiburan" },
  { key: "gamepad", label: "Game" },
  { key: "chats", label: "Media sosial" },
  { key: "phone-call", label: "Telepon / komunikasi" },
  { key: "palette", label: "Menggambar" },
  { key: "fish", label: "Merawat lele" },
  { key: "sleep", label: "Tidur" },
  { key: "school", label: "Sekolah" },
  { key: "utensils", label: "Makan & mandi" },
  { key: "bus", label: "Perjalanan" },
  { key: "more", label: "Lainnya" },
  { key: "ball", label: "Olahraga" },
  { key: "broom", label: "Membantu di rumah" },
  { key: "mosque", label: "Ibadah" },
  { key: "family", label: "Keluarga" },
  { key: "pencil2", label: "Menulis / PR" },
  { key: "leaf", label: "Alam / berkebun" },
  { key: "heart", label: "Lainnya" },
  { key: "star", label: "Bintang" },
  { key: "device", label: "Gawai" },
  { key: "sparkle", label: "Kreativitas" },
];

/** Ikon kategori: memakai set SVG; nilai lama (emoji) ditampilkan apa adanya. */
export function CategoryIcon({ icon, className }: { icon: string | null | undefined; className?: string }) {
  if (isIconName(icon)) return <Icon name={icon} className={className} />;
  return <Icon name="heart" className={className} />;
}
