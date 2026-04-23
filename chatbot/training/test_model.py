import pickle

model = pickle.load(open("../models/intent_model.pkl", "rb"))
vectorizer = pickle.load(open("../models/vectorizer.pkl", "rb"))

text = ["hi"]

vec = vectorizer.transform(text)

prediction = model.predict(vec)

print(prediction)
