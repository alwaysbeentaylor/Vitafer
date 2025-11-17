// test-checkout.js
// Script om checkout flow te testen voor alle varianten

const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';

// Test varianten - gebruik de nieuwe IDs uit sync
const TEST_VARIANTS = [
    // VFL Gold
    { id: '52133922570506', name: 'VFL Gold 1 Fles', expectedPrice: 64.95 },
    { id: '52133947834634', name: 'VFL Gold 2 Flessen', expectedPrice: 124.99 },
    { id: '52133947900170', name: 'VFL Gold 3 Flessen', expectedPrice: 179.99 },
    // Biofel
    { id: '52133922767114', name: 'Biofel 1 Fles', expectedPrice: 64.95 },
    { id: '52133948064010', name: 'Biofel 2 Flessen', expectedPrice: 124.99 },
    { id: '52133948096778', name: 'Biofel 3 Flessen', expectedPrice: 179.99 },
    // Sachets
    { id: '52133948195082', name: 'Sachets 3 stuks', expectedPrice: 22.50 },
    { id: '52133948260618', name: 'Sachets 5 stuks', expectedPrice: 37.50 },
    { id: '52133948326154', name: 'Sachets 10 stuks', expectedPrice: 67.50 },
    { id: '52133948391690', name: 'Sachets 15 stuks', expectedPrice: 101.25 },
    { id: '52133948424458', name: 'Sachets 20 stuks', expectedPrice: 135.00 },
    { id: '52133948489994', name: 'Sachets 30 stuks', expectedPrice: 202.50 }
];

async function testVariant(variant) {
    // Test door direct cart creation te proberen - als dit werkt, bestaat de variant
    const cartResult = await testCartCreation(variant.id);
    
    if (!cartResult.success) {
        return {
            variant: variant.name,
            id: variant.id,
            success: false,
            error: cartResult.error
        };
    }
    
    // Haal product info op via products query
    const query = `
        query {
            products(first: 50) {
                edges {
                    node {
                        title
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
    
    try {
        const response = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
            },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (data.errors) {
            return {
                variant: variant.name,
                id: variant.id,
                success: true, // Cart creation worked, so variant exists
                cartCreated: true,
                checkoutUrl: cartResult.checkoutUrl
            };
        }
        
        // Find variant in products
        let variantData = null;
        for (const productEdge of data.data.products.edges) {
            for (const variantEdge of productEdge.node.variants.edges) {
                const numericId = variantEdge.node.id.match(/\/(\d+)$/)?.[1];
                if (numericId === variant.id) {
                    variantData = {
                        product: productEdge.node.title,
                        title: variantEdge.node.title || 'Default Title',
                        price: parseFloat(variantEdge.node.price.amount),
                        available: variantEdge.node.availableForSale
                    };
                    break;
                }
            }
            if (variantData) break;
        }
        
        if (variantData) {
            const priceMatch = Math.abs(variantData.price - variant.expectedPrice) < 0.01;
            return {
                variant: variant.name,
                id: variant.id,
                success: true,
                product: variantData.product,
                title: variantData.title,
                price: variantData.price,
                expectedPrice: variant.expectedPrice,
                priceMatch: priceMatch,
                available: variantData.available,
                cartCreated: true,
                checkoutUrl: cartResult.checkoutUrl
            };
        }
        
        return {
            variant: variant.name,
            id: variant.id,
            success: true,
            cartCreated: true,
            checkoutUrl: cartResult.checkoutUrl,
            note: 'Variant exists but details not found in products query'
        };
    } catch (error) {
        return {
            variant: variant.name,
            id: variant.id,
            success: true, // Cart creation worked
            cartCreated: true,
            checkoutUrl: cartResult.checkoutUrl,
            error: error.message
        };
    }
}

async function testCartCreation(variantId) {
    const mutation = `
        mutation {
            cartCreate(input: {
                lines: [{
                    merchandiseId: "gid://shopify/ProductVariant/${variantId}",
                    quantity: 1
                }]
            }) {
                cart {
                    id
                    checkoutUrl
                }
                userErrors {
                    field
                    message
                }
            }
        }
    `;
    
    try {
        const response = await fetch(`https://${SHOPIFY_STORE}/api/2024-01/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
            },
            body: JSON.stringify({ query: mutation })
        });
        
        const data = await response.json();
        
        if (data.errors) {
            return {
                success: false,
                error: data.errors[0].message
            };
        }
        
        if (data.data.cartCreate.userErrors.length > 0) {
            return {
                success: false,
                error: data.data.cartCreate.userErrors[0].message
            };
        }
        
        return {
            success: true,
            cartId: data.data.cartCreate.cart.id,
            checkoutUrl: data.data.cartCreate.cart.checkoutUrl
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function runTests() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  CHECKOUT TEST - ALLE VARIANTEN');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const results = [];
    
    for (const variant of TEST_VARIANTS) {
        console.log(`🔍 Testen: ${variant.name} (${variant.id})...`);
        const result = await testVariant(variant);
        results.push(result);
        
        if (result.success) {
            if (result.cartCreated) {
                console.log(`   ✅ Cart aangemaakt! Checkout werkt`);
                if (result.checkoutUrl) {
                    console.log(`   🔗 Checkout URL: ${result.checkoutUrl.substring(0, 80)}...`);
                }
            }
            
            if (result.product) {
                const priceStatus = result.priceMatch !== false ? '✅' : '⚠️';
                console.log(`   ${priceStatus} Product: ${result.product}`);
                console.log(`   ${priceStatus} Variant: ${result.title}`);
                if (result.price !== undefined) {
                    console.log(`   ${priceStatus} Prijs: €${result.price.toFixed(2)} (verwacht: €${result.expectedPrice.toFixed(2)})`);
                }
                if (result.available !== undefined) {
                    console.log(`   ${result.available ? '✅' : '❌'} Beschikbaar: ${result.available ? 'Ja' : 'Nee'}`);
                }
            }
            
            if (result.note) {
                console.log(`   ℹ️  ${result.note}`);
            }
        } else {
            console.log(`   ❌ FOUT: ${result.error}`);
        }
        console.log('');
    }
    
    // Samenvatting
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  SAMENVATTING');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const priceMismatches = results.filter(r => r.success && !r.priceMatch);
    
    console.log(`✅ Succesvol: ${successful.length}/${results.length}`);
    console.log(`❌ Gefaald: ${failed.length}/${results.length}`);
    
    if (priceMismatches.length > 0) {
        console.log(`⚠️  Prijs mismatch: ${priceMismatches.length}`);
        priceMismatches.forEach(r => {
            console.log(`   - ${r.variant}: €${r.price.toFixed(2)} (verwacht: €${r.expectedPrice.toFixed(2)})`);
        });
    }
    
    if (failed.length > 0) {
        console.log(`\n❌ GEFAALDE VARIANTEN:`);
        failed.forEach(r => {
            console.log(`   - ${r.variant} (${r.id}): ${r.error}`);
        });
    }
    
    if (successful.length === results.length && priceMismatches.length === 0) {
        console.log('\n🎉 ALLE TESTS GESLAAGD! Checkout werkt correct.');
    } else {
        console.log('\n⚠️  Sommige tests zijn gefaald. Controleer de bovenstaande details.');
    }
}

runTests().catch(console.error);

