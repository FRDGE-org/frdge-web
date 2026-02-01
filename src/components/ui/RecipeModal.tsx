"use client";

import { getRecipeAction } from "@/actions/recipes";
import { deleteIngredientsAction } from "@/actions/ingredients";
import { Ingredient } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { useEffect } from "react";
import { Utensils, ChefHat, Clock, LoaderCircle } from "lucide-react";
import { Recipe } from "@/types/recipe";

export default function RecipeModal({
  ingredients,
  disabled,
}: {
  ingredients: Ingredient[];
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const ingredientKey = ingredients
    .map((i) => i.id)
    .sort()
    .join(","); // stable key from ingredient IDs

  const fetchRecipe = async () => {
    setIsLoading(true);
    const { recipe, errorMessage } = await getRecipeAction(ingredients);
    if (errorMessage) {
      toast.error(errorMessage);
      setIsOpen(false);
    } else setRecipe(recipe);
    setIsLoading(false);
  };

  const handleCooked = async () => {
    setIsLoading(true);
    const { errorMessage } = await deleteIngredientsAction(
      ingredients.map((i) => i.id),
    );
    if (errorMessage) {
      toast.error(errorMessage);
      setIsOpen(false);
    } else {
      toast.message("Ingredients used successfully!");
      setIsOpen(false);
    }
    setIsLoading(false);
  };

  // Reset recipe when ingredients change
  useEffect(() => {
    if (ingredientKey) setRecipe(null);
  }, [ingredientKey]);

  // Ask openAI when modal opens and no recipe has been generated yet for the selected ingredients

  useEffect(() => {
    if (isOpen && !recipe) fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, recipe]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <ChefHat />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLoading ? "Recipe" : recipe?.title}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="mb-1 flex flex-col items-center gap-3">
            <p className="animate-pulse text-gray-400">
              Generating recipe. Please wait.
            </p>
            <LoaderCircle className="size-10 animate-spin text-gray-300" />
          </div>
        ) : recipe ? (
          <div className="flex flex-col gap-1">
            {/* <h3 className="font-semibold">{recipe.title}</h3> */}
            <div className="mb-1 flex gap-1 text-sm">
              <Clock className="size-5 text-gray-800" />
              <p className="text-gray-500">{recipe.timeNeeded.amount}</p>
              <p className="text-gray-500">{recipe.timeNeeded.unit}</p>
            </div>
            <ol className="no-scrollbar -mx-4 mb-2 max-h-[40vh] list-decimal overflow-y-auto pr-4 pl-8 text-gray-600">
              {recipe.steps.map((step, index) => (
                <li className="mb-1" key={index}>
                  {step}
                </li>
              ))}
            </ol>
            <div className="mb-1 flex gap-1 text-sm">
              <Utensils className="size-4 text-gray-800" />
              <p className="text-gray-500">{recipe.macros.join(", ")}</p>
            </div>
          </div>
        ) : null}
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={handleCooked}>
            {isLoading ? "Saving..." : "I made it!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
