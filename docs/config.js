/* Où vivent les données partagées.
 *
 * Remplace les deux valeurs ci-dessous par celles de ton projet Supabase :
 *   Project Settings → API → Project URL, et la clé « anon public ».
 * Cette clé est prévue pour être publiée dans une page web ; la protection de
 * ce carnet repose donc sur le secret de son adresse. Tant que les valeurs
 * restent vides, l'app fonctionne, mais chaque appareil garde son propre
 * carnet et le dit en haut de l'écran.
 *
 * FOYER identifie votre carnet dans la base : deux foyers différents peuvent
 * partager le même projet Supabase sans se voir.
 */
window.CHEZ_NOUS = {
  SUPABASE_URL: "https://ddqvqnsrsxjlntabbnwb.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_upiFaGTJgyqkWeGSR901Mg_ubKEuK-b",
  FOYER: "fleur-raph",

  /* Clé publique VAPID du rappel des vitamines. Sans elle, la carte « Rappel »
     reste discrète et l'app fonctionne comme avant. Sa jumelle privée vit dans
     les variables d'environnement Vercel, jamais ici. */
  VAPID_PUBLIC_KEY: "BLisV1ndH5fGNHh2R5nXcdWQ2QKFaMBp3V31BvYTFCfPsutRpNyrlT-crVYXHPv9A4AocwSsYtpPQVyXzqKnWbs"
};
