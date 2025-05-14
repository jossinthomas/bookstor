// backend/utils/observer.js
class Notifier {
  constructor() {
    this.observers = [];
  }

  /**
   * Subscribe an observer function or object.
   * @param {Function | Object} observer - The observer to subscribe.
   *   If an object, it must have a `update` method.
   */
  subscribe(observer) {
    if (typeof observer === 'function' || (typeof observer === 'object' && typeof observer.update === 'function')) {
      this.observers.push(observer);
    } else {
      console.warn('Invalid observer subscribed. Observer must be a function or an object with an update method.');
    }
  }

  /**
   * Unsubscribe an observer function or object.
   * @param {Function | Object} observer - The observer to unsubscribe.
   */
  unsubscribe(observer) {
    this.observers = this.observers.filter(sub => sub !== observer);
  }

  /**
   * Notify all subscribed observers.
   * @param {*} data - The data to pass to the observers.
   */
  notify(data) {
    this.observers.forEach(observer => {
      try {
        if (typeof observer === 'function') {
          observer(data); // Call the function directly
        } else if (typeof observer === 'object' && typeof observer.update === 'function') {
          observer.update(data); // Call the update method of the object
        }
      } catch (error) {
        console.error('Error notifying observer:', error);
      }
    });
  }
}

module.exports = Notifier;