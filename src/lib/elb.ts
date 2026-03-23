import cf from '@openaddresses/cloudfriend';
import elbDashboard from './elb-dashboard.js';
import type { ELBDashboardOpts } from './elb-dashboard.js';

/** CloudFormation fragment returned by all alarm builders */
export interface CFFragment {
    Resources: Record<string, object>;
}

/** Options for constructing ELB alarms and dashboard */
export interface ELBOpts extends ELBDashboardOpts {
    /**
     * CloudFormation resource name prefix applied to every generated resource.
     * @defaultValue `''`
     */
    prefix?: string;
    /** Email address to receive alarm notifications (mutually exclusive with `topic`) */
    email?: string;
    /** Existing SNS topic ARN or CF Ref/Att to route alarm notifications to (mutually exclusive with `email`) */
    topic?: string | object;
    /**
     * When `true` a `AWS::CloudWatch::Dashboard` resource is included in the output.
     * @defaultValue `true`
     */
    dashboard?: boolean;
}

/**
 * Generates CloudFormation resources providing metrics, alarms, and a dashboard
 * for an ECS-backed Application Load Balancer.
 *
 * @remarks
 * Exactly one of `email` or `topic` must be provided when alarm notifications are
 * desired.  Passing both will throw an error.  Omitting both will silence alarm
 * actions.
 *
 * @example
 * ```ts
 * import { ELB } from '@openaddresses/batch-alarms';
 *
 * const fragment = ELB({
 *   prefix: 'Api',
 *   email: 'ops@example.com',
 *   loadbalancer: cf.ref('LoadBalancer'),
 *   targetgroup: cf.ref('TargetGroup'),
 *   cluster: cf.ref('Cluster'),
 *   service: cf.ref('Service'),
 * });
 * ```
 *
 * @param opts - ELB alarm configuration options
 * @returns CloudFormation fragment containing alarm and dashboard resources
 */
export default function ELB(opts: ELBOpts = {}): CFFragment {
    if (!opts.prefix) opts.prefix = '';
    if (opts.dashboard === undefined) opts.dashboard = true;

    const Resources: Record<string, object> = {};

    if (opts.topic && opts.email) throw new Error('Topic & Email options cannot be used together');

    if (!opts.topic && opts.email) {
        Resources[`${opts.prefix}AlarmTopic`] = {
            Type: 'AWS::SNS::Topic',
            Properties: {
                TopicName: cf.join('-', [cf.stackName, 'topic', `${opts.prefix.toLowerCase()}`]),
                Subscription: [{
                    Endpoint: opts.email,
                    Protocol: 'email'
                }]
            }
        };

        opts.topic = cf.ref(`${opts.prefix}AlarmTopic`);
    }

    if (opts.cluster && opts.service) {
        Resources[`${opts.prefix}MemoryAlarm`] = {
            Type: 'AWS::CloudWatch::Alarm',
            Properties: {
                AlarmName: cf.join('-', [cf.stackName, 'MemoryUtilization', cf.region, `${opts.prefix.toLowerCase()}`]),
                Namespace: 'AWS/ECS',
                MetricName: 'MemoryUtilization',
                ComparisonOperator: 'GreaterThanThreshold',
                Threshold: 80,
                EvaluationPeriods: 10,
                Statistic: 'Average',
                Period: 60,
                AlarmActions: opts.topic ? [opts.topic] : [],
                InsufficientDataActions: opts.topic ? [opts.topic] : [],
                Dimensions: [{
                    Name: 'ClusterName',
                    Value: opts.cluster
                }, {
                    Name: 'ServiceName',
                    Value: opts.service
                }]
            }
        };

        Resources[`${opts.prefix}CpuAlarm`] = {
            Type: 'AWS::CloudWatch::Alarm',
            Properties: {
                AlarmName: cf.join('-', [cf.stackName, 'CPUUtilization', cf.region, `${opts.prefix.toLowerCase()}`]),
                Namespace: 'AWS/ECS',
                MetricName: 'CPUUtilization',
                ComparisonOperator: 'GreaterThanThreshold',
                Threshold: 80,
                EvaluationPeriods: 10,
                Statistic: 'Average',
                Period: 60,
                AlarmActions: opts.topic ? [opts.topic] : [],
                InsufficientDataActions: opts.topic ? [opts.topic] : [],
                Dimensions: [{
                    Name: 'ClusterName',
                    Value: opts.cluster
                }, {
                    Name: 'ServiceName',
                    Value: opts.service
                }]
            }
        };
    }

    Resources[`${opts.prefix}AlarmHTTPCodeELB5XX`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeELB5XX', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'HTTPCode_ELB_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60,
            EvaluationPeriods: 2,
            Threshold: 1,
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            TreatMissingData: 'notBreaching',
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    Resources[`${opts.prefix}AlarmHTTPCodeBackend5XX`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeBackend5XX', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'HTTPCode_Target_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60,
            EvaluationPeriods: 2,
            Threshold: 1,
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            TreatMissingData: 'notBreaching',
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    Resources[`${opts.prefix}AlarmHTTPCodeBackend5XXDuration`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmHTTPCodeBackend5XXDuration', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'HTTPCode_Target_5XX_Count',
            Namespace: 'AWS/ApplicationELB',
            Statistic: 'Sum',
            Period: 60 * 5,
            EvaluationPeriods: 20 / 5,
            Threshold: 5,
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            TreatMissingData: 'notBreaching',
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    Resources[`${opts.prefix}AlarmP99Latency`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'AlarmP99Latency', cf.region, `${opts.prefix.toLowerCase()}`]),
            MetricName: 'TargetResponseTime',
            Namespace: 'AWS/ApplicationELB',
            ExtendedStatistic: 'p99',
            Period: '60',
            EvaluationPeriods: '5',
            Threshold: '10',
            AlarmActions: opts.topic ? [opts.topic] : [],
            InsufficientDataActions: opts.topic ? [opts.topic] : [],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: opts.loadbalancer
            }],
            ComparisonOperator: 'GreaterThanThreshold'
        }
    };

    if (opts.dashboard) {
        Resources[`${opts.prefix}Dashboard`] = {
            Type: 'AWS::CloudWatch::Dashboard',
            Properties: {
                DashboardName: cf.sub('${AWS::StackName}-${AWS::Region}-' + opts.prefix.toLowerCase()),
                DashboardBody: cf.sub(JSON.stringify(elbDashboard(opts)), {
                    LoadBalancerFullName: opts.loadbalancer,
                    TargetGroupFullName: opts.targetgroup,
                    Apache: opts.apache,
                    ServiceName: opts.service,
                    Cluster: opts.cluster
                })
            }
        };
    }

    return { Resources };
}
