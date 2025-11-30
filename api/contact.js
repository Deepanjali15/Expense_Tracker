export default function handler(req, res) {
  if (req.method === "POST") {

    const body = req.body;

    console.log("Contact message received:", body);

    return res.status(200).json({
      status: "success",
      message: "Message received successfully",
      name: body.name,
      email: body.email
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
