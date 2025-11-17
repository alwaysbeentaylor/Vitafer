// check-shopify-products-admin.js
// Check products via Admin API (ziet ook unpublished products)

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const ADMIN_TOKEN = process.argv[2] || process.env.SHOPIFY_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
    console.log('❌ Admin token nodig!');
    console.log('Gebruik: node check-shopify-products-admin.js JE_TOKEN');
    process.exit(1);
}

async function checkProducts() {
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
        
        console.log(`\n✅ ${data.products.length} product(en) gevonden in Shopify Admin\n`);
        console.log('═'.repeat(80));
        
        data.products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.title}`);
            console.log(`   Handle: ${product.handle}`);
            console.log(`   Status: ${product.status}`);
            console.log(`   Published: ${product.published_at ? 'Ja' : 'Nee'}`);
            console.log(`   Product ID: ${product.id}`);
            console.log(`   Aantal varianten: ${product.variants.length}`);
            
            product.variants.forEach((variant, vIndex) => {
                console.log(`\n   ${vIndex + 1}. ${variant.title || 'Default Title'}`);
                console.log(`      Variant ID: ${variant.id}`);
                console.log(`      Prijs: €${parseFloat(variant.price).toFixed(2)}`);
                console.log(`      SKU: ${variant.sku || 'Geen'}`);
            });
            console.log('\n' + '─'.repeat(80));
        });
        
    } catch (error) {
        console.error('❌ Fout:', error.message);
        process.exit(1);
    }
}

checkProducts();

