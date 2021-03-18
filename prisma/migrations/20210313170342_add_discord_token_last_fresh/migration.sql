/*
  Warnings:

  - Added the required column `lastRefreshTime` to the `DiscordLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscordLink" ADD COLUMN     "lastRefreshTime" TIMESTAMP(3) NOT NULL;
