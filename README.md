<h1 align=center>batch-alarms</h1>

<p align=center>Library for providing default CloudFormation dashboards &amp; ECS Services</p>

## Installation

```bash
npm add batch-alarms
```

## Usage

```js
const cf = require('@mapbox/cloudfriend');
const alarms = require('batch-alarms');

cf.merge(
    template,
    alarms({
        prefix: 'CFPrefix',
        email: 'nick@ingalls.ca',
        cluster: cf.ref('APIECSCluster'),
        service: cf.getAtt('APIService', 'Name'),
        loadbalancer: cf.getAtt('APIELB', 'LoadBalancerFullName')
    })
);
```
