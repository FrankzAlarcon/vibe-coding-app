
import { Button } from '@/components/ui/button'
import { caller, getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import Client from './client'

const Page = async () => {
  console.log('SERVER COMPONENT')
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.createAI.queryOptions({
    text: "Frankz from server component - Prefetch"
  }))
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className=' text-rose-500'>  
        <h1 className='text-4xl font-bold'>Hello World!!</h1>
        <Button variant='destructive'>Click me</Button>
        <Suspense fallback={<div>Loading...</div>}>
          <Client />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
} 

export default Page