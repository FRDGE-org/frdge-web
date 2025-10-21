import { getUser } from '@/auth/server'
import AskAIButton from '@/components/ui/AskAIButton'
import NewNoteButton from '@/components/ui/NewNoteButton'
import NoteTextInput from '@/components/ui/NoteTextInput'
import { prisma } from '@/db/prisma'
import React from 'react'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function HomePage({searchParams}: Props) {
  const noteIdParam = (await searchParams).noteId
  const user = await getUser()

  const noteId = Array.isArray(noteIdParam)
                  ? noteIdParam![0]
                  : noteIdParam || ''
  
  const note = null
  
  if (noteId != '') {
    const note = await prisma.note.findUnique({
      where: {id: noteId, authorId: user?.id}
    })
  }

  // h-20 bg-red-400 text-blue-300
  return (<div className="flex h-full flex-col items-center g-4">
    <div className='flex w-full max-w-4xl justify-end gap-2'>
      <AskAIButton user={user}/>
      <NewNoteButton user={user}/>

      <NoteTextInput noteId={noteId} startingNoteText={note?.text || ''}/>
    </div>
  </div>)
}

export default HomePage