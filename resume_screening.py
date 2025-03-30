import sys
import spacy

nlp = spacy.load("en_core_web_sm")
job_keywords = {
    "software": ["python", "javascript", "react", "node.js", "developer", "engineer"],
    "marketing": ["SEO", "social media", "branding", "content writing"],
}

def match_resume(resume_text):
    doc = nlp(resume_text.lower())
    scores = {job: sum(1 for token in doc if token.text in keywords) / len(keywords) * 100
              for job, keywords in job_keywords.items()}
    best_match = max(scores, key=scores.get)
    return f"Resume matches {scores[best_match]:.2f}% for {best_match} jobs."

if __name__ == "__main__":
    with open(sys.argv[1], "r", encoding="utf-8") as file:
        resume_text = file.read()
    print(match_resume(resume_text))
 
