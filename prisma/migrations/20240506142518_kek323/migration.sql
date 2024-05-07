/*
  Warnings:

  - A unique constraint covering the columns `[first_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_name]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" VARCHAR(30) NOT NULL DEFAULT 'unKnown',
ADD COLUMN     "last_name" VARCHAR(30) NOT NULL DEFAULT 'unKnown';

-- CreateIndex
CREATE UNIQUE INDEX "users_first_name_key" ON "users"("first_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_last_name_key" ON "users"("last_name");
