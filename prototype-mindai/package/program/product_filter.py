import json
import pandas as pd
from package.program.memory import conversation_memory

def product_filter_by_params(products_df, afford_rate: float = 0.2, age=None, income_per_month=None, **kwargs):
    """Simple filtering using customer information only"""
    mask = pd.Series([True] * len(products_df), index=products_df.index)
    
    if age:
        mask &= products_df['age_min'] <= age
        mask &= products_df['age_max'] >= age
        
    if income_per_month:
        afford = income_per_month * afford_rate
        mask &= products_df['premium_max_month_thb'] <= afford
        
    return products_df.loc[mask, :]

def get_customer_filters():
    """Extract filtering parameters from memory"""
    filters = {}
    
    # Get age from customer information
    if 'age' in conversation_memory.customer_information:
        filters['age'] = conversation_memory.customer_information['age']
    
    # Get income from customer information  
    if 'income_per_month' in conversation_memory.customer_information:
        filters['income_per_month'] = conversation_memory.customer_information['income_per_month']
    
    return filters

async def filter_and_send_products(websocket, products_df):
    """Filter products based on current customer data and send if changed"""
    try:
        print("🛍️ Starting product filtering...")
        
        # Get current customer filters
        filters = get_customer_filters()
        print(f"🛍️ Filtering with: {filters}")
        
        if not filters:
            print("ℹ️ No customer data available for filtering")
            # Send empty products list
            await websocket.send_text(json.dumps({
                "type": "products",
                "products": [],
                "count": 0,
                "message": "No customer data for filtering"
            }))
            return
        
        # Filter products
        filtered_products = product_filter_by_params(products_df, 0.2, **filters)
        print(f"🛍️ Found {len(filtered_products)} products matching criteria")
        
        # Convert to list of dicts
        target_columns = [
            "product_id", "product_name", "objective", 
            "premium_min_month_thb", "premium_max_month_thb", 
            "age_min", "age_max", "notes"
        ]
        
        products_list = filtered_products[target_columns].to_dict(orient="records")
        
        # Check if products changed using memory
        is_updated = conversation_memory.update_product_list(products_list)
        
        # Always send products when customer data exists (for debugging)
        await websocket.send_text(json.dumps({
            "type": "products",
            "products": products_list,
            "count": len(products_list),
            "updated": is_updated
        }))
        
        if is_updated:
            print("✅ Sent updated product list")
        else:
            print("📤 Sent unchanged product list (for debugging)")
            
    except Exception as e:
        print(f"💥 Product filtering failed: {e}")
        import traceback
        traceback.print_exc()
        # Send error response
        await websocket.send_text(json.dumps({
            "type": "products_error",
            "message": f"Product filtering failed: {str(e)}",
            "status": "error"
        }))