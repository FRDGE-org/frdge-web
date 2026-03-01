import { vi, describe, it, expect, beforeEach } from "vitest";
import { saveRecipeArchiveAction } from "@/actions/recipeArchive";
import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { Recipe } from "@/types/recipe";
import { Ingredient, Storage, TimeToExpire } from "@prisma/client";
import { ERRORS } from "@/lib/errors";

vi.mock("@/auth/server");
vi.mock("@/db/prisma", () => ({
  prisma: {
    recipeArchive: {
      create: vi.fn(),
    },
  },
}));

const mockRecipe: Recipe = {
  title: "Pancakes",
  timeNeeded: { amount: 20, unit: "minutes" as const },
  steps: ["Mix ingredients", "Cook", "Serve"],
  macros: ["300 kcal", "10g of protein"],
};

const mockIngredients: Ingredient[] = [
  {
    id: "ing-1",
    authorId: "user-123",
    name: "Eggs",
    storage: Storage.FRIDGE,
    dateBought: new Date(),
    isPackaged: false,
    timeToExpire: TimeToExpire.SHORT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "ing-2",
    authorId: "user-123",
    name: "Flour",
    storage: Storage.PANTRY,
    dateBought: new Date(),
    isPackaged: true,
    timeToExpire: TimeToExpire.LONG,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("saveRecipeArchiveAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves the recipe archive and returns null errorMessage", async () => {
    vi.mocked(getUser).mockResolvedValue({ id: "user-123" } as any);

    const result = await saveRecipeArchiveAction(mockRecipe, mockIngredients);

    expect(prisma.recipeArchive.create).toHaveBeenCalledWith({
      data: {
        userId: "user-123",
        title: mockRecipe.title,
        timeNeededAmount: mockRecipe.timeNeeded.amount,
        timeNeededUnit: mockRecipe.timeNeeded.unit,
        macros: mockRecipe.macros,
        steps: mockRecipe.steps,
        ingredientNames: ["Eggs", "Flour"],
      },
    });

    expect(result).toEqual({ errorMessage: null });
  });

  it("returns an error if the user is not logged in", async () => {
    vi.mocked(getUser).mockResolvedValue(null);

    const result = await saveRecipeArchiveAction(mockRecipe, mockIngredients);

    expect(result).toEqual({ errorMessage: ERRORS.UNAUTHENTICATED });
    expect(prisma.recipeArchive.create).not.toHaveBeenCalled();
  });

  it("returns an error if the database call fails", async () => {
    vi.mocked(getUser).mockResolvedValue({ id: "user-123" } as any);
    vi.mocked(prisma.recipeArchive.create).mockRejectedValue(
      new Error("DB connection failed"),
    );

    const result = await saveRecipeArchiveAction(mockRecipe, mockIngredients);

    expect(result).toEqual({ errorMessage: "DB connection failed" });
  });
});
