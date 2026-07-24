import express, { type Request, type Response } from "express";
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
    .then(async () => {
      console.log("Connected to MongoDB");
      // Fix for E11000 duplicate key error: walletAddress_1
      try {
        const users = mongoose.connection.db?.collection('users');
        if (users) {
          await users.dropIndex("walletAddress_1");
          console.log("Successfully dropped duplicate index: walletAddress_1");
        }
      } catch (e: any) {
        if (e.codeName !== 'IndexNotFound') {
          console.log("Note: Could not drop index (likely does not exist or already dropped)");
        }
      }
    })
    .catch((err) => console.error("MongoDB connection error:", err));
} else {
  console.warn("MONGODB_URL not found in .env");
}

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- MongoDB Schemas ---

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: String,
    accountType: { type: String, default: "student" },
  },
  { timestamps: true }
);

const SubjectSchema = new Schema({
  name: String,
  code: String,
  description: String,
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
  duration: String,
  status: String,
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
  recorded_at: { type: Date, default: Date.now },
  type: String,
});

const User = mongoose.model("User", UserSchema);
const Subject = mongoose.model("Subject", SubjectSchema);
const Exam = mongoose.model("Exam", ExamSchema);
const Evaluation = mongoose.model("Evaluation", EvaluationSchema);

const isImageFile = (fileName: string) => /\.(png|jpe?g|webp|bmp|tiff?)$/i.test(fileName);

const extractTextFromFile = async (file: Express.Multer.File) => {
  const fileName = file.originalname.toLowerCase();

  if (fileName.endsWith(".pdf")) {
    const data = await pdf(file.buffer);
    return data.text || "";
  }

  if (fileName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || "";
  }

  if (isImageFile(fileName)) {
    // OCR dependency is optional; without it we return empty text and let caller decide.
    return "";
  }

  return file.buffer.toString("utf8");
};

const parseQaFromText = (rawText: string) => {
  const text = (rawText || "").replace(/\r\n/g, "\n").trim();
  if (!text) return [] as Array<{ question: string; answer: string }>;

  // Supports patterns like: Q1 ... A1 ... or Question 1 ... Answer ...
  const segments = text
    .split(/\n(?=(?:Q(?:uestion)?\s*\d+[\.:\)]|\d+[\.)]))/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = segments
    .map((seg) => {
      const cleaned = seg.replace(/^(?:Q(?:uestion)?\s*\d+[\.:\)]|\d+[\.)])\s*/i, "");
      const answerSplit = cleaned.split(/\n?\s*(?:A(?:nswer)?\s*[:\.-])\s*/i);
      if (answerSplit.length < 2) return null;

      const question = answerSplit[0]?.trim();
      const answer = answerSplit.slice(1).join(" ").trim();

      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(Boolean) as Array<{ question: string; answer: string }>;

  return parsed;
};

const mapExam = (exam: any) => ({
  id: exam._id?.toString(),
  _id: exam._id,
  title: exam.title,
  date: exam.date,
  duration: exam.duration || "",
  status: exam.status || "Upcoming",
  subject: exam.subjectId?.name || "Unknown Subject",
  subjectId: exam.subjectId?._id || exam.subjectId,
  questions: Array.isArray(exam.questions) ? exam.questions.length : 0,
});

// --- Auth Routes ---

app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, accountType } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, fullName, accountType });
    await user.save();

    res.status(201).json({ message: "User created", uid: user._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ uid: user._id, accountType: user.accountType }, jwtSecret, {
      expiresIn: "1d",
    });
    res.json({
      token,
      uid: user._id,
      accountType: user.accountType,
      fullName: user.fullName,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Data Routes ---

app.get("/api/subjects", async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/subjects", async (req: Request, res: Response) => {
  try {
    const { code, name, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: "code and name are required" });
    }

    const subject = new Subject({ code, name, description: description || "" });
    await subject.save();
    res.status(201).json(subject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/exams", async (req: Request, res: Response) => {
  try {
    const exams = await Exam.find().populate("subjectId").sort({ date: -1 });
    res.json(exams.map(mapExam));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/exams", async (req: Request, res: Response) => {
  try {
    const { title, subject, date, duration, status, questions } = req.body;
    if (!title || !subject || !date) {
      return res.status(400).json({ error: "title, subject and date are required" });
    }

    let subjectDoc = await Subject.findOne({ name: subject });
    if (!subjectDoc) {
      subjectDoc = await Subject.create({
        name: subject,
        code: String(subject).toUpperCase().replace(/\s+/g, "-").slice(0, 20),
      });
    }

    const exam = new Exam({
      title,
      subjectId: subjectDoc._id,
      date,
      duration: duration || "",
      status: status || "Upcoming",
      questions: Array.from({ length: Number(questions) || 0 }).map((_, i) => ({
        q: i + 1,
        question: "",
        modelAnswer: "",
        maxMarks: 10,
      })),
    });

    await exam.save();
    const populated = await Exam.findById(exam._id).populate("subjectId");
    res.status(201).json(populated ? mapExam(populated) : exam);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/exams/:examId/questions", async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    const questions = (exam.questions || []).map((q: any) => ({
      id: q._id?.toString(),
      q: q.q,
      question: q.question,
      modelAnswer: q.modelAnswer,
      maxMarks: q.maxMarks,
    }));
    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/exams/:examId/questions", async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    const { q, question, modelAnswer, maxMarks } = req.body;
    const nextQ = q || exam.questions.length + 1;
    exam.questions.push({ q: nextQ, question, modelAnswer, maxMarks } as any);
    await exam.save();

    const created = exam.questions[exam.questions.length - 1] as any;
    res.status(201).json({
      id: created._id?.toString(),
      q: created.q,
      question: created.question,
      modelAnswer: created.modelAnswer,
      maxMarks: created.maxMarks,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/exams/:examId/import-key",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const exam = await Exam.findById(req.params.examId);
      if (!exam) return res.status(404).json({ error: "Exam not found" });
      if (!req.file) return res.status(400).json({ error: "file is required" });

      const file = req.file;
      const fileName = file.originalname.toLowerCase();
      let qa: Array<{ question: string; answer: string }> = [];

      if (fileName.endsWith(".json") || (file.mimetype || "").includes("json")) {
        const parsed = JSON.parse(file.buffer.toString("utf8"));
        const rawQa = Array.isArray(parsed?.qa) ? parsed.qa : [];
        qa = rawQa
          .map((item: any) => ({
            question: String(item?.question || "").trim(),
            answer: String(item?.answer || "").trim(),
          }))
          .filter((item: any) => item.question && item.answer);
      } else {
        const extractedText = await extractTextFromFile(file);
        if (isImageFile(fileName) && !extractedText.trim()) {
          return res.status(400).json({
            error:
              "Image OCR is not configured on the server. Please upload JSON or text/PDF/DOCX key files.",
          });
        }
        qa = parseQaFromText(extractedText);
      }

      if (qa.length === 0) {
        return res.status(400).json({
          error:
            "Could not parse question-answer pairs. Use JSON { qa: [{ question, answer }] } or include Q/A markers in the uploaded file.",
        });
      }

      const startQ = (exam.questions || []).length + 1;
      qa.forEach((item, index) => {
        exam.questions.push({
          q: startQ + index,
          question: item.question,
          modelAnswer: item.answer,
          maxMarks: 10,
        } as any);
      });

      await exam.save();

      res.status(201).json({
        success: true,
        imported: qa.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.delete("/api/exams/:examId/questions/:questionId", async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ error: "Exam not found" });

    exam.questions = exam.questions.filter(
      (q: any) => q._id?.toString() !== req.params.questionId
    ) as any;
    await exam.save();

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(
      users.map((u: any) => ({
        id: u._id?.toString(),
        fullName: u.fullName,
        email: u.email,
        role: u.accountType || "student",
        joinedAt: u.createdAt,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:uid", async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.uid);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      accountType: user.accountType,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/users/:uid/role", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "role is required" });

    const user = await User.findByIdAndUpdate(
      req.params.uid,
      { accountType: role },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ id: user._id, role: user.accountType });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/students/list", async (req: Request, res: Response) => {
  try {
    const students = await User.find({ accountType: "student" }).sort({ fullName: 1 });
    res.json(
      students.map((s: any) => ({
        id: s._id?.toString(),
        fullName: s.fullName,
        email: s.email,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/evaluations", async (req: Request, res: Response) => {
  try {
    const rollNumber = req.query.roll_number as string | undefined;
    const query = rollNumber ? { roll_number: rollNumber } : {};
    const evaluations = await Evaluation.find(query).sort({ timestamp: -1 });
    res.json(evaluations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/evaluations/:id", async (req: Request, res: Response) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ error: "Evaluation not found" });
    res.json(evaluation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/results", async (req: Request, res: Response) => {
  try {
    const evaluations = await Evaluation.find().sort({ timestamp: -1 });
    res.json(
      evaluations.map((r: any) => ({
        id: r._id?.toString(),
        exam: r.exam_id,
        date: r.timestamp ? new Date(r.timestamp).toLocaleDateString() : "",
        marks: `${r.score}/${r.total}`,
        pct: r.percentage || "0%",
        grade: r.grade || "N/A",
        student: r.roll_number,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/record-ledger", async (req: Request, res: Response) => {
  try {
    const { uid, evaluation_result } = req.body;
    if (!uid || !evaluation_result) {
      return res.status(400).json({ error: "uid and evaluation_result are required" });
    }

    const saved = await new Evaluation({
      roll_number: uid,
      exam_id: evaluation_result.exam_id,
      score: evaluation_result.score,
      total: evaluation_result.total,
      percentage: evaluation_result.percentage,
      grade: evaluation_result.grade,
      details: evaluation_result.details || [],
      type: "LEDGER_RECORD",
      recorded_at: new Date(),
      timestamp: new Date(),
    }).save();

    res.json({ success: true, id: saved._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/evaluate", async (req: Request, res: Response) => {
  try {
    const { exam_id, roll_number } = req.body;
    const exam =
      (exam_id && (await Exam.findById(exam_id))) || (await Exam.findOne().sort({ createdAt: -1 }));

    if (!exam) {
      return res.status(400).json({ error: "No exam found to evaluate" });
    }

    const total = (exam.questions || []).reduce((acc: number, q: any) => acc + (q.maxMarks || 10), 0);
    const score = total > 0 ? total : 0;

    const saved = await new Evaluation({
      roll_number: roll_number || "DEMO001",
      exam_id: exam._id?.toString(),
      score,
      total,
      percentage: total > 0 ? "100%" : "0%",
      grade: total > 0 ? "A+" : "N/A",
      details: (exam.questions || []).map((q: any) => ({
        question_num: q.q,
        student_answer: q.modelAnswer || "",
        instructor_answer: q.modelAnswer || "",
        evaluation_feedback: "Auto-generated demo evaluation",
        semantic_match_percentage: 100,
        score: `${q.maxMarks || 10}/${q.maxMarks || 10}`,
      })),
      type: "DEMO_EVAL",
      timestamp: new Date(),
      recorded_at: new Date(),
    }).save();

    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/extract",
  upload.array("files"),
  async (req: Request, res: Response) => {
    try {
      const { exam_id } = req.body;
      const files = req.files as Express.Multer.File[];
      if (!exam_id || !files)
        return res.status(400).json({ error: "exam_id and files are required" });
      const exam = await Exam.findById(exam_id);
      if (!exam) return res.status(404).json({ error: "Exam not found" });

      let combinedText = "";
      for (const file of files) {
        if (file.originalname.toLowerCase().endsWith(".pdf")) {
          const data = await pdf(file.buffer);
          combinedText += data.text + "\n";
        } else if (file.originalname.toLowerCase().endsWith(".docx")) {
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          combinedText += result.value + "\n";
        } else {
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
            const startIndex = match.index! + match[0].length;
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
              if (nmMatch && startIndex + nmMatch.index! < endIndex) {
                endIndex = startIndex + nmMatch.index!;
              }
            }
            let content = combinedText.substring(startIndex, endIndex).trim();
            [/Answer\s*:/i, /Ans\s*:/i].forEach((ap) => {
              const m = content.match(ap);
              if (m) content = content.substring(m.index! + m[0].length).trim();
            });
            if (content) {
              foundAns = content;
              break;
            }
          }
        }
        return {
          question_id: (mq as any)._id,
          question_num: qn,
          student_question: mq.question,
          student_answer: foundAns,
        };
      });
      res.json({ extracted_data: extractedData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

app.post("/api/evaluate-confirm", async (req: Request, res: Response) => {
  try {
    const { exam_id, roll_number, extracted_data } = req.body;
    const exam = await Exam.findById(exam_id);
    if (!exam) return res.status(404).json({ error: "Exam not found" });
    let totalScore = 0;
    let maxTotal = 0;
    const details = [];
    const normalize = (t: string) =>
      t
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .join(" ");
    for (const item of extracted_data) {
      const mq = exam.questions.find(
        (q) => (q as any)._id.toString() === item.question_id
      );
      if (mq) {
        const normS = normalize(item.student_answer || "");
        const normM = normalize(mq.modelAnswer || "");
        let matchPct = 0;
        if (normS === normM && normM) matchPct = 100;
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
          student_question: item.student_question || mq.question || "",
          student_answer: item.student_answer || "",
          instructor_answer: mq.modelAnswer || "",
          evaluation_feedback:
            matchPct >= 85
              ? "Strong semantic alignment with expected answer."
              : matchPct >= 60
              ? "Partially correct answer; key points are present but incomplete."
              : "Low alignment with model answer; review concepts and terminology.",
          semantic_match_percentage: matchPct,
          score: qScore + "/" + qMax,
        });
      }
    }
    const percentage =
      maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log("Server running on port " + port));
