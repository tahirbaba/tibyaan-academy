"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardCheck, Plus, Inbox, X, Clock, CheckCircle2, Paperclip, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Student = { id: string; name: string };
type Assignment = {
  assignment: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    frequency: string;
    dueDate: string | null;
    status: string;
    completedAt: string | null;
    attachmentPath: string | null;
    teacherGrade: string | null;
    teacherFeedback: string | null;
    createdAt: string;
  };
  student: { fullName: string };
};

const statusConfig = {
  pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  submitted: { label: "Submitted", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  graded: { label: "Graded", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
};

const typeConfig = {
  test: { label: "Test", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  assignment: { label: "Assignment", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
};

export default function TeacherTestsAssignmentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    type: "assignment",
    title: "",
    description: "",
    frequency: "once",
    dueDate: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStudent, setFilterStudent] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [studentsRes, assignmentsRes] = await Promise.all([
        fetch("/api/teacher/students"),
        fetch("/api/teacher/assignments"),
      ]);
      if (studentsRes.ok) {
        const d = await studentsRes.json();
        setStudents(d.students ?? []);
      }
      if (assignmentsRes.ok) {
        const d = await assignmentsRes.json();
        setAssignments(d.assignments ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.studentId || !form.title) return;
    setSubmitting(true);
    setError(null);
    try {
      // The file goes up first. If it fails the assignment is not created at
      // all, rather than silently arriving without the attachment the teacher
      // believed they had sent.
      let attachmentPath: string | undefined;
      if (file) {
        const signRes = await fetch("/api/teacher/assignments/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentType: file.type }),
        });
        const signed = await signRes.json();
        if (!signRes.ok) throw new Error(signed.error ?? "That file type is not accepted");
        if (file.size > signed.maxBytes) {
          throw new Error(`That file is too large (max ${Math.round(signed.maxBytes / 1024 / 1024)}MB)`);
        }

        const put = await fetch(signed.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!put.ok) throw new Error("The file could not be uploaded");
        attachmentPath = signed.path;
      }

      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || undefined,
          attachmentPath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "The assignment could not be saved");

      setShowForm(false);
      setForm({ studentId: "", type: "assignment", title: "", description: "", frequency: "once", dueDate: "" });
      setFile(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The assignment could not be saved");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filterStudent === "all"
    ? assignments
    : assignments.filter((a) => {
        const s = students.find((st) => st.name === a.student.fullName);
        return s?.id === filterStudent;
      });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Tests &amp; Assignments</h1>
            <p className="text-sm text-muted-foreground">Assign tests and work to your students</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 me-2" />
          Assign
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">New Assignment</h3>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Student *</label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">Select student...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="assignment">Assignment</option>
                <option value="test">Test</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Memorise Surah Al-Ikhlas"
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2} placeholder="Additional instructions..."
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="once">One Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Attachment (optional)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.mp3,.m4a,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-muted file:text-foreground"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              PDF, image, audio or Word document, up to 20MB.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setShowForm(false); setError(null); }}>Cancel</Button>
            <Button onClick={submit} disabled={submitting || !form.studentId || !form.title}
              className="bg-amber-600 hover:bg-amber-700 text-white">
              {submitting ? "Saving..." : "Assign"}
            </Button>
          </div>
        </div>
      )}

      {/* Filter */}
      {students.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFilterStudent("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStudent === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
            All Students
          </button>
          {students.map((s) => (
            <button key={s.id} onClick={() => setFilterStudent(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStudent === s.id ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No assignments yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const status = statusConfig[item.assignment.status as keyof typeof statusConfig] ?? statusConfig.pending;
            const type = typeConfig[item.assignment.type as keyof typeof typeConfig] ?? typeConfig.assignment;
            const isComplete = item.assignment.status !== "pending";
            const isOverdue =
              !isComplete &&
              !!item.assignment.dueDate &&
              new Date(item.assignment.dueDate) < new Date();
            return (
              <div key={item.assignment.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${type.bg} ${type.color}`}>{type.label}</span>
                      <span className="font-semibold text-foreground text-sm">{item.assignment.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Student: {item.student.fullName}</p>
                    {item.assignment.description && <p className="text-sm text-muted-foreground">{item.assignment.description}</p>}
                    {item.assignment.dueDate && (
                      <p className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                        {isOverdue && <AlertTriangle className="w-3 h-3" />}
                        Due: {new Date(item.assignment.dueDate).toLocaleDateString()}
                        {isOverdue && " — Overdue"}
                      </p>
                    )}
                    {item.assignment.attachmentPath && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Paperclip className="w-3 h-3" />
                        Attachment sent
                      </p>
                    )}
                    {item.assignment.teacherGrade && <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Grade: {item.assignment.teacherGrade}</p>}
                  </div>
                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {isComplete ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {isComplete ? "Completed" : "Not completed"}
                    </span>
                    {isComplete && (
                      <span className="text-[11px] text-muted-foreground">
                        {item.assignment.completedAt
                          ? new Date(item.assignment.completedAt).toLocaleString()
                          : "time not recorded"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
