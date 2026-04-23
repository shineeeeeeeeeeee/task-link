from flask import Flask, request, jsonify
import pickle
import re

from semantic_search import find_best_answer

from recommend import get_user_data, recommend_jobs

# Load intent model (prefer pipeline if available)
import os
pipeline = None
if os.path.exists("../models/intent_pipeline.pkl"):
    pipeline = pickle.load(open("../models/intent_pipeline.pkl", "rb"))

# Backwards compatibility: load separate model/vectorizer if pipeline not present
intent_model = None
vectorizer = None
if pipeline is None:
    intent_model = pickle.load(open("../models/intent_model.pkl", "rb"))
    vectorizer = pickle.load(open("../models/vectorizer.pkl", "rb"))
else:
    intent_model = pipeline
    # pipeline contains both vectorizer and classifier

app = Flask(__name__)

@app.route("/chatbot", methods=["POST"])
def chatbot():

    data = request.json or {}
    message = (data.get("message") or "").strip().lower()
    user_id = data.get("userId", "demo-user")

    # Greeting 
    if re.search(r"\b(hi|hello|hey|howdy|greetings)\b", message):
        return jsonify({"reply": "Hello! How can I help you with internships?"})

    if re.search(r"\b(bye|goodbye|see you)\b", message):
        return jsonify({"reply": "Good luck with your internship journey! 👋"})

    # Intent prediction
    if hasattr(intent_model, 'named_steps'):  # pipeline
        intent = intent_model.predict([message])[0]
        probs = intent_model.predict_proba([message])[0]
        classes = list(intent_model.classes_)
    else:
        vec = vectorizer.transform([message])
        intent = intent_model.predict(vec)[0]
        probs = intent_model.predict_proba(vec)[0] if hasattr(intent_model, 'predict_proba') else None
        classes = list(intent_model.classes_) if hasattr(intent_model, 'classes_') else None

    # Confidence filtering
    if probs is not None and classes is not None:
        pred_prob = dict(zip(classes, probs)).get(intent, 0)
        if intent != 'internship' and pred_prob < 0.2:
            intent = 'other'

    # Other
    if intent == "other":
        return jsonify({
            "reply": "Sorry, I can only help with internship-related queries."
        })

    # Recommendation Logic
    if intent == "recommendation":
        # optionally accept auth token in request
        auth_token = data.get("authToken")
        user_data = get_user_data(user_id, auth_token=auth_token)
        jobs = recommend_jobs(user_data, top_k=5, auth_token=auth_token)

        # return structured suggestions
        return jsonify({
            "reply": "Here are jobs you might like.",
            "recommendations": jobs
        })

    # Internship Q&A
    answer = find_best_answer(message)

    if not answer:
        return jsonify({
            "reply": "I’m not fully sure, but check the internship section on the portal."
        })

    return jsonify({"reply": answer})

if __name__ == "__main__":
    app.run(port=5002)
