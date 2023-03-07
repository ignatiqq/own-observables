const {Subscription} = require('./Subscription');

class Subscriber {
    constructor(observer, subscription) {
        this.observer = observer;
        this.ended = false;
        this.subscription = subscription;
        this.setEnded = this.setEnded.bind(this);
        this.init();
    }

    init() {
        this.subscription.add(this.setEnded);
    }

    isEnded() {
        return this.ended;
    }

    setEnded() {
        this.ended = true;
    }

    next(val) {
        if(!this.isEnded()) {
            this.observer.next(val);
        }
    }

    complete(val) {
        if(!this.isEnded()) {
            this.setEnded();
            this.observer.complete(val);
            this.subscription.unsubscribe();
        }
    }

    error(val) {
        if(!this.isEnded()) {
            this.setEnded();
            this.observer.error(val);
            this.subscription.unsubscribe();
        }
    }
}

module.exports = {Subscriber};
