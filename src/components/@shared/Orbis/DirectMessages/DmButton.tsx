import React, { useEffect, useState } from 'react'
import Button from '@shared/atoms/Button'
import styles from './DmButton.module.css'
import { accountTruncate } from '@utils/web3'
import { useWeb3 } from '@context/Web3'
import { useProfile } from '@context/Profile'
import { useOrbis } from '@context/Orbis'

export default function DmButton({
  accountId,
  text = 'Send Direct Message'
}: {
  accountId: string
  text?: string
}) {
  const { profile, ownAccount } = useProfile()
  const { accountId: ownAccountId, connect } = useWeb3()
  const {
    checkOrbisConnection,
    getConversationByDid,
    setNewConversation,
    setConversationId,
    setOpenConversations,
    getDid
  } = useOrbis()
  const [userDid, setUserDid] = useState<string | undefined>()
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  const handleActivation = async () => {
    const resConnect = await connect()
    if (resConnect) {
      await checkOrbisConnection({
        address: resConnect,
        autoConnect: true,
        lit: true
      })
    }
  }

  useEffect(() => {
    const getUserDid = async () => {
      const did = await getDid(accountId)
      setUserDid(did)
    }

    if (accountId) {
      getUserDid()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId])

  if (!ownAccount && userDid) {
    return (
      <div className={styles.dmButton}>
        <Button
          style="primary"
          size="small"
          disabled={isCreatingConversation}
          onClick={async () => {
            if (!ownAccountId) {
              handleActivation()
            } else {
              setIsCreatingConversation(true)
              const conversation = await getConversationByDid(userDid)
              if (conversation) {
                setConversationId(conversation.stream_id)
              } else {
                console.log('need to create new conversation')
                const suffix =
                  profile && profile?.name
                    ? profile?.name
                    : accountTruncate(accountId.toLowerCase())

                setConversationId(`new-${suffix}`)
                setNewConversation({
                  recipients: [userDid]
                })
              }
              setOpenConversations(true)
              setIsCreatingConversation(false)
            }
          }}
        >
          {isCreatingConversation ? 'Loading...' : text}
        </Button>
      </div>
    )
  }
}
