<h1 align=center>batch-alarms</h1>

<p align=center>Library for providing default CloudFormation dashboards &amp; ECS Services</p>

<p align=center>https://openaddresses.github.io/batch-alarms</p>


## Installation

```bash
npm add batch-alarms
```

## Usage

```js
import cf from '@mapbox/cloudfriend';
import {
    ELB as ELBAlarms,
    RDS as RSDAlarms
} from 'batch-alarms';

cf.merge(
    template,
    ELBAlarms({
        prefix: 'CFPrefix',
        apache: cf.stackName,
        email: 'nick@ingalls.ca',
        cluster: cf.ref('APIECSCluster'),
        service: cf.getAtt('APIService', 'Name'),
        loadbalancer: cf.getAtt('APIELB', 'LoadBalancerFullName'),
        targetgroup: cf.getAtt('APITargetGroup', 'TargetGroupFullName'),
    }),
    ELBAlarms({
        prefix: 'CFPrefix',
        email: 'nick@ingalls.ca',
        targetgroup: cf.ref('RDSInstance')
    })
);
```
