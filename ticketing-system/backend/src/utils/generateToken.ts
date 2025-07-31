import jwt from 'jsonwebtoken';

export const generateResetToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: '15m' });
};

export const verifyResetToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};
