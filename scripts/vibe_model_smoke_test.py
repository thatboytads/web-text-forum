from app.core.vibe_model import predict_vibe

samples = {
    "toxic": ["You are an idiot and this is trash."],
    "constructive": ["Thanks, I agree and recommend a clearer title."],
    "humorous": ["lol that meme was funny"],
    "informative": ["Source: report with data from 2024"],
}

for expected, comments in samples.items():
    result = predict_vibe(comments)
    print(expected, "->", result.label, result.emoji)

