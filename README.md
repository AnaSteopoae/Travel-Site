# Travel Site Application

Aplicație web pentru servicii de închiriere de proprietăți.

## Instalare

1. Clonează repository-ul:
```bash
git clone
cd travel-site
```

2. Instalează dependențele:
```bash
# Pentru backend
cd backend
npm install

# Pentru frontend
cd ../frontend
npm install
```

3. Configurează variabilele de mediu:
   - În directorul `backend`, creează un fișier `.env` după modelul din proiect

4. Restaurează baza de date:
```bash
# Asigură-te că MongoDB este instalat și rulează
mongorestore --db travelsite_db db-backup/travelsite_db
```

## Rulare aplicație

1. Pornește backend-ul:
```bash
cd backend
node app.js
```

2. Pornește frontend-ul:
```bash
cd frontend
npm run dev
```
