-- CreateEnum
CREATE TYPE "TimeUnit" AS ENUM ('minutes', 'hours', 'days');

-- CreateTable
CREATE TABLE "RecipeArchive" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "timeNeededAmount" INTEGER NOT NULL,
    "timeNeededUnit" "TimeUnit" NOT NULL,
    "steps" TEXT[],
    "macros" TEXT[],
    "ingredientNames" TEXT[],
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipeArchive_userId_idx" ON "RecipeArchive"("userId");

-- AddForeignKey
ALTER TABLE "RecipeArchive" ADD CONSTRAINT "RecipeArchive_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
