# GitHub Upload Instructies

## Stap 1: GitHub Repository Aanmaken

1. Ga naar [GitHub.com](https://github.com) en log in
2. Klik op de **+** knop rechtsboven → **New repository**
3. Vul de volgende gegevens in:
   - **Repository name:** `Vitafer` of `vitafer-gold`
   - **Description:** `Vitafer Gold website - Premium multivitamine supplementen`
   - **Visibility:** Public (voor GitHub Pages gratis hosting)
   - **NIET** aanvinken: "Initialize this repository with a README"
4. Klik op **Create repository**

## Stap 2: Repository URL Kopiëren

Na het aanmaken zie je een pagina met instructies. Kopieer de URL die eindigt op `.git`

Bijvoorbeeld: `https://github.com/jouw-username/Vitafer.git`

## Stap 3: Code Uploaden

Open PowerShell in de Vitafer map en voer de volgende commando's uit:

```powershell
# Voeg de remote repository toe (vervang URL met jouw repository URL)
git remote add origin https://github.com/jouw-username/Vitafer.git

# Push de code naar GitHub
git branch -M main
git push -u origin main
```

Als je een wachtwoord nodig hebt, gebruik dan een **Personal Access Token** in plaats van je GitHub wachtwoord:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Selecteer `repo` scope
3. Gebruik deze token als wachtwoord

## Stap 4: GitHub Pages Activeren

1. Ga naar je repository op GitHub
2. Klik op **Settings** (tandwiel icoon)
3. Scroll naar beneden naar **Pages** (in het linkermenu)
4. Onder **Source**, selecteer:
   - Branch: `main`
   - Folder: `/ (root)`
5. Klik op **Save**
6. Wacht 1-2 minuten, refresh de pagina
7. Je ziet nu een groene banner met: "Your site is published at `https://jouw-username.github.io/Vitafer/`"

## Stap 5: Custom Domain Configureren

Zie het bestand **DOMEIN-CONFIGURATIE.md** voor gedetailleerde instructies over:
- DNS configuratie voor vitafer-gold.nl
- GitHub Pages custom domain setup
- HTTPS/SSL certificaat activeren
- Shopify integratie

## Troubleshooting

### "Permission denied" error
- Gebruik een Personal Access Token in plaats van je wachtwoord
- Of configureer SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### "Repository already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/jouw-username/Vitafer.git
```

### Updates pushen naar GitHub
Na wijzigingen in je code:
```powershell
git add .
git commit -m "Beschrijving van je wijzigingen"
git push
```

## Volgende Stappen

1. ✅ Code is op GitHub
2. ⏭️ Configureer domein vitafer-gold.nl (zie DOMEIN-CONFIGURATIE.md)
3. ⏭️ Integreer met Shopify (zie SHOPIFY-INTEGRATIE.md)
4. ⏭️ Test de website op alle devices
5. ⏭️ Configureer Google Analytics en Search Console

Succes! 🚀

