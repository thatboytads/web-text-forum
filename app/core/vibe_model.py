from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


@dataclass(frozen=True)
class VibeResult:
    label: str
    emoji: str


LABEL_TO_EMOJI = {
    "toxic": "⚠️",
    "constructive": "✅",
    "humorous": "😄",
    "informative": "📚",
}


def _training_samples() -> list[tuple[str, str]]:
    return [
        ("you are an idiot and this is garbage", "toxic"),
        ("this is dumb and a total scam", "toxic"),
        ("hate this idea, it is trash", "toxic"),
        ("thanks for sharing, i agree with your point", "constructive"),
        ("i recommend adding more sources and evidence", "constructive"),
        ("consider improving the title for clarity", "constructive"),
        ("lol that was funny", "humorous"),
        ("haha great joke", "humorous"),
        ("lmao this meme is perfect", "humorous"),
        ("the report shows data from 2024", "informative"),
        ("source: study with evidence and facts", "informative"),
        ("here is a link to the dataset", "informative"),
    ]


def _build_model() -> Pipeline:
    samples = _training_samples()
    texts = [text for text, _ in samples]
    labels = [label for _, label in samples]
    model = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
        ("clf", LogisticRegression(max_iter=300)),
    ])
    model.fit(texts, labels)
    return model


_MODEL = _build_model()


def predict_vibe(comments: Iterable[str]) -> VibeResult:
    comment_list = [text.strip() for text in comments if text and text.strip()]
    if not comment_list:
        return VibeResult(label="constructive", emoji=LABEL_TO_EMOJI["constructive"])

    combined = " ".join(comment_list)
    label = _MODEL.predict([combined])[0]
    emoji = LABEL_TO_EMOJI.get(label, "✅")
    return VibeResult(label=label, emoji=emoji)

