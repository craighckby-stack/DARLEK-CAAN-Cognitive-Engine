export interface SubscriptionTeardown {
  readonly unsubscribe: () => void;
}

export class LifecycleManager {
  private subscriptions: SubscriptionTeardown[] = [];
  private isDestroyed: boolean = false;

  public register(sub: SubscriptionTeardown): void {
    if (this.isDestroyed) {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error('Failed to immediately teardown subscription on destroyed LifecycleManager:', error);
      }
      return;
    }
    this.subscriptions.push(sub);
  }

  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }
    this.isDestroyed = true;

    const currentSubs = this.subscriptions;
    this.subscriptions = [];

    for (let i = currentSubs.length - 1; i >= 0; i--) {
      try {
        currentSubs[i].unsubscribe();
      } catch (error) {
        console.error('Error during subscription teardown:', error);
      }
    }
  }
}