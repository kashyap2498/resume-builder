import { useQuery } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function usePurchase() {
  const { isAuthenticated } = useConvexAuth()
  const purchase = useQuery(
    api.purchases.getActivePurchase,
    isAuthenticated ? {} : 'skip'
  )

  return {
    isActive: !!purchase,
    plan: purchase?.plan ?? null,
    expiresAt: purchase?.expiresAt ?? null,
    isLoading: purchase === undefined && isAuthenticated,
  }
}
