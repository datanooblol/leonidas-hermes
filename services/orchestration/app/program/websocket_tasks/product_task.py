import json
from .base import Context
import json
from .task_manager import TaskManager
import logging

class ProductTask:
    def __init__(
            self, 
            websocket,
            context:Context,
            task_manager:TaskManager
    ):
        self.websocket = websocket
        self.context = context
        self.task_manager = task_manager
        self.logger = logging.getLogger("product_task")

    def product_filter_by_params(self, data, afford_rate:float=0.2, age=None, income_per_month=None, **kwargs):
        """Simple filtering using customer information only"""
        mask = True
        
        if age:
            mask &= data['age_min'] <= age
            mask &= data['age_max'] >= age
            
        if income_per_month:
            afford = income_per_month * afford_rate
            # mask &= data['premium_min_month_thb'] <= afford
            # mask &= data['premium_max_month_thb'] >= afford
            mask &= data['premium_max_month_thb'] <= afford
            
        return data.loc[mask,:].head(5)

    async def process_products(self, data):
        while True:
            await self.task_manager.product_event.wait()
            filtered_products = self.product_filter_by_params(data, 0.2, **self.context.get_product_filters())
            target_columns = ["product_id", "product_name", "objective", "premium_min_month_thb", "premium_max_month_thb", "age_min", "age_max", "notes"]
            await self.websocket.send_text(json.dumps({
                "type": "products",
                "products": filtered_products.loc[:, target_columns].to_dict(orient="records"),
            }))