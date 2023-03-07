const {Subscriber} = require('./Subscriber');
const {Subscription} = require('./Subscription');

const pipe = (...fns) => (val) => fns.reduce((acc, f) => f(acc), val)

class Observable {
    constructor(initFunc) {
        this.initFunc = initFunc;
    }

    /**
     * @param {{
     *    next: function,
     *    error: function,
     *    complete: function
     * }} observer
     */
    subscribe(observer) {
        const subscription = new Subscription();
        const subscriber = new Subscriber(observer, subscription);
        const unsubscribe = this.initFunc(subscriber);
        subscription.add(unsubscribe);

        return unsubscribe;
    }

    /**
     * 
     * @param {*} fn
     * @returns {Observable} 
     */
    pipe(...fns) {
        return pipe(...fns)(this);
    }
}

module.exports = {Observable};