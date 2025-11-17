// create-all-products.js
// Script om alle Black Friday producten en varianten aan te maken in Shopify

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';
const fs = require('fs');
const path = require('path');

// Alle producten die moeten bestaan
const REQUIRED_PRODUCTS = {
  'vfl-gold': {
    title: 'VFL Gold 500ml',
    handle: 'vfl-gold-500ml',
    description: 'Vloeibare premium multivitamine formule (500ml) voor dagelijkse energie, focus en herstel.',
    variants: [
      { title: 'Default Title', price: '49.95' },
      { title: '2 Flessen', price: '94.95' },
      { title: '3 Flessen', price: '139.95' }
    ]
  },
  'biofel': {
    title: 'Biofel',
    handle: 'biofel',
    description: 'Natuurlijke bio-actieve blend voor dagelijkse energie en balans. Geselecteerde ingrediënten voor optimale vitaliteit.',
    variants: [
      { title: 'Default Title', price: '49.95' },
      { title: '2 Flessen', price: '94.95' },
      { title: '3 Flessen', price: '139.95' }
    ]
  },
  'sachets': {
    title: 'VFL Gold Sachets',
    handle: 'vfl-gold-sachets',
    description: 'Handige dagdosering (10ml per sachet) voor onderweg. Zelfde gouden formule, maximale gemak.',
    variants: [
      { title: '3 stuks', price: '15.00' },
      { title: '5 stuks', price: '25.00' },
      { title: '10 stuks', price: '45.00' },
      { title: '15 stuks', price: '67.50' },
      { title: '20 stuks', price: '90.00' },
      { title: '30 stuks', price: '135.00' }
    ],
    skipDefaultTitle: true  // Geen Default Title voor sachets
  }
};

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

async function createProduct(adminToken, productData) {
  // Filter "Default Title" varianten eruit als skipDefaultTitle is ingesteld
  let variantsToCreate = productData.skipDefaultTitle 
    ? productData.variants.filter(v => v.title !== 'Default Title')
    : productData.variants;

  // Als er geen varianten zijn, gebruik de eerste
  if (variantsToCreate.length === 0 && productData.variants.length > 0) {
    variantsToCreate = [productData.variants[0]];
  }

  // Maak product aan met alleen de eerste variant (Shopify maakt automatisch Default Title aan)
  // Dan voegen we de rest toe
  const firstVariant = variantsToCreate[0];
  const remainingVariants = variantsToCreate.slice(1);

  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken
    },
    body: JSON.stringify({
      product: {
        title: productData.title,
        body_html: productData.description,
        vendor: 'Vitafer',
        product_type: 'Supplements',
        variants: [{
          title: firstVariant.title,
          price: firstVariant.price,
          inventory_policy: 'continue'
        }]
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create product: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.product) {
    throw new Error(`Product creation failed: ${JSON.stringify(data)}`);
  }
  
  const createdProduct = data.product;

  // Voeg resterende varianten toe
  const numericProductId = typeof createdProduct.id === 'string' && createdProduct.id.includes('/') 
    ? extractNumericId(createdProduct.id) 
    : createdProduct.id;
  for (const variant of remainingVariants) {
    try {
      await addVariantToProduct(adminToken, numericProductId, variant);
    } catch (error) {
      console.warn(`   ⚠️  Kon variant "${variant.title}" niet toevoegen: ${error.message}`);
    }
  }

  // Haal product opnieuw op via GraphQL om alle varianten te hebben (in GID formaat)
  const getResponse = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query: `
        query {
          product(id: "gid://shopify/Product/${numericProductId}") {
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
      `
    })
  });
  
  const getData = await getResponse.json();
  if (getData.errors || !getData.data || !getData.data.product) {
    // Fallback: gebruik REST API response en converteer naar GraphQL formaat
    return {
      id: `gid://shopify/Product/${numericProductId}`,
      title: createdProduct.title,
      handle: createdProduct.handle,
      variants: {
        edges: createdProduct.variants.map(v => ({
          node: {
            id: `gid://shopify/ProductVariant/${v.id}`,
            title: v.title || 'Default Title',
            price: { amount: v.price }
          }
        }))
      }
    };
  }
  return getData.data.product;
}

async function addVariantToProduct(adminToken, productId, variantData) {
  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products/${productId}.json`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken
    },
    body: JSON.stringify({
      product: {
        variants: [{
          title: variantData.title,
          price: variantData.price,
          inventory_policy: 'continue'
        }]
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add variant: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.product.variants[data.product.variants.length - 1];
}

async function setupAllProducts() {
  try {
    const adminToken = process.argv[2] || process.env.SHOPIFY_ADMIN_TOKEN || process.env.ADMIN_TOKEN;
    
    if (!adminToken) {
      console.log('❌ Admin API token nodig!');
      console.log('💡 Gebruik: node create-all-products.js JE_TOKEN');
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ALLE BLACK FRIDAY PRODUCTEN SETUP');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Haal bestaande producten op
    console.log('🔄 Ophalen van bestaande producten...\n');
    
    const response = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query: PRODUCTS_QUERY })
    });

    const data = await response.json();
    const existingProducts = data.data.products.edges.map(e => e.node);
    
    console.log(`✅ ${existingProducts.length} bestaand(e) product(en) gevonden\n`);

    const productMap = {};
    const variantMap = {};

    // Map bestaande producten
    existingProducts.forEach(product => {
      const handle = product.handle.toLowerCase();
      const title = product.title.toLowerCase();
      
      if (title.includes('vfl') && (title.includes('gold') || title.includes('bottle') || title.includes('500ml'))) {
        productMap['vfl-gold'] = product;
      } else if (title.includes('biofel')) {
        productMap['biofel'] = product;
      } else if (title.includes('sachet')) {
        productMap['sachets'] = product;
      }
    });

    // Verwerk elk vereist product
    for (const [key, requiredProduct] of Object.entries(REQUIRED_PRODUCTS)) {
      console.log(`\n📦 ${requiredProduct.title}`);
      console.log('─'.repeat(60));

      let product = productMap[key];

      // Maak product aan als het niet bestaat
      if (!product) {
        console.log(`⚠️  Product bestaat niet - wordt aangemaakt...`);
        try {
          product = await createProduct(adminToken, requiredProduct);
          const numericId = extractNumericId(product.id);
          console.log(`✅ Product aangemaakt! ID: ${numericId}`);
        } catch (error) {
          console.error(`❌ Fout bij aanmaken product: ${error.message}`);
          continue;
        }
      } else {
        const numericId = extractNumericId(product.id);
        console.log(`✅ Product bestaat al: ID ${numericId}`);
      }

      // Check en maak varianten aan
      const existingVariants = product.variants.edges.map(e => ({
        id: extractNumericId(e.node.id),
        title: e.node.title || 'Default Title',
        price: parseFloat(e.node.price.amount)
      }));

      for (const requiredVariant of requiredProduct.variants) {
        const variantTitle = requiredVariant.title;
        const variantPrice = parseFloat(requiredVariant.price);
        
        // Voor "Default Title", match op prijs alleen (titel kan verschillen)
        let existingVariant;
        if (variantTitle === 'Default Title') {
          existingVariant = existingVariants.find(v => Math.abs(v.price - variantPrice) < 0.01);
        } else {
          existingVariant = existingVariants.find(v => 
            v.title === variantTitle && Math.abs(v.price - variantPrice) < 0.01
          );
        }

        if (existingVariant) {
          console.log(`   ✅ Variant "${variantTitle}" (€${variantPrice.toFixed(2)}) bestaat al: ${existingVariant.id}`);
          variantMap[`${key}-${variantTitle.toLowerCase().replace(/\s+/g, '-')}`] = existingVariant.id;
        } else {
          // Skip "Default Title" als er al varianten zijn (om duplicaat te voorkomen)
          if (variantTitle === 'Default Title' && (existingVariants.length > 0 || REQUIRED_PRODUCTS[key].skipDefaultTitle)) {
            if (existingVariants.length > 0) {
              // Gebruik de eerste bestaande variant als "Default Title"
              const firstVariant = existingVariants[0];
              console.log(`   ℹ️  Variant "${variantTitle}" overslaan (gebruik bestaande: ${firstVariant.id})`);
              variantMap[`${key}-default-title`] = firstVariant.id;
            } else {
              console.log(`   ℹ️  Variant "${variantTitle}" overslaan (niet nodig voor dit product)`);
            }
          } else {
            console.log(`   ⚠️  Variant "${variantTitle}" ontbreekt - wordt toegevoegd...`);
            try {
              const numericProductId = extractNumericId(product.id);
              const newVariant = await addVariantToProduct(adminToken, numericProductId, requiredVariant);
              const newVariantId = newVariant.id;
              console.log(`   ✅ Variant aangemaakt! ID: ${newVariantId}`);
              variantMap[`${key}-${variantTitle.toLowerCase().replace(/\s+/g, '-')}`] = newVariantId;
            } catch (error) {
              console.error(`   ❌ Fout bij aanmaken variant: ${error.message}`);
            }
          }
        }
      }
    }

    // Update HTML met alle variant IDs
    if (Object.keys(variantMap).length > 0) {
      console.log('\n\n🔄 Bijwerken van index.html...\n');
      
      const indexPath = path.join(__dirname, 'index.html');
      let htmlContent = fs.readFileSync(indexPath, 'utf8');
      let updatesMade = 0;

      // VFL Gold varianten
      if (variantMap['vfl-gold-default-title']) {
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52127630688522"/g,
          `data-shopify-variant-id="${variantMap['vfl-gold-default-title']}"`
        );
      }
      if (variantMap['vfl-gold-2-flessen']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="bf-2-bottles"/g,
          `data-shopify-variant-id="${variantMap['vfl-gold-2-flessen']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ VFL Gold 2 Flessen: ${variantMap['vfl-gold-2-flessen']}`);
          updatesMade++;
        }
      }
      if (variantMap['vfl-gold-3-flessen']) {
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52128254755082"/g,
          `data-shopify-variant-id="${variantMap['vfl-gold-3-flessen']}"`
        );
      }

      // Biofel varianten
      if (variantMap['biofel-default-title']) {
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52128254787850"/g,
          `data-shopify-variant-id="${variantMap['biofel-default-title']}"`
        );
      }
      if (variantMap['biofel-2-flessen']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="bf-2-biofel"/g,
          `data-shopify-variant-id="${variantMap['biofel-2-flessen']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ Biofel 2 Flessen: ${variantMap['biofel-2-flessen']}`);
          updatesMade++;
        }
      }
      if (variantMap['biofel-3-flessen']) {
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52128254820618"/g,
          `data-shopify-variant-id="${variantMap['biofel-3-flessen']}"`
        );
      }

      // Sachets varianten
      const sachetMappings = {
        '3-stuks': 'VUL_SACHET_3_ID',
        '5-stuks': 'VUL_SACHET_5_ID',
        '10-stuks': 'VUL_SACHET_10_ID',
        '15-stuks': 'VUL_SACHET_15_ID',
        '20-stuks': 'VUL_SACHET_20_ID',
        '30-stuks': 'VUL_SACHET_30_ID'
      };

      Object.entries(sachetMappings).forEach(([key, placeholder]) => {
        const mapKey = `sachets-${key}`;
        if (variantMap[mapKey]) {
          const oldContent = htmlContent;
          htmlContent = htmlContent.replace(
            new RegExp(`data-shopify-variant-id="${placeholder}"`, 'g'),
            `data-shopify-variant-id="${variantMap[mapKey]}"`
          );
          if (oldContent !== htmlContent) {
            console.log(`✅ Sachets ${key}: ${variantMap[mapKey]}`);
            updatesMade++;
          }
        }
      });

      // Fix voor 3 stuks sachet - update alle mogelijke IDs
      if (variantMap['sachets-3-stuks']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52128254853386"/g,
          `data-shopify-variant-id="${variantMap['sachets-3-stuks']}"`
        );
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="VUL_SACHET_3_ID"/g,
          `data-shopify-variant-id="${variantMap['sachets-3-stuks']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ Sachets 3 stuks: ${variantMap['sachets-3-stuks']}`);
          updatesMade++;
        }
      }

      if (updatesMade > 0) {
        fs.writeFileSync(indexPath, htmlContent, 'utf8');
        console.log(`\n✅ ${updatesMade} variant ID(s) bijgewerkt in index.html!`);
      } else {
        console.log(`\n⚠️  Geen updates nodig.`);
      }
    }

    console.log('\n🎉 Klaar! Alle producten en varianten zijn geconfigureerd.');

  } catch (error) {
    console.error('\n❌ Fout:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

setupAllProducts();

