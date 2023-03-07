

/**
 * Subscription вспомогательная сущность в системе которая контролирует процесс
 * выполнения обсерверов, и очистку функций
 * Это просто обчный обсервер паттерн
 */
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