h1. remapper

Is an URL path remapper. Given an input path, it will rewrite it according to
some rules. Similar to a router, but it's okay to have multiple route matches,
the first one that satisfies additional criteria will be returned.

An example rule:

        {
          source: '/source/(.*)',
          dest: '/#dest/{whoopsie}/{1}',

          // Everything bellow is optional:
          config: ['test.whatever', 'feature.another'],
          sourceParams: ['whoopsie', 'mobile'],
          destParams: {
            'rest': '{1}',
            'deleteme': null
          },
          forwardParams: true,
          data: { pageKey: 'somethingrather' }
        }

Source is a regexp that, when matched, will be converted to dest. Dest can refer
to query params and numbered capture groups from source.

If config is present, it will test for existence of given keys in the passed
config hash in order to match the rule.

`sourceParams` is the list of required query parameters in the source string,

`destParams` is the list of query parameters output. It also supports referenes.
If `forwardParams` is true, the list of parameters starts from source parameters
and adds `destParams`, otherwise it's just `destParams`. Setting a param to
null deletes it from the original list.

`data` is whatever data you want returned when this route is matched.

Soo:

        var r = new Router([{ source: ..., dest: ... }, ... ]);
        var result = r.map('http://whatever/source', {
          test: {
            whatever: true
          }
        });
        if (result === null) {
          console.log('Nothing.');
        } else {
          console.log(result.url);
          console.log(result.data);
        }

