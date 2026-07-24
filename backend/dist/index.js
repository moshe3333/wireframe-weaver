import express, {} from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import mongoose, { Schema } from "mongoose";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB_URL || "";
const jwtSecret = process.env.JWT_SECRET || "fallback_secret";
// Middleware
app.use(cors());
app.use(express.json());
// MongoDB Connection
if (mongoUrl) {
    mongoose
        .connect(mongoUrl)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
}
else {
    console.warn("MONGODB_URL not found in .env");
}
// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });
// --- MongoDB Schemas ---
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: String,
    role: { type: String, default: "student" },
}, { timestamps: true });
const SubjectSchema = new Schema({
    name: String,
    code: String,
});
const QuestionSchema = new Schema({
    q: Number,
    question: String,
    modelAnswer: String,
    maxMarks: Number,
});
const ExamSchema = new Schema({
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    title: String,
    date: String,
    questions: [QuestionSchema],
});
const EvaluationSchema = new Schema({
    roll_number: String,
    exam_id: String,
    score: Number,
    total: Number,
    percentage: String,
    grade: String,
    details: [Schema.Types.Mixed],
    timestamp: { type: Date, default: Date.now },
    type: String,
});
const User = mongoose.model("User", UserSchema);
const Subject = mongoose.model("Subject", SubjectSchema);
const Exam = mongoose.model("Exam", ExamSchema);
const Evaluation = mongoose.model("Evaluation", EvaluationSchema);
// --- Auth Routes ---
app.post("/api/auth/register", async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ error: "Email already in use" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, fullName, role });
        await user.save();
        res.status(201).json({ message: "User created", uid: user._id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = jwt.sign({ uid: user._id, role: user.role }, jwtSecret, {
            expiresIn: "1d",
        });
        res.json({
            token,
            uid: user._id,
            role: user.role,
            fullName: user.fullName,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// --- Data Routes ---
app.get("/api/subjects", async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.json(subjects);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/api/exams", async (req, res) => {
    try {
        const exams = await Exam.find().populate("subjectId");
        res.json(exams);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/api/users/:uid", async (req, res) => {
    try {
        const user = await User.findById(req.params.uid);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        res.json({
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post("/api/extract", upload.array("files"), async (req, res) => {
    try {
        const { exam_id } = req.body;
        const files = req.files;
        if (!exam_id || !files)
            return res.status(400).json({ error: "exam_id and files are required" });
        const exam = await Exam.findById(exam_id);
        if (!exam)
            return res.status(404).json({ error: "Exam not found" });
        let combinedText = "";
        for (const file of files) {
            if (file.originalname.toLowerCase().endsWith(".pdf")) {
                const data = await pdf(file.buffer);
                combinedText += data.text + "\n";
            }
            else if (file.originalname.toLowerCase().endsWith(".docx")) {
                const result = await mammoth.extractRawText({ buffer: file.buffer });
                combinedText += result.value + "\n";
            }
            else {
                combinedText += file.buffer.toString("utf8") + "\n";
            }
        }
        const extractedData = exam.questions.map((mq) => {
            const qn = mq.q || 0;
            const markers = ["Q" + qn, qn + ".", "Question " + qn, "Q " + qn];
            let foundAns = "No student answer detected.";
            for (const marker of markers) {
                const regex = new RegExp(marker, "i");
                const match = combinedText.match(regex);
                if (match) {
                    const startIndex = match.index + match[0].length;
                    let endIndex = combinedText.length;
                    const nextMarkers = [
                        "Q" + (qn + 1),
                        qn + 1 + ".",
                        "Question " + (qn + 1),
                        "Q " + (qn + 1),
                    ];
                    for (const nm of nextMarkers) {
                        const nmMatch = combinedText
                            .substring(startIndex)
                            .match(new RegExp(nm, "i"));
                        if (nmMatch && startIndex + nmMatch.index < endIndex) {
                            endIndex = startIndex + nmMatch.index;
                        }
                    }
                    let content = combinedText.substring(startIndex, endIndex).trim();
                    [/Answer\s*:/i, /Ans\s*:/i].forEach((ap) => {
                        const m = content.match(ap);
                        if (m)
                            content = content.substring(m.index + m[0].length).trim();
                    });
                    if (content) {
                        foundAns = content;
                        break;
                    }
                }
            }
            return {
                question_id: mq._id,
                question_num: qn,
                student_question: mq.question,
                student_answer: foundAns,
            };
        });
        res.json({ extracted_data: extractedData });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post("/api/evaluate-confirm", async (req, res) => {
    try {
        const { exam_id, roll_number, extracted_data } = req.body;
        const exam = await Exam.findById(exam_id);
        if (!exam)
            return res.status(404).json({ error: "Exam not found" });
        let totalScore = 0;
        let maxTotal = 0;
        const details = [];
        const normalize = (t) => t
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter(Boolean)
            .join(" ");
        for (const item of extracted_data) {
            const mq = exam.questions.find((q) => q._id.toString() === item.question_id);
            if (mq) {
                const normS = normalize(item.student_answer || "");
                const normM = normalize(mq.modelAnswer || "");
                let matchPct = 0;
                if (normS === normM && normM)
                    matchPct = 100;
                else if (normM) {
                    const sWords = new Set(normS.split(" "));
                    const mWords = new Set(normM.split(" "));
                    const intersection = new Set([...sWords].filter((x) => mWords.has(x)));
                    matchPct = Math.round((intersection.size / mWords.size) * 100);
                }
                const qMax = mq.maxMarks || 10;
                const qScore = Math.floor(qMax * (matchPct / 100));
                totalScore += qScore;
                maxTotal += qMax;
                details.push({
                    question_num: mq.q,
                    score: qScore + "/" + qMax,
                    match: matchPct,
                });
            }
        }
        const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;
        const result = {
            roll_number,
            exam_id,
            score: totalScore,
            total: maxTotal,
            percentage: percentage + "%",
            grade: percentage >= 90 ? "A+" : percentage >= 80 ? "A" : "B",
            details,
        };
        if (roll_number !== "RESERVED_UNASSIGNED") {
            await new Evaluation({ ...result, type: "SYSTEM_EVAL" }).save();
        }
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(port, () => console.log("Server running on port " + port));
//# sourceMappingURL=index.js.map