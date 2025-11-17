// verify-shopify-variants.js
// Client-side tool om variant IDs te verifiëren tegen Shopify

(function() {
    'use strict';
    
    const SHOPIFY_STORE = '1u0ui4-02.myshopify.com';
    const STOREFRONT_TOKEN = '37153f313a6160328614346cd6ea3813';
    
    // Haal alle variant IDs uit de HTML
    function getVariantIdsFromHTML() {
        const variantIds = new Set();
        
        // Zoek alle data-shopify-variant-id attributen
        document.querySelectorAll('[data-shopify-variant-id]').forEach(el => {
            const id = el.getAttribute('data-shopify-variant-id');
            if (id && /^\d+$/.test(id)) {
                variantIds.add(id);
            }
        });
        
        return Array.from(variantIds);
    }
    
    // Verifieer variant ID tegen Shopify
    async function verifyVariant(variantId) {
        const query = `
            query {
                productVariant(id: "gid://shopify/ProductVariant/${variantId}") {
                    id
                    title
                    price {
                        amount
                    }
                    product {
                        title
                    }
                    availableForSale
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
                    id: variantId,
                    valid: false,
                    error: data.errors[0].message
                };
            }
            
            if (data.data.productVariant) {
                return {
                    id: variantId,
                    valid: true,
                    title: data.data.productVariant.title,
                    price: parseFloat(data.data.productVariant.price.amount),
                    product: data.data.productVariant.product.title,
                    available: data.data.productVariant.availableForSale
                };
            }
            
            return {
                id: variantId,
                valid: false,
                error: 'Variant not found'
            };
        } catch (error) {
            return {
                id: variantId,
                valid: false,
                error: error.message
            };
        }
    }
    
    // Verifieer alle varianten
    async function verifyAllVariants() {
        console.log('🔍 Verifiëren van variant IDs...\n');
        
        const variantIds = getVariantIdsFromHTML();
        console.log(`📋 ${variantIds.length} variant ID(s) gevonden in HTML\n`);
        
        const results = [];
        
        for (const variantId of variantIds) {
            console.log(`⏳ Controleren variant ${variantId}...`);
            const result = await verifyVariant(variantId);
            results.push(result);
            
            if (result.valid) {
                console.log(`✅ ${variantId}: ${result.product} - ${result.title} (€${result.price.toFixed(2)})`);
            } else {
                console.error(`❌ ${variantId}: ${result.error}`);
            }
        }
        
        console.log('\n📊 SAMENVATTING:');
        console.log('═'.repeat(60));
        
        const valid = results.filter(r => r.valid);
        const invalid = results.filter(r => !r.valid);
        
        console.log(`✅ Geldig: ${valid.length}`);
        console.log(`❌ Ongeldig: ${invalid.length}`);
        
        if (invalid.length > 0) {
            console.log('\n⚠️  ONGELDIGE VARIANTEN:');
            invalid.forEach(r => {
                console.log(`   - ${r.id}: ${r.error}`);
            });
        }
        
        // Toon ook welke varianten in HTML staan maar niet in Shopify
        const htmlVariants = new Set(variantIds);
        const shopifyVariants = new Set(valid.map(r => r.id));
        const missingInShopify = Array.from(htmlVariants).filter(id => !shopifyVariants.has(id));
        
        if (missingInShopify.length > 0) {
            console.log('\n⚠️  VARIANTEN IN HTML MAAR NIET IN SHOPIFY:');
            missingInShopify.forEach(id => {
                console.log(`   - ${id}`);
            });
        }
        
        return results;
    }
    
    // Maak functie beschikbaar in console
    window.verifyShopifyVariants = verifyAllVariants;
    
    // Auto-run bij laden (optioneel)
    if (document.readyState === 'complete') {
        console.log('💡 Gebruik verifyShopifyVariants() in de console om variant IDs te verifiëren');
    } else {
        window.addEventListener('load', () => {
            console.log('💡 Gebruik verifyShopifyVariants() in de console om variant IDs te verifiëren');
        });
    }
})();
