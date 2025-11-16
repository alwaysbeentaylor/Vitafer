# ✅ Code is nu op GitHub!

Je repository: **https://github.com/alwaysbeentaylor/Vitafer**

---

## 📋 Volgende Stappen voor vitafer-gold.nl

### Stap 1: GitHub Pages Activeren ⚙️

1. Ga naar: https://github.com/alwaysbeentaylor/Vitafer/settings/pages
2. Onder **"Source"**:
   - Branch: selecteer `main`
   - Folder: selecteer `/ (root)`
   - Klik **Save**
3. Wacht 1-2 minuten en refresh de pagina
4. Je ziet: "Your site is live at `https://alwaysbeentaylor.github.io/Vitafer/`"

---

### Stap 2: Custom Domain Instellen (vitafer-gold.nl) 🌐

#### A. In GitHub Pages
1. Blijf op: https://github.com/alwaysbeentaylor/Vitafer/settings/pages
2. Onder **"Custom domain"**, typ: `vitafer-gold.nl`
3. Klik **Save**
4. Even geduld voor DNS check...
5. Na verificatie: vink **"Enforce HTTPS"** aan ✅

#### B. DNS Configuratie bij je Domein Provider

Ga naar je domein provider (bijv. TransIP, Versio, HostNet) en voeg toe:

**A Records (4 stuks):**
```
Type: A    | Name: @   | Value: 185.199.108.153 | TTL: 3600
Type: A    | Name: @   | Value: 185.199.109.153 | TTL: 3600
Type: A    | Name: @   | Value: 185.199.110.153 | TTL: 3600
Type: A    | Name: @   | Value: 185.199.111.153 | TTL: 3600
```

**CNAME Record (voor www):**
```
Type: CNAME | Name: www | Value: alwaysbeentaylor.github.io | TTL: 3600
```

⏰ **Wachttijd:** DNS propagatie duurt 15 minuten tot 48 uur

---

### Stap 3: Shopify Koppelen 🛒

Je hebt **3 opties**:

#### Optie A: Shopify Buy Button (Aanbevolen!)
- Behoud je mooie website op vitafer-gold.nl
- Voeg Shopify "Koop Nu" buttons toe aan je product pagina's
- Instructies in: `SHOPIFY-INTEGRATIE.md`

#### Optie B: Subdomain voor Shopify
- Website: `vitafer-gold.nl` (GitHub Pages)
- Webshop: `shop.vitafer-gold.nl` (Shopify)
- CNAME: `shop → shops.myshopify.com`

#### Optie C: Volledig via Shopify
- Hele website via Shopify hosten
- Domein volledig naar Shopify wijzen

---

### Stap 4: Testen 🧪

Na DNS propagatie, test:
- ✅ https://vitafer-gold.nl
- ✅ https://www.vitafer-gold.nl
- ✅ HTTPS werkt (groen slotje)
- ✅ Alle pagina's laden correct
- ✅ Shopify buttons werken

---

### Stap 5: SEO & Marketing 📈

1. **Google Search Console**
   - Voeg vitafer-gold.nl toe
   - Submit sitemap: `vitafer-gold.nl/sitemap.xml`

2. **Google Analytics** (optioneel)
   - Voeg tracking code toe

3. **Social Media**
   - Update links naar vitafer-gold.nl

---

## 📚 Documentatie Bestanden

- 📄 **DOMEIN-CONFIGURATIE.md** - Gedetailleerde DNS instructies
- 📄 **SHOPIFY-INTEGRATIE.md** - Shopify setup handleiding
- 📄 **README.md** - Project overzicht

---

## 🆘 Hulp Nodig?

### DNS Checken:
```powershell
nslookup vitafer-gold.nl
```

### Nieuwe wijzigingen uploaden:
```powershell
git add .
git commit -m "Beschrijving van wijziging"
git push
```

### Repository URL:
```
https://github.com/alwaysbeentaylor/Vitafer
```

---

## 🎯 Checklist

- [x] Git repository aangemaakt
- [x] Code naar GitHub gepusht
- [ ] GitHub Pages geactiveerd
- [ ] DNS records ingesteld bij domein provider
- [ ] Custom domain vitafer-gold.nl toegevoegd
- [ ] HTTPS geactiveerd
- [ ] Shopify producten gekoppeld
- [ ] Website getest op alle devices
- [ ] Google Search Console ingesteld

---

**Succes met je Vitafer Gold website! 🚀💊**

