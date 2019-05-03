#/bin/bash
cd `dirname $0`/../

./node_modules/mocha/bin/mocha  --exit test/spec/*.spec.js
