// check-product-variants.js
// Check alle varianten voor specifieke producten

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const ADMIN_TOKEN = process.argv[2] || process.env.SHOPIFY_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
    console.log('❌ Admin token nodig!');
    process.exit(1);
}

async function checkProduct(productId) {
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products/${productId}.json`, {
        headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN
        }
    });

    if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
    }

    const data = await response.json();
    return data.product;
}

async function checkAll() {
    const products = [
        { id: 10309525831946, name: 'VFL Gold 500ml' },
        { id: 10309687673098, name: 'Biofel' },
        { id: 10309687705866, name: 'VFL Gold Sachets' }
    ];

    for (const product of products) {
        console.log(`\n${product.name} (ID: ${product.id}):`);
        console.log('─'.repeat(60));
        const p = await checkProduct(product.id);
        console.log(`Aantal varianten: ${p.variants.length}`);
        p.variants.forEach((v, i) => {
            console.log(`  ${i+1}. ${v.title || 'Default Title'} - ID: ${v.id} - €${parseFloat(v.price).toFixed(2)}`);
        });
    }
}

checkAll().catch(console.error);

