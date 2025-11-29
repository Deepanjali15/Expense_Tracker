export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log(req.body);  // shows in Vercel logs

    // Return success response
    return res.status(200).json({
      message: "Backup received",
      count: req.body.expenses.length
    });
  }

  res.status(405).json({ error: "Method not allowed" });
}
