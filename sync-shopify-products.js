// sync-shopify-products.js
// Script om producten te synchroniseren via Admin API (ziet alle producten)

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';
const fs = require('fs');
const path = require('path');

const REQUIRED_PRODUCTS = {
  'vfl-gold': {
    handle: 'vitafer-l-gold-500ml',
    variants: [
      { title: 'Default Title', price: '64.95' },
      { title: '2 Flessen', price: '124.99' },
      { title: '3 Flessen', price: '179.99' }
    ]
  },
  'biofel': {
    handle: 'biofel',
    variants: [
      { title: 'Default Title', price: '64.95' },
      { title: '2 Flessen', price: '124.99' },
      { title: '3 Flessen', price: '179.99' }
    ]
  },
  'sachets': {
    handle: 'vfl-gold-sachets',
    variants: [
      { title: '3 stuks', price: '22.50' },
      { title: '5 stuks', price: '37.50' },
      { title: '10 stuks', price: '67.50' },
      { title: '15 stuks', price: '101.25' },
      { title: '20 stuks', price: '135.00' },
      { title: '30 stuks', price: '202.50' }
    ]
  }
};

async function updateVariantPrice(adminToken, productId, variantId, newPrice) {
  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products/${productId}/variants/${variantId}.json`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken
    },
    body: JSON.stringify({
      variant: {
        id: variantId,
        price: newPrice
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update variant: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

async function addVariant(adminToken, productId, variantData) {
  // Gebruik POST endpoint om een nieuwe variant toe te voegen
  // Gebruik option1 in plaats van title voor variant naam
  const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products/${productId}/variants.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken
    },
    body: JSON.stringify({
      variant: {
        option1: variantData.title === 'Default Title' ? null : variantData.title,
        price: variantData.price,
        inventory_policy: 'continue'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add variant: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.variant;
}

async function syncProducts() {
  try {
    const adminToken = process.argv[2] || process.env.SHOPIFY_ADMIN_TOKEN;
    
    if (!adminToken) {
      console.log('❌ Admin token nodig!');
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  PRODUCTEN SYNCHRONISEREN');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Haal alle producten op via Admin API
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products.json`, {
      headers: {
        'X-Shopify-Access-Token': adminToken
      }
    });

    const data = await response.json();
    const products = data.products;
    
    console.log(`✅ ${products.length} product(en) gevonden\n`);

    const productMap = {};
    const variantMap = {};

    // Vind de juiste producten op handle
    products.forEach(product => {
      const handle = product.handle.toLowerCase();
      if (handle === 'vitafer-l-gold-500ml') {
        productMap['vfl-gold'] = product;
      } else if (handle === 'biofel' && !productMap['biofel']) {
        productMap['biofel'] = product;
      } else if (handle === 'vfl-gold-sachets' && !productMap['sachets']) {
        productMap['sachets'] = product;
      }
    });

    // Verwerk elk product
    for (const [key, required] of Object.entries(REQUIRED_PRODUCTS)) {
      console.log(`\n📦 ${key.toUpperCase()}`);
      console.log('─'.repeat(60));

      const product = productMap[key];
      
      if (!product) {
        console.log(`⚠️  Product met handle "${required.handle}" niet gevonden!`);
        continue;
      }

      console.log(`✅ Product gevonden: ${product.title} (ID: ${product.id})`);

      // Zorg dat product variant options heeft
      if (product.variants.length === 1 && product.variants[0].title === 'Default Title') {
        // Update product om option name toe te voegen
        try {
          await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products/${product.id}.json`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': adminToken
            },
            body: JSON.stringify({
              product: {
                options: [{ name: 'Pakket' }]
              }
            })
          });
        } catch (error) {
          console.log(`   ⚠️  Kon option niet toevoegen: ${error.message}`);
        }
      }

      // Verwerk varianten
      for (const requiredVariant of required.variants) {
        const variantTitle = requiredVariant.title;
        const variantPrice = parseFloat(requiredVariant.price);
        
        // Zoek bestaande variant
        let existingVariant = product.variants.find(v => {
          if (variantTitle === 'Default Title') {
            return true; // Gebruik eerste variant als Default Title
          }
          return (v.title || 'Default Title') === variantTitle;
        });

        if (existingVariant) {
          const currentPrice = parseFloat(existingVariant.price);
          if (Math.abs(currentPrice - variantPrice) > 0.01) {
            console.log(`   ⚠️  "${variantTitle}" prijs bijwerken: €${currentPrice.toFixed(2)} → €${variantPrice.toFixed(2)}`);
            try {
              await updateVariantPrice(adminToken, product.id, existingVariant.id, variantPrice.toString());
              console.log(`   ✅ Prijs bijgewerkt!`);
            } catch (error) {
              console.error(`   ❌ Fout: ${error.message}`);
            }
          } else {
            console.log(`   ✅ "${variantTitle}" (€${variantPrice.toFixed(2)}) correct: ${existingVariant.id}`);
          }
          variantMap[`${key}-${variantTitle.toLowerCase().replace(/\s+/g, '-')}`] = existingVariant.id;
        } else {
          console.log(`   ⚠️  "${variantTitle}" ontbreekt - wordt toegevoegd...`);
          try {
            const newVariant = await addVariant(adminToken, product.id, requiredVariant);
            console.log(`   ✅ Variant aangemaakt! ID: ${newVariant.id}`);
            variantMap[`${key}-${variantTitle.toLowerCase().replace(/\s+/g, '-')}`] = newVariant.id;
          } catch (error) {
            console.error(`   ❌ Fout: ${error.message}`);
          }
        }
      }
    }

    // Update HTML
    if (Object.keys(variantMap).length > 0) {
      console.log('\n\n🔄 Bijwerken van index.html...\n');
      
      const indexPath = path.join(__dirname, 'index.html');
      let htmlContent = fs.readFileSync(indexPath, 'utf8');
      let updatesMade = 0;

      // VFL Gold
      if (variantMap['vfl-gold-default-title']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52133866176778"/g,
          `data-shopify-variant-id="${variantMap['vfl-gold-default-title']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ VFL Gold 1 Fles: ${variantMap['vfl-gold-default-title']}`);
          updatesMade++;
        }
      }
      if (variantMap['vfl-gold-2-flessen']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52133895733514"/g,
          `data-shopify-variant-id="${variantMap['vfl-gold-2-flessen']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ VFL Gold 2 Flessen: ${variantMap['vfl-gold-2-flessen']}`);
          updatesMade++;
        }
      }
      if (variantMap['vfl-gold-3-flessen']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52133895864586"/g,
          `data-shopify-variant-id="${variantMap['vfl-gold-3-flessen']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ VFL Gold 3 Flessen: ${variantMap['vfl-gold-3-flessen']}`);
          updatesMade++;
        }
      }

      // Biofel
      if (variantMap['biofel-default-title']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52133895930122"/g,
          `data-shopify-variant-id="${variantMap['biofel-default-title']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ Biofel 1 Fles: ${variantMap['biofel-default-title']}`);
          updatesMade++;
        }
      }
      if (variantMap['biofel-2-flessen']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52133896159498"/g,
          `data-shopify-variant-id="${variantMap['biofel-2-flessen']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ Biofel 2 Flessen: ${variantMap['biofel-2-flessen']}`);
          updatesMade++;
        }
      }
      if (variantMap['biofel-3-flessen']) {
        const oldContent = htmlContent;
        htmlContent = htmlContent.replace(
          /data-shopify-variant-id="52133896257802"/g,
          `data-shopify-variant-id="${variantMap['biofel-3-flessen']}"`
        );
        if (oldContent !== htmlContent) {
          console.log(`✅ Biofel 3 Flessen: ${variantMap['biofel-3-flessen']}`);
          updatesMade++;
        }
      }

      // Sachets
      const sachetMappings = {
        '3-stuks': { oldId: '52133896749322', key: 'sachets-3-stuks' },
        '5-stuks': { oldId: '52133896814858', key: 'sachets-5-stuks' },
        '10-stuks': { oldId: '52133896880394', key: 'sachets-10-stuks' },
        '15-stuks': { oldId: '52133896913162', key: 'sachets-15-stuks' },
        '20-stuks': { oldId: '52133897011466', key: 'sachets-20-stuks' },
        '30-stuks': { oldId: '52133897077002', key: 'sachets-30-stuks' }
      };

      Object.entries(sachetMappings).forEach(([name, mapping]) => {
        if (variantMap[mapping.key]) {
          const oldContent = htmlContent;
          htmlContent = htmlContent.replace(
            new RegExp(`data-shopify-variant-id="${mapping.oldId}"`, 'g'),
            `data-shopify-variant-id="${variantMap[mapping.key]}"`
          );
          if (oldContent !== htmlContent) {
            console.log(`✅ Sachets ${name}: ${variantMap[mapping.key]}`);
            updatesMade++;
          }
        }
      });

      if (updatesMade > 0) {
        fs.writeFileSync(indexPath, htmlContent, 'utf8');
        console.log(`\n✅ ${updatesMade} variant ID(s) bijgewerkt!`);
      } else {
        console.log(`\n⚠️  Geen updates nodig.`);
      }
    }

    console.log('\n🎉 Synchronisatie voltooid!');

  } catch (error) {
    console.error('\n❌ Fout:', error.message);
    process.exit(1);
  }
}

syncProducts();

