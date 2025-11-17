// get-exact-variants.js
// Haal exacte variant IDs op voor de juiste producten

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const ADMIN_TOKEN = process.argv[2] || process.env.SHOPIFY_ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
    console.log('❌ Admin token nodig!');
    process.exit(1);
}

async function getExactVariants() {
    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2024-01/products.json`, {
        headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN
        }
    });

    const data = await response.json();
    
    // Vind de juiste producten
    const vflGold = data.products.find(p => p.handle === 'vitafer-l-gold-500ml');
    const biofel = data.products.find(p => p.handle === 'biofel' && p.id === 10309687673098);
    const sachets = data.products.find(p => p.handle === 'vfl-gold-sachets' && p.id === 10309687705866);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  EXACTE VARIANT IDs');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    if (vflGold) {
        console.log('VFL Gold 500ml:');
        vflGold.variants.forEach((v, i) => {
            console.log(`  ${i+1}. ${v.title || 'Default Title'} - ID: ${v.id} - €${parseFloat(v.price).toFixed(2)}`);
        });
    }
    
    if (biofel) {
        console.log('\nBiofel:');
        biofel.variants.forEach((v, i) => {
            console.log(`  ${i+1}. ${v.title || 'Default Title'} - ID: ${v.id} - €${parseFloat(v.price).toFixed(2)}`);
        });
    }
    
    if (sachets) {
        console.log('\nVFL Gold Sachets:');
        sachets.variants.forEach((v, i) => {
            console.log(`  ${i+1}. ${v.title || 'Default Title'} - ID: ${v.id} - €${parseFloat(v.price).toFixed(2)}`);
        });
    }
}

getExactVariants().catch(console.error);

