"use client"

import { Button } from '@/components/ui/button'
import { useTRPC } from '@/trpc/client'
import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

const Page = () => {
  const trpc = useTRPC()
  const invoke = useMutation(trpc.invoke.mutationOptions({
    onSuccess(data, variables, context) {
      toast.success("Background job started ")
    },
  }))
  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <h1 className='text-4xl font-bold'>Hello World!!!!!!!!!</h1>
      <Button disabled={invoke.isPending} onClick={() => invoke.mutate({ text: "Frankz from client component" })}>Invoke Background Job</Button>
    </div>
  )
} 

export default Page