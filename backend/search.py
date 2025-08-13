from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from transformers import pipeline
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app)

# Load summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def fetch_pubmed_pmids(query, max_results=10):
    url = ("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?"
           f"db=pubmed&term={query}&retmax={max_results}&retmode=json")
    r = requests.get(url)
    r.raise_for_status()
    data = r.json()
    return data.get("esearchresult", {}).get("idlist", [])

def get_pmcid_from_pmid(pmid):
    url = (f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?"
           f"dbfrom=pubmed&db=pmc&id={pmid}&retmode=json")
    r = requests.get(url)
    r.raise_for_status()
    data = r.json()
    try:
        pmcid = data['linksets'][0]['linksetdbs'][0]['links'][0]
        return f"PMC{pmcid}"
    except (IndexError, KeyError):
        return None

def fetch_pmc_full_text(pmcid):
    # Fetch full text in XML format
    url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/?report=xml&format=text"
    r = requests.get(url)
    if r.status_code == 200:
        return r.text
    return None

def extract_text_from_pmc_xml(xml_text):
    try:
        root = ET.fromstring(xml_text)
        # PMC XML namespace might be present, ignore for simplicity by stripping namespace
        def strip_ns(tag): return tag.split('}')[-1]
        
        texts = []
        for elem in root.iter():
            if strip_ns(elem.tag) in ['p', 'title', 'sec']:
                if elem.text:
                    texts.append(elem.text.strip())
        full_text = " ".join(texts)
        return full_text
    except ET.ParseError:
        return None

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    query = data.get('query')
    max_results = int(data.get('max_results', 5))

    pmids = fetch_pubmed_pmids(query, max_results)
    papers = []

    for pmid in pmids:
        # Fetch metadata summary from PubMed
        summary_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pmid}&retmode=json"
        r = requests.get(summary_url)
        r.raise_for_status()
        summary_data = r.json()
        docsum = summary_data.get("result", {}).get(pmid, {})

        title = docsum.get("title", "No title")
        authors = [a.get("name") for a in docsum.get("authors", [])]
        pub_date = docsum.get("pubdate", "Unknown")
        source = docsum.get("source", "PubMed")
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

        # Try to get PMC full text
        pmcid = get_pmcid_from_pmid(pmid)
        full_text = None
        if pmcid:
            xml_text = fetch_pmc_full_text(pmcid)
            if xml_text:
                full_text = extract_text_from_pmc_xml(xml_text)

        # If no full text, fall back to abstract
        if not full_text:
            abstract = docsum.get("elocationid", "")  # Not always abstract; better to get from efetch
            # Fetch abstract using efetch
            efetch_url = (f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?"
                          f"db=pubmed&id={pmid}&retmode=xml")
            r = requests.get(efetch_url)
            if r.status_code == 200:
                root = ET.fromstring(r.text)
                abstract_texts = root.findall(".//AbstractText")
                abstract = " ".join([elem.text for elem in abstract_texts if elem.text])
            else:
                abstract = "Abstract not available."
            full_text = abstract

        # Summarize (if text is too long, truncate or chunk)
        max_len = 1000
        text_to_summarize = full_text[:max_len]  # simple truncation
        try:
            summary_result = summarizer(text_to_summarize, max_length=130, min_length=30, do_sample=False)
            summary_text = summary_result[0]['summary_text']
        except Exception:
            summary_text = "Summary generation failed."

        paper = {
            "source": source,
            "title": title,
            "authors": authors,
            "publication_date": pub_date,
            "url": url,
            "full_text_snippet": text_to_summarize,
            "summary": summary_text
        }
        papers.append(paper)

    return jsonify({"pubmed": papers})

if __name__ == '__main__':
    app.run(debug=True)