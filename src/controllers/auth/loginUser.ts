import { Request, Response } from "express";

export async function loginUser(request: Request, response: Response) {
  try {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
  } catch (error) {
    console.log(error);

    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
