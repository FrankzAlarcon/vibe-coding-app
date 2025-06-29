"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { toast } from 'sonner'

const Page = () => {
  const [input, setInput] = useState("")
  const trpc = useTRPC()
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions())
  const createMessage = useMutation(trpc.messages.create.mutationOptions({
    onSuccess(data, variables, context) {
      toast.success("Message created")
    },
  }))
  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <Input value={input} onChange={(e) => setInput(e.target.value)} />
      <Button disabled={createMessage.isPending} onClick={() => createMessage.mutate({ value: input })}>createMessage Background Job</Button>
      <div className='flex flex-col gap-2'  >
        {JSON.stringify(messages)}
      </div>
    </div>
  )
} 

export default Page