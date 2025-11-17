// auto-update-variant-ids.js
// Script om automatisch variant IDs op te halen en index.html bij te werken

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';
const fs = require('fs');
const path = require('path');

// GraphQL query om alle producten met varianten op te halen
const PRODUCTS_QUERY = `
  query {
    products(first: 50) {
      edges {
        node {
          id
          title
          handle
          productType
          variants(first: 50) {
            edges {
              node {
                id
                title
                price {
                  amount
                }
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

// Functie om numerieke ID uit GID te halen
function extractNumericId(gid) {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : null;
}

async function fetchAndUpdateVariants() {
  try {
    console.log('🔄 Ophalen van producten van Shopify...\n');
    
    const response = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    const products = data.data.products.edges;
    console.log(`✅ ${products.length} producten gevonden\n`);

    // Lees index.html
    const indexPath = path.join(__dirname, 'index.html');
    let htmlContent = fs.readFileSync(indexPath, 'utf8');

    // Mapping van gevonden variant IDs
    const foundVariants = {
      'vfl-2-bottles': null,
      'biofel-2-bottles': null,
      'sachet-5': null,
      'sachet-10': null,
      'sachet-15': null,
      'sachet-20': null,
      'sachet-30': null
    };

    // Zoek producten en match varianten
    products.forEach(productEdge => {
      const product = productEdge.node;
      const productTitle = product.title.toLowerCase();
      const productHandle = product.handle.toLowerCase();
      
      console.log(`📦 Product: ${product.title} (${productHandle})`);
      
      product.variants.edges.forEach(variantEdge => {
        const variant = variantEdge.node;
        const numericId = extractNumericId(variant.id);
        const price = parseFloat(variant.price.amount);
        const variantTitle = (variant.title || 'Default Title').toLowerCase();
        
        console.log(`   Variant: ${variant.title || 'Default'} - €${price.toFixed(2)} (ID: ${numericId})`);
        
        // Match VFL Gold Bottle - 2 flessen (€94,95)
        // Ook match op variant titel die "2" bevat
        if ((productTitle.includes('vfl') || productTitle.includes('vitafer') || productHandle.includes('vfl') || productHandle.includes('vitafer')) && 
            (productTitle.includes('gold') || productTitle.includes('bottle') || productTitle.includes('fles') || productTitle.includes('500ml') || productHandle.includes('gold') || productHandle.includes('bottle'))) {
          if ((Math.abs(price - 94.95) < 0.01 || variantTitle.includes('2') || variantTitle.includes('twee')) && !foundVariants['vfl-2-bottles']) {
            foundVariants['vfl-2-bottles'] = numericId;
            console.log(`   ✅ MATCH: VFL Gold 2 Flessen (€${price.toFixed(2)}) -> ${numericId}`);
          }
        }
        
        // Match Biofel - 2 flessen (€94,95)
        if (productTitle.includes('biofel') || productHandle.includes('biofel')) {
          if ((Math.abs(price - 94.95) < 0.01 || variantTitle.includes('2') || variantTitle.includes('twee')) && !foundVariants['biofel-2-bottles']) {
            foundVariants['biofel-2-bottles'] = numericId;
            console.log(`   ✅ MATCH: Biofel 2 Flessen (€${price.toFixed(2)}) -> ${numericId}`);
          }
        }
        
        // Match Sachets - flexibele matching
        if (productTitle.includes('sachet') || productHandle.includes('sachet') || productTitle.includes('sachets')) {
          // Match op prijs met kleine marge
          if (Math.abs(price - 25.00) < 0.5 && !foundVariants['sachet-5']) {
            foundVariants['sachet-5'] = numericId;
            console.log(`   ✅ MATCH: Sachets ~5 stuks (€${price.toFixed(2)}) -> ${numericId}`);
          }
          if (Math.abs(price - 45.00) < 0.5 && !foundVariants['sachet-10']) {
            foundVariants['sachet-10'] = numericId;
            console.log(`   ✅ MATCH: Sachets ~10 stuks (€${price.toFixed(2)}) -> ${numericId}`);
          }
          if (Math.abs(price - 67.50) < 0.5 && !foundVariants['sachet-15']) {
            foundVariants['sachet-15'] = numericId;
            console.log(`   ✅ MATCH: Sachets ~15 stuks (€${price.toFixed(2)}) -> ${numericId}`);
          }
          if (Math.abs(price - 90.00) < 0.5 && !foundVariants['sachet-20']) {
            foundVariants['sachet-20'] = numericId;
            console.log(`   ✅ MATCH: Sachets ~20 stuks (€${price.toFixed(2)}) -> ${numericId}`);
          }
          if (Math.abs(price - 135.00) < 0.5 && !foundVariants['sachet-30']) {
            foundVariants['sachet-30'] = numericId;
            console.log(`   ✅ MATCH: Sachets ~30 stuks (€${price.toFixed(2)}) -> ${numericId}`);
          }
        }
      });
      console.log('');
    });

    // Update HTML met gevonden variant IDs
    console.log('\n🔄 Bijwerken van index.html...\n');

    let updatesMade = 0;

    // VFL Gold 2 Flessen
    if (foundVariants['vfl-2-bottles']) {
      const oldContent = htmlContent;
      htmlContent = htmlContent.replace(
        /data-shopify-variant-id="bf-2-bottles"/g,
        `data-shopify-variant-id="${foundVariants['vfl-2-bottles']}"`
      );
      if (oldContent !== htmlContent) {
        console.log(`✅ VFL Gold 2 Flessen: ${foundVariants['vfl-2-bottles']}`);
        updatesMade++;
      }
    } else {
      console.log(`⚠️  VFL Gold 2 Flessen (€94,95) niet gevonden`);
    }

    // Biofel 2 Flessen
    if (foundVariants['biofel-2-bottles']) {
      const oldContent = htmlContent;
      htmlContent = htmlContent.replace(
        /data-shopify-variant-id="bf-2-biofel"/g,
        `data-shopify-variant-id="${foundVariants['biofel-2-bottles']}"`
      );
      if (oldContent !== htmlContent) {
        console.log(`✅ Biofel 2 Flessen: ${foundVariants['biofel-2-bottles']}`);
        updatesMade++;
      }
    } else {
      console.log(`⚠️  Biofel 2 Flessen (€94,95) niet gevonden`);
    }

    // Sachets
    const sachetReplacements = [
      { placeholder: 'VUL_SACHET_5_ID', key: 'sachet-5', name: '5 stuks' },
      { placeholder: 'VUL_SACHET_10_ID', key: 'sachet-10', name: '10 stuks' },
      { placeholder: 'VUL_SACHET_15_ID', key: 'sachet-15', name: '15 stuks' },
      { placeholder: 'VUL_SACHET_20_ID', key: 'sachet-20', name: '20 stuks' },
      { placeholder: 'VUL_SACHET_30_ID', key: 'sachet-30', name: '30 stuks' }
    ];

    sachetReplacements.forEach(({ placeholder, key, name }) => {
      if (foundVariants[key]) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          new RegExp(`data-shopify-variant-id="${placeholder}"`, 'g'),
          `data-shopify-variant-id="${foundVariants[key]}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ Sachets ${name}: ${foundVariants[key]}`);
          updatesMade++;
        }
      } else {
        console.log(`⚠️  Sachets ${name} niet gevonden`);
      }
    });

    // Schrijf bijgewerkte HTML terug
    if (updatesMade > 0) {
      fs.writeFileSync(indexPath, htmlContent, 'utf8');
      console.log(`\n✅ ${updatesMade} variant ID(s) succesvol bijgewerkt in index.html!`);
    } else {
      console.log(`\n⚠️  Geen variant IDs gevonden om bij te werken.`);
      console.log(`   Controleer of de producten en prijzen correct zijn ingesteld in Shopify.`);
    }

  } catch (error) {
    console.error('\n❌ Fout:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run script
fetchAndUpdateVariants();

