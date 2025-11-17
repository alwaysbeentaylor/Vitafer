// create-missing-variants.js
// Script om ontbrekende Black Friday varianten aan te maken in Shopify en HTML bij te werken

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';
// Probeer Admin token uit verschillende bronnen
let ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || 
                 process.env.ADMIN_TOKEN || 
                 null;

// Als geen token gevonden, vraag om input
if (!ADMIN_TOKEN) {
  console.log('⚠️  Admin API token niet gevonden in environment variabelen.');
  console.log('📝 Je kunt het token opgeven via:');
  console.log('   1. Environment variable: SHOPIFY_ADMIN_TOKEN=je_token node create-missing-variants.js');
  console.log('   2. Of zet het direct in het script (regel 6)');
  console.log('\n💡 Om een Admin token aan te maken:');
  console.log('   Shopify Admin → Settings → Apps and sales channels → Develop apps');
  console.log('   → Create app → Geef "Read and write products" rechten\n');
  
  // Voor nu: gebruik een placeholder die duidelijk maakt dat het nodig is
  ADMIN_TOKEN = 'VUL_ADMIN_TOKEN_HIER_IN';
}
const fs = require('fs');
const path = require('path');

// GraphQL query om producten op te halen
const PRODUCTS_QUERY = `
  query {
    products(first: 50) {
      edges {
        node {
          id
          title
          handle
          variants(first: 50) {
            edges {
              node {
                id
                title
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
`;

function extractNumericId(gid) {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : null;
}

async function createVariant(productId, title, price) {
  const mutation = `
    mutation {
      productVariantCreate(productId: "${productId}", input: {
        title: "${title}",
        price: "${price}",
        inventoryPolicy: CONTINUE
      }) {
        productVariant {
          id
          title
          price
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN
    },
    body: JSON.stringify({ query: mutation })
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
  }

  if (data.data.productVariantCreate.userErrors.length > 0) {
    throw new Error(`User Errors: ${JSON.stringify(data.data.productVariantCreate.userErrors)}`);
  }

  return data.data.productVariantCreate.productVariant;
}

async function createMissingVariants() {
  try {
    if (ADMIN_TOKEN === 'VUL_ADMIN_TOKEN_HIER_IN') {
      console.error('❌ FOUT: Admin API token niet ingesteld!');
      console.log('\n📝 Instructies:');
      console.log('1. Maak een Admin API token aan in Shopify:');
      console.log('   Settings → Apps and sales channels → Develop apps → Create app');
      console.log('2. Geef "Read and write products" rechten');
      console.log('3. Kopieer de Admin API access token');
      console.log('4. Run: SHOPIFY_ADMIN_TOKEN=je_token node create-missing-variants.js');
      console.log('   Of zet het in de code (regel 6)');
      process.exit(1);
    }

    console.log('🔄 Ophalen van producten van Shopify...\n');
    
    // Haal producten op via Storefront API
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
    console.log(`✅ ${products.length} product(en) gevonden\n`);

    // Zoek VFL Gold en Biofel producten
    let vflGoldProduct = null;
    let biofelProduct = null;
    let sachetsProduct = null;

    products.forEach(productEdge => {
      const product = productEdge.node;
      const productTitle = product.title.toLowerCase();
      const productHandle = product.handle.toLowerCase();
      
      if ((productTitle.includes('vfl') || productTitle.includes('vitafer') || productHandle.includes('vfl')) && 
          (productTitle.includes('gold') || productTitle.includes('bottle') || productTitle.includes('fles') || productTitle.includes('500ml'))) {
        vflGoldProduct = product;
        console.log(`📦 VFL Gold gevonden: ${product.title} (ID: ${extractNumericId(product.id)})`);
      }
      
      if (productTitle.includes('biofel') || productHandle.includes('biofel')) {
        biofelProduct = product;
        console.log(`📦 Biofel gevonden: ${product.title} (ID: ${extractNumericId(product.id)})`);
      }
      
      if (productTitle.includes('sachet') || productHandle.includes('sachet')) {
        sachetsProduct = product;
        console.log(`📦 Sachets gevonden: ${product.title} (ID: ${extractNumericId(product.id)})`);
      }
    });

    const foundVariants = {};
    const variantsToCreate = [];

    // Check VFL Gold 2 Flessen
    if (vflGoldProduct) {
      const has2Bottles = vflGoldProduct.variants.edges.some(v => {
        const price = parseFloat(v.node.price.amount);
        const title = (v.node.title || '').toLowerCase();
        return Math.abs(price - 94.95) < 0.01 || title.includes('2');
      });

      if (!has2Bottles) {
        console.log('\n⚠️  VFL Gold 2 Flessen variant ontbreekt - wordt aangemaakt...');
        variantsToCreate.push({
          productId: vflGoldProduct.id,
          productName: 'VFL Gold',
          title: '2 Flessen',
          price: '94.95',
          key: 'vfl-2-bottles'
        });
      } else {
        const variant = vflGoldProduct.variants.edges.find(v => {
          const price = parseFloat(v.node.price.amount);
          const title = (v.node.title || '').toLowerCase();
          return Math.abs(price - 94.95) < 0.01 || title.includes('2');
        });
        foundVariants['vfl-2-bottles'] = extractNumericId(variant.node.id);
        console.log(`✅ VFL Gold 2 Flessen bestaat al: ${foundVariants['vfl-2-bottles']}`);
      }
    }

    // Check Biofel 2 Flessen
    if (biofelProduct) {
      const has2Bottles = biofelProduct.variants.edges.some(v => {
        const price = parseFloat(v.node.price.amount);
        const title = (v.node.title || '').toLowerCase();
        return Math.abs(price - 94.95) < 0.01 || title.includes('2');
      });

      if (!has2Bottles) {
        console.log('\n⚠️  Biofel 2 Flessen variant ontbreekt - wordt aangemaakt...');
        variantsToCreate.push({
          productId: biofelProduct.id,
          productName: 'Biofel',
          title: '2 Flessen',
          price: '94.95',
          key: 'biofel-2-bottles'
        });
      } else {
        const variant = biofelProduct.variants.edges.find(v => {
          const price = parseFloat(v.node.price.amount);
          const title = (v.node.title || '').toLowerCase();
          return Math.abs(price - 94.95) < 0.01 || title.includes('2');
        });
        foundVariants['biofel-2-bottles'] = extractNumericId(variant.node.id);
        console.log(`✅ Biofel 2 Flessen bestaat al: ${foundVariants['biofel-2-bottles']}`);
      }
    }

    // Maak ontbrekende varianten aan
    for (const variant of variantsToCreate) {
      try {
        console.log(`\n🔄 Aanmaken: ${variant.productName} - ${variant.title} (€${variant.price})...`);
        const newVariant = await createVariant(variant.productId, variant.title, variant.price);
        const numericId = extractNumericId(newVariant.id);
        foundVariants[variant.key] = numericId;
        console.log(`✅ Variant aangemaakt! ID: ${numericId}`);
      } catch (error) {
        console.error(`❌ Fout bij aanmaken van ${variant.title}:`, error.message);
      }
    }

    // Update HTML
    if (Object.keys(foundVariants).length > 0) {
      console.log('\n🔄 Bijwerken van index.html...\n');
      
      const indexPath = path.join(__dirname, 'index.html');
      let htmlContent = fs.readFileSync(indexPath, 'utf8');
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
      }

      if (updatesMade > 0) {
        fs.writeFileSync(indexPath, htmlContent, 'utf8');
        console.log(`\n✅ ${updatesMade} variant ID(s) succesvol bijgewerkt in index.html!`);
      } else {
        console.log(`\n⚠️  Geen updates nodig.`);
      }
    } else {
      console.log('\n⚠️  Geen varianten gevonden of aangemaakt.');
    }

  } catch (error) {
    console.error('\n❌ Fout:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

createMissingVariants();

