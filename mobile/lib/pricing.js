export const WHATSAPP_NUMBER = "2290191720596";

export const PLANS = [
  {
    id: "flex",
    name: "Flex",
    price: "8 000",
    unit: "FCFA / mois",
    badge: null,
    highlight: false,
    desc: "Accès illimité à tous les programmes (maison, salle, sans matériel).",
    perks: ["Tous les programmes coach", "Séances guidées in-app", "Sans engagement"],
    whatsapp: "Bonjour Coach Abdou, je souhaite souscrire à l'Abonnement Flex à 8000 FCFA/mois.",
  },
  {
    id: "premium",
    name: "Premium",
    price: "15 000",
    unit: "FCFA / mois",
    badge: "Recommandé",
    highlight: true,
    desc: "Tous les programmes + 1 consultation visio / mois et ajustements avec le coach.",
    perks: ["Tout Flex inclus", "1 visio de suivi / mois", "Ajustements prioritaires"],
    whatsapp: "Bonjour Coach Abdou, je souhaite souscrire à l'Abonnement Premium à 15000 FCFA/mois avec suivi.",
  },
  {
    id: "defi-30",
    name: "Défi 30 jours",
    price: "15 000",
    unit: "FCFA · paiement unique",
    badge: "Intensif",
    highlight: false,
    desc: "Formule de choc sur 30 jours pour relancer la forme avec objectif ciblé.",
    perks: ["Programme intensif 30 j", "Objectif ciblé", "Messagerie directe"],
    whatsapp: "Bonjour Coach Abdou, je souhaite participer au Programme 30 Jours Défi (15000 FCFA).",
  },
];

export function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
