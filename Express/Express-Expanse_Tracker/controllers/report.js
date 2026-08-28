import logger from "../utils/logger.js";
import { Expanse, Report, User } from "../models/index.js";
import { uploadReportToS3, getReportDownloadUrl } from "../services/s3Service.js";

function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(expanses) {
  const rows = [["Date", "Category", "Description", "Note", "Amount"]];
  expanses.forEach((e) => {
    rows.push([new Date(e.createdAt).toISOString().slice(0, 10), e.category, e.description, e.note ?? "", e.amount]);
  });
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

const reportController = {
  // GET /report/generate - premium only. Deliverable explicitly calls for
  // 401 (not the 403 the shared isPremiumUser middleware uses elsewhere),
  // so this checks isPremium itself instead of reusing that middleware.
  generateReport: async (req, res) => {
    try {
      const user = await User.findByPk(req.userId, { attributes: ["id", "isPremium"] });
      if (!user || !user.isPremium) {
        return res.status(401).json({ error: "This feature is available to Premium members only." });
      }
      const expanses = await Expanse.findAll({
        where: { userId: req.userId },
        attributes: ["category", "description", "amount", "note", "createdAt"],
        order: [["createdAt", "ASC"]],
      });
      const csv = toCsv(expanses);
      const fileName = `expenses-${new Date().toISOString().slice(0, 10)}-${Date.now()}.csv`;
      const s3Key = `reports/${req.userId}/${fileName}`;
      await uploadReportToS3(s3Key, csv);
      const report = await Report.create({ userId: req.userId, s3Key, fileName });
      const fileUrl = await getReportDownloadUrl(s3Key);
      res.status(201).json({ fileName, fileUrl, generatedAt: report.createdAt });
    } catch (error) {
      logger.error("Generate report error:", { error: error.message, stack: error.stack });
      res.status(500).json({ error: "Failed to generate report." });
    }
  },
  // GET /report/history - past reports this user has generated, newest
  // first, each with a freshly-signed download URL.
  getHistory: async (req, res) => {
    try {
      const user = await User.findByPk(req.userId, { attributes: ["id", "isPremium"] });
      if (!user || !user.isPremium) {
        return res.status(401).json({ error: "This feature is available to Premium members only." });
      }
      const reports = await Report.findAll({
        where: { userId: req.userId },
        attributes: ["fileName", "s3Key", "createdAt"],
        order: [["createdAt", "DESC"]],
      });
      const history = await Promise.all(
        reports.map(async (r) => ({
          fileName: r.fileName,
          generatedAt: r.createdAt,
          fileUrl: await getReportDownloadUrl(r.s3Key),
        })),
      );
      res.status(200).json(history);
    } catch (error) {
      logger.error("Report history error:", { error: error.message, stack: error.stack });
      res.status(500).json({ error: "Failed to fetch report history." });
    }
  },
};

export default reportController;
