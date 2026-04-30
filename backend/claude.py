import os

import anthropic

from models import ReviewItem, ReviewSynthesis


async def synthesize_reviews(reviews: list[ReviewItem]) -> ReviewSynthesis | None:
    if not reviews:
        return None
    try:
        client = anthropic.AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        review_text = "\n".join(
            f"[Rating {r.quality_rating}/5] {r.comment}" for r in reviews[:60]
        )
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=512,
            tools=[{
                "name": "submit_synthesis",
                "description": "Submit the structured professor review synthesis",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "vibe": {"type": "string", "description": "2-sentence overall feel of this professor"},
                        "strengths": {"type": "array", "items": {"type": "string"}, "description": "3-5 bullet strengths"},
                        "weaknesses": {"type": "array", "items": {"type": "string"}, "description": "2-4 bullet weaknesses"},
                        "recommendation": {"type": "string", "description": "Who should (and shouldn't) take this professor, 1-2 sentences"},
                    },
                    "required": ["vibe", "strengths", "weaknesses", "recommendation"],
                },
            }],
            tool_choice={"type": "tool", "name": "submit_synthesis"},
            messages=[{
                "role": "user",
                "content": f"Synthesize these professor reviews:\n\n{review_text}",
            }],
        )
        tool_use_block = next(b for b in response.content if b.type == "tool_use")
        return ReviewSynthesis(**tool_use_block.input)
    except Exception:
        return None
