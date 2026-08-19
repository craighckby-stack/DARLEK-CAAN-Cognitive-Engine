export interface SubscriptionTeardown { unsubscribe: () => void; }

export class LifecycleManager {
  private subscriptions: SubscriptionTeardown[] = [];

  public register(sub: SubscriptionTeardown): void {
    this.subscriptions.push(sub);
  }

  public destroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
}






































