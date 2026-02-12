import { useNavigate } from 'react-router-dom'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const MONTHLY_CHECKOUT_ID = '6127d1ff-4f5e-4a01-871d-fc7dfb9f4174'
const LIFETIME_CHECKOUT_ID = '60923ab1-e67f-4b6d-9afe-799dfc210629'

export function useCheckout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useConvexAuth()
  const userId = useQuery(api.purchases.getCurrentUserId)

  const openCheckout = (plan: 'monthly' | 'lifetime') => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pending_plan', plan)
      navigate('/login')
      return
    }

    if (!userId) return

    const checkoutId = plan === 'monthly' ? MONTHLY_CHECKOUT_ID : LIFETIME_CHECKOUT_ID
    const url = `https://resumello.lemonsqueezy.com/checkout/buy/${checkoutId}?embed=1&media=0&checkout[custom][user_id]=${userId}`

    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(url)
    } else {
      window.open(url, '_blank')
    }
  }

  const isReady = isAuthenticated && !!userId

  return { openCheckout, isReady }
}
