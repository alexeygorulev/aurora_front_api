-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateTable
CREATE TABLE "user" (
    "user_id" UUID NOT NULL,
    "login" VARCHAR(30) NOT NULL,
    "password" VARCHAR(20) NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "pk_user" PRIMARY KEY ("user_id")
);
