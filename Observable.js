const {Subscriber} = require('./Observer');
const {Subscription} = require('./Subscription');

const pipe = (...fns) => (val) => fns.reduce((acc, f) => f(acc), val);

/**
 * Обсервабл это сущность в реактивной системе, которая принимает функцию (поток)
 * который отдает поток данных соответственно, на вход этот колбек ак же будет получать
 * объект или функцию observer, который будет получать поток выполения переданной функции
 * @param {
 *     initFunc: (observer: {next: (val) => void, error: (err) => void; complete: () => void}) => хз
 * }
 */
class Observable {
    constructor(initFunc) {
        this.initFunc = initFunc ? initFunc : this.createSafeFn();
    }

    createSafeFn() {
        return (observer) => {
            observer.next();
        }
    }

    /**
     * @param {{
     *    next: function,
     *    error: function,
     *    complete: function
     * }} observer
     */
    subscribe(observer) {
        const {subscriber, subscription} = this.createSubscriber(observer);
        // выполняем функцию переданную (изначально) в обсервабл
        // для того чтобы начать ее выполнения
        // так как обсервабл "холодный" (начинает выполнение не сразу, а после подписки)
        const unsubscribe = this.initFunc(subscriber);
        // так же для того, чтобы очистить все таймеры и эффекты в initFunc флоу
        // мы в Subscription инстанс добавляем функцию очистки, которую возвращаем из
        // initFunc обсервабла
        subscription.add(unsubscribe);

        return unsubscribe;
    }

    createSubscriber(observer) {
        const subscription = new Subscription();
        return {subscriber: new Subscriber(observer, subscription), subscription};
    }

    /**
     * pipe метод позволяет нам комбинировать наши операторы
     * для конструкции более усложненного флоу
     * пайп может принимать сколь угодно операторов
     * и в каждый оператор он передает текущий обсервабл,
     * на который подписываются новые обсерверы из пайпа
     * и так соответственно создаюется цепочка
     * 
     * Например:
     * 
     * мы создали обсервабл (поток) который просто отдает в поток цифру 1
     * 
     * const a$ = new Observable(observer => {
     *     observer.next(1);
     * })
     * 
     * после этого вызываем у него метод пайп (для того, чтобы произвести дополнительные действия со значением потока)
     * 
     * a$.pipe(map((x) => x * 10));
     * 
     * это равноценно:
     * 
     *  здесь originalObservable = изначальный обсервабл, вызов pipe(fn)"(THIS)"
     *  который по цепочке будет передавать все обсерваблы
     * 
     * a$.pipe((originalObservable) => new Observable(observer) => {
     *         
     *      // здесь мы ловим поток который нам отдал "a$" тоесть однерку в next
     * 
     *      const subscription =  originalObservable.subscribe({
     *          next(val) {
     *              //  тут мы уже изменяем val в соответствии с функцией "x => x * 10"
     *              //  и отдаем следующиму обсерверу (наблюдателю) который будет подписываться
     *              //  на текущий (с добавленной лоигикой), тоесть теперь цепочка идет так:
     *              //  a$ эммитит значение и наш map(x => x * 10) отлавливает этот вызов подписавшись на оригинальный
     *              //  выполняет какуюто логику и отдает новый обсервабл на который можно подписаться соответственно
     *              observer.next(1 * 10);
     *          }
     *      });
     *      
     *      //  отписка всех событий в функции оригинального обсервабла
     * 
     *      return () => subscription.unsubscribe();
     * })
     * 
     * @param {*} fn
     * @returns {Observable} 
     */
    pipe(...fns) {
        return pipe(...fns)(this);
    }
}

module.exports = {Observable};