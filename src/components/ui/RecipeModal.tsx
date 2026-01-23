'use client'

import { getRecipeAction } from "@/actions/recipes"
import { deleteIngredientsAction } from "@/actions/ingredients"
import { Ingredient } from "@prisma/client"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "./button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog"
import { useEffect } from "react"
import { Utensils, ChefHat, Clock, Loader, LoaderCircle } from "lucide-react"
import { Recipe } from "@/types/recipe"

export default function RecipeModal({ ingredients, disabled }: { ingredients: Ingredient[], disabled?: boolean }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const ingredientKey = ingredients.map(i=>i.id).sort().join(',') // stable key from ingredient IDs

    const fetchRecipe = async () => {
        setIsLoading(true)
        const { recipe, errorMessage } = await getRecipeAction(ingredients)
        if (errorMessage) {
            toast.error(errorMessage)
            setIsOpen(false)
        } else
            setRecipe(recipe)
        setIsLoading(false)
    }

    const handleCooked = async () => {
        setIsLoading(true)
        const { errorMessage } = await deleteIngredientsAction(ingredients.map(i=>i.id))
        if (errorMessage) {
            toast.error(errorMessage)
            setIsOpen(false)
        } else {
            toast.message('Ingredients used successfully!')
            setIsOpen(false)
        }
        setIsLoading(false)
    }

    // Reset recipe when ingredients change
    useEffect(() => {
        if (ingredientKey)
            setRecipe(null)
    }, [ingredientKey])

    // Ask openAI when modal opens and no recipe has been generated yet for the selected ingredients
    useEffect(() => {
        if (isOpen && !recipe)
            fetchRecipe()
    }, [isOpen, recipe])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={disabled}><ChefHat/></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isLoading ? 'Recipe' : recipe?.title}</DialogTitle>
                </DialogHeader>
                { isLoading
                    ? <div className="flex flex-col items-center mb-1 gap-3">
                        <p className="animate-pulse text-gray-400">Generating recipe. Please wait.</p>
                        <LoaderCircle className="text-gray-300 animate-spin size-10"/>
                    </div>
                    : recipe
                        ? (<div className="flex flex-col gap-1 ">
                            {/* <h3 className="font-semibold">{recipe.title}</h3> */}
                            <div className="flex gap-1 text-sm mb-1">
                                <Clock className="size-5 text-gray-800"/>
                                <p className="text-gray-500">{recipe.timeNeeded.amount}</p>
                                <p className="text-gray-500">{recipe.timeNeeded.unit}</p>
                            </div>
                            <ol className="mb-2 pl-8 pr-4 list-decimal text-gray-600 no-scrollbar -mx-4 max-h-[40vh] overflow-y-auto">
                                {recipe.steps.map((step,index) => <li className="mb-1" key={index}>{step}</li>)}
                            </ol>
                            <div className="flex gap-1 text-sm mb-1">
                                <Utensils className="size-4 text-gray-800"/>
                                <p className="text-gray-500">{recipe.macros.join(', ')}</p>
                            </div>
                        </div>)
                        : null
                }
                <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button disabled={isLoading} onClick={handleCooked}>
                        {isLoading ? 'Saving...' : 'I made it!'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}