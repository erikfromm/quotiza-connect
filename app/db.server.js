import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
  }
  prisma = global.__db;
}

export default prisma;
