const {Observable} = require('./Observable');

const debounce = (fn, ms, self) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            return fn.call(self, ...args);
        }, ms);
    }
}

const from = (val) => {
    return new Observable(observer => {
        val.forEach((item) => {
            observer.next(item);
        });
    })
}

const fromEvent = (el, event) => {
    return new Observable(observer => {
        let listener;

        try {
            listener = el.addEventListener(event, observer.next);
        } catch (error) {
            observer.error(error);
            return;
        }

        return () => {
            el.removeEventListener(listener);
        }
    })
}

const interval = (ms) => (originalObserver) => {
    return new Observable(observer => {
        let interval;
        const unsubscribe = originalObserver.subscribe({
            next(val) {
                interval = setInterval(() => {
                    observer.next(val)
                }, ms)
            }
        })

        return () => {
            clearInterval(interval);
            unsubscribe.unsubscribe();
        }
    })
}

const debounceTime = (ms) => (originalObserver) => {
    return new Observable(observer => {
        const debounced = debounce(observer.next, ms, observer);
        const subscription = originalObserver.subscribe({
            next(val) {
                debounced(val);
            }
        });

        return () => {
            subscription.unsubscribe();
        }
    })
}

const mapTo = (val) => () => {
    return new Observable(observer => {
        observer.next(val);
    })
}

const pluck = (...props) => (originalObserver) => {
    return new Observable(observer => {
        const unsubscribe = originalObserver.subscribe({
            next(val) {
                const result = props.reduce((acc, val) => {
                    if(!acc || !val || !acc[val]) {
                        observer.error('Prop ' + val + ' does not exists on ' + JSON.stringify(acc));
                        return;
                    }
                    return acc[val]
                }, val);
                observer.next(result);
            },
            error(error) {
                observer.error(error)
            }
        })
        return () => {
            unsubscribe.unsubscribe();
        }
    })
}

const map = (fn) => (originalObsevable) => {
    return new Observable(observer => {
        // мы должны подписаться на поток оригинального обсервабла
        // чтобы перехватить его эмитящее значение изменить и передать дальше
        // куда бы то ни было к последнему обсерверу или к следующему в pipe
        const observeOriginal = originalObsevable.subscribe({
            next(val) {
                let next;
                try {
                    next = fn(val);
                } catch (error) {
                    this.error(error);
                    this.complete();
                }
                observer.next(next);
            },
            complete() {
                observer.complete();
            },
            error(err) {
                observer.error(err);
            }
        })

        return () => {
            observeOriginal.unsubscribe();
        }
    })
}

const numbers = [1,2,3,4,5];
const numbers$ = from(numbers);
const numbersMultiplyByTen$ = numbers$.pipe(interval(1100), debounceTime(1000))
numbersMultiplyByTen$.subscribe({
    next(val) {
        console.log({val});
    },
    error(err) {
        console.error("last subscribe error: ", err);
    }
});


// example 

// const clickOnAny$ = fromEvent(document.querySelector('any'), 'click');
// const getClientValues$ = clickOnAny$.pipe(map(obj => ({clientX: obj.clientX, clientY: obj.clientY })));
// getClientValues$.subscribe({
//     next: console.log
// });