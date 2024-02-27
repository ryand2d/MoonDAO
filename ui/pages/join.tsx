import { Polygon, Sepolia } from '@thirdweb-dev/chains'
import { Token } from '@uniswap/sdk-core'
import { create } from 'cypress/types/lodash'
import { ethers } from 'ethers'
import FormData from 'form-data'
import useTranslation from 'next-translate/useTranslation'
import { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { createSafe } from '../lib/gnosis/createSafe'
import PrivyWalletContext from '../lib/privy/privy-wallet-context'
import ChainContext from '../lib/thirdweb/chain-context'
import { initSDK } from '../lib/thirdweb/thirdweb'
import { pregenSwapRoute } from '../lib/uniswap/pregenSwapRoute'
import Head from '../components/layout/Head'
import { CreateEntity } from '../components/onboarding/CreateEntity'
import { OnboardingV2 } from '../components/onboarding/OnboardingV2'
import { OnboardingStageManager } from '../archive/onboarding/OnboardingStageManager'
import { DAI_ADDRESSES, MOONEY_ADDRESSES } from '../const/config'

export default function Join({ usdQuotes }: any) {
  const { t } = useTranslation('common')

  const { setSelectedChain } = useContext(ChainContext)

  useEffect(() => {
    setSelectedChain(Sepolia)
  }, [])

  return (
    <div className="animate-fadeIn">
      <Head title={t('joinTitle')} description={t('joinDesc')} />
      <OnboardingV2 />
    </div>
  )
}

// export async function getStaticProps() {
//   const DAI = new Token(
//     137,
//     DAI_ADDRESSES['polygon'],
//     18,
//     'DAI',
//     'DAI Stablecoin'
//   )

//   const MOONEY = new Token(
//     137,
//     MOONEY_ADDRESSES['polygon'],
//     18,
//     'MOONEY',
//     'MOONEY (PoS)'
//   )

//   const levelOneRoute = await pregenSwapRoute(Polygon, 20000, MOONEY, DAI)
//   const levelTwoRoute = await pregenSwapRoute(Polygon, 100000, MOONEY, DAI)
//   const levelThreeRoute = await pregenSwapRoute(Polygon, 500000, MOONEY, DAI)

//   const usdQuotes = [levelOneRoute, levelTwoRoute, levelThreeRoute].map(
//     (swapRoute) => swapRoute?.route[0].rawQuote.toString() / 10 ** 18
//   )

//   return {
//     props: {
//       usdQuotes,
//     },
//     revalidate: 60,
//   }
// }
