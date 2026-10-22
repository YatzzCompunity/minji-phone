'use strict';
/* ============================================================
   Minji's iPhone — glue.js
   Bagian yang di situs asli hidup di skrip inline index.html:
   daftar bahasa + setLang, CHAT_TIMES, dan pesan INCOMING.
   (t / fmt* / dn / LANG asli ada di i18n.js — file orisinal.
   LANG dibaca i18n.js dari window.LANG; setLang di sini hanya
   menyimpan pilihan ke localStorage lalu reload.)
   ============================================================ */

/* ---------- Bahasa: 7 bahasa sesuai i18n.js asli ---------- */
/* app.js membaca window.LANGS secara eksplisit, jadi harus properti window
   (const/var global biasa tidak cukup untuk akses window.LANGS di semua jalur). */
window.LANGS = [['ko', '한국어'], ['en', 'English'], ['ja', '日本語'], ['zh', '中文'], ['vi', 'Tiếng Việt'], ['th', 'ไทย'], ['id', 'Bahasa Indonesia']];
const LANGS = window.LANGS;
function setLang(code) {
  try { localStorage.setItem('wb-lang', code); } catch (e) {}
  try { location.reload(); } catch (e) {}
}

/* ============================================================
   CHAT_TIMES — chatData asli tidak punya jam per pesan, jadi
   dibuat programatis & deterministik: tiap baris 'date' mereset
   jam ke blok pagi/sore, tiap pesan maju 1–6 menit.
   Indeks selaras dengan indeks chatData[nama] (termasuk baris date).
   ============================================================ */
const CHAT_TIMES = {};
(function buildChatTimes() {
  if (typeof chatData === 'undefined') return;
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  Object.keys(chatData).forEach(function (name) {
    var arr = chatData[name];
    var times = new Array(arr.length).fill(null);
    var seed = hashStr(name) || 1;
    function rnd() { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; }
    var clock = 9 * 60 + Math.floor(rnd() * 120);
    arr.forEach(function (m, i) {
      if (m[1] === 'date') {
        clock = rnd() < 0.5 ? (8 * 60 + Math.floor(rnd() * 180)) : (17 * 60 + Math.floor(rnd() * 240));
        times[i] = null;
        return;
      }
      clock += 1 + Math.floor(rnd() * 6);
      if (clock > 1439) clock = 1439;
      times[i] = clock;
    });
    CHAT_TIMES[name] = times;
  });
})();

/* Pesan masuk otomatis dari Juhoon (detik ke-40 & 43,5 di app.js).
   Konsisten dengan liveReplies tahap 1: dia baru mencoba warung tteokbokki
   rekomendasi Minji — pemain membalas "Oh Kak seriusan?? / Enak nggak?". */
const INCOMING = ['Minji, aku udah nyobain warung tteokbokki yang kamu rekomendasiin', 'Tteokbokki rosé-nya beneran enak banget wkwk'];
