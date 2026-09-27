const CACHE = "ambesh-v3";

self.addEventListener(
  "install",
  e => {

    e.waitUntil(
      self.skipWaiting()
    );

  }
);


self.addEventListener(
  "activate",
  e => {

    e.waitUntil(

      caches
        .keys()
        .then(keys =>
          Promise.all(

            keys
              .filter(
                k => k !== CACHE
              )
              .map(
                k => caches.delete(k)
              )

          )
        )
        .then(
          () => self.clients.claim()
        )

    );

  }
);


self.addEventListener(
  "fetch",
  e => {

    const u =
      new URL(
        e.request.url
      );

    if(
      e.request.method !== "GET"
    ) {
      return;
    }


    if(
      u.pathname.endsWith("/app.js") ||
      u.pathname.endsWith("/index.html") ||
      u.pathname.endsWith("/supabase-config.js")
    ){

      e.respondWith(

        fetch(
          e.request,
          {
            cache: "no-store"
          }
        )
        .catch(
          () =>
            caches.match(
              e.request
            )
        )

      );

      return;

    }


    e.respondWith(

      caches
        .match(e.request)
        .then(
          r =>
            r ||
            fetch(e.request)
              .then(res => {

                const copy =
                  res.clone();

                caches
                  .open(CACHE)
                  .then(
                    c =>
                      c.put(
                        e.request,
                        copy
                      )
                  );

                return res;

              })
        )

    );

  }
);