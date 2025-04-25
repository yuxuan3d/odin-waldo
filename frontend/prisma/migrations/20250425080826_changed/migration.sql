/*
  Warnings:

  - You are about to drop the column `xLocationMax` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the column `xLocationMin` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the column `yLocationMax` on the `Pokemon` table. All the data in the column will be lost.
  - You are about to drop the column `yLocationMin` on the `Pokemon` table. All the data in the column will be lost.
  - Added the required column `tolerance` to the `Pokemon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xPercent` to the `Pokemon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yPercent` to the `Pokemon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pokemon" DROP COLUMN "xLocationMax",
DROP COLUMN "xLocationMin",
DROP COLUMN "yLocationMax",
DROP COLUMN "yLocationMin",
ADD COLUMN     "tolerance" INTEGER NOT NULL,
ADD COLUMN     "xPercent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "yPercent" DOUBLE PRECISION NOT NULL;
