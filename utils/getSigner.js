import { ethers } from 'ethers'
import Web3Modal from 'web3modal'

export const getProviderOrSigner = async (needSigner = false) => {
  const providerOptions = {}

  try {
    let web3Modal = new Web3Modal({
      cacheProvider: false,
      network: 'rinkeby',
      providerOptions,
    })
    const web3ModalInstance = await web3Modal.connect()
    const web3ModalProvider = new ethers.providers.Web3Provider(
      web3ModalInstance,
    )
    const { chainId } = await web3ModalProvider.getNetwork()
    if (chainId !== 4) {
      window.alert('Change the network to Rinkeby')
      throw new Error('Change network to Rinkeby')
    }

    if (needSigner) {
      const signer = web3ModalProvider.getSigner()
      return signer
    }
    return web3ModalProvider
  } catch (err) {
    console.log(err.message)
  }
}
