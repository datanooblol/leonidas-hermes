import yaml
from pathlib import Path

def parse_blockcode(code_str:str, language:str)->str:
    code_str = code_str.split(f"```{language}")[-1]
    code_str = code_str.split("```")[0]
    return code_str.strip()

def token_calculation(input_tokens, output_tokens, input_cost, output_cost):
    return dict(
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        input_cost=input_tokens*input_cost,
        output_cost=output_tokens*output_cost,
        total_cost=(input_tokens * input_cost + output_tokens * output_cost)
    )

def token_price_list(model_id):
    config_path = Path(__file__).parent / "token_cost.yml"
    
    with open(config_path, 'r', encoding='utf-8') as f:
        config = yaml.safe_load(f)
    
    models = config.get('models', {})
    return models.get(model_id, dict(input_cost=0, output_cost=0))