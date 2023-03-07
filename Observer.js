const { Subscription } = require("./Subscription");

/**
 * Subscriber сущность в системе которая нужна для контроля потоков, поступающих от Observable'ов
 * с помощью наблюдателя мы можем работать с потоками
 * Наблютелей (Observer'ов) можно комбинировать с помощью фп пайп
 */
class Subscriber {
    /**
     * 
     * @param {{next: (val) => void; error: (err) => void; complete: () => void}} observer 
     * @param {Subscription} subscription 
     */
    constructor(observer, subscription) {
        this.observer = observer;
        this.ended = false;
        this.subscription = subscription;
        this.setEnded = this.setEnded.bind(this);
        this.init();
    }

    /**
     * Инициализация подписки
     * в методах this.error и this.complete
     * мы будем отписываться (ставить флаг isEnded) для обсервабла, 
     * для того, чтобы не продолжать обработку потока если произошла ошибка 
     * или обсервабл completed соовтетственно
     */
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
