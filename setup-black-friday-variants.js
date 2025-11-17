// setup-black-friday-variants.js
// Script om automatisch ontbrekende Black Friday varianten aan te maken in Shopify

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// GraphQL queries
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

async function createVariant(adminToken, productId, title, price) {
  // Gebruik REST API om variant toe te voegen
  // Stuur alleen de nieuwe variant, niet alle varianten
  const newVariant = {
    title: title,
    price: price,
    inventory_policy: 'continue'
  };

  // Update product met alleen de nieuwe variant (Shopify voegt deze toe aan bestaande)
  const updateResponse = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products/${productId}.json`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken
    },
    body: JSON.stringify({
      product: {
        variants: [newVariant]  // Alleen nieuwe variant, Shopify voegt deze toe
      }
    })
  });

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    throw new Error(`Failed to update product: ${updateResponse.status} ${updateResponse.statusText} - ${errorText}`);
  }

  const updateData = await updateResponse.json();
  
  // Vind de nieuwe variant door te zoeken op titel en prijs
  const createdVariant = updateData.product.variants.find(v => 
    v.title === title && parseFloat(v.price) === parseFloat(price)
  ) || updateData.product.variants[updateData.product.variants.length - 1];
  
  return {
    id: `gid://shopify/ProductVariant/${createdVariant.id}`,
    title: createdVariant.title,
    price: createdVariant.price
  };
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function setupVariants() {
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  BLACK FRIDAY VARIANTEN SETUP');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Vraag Admin token - check command line argument eerst
    let adminToken = process.argv[2] || 
                     process.env.SHOPIFY_ADMIN_TOKEN || 
                     process.env.ADMIN_TOKEN;
    
    if (!adminToken) {
      console.log('📝 Admin API token nodig om varianten aan te maken.\n');
      console.log('💡 Om een token aan te maken:');
      console.log('   1. Ga naar Shopify Admin → Settings → Apps and sales channels');
      console.log('   2. Klik op "Develop apps" → "Create app"');
      console.log('   3. Geef "Read and write products" rechten');
      console.log('   4. Kopieer de Admin API access token\n');
      console.log('💡 Gebruik: node setup-black-friday-variants.js JE_TOKEN_HIER');
      console.log('   Of: SHOPIFY_ADMIN_TOKEN=je_token node setup-black-friday-variants.js\n');
      
      // Probeer interactief te vragen (alleen als stdin beschikbaar is)
      if (process.stdin.isTTY) {
        adminToken = await askQuestion('Voer je Admin API token in (of druk Enter om te stoppen): ');
        
        if (!adminToken || adminToken.trim() === '') {
          console.log('\n❌ Geen token ingevoerd. Script gestopt.');
          console.log('💡 Tip: node setup-black-friday-variants.js JE_TOKEN_HIER');
          process.exit(1);
        }
        adminToken = adminToken.trim();
      } else {
        console.log('❌ Geen token gevonden en geen interactieve input beschikbaar.');
        console.log('💡 Gebruik: node setup-black-friday-variants.js JE_TOKEN_HIER');
        process.exit(1);
      }
    } else {
      adminToken = adminToken.trim();
    }

    console.log('\n🔄 Ophalen van producten van Shopify...\n');
    
    // Haal producten op
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

    // Zoek producten
    let vflGoldProduct = null;
    let biofelProduct = null;

    products.forEach(productEdge => {
      const product = productEdge.node;
      const productTitle = product.title.toLowerCase();
      const productHandle = product.handle.toLowerCase();
      
      if ((productTitle.includes('vfl') || productTitle.includes('vitafer') || productHandle.includes('vfl')) && 
          (productTitle.includes('gold') || productTitle.includes('bottle') || productTitle.includes('fles') || productTitle.includes('500ml'))) {
        vflGoldProduct = product;
        console.log(`📦 VFL Gold gevonden: ${product.title}`);
      }
      
      if (productTitle.includes('biofel') || productHandle.includes('biofel')) {
        biofelProduct = product;
        console.log(`📦 Biofel gevonden: ${product.title}`);
      }
    });

    const foundVariants = {};
    const variantsToCreate = [];

    // Check VFL Gold 2 Flessen
    if (vflGoldProduct) {
      const has2Bottles = vflGoldProduct.variants.edges.some(v => {
        const price = parseFloat(v.node.price.amount);
        const title = (v.node.title || '').toLowerCase();
        return Math.abs(price - 94.95) < 0.01 || (title.includes('2') && !title.includes('3'));
      });

      if (!has2Bottles) {
        console.log('\n⚠️  VFL Gold 2 Flessen variant ontbreekt');
        variantsToCreate.push({
          productId: extractNumericId(vflGoldProduct.id),
          productName: 'VFL Gold',
          title: '2 Flessen',
          price: '94.95',
          key: 'vfl-2-bottles'
        });
      } else {
        const variant = vflGoldProduct.variants.edges.find(v => {
          const price = parseFloat(v.node.price.amount);
          const title = (v.node.title || '').toLowerCase();
          return Math.abs(price - 94.95) < 0.01 || (title.includes('2') && !title.includes('3'));
        });
        foundVariants['vfl-2-bottles'] = extractNumericId(variant.node.id);
        console.log(`✅ VFL Gold 2 Flessen bestaat al: ${foundVariants['vfl-2-bottles']}`);
      }
    } else {
      console.log('\n⚠️  VFL Gold product niet gevonden');
    }

    // Check Biofel 2 Flessen
    if (biofelProduct) {
      const has2Bottles = biofelProduct.variants.edges.some(v => {
        const price = parseFloat(v.node.price.amount);
        const title = (v.node.title || '').toLowerCase();
        return Math.abs(price - 94.95) < 0.01 || (title.includes('2') && !title.includes('3'));
      });

      if (!has2Bottles) {
        console.log('\n⚠️  Biofel 2 Flessen variant ontbreekt');
        variantsToCreate.push({
          productId: extractNumericId(biofelProduct.id),
          productName: 'Biofel',
          title: '2 Flessen',
          price: '94.95',
          key: 'biofel-2-bottles'
        });
      } else {
        const variant = biofelProduct.variants.edges.find(v => {
          const price = parseFloat(v.node.price.amount);
          const title = (v.node.title || '').toLowerCase();
          return Math.abs(price - 94.95) < 0.01 || (title.includes('2') && !title.includes('3'));
        });
        foundVariants['biofel-2-bottles'] = extractNumericId(variant.node.id);
        console.log(`✅ Biofel 2 Flessen bestaat al: ${foundVariants['biofel-2-bottles']}`);
      }
    } else {
      console.log('\n⚠️  Biofel product niet gevonden');
    }

    // Maak ontbrekende varianten aan
    if (variantsToCreate.length > 0) {
      console.log(`\n🔄 ${variantsToCreate.length} variant(en) worden aangemaakt...\n`);
      
      for (const variant of variantsToCreate) {
        try {
          console.log(`📝 Aanmaken: ${variant.productName} - ${variant.title} (€${variant.price})...`);
          const newVariant = await createVariant(adminToken, variant.productId, variant.title, variant.price);
          const numericId = extractNumericId(newVariant.id);
          foundVariants[variant.key] = numericId;
          console.log(`✅ Variant aangemaakt! ID: ${numericId}\n`);
        } catch (error) {
          console.error(`❌ Fout bij aanmaken van ${variant.title}:`, error.message);
        }
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
        console.log('\n🎉 Klaar! De Black Friday varianten zijn nu geconfigureerd.');
      } else {
        console.log(`\n⚠️  Geen updates nodig - varianten bestaan al.`);
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

setupVariants();

