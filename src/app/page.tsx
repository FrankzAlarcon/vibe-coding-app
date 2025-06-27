"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import { toast } from 'sonner'

const Page = () => {
  const [input, setInput] = useState("")
  const trpc = useTRPC()
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess(data, variables, context) {
      toast.success("Background job started ")
    },
  }))
  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <Input value={input} onChange={(e) => setInput(e.target.value)} />
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ value: input })}>Invoke Background Job</Button>
    </div>
  )
} 

export default Page