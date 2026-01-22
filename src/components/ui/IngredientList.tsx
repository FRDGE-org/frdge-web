'use client'

import { useState } from 'react'
import { Button } from './button'
import { deleteIngredientsAction } from '@/actions/ingredients'
import { toast } from 'sonner'
import type { Ingredient, TimeToExpire } from '@prisma/client'
import AddIngredientButton from './AddIngredientButton'
import { addDays, differenceInDays } from 'date-fns'
import { ChefHat, Edit, Refrigerator, Snowflake, Trash2, Wheat } from 'lucide-react'
import EditIngredientButton from './EditIngredientButton'

type Props = {
  ingredients: Ingredient[]
}

const storageIcon = {
  PANTRY: <Wheat        color='#ca8a04' className='size-5 mr-2'/>,
  FRIDGE: <Refrigerator color='#84cc16' className='size-5 mr-2'/>,
  FREEZER: <Snowflake   color='#bae6fd' className='size-5 mr-2'/>,
}

// Duration in days for each TimeToExpire category
const timeToExpireDays: Record<TimeToExpire, number> = {
  VERYSHORT: 7,        // Less than a week
  SHORT: 14,           // 1-2 weeks
  MEDIUM: 30,          // 2 weeks - 1 month
  LONG: 180,           // Several months - 1 year (using 6 months)
  VERYLONG: 365 * 2,   // Years (using 2 years)
}

const shelfLifeString: Record<TimeToExpire, string> = {
  VERYSHORT: '< 1 week',
  SHORT: '1-2 weeks',
  MEDIUM: '2 weeks - 1 month',
  LONG: '1 month - 1 year',
  VERYLONG: 'Years'
}

function calculateExpirationDate(dateBought: Date, timeToExpire: TimeToExpire): Date {
  return addDays(dateBought, timeToExpireDays[timeToExpire])
}

function getExpirationColor(expirationDate: Date): string {
  const daysLeft = differenceInDays(expirationDate, new Date())

  if (daysLeft <= 0) return 'text-gray-500'           // Expired
  if (daysLeft < 7) return 'text-red-500'           // Less than a week
  if (daysLeft < 14) return 'text-orange-500'       // 1-2 weeks
  if (daysLeft < 30) return 'text-amber-500'       // 2 weeks - 1 month
  if (daysLeft < 365) return 'text-green-500'       // Several months - 1 year
  return 'text-cyan-400'                            // Years
}

export default function IngredientList({ ingredients }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDeleteSelected = async () => {
    setIsDeleting(true)
    const { errorMessage } = await deleteIngredientsAction([...selectedIds])
    if (errorMessage) {
      toast.error(errorMessage)
    } else {
      toast.success(`Deleted ${selectedIds.size} ingredient${selectedIds.size !== 1 ? 's' : ''}`)
      setSelectedIds(new Set())
    }
    setIsDeleting(false)
  }

  const selectedCount = selectedIds.size

  const selectedIngredient = ingredients.find(i => selectedIds.has(i.id))

  return (
    <>
      <div className="w-full max-w-md space-y-2 h-full">
        {ingredients.length === 0 ? (
          <p className="text-gray-500 w-full text-center">No ingredients yet. Add one below!</p>
        ) : (
          ingredients.map((ingredient) => {
            const isSelected = selectedIds.has(ingredient.id)
            const expirationDate = calculateExpirationDate(new Date(ingredient.dateBought), ingredient.timeToExpire)
            const expirationColor = getExpirationColor(expirationDate)
            return (
              <div
                key={ingredient.id}
                onClick={() => toggleSelect(ingredient.id)}
                className={`p-2 border rounded flex justify-between cursor-pointer transition-colors ${isSelected
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                  }`}
              >
                <div className='flex flex-row'>
                  {storageIcon[ingredient.storage]}
                  {ingredient.name}
                </div>
                {/* <div className="flex justify-between w-full"> */}
                  {/* <p>💵 {new Date(ingredient.dateBought).toLocaleDateString()}</p> */}
                  {/* <p>Packaged: {ingredient.isPackaged ? 'Yes' : 'No'}</p> */}
                  {/* <p>{shelfLifeString[ingredient.timeToExpire]}</p> */}
                <p className={expirationColor}>{expirationDate.toLocaleDateString()}</p>
                {/* </div> */}
              </div>
            )
          })
        )}
        <div className={`text-sm text-muted-foreground flex justify-center opacity-${selectedCount > 0 ? 100 : 0}`}>
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </div>
      </div>
      <div className='flex flex-end flex-row w-full justify-end'>
        <div className='grid grid-cols-2 gap-2'>
          <div/>
          <Button disabled={selectedCount === 0 || isDeleting} onClick={handleDeleteSelected}>
            {isDeleting ? '...' : <Trash2/>}
          </Button>
          <Button disabled={selectedCount === 0}><ChefHat/></Button>
          <AddIngredientButton />
          <div/>
          <EditIngredientButton ingredient={selectedIngredient} disabled={selectedCount !== 1}/>
        </div>
      </div>
    </>
  )
}
