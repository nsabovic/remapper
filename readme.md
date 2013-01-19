h1. remapper

Is an URL path remapper. Given a source path, it will try to match it with a
destination object, and will decorate all the items in the destination object
with the given source object.

        var destinationObject = remapper(sourcePath, sourceObject);

The remapper has a configuration which specifies the matching rules:

        var remapper = new Remapper(configuration);

Similar to a router, but it's okay to have multiple route matches, the first one
that satisfies reqired criteria will be returned.

An example rule:

        {
          source: '/source/(.*)',
          required: ['featureFlag'],
          destinations: [ {
            dest: '/#dest/{whoopsie}/{1|this|that}/{whoopsie}?{allParams}',

            // Everything bellow is optional:
            required: ['whoopsie', 'mobile'],
            data: { extraData: 1 }
          } ]
        }

Source is a regexp that source path needs to match. All the items in the
destination can refer to  source object properties and numbered capture groups
from source path.
You can do regexp replaces on these too, with the pipe(|). For example,
{woot|(a)|b$1} will return the source object's woot property, with all a's
replaced with ba's.

If required field is present, it will test for existence of given keys in the
passed source object in order to match the rule.


Soo:
        var testUrl = require('url').parse('/this/item?p=v', true);

        var r = new Router([{
          source: '/this/(.*)',
          destinations: [
            path: {'/that/{1}'
          }]}]);
        var result = r.map(testUrl.path, testUrl);
        console.log(require('url').format(result));

If there's no match, null is returned.
