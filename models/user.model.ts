// models/user.model.ts
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const createUser = async (
  userData: Omit<User, "id" | "createdAt">
): Promise<User> => {
  return prisma.user.create({
    data: userData,
  });
};

export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: userData,
  });
};

export const deleteUser = async (id: string): Promise<User> => {
  return prisma.user.delete({
    where: { id },
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  return prisma.user.findMany();
};
