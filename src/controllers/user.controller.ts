import {Request, Response } from 'express';
import db from '../models';

const { User } = db as any;

export const getUser =  async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authorization Error!" });
    }

  const user = await User.findByPk(req.user.userId, {
  attributes: { exclude: ['password']}
});

if (!user){
return res.status(401).json({
  success: false,
  message: "User Not Found"
});
}

return res.status(200).json({
success: true,
message: "User fetched Successfully",
data: user
});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });

  }
}
