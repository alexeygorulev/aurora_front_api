/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[login]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "pk_user",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE VARCHAR(150),
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'User',
ADD CONSTRAINT "pk_user" PRIMARY KEY ("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_login_key" ON "user"("login");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
