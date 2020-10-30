const cf = require('@mapbox/cloudfriend');

/**
 * Provide CloudFormation Based Metrics, Alarms, & Dashboards
 *
 * @param {Object} opts options object
 * @param {String} opts.prefix
 * @param {String} opts.email
 * @param {String|Object} opts.cluster
 * @param {String|Object} opts.service
 */
function main(opts = {}) {
    if (!opts.prefix) opts.prefix = '';

    const Resources = {};

    Resources[`${opts.prefix}AlarmTopic`] = {
        Type: 'AWS::SNS::Topic',
        Properties: {
            TopicName: cf.stackName,
            Subscription: [{
                Endpoint: opts.email,
                Protocol: 'email'
            }]
        }
    };

    Resources[`${opts.prefix}MemoryAlarm`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'MemoryUtilization', cf.region]),
            Namespace: 'AWS/ECS',
            MetricName: 'MemoryUtilization',
            ComparisonOperator: 'GreaterThanThreshold',
            Threshold: 80,
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: 'ClusterName',
                Value: opts.cluster
            }, {
                Name: 'ServiceName',
                Value: opts.service
            }]
        }
    }

    Resources[`${opts.prefix}CpuAlarm`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'CPUUtilization', cf.region]),
            Namespace: 'AWS/ECS',
            MetricName: 'CPUUtilization',
            ComparisonOperator: 'GreaterThanThreshold',
            Threshold: 80,
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: 'ClusterName',
                Value: opts.cluster
            },{
                Name: 'ServiceName',
                Value: opts.service
            }]
        }
    };

    return { Resources };
}

module.exports = main;
