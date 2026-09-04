# marijnchaouch.com

Een statische site met een eigen beheerpaneel. Je past alles aan via een inlogpagina
op je eigen site, dus je hoeft nooit in de code.

## Wat waar staat

- `index.html`, `work.html`, `project.html`, `about.html`, `contact.html` zijn de pagina's
- `data/projects.json` bevat je projecten, `data/site.json` je teksten en gegevens
- `media/` bevat je foto's en video's
- `admin/` is het beheerpaneel
- `assets/` is de vormgeving, daar hoef je niets aan te doen

Let op: als je `index.html` rechtstreeks op je computer opent zie je geen projecten.
Dat komt doordat een browser dan geen bestanden mag inladen. Online werkt het gewoon.

## Eenmalig online zetten

Je hebt hier twee gratis accounts voor nodig, GitHub en Netlify. GitHub bewaart de
bestanden, Netlify zet ze online. Daarna hoef je alleen nog het beheerpaneel te gebruiken.

1. Maak een account op github.com.
2. Klik op New repository, geef hem de naam `marijnchaouch`, zet hem op Public en maak hem aan.
3. Klik op uploading an existing file en sleep alle bestanden uit deze map erin. Klik daarna op Commit changes.
4. Maak een account op netlify.com en kies Add new site, dan Import an existing project, dan GitHub, en kies je repository. Laat alle instellingen leeg en klik op Deploy.
5. Ga in Netlify naar Domain settings, klik Add domain en vul marijnchaouch.com in. Netlify laat dan zien welke twee regels je bij je domeinprovider moet invullen.

## Het beheerpaneel aanzetten

1. Ga in Netlify naar Site configuration, dan Identity, en klik op Enable Identity.
2. Zet bij Registration de optie op Invite only, zodat niemand anders kan inloggen.
3. Klik in Identity op Services, dan Git Gateway, en zet die aan.
4. Ga naar het tabblad Identity bovenin, klik Invite users en nodig je eigen e-mailadres uit.
5. Je krijgt een mail, klik op de link en kies een wachtwoord.

Vanaf dan log je in op marijnchaouch.com/admin.

## Zo voeg je een project toe

Ga naar marijnchaouch.com/admin, log in, klik op Projecten en dan op Alle projecten.
Klik onderaan de lijst op Add en vul in: titel, klant, jaar, of het foto of video is,
een korte intro, en sleep je beelden erin. Het vakje Op de homepage tonen bepaalt of
het project meedraait in de wisselende beelden op je home.

Klik daarna op Publish. Binnen een minuut staat het op je site.

Teksten aanpassen gaat hetzelfde, via Teksten en dan Teksten en gegevens. Daar staan de
zin op je homepage, je verhaal bij About en je contactgegevens.

## Beeld aanleveren

Foto's als JPG van ongeveer 2000 pixels aan de lange zijde, dat is scherp genoeg en
houdt de site snel. Video's als MP4 zonder geluid, want ze spelen vanzelf af. Houd
clips voor de homepage kort, vijf tot tien seconden loopt het mooist.

## Nog invullen

Je Vimeo en LinkedIn link en je KvK nummer staan nog leeg in het beheerpaneel.
