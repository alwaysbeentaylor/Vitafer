// list-all-variants.js
// Script om alle producten en varianten te tonen voor handmatige matching

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';

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

function extractNumericId(gid) {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : null;
}

async function listAllVariants() {
  try {
    console.log('🔄 Ophalen van alle producten en varianten...\n');
    
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
    console.log('═'.repeat(80));
    console.log('📋 OVERZICHT VAN ALLE PRODUCTEN EN VARIANTEN');
    console.log('═'.repeat(80));
    console.log('');

    products.forEach((productEdge, index) => {
      const product = productEdge.node;
      const numericProductId = extractNumericId(product.id);
      
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   Handle: ${product.handle}`);
      console.log(`   Type: ${product.productType || 'Geen type'}`);
      console.log(`   Product ID: ${numericProductId}`);
      console.log(`   Aantal varianten: ${product.variants.edges.length}`);
      console.log('');
      
      if (product.variants.edges.length === 0) {
        console.log('   ⚠️  Geen varianten gevonden\n');
      } else {
        product.variants.edges.forEach((variantEdge, vIndex) => {
          const variant = variantEdge.node;
          const numericVariantId = extractNumericId(variant.id);
          const price = parseFloat(variant.price.amount);
          
          console.log(`   ${vIndex + 1}. ${variant.title || 'Default Title'}`);
          console.log(`      Variant ID: ${numericVariantId}`);
          console.log(`      Prijs: €${price.toFixed(2)}`);
          console.log(`      Beschikbaar: ${variant.availableForSale ? 'Ja' : 'Nee'}`);
          console.log('');
        });
      }
      console.log('─'.repeat(80));
      console.log('');
    });

    console.log('\n💡 SUGGESTIES VOOR BLACK FRIDAY VARIANTEN:');
    console.log('─'.repeat(80));
    
    // Zoek naar mogelijke matches
    const suggestions = {
      'VFL Gold 2 Flessen (€94,95)': [],
      'Biofel 2 Flessen (€94,95)': [],
      'Sachets 5 stuks (€25,00)': [],
      'Sachets 10 stuks (€45,00)': [],
      'Sachets 15 stuks (€67,50)': [],
      'Sachets 20 stuks (€90,00)': [],
      'Sachets 30 stuks (€135,00)': []
    };

    products.forEach(productEdge => {
      const product = productEdge.node;
      const productTitle = product.title.toLowerCase();
      const productHandle = product.handle.toLowerCase();
      
      product.variants.edges.forEach(variantEdge => {
        const variant = variantEdge.node;
        const numericId = extractNumericId(variant.id);
        const price = parseFloat(variant.price.amount);
        const variantTitle = (variant.title || 'Default Title').toLowerCase();
        
        // VFL Gold 2 flessen
        if ((productTitle.includes('vfl') || productTitle.includes('vitafer') || productHandle.includes('vfl')) && 
            (productTitle.includes('gold') || productTitle.includes('bottle') || productHandle.includes('gold'))) {
          if (variantTitle.includes('2') || Math.abs(price - 94.95) < 5) {
            suggestions['VFL Gold 2 Flessen (€94,95)'].push({
              product: product.title,
              variant: variant.title || 'Default',
              id: numericId,
              price: price
            });
          }
        }
        
        // Biofel 2 flessen
        if (productTitle.includes('biofel') || productHandle.includes('biofel')) {
          if (variantTitle.includes('2') || Math.abs(price - 94.95) < 5) {
            suggestions['Biofel 2 Flessen (€94,95)'].push({
              product: product.title,
              variant: variant.title || 'Default',
              id: numericId,
              price: price
            });
          }
        }
        
        // Sachets
        if (productTitle.includes('sachet') || productHandle.includes('sachet')) {
          const sachetPrices = [
            { target: 25.00, key: 'Sachets 5 stuks (€25,00)' },
            { target: 45.00, key: 'Sachets 10 stuks (€45,00)' },
            { target: 67.50, key: 'Sachets 15 stuks (€67,50)' },
            { target: 90.00, key: 'Sachets 20 stuks (€90,00)' },
            { target: 135.00, key: 'Sachets 30 stuks (€135,00)' }
          ];
          
          sachetPrices.forEach(({ target, key }) => {
            if (Math.abs(price - target) < 5) {
              suggestions[key].push({
                product: product.title,
                variant: variant.title || 'Default',
                id: numericId,
                price: price
              });
            }
          });
        }
      });
    });

    Object.entries(suggestions).forEach(([key, matches]) => {
      if (matches.length > 0) {
        console.log(`\n✅ ${key}:`);
        matches.forEach(match => {
          console.log(`   → ${match.product} - ${match.variant} (€${match.price.toFixed(2)})`);
          console.log(`     Variant ID: ${match.id}`);
        });
      } else {
        console.log(`\n⚠️  ${key}: Geen match gevonden`);
        console.log(`   → Maak deze variant aan in Shopify of gebruik een bestaande variant ID`);
      }
    });

    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📝 VOLGENDE STAPPEN:');
    console.log('═'.repeat(80));
    console.log('1. Als varianten ontbreken: maak ze aan in Shopify Admin');
    console.log('2. Kopieer de juiste Variant IDs uit bovenstaande lijst');
    console.log('3. Vervang in index.html:');
    console.log('   - "bf-2-bottles" → [VFL Gold 2 flessen variant ID]');
    console.log('   - "bf-2-biofel" → [Biofel 2 flessen variant ID]');
    console.log('   - "VUL_SACHET_X_ID" → [Sachet variant IDs]');
    console.log('');

  } catch (error) {
    console.error('\n❌ Fout:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

listAllVariants();

