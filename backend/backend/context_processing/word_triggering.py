SALES_TRIGGERS = {
    "objection": ["but", "however", "expensive", "think about it"],
    "interest": ["tell me more", "how much", "when can"],
    "closing": ["ready to", "let's do it", "sign up"]
}

def detect_sales_moment(text):
    for trigger_type, keywords in SALES_TRIGGERS.items():
        if any(keyword in text.lower() for keyword in keywords):
            return trigger_type
    return None
