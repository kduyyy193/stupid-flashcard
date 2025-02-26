import type { NextApiRequest, NextApiResponse } from "next";
import emailjs from "@emailjs/browser";

const sendEmail = async (formData: {
  name: string;
  email: string;
  message: string;
}) => {
  try {
    const response = await emailjs.send(
      "",
      "",
      formData,
      ""
    );
    return response;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to send email");
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const response = await sendEmail(req.body);
      return res
        .status(200)
        .json({ message: "Email sent successfully", data: response });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
