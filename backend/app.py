from flask import Flask, request, jsonify, send_file, send_from_directory
import os
import joblib
import pandas as pd
import numpy as np
from flask_cors import CORS
from flask import make_response
from sdv.metadata import SingleTableMetadata
from sdv.evaluation.single_table import run_diagnostic, evaluate_quality
import base64
import json
import requests
from transformers import pipeline
import xml.etree.ElementTree as ET
import tensorflow as tf
import keras
import io
import zipfile
import random
import matplotlib.pyplot as plt

app = Flask(__name__)
CORS(app)

synth_dir = "backend/trained_synthesizers"
os.makedirs(synth_dir, exist_ok=True)

synthesizers = {
    f.replace("_synthesizer.pkl", ""): joblib.load(os.path.join(synth_dir, f))
    for f in os.listdir(synth_dir)
    if f.endswith("_synthesizer.pkl")
}

# Load summarization model
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

has_multitable = os.path.exists(os.path.join(synth_dir, "multitable_synthesizer.pkl"))

XRAY_MODEL_PATH = "backend/chest_xray_generator.h5"
MRI_MODEL_PATH = "backend/brain_mri_generator.h5"

xraygenerator = keras.models.load_model(XRAY_MODEL_PATH, compile=False)
mrigenerator = keras.models.load_model(MRI_MODEL_PATH, compile=False)

NOISE_DIM = 256  # Update if needed

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
    url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/?report=xml&format=text"
    r = requests.get(url)
    if r.status_code == 200:
        return r.text
    return None

def extract_text_from_pmc_xml(xml_text):
    try:
        root = ET.fromstring(xml_text)
        def strip_ns(tag): return tag.split('}')[-1]
        texts = []
        for elem in root.iter():
            if strip_ns(elem.tag) in ['p', 'title', 'sec']:
                if elem.text:
                    texts.append(elem.text.strip())
        return " ".join(texts)
    except ET.ParseError:
        return None

def make_json_serializable(obj):
    if isinstance(obj, pd.DataFrame):
        return obj.to_dict(orient='records')
    elif isinstance(obj, pd.Series):
        return obj.tolist()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(i) for i in obj]
    else:
        return obj

def get_histogram_data(df, column, bins=20):
    values = df[column].dropna()
    if pd.api.types.is_numeric_dtype(values):
        counts, bin_edges = np.histogram(values, bins=bins)
        return {
            "bin_edges": bin_edges.tolist(),
            "counts": counts.tolist()
        }
    else:
        vc = values.value_counts()
        return {
            "categories": vc.index.tolist(),
            "counts": vc.values.tolist()
        }

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "API is working well ✅"}), 200

@app.route("/generate", methods=["POST"])
def generate_synthetic_data():
    data = request.json
    table = data.get("table_name")
    num_rows = int(data.get("num_rows", 1000))
    validation_column = data.get("validation_column")

    if table not in synthesizers:
        return jsonify({"error": f"Synthesizer for table '{table}' not found."}), 400

    try:
        synthetic_df = synthesizers[table].sample(num_rows=num_rows)
        csv_str = synthetic_df.to_csv(index=False)
        csv_b64 = base64.b64encode(csv_str.encode('utf-8')).decode('utf-8')

        # If validation_column is provided, perform validation and generate reports
        if validation_column:
            real_path = os.path.join("backend", "eicu-demo", table, f"{table}.csv")
            if not os.path.exists(real_path):
                return jsonify({"error": f"Real data file not found for table '{table}'"}), 404

            real_df = pd.read_csv(real_path)
            metadata = SingleTableMetadata()
            metadata.detect_from_dataframe(real_df)

            # Generate validation data
            diagnostics = run_diagnostic(real_df, synthetic_df, metadata)
            quality = evaluate_quality(real_df, synthetic_df, metadata)

            # Get histogram data for the validation column
            validation_data = {
                "real": get_histogram_data(real_df, validation_column),
                "synthetic": get_histogram_data(synthetic_df, validation_column),
                "column": validation_column
            }

            report = {
                "diagnostic_report": make_json_serializable(diagnostics.get_properties()),
                "quality_report": make_json_serializable(quality.get_properties()),
                "validation_data": validation_data
            }

            return jsonify({
                "csv_base64": csv_b64,
                "report": report
            })

        # If no validation_column provided, return only the CSV data
        return jsonify({
            "csv_base64": csv_b64
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/tables", methods=["GET"])
def list_tables():
    tables = list(synthesizers.keys())
    if has_multitable:
        tables.append("__multi_table__")
    return jsonify({"available_tables": tables})

@app.route('/mri_generate', methods=['GET'])
def generate_mri_images():
    try:
        num_images = int(request.args.get('count', 1))

        # Prepare in-memory zip
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for i in range(num_images):
                seed = random.randint(1, 10000)
                np.random.seed(seed)
                noise = np.random.normal(0, 1, (1, NOISE_DIM))
                img = mrigenerator.predict(noise, verbose=0)[0]

                # Normalize
                if img.min() < 0:
                    img = (img + 1) / 2.0

                # Convert to PNG
                plt.figure(figsize=(8, 8))
                plt.imshow(img, cmap='gray')
                plt.axis('off')
                
                # Save to buffer
                img_buffer = io.BytesIO()
                plt.savefig(img_buffer, format='png', bbox_inches='tight', pad_inches=0)
                plt.close()
                
                img_buffer.seek(0)
                zip_file.writestr(f'mri_{i+1}.png', img_buffer.getvalue())

        zip_buffer.seek(0)
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='mri_images.zip'
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/xray_generate', methods=['GET'])
def generate_xray_images():
    try:
        num_images = int(request.args.get('count', 1))

        # Prepare in-memory zip
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for i in range(num_images):
                seed = random.randint(1, 10000)
                np.random.seed(seed)
                noise = np.random.normal(0, 1, (1, NOISE_DIM))
                img = xraygenerator.predict(noise, verbose=0)[0]

                # Normalize
                if img.min() < 0:
                    img = (img + 1) / 2.0

                # Convert to PNG
                plt.figure(figsize=(8, 8))
                plt.imshow(img, cmap='gray')
                plt.axis('off')
                
                # Save to buffer
                img_buffer = io.BytesIO()
                plt.savefig(img_buffer, format='png', bbox_inches='tight', pad_inches=0)
                plt.close()
                
                img_buffer.seek(0)
                zip_file.writestr(f'xray_{i+1}.png', img_buffer.getvalue())

        zip_buffer.seek(0)
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='xray_images.zip'
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/search', methods=['POST'])
def search():
    try:
        data = request.json
        query = data.get('query')
        max_results = int(data.get('max_results', 5))

        if not query:
            return jsonify({"error": "Query is required"}), 400

        # Get PMIDs
        pmids = fetch_pubmed_pmids(query, max_results)
        print(f"Found PMIDs: {pmids}")  # Debug log
        papers = []

        for pmid in pmids:
            try:
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
                text_to_summarize = full_text[:max_len]
                try:
                    summary_result = summarizer(text_to_summarize, max_length=130, min_length=30, do_sample=False)
                    summary_text = summary_result[0]['summary_text']
                except Exception as e:
                    print(f"Error generating summary for paper {pmid}: {str(e)}")
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
                print(f"Processed paper {pmid}")  # Debug log

            except Exception as e:
                print(f"Error processing paper {pmid}: {str(e)}")  # Debug log
                continue

        print(f"Returning {len(papers)} results")  # Debug log
        return jsonify({"pubmed": papers})

    except Exception as e:
        print(f"Search error: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6002, debug=True)
