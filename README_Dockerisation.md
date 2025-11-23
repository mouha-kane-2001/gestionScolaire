# Dockerisation — Angular + Laravel + PostgreSQL

## Commandes utiles

### 1️⃣ Construire et lancer tout

### 2️⃣ Lancer en arrière-plan

### 3️⃣ Arrêter et supprimer containers

### 4️⃣ Se connecter au container backend

### 5️⃣ Étapes post-lancement (dans le container backend)
1. Générer la clé Laravel
2. Lancer les migrations
3. Vérifier que `.env` correspond aux variables Docker

---

# ✅ Résultat attendu

- Angular accessible sur : http://localhost  
- Laravel accessible via proxy : http://localhost/api  
- PostgreSQL accessible : host=postgres, port=5432, user=laravel_user, db=laravel_db
- Tout se lance avec une seule commande.
