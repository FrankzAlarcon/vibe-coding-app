"use client"

import { useTRPC } from '@/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import React from 'react'

const Client = () => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.createAI.queryOptions({ text: "Frankz from server component - Prefetch"}))
  return (
    <div>
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default Client