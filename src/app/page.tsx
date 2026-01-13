import { getUser } from '@/auth/server'
import IngredientList from '@/components/ui/IngredientList'
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
      <h1 className="text-xl font-semibold">Ingredients</h1>

      <IngredientList ingredients={ingredients} />
    </div>
  )
}

export default HomePage