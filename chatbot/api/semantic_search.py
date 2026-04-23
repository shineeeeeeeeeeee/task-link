import json
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

with open("../dataset/internship_faq.json") as f:
    faq_data = json.load(f)

questions = [item["question"] for item in faq_data]
answers = [item["answer"] for item in faq_data]

# dataset questions into embeddings
question_embeddings = model.encode(questions)

def find_best_answer(user_question):

    user_embedding = model.encode([user_question])

    # similarity
    similarities = np.dot(question_embeddings, user_embedding.T)

    best_index = np.argmax(similarities)

    return answers[best_index]
