import { useStorageContract } from './useContract'
import { useEffect, useState } from 'react'
import { getCurrentDomain } from "../helpers/getCurrentDomain"
import { getConnectedAddress } from "../helpers/setupWeb3"
import isProd from "../helpers/isProd"
import { CHAIN_INFO } from "../helpers/constants"

const storageAddressByChainId = {
  5: '0xafb8f27df1f629432a47214b4e1674cbcbdb02df',
  56: '0xa7472f384339D37EfE505a1A71619212495A973A',
}

const storageChainIdMainnet = 56
const storageChainIdTestnet = 5


const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'


export const getStorageInfo = () => {
  const _isProd = isProd()
  
  const storageChainId = _isProd ? storageChainIdMainnet : storageChainIdTestnet
  const storageChainInfo = CHAIN_INFO(storageChainId)
  const storageRpc = storageChainInfo.rpcUrls[0]
  const storageAddress = storageAddressByChainId[storageChainId]

  return {
    storageChainId,
    storageAddress,
    storageRpc,
    storageChainInfo,
  }
}

const parseInfo = (info) => {
  const parsed = {
    chainId: '',
    texts: {},
    design: {},
    tokenAddress: ``,
    lotteryAddress: ``,
    tokenInfo: {},
    burn: 2,
    matchRules: {
      match_1: 39.2,
      match_2: 58.8,
      match_3: 6.125,
      match_4: 12.25,
      match_5: 24.5,
      match_6: 49,
    }
  }
  const result = JSON.parse(info)

  Object.keys(parsed).forEach((optKey) => {
    if (result[optKey]) parsed[optKey] = result[optKey]
  })
  return parsed
}


export default function useStorage() {
  const [storageData, setStorageData] = useState(null)
  const [storageIsLoading, setStorageIsLoading] = useState(true)
  const [storageTexts, setStorageTexts] = useState({})
  const [storageDesign, setStorageDesign] = useState({})
  const [isOwner, setIsOwner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [error, setError] = useState(null)

  const storage = useStorageContract()
  
  const [ doReloadStorage, setDoReloadStorage ] = useState(true)
  const [ doReloadStorageFast, setDoReloadStorageFast ] = useState(false)

  useEffect(() => {
    if (doReloadStorage || doReloadStorageFast) {
      const fetchData = async () => {
        if (!storage) {
          console.log('>>> no storage')
          return
        }
        
        setError(null)
        if (!doReloadStorageFast) setStorageIsLoading(true)
        
        let parsed: any
        let owner

        try {
          storageData = await storage.methods.getData(getCurrentDomain()).call()
          console.log('>>> storageData.info', storageData.info)
          parsed = parseInfo(storageData.info || '{}')
        } catch (error) {
          console.log('>>> error', error)
          setError(error)
        }
        console.log('>>> storageData parsed', parsed)
        if (parsed) {
          const { owner } = storageData

          /* Check - App is configured */
          const isBaseConfigReady =  true || (
            parsed.chainId !== ''
          )

          setStorageData({
            ...parsed,
            owner: owner === ZERO_ADDRESS ? '' : owner,
            isBaseConfigReady,
            isInstalled: !(owner === ZERO_ADDRESS),
          })
          setIsInstalled(!(owner === ZERO_ADDRESS))
          setStorageTexts(parsed.texts)
          setStorageDesign(parsed.design)
          const connectedWallet = await getConnectedAddress()
          if (connectedWallet && connectedWallet.toLowerCase() === owner.toLowerCase()) {
            setIsOwner(true)
          }
        }
        setDoReloadStorageFast(false)
        setStorageIsLoading(false)
      }
      fetchData()
      if (!doReloadStorageFast) setDoReloadStorage(false)
    }
  }, [ doReloadStorage, doReloadStorageFast])

  return {
    storageIsLoading,
    storageData,
    isOwner,
    isInstalled,
    error,
    storageTexts,
    storageDesign,
    setDoReloadStorage,
    setDoReloadStorageFast,
  }
}