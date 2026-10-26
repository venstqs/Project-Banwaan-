from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
import os
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

app = FastAPI(title="Project Banwaan AI Backend", version="1.0")

# Enable CORS so your frontend map (running on React, Flutter, or localhost) can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize Groq LLM
os.environ["GROQ_API_KEY"] = "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"
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)

# 2. Load the Master CBMS Dataset CSV at Startup
DATA_FILE = "data/Banwaan_Full_Dataset_Map_And_AI.csv"
if os.path.exists(DATA_FILE):
    df = pd.read_csv(DATA_FILE, index_col=0)
    print(f"✅ Loaded CBMS dataset with {len(df)} Barangays.")
else:
    print(f"⚠️ Warning: {DATA_FILE} not found. Place your CSV in a 'data/' folder.")

# 3. Load the RAG Vector Database (Legal Brain)
try:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
    print("✅ RAG Legal Brain (ChromaDB) loaded successfully!")
except Exception as e:
    print(f"⚠️ Warning: Could not load chroma_db folder: {e}")
    vector_db = None

# Office Role Mappings
OFFICE_ROLES = {
    "CPDO": {"name": "City Planning and Development Office", "sheets": ['Summary statistics', 'Population', 'Building', 'SDG']},
    "SWO": {"name": "City Social Welfare and Development Office", "sheets": ['Food insecurity experience', 'Key employment statistics', 'Informal employment', 'Overcrowding status', 'Financial account']},
    "DRRMO": {"name": "Disaster Risk Reduction and Management Office", "sheets": ['DRRM', 'Roof material', 'Outer walls material', 'Floor material']}
}

@app.get("/")
def home():
    return {"status": "Project Banwaan AI Backend is live!", "available_barangays": list(df.index) if 'df' in globals() else []}

@app.post("/scan-barangay/{barangay_name}")
def scan_barangay_api(barangay_name: str):
    if 'df' not in globals() or barangay_name not in df.index:
        raise HTTPException(status_code=404, detail=f"Barangay '{barangay_name}' not found in dataset.")
    
    bgy_row = df.loc[barangay_name]
    
    # Automated Trigger Logic
    triggered_office = "CPDO"
    detected_crisis = "General infrastructure and development backlog based on composite CBMS indicators."
    
    for col, val in bgy_row.items():
        col_lower = str(col).lower()
        if ('vulnerability_index' in col_lower and val > 70) or ('4ps' in col_lower and val > 50):
            triggered_office = "SWO"
            detected_crisis = f"Critical high vulnerability or social welfare dependency flag detected ({col}: {val})."
            break
        elif 'roof material' in col_lower and val > 40:
            triggered_office = "DRRMO"
            detected_crisis = f"High concentration of vulnerable housing materials detected ({col}: {val})."
            break

    role_info = OFFICE_ROLES.get(triggered_office, OFFICE_ROLES["CPDO"])
    
    # Filter columns to keep prompt lightweight
    allowed_cols = [
        col for col in df.columns 
        if any(s.lower() in col.lower() for s in role_info["sheets"]) or col == 'Vulnerability_Index'
    ]
    bgy_filtered = dict(list(bgy_row[allowed_cols].round(2).items()[:15]))
    
    # RAG Search for Legal Basis
    legal_context = "Republic Act No. 7160 (Local Government Code), RA 10121 (DRRM Act), RA 11315 (CBMS Act)."
    if vector_db is not None:
        try:
            retrieved_docs = vector_db.similarity_search(f"{role_info['name']} {detected_crisis}", k=1)
            legal_context = "\n\n".join([doc.page_content for doc in retrieved_docs])
        except Exception:
            pass

    # Prompt enforcing your exact structure constraints
    prompt = f"""
    You are the Proactive Policy Engine for Project Banwaan, acting for the {role_info['name']} ({triggered_office}) in Naga City.
    
    AUTOMATED TRIGGER: Barangay {barangay_name.upper()} flagged due to: "{detected_crisis}".
    
    KEY CBMS METRICS:
    {json.dumps(bgy_filtered, indent=2)}
    
    LEGAL BASIS / RAG:
    {legal_context}
    
    TASK: Proactively generate a policy and program proposal tailored for the Barangay Captain of {barangay_name.upper()}.
    
    STRICT FORMAT REQUIREMENTS:
    
    ### 1. Overview
    (Provide a concise summary of the barangay's current situation based on CBMS metrics. **CRITICAL: Must be strictly a maximum of 150 words.**)
    
    ### 2. Policy
    (Provide exactly 5 distinct, actionable policies, programs, or local ordinances. Number them 1 to 5. Cite specific Republic Acts and Sections where applicable.)
    
    ### 3. SDG Alignment
    (Detail at least 3 Sustainable Development Goals—such as SDG 1, SDG 8, SDG 9, or SDG 11—that these policies fulfill, explaining how each goal is addressed.)
    
    ### 4. Impact
    (Detail the expected changes in indicators, estimated cost/budget source, and targeted improvement for the barangay.)
    """
    
    response = llm.invoke(prompt)
    
    return {
        "barangay": barangay_name,
        "triggered_office": role_info["name"],
        "detected_crisis": detected_crisis,
        "proposal": response.content
    }
