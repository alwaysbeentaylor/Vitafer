# Shopify Variant IDs voor Black Friday

## Overzicht
Deze pagina gebruikt Shopify variant IDs om producten toe te voegen aan de winkelwagen. Sommige variant IDs moeten nog worden ingevuld.

## Huidige Variant IDs

### VFL Gold 500ml Bottle
- ✅ **1 Fles (€49,95)**: `52127630688522` - **GELDIG**
- ❌ **2 Flessen (€94,95)**: `bf-2-bottles` - **MOET WORDEN VERVANGEN**
- ✅ **3 Flessen (€139,95)**: `52128254755082` - **GELDIG**

### Biofel
- ✅ **1 Fles (€49,95)**: `52128254787850` - **GELDIG**
- ❌ **2 Flessen (€94,95)**: `bf-2-biofel` - **MOET WORDEN VERVANGEN**
- ✅ **3 Flessen (€139,95)**: `52128254820618` - **GELDIG**

### VFL Gold Sachets
- ✅ **3 stuks (€15,00)**: `52128254853386` - **GELDIG**
- ❌ **5 stuks (€25,00)**: `VUL_SACHET_5_ID` - **MOET WORDEN VERVANGEN**
- ❌ **10 stuks (€45,00)**: `VUL_SACHET_10_ID` - **MOET WORDEN VERVANGEN**
- ❌ **15 stuks (€67,50)**: `VUL_SACHET_15_ID` - **MOET WORDEN VERVANGEN**
- ❌ **20 stuks (€90,00)**: `VUL_SACHET_20_ID` - **MOET WORDEN VERVANGEN**
- ❌ **30 stuks (€135,00)**: `VUL_SACHET_30_ID` - **MOET WORDEN VERVANGEN**

## Hoe Variant IDs te vinden

### Methode 1: Via Shopify Admin
1. Ga naar Shopify Admin → Products
2. Klik op het product (bijv. "VFL Gold 500ml")
3. Scroll naar "Variants"
4. Klik op de variant die je nodig hebt
5. De Variant ID staat in de URL: `/admin/products/PRODUCT_ID/variants/VARIANT_ID`
6. Kopieer alleen het nummer (bijv. `52127630688522`)

### Methode 2: Via Variant Finder Tool
1. Open `shopify-variant-finder.html` in je browser
2. Vul je Shopify store domain in: `1u0ui4-02.myshopify.com`
3. Vul je Admin API access token in
4. Klik op "Haal Variant IDs Op"
5. Zoek de juiste variant IDs voor je producten

### Methode 3: Via Storefront API (GraphQL)
```graphql
query {
  products(first: 10) {
    edges {
      node {
        title
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
            }
          }
        }
      }
    }
  }
}
```

## Variant IDs Vervangen in index.html

### Stap 1: VFL Gold 2 Flessen
Zoek naar:
```html
data-shopify-variant-id="bf-2-bottles"
```

Vervang door:
```html
data-shopify-variant-id="[VARIANT_ID_VAN_2_FLESSEN]"
```

### Stap 2: Biofel 2 Flessen
Zoek naar:
```html
data-shopify-variant-id="bf-2-biofel"
```

Vervang door:
```html
data-shopify-variant-id="[VARIANT_ID_VAN_2_FLESSEN_BIOFEL]"
```

### Stap 3: Sachets Variant IDs
Zoek naar elke `VUL_SACHET_X_ID` en vervang:
- `VUL_SACHET_5_ID` → Variant ID voor 5 sachets
- `VUL_SACHET_10_ID` → Variant ID voor 10 sachets
- `VUL_SACHET_15_ID` → Variant ID voor 15 sachets
- `VUL_SACHET_20_ID` → Variant ID voor 20 sachets
- `VUL_SACHET_30_ID` → Variant ID voor 30 sachets

## Belangrijk

⚠️ **Zonder geldige variant IDs werken de "Voeg Toe" knoppen niet voor checkout!**

De checkout functie filtert automatisch items zonder geldige variant IDs. Items met placeholder IDs worden genegeerd bij het aanmaken van de Shopify cart.

## Testen

Na het invullen van alle variant IDs:
1. Open `index.html` in je browser
2. Voeg producten toe aan de winkelwagen
3. Klik op "Naar Checkout"
4. Controleer of je naar Shopify checkout wordt doorgestuurd
5. Controleer of alle producten correct worden weergegeven

## Opmerkingen

- Variant IDs zijn altijd numeriek (alleen cijfers)
- Elke variant heeft een unieke ID
- De variant ID moet exact overeenkomen met de ID in Shopify
- Controleer altijd of de prijs in Shopify overeenkomt met de prijs op de website

