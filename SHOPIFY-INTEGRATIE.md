# 🛍️ Vitafer Gold Shopify Integratie Gids

Deze gids helpt je om de Vitafer website te integreren met je Shopify store op vitafer-gold.nl.

## 📦 Wat je krijgt

1. **Liquid template sectie** (`vfl-gold-landing.liquid`)
2. **CSS bestand** (`vfl-gold-styles.css`)
3. **JavaScript bestand** (`vfl-gold-scripts.js`)
4. **Setup instructies** voor theme integratie
5. **Productconfiguratie** voorbeelden

---

## 🚀 Stappenplan

### Stap 1: Voorbereiding

1. **Backup je huidige theme**
   - Shopify Admin → Online Store → Themes → Actions → Duplicate

2. **Maak producten aan**
   - Vitafer L Gold (500ml fles)
   - Vitafer Premium (sachets)
   - Eventuele andere Vitafer producten

3. **Upload afbeeldingen**
   - Upload alle product afbeeldingen naar Shopify Files
   - Noteer de CDN URLs

### Stap 2: Sectie Installatie

1. **Voeg sectie toe**
   - Shopify Admin → Online Store → Themes → Actions → Edit code
   - Sections → Add a new section → `vitafer-landing`
   - Plak de inhoud van de Liquid template

2. **Voeg CSS toe**
   - Assets → Add a new asset → `vitafer-styles.css`
   - Plak de CSS code uit je HTML bestanden

3. **Voeg JavaScript toe**
   - Assets → Add a new asset → `vitafer-scripts.js`
   - Plak de JavaScript code indien nodig

### Stap 3: Page Template

Maak een nieuw page template aan:

**templates/page.vitafer-landing.json**
```json
{
  "sections": {
    "vitafer-landing": {
      "type": "vitafer-landing",
      "settings": {
        "vitafer_gold_product": "vitafer-l-gold-500ml",
        "vitafer_premium_product": "vitafer-premium-sachets"
      }
    }
  },
  "order": [
    "vitafer-landing"
  ]
}
```

### Stap 4: Pagina aanmaken

1. **Nieuwe pagina**
   - Shopify Admin → Online Store → Pages → Add page
   - Titel: "Vitafer Gold"
   - Template: `page.vitafer-landing`

2. **Homepage instellen** (optioneel)
   - Online Store → Themes → Customize
   - Homepage → Change template → Select "Vitafer Landing"

---

## 🔧 Configuratie

### Product Metafields

Voeg custom metafields toe voor urgency/voorraad:

```
Namespace: custom
Key: stock_count (type: integer)
Key: low_stock_threshold (type: integer)
```

### Shopify Settings Schema

De sectie heeft ingebouwde settings voor:

- ✅ Product selectie per variant
- ✅ Kleuren en branding
- ✅ Urgency berichten aan/uit
- ✅ Exit popup timing
- ✅ Social proof ticker configuratie

---

## 🎨 Customization

### Kleuren aanpassen

In de sectie settings kun je aanpassen:
- Primaire goudkleur
- Achtergrondkleuren  
- Tekstkleuren
- Button styling

### Teksten wijzigen

Alle teksten zijn editable via de Shopify theme editor.

---

## 📱 Responsive & Performance

De sectie is volledig:
- ✅ Mobile-first responsive
- ✅ Touch-friendly (360° rotatie werkt op touch)
- ✅ Lazy-loading afbeeldingen
- ✅ Optimized voor Core Web Vitals

---

## 🛒 Ajax Cart Integratie

De "Voeg toe" knoppen gebruiken Shopify's Ajax Cart API:

```javascript
fetch('/cart/add.js', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: [{
      id: variantId,
      quantity: quantity
    }]
  })
})
```

De cart dropdown gebruikt het theme's cart drawer (indien beschikbaar).

---

## 🧪 Testen

1. **Test checkout flow**
   - Voeg producten toe
   - Controleer cart
   - Doorloop checkout

2. **Test op alle devices**
   - Desktop
   - Tablet
   - Mobile

3. **Test tracking**
   - Google Analytics events
   - Facebook Pixel (indien geconfigureerd)

---

## ⚠️ Belangrijke Notities

### SEO

- **Noindex is ingesteld** in de HTML versie
- Voor productie: verwijder `<meta name="robots" content="noindex, nofollow">`
- Voeg structured data toe via Shopify's ingebouwde schema

### Performance

- Afbeeldingen moeten WebP formaat zijn voor optimale performance
- Gebruik Shopify's CDN voor alle assets
- Minify CSS/JS via Shopify theme settings

### Bot Protection

- Gebruik Shopify's ingebouwde bot protection
- Overweeg reCAPTCHA op checkout
- Monitor traffic via Shopify Analytics

---

## 📞 Support

Voor vragen over de integratie:
- Check Shopify documentatie: https://shopify.dev
- Domein configuratie: Zie DOMEIN-CONFIGURATIE.md

---

## 🎉 Gereed!

Na het volgen van deze stappen heb je een volledig werkende Vitafer website geïntegreerd met Shopify:

✅ Custom domein vitafer-gold.nl
✅ Shopify product integratie  
✅ Ajax cart functionaliteit  
✅ Mobile responsive design  
✅ SEO geoptimaliseerd  

Veel succes met je Vitafer Gold shop! 🚀

