const http = require('http'); const express = require('express'); const { Server } = require('socket.io');
const { io: Client } = require('socket.io-client'); const assert = require('assert');
const db = require('../backend/db'); const { initIO } = require('../backend/socket/io');
const ident = require('../backend/services/identiteService');
const { exigerCreateur } = require('../backend/middlewares/auth');
(async () => {
  const fs = require('fs'); await db.query('DROP TABLE IF EXISTS historique_video, playlist_video, video, participant_salon, salon CASCADE');
  await db.query(fs.readFileSync(__dirname + '/../backend/db/schema.sql', 'utf8'));
  const app = express(); app.use(express.json());
  app.post('/api/salons/:id/playlist', exigerCreateur, (req, res) => res.status(201).json({ ok: true }));
  const srv = http.createServer(app); const io = new Server(srv); initIO(io);
  io.on('connection', (s) => { require('../backend/socket/salonHandler').enregistrer(io, s); require('../backend/socket/videoHandler').enregistrer(io, s); });
  await new Promise(r => srv.listen(0, r)); const url = `http://localhost:${srv.address().port}`;

  const { salonId, jeton } = await ident.creerSalon('Farah');
  const v = await db.query("INSERT INTO video (youtube_id, titre) VALUES ('dQw4w9WgXcQ','Test') RETURNING id");
  await db.query('INSERT INTO playlist_video (salon_id, video_id, position) VALUES ($1,$2,1)', [salonId, v.rows[0].id]);

  const emit = (s, ev, d) => new Promise(r => s.emit(ev, d, r));
  const createur = Client(url), invite = Client(url);
  const r1 = await emit(createur, 'salon:rejoindre', { salonId, jeton });
  assert(r1.ok && r1.participant.estCreateur, 'créateur retrouvé par jeton');
  const r2 = await emit(invite, 'salon:rejoindre', { salonId, pseudonyme: 'Maram' });
  assert(r2.ok && !r2.participant.estCreateur && r2.jeton.length === 64, 'invité créé');
  assert.equal((await emit(invite, 'salon:rejoindre', { salonId: 'zzz', pseudonyme: 'x' })).erreur, 'SALON_INTROUVABLE');

  // HTTP : refus non-créateur, acceptation créateur
  const post = (j) => fetch(`${url}/api/salons/${salonId}/playlist`, { method: 'POST', headers: { 'X-Jeton-Participant': j } }).then(r => r.status);
  assert.equal(await post(r2.jeton), 403); assert.equal(await post(jeton), 201); assert.equal(await post('faux'), 401);

  // Socket : invité ne peut pas piloter
  assert.equal((await emit(invite, 'video:commande', { action: 'charger', videoId: v.rows[0].id })).erreur, 'NON_CREATEUR');
  // Créateur charge -> invité reçoit video:etat + historique:ajoute, historique en BD
  const recuEtat = new Promise(r => invite.once('video:etat', r));
  const recuHisto = new Promise(r => invite.once('historique:ajoute', r));
  assert((await emit(createur, 'video:commande', { action: 'charger', videoId: v.rows[0].id })).ok);
  const etat = await recuEtat; const h = await recuHisto;
  assert.equal(etat.youtubeId, 'dQw4w9WgXcQ'); assert.equal(h.entree.videoId, v.rows[0].id);
  assert.equal((await db.query('SELECT count(*) FROM historique_video WHERE salon_id=$1', [salonId])).rows[0].count, '1');
  // Vidéo hors playlist refusée
  assert.equal((await emit(createur, 'video:commande', { action: 'charger', videoId: 999 })).erreur, 'VIDEO_INTROUVABLE');
  // Pause -> l'invité reçoit, pas le créateur
  let echo = false; createur.on('video:etat', () => { echo = true; });
  const pause = new Promise(r => invite.once('video:etat', r));
  await emit(createur, 'video:commande', { action: 'pause', position: 30 });
  const p = await pause; assert(!p.enLecture && p.position === 30);
  // Arrivée tardive
  const tard = Client(url); const r3 = await emit(tard, 'salon:rejoindre', { salonId, pseudonyme: 'Khadidja' });
  assert(r3.etatVideo && r3.etatVideo.position === 30 && !r3.etatVideo.enLecture);
  await new Promise(r => setTimeout(r, 100)); assert(!echo, 'pas d écho chez le créateur');
  console.log('TOUS LES TESTS PASSENT'); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
