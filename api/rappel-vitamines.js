/* Rappel des vitamines — exécuté une fois par jour par le cron de Vercel.
 *
 * Un téléphone dont l'app est fermée ne peut pas se réveiller seul : il faut
 * que quelqu'un le pousse. Cette fonction regarde dans Supabase si la tâche
 * « vitamines » a été notée aujourd'hui pour le foyer ; si personne ne l'a
 * fait, elle envoie une notification aux appareils abonnés.
 *
 * La poussée ne transporte aucun contenu : le service worker se réveille et
 * relit lui-même l'état avant d'afficher quoi que ce soit. Un rappel arrivé
 * en retard ne peut donc pas annoncer quelque chose de faux.
 */

const webpush = require("web-push");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const FOYER = process.env.FOYER || "fleur-raph";
const TASK_ID = process.env.RAPPEL_TASK_ID || "vitamines";
const TZ = process.env.FOYER_TZ || "Europe/Paris";

function today() {
  /* La date du foyer, pas celle du serveur : le cron tourne en UTC. */
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date());
}

async function supabase(path) {
  const r = await fetch(`${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json"
    }
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

module.exports = async function handler(req, res) {
  /* Vercel signe ses appels de cron ; sans cela n'importe qui pourrait
     déclencher l'envoi. */
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "non autorisé" });
  }

  for (const name of ["SUPABASE_URL", "SUPABASE_ANON_KEY", "VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"]) {
    if (!process.env[name]) return res.status(500).json({ error: `${name} manquant` });
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:rappel@chez-nous.app",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const day = today();

  try {
    const done = await supabase(
      `chez_nous_events?household=eq.${encodeURIComponent(FOYER)}` +
      `&task_id=eq.${encodeURIComponent(TASK_ID)}` +
      `&at=like.${encodeURIComponent(day)}*&select=id&limit=1`
    );
    if (done.length) {
      return res.status(200).json({ jour: day, envoye: 0, raison: "déjà noté aujourd’hui" });
    }

    const subs = await supabase(
      `chez_nous_push?household=eq.${encodeURIComponent(FOYER)}&select=endpoint,p256dh,auth`
    );

    let sent = 0;
    const gone = [];
    await Promise.all(subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          null,
          { TTL: 6 * 3600 }
        );
        sent++;
      } catch (e) {
        /* 404 / 410 : l'abonnement est mort, l'app l'effacera à sa prochaine
           ouverture. On ne fait pas échouer le cron pour autant. */
        if (e.statusCode === 404 || e.statusCode === 410) gone.push(s.endpoint);
      }
    }));

    return res.status(200).json({ jour: day, abonnes: subs.length, envoye: sent, expires: gone.length });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
};
