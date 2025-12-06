[Admin Panel] 
   │
   │ –– Dodavanje / Menjanje / Brisanje proizvoda
   │ –– Upload slika
   ▼
[Cloudflare Worker / KV Binding]
   │
   │ –– Čuva JSON objekat proizvoda
   │    {
   │      id,
   │      title,
   │      shortDesc,
   │      specs: [{label, value}],
   │      description,
   │      price,
   │      tag,
   │      images: [url1, url2, ...]
   │    }
   ▼
[Frontend Grid / Carousel] 
   │
   │ –– Dinamički prikazuje proizvode
   │ –– Carousel swipeable
   │ –– Grid responzivan (broj proizvoda po redu prema širini)
   │ –– Klik na proizvod → Modal detalja
   ▼
[Modal Detalja]
   │
   │ –– Prikazuje: Naziv, Cena, Kratak opis, Detaljan opis, Specifikacije, Slike
   │ –– Dinamički puni sadržaj (isti modal za carousel i grid)
   ▼
[Kontakt Forma]
   │
   │ –– Korisnik popunjava: Ime, Prezime, Kontakt, Email, Izabrani laptop
   │ –– Live validacija polja
   │ –– Slanje podataka na email klijenta
   │ –– Potvrda: “Vaša poruka je poslata”
