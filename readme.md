h1. remapper

Is an URL path remapper. Given an input path, it will rewrite it according to
some rules. Similar to a router, but it's okay to have multiple route matches,
the first one that satisfies additional criteria will be returned.

An example rule:

        {
          source: '/source/(.*)',
          destinations: [ {
            dest: '/#dest/{whoopsie}/{1|this|that}/{whoopsie}?{allParams}',

            // Everything bellow is optional:
            config: ['featureFlag'],
            sourceParams: ['whoopsie', 'mobile'],
            data: { extraData: 1 }
          } ]
        }

Source is a regexp that, when matched, will be converted to dest. Dest can refer
to query params and numbered capture groups from source, and it can also use
special word `allParams` which are all the query params from the source url.
You can do regexp replaces on these too, with the pipe(|). For example,
{woot|(a)|b$1} will return the param woot with all a's replaced with ba's.

If config is present, it will test for existence of given keys in the passed
config hash in order to match the rule.

`sourceParams` is the list of required query parameters in the source string,

`data` is whatever data you want returned when this route is matched.

Soo:

        var r = new Router([{ source: ..., destinations: ... }, ... ]);
        var result = r.map('http://whatever/source', {
          test: {
            whatever: true
          }
        });
        console.log(result.url);
        console.log(result.data);

