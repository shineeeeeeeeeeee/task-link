import pandas as pd
import pickle

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# Load data
data = pd.read_csv("../dataset/intent_data.csv")

X = data["text"]
y = data["label"]

# Print label distribution for diagnostics
print("Label distribution:\n", y.value_counts())

# Build a pipeline that includes vectorizer + classifier
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression(class_weight='balanced', max_iter=1000))
])

# Train
pipeline.fit(X, y)

# Save pipeline 
pickle.dump(pipeline, open("../models/intent_pipeline.pkl", "wb"))

# For backward compatibility also save separate model and vectorizer
vectorizer = pipeline.named_steps['tfidf']
model = pipeline.named_steps['clf']

pickle.dump(model, open("../models/intent_model.pkl", "wb"))
pickle.dump(vectorizer, open("../models/vectorizer.pkl", "wb"))

print("Intent pipeline trained and saved.")
