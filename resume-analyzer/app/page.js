"use client";

import React from "react";

export default function Home() {
  const [resume, setResume] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [analysis, setAnalysis] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleAnalyze() {
    setError("");
    setAnalysis(null);

    // Validate input
    if (!resume.trim() || !jobDescription.trim()) {
      setError("Please provide both resume and job description.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setAnalysis(data);
    } catch (error) {
      setError(
        error.message || "An error occurred while analyzing the resume."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold">
            AI Resume Analyzer
          </h1>

          <p className="mt-3 text-slate-400">
            Compare your resume with a job description using AI
          </p>
        </div>

        {/* Input Section */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Resume */}
          <div className="rounded-2xl bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold">
              Your Resume
            </h2>

            <textarea
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume here..."
              className="h-72 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* Job Description */}
          <div className="rounded-2xl bg-slate-900 p-6">
            <h2 className="mb-3 text-xl font-semibold">
              Job Description
            </h2>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              className="h-72 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Analyze Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-8 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-10 rounded-2xl bg-slate-900 p-6">

            {/* Score */}
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-400">
                {analysis.matchScore}%
              </div>

              <p className="mt-2 text-slate-400">
                Resume Match Score
              </p>
            </div>

            {/* Result Cards */}
            <div className="mt-10 grid gap-6 md:grid-cols-3">

              {/* Strengths */}
              <ResultCard
                title="Strengths"
                items={analysis.strengths}
              />

              {/* Missing Skills */}
              <ResultCard
                title="Missing Skills"
                items={analysis.missingSkills}
              />

              {/* Suggestions */}
              <ResultCard
                title="Suggestions"
                items={analysis.suggestions}
              />

            </div>

            {/* Summary */}
            <div className="mt-8 rounded-xl bg-slate-950 p-6">
              <h3 className="mb-3 text-lg font-semibold">
                AI Summary
              </h3>

              <p className="leading-7 text-slate-300">
                {analysis.summary}
              </p>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}


// Reusable result card
function ResultCard({ title, items = [] }) {
  return (
    <div className="rounded-xl bg-slate-950 p-5">

      <h3 className="mb-4 text-lg font-semibold">
        {title}
      </h3>

      <ul className="space-y-3">

        {items.map((item, index) => (
          <li
            key={index}
            className="text-sm leading-6 text-slate-300"
          >
            • {item}
          </li>
        ))}

      </ul>

    </div>
  );
}