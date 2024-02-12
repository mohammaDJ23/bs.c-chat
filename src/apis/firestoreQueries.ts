import { DocumentData, Query, and, collection, limit, or, orderBy, query, startAfter, where } from 'firebase/firestore';
import { db } from '../lib';

export namespace FirestoreQueries {
  const conversationCollection = process.env.FIREBASE_CONVERSATION_COLLECTION!;

  export interface FirestoreQuery {
    getQuery(): Query<DocumentData, DocumentData>;
  }

  export class PaginatedConversationListQuery implements FirestoreQuery {
    private readonly q: Query<DocumentData, DocumentData>;

    constructor(private readonly userId: number, private readonly take: number, private readonly lastDoc: unknown) {
      this.q = query(
        collection(db, conversationCollection),
        and(
          where('contributors', 'array-contains', this.userId),
          or(where('creatorId', '==', this.userId), where('targetId', '==', this.userId))
        ),
        orderBy('updatedAt', 'desc'),
        limit(this.take),
        startAfter(this.lastDoc)
      );
    }

    getQuery() {
      return this.q;
    }
  }

  export class ConversationListQuery implements FirestoreQuery {
    private readonly q: Query<DocumentData, DocumentData>;

    constructor(private readonly userId: number) {
      this.q = query(
        collection(db, conversationCollection),
        and(
          where('contributors', 'array-contains', this.userId),
          or(where('creatorId', '==', this.userId), where('targetId', '==', this.userId))
        )
      );
    }

    getQuery() {
      return this.q;
    }
  }

  export class InitialConversationListForSnapshotQuery implements FirestoreQuery {
    private readonly q: Query<DocumentData, DocumentData>;

    constructor(private readonly userId: number) {
      this.q = query(
        collection(db, conversationCollection),
        and(
          where('contributors', 'array-contains', this.userId),
          where('lastMessage', '==', null),
          or(where('creatorId', '==', this.userId), where('targetId', '==', this.userId))
        )
      );
    }

    getQuery() {
      return this.q;
    }
  }

  export class ConversationListForSnapshotQuery implements FirestoreQuery {
    private readonly q: Query<DocumentData, DocumentData>;

    constructor(private readonly userId: number) {
      this.q = query(
        collection(db, conversationCollection),
        and(
          where('contributors', 'array-contains', this.userId),
          where('lastMessage', '!=', null),
          or(where('creatorId', '==', this.userId), where('targetId', '==', this.userId))
        )
      );
    }

    getQuery() {
      return this.q;
    }
  }

  export class PaginatedMessageListQuery implements FirestoreQuery {
    private readonly q: Query<DocumentData, DocumentData>;

    constructor(private readonly roomId: string, private readonly take: number, private readonly lastDoc: unknown) {
      this.q = query(
        collection(db, `${conversationCollection}/${this.roomId}/messages`),
        orderBy('createdAt', 'desc'),
        limit(this.take),
        startAfter(this.lastDoc)
      );
    }

    getQuery() {
      return this.q;
    }
  }

  export class MessageListQuery implements FirestoreQuery {
    private readonly q: Query<DocumentData, DocumentData>;

    constructor(private readonly roomId: string) {
      this.q = query(collection(db, `${conversationCollection}/${this.roomId}/messages`), orderBy('createdAt', 'desc'));
    }

    getQuery() {
      return this.q;
    }
  }
}
