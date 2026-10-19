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
- Pushen = live. Laat Marijn eerst zien wat er verandert en vraag akkoord voor je pusht.
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
- `site.js` laadt en speelt video's pas als ze in beeld zijn (IntersectionObserver) en pauzeert ze daarbuiten.

## Opmaak van Work

- Elk project op Work heeft een eigen opzet (`look-1` t/m `look-6`): 1 verspringende titel, 2 alles rechts,
  3 beeld eerst, 4 groot nummer, 5 hoofdletters, 6 inspringend met gegevens onder het beeld.
- Standaard wisselt de opzet met de plek in `data/projects.json`; met `"look": 4` (1 t/m 6) kies je er zelf een per project.
- Op desktop en tablet heeft elke opzet een eigen breedte en positie in een raster van 12 kolommen.
