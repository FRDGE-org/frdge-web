import { getUser } from "@/auth/server"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { prisma } from "@/db/prisma"
import { Note } from "@prisma/client"
import Link from "next/link"
import SidebarGroupContent from "@/components/ui/SidebarGroupContent"

async function AppSidebar() {
  const user = await getUser()
  
  let notes: Note[] = []

  if (user) {
    notes = await prisma.note.findMany({
        where: {
            authorId: user.id
        },
        orderBy: {
            updatedAt: 'desc'
        }
    })
  }
  
  return (
    <Sidebar>
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-2 mt-2 text-lg">
            {user
                ? 'Your notes'
                : (<p>
                    <Link className='underline' href='/login'>Login</Link>{" "}to see your notes.
                  </p>)
            }
          </SidebarGroupLabel>
        </SidebarGroup>
        {user && <SidebarGroupContent notes={notes}/>}
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar