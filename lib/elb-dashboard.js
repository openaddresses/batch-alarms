export default function(opts) {
    const widgets = [];

    if (opts.loadbalancer) {
        widgets.push({
            type: 'metric',
            x: 0,
            y: 0,
            width: 24,
            height: 6,
            properties: {
                title: 'HTTP status',
                view: 'timeSeries',
                stacked: false,
                metrics: [
                    ['AWS/ApplicationELB', 'HTTPCode_Target_2XX_Count', 'LoadBalancer', '${LoadBalancerFullName}', { label: '2xx', stat: 'Sum', period: 60, yAxis: 'left' }],
                    ['.', 'HTTPCode_Target_4XX_Count', '.', '.', { label: 'target 4xx', stat: 'Sum', period: 60, yAxis: 'left' }],
                    ['.', 'HTTPCode_ELB_4XX_Count', '.', '.', { label: 'elb 4xx', stat: 'Sum', period: 60, yAxis: 'left' }],
                    ['.', 'HTTPCode_Target_5XX_Count', '.', '.', { label: 'target 5xx', stat: 'Sum', period: 60, yAxis: 'left' }],
                    ['.', 'HTTPCode_ELB_5XX_Count', '.', '.', { label: 'elb 5xx', stat: 'Sum', period: 60, yAxis: 'left' }]
                ],
                region: '${AWS::Region}',
                period: 300,
                yAxis: {
                    left: {
                        min: 0
                    },
                    right: {
                        min: 0
                    }
                }
            }
        });

        widgets.push({
            type: 'metric',
            x: 0,
            y: 6,
            width: 24,
            height: 6,
            properties: {
                title: 'Latency',
                view: 'timeSeries',
                stacked: false,
                metrics: [
                    ['AWS/ApplicationELB', 'TargetResponseTime', 'LoadBalancer', '${LoadBalancerFullName}', { color: '#9467bd', label: 'avg', period: 60 }],
                    ['...', { color: '#c5b0d5', label: 'max', stat: 'Maximum', period: 60 }],
                    ['...', { color: '#c5b0d5', label: 'min', stat: 'Minimum', period: 60 }],
                    ['...', { stat: 'p99', period: 60, label: 'p99', color: '#9edae5' }]
                ],
                region: '${AWS::Region}',
                yAxis: {
                    left: {
                        min: 0
                    },
                    right: {
                        min: 0
                    }
                },
                period: 300,
                annotations: {
                    horizontal: [
                        {
                            color: '#9edae5',
                            label: 'p99 alarm',
                            value: 10
                        }
                    ]
                }
            }
        });
    }

    if (opts.cluster && opts.service) {
        widgets.push({
            type: 'metric',
            x: 0,
            y: 12,
            width: 12,
            height: 6,
            properties: {
                title: 'Service capacity',
                view: 'timeSeries',
                stacked: false,
                metrics: [
                    ['Mapbox/ecs-cluster', 'DesiredCapacity', 'ServiceName', '${ServiceName}', 'ClusterName', '${Cluster}', { label: 'desired', stat: 'Minimum', period: 60 }],
                    ['.', 'RunningCapacity', '.', '.', '.', '.', { label: 'running', stat: 'Minimum', period: 60 }],
                    ['AWS/ApplicationELB', 'HealthyHostCount', 'TargetGroup', '${TargetGroupFullName}', 'LoadBalancer', '${LoadBalancerFullName}', { period: 60, stat: 'Minimum', label: 'healthy' }]
                ],
                region: '${AWS::Region}',
                period: 300,
                yAxis: {
                    left: {
                        min: 0
                    }
                }
            }
        });

        widgets.push({
            type: 'metric',
            x: 12,
            y: 12,
            width: 12,
            height: 6,
            properties: {
                title: 'Container utilization',
                view: 'timeSeries',
                stacked: false,
                metrics: [
                    ['AWS/ECS', 'CPUUtilization', 'ServiceName', '${ServiceName}', 'ClusterName', '${Cluster}', { label: 'cpu', period: 60 }],
                    ['.', 'MemoryUtilization', '.', '.', '.', '.', { label: 'memory', period: 60 }]
                ],
                region: '${AWS::Region}',
                period: 300,
                yAxis: {
                    left: {
                        min: 0,
                        max: 110
                    }
                }
            }
        });
    }

    if (opts.apache) {
        widgets.push({
            'type': 'log',
            'x': 0,
            'y': 18,
            'width': 24,
            'height': 6,
            'properties': {
                title: '5XX Requests',
                query: `
                    SOURCE '$\{Apache\}'
                    | fields @timestamp, @message | sort @timestamp desc
                    | parse @message '* - - [*] "* * *" * * "*" "*" "*"' as client, dateTimeString, httpVerb, url, protocol, statusCode, bytes, referer, userAgent, origIp
                    | filter statusCode >= "500" and statusCode <= 599
                    | display @timestamp, statusCode, httpVerb, url, userAgent, @log, @logStream
                `,
                region: '${AWS::Region}',
                stacked: false,
                view: 'table'
            }
        });

        widgets.push({
            'type': 'log',
            'x': 0,
            'y': 18,
            'width': 24,
            'height': 6,
            properties: {
                title: 'Recent Errors',
                'query': `
                    SOURCE '$\{Apache\}'
                        | fields @timestamp, @message
                        | sort @timestamp desc
                        | filter @message like /.*Error:.*/
                        | display @timestamp, @message, @log, @logStream
                `,
                'region': '${AWS::Region}',
                'stacked': false,
                'view': 'table'
            }
        });
    }

    return {
        widgets
    };
}
