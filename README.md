# EvalAI: AI-Powered Exam Evaluation System

EvalAI is a comprehensive full-stack platform designed to automate and enhance the academic evaluation process. It uses advanced text extraction and semantic analysis to grade students' handwritten or digital answers against instructor-provided model keys.

---

## 🚀 Key Features

### 👨‍🏫 Instructor Dashboard
*   **Intelligent PDF Processing**: Upload student answer sheets and automatically extract text using OCR-ready parser logic.
*   **Semantic AI Evaluation**: Grades answers based on meaning and word-set similarity, ensuring word order or minor phrasing doesn't penalize students.
*   **Student Directory**: Real-time master list synced with Firebase Authentication, providing quick access to Student UUIDs.
*   **Ledger Recording**: One-click "Save to Ledger" to finalize marks and push them to the student's personal profile.

### 🎓 Student Portal
*   **Real-time Results**: Instant access to grades once finalized by instructors.
*   **Detailed Breakdown**: View question-by-question semantic matching percentage and AI-generated feedback.
*   **Performance Metrics**: Visual analytics showing average scores, total exams, and grade trends.

### 🛡️ Admin Controls
*   **User Management**: Role-based access control (Admin, Instructor, Student).
*   **Infrastructure Management**: Configure Exams, Subjects, and Model Answer Keys.

---

## 🏗️ Technical Architecture

### Frontend (React Ecosystem)
*   **Framework**: Vite + React (TypeScript)
*   **Styling**: Tailwind CSS + shadcn/ui components.
*   **State & Data**: @tanstack/react-query for caching and Firebase SDK for real-time listeners.
*   **Animations**: Framer Motion for premium UI transitions.

### Backend (Python/Flask)
*   **Core API**: Flask with CORS enabled.
*   **Database/Auth**: Firebase Admin SDK (Firestore & Authentication).
*   **Deep Processing**: 
    - `PyPDF2`: Document text extraction.
    - `re`: Regex-based document parsing.
    - `difflib/set-logic`: Semantic word similarity algorithms.

---

## 📂 Project Structure

```text
wireframe-weaver/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Shared UI components (Layouts, Sidebar)
│   │   ├── lib/          # Firebase & utility configurations
│   │   └── pages/        # Route-level components (Dashboards, Uploads)
├── backend/              # Flask API
│   ├── app.py            # Main API entry point & logic
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Backend configuration
└── README.md             # Project documentation
```

---

## ⚙️ Connections & Setup

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Firebase Project

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
# Create .env with:
# FLASK_SECRET_KEY=...
# FIREBASE_SERVICE_ACCOUNT_JSON=serviceAccountKey.json
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Core Workflow (The "Loop")

1.  **Preparation**: Admin defines an **Exam** and uploads **Model Answers**.
2.  **Upload**: Instructor uploads a student's answer PDF in the **Upload Papers** section.
3.  **Extraction**: The backend parses the PDF into a JSON structure of Questions and Student Answers.
4.  **Evaluation**: The AI compares the extracted text against the Model Answer using a `Semantic Set Intersection` algorithm.
5.  **Verification**: Instructor enters/copies the **Student UUID** from the **Student Directory** to attribute the marks.
6.  **Ledger**: Instructor clicks **Save to Ledger**, which records the final result in the student's Firestore document.
7.  **Delivery**: The student logs in and sees their new score and feedback in **My Results**.

---

## 🛠️ Key Backend Functions

| Function | Purpose |
| :--- | :--- |
| `parse_extracted_text` | Uses regex to split raw PDF strings into structured Q&A units. |
| `evaluate_confirm` | Performs semantic comparison and calculates percentage match. |
| `list_all_students` | Securely merges Firebase Auth users with Firestore profile snapshots. |
| `record_to_ledger` | Finalizes the result entry into the permanent evaluation database. |

---

## 🎨 UI Layouts

*   **DashboardLayout**: A persistent navigation sidebar and header that adapts based on user role.
*   **UploadPapers**: A step-by-step wizard (Upload → OCR → JSON → AI Eval → Ledger).
*   **StudentDirectory**: A grid-based directory with instant "Copy UUID" functionality.
*   **ResultDetail**: A premium, printable breakdown of individual test performance.

---

## 📝 Usage Notes
- **UUIDs**: Are critical for linking evaluations to students. Instructors should use the Student Directory to ensure accuracy.
- **Normalization**: The AI ignores case, punctuation, and hyphens to ensure fair grading of semantic meaning.
