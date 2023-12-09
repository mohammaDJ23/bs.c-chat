import { DocumentData, Query, and, collection, limit, or, orderBy, query, startAfter, where } from 'firebase/firestore';
import { db } from '../lib';

export namespace FirestoreQueries {
  export interface FirestoreQuery {
    getQuery(): Query<DocumentData, DocumentData>;
  }

  export class PaginatedConversationListQuery implements FirestoreQuery {
    private readonly q: Query<DocumentData, DocumentData>;

    constructor(private readonly userId: number, private readonly take: number, private readonly lastDoc: unknown) {
      this.q = query(
        collection(db, 'conversation'),
        and(
          where('contributors', 'array-contains', userId),
          or(where('creatorId', '==', userId), where('targetId', '==', userId))
        ),
        orderBy('updatedAt', 'desc'),
        limit(take),
        startAfter(lastDoc)
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
        collection(db, 'conversation'),
        and(
          where('contributors', 'array-contains', userId),
          or(where('creatorId', '==', userId), where('targetId', '==', userId))
        )
      );
    }

    getQuery() {
      return this.q;
    }
  }
}
