import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

interface PlayerDoc {
  id: string
  userId?: string
  nickname: string
  avatarId: string
  isHost: boolean
  skipCount: number
  joinedAt: admin.firestore.Timestamp | null
}

interface RoomDoc {
  id: string
  name: string
  hostId: string
}

interface UserTokenDoc {
  id: string
  token: string
  userId: string
}

export const onPlayerJoined = functions.firestore
  .document('rooms/{roomId}/players/{playerId}')
  .onCreate(async (snapshot, context) => {
    const player = snapshot.data() as PlayerDoc
    const roomId = context.params.roomId

    if (player.isHost) return

    try {
      const roomSnap = await db.collection('rooms').doc(roomId).get()
      if (!roomSnap.exists) return
      const room = roomSnap.data() as RoomDoc
      const hostId = room.hostId

      const tokenSnap = await db.collection('userTokens').doc(hostId).get()
      if (!tokenSnap.exists) return
      const tokenData = tokenSnap.data() as UserTokenDoc
      const fcmToken = tokenData.token

      if (!fcmToken) return

      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: 'New player joined!',
          body: `${player.nickname} joined ${room.name}`,
        },
        data: {
          roomId,
          type: 'player_joined',
        },
      }

      await admin.messaging().send(message)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  })

export const onGameEnded = functions.firestore
  .document('rooms/{roomId}/game/current')
  .onUpdate(async (change, context) => {
    const roomId = context.params.roomId
    const before = change.before.data() as { state?: string }
    const after = change.after.data() as { state?: string }

    if (before.state !== 'completed' && after.state === 'completed') {
      try {
        const roomSnap = await db.collection('rooms').doc(roomId).get()
        if (!roomSnap.exists) return
        const room = roomSnap.data() as RoomDoc

        const playersSnap = await db.collection('rooms').doc(roomId).collection('players').get()
        const players = playersSnap.docs.map((d) => d.data() as PlayerDoc)

        const tokens = await Promise.all(
          players.map(async (p) => {
            if (!p.userId) return null
            const tokenSnap = await db.collection('userTokens').doc(p.userId).get()
            if (!tokenSnap.exists) return null
            return tokenSnap.data()?.token as string | undefined
          })
        )

        const validTokens = tokens.filter((token): token is string => !!token)

        const promises = validTokens.map((token) => {
          const message: admin.messaging.Message = {
            token,
            notification: {
              title: 'Game ended!',
              body: `The game in ${room.name} has ended.`,
            },
            data: {
              roomId,
              type: 'game_ended',
            },
          }
          return admin.messaging().send(message)
        })

        await Promise.all(promises)
      } catch (error) {
        console.error('Error sending game ended notifications:', error)
      }
    }
  })
