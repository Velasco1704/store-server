import { Request, Response } from "express";
import { prisma } from "../lib";
import { compare, hash } from "bcrypt";
import { useTokenSign } from "../hooks/useTokenSign";

export const login = async (req: Request, res: Response) => {
  try {
    const foundUser = await prisma.user.findFirst({
      where: { username: req.body.username },
    });

    if (!foundUser) return res.status(404).json({ message: "User not found" });

    return await compare(`${req.body.password}`, foundUser.password)
      .then((result) =>
        result
          ? res.status(200).json({ token: useTokenSign(foundUser) })
          : res.status(403).json({ message: "Invalid Credentials" })
      )
      .catch(() => res.status(403).json({ message: "Invalid Credentials" }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(400).json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const foundUser = await prisma.user.findFirst({
      where: { username: req.body.username },
    });
    if (foundUser)
      return res.status(403).json({ message: "User already exits" });

    const passwordHashed = await hash(req.body.password, 5);

    return await prisma.user
      .create({
        data: { username: req.body.username, password: passwordHashed },
      })
      .then(async (result) =>
        res.status(200).json({ token: useTokenSign(result) })
      )
      .catch(() => res.status(403).json({ message: "Invalid Credentials" }));
  } catch (error) {
    if (error instanceof Error)
      return res.status(400).json({ error: error.message });
  }
};
