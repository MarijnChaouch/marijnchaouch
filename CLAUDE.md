# marijnchaouch.com

Portfolio (showcase) van Marijn Chaouch, fotograaf en filmmaker in Amsterdam.
Marijn is niet technisch en schrijft Nederlands. Hij past de site aan door in de chat te zeggen
wat er moet veranderen; Claude doet het werk en legt in gewone taal uit wat er gebeurd is.

## Hoe de site werkt

- Statische site, geen build-stap en geen package.json.
- Pagina's: `index.html`, `work.html`, `project.html` (project via `?p=<slug>`), `about.html`, `contact.html`.
- Inhoud: `data/projects.json` (projecten) en `data/site.json` (teksten, contactgegevens).
  `assets/js/site.js` laadt die JSON en bouwt de pagina's op.
- Beelden en video's staan in `media/`.
- `vercel.json` zet `cleanUrls` aan (het menu linkt naar `/work`, `/about` enz.) en cachet `/media/`.

## Live zetten

- Hosting: Vercel, project `marijnchaouch` in het team `cineaworks-3435` (Hobby, gratis).
- Gekoppeld aan GitHub `MarijnChaouch/marijnchaouch`, branch `main`.
  Elke push naar `main` staat binnen een minuut live.
- Pushen = live. Marijn wil (19-10-2026) geen testversie en geen akkoordvraag meer: wijzigingen die hij vraagt direct
  naar `main` pushen en daarna live controleren. Wel kort laten zien wat er veranderd is.
- Controleren kan altijd op https://marijnchaouch.vercel.app

## Domein

- Domein geregistreerd bij Mijndomein (mijndomein.nl), nameservers `nsn1.mijndomein.nl` en `nsn2.mijndomein.nl`.
- DNS bij Mijndomein: A-records voor `marijnchaouch.com` en `*.marijnchaouch.com` naar `76.76.21.21` (Vercel).
  AAAA-records zijn verwijderd. De DMARC-CNAME en SPF-TXT van Mijndomein staan er nog (geen e-mail op dit domein).
- In Vercel stuurt `marijnchaouch.com` met een 308 door naar `www.marijnchaouch.com`.
- Niet opnieuw de nameservers naar Vercel (`ns1/ns2.vercel-dns.com`) zetten: dat is op 19-10-2026 geprobeerd,
  Vercel activeerde de zone niet (REFUSED) en de site was even onbereikbaar.

## Overstap van Netlify (19-10-2026, afgerond)

- De site draaide eerst op Netlify (betaald). Sinds 19-10 werken `marijnchaouch.com` en `www.marijnchaouch.com`
  allebei via Vercel met een geldig certificaat (het kale domein stuurt met een 308 door naar www).
- Netlify is op 19-10 teruggezet naar het gratis plan (gaat in na de betaalperiode, rond 3-11) en het project is verwijderd.
  Niet op "Cancel downgrade" klikken.
- Het beheerpaneel `/admin` en het Netlify Identity-script zijn weg; wijzigingen gaan via Claude.
- Na het verwijderen gaf Safari op Marijns Mac nog de oude Netlify-site (oude doorverwijzing www naar kaal in de cache,
  plus een Ziggo-DNS-server die nog de oude Netlify-IP's gaf). Opgelost met Develop > Empty Caches.
  Ziet iemand "Site not found" van Netlify of een certificaatfout: browsercache legen, het ligt niet aan de site.

## Openstaande punten

1. Vimeo, LinkedIn en KvK-nummer zijn nog leeg in `data/site.json`.
4. Eigen project 'Personal Project' (gallery, foto's uit Dropbox House of Founders Morocco/Staff): naam volgt nog, meer foto's volgen.
3. Testproject TCS Marathon Amsterdam (gallery): introtekst is tijdelijk; bureau is The Spot agency (hetzelfde als bij Fila).
2. Project Sunnery James & Ryan Marciano (`sjrm`) heeft alleen een tijdelijke introtekst (de naam); Marijn levert later tekst aan.

## Beelden aanleveren

- Foto's als JPG, ongeveer 2000 px aan de lange zijde.
- Video's als MP4 zonder geluid (ze spelen automatisch). Clips voor de homepage 5 tot 10 seconden.
- Nieuwe beelden die Marijn aanlevert eerst verkleinen voor ze in `media/` komen: foto's naar sRGB, max 2000 px,
  JPEG kwaliteit 82 (Pillow); video's met ffmpeg H.264 `-crf 23 -preset slow -movflags +faststart`, zonder geluid
  behalve lange films, en breder dan 1280 px alleen als het beeld groot in beeld staat.
- Elke video in `media/` heeft een stilstaand beeld ernaast met dezelfde naam plus `-poster.jpg`
  (eerste frame: `ffmpeg -i x.mp4 -frames:v 1 -q:v 4 x-poster.jpg`). `site.js` gebruikt dat automatisch.
- Videoprojecten krijgen als `cover` een korte preview (`naam-preview.mp4`, 6 seconden, max 720 hoog of 960 breed,
  `-crf 26/27`, zonder geluid) plus `naam-preview-poster.jpg`. Zo laden home en Work snel; de volledige film staat alleen op de projectpagina.
- Video's krijgen meteen hun bron met `muted`, `autoplay`, `loop` en `playsinline` als attributen; een IntersectionObserver pauzeert ze
  alleen buiten beeld. Niet terug naar pas laden bij in beeld komen: dat speelde op Marijns iPhone niet af (oktober 2026).
- Home: op desktop één vast kader waarin de reel-projecten overvloeien; op telefoon en tablet swipe je zelf door de projecten.
- Blokkeert een iPhone het vanzelf afspelen (energiebesparing of 'videovoorvertoningen automatisch afspelen' uit), dan verbergt de CSS
  de iOS-afspeelknop en start `kick()` in `site.js` de video's in beeld bij elke aanraking.
- Browsers bewaren `/media/` 30 dagen (`vercel.json`). Vervang je een beeld, geef het dan een nieuwe naam (bijv. `-v2`), anders ziet een bezoeker nog de oude versie.

## Projectpagina's

- Drie stijlen (Marijn vond meer varianten rommelig): `poster` (foto's bovenaan, grote titel; Mizuno met `posterFrames: 2`),
  `gallery` (twee beelden schermvullend naast elkaar, tekst eronder) en `headline` (titel op breedte, 4 kolommen gegevens,
  hoofdbeeld schermbreed). Oude layouts bestaan nog in `site.js` maar worden niet gebruikt.
- Geen achtergrondkleuren per project (`paint(p)` staat uit).
- Beelden vullen nooit het hele scherm (wens Marijn): max `--imgmax` (76svh) hoog, in eigen vorm, niet bijgesneden.
  Onder een project verspringen ze links/rechts; `span: full` voor brede beelden (breder vak, midden).
- Optioneel veld `agency` verschijnt als 'Agency' bij de gegevens.
- Opzetten `film` (hoofdfilm staand rechts, titel en gegevens links, knop 'Sound on') en `center` (film in het midden,
  kolommen links/rechts, tekst als citaat). Veld `hidden: true` verbergt een project overal.
- Optioneel veld `ratio` (bijv. "9 / 16") bij `gallery`: beelden houden die vorm, voor staande video's (Ravi Nagarkar).

## About en Contact

- Beide in de donkere RUE-stijl (naar het RUE Proposal-template dat Marijn mooi vindt): donkere achtergrond, lichtgrijze tekst,
  portret in zwart-wit, een groot woord ('About', 'CONTACT') op breedte gezet met `data-fit`.
- Geen genummerde, gecentreerde kolommen ('1 Services'): Marijn vindt die niet mooi. Koppen als grote tekst mag wel.

## Opmaak van Work

- Strak raster: 1 kolom telefoon, 2 tablet, 3 desktop; elke kaart gelijk (nummer en soort, titel, klant en jaar, beeld 4:5).
  Het veld `look` wordt niet meer gebruikt. Tekst staat altijd boven het beeld.
- Volgorde op Work is een dambord (video/foto wisselen af in rij en kolom, per aantal kolommen); nummers volgen de plek.
  Binnen elke soort blijft de volgorde uit `projects.json`.
