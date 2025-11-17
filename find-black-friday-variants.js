/**
 * Script om Black Friday variant IDs te vinden in Shopify
 * 
 * Gebruik:
 * 1. Vul je Admin API token in (regel 8)
 * 2. Run: node find-black-friday-variants.js
 * 3. Zoek de juiste variant IDs voor:
 *    - VFL Gold 500ml: 1 fles, 2 flessen, 3 flessen
 *    - Biofel: 1 fles, 2 flessen, 3 flessen
 *    - Sachets: verschillende hoeveelheden
 */

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const ADMIN_TOKEN = 'VUL_HIER_ADMIN_TOKEN_IN'; // Vervang met je Admin API token

async function fetchProducts() {
    try {
        const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products.json`, {
            headers: {
                'X-Shopify-Access-Token': ADMIN_TOKEN
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('\n=== BLACK FRIDAY VARIANT IDS ===\n');
        
        data.products.forEach(product => {
            console.log(`\n📦 Product: ${product.title}`);
            console.log('─'.repeat(50));
            
            product.variants.forEach(variant => {
                const price = parseFloat(variant.price);
                const title = variant.title || 'Default Title';
                
                // Match Black Friday prijzen
                const bfPrices = [49.95, 94.95, 139.95, 5.00, 15.00, 25.00, 45.00, 67.50, 90.00, 135.00];
                const isBFPrice = bfPrices.some(bfPrice => Math.abs(price - bfPrice) < 0.01);
                
                if (isBFPrice || title.toLowerCase().includes('fles') || title.toLowerCase().includes('sachet')) {
                    console.log(`  ✓ ${title}`);
                    console.log(`    Variant ID: ${variant.id}`);
                    console.log(`    Prijs: €${price.toFixed(2)}`);
                    console.log(`    SKU: ${variant.sku || 'Geen'}`);
                    console.log('');
                }
            });
        });
        
        console.log('\n=== INSTRUCTIES ===');
        console.log('1. Kopieer de juiste Variant IDs');
        console.log('2. Vervang in index.html:');
        console.log('   - "bf-2-bottles" → [VFL Gold 2 flessen variant ID]');
        console.log('   - "bf-2-biofel" → [Biofel 2 flessen variant ID]');
        console.log('3. Voor sachets: gebruik de juiste variant IDs voor verschillende hoeveelheden\n');
        
    } catch (error) {
        console.error('Fout:', error.message);
        console.log('\nZorg ervoor dat:');
        console.log('1. Je Admin API token correct is ingevuld');
        console.log('2. De token de juiste rechten heeft (read_products)');
        console.log('3. Je internetverbinding werkt\n');
    }
}

// Run script
if (typeof fetch === 'undefined') {
    console.log('Dit script moet worden uitgevoerd in een omgeving met fetch API');
    console.log('Gebruik shopify-variant-finder.html in de browser of gebruik Node.js 18+');
} else {
    fetchProducts();
}

