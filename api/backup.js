export default function handler(req, res) {
  if (req.method === "POST") {

    const body = req.body;

    console.log("Backup received:", body);

    return res.status(200).json({
      status: "success",
      message: "Backup received successfully",
      user: body.username,
      count: body.expenses.length
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
