import { useWallets } from '@privy-io/react-auth'
import { useAddress, useResolvedMediaType } from '@thirdweb-dev/react'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { pinMetadataToIPFS } from '../ipfs/pin'
import PrivyWalletContext from '../privy/privy-wallet-context'

function getAttribute(attributes: any[], traitType: string) {
  return Object.values(attributes).find(
    (attr: any) => attr.trait_type === traitType
  )
}

export function useEntityMetadata(entityContract: any, nft: any) {
  const address = useAddress()
  const { wallets } = useWallets()

  const [members, setMembers] = useState<string[]>()
  const [multisigAddress, setMultisigAddress] = useState<any>()
  const [socials, setSocials] = useState<any>()
  const [isPublic, setIsPublic] = useState<boolean>(false)
  const [hatTreeId, setHatTreeId] = useState<number>()

  const resolvedMetadata = useResolvedMediaType(nft?.metadata?.uri)
  const [rawMetadata, setRawMetadata] = useState<any>()

  async function getRawMetadata() {
    const metadataRes = await fetch(resolvedMetadata.url)
    const rawMetadata = await metadataRes.json()
    setRawMetadata(rawMetadata)
  }

  function getMultisigAddress() {
    const entityMultisigAddress = getAttribute(
      nft.metadata.attributes,
      'multisig'
    )
    setMultisigAddress(entityMultisigAddress.value)
  }

  function getView() {
    const entityView: any = getAttribute(nft.metadata.attributes, 'view')
    setIsPublic(entityView?.value === 'public' ? true : false)
  }

  function getEntitySocials() {
    const entityTwitter = getAttribute(nft.metadata.attributes, 'twitter')
    const entityCommunications = getAttribute(
      nft.metadata.attributes,
      'communications'
    )
    const entityWebsite = getAttribute(nft.metadata.attributes, 'website')
    setSocials({
      twitter: entityTwitter?.value,
      communications: entityCommunications?.value,
      website: entityWebsite?.value,
    })
  }

  function getHatTreeId() {
    const entityHatTreeId = getAttribute(nft.metadata.attributes, 'hatsTreeId')
    setHatTreeId(entityHatTreeId.value)
  }

  async function updateMetadata(newMetadata: any) {
    if (address != multisigAddress)
      return toast.error(`Connect the entity's safe to update members`)

    const EOAWallet = wallets.find((w: any) => w.walletClientType != 'safe')

    if (!EOAWallet) return toast.error('No EOAWallet found')

    const provider = await EOAWallet.getEthersProvider()
    const signer = provider?.getSigner()

    const nonceRes = await fetch(`/api/db/nonce?address=${address}`)

    const nonceData = await nonceRes.json()

    const message = `Please sign this message to update this entity's members #${nonceData.nonce}`

    const signature = await signer.signMessage(message)

    if (!signature) return toast.error('Error signing message')

    const jwtRes = await fetch('/api/ipfs/upload', {
      method: 'POST',
      headers: {
        signature,
      },
      body: JSON.stringify({ address: EOAWallet.address, message }),
    })

    const JWT = await jwtRes.text()

    const newMetadataIpfsHash = await pinMetadataToIPFS(
      JWT,
      newMetadata,
      multisigAddress + ' Metadata'
    )

    if (!newMetadataIpfsHash)
      return toast.error('Error pinning metadata to IPFS')

    await entityContract.call('setTokenURI', [
      nft.metadata.id,
      'ipfs://' + newMetadataIpfsHash,
    ])
  }

  useEffect(() => {
    if (!nft?.metadata?.attributes) return
    getMultisigAddress()
    getEntitySocials()
    getView()
    getHatTreeId()
    console.log(nft.metadata.attributes)
  }, [nft])

  useEffect(() => {
    getRawMetadata()
  }, [resolvedMetadata])

  return { members, multisigAddress, socials, isPublic, hatTreeId }
}