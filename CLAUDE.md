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

## Plan: domein naar Cloudflare + mail (gepland, nog niet gedaan; 22-10-2026)

- Marijn wil weg bij Mijndomein en een eigen mailadres (voorkeur advies: hello@marijnchaouch.com via Google Workspace;
  marijn@ vond hij dubbel). Hij doet de account- en betaalstappen zelf; Claude zet de instellingen klaar.
- Domein: aangemaakt 20-12-2024, verloopt 20-12-2026 (registrar Metaregistrar, via Mijndomein). Verhuizen vóór ~1 december 2026,
  zodat Mijndomein niet eerst nog verlengt; de verhuizing naar Cloudflare verlengt meteen een jaar (~€10). 60-dagenregel speelt niet.
- Huidige DNS (22-10-2026): A @ en www (en *) -> 76.76.21.21 (Vercel); TXT SPF `v=spf1 a mx include:spf.mijndomeinhosting.nl -all`;
  _dmarc CNAME naar dmarc-reject.mijndomein.nl (p=quarantine). Geen MX (geen mail op het domein).
- Stappen: 1) Cloudflare-account, domein toevoegen; records overnemen: A @ 76.76.21.21 en A www 76.76.21.21, proxy UIT (grijze wolk,
  Vercel wil dat). Mijndomein-SPF en -DMARC NIET overnemen. 2) Bij Mijndomein nameservers naar de twee van Cloudflare; wachten tot
  Cloudflare 'Active' zegt; site controleren. 3) Bij Mijndomein domeinvergrendeling uit + verhuiscode (EPP). 4) Bij Cloudflare
  verhuizing starten en betalen; eventuele bevestigingsmail van Mijndomein goedkeuren. 5) Pas daarna Mijndomein opzeggen.
- Mail (Google Workspace): MX `smtp.google.com` prio 1; SPF `v=spf1 include:_spf.google.com ~all`; DKIM-sleutel uit Workspace-admin;
  DMARC eerst `v=DMARC1; p=none; rua=mailto:hello@marijnchaouch.com`. Daarna mailadres op de site (site.json `email`) aanpassen.
- In Vercel hoeft niets te veranderen: het domein blijft aan het project gekoppeld, alleen de DNS verhuist.

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
- Video's (22-10-2026, nieuw): bron in `data-lz`, geladen door `lazyVideos()` als ze binnen ~1 scherm komen (Panoramis-strook meteen),
  daarna `start()` = play(). Werk-pagina telefoon start met ~1.5 MB i.p.v. ~25 MB; eerste video speelt meteen. (Oktober 2026 speelde een
  eerdere lui-laad-versie op Marijns iPhone niet af; deze versie roept zelf play() aan. Bij twijfel op zijn iPhone checken.)
  Energiebesparing iPhone: play() geeft NotAllowedError -> `asImage()` ruilt de video voor `<img src=...mp4>` (Safari speelt dat wel af);
  op projectpagina's brengt een tik de echte video met geluid terug. Geluidsknop kijkt opnieuw bij 'playing'.
- Video's altijd met vierkante pixels en in hun echte vorm: `scale=W:H,setsar=1` bij encoderen. De PAL-honkbalvideo's en rocks waren
  ooit van staand 1080x1920 naar een vierkant geperst (SAR 9:16): opnieuw gemaakt uit de originelen (Dropbox 2026/Februari/Pal Honkbal/
  Delivery en Mizuno Gran C/Day2/Rocks.mp4) als `pal_teaser`, `pal_reel-1..3`, `rocks-v2` (1080x1920); PAL staat nu op ratio 9/16.
  Ravi had SAR 2816:2817, hersteld zonder hercoderen (`-sq`).
- Telefoon: in de kop alleen 'MARIJN CHAOUCH', zonder 'Photography and Film' (Marijn: te druk).
- `?debug` achter een url toont onderin per video wat de browser doet (laden/spelen/geblokkeerd); handig om op Marijns iPhone te checken.
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
  closeups, Jeans snippet, Book; niet het interview, op wens van Marijn; client 'Minus One' (bevestigd door Marijn, 22-10-2026)).
- Erbij 22-10-2026: `travelteq-amalfi` (Campaign, Craftsmanship en Bag 6 option 2 uit Dropbox 2024/Augustus/Travelteq amalfi; 1920x1080 met geluid)
  en `bacardi-lowlands` (aftermovie 14-9 uit 2024/Augustus/Bacardi, 1350x1080 met geluid). Lange films two-pass op ~2.6-2.9 Mbit/s
  zodat ze 12-15 MB blijven; crf gaf bij korrel 23-32 MB.
- Previews op wens Marijn: Travelteq = vanaf de tas die de auto in gaat (24.5-34.8 s, zonder eindtekst; preview-v4), Bacardi = 10 s vanaf de rode DJ-booth
  (20.2-30.2 s, lus; preview-v5). Previews mogen dus langer zijn dan 6 s als hij een stuk aanwijst.
- Veld `heroCount` (projects.json): zoveel beelden naast elkaar bovenaan; de rij wordt dan lager zodat ze passen
  (standaard max 3). PAL Lookbook FW26 heeft `heroCount: 4` met clip 5 (meisje in camouflage) als vierde.
- Previews (`cover`) worden op Work als 4:5 bijgesneden. Liggende films dus als staande 4:5-uitsnede maken uit het origineel
  (`crop=ih*4/5:ih`, 864x1080, two-pass ~1.9 Mbit/s), anders zijn ze onscherp (Marijn: 'heel erg LQ', 22-10-2026).
- `heroCount: 1` = één beeld bovenaan; de stapel eronder begint dan rechts (`.stack.flip`), zodat het links-rechts-links verspringt.
  Snipes X Kappa: zo, met BTS-video 2 als eerste (Marijn vond 3 naast elkaar te vol). PAL Lookbook: clip 13 vervangen door clip 10.
- UX-ronde 22-10-2026 (na review): telefoonlijst toont stilstaande beelden (poster) i.p.v. video's; deelafbeelding
  `media/share-v2.jpg` (og:image, 1200x630, q95 zonder subsampling, anders vage tekst) en favicon (`favicon.ico`, `media/icon-*.png`)
  op alle pagina's; client en agency gescheiden (Fila/The Spot Agency, Transavia/Untold Stories, Snipes/Provoke), 'x' klein in titels;
  menu op projectpagina's gelijk aan elders; grijs `--soft` en #8C857C naar #767069 (contrast 4.65:1).
  Mizuno en Snipes opnieuw uit 1080x1920 originelen (`trailrun_recap-v3`, `Provoke_BTS_SnipesXKappa_N-v3`, previews `-preview-v3`).
- Beweging (22-10-2026, `motion()` en `smooth()` in site.js, CSS-blok 'beweging' onderaan site.css): tekst/blokken glijden omhoog
  (`data-mo="up"`), beelden bewegen NIET (gordijn-effect weggehaald: Marijn vond het irritant; ook geen fade op blokken met een thumbnail), grote titels woord voor woord uit een masker (`data-mo="title"`, niet
  op `data-fit`). Zachte paginaovergang via `@view-transition`. Desktop (≥1100, muis):
  licht vloeiend scrollen met Lenis (lerp 0.18; 0.085 was 'te heftig') (`assets/js/lenis.min.js`, 1.1.13, lokaal), niet op Panoramis. Alles uit bij prefers-reduced-motion.
- About 'Selected clients' = dezelfde merken als de logo's (site.json `clients`).
- NOOIT streepjes op de site (Marijn, 22-10-2026: 'nooit nergens'): geen — of –, ook niet in paginatitels of JS-teksten.
  Scheidingsteken is · (bijv. 'Work · Marijn Chaouch'), uitzondering: '24–26' in de kop 'Selected (Work)' op de telefoon-home mag wel (Marijn, 22-10-2026), geen koppeltekens in zijn teksten ('Hi Tec', 'red toned').
  Slugs in links (project?p=hi-tec) blijven zoals ze zijn.
- Laden zonder flits (22-10-2026): de oude vaste home-inhoud (`.home-row`) is standaard verborgen (alleen bij `hv-fallback` zichtbaar);
  footer, grote naam, 'volgend project' en placeholders (`.ph`) zijn onzichtbaar tot `body.ready` (gezet na het opbouwen of bij offline()).
- Home-links onderaan (All work / About / Contact) als volle rijen zonder pijltjes.
- About scrollen (22-10-2026, Marijn: 'trippy en glitchy'): foto-parallax alleen met muis (desktop) en dan via `lenis.on('scroll')`
  in hetzelfde frame (eerst liep hij een frame achter); op telefoon/tablet geen parallax. Geen fade-ins op About.
- Ravi Nagarkar: `heroCount: 1` (zoals Snipes); ring-video vierkant (`ravi_ring-square.mp4`, uit Dropbox 2026/Augustus/Ravi/1.mov,
  crop rond de ring, zonder de gele rand).
- Drie staande video's naast elkaar vindt Marijn te druk: Snipes, Ravi, Nike x Patta en PAL Sporting Goods hebben `heroCount: 1`
  (één boven, de rest verspringend). Twee naast elkaar mag; PAL Lookbook houdt er bewust vier.
- Veld `thumb` (projects.json): vaste stilstaande foto voor de lijst op de telefoon-home (`media/thumb_<slug>.jpg`, 640x800, 4:5),
  door Marijn gekozen momenten (22-10-2026): Hi Tec vrouw bij gele rotsen, PAL masker-shot, PAL Lookbook franjejas, Mille gletsjer,
  Bacardi Casa-gebouw, Snipes drie jongens, Ravi rode stenen, Nike x Patta gele capuchon, Mizuno rots-silhouet, Travelteq stuur met zee. Zonder `thumb` de poster van de preview.
- Nachtstand (22-10-2026, wens Marijn): van 19:00 tot 07:00 lokale tijd van de bezoeker is de site zwart met wit (`html.night`).
  Eerste keuze via een klein script direct na `<meta charset>` in elke HTML (geen witte flits), daarna `nightClock()` in site.js
  dat precies om 07:00/19:00 wisselt en `theme-color` aanpast. Kleuren in het CSS-blok 'nacht' onderaan; grijs overal via `var(--soft)`.
  Logo's op About worden wit (`invert`), het roze About-vlak wordt zwart. Nachtkleuren neutraal: #000 met #FFF, grijs #8F8F8F
  (warm zwart #0F0E0D vond Marijn 'bruin zwart'). Test: `document.documentElement.classList.add('night')`.
- Witte scanranden (zichtbaar in de nachtstand) weggesneden bij de Morocco-foto's en tcs_amsterdam_03 (`-v2.jpg`, zelfde maat).
  Nieuwe foto's eerst checken op witte randen, ook dunne lijntjes van 1 tot 3 px (daarna nog vijf foto's -v3).
- TCS Marathon: film 'Mizuno edit V3' (Dropbox 2026/Oktober/Mizuno Marathon, 4:5, met geluid, `tcs_mizuno_edit.mp4`) na de twee
  hoofdfoto's als `span: "feature"` (groot, gecentreerd, ruimte eromheen) speelt vanzelf zoals de andere video's, met de Sound on/off-knop (geen speelknop); ~2 Mbit/s, `tcs_mizuno_edit-v2.mp4` (13.5 MB).
- Zwart thema staat ALTIJD aan (23-10-2026, Marijn): `class="night"` op `<html>` in elke pagina, theme-color #000000.
  De 19:00/07:00-timer (`nightClock`) is weg. Licht thema bestaat nog in de CSS (zonder `.night`), voor als hij terug wil.
