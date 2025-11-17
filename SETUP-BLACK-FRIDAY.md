# Black Friday Varianten Setup

Dit script maakt automatisch ontbrekende Black Friday varianten aan in Shopify en werkt de HTML bij.

## Snelstart

### Stap 1: Admin API Token Aanmaken

1. Ga naar **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Klik op **"Develop apps"** → **"Create app"**
3. Geef je app een naam (bijv. "Black Friday Setup")
4. Klik op **"Configure Admin API scopes"**
5. Vink aan: **"Read and write products"**
6. Klik op **"Save"** → **"Install app"**
7. Kopieer de **Admin API access token**

### Stap 2: Script Uitvoeren

**Optie A: Met environment variable (aanbevolen)**
```bash
SHOPIFY_ADMIN_TOKEN=je_token_hier node setup-black-friday-variants.js
```

**Optie B: Interactief (vraagt om token)**
```bash
node setup-black-friday-variants.js
```

**Optie C: Token in script zetten**
1. Open `setup-black-friday-variants.js`
2. Vervang regel 6: `let adminToken = process.env.SHOPIFY_ADMIN_TOKEN;`
3. Door: `let adminToken = 'je_token_hier';`
4. Run: `node setup-black-friday-variants.js`

## Wat het script doet

1. ✅ Haalt alle producten op uit Shopify
2. ✅ Controleert welke Black Friday varianten ontbreken:
   - VFL Gold 2 Flessen (€94,95)
   - Biofel 2 Flessen (€94,95)
3. ✅ Maakt ontbrekende varianten automatisch aan
4. ✅ Werkt `index.html` bij met de nieuwe variant IDs

## Varianten die worden aangemaakt

- **VFL Gold 2 Flessen**: €94,95
- **Biofel 2 Flessen**: €94,95

## Troubleshooting

### "Admin API token niet gevonden"
- Zorg dat je een Admin API token hebt aangemaakt met "Read and write products" rechten
- Controleer of het token correct is gekopieerd (geen spaties)

### "Product niet gevonden"
- Controleer of de producten bestaan in Shopify
- Productnamen moeten "VFL Gold" of "Biofel" bevatten

### "Variant bestaat al"
- Het script detecteert bestaande varianten automatisch
- Als een variant al bestaat, wordt alleen de ID bijgewerkt in HTML

## Handmatige Setup (als script niet werkt)

Als het script niet werkt, kun je handmatig:

1. **Varianten aanmaken in Shopify Admin:**
   - Ga naar het product (VFL Gold of Biofel)
   - Klik op "Add variant"
   - Titel: "2 Flessen"
   - Prijs: €94,95
   - Sla op

2. **Variant ID vinden:**
   - Klik op de variant
   - De ID staat in de URL: `/admin/products/PRODUCT_ID/variants/VARIANT_ID`
   - Kopieer alleen het nummer

3. **HTML bijwerken:**
   - Open `index.html`
   - Zoek: `data-shopify-variant-id="bf-2-bottles"` (voor VFL Gold)
   - Of: `data-shopify-variant-id="bf-2-biofel"` (voor Biofel)
   - Vervang door: `data-shopify-variant-id="VARIANT_ID"`

## Veiligheid

⚠️ **Belangrijk**: De Admin API token heeft volledige toegang tot je producten. Deel deze token NOOIT publiekelijk!

- Gebruik environment variables voor productie
- Voeg `.env` toe aan `.gitignore` als je tokens lokaal opslaat
- Rotate tokens regelmatig

