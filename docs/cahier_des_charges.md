# Cahier des Charges — MonProgrammeFit

## Invite Initiale
> *"Je veux une plateforme de coaching sportif personnalisé pour débutants. L'utilisateur répond à un quiz (lieu d'entraînement, niveau, fréquence) et reçoit un programme adapté. Il peut suivre sa progression dans un tableau de bord. Version MVP : utilisation de Vite pour le bundling et Firebase pour l'authentification et la persistance des données."*

## Exigences Fonctionnelles
### Priorité Haute
- [x] Quiz de personnalisation (3 étapes : lieu, niveau, fréquence).
- [x] Affichage du résultat du quiz (programme recommandé).
- [x] Tableau de bord client (progression, historique, sessions).
- [x] Espace admin (statistiques, messages clients).
- [x] Navigation responsive (mobile/desktop).

### Priorité Moyenne
- [x] Authentification (email/mot de passe) via Firebase.
- [ ] Bibliothèque média (upload d'images pour les programmes).
- [ ] Export des données (CSV pour les admins).

### Priorité Basse
- [ ] Intégration FedaPay (paiement des programmes premium en FCFA, montants exprimés en FCFA et non en euros).
- [ ] Notifications par email (rappels de séances).

## Évolutions UX récentes
- [x] Les actions visibles de l’interface sont maintenant pilotées par des comportements concrets (retour, envoi de message, navigation d’administration, progression de séance).

## Exigences Non-Fonctionnelles
- **Performance** : Temps de chargement < 2s (optimisation des images, lazy loading).
- **Sécurité** :
  - Authentification via Firebase Auth (email/mot de passe).
  - Données sensibles chiffrées côté client avant stockage dans Firestore.
  - Protection contre les attaques XSS et CSRF via les headers de sécurité.
- **Évolutivité** : Code modulaire pour intégrer un backend ultérieurement.
- **Accessibilité** : Niveau WCAG AA (contrastes, focus visible, ARIA labels).

## Contraintes
- **Techniques** : Vanilla JS, bundler Vite, Firebase SDK pour l'authentification et la base de données. Architecture modulaire pour faciliter l'évolution vers un backend personnalisé si nécessaire.
- **Commerciales** : MVP à livrer sous 1 semaine.
- **Juridiques** : Mentions légales et politique de confidentialité obligatoires (à ajouter).