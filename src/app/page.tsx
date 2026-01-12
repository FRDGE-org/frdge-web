import { getUser } from '@/auth/server'
import AddIngredientForm from '@/components/ui/AddIngredientForm'
import DeleteIngredientButton from '@/components/ui/DeleteIngredientButton'
import { prisma } from '@/db/prisma'

async function HomePage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center p-4">
        <p>Please log in to see your ingredients.</p>
      </div>
    )
  }

  const ingredients = await prisma.ingredient.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex h-full flex-col items-center p-4 gap-4">
      <h1 className="text-2xl font-bold">My Ingredients</h1>

      <AddIngredientForm />

      <div className="w-full max-w-2xl space-y-2">
        {ingredients.length === 0 ? (
          <p className="text-gray-500">No ingredients yet. Add one above!</p>
        ) : (
          ingredients.map((ingredient) => (
            <p key={ingredient.id} className="p-2 border rounded">
              <strong>{ingredient.name}</strong> |
              Storage: {ingredient.storage} |
              Bought: {ingredient.dateBought.toLocaleDateString()} |
              Packaged: {ingredient.isPackaged ? 'Yes' : 'No'} |
              Expires: {ingredient.timeToExpire}
              <DeleteIngredientButton ingredientId={ingredient.id} />
            </p>
          ))
        )}
      </div>
    </div>
  )
}

export default HomePage