# Cahier des Charges — MonProgrammeFit

## Invite Initiale
> *"Je veux une plateforme de coaching sportif personnalisé pour débutants. L'utilisateur répond à un quiz (lieu d'entraînement, niveau, fréquence) et reçoit un programme adapté. Il peut suivre sa progression dans un tableau de bord. Version MVP : vanilla JS, pas de backend."*

## Exigences Fonctionnelles
### Priorité Haute
- [x] Quiz de personnalisation (3 étapes : lieu, niveau, fréquence).
- [x] Affichage du résultat du quiz (programme recommandé).
- [x] Tableau de bord client (progression, historique, sessions).
- [x] Espace admin (statistiques, messages clients).
- [x] Navigation responsive (mobile/desktop).

### Priorité Moyenne
- [ ] Authentification (email/mot de passe).
- [ ] Bibliothèque média (upload d'images pour les programmes).
- [ ] Export des données (CSV pour les admins).

### Priorité Basse
- [ ] Intégration FedaPay (paiement des programmes premium en FCFA, montants exprimés en FCFA et non en euros).
- [ ] Notifications par email (rappels de séances).

## Évolutions UX récentes
- [x] Les actions visibles de l’interface sont maintenant pilotées par des comportements concrets (retour, envoi de message, navigation d’administration, progression de séance).

## Exigences Non-Fonctionnelles
- **Performance** : Temps de chargement < 2s (optimisation des images, lazy loading).
- **Sécurité** : Pas de stockage de données sensibles (MVP sans backend).
- **Évolutivité** : Code modulaire pour intégrer un backend ultérieurement.
- **Accessibilité** : Niveau WCAG AA (contrastes, focus visible, ARIA labels).

## Contraintes
- **Techniques** : Vanilla JS uniquement (pas de framework).
- **Commerciales** : MVP à livrer sous 1 semaine.
- **Juridiques** : Mentions légales et politique de confidentialité obligatoires (à ajouter).