import { Injectable } from "@nestjs/common";

@Injectable()
export class RemotePlayerSubscriptionsService {
  private subscriptions = new Map<string, Set<string>>(); // userId -> remotePlayerIds

  subscribe(userId: string, remotePlayerId: string): void {
    if (!this.subscriptions.has(userId))
      this.subscriptions.set(userId, new Set());

    this.subscriptions.get(userId)!.add(remotePlayerId);
  }

  unsubscribe(userId: string, remotePlayerId: string): void {
    this.subscriptions.get(userId)?.delete(remotePlayerId);

    if (this.subscriptions.get(userId)?.size === 0)
      this.subscriptions.delete(userId);
  }

  canView(userId: string, remotePlayerId: string): boolean {
    return this.subscriptions.get(userId)?.has(remotePlayerId) ?? false;
  }
}
