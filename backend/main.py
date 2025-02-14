from fastapi import FastAPI
from Bio import Entrez
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_pubmed_articles(query: str, max_results: int = 5):
    Entrez.email = "lamp.benji@gmail.com"  # Required by PubMed
    try:
        # Search for articles
        handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results)
        search_results = Entrez.read(handle)
        id_list = search_results["IdList"]

        # Fetch details
        handle = Entrez.efetch(db="pubmed", id=id_list, rettype="medline", retmode="text")
        articles_raw = handle.read().split("\n\n")

        # Parse articles
        articles = []
        for article in articles_raw:
            if "TI  - " in article:
                title = article.split("TI  - ")[1].split("\n")[0].strip()
                abstract = article.split("AB  - ")[1].split("\n\n")[0].strip() if "AB  - " in article else ""
                articles.append({
                    "title": title,
                    "abstract": abstract,
                    "pmid": id_list.pop(0)
                })
        return articles
    except Exception as e:
        return {"error": str(e)}

@app.get("/articles")
async def get_articles(query: str = "machine learning cancer"):
    return fetch_pubmed_articles(query)