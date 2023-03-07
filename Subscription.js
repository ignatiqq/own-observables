class Subscription {
    constructor() {
        this.unsubscribeFns = [];
    }

    add(fn) {
        this.unsubscribeFns.push(fn);
    }

    unsubscribe() {
        this.unsubscribeFns.forEach(fn => fn());
        this.unsubscribeFns = [];
    }
}

module.exports = {Subscription};