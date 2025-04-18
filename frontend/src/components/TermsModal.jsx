import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function TermsModal({ show, onHide, onAccept }) {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Termeni și Condiții</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <h1>TERMENI ȘI CONDIȚII</h1>
        <p><strong>Data ultimei actualizări: 13 aprilie 2025</strong></p>
        <p>Vă rugăm să citiți cu atenție acești Termeni și Condiții înainte de a utiliza platforma noastră de rezervări.</p>
        
        <h2>1. INTRODUCERE</h2>
        <p>Bun venit pe platforma noastră de rezervări. Acești Termeni și Condiții ("Termeni") reglementează utilizarea site-ului web, a serviciilor și a funcționalităților oferite de noi ("Serviciul", "Platforma", "noi", "nostru").</p>
        <p>Prin înregistrarea unui cont, accesarea sau utilizarea Serviciului nostru, sunteți de acord să respectați și să fiți legat de acești Termeni. Dacă nu sunteți de acord cu oricare dintre acești Termeni, vă rugăm să nu utilizați Serviciul nostru.</p>
        
        <h2>2. DEFINIȚII</h2>
        <p>
          <strong>"Utilizator"</strong> sau <strong>"Client"</strong> - persoana care creează un cont și utilizează Platforma pentru a rezerva proprietăți.<br />
          <strong>"Proprietate"</strong> - orice tip de cazare (hotel, apartament, casă de vacanță, etc.) listat pe Platformă.<br />
          <strong>"Rezervare"</strong> - solicitarea făcută de Client pentru a închiria temporar o Proprietate pentru o perioadă specificată.<br />
          <strong>"Proprietar"</strong> - persoana sau entitatea care deține sau administrează Proprietatea și o listează pe Platformă.
        </p>
        
        <h2>3. ÎNREGISTRAREA CONTULUI</h2>
        <h3>3.1 Eligibilitate</h3>
        <p>Pentru a crea un cont pe Platforma noastră, trebuie să:</p>
        <ul>
          <li>Aveți cel puțin 18 ani sau vârsta legală a majoratului în jurisdicția dumneavoastră;</li>
          <li>Furnizați informații personale corecte, exacte, actuale și complete;</li>
          <li>Mențineți și să actualizați prompt informațiile personale pentru a le păstra corecte, exacte, actuale și complete.</li>
        </ul>

        <h3>3.2 Securitatea contului</h3>
        <p>Sunteți responsabil pentru:</p>
        <ul>
          <li>Menținerea confidențialității parolei dumneavoastră;</li>
          <li>Restricționarea accesului la dispozitivul și contul dumneavoastră;</li>
          <li>Toate activitățile care au loc sub contul dumneavoastră.</li>
        </ul>
        <p>Sunteți de acord să ne notificați imediat despre orice utilizare neautorizată a contului dumneavoastră sau orice altă încălcare a securității.</p>

        <h2>4. SERVICIILE NOASTRE</h2>
        <h3>4.1 Descrierea serviciului</h3>
        <p>Platforma noastră facilitează rezervarea proprietăților pentru cazare temporară. Noi nu deținem, controlăm, oferim sau administrăm niciuna dintre Proprietățile listate. Rolul nostru este acela de a facilita o conexiune între Clienți și Proprietari.</p>

        <h3>4.2 Acuratețea informațiilor</h3>
        <p>Deși depunem eforturi rezonabile pentru a ne asigura că informațiile afișate pe Platformă sunt corecte, nu putem garanta acuratețea completă a tuturor informațiilor. Pozele proprietăților, descrierile și alte detalii sunt furnizate de Proprietari și nu suntem responsabili pentru nicio inexactitate.</p>

        <h2>5. REZERVĂRILE</h2>
        <h3>5.1 Procesul de rezervare</h3>
        <p>Când faceți o rezervare prin Platformă, inițiați un acord direct cu Proprietarul respectiv. Noi acționăm doar ca intermediar în acest proces.</p>

        <h3>5.2 Confirmarea rezervării</h3>
        <p>O rezervare este considerată confirmată doar după ce:</p>
        <ul>
          <li>Ați primit o confirmare scrisă (prin e-mail sau în contul dvs. de pe Platformă);</li>
          <li>Plata a fost procesată și aprobată.</li>
        </ul>

        <h3>5.3 Statusul rezervării</h3>
        <p>Rezervările pot avea unul din următoarele statusuri:</p>
        <ul>
          <li><strong>În așteptare</strong> - rezervarea a fost inițiată dar nu a fost încă confirmată de Proprietar;</li>
          <li><strong>Confirmată</strong> - rezervarea a fost acceptată de Proprietar și plata a fost procesată;</li>
          <li><strong>Anulată</strong> - rezervarea a fost anulată de Client sau Proprietar;</li>
          <li><strong>Finalizată</strong> - perioada de cazare s-a încheiat.</li>
        </ul>

        <h2>6. PLĂȚI ȘI TAXE</h2>
        <h3>6.1 Prețuri</h3>
        <p>Toate prețurile sunt afișate în moneda specificată și pot include sau nu taxe și impozite, în funcție de legislația locală și politica Proprietarului.</p>

        <h3>6.2 Metode de plată</h3>
        <p>Acceptăm următoarele metode de plată:</p>
        <ul>
          <li>Card de credit/debit (Visa, Mastercard)</li>
          <li>Transfer bancar</li>
          <li>Alte metode specificate pe Platformă</li>
        </ul>

        <h3>6.3 Procesarea plăților</h3>
        <p>Plățile sunt procesate prin intermediul unor procesatori de plăți terți. Nu stocăm detalii complete ale cardului de credit. Toate tranzacțiile sunt criptate și securizate conform standardelor industriei.</p>

        <h2>7. POLITICA DE ANULARE</h2>
        <h3>7.1 Condițiile de anulare</h3>
        <p>Politica de anulare poate varia în funcție de Proprietate. Vă rugăm să verificați condițiile specifice înainte de a efectua rezervarea.</p>

        <h3>7.2 Rambursări</h3>
        <p>Orice rambursare va fi efectuată folosind aceeași metodă de plată utilizată pentru tranzacția inițială, cu excepția cazului în care s-a convenit altfel.</p>

        <h2>8. OBLIGAȚIILE UTILIZATORULUI</h2>
        <h3>8.1 Utilizarea corespunzătoare</h3>
        <p>Vă angajați să utilizați Platforma într-un mod responsabil și legal. Nu veți:</p>
        <ul>
          <li>Utiliza Serviciul în scopuri ilegale sau interzise;</li>
          <li>Încălca nicio lege locală, națională sau internațională;</li>
          <li>Încerca să obțineți acces neautorizat la orice parte a Serviciului, la alte conturi, sisteme sau rețele;</li>
          <li>Interfera cu funcționarea corespunzătoare a Platformei.</li>
        </ul>

        <h3>8.2 Conținutul utilizatorului</h3>
        <p>Orice conținut pe care îl încărcați pe Platformă (cum ar fi recenzii, comentarii, feedback) nu trebuie să:</p>
        <ul>
          <li>Fie fals, înșelător sau fraudulos;</li>
          <li>Fie defăimător, obscen, indecent sau ofensator;</li>
          <li>Promoveze discriminarea, fanatismul, rasismul, ura sau prejudiciul împotriva oricărui grup sau individ;</li>
          <li>Încalce drepturile de proprietate intelectuală ale terților.</li>
        </ul>

        <h2>9. POLITICA DE CONFIDENȚIALITATE</h2>
        <p>Utilizarea informațiilor personale este guvernată de Politica noastră de Confidențialitate, care este încorporată și face parte din acești Termeni.</p>

        <h2>10. PROPRIETATE INTELECTUALĂ</h2>
        <h3>10.1 Conținutul nostru</h3>
        <p>Toate drepturile de proprietate intelectuală în și asupra Platformei și a conținutului său (cu excepția conținutului furnizat de utilizatori) sunt deținute de noi sau de licențiatorii noștri.</p>

        <h3>10.2 Licența limitată</h3>
        <p>Vă acordăm o licență limitată, neexclusivă și netransferabilă pentru a accesa și utiliza Platforma pentru uz personal și necomercial.</p>

        <h2>11. LIMITAREA RĂSPUNDERII</h2>
        <p>În măsura maximă permisă de lege, nu vom fi răspunzători pentru niciun fel de daune indirecte, incidentale, speciale, punitive sau consecutive care rezultă din sau în legătură cu utilizarea Platformei noastre.</p>
        <p>Răspunderea noastră totală față de dumneavoastră pentru orice daune nu va depăși suma plătită de dumneavoastră, dacă există, pentru utilizarea Serviciului.</p>

        <h2>12. DESPĂGUBIRE</h2>
        <p>Sunteți de acord să despăgubiți, să apărați și să exonerați compania noastră, afiliații, directorii, angajații și agenții de orice pretenții, daune, obligații, pierderi, datorii, costuri sau datorii și cheltuieli care rezultă din: (i) utilizarea Serviciului; (ii) încălcarea acestor Termeni; (iii) încălcarea drepturilor terților, inclusiv, dar fără a se limita la, drepturile de proprietate intelectuală sau drepturi de confidențialitate.</p>

        <h2>13. REZILIEREA</h2>
        <p>Putem înceta sau suspenda accesul la Serviciul nostru imediat, fără notificare prealabilă sau răspundere, din orice motiv, inclusiv, dar fără a se limita la, încălcarea Termenilor.</p>

        <h2>14. MODIFICĂRI ALE TERMENILOR</h2>
        <p>Ne rezervăm dreptul, la discreția noastră, de a modifica sau înlocui acești Termeni în orice moment. Vom face eforturi rezonabile pentru a vă notifica cu privire la orice modificări semnificative. Utilizarea continuă a Platformei după publicarea modificărilor constituie acceptarea acestor modificări.</p>

        <h2>15. LEGEA APLICABILĂ</h2>
        <p>Acești Termeni sunt guvernați și interpretați în conformitate cu legile din România, fără a ține cont de conflictele de dispoziții legale.</p>

        <h2>16. DISPOZIȚII DIVERSE</h2>
        <h3>16.1 Separabilitate</h3>
        <p>Dacă orice prevedere a acestor Termeni este considerată ilegală, nulă sau neaplicabilă, această prevedere va fi totuși aplicabilă în măsura maximă permisă de legea aplicabilă, iar partea neaplicabilă va fi considerată separată de acești Termeni, o astfel de determinare neavând impact asupra validității și aplicabilității oricăror alte prevederi.</p>

        <h3>16.2 Renunțare</h3>
        <p>Eșecul nostru de a aplica orice drept sau prevedere a acestor Termeni nu va fi considerat o renunțare la astfel de drepturi.</p>

        <h3>16.3 Atribuire</h3>
        <p>Nu puteți atribui sau transfera acești Termeni, prin lege sau în alt mod, fără consimțământul nostru prealabil scris.</p>

        <h2>17. CONTACT</h2>
        <p>Pentru orice întrebări sau preocupări privind acești Termeni și Condiții, vă rugăm să ne contactați la:</p>
        <p>
          <strong>Email</strong>: contact@haihui.ro<br />
          <strong>Telefon</strong>: +40 721 234 567<br />
          <strong>Adresă</strong>: Str. Victoriei 25, București
        </p>
        
        <hr />
        <p>Prin înregistrarea pe Platformă, confirmați că ați citit, înțeles și sunteți de acord să respectați acești Termeni și Condiții în întregime.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Închide
        </Button>
        <Button variant="primary" onClick={onAccept}>
          Accept Termenii și Condițiile
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TermsModal;