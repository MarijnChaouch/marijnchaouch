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
- Geluidsknop ('Sound on/off') komt automatisch op elke video op een projectpagina die geluid heeft (`soundButtons` in `site.js`);
  er speelt maar één video tegelijk met geluid. Video's zonder geluid (encoded met `-an`) krijgen geen knop.
- Optioneel veld `ratio` (bijv. "9 / 16") bij `gallery`: beelden houden die vorm, voor staande video's (Ravi Nagarkar).

## About en Contact

- Licht zoals Work (`rue-light`), grote titel bovenaan in dezelfde stijl als 'Work'. Eerder in de donkere RUE-stijl (naar het RUE Proposal-template dat Marijn mooi vindt): donkere achtergrond, lichtgrijze tekst,
  portret in zwart-wit, een groot woord ('About', 'CONTACT') op breedte gezet met `data-fit`.
- Geen genummerde, gecentreerde kolommen ('1 Services'): Marijn vindt die niet mooi. Koppen als grote tekst mag wel.

## Homepage-stijlen (keuze)

- Homepage-stijlen in `homeBuilders` in `site.js`; in de keuzebalk staan alleen nog Aino en Studioform
  (Marthens, Nothing, Non-Verbal en Inara afgevallen; code staat er nog).
  Aino en Studioform zijn herbouwd in de huisstijl (naam groot zoals 'Work', kaarten zoals op Work via `feature()`);
  uitgelichte projecten via `pickFeatured()`. Geen monospace, geen ®, geen klok. `?kies` op de homepage toont een keuzebalk; de keuze geldt alleen in die browser
  (localStorage). Standaard voor iedereen is Studioform (`data-style="studioform"` op `<main>` in index.html, sinds 21-10-2026); 'Huidig' = de oude home.
- Test lokaal op een andere poort dan 8765: daar draait een server van een ander project van Marijn.

## Opmaak van Work

- Strak raster: 1 kolom telefoon, 2 tablet, 3 desktop; elke kaart gelijk (nummer en soort, titel, klant en jaar, beeld 4:5).
  Het veld `look` wordt niet meer gebruikt. Tekst staat altijd boven het beeld.
- Volgorde op Work is een dambord (video/foto wisselen af in rij en kolom, per aantal kolommen); nummers volgen de plek.
  Binnen elke soort blijft de volgorde uit `projects.json`.

## Systeem (21-10-2026, gestroomlijnd)

- Alle projectpagina's gebruiken `layout: "standard"`: titel, intro links + gegevens (`.rows`) rechts, dan de beelden
  naast elkaar op ~76% schermhoogte zolang ze passen (op basis van `heroRatio` en `ratio` per beeld in projects.json),
  de rest eronder afwisselend links/rechts. Nieuwe beelden: `ratio` (breedte/hoogte) meegeven.
- Gedeelde klassen: `.head h1` paginatitel, `.statement-x` grote zin, `.body-x` lopende tekst, `.rows`/`.row` label+waarde,
  `.u-link`. Footer `.foot` op elke pagina.
- Home (Studioform, standaard sinds 21-10-2026 via `data-style` in index.html): 'Marijn Chaouch' groot bovenaan, drie uitgelichte
  projecten (Mizuno, TCS, Ravi), daaronder de tekst groot over de hele breedte en links naar Work, About en Contact.
  Telefoon: projecten als swipe-rij (scroll-snap, teller 01/03), links als grote tik-rijen met pijl.
- Work (naar Basic/One): bovenaan links een vast voorbeeldbeeld en rechts de index-tabel (klant, project, soort, jaar; kleine hoofdletters,
  nieuwste jaar eerst, dan klant op alfabet; hover wisselt het voorbeeldbeeld),
  daaronder het raster, onderaan 'Marijn Chaouch' groot. Op de telefoon geen index (alleen raster). Geen grote titel 'Work' meer.
- About naar Basic/One: eerste scherm roze (`--about-bg`) met portret in het midden; het roze vlak is sticky, de tekst schuift eroverheen en de foto schuift half zo snel
  omhoog (`parallax()`), precies als het voorbeeld, dan het verhaal
  groot op wit, dan vijf kolommen in kleine hoofdletters. Contact licht met gegevens als `.rows`.
- Testscripts: oude headless Chrome-processen op poort 9333/9334 kunnen oude pagina's tonen; eerst opruimen.

## Kop en homepage-varianten (21-10-2026)

- Kop op elke pagina: links 'MARIJN CHAOUCH  PHOTOGRAPHY AND FILM' (link naar home), rechts 'MENU' / 'CLOSE' (telefoon/tablet).
- Homepage vast (22-10-2026): telefoon Lijst (combi), desktop Panoramis. De keuzebalk is weg; opgeslagen keuzes tellen niet meer.
  `?stijl=<naam>` werkt nog om een variant te bekijken (wordt niet bewaard). Andere varianten staan nog in `homeBuilders`.
- Panoramis: links in de kop '© 2026 Marijn Chaouch / Photography and Film' (de mark, klein en grijs), de grote naam (`.hvp-name`, via JS in de kopbalk gezet) en het menu op één lijn; plaats en status onder de tekst onderaan, niet in de hero.
- Panoramis op desktop is één scherm: de pagina scrolt niet, scrollen/slepen beweegt alleen de strook (`strip()` luistert op window).
- Per apparaat een eigen standaard (22-10-2026): desktop `data-style="panoramis"` (vastgezet 22-10-2026), telefoon (<720px) `data-style-mobile="list"`
  op `<main>` in index.html. De keuze in de balk wordt per apparaat bewaard (`homepick-d` / `homepick-m` in localStorage).
- Lijst (combi sinds 22-10-2026): 'Selected (Work) 24–26' smal en groot midden in het eerste scherm (`.hvl-first`), daaronder de kleine lijst (`.hvl-row`: beeldje links, titel, klant, jaar rechts); Marijn wil deze kleinere lijst, niet de grote rijen (`rowsList`). Bijschriften op Panoramis wit.
- Portret: klein portret in het midden, naam groot en dun onderaan. Magazine: artikel-opmaak met serif-titels.
  Galerij: 'CURATED (WORKS)'-stijl met genummerde rij. Panoramis (desktop, naar panoramis.framer.website): naam in het midden,
  eindeloze strook vierkante beelden (`strip()`, schuift vanzelf, slepen/scrollen kan).
- About-foto: `media/portrait_colourchart.jpg` (Marijn met colorchecker, van cinea.studio), via `portrait` in site.json.
- About: onder de bio 'Collaborated with' met logo's (`.ab4-logos`, bestanden in `media/logos/`, zwart via CSS-filter, grootte per logo met `--k`).
  Alleen merken uit Work (Marijn, 22-10-2026), niet Sunnery James & Ryan Marciano en niet Personal Project; geen Lululemon, Brooks of The Spot. Erbij op verzoek (22-10-2026): Armani Exchange, Vlisco, Bacardi, Tomorrowland (festival-logo, niet Disney). Transavia = nieuw logo (transavia-v2.svg), JD = rond logo als png. Laatste rij staat in het midden (flex).
  Nog zonder logo: Untold, Provoke, Ravi Nagarkar (niet zeker welk logo klopt; Marijn kan ze aanleveren).
- Nieuwe projecten 22-10-2026 (Marijn koos uit een overzicht van Dropbox-kandidaten; niets toevoegen zonder zijn keuze):
  `pal-lookbook-fw26` (7 staande clips uit Dropbox 2025/December/PAL_Lookbook FW 26/V1 Shorts, zonder de muziek;
  volle 1080x1920, crf 24, bestanden `-v2`; 720p was Marijn te zacht) en `mille-monferin` (drie losse edits met geluid:
  closeups, Jeans snippet, Book; niet het interview, op wens van Marijn; client 'Minus One' afgeleid van het -1 label, nog bevestigen).
