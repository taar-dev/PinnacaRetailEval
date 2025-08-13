# d.py
from collections import defaultdict
from statistics import mean, median, mode, StatisticsError
from typing import Dict, List, Tuple

# Define lists of positive and negative emotions (customizable)
POSITIVE_EMOTIONS = [
    "Admiration", "Amusement", "Compassion", "Empowerment",
    "Gratitude", "Hope", "Interest", "Joy", "Relief", "Sympathy", "Calmness"
]

NEGATIVE_EMOTIONS = [
    "Anger", "Annoyance", "Disappointment", "Disapproval",
    "Embarrassment", "Fear", "Frustration", "Grief",
    "Jealousy", "Loneliness", "Sadness", "Shame", "Disgust"
]

def extract_emotion_scores(hume_data) -> Dict[str, float]:
    emotion_scores = defaultdict(list)

    try:
        models = hume_data[0]["results"]["predictions"][0]["models"]
    except (IndexError, KeyError):
        raise ValueError("Invalid JSON structure or missing predictions.")

    for modality_data in models.values():
        if "grouped_predictions" in modality_data:
            predictions = modality_data["grouped_predictions"][0]["predictions"]
        else:
            predictions = modality_data.get("predictions", [])

        for segment in predictions:
            for emotion in segment.get("emotions", []):
                name = emotion["name"]
                score = emotion["score"]
                emotion_scores[name].append(score)

    averaged = {
        name: round(sum(scores) / len(scores) * 100, 2)
        for name, scores in emotion_scores.items() if scores
    }

    return averaged


def summarize_emotions(emotion_scores: Dict[str, float]) -> Dict[str, object]:
    values = list(emotion_scores.values())

    def safe_mode(data):
        try:
            return round(mode(data), 2)
        except StatisticsError:
            return None

    # Extract top 3 positive and negative emotions
    def top_emotions(emotions_list: List[str], scores: Dict[str, float]) -> List[Tuple[str, float]]:
        filtered = {k: v for k, v in scores.items() if k in emotions_list}
        return sorted(filtered.items(), key=lambda x: x[1], reverse=True)[:3]

    summary = {
        "mean": round(mean(values), 2) if values else 0,
        "median": round(median(values), 2) if values else 0,
        "mode": safe_mode(values),
        "range": round(max(values) - min(values), 2) if values else 0,
        "top_positive_emotions": top_emotions(POSITIVE_EMOTIONS, emotion_scores),
        "top_negative_emotions": top_emotions(NEGATIVE_EMOTIONS, emotion_scores),
    }

    return summary
