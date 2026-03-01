"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { Ingredient } from "@prisma/client";
import { Recipe } from "@/types/recipe";
import { ERRORS } from "@/lib/errors";

export const saveRecipeArchiveAction = async (
  recipe: Recipe,
  ingredients: Ingredient[],
) => {
  try {
    const user = await getUser();
    if (!user) throw new Error(ERRORS.UNAUTHENTICATED);

    await prisma.recipeArchive.create({
      data: {
        userId: user.id,
        title: recipe.title,
        timeNeededAmount: recipe.timeNeeded.amount,
        timeNeededUnit: recipe.timeNeeded.unit,
        steps: recipe.steps,
        macros: recipe.macros,
        ingredientNames: ingredients.map((i) => i.name),
      },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};
