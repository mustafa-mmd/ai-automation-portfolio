import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return Response.json(
        {
          error: "Resume and job description are required.",
        },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are an expert technical recruiter and resume analyzer.

Analyze the candidate's resume against the provided job description.

Evaluate:

1. Match score from 0 to 100
2. Candidate strengths
3. Missing or weak skills
4. Specific improvement suggestions
5. A concise summary

Do not invent experience that is not present in the resume.

Return ONLY valid JSON in this exact structure:

{
  "matchScore": 0,
  "summary": "",
  "strengths": [],
  "missingSkills": [],
  "suggestions": []
}

Resume:
${resume}

Job Description:
${jobDescription}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    return Response.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);

    return Response.json(
      {
        error: "Failed to analyze resume.",
      },
      { status: 500 }
    );
  }
}