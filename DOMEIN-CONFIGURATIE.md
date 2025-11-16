# Domein Configuratie: vitafer-gold.nl

## Stap 1: GitHub Pages Setup

### Repository Instellingen
1. Ga naar je GitHub repository: `https://github.com/[jouw-username]/Vitafer`
2. Klik op **Settings** → **Pages**
3. Onder **Source**, selecteer:
   - Branch: `main` (of `master`)
   - Folder: `/ (root)`
4. Klik op **Save**

### Custom Domain Configureren
1. Blijf in **Settings** → **Pages**
2. Onder **Custom domain**, voer in: `vitafer-gold.nl`
3. Klik op **Save**
4. Wacht tot de DNS check compleet is
5. Vink **Enforce HTTPS** aan (na DNS verificatie)

---

## Stap 2: DNS Configuratie bij je Domein Provider

### A Records (voor apex domain: vitafer-gold.nl)
Voeg de volgende A records toe bij je DNS provider:

```
Type: A
Name: @
Value: 185.199.108.153
TTL: 3600

Type: A
Name: @
Value: 185.199.109.153
TTL: 3600

Type: A
Name: @
Value: 185.199.110.153
TTL: 3600

Type: A
Name: @
Value: 185.199.111.153
TTL: 3600
```

### CNAME Record (voor www subdomain)
```
Type: CNAME
Name: www
Value: [jouw-github-username].github.io
TTL: 3600
```

### CNAME File
GitHub zal automatisch een `CNAME` file aanmaken in je repository met de inhoud:
```
vitafer-gold.nl
```

---

## Stap 3: Verificatie

### DNS Propagatie Checken
1. Wacht 15-60 minuten voor DNS propagatie
2. Check met: `nslookup vitafer-gold.nl`
3. Check met: `nslookup www.vitafer-gold.nl`

### Website Testen
1. Open: `https://vitafer-gold.nl`
2. Open: `https://www.vitafer-gold.nl`
3. Controleer of HTTPS werkt (groen slotje)

---

## Stap 4: Shopify Integratie

### Optie A: Shopify Buy Button (Aanbevolen voor bestaande website)

1. **In Shopify Admin:**
   - Ga naar **Sales channels** → **+** → Voeg **Buy Button** toe
   - Selecteer je producten (Vitafer L Gold, Vitafer Premium)
   - Klik op **Generate code**
   - Kopieer de embed code

2. **In je HTML bestanden:**
   - Open `vitafer.html` en `vitafer-premium.html`
   - Vervang de huidige "Koop Nu" buttons met de Shopify Buy Button code
   - Voorbeeld:
   ```html
   <div id='product-component-1234567890'></div>
   <script type="text/javascript">
   /*<![CDATA[*/
   (function () {
     var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
     // ... Shopify generated code ...
   })();
   /*]]>*/
   </script>
   ```

### Optie B: Redirect naar Shopify Store

Als je een aparte Shopify store hebt op bijvoorbeeld `vitafer-gold.myshopify.com`:

1. **Koop buttons linken:**
   ```html
   <a href="https://vitafer-gold.myshopify.com/products/vitafer-l-gold" 
      class="buy-button">
     Koop Nu
   </a>
   ```

2. **Of gebruik een custom domain voor Shopify:**
   - In Shopify Admin: **Settings** → **Domains**
   - Voeg `shop.vitafer-gold.nl` toe als custom domain
   - Configureer DNS CNAME:
   ```
   Type: CNAME
   Name: shop
   Value: shops.myshopify.com
   TTL: 3600
   ```

### Optie C: Volledige Shopify Store als Hoofdwebsite

Als je de hele website via Shopify wilt hosten:

1. **In Shopify Admin:**
   - Ga naar **Online Store** → **Domains**
   - Klik op **Connect existing domain**
   - Voer `vitafer-gold.nl` in

2. **DNS Configuratie:**
   ```
   Type: A
   Name: @
   Value: 23.227.38.65
   TTL: 3600

   Type: CNAME
   Name: www
   Value: shops.myshopify.com
   TTL: 3600
   ```

---

## Stap 5: SEO & Analytics

### Google Search Console
1. Ga naar [Google Search Console](https://search.google.com/search-console)
2. Voeg `vitafer-gold.nl` toe als property
3. Verificeer met DNS TXT record of HTML file upload

### Google Analytics (optioneel)
1. Maak een Google Analytics account aan
2. Voeg tracking code toe aan alle HTML pagina's
3. Plaats voor de `</head>` tag:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Troubleshooting

### Website niet bereikbaar
- Check DNS propagatie: `nslookup vitafer-gold.nl`
- Wacht tot 48 uur voor volledige DNS propagatie
- Controleer of GitHub Pages is ingeschakeld

### HTTPS werkt niet
- Wacht 24 uur na DNS configuratie
- Zorg dat DNS correct is ingesteld
- Heractiveer "Enforce HTTPS" in GitHub Pages settings

### Shopify buttons werken niet
- Check of JavaScript is ingeschakeld
- Controleer browser console voor errors (F12)
- Verificeer dat de Shopify embed code correct is gekopieerd

---

## Contact & Support

Voor vragen over:
- **Domein configuratie:** Neem contact op met je DNS provider
- **GitHub Pages:** [GitHub Pages Documentation](https://docs.github.com/en/pages)
- **Shopify:** [Shopify Help Center](https://help.shopify.com/)

