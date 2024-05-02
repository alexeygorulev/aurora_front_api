/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "login" VARCHAR(30) NOT NULL,
    "password" VARCHAR(150) NOT NULL,
    "email" VARCHAR(30) NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'User',

    CONSTRAINT "pk_user" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
