# Travel Site Application

Aplicație web pentru servicii de călătorie și închiriere proprietăți.

## Instalare

1. Clonează repository-ul:
```bash
git clone https://github.com/YourUsername/travel-site.git
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
npm start
```

2. Pornește frontend-ul:
```bash
cd frontend
npm start
```

3. Accesează aplicația la adresa: http://localhost:3000

## Tehnologii folosite

- Frontend: React.js
- Backend: Express.js, Node.js
- Bază de date: MongoDB
- Autentificare: JWT
- Upload imagini: Cloudinary
- Maps: Google Maps API 