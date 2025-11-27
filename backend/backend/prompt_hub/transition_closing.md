# CUSTOMER INTEREST DETECTION

Analyze 8-second audio chunk from ongoing insurance sales conversation.

Return `true` ONLY if customer shows interest through trigger words:

**Interest Triggers:**
- "สนใจ" (interested)
- "อยากรู้" (want to know)
- "ดีจัง" (sounds good)
- "น่าสนใจ" (interesting)
- "ช่วยได้" (can help)
- "เหมาะกับเรา" (suitable for us)
- "ราคาเท่าไหร่" (how much)
- "เริ่มยังไง" (how to start)
- "สมัครได้ไหม" (can I apply)

Return `false` for all other cases.

Return ONLY in JSON as following schema:

```json
{
  "interest": "true if customer shows interest based on trigger words; false otherwise."
}
```