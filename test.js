const {Observable} = require('./Observable');


const interval = (period) => {
    return new Observable(observer => {
      let counter = 0;
      console.log("next from interval main observable");
      const id = setInterval(() => observer.next(++counter), period)
      return () => {
        clearInterval(id)
      }
    })
}

  const map = (mapFunc) => (sourceObservable) => {
    return new Observable(observer => {
        console.log("Create observable subscriber")
      const sourceSubscription = sourceObservable.subscribe({
        next(val) {
          let next
          try {
            next = mapFunc(val)
          } catch (e) {
            this.error(e)
            this.complete()
          }
          observer.next(next)
        },
        error(err) {
          observer.error(err)
        },
        complete() {
          observer.complete()
        }
      })
      return () => {
        // --- operator specific TEARDOWN LOGIC
        // when the new Obx is unsubscribed
        // simply unsubscribe from the source Obx


        // thereis no this logic in Subscrib
        sourceSubscription.unsubscribe()
      }
    })
  }

  const intervalObx = interval(700)
  .pipe(
    map((val) => val.toString() + 'hello world'),
    map(function x3(x) { return `Result: ${x + 3}` }),
    // map((val) => val + 100)
  )


intervalObx.subscribe({
    next: (val) => console.log(val),
    error: (err) => console.error(err),
});