import pickle
import os
from pprint import pprint

model_path = "../models/intent_model.pkl"
vec_path = "../models/vectorizer.pkl"

test_messages = ["hi", "hello", "hey", "bye", "company", "internship"]

print("Model exists:", os.path.exists(model_path))
print("Vectorizer exists:", os.path.exists(vec_path))

model = pickle.load(open(model_path, "rb"))
vectorizer = pickle.load(open(vec_path, "rb"))
print("Model type:", type(model))
print("Vectorizer type:", type(vectorizer))

vocab = getattr(vectorizer, 'vocabulary_', None)
print("Sample vocab size:", len(vocab) if vocab else None)
print("Vocab contains 'hi':", ('hi' in vocab) if vocab else None)
print("Vocab contains 'hello':", ('hello' in vocab) if vocab else None)
print("Vocab contains 'bye':", ('bye' in vocab) if vocab else None)

for msg in test_messages:
    v = vectorizer.transform([msg])
    try:
        pred = model.predict(v)[0]
    except Exception as e:
        print(f"Error predicting for {msg!r}: {e}")
        continue

    if hasattr(model, 'predict_proba'):
        try:
            probs = model.predict_proba(v)[0]
            classes = list(model.classes_)
            prob_list = list(zip(classes, probs))
            print(f"Message: {msg!r} => pred: {pred}, probs: {prob_list}")
        except Exception as e:
            print(f"Message: {msg!r} => pred: {pred}, but predict_proba error: {e}")
    else:
        print(f"Message: {msg!r} => pred: {pred}")
