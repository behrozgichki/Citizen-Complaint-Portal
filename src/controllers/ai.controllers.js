import OpenAI from "openai";
import Complaint from "../models/complaints.model.js";

const generateOfficerSummary = async (req, res) => {
  try {
    const complaints = await Complaint.find().lean();

    const total = complaints.length;

    const pending = complaints.filter(
      (complaint) => complaint.status === "Pending"
    ).length;

    const inProgress = complaints.filter(
      (complaint) => complaint.status === "In Progress"
    ).length;

    const resolved = complaints.filter(
      (complaint) => complaint.status === "Resolved"
    ).length;

    const totalUpvotes = complaints.reduce(
      (sum, complaint) => sum + (complaint.upvotes || 0),
      0
    );

    // -----------------------------
    // CATEGORY COUNTS
    // -----------------------------
    const categoryCounts = {};

    complaints.forEach((complaint) => {
      const category = complaint.category || "Other";

      categoryCounts[category] =
        (categoryCounts[category] || 0) + 1;
    });

    // -----------------------------
    // AREA COUNTS
    // -----------------------------
    const areaCounts = {};

    complaints.forEach((complaint) => {
      const area = complaint.area || "Unknown";

      areaCounts[area] =
        (areaCounts[area] || 0) + 1;
    });

    const topCategoryEntry = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const topAreaEntry = Object.entries(areaCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // -----------------------------
    // HIGH PRIORITY COUNT
    // -----------------------------
    const highPriorityComplaints = complaints.filter((complaint) => {
      const upvotes = complaint.upvotes || 0;

      const createdAt = new Date(complaint.createdAt);
      const now = new Date();

      const daysSinceCreated = Math.floor(
        (now - createdAt) / (1000 * 60 * 60 * 24)
      );

      const score = upvotes * 2 + daysSinceCreated;

      return score >= 16;
    }).length;

    // -----------------------------
    // STATS OBJECT
    // -----------------------------
    const stats = {
      total,
      pending,
      inProgress,
      resolved,
      totalUpvotes,
      highPriorityComplaints,

      topCategory: topCategoryEntry
        ? {
            name: topCategoryEntry[0],
            count: topCategoryEntry[1],
          }
        : null,

      topArea: topAreaEntry
        ? {
            name: topAreaEntry[0],
            count: topAreaEntry[1],
          }
        : null,
    };

    // -----------------------------
    // FALLBACK SUMMARY
    // -----------------------------
    const topCategoryText = topCategoryEntry
      ? `${topCategoryEntry[0]} is currently the most reported category with ${topCategoryEntry[1]} complaint(s).`
      : "There is no dominant complaint category yet.";

    const topAreaText = topAreaEntry
      ? `${topAreaEntry[0]} currently has the highest number of complaints with ${topAreaEntry[1]} report(s).`
      : "There is no clear complaint hotspot yet.";

    const priorityText =
      highPriorityComplaints > 0
        ? `${highPriorityComplaints} complaint(s) currently require high-priority attention.`
        : "There are currently no high-priority complaints.";

    const fallbackSummary = `
There are currently ${total} complaints in the system, with ${pending} pending, ${inProgress} in progress, and ${resolved} resolved.
${topCategoryText}
${topAreaText}
${priorityText}
Officers should prioritize unresolved complaints with the highest community impact and upvote activity.
    `.trim();

    // -----------------------------
    // DEFAULT TO FALLBACK
    // -----------------------------
    let summary = fallbackSummary;
    let aiGenerated = false;

    // -----------------------------
    // TRY OPENAI
    // -----------------------------
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openai.responses.create({
          model: "gpt-5.6-luna",

          instructions: `
You are a concise municipal government operations assistant.

You receive complaint statistics from a Citizen Complaint Portal.

Write a professional 3 to 5 sentence briefing for an officer.

Rules:
- Use only the supplied statistics.
- Do not invent facts.
- Mention unresolved workload.
- Mention the biggest category or area concern.
- Mention high-priority complaints if relevant.
- Give one practical recommended action.
- Keep the response concise.
          `,

          input: `
Complaint statistics:

${JSON.stringify(stats, null, 2)}
          `,
        });

        if (response.output_text) {
          summary = response.output_text.trim();
          aiGenerated = true;
        }
      } catch (aiError) {
        console.log(
          "OpenAI unavailable. Using fallback summary:",
          aiError.message
        );

        // Do not fail the endpoint.
        // We simply continue using fallbackSummary.
        aiGenerated = false;
        summary = fallbackSummary;
      }
    }

    // -----------------------------
    // SUCCESS RESPONSE
    // -----------------------------
    return res.status(200).json({
      message: aiGenerated
        ? "AI officer briefing generated successfully"
        : "Officer briefing generated using fallback summary",

      aiGenerated,

      data: {
        summary,
        stats,
      },
    });
  } catch (error) {
    console.log("OFFICER SUMMARY ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate officer briefing",
      error: error.message,
    });
  }
};

export { generateOfficerSummary };