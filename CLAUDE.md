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

## Overstap van Netlify (19-10-2026)

- De site draaide eerst op Netlify, betaald (ongeveer 10 euro per maand).
- Netlify mag pas opgezegd worden als `https://marijnchaouch.com` en `https://www.marijnchaouch.com`
  allebei via Vercel werken (met slotje). Sinds 19-10 werken beide met een geldig certificaat via Vercel (het kale domein stuurt met een 308 door naar www).
- Het beheerpaneel `/admin` (Decap CMS met Netlify Identity en Git Gateway) werkt niet op Vercel.
  Marijn wil wijzigingen via Claude doen, dus het paneel en het Netlify Identity-script in de pagina's mogen weg.

## Openstaande punten

1. Netlify opzeggen: kan nu, beide domeinen werken via Vercel. Marijn doet dit zelf.
2. `/admin` en het Netlify Identity-script uit de HTML-pagina's halen.
3. Beelden verkleinen: map is ongeveer 318 MB (media 142 MB). Uitschieters: `21.jpg` (13 MB),
   PNG-screenshots van 3 tot 7 MB, video's `main_final.mp4` (23 MB) en `trailrun_recap-_final-.mp4` (18 MB).
4. `index.html` en `work.html` laden `data/projects.js`, dat bestaat niet (fout in de console).
5. Vimeo, LinkedIn en KvK-nummer zijn nog leeg in `data/site.json`.
6. Klant "MIzuno" moet "Mizuno" zijn; slug `Mizuno-Neo-Accera` bevat hoofdletters.
7. Naam is niet overal gelijk: beheerpaneel zegt "Marijn-Sohail Chaouch", de site "Marijn Chaouch".

## Beelden aanleveren

- Foto's als JPG, ongeveer 2000 px aan de lange zijde.
- Video's als MP4 zonder geluid (ze spelen automatisch). Clips voor de homepage 5 tot 10 seconden.
