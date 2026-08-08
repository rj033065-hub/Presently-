import re
from typing import List

PROFANITY_WORDS: List[str] = [
    "badword",
    "spamword",
    "scam",
    "offensive",
    "abusive",
    "hate",
    "slur",
]


def contains_profanity(text: str) -> bool:
    """
    Check if the text contains any profanity/offensive terms.
    """
    if not text:
        return False
    lower_text = text.lower()
    for word in PROFANITY_WORDS:
        pattern = r"\b" + re.escape(word) + r"\b"
        if re.search(pattern, lower_text):
            return True
    return False


def censor_profanity(text: str) -> str:
    """
    Censor profane words with asterisks.
    """
    if not text:
        return text
    censored = text
    for word in PROFANITY_WORDS:
        pattern = re.compile(r"\b" + re.escape(word) + r"\b", re.IGNORECASE)
        censored = pattern.sub("*" * len(word), censored)
    return censored
