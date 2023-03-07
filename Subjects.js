const {Observable} = require('./Observable');

/**
 * Simple Subject realizarion (eventEmitter logic in Rx)
 */
class Subject extends Observable {
    /**
     * currentObservers = текущие обсерверы для Subject, изначально null
     */
    currentObservers = null;

    /**
     * currentObservers = все обсерверы для Subject
     */
    observers = [];

    constructor(fn) {
        super(fn);
    }

    next(value) {
        if(this.observers) {
            if(!this.currentObservers) {
                this.currentObservers = Array.from(this.observers);
            }
            for(const observer of this.currentObservers) {
                observer.next(value);
            }
        }
    }

    subscribe(subscriber) {
        this.currentObservers = null;
        const {subscriber: newSubscriber} = this.createSubscriber(subscriber);
        this.observers.push(newSubscriber);
    }
}

module.exports = {Subject};

const sub = new Subject();

sub.subscribe({
    next(val) {
        console.log('first: ', val);
    }
});
sub.next('hello');

sub.subscribe({
    next(val) {
        console.log('second: ', val);
    }
})

sub.next('hello');