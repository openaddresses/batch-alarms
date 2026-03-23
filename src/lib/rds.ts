import cf from '@openaddresses/cloudfriend';
import rdsDashboard from './rds-dashboard.js';
import type { RDSDashboardOpts } from './rds-dashboard.js';
import type { CFFragment } from './elb.js';

/** Options for constructing RDS alarms and dashboard */
export interface RDSOpts extends RDSDashboardOpts {
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
 * for an RDS instance or Aurora cluster.
 *
 * @remarks
 * Exactly one of `email` or `topic` must be provided when alarm notifications are
 * desired.  Passing both will throw an error.
 *
 * @example
 * ```ts
 * import { RDS } from '@openaddresses/batch-alarms';
 *
 * const fragment = RDS({
 *   prefix: 'Db',
 *   email: 'ops@example.com',
 *   instance: cf.ref('DBInstance'),
 * });
 * ```
 *
 * @param opts - RDS alarm configuration options
 * @returns CloudFormation fragment containing alarm and dashboard resources
 */
export default function RDS(opts: RDSOpts = {}): CFFragment {
    if (!opts.prefix) opts.prefix = '';
    if (opts.dashboard === undefined) opts.dashboard = true;

    const Resources: Record<string, object> = {};

    if (opts.topic && opts.email) throw new Error('Topic & Email options cannot be used together');

    if (!opts.topic) {
        Resources[`${opts.prefix}AlarmTopic`] = {
            Type: 'AWS::SNS::Topic',
            Properties: {
                TopicName: cf.join('-', [cf.stackName, 'topic']),
                Subscription: [{
                    Endpoint: opts.email,
                    Protocol: 'email'
                }]
            }
        };
    }

    Resources[`${opts.prefix}DBCpuAlarm`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'DBCPUUtilization', cf.region]),
            Namespace: 'AWS/RDS',
            MetricName: 'CPUUtilization',
            ComparisonOperator: 'GreaterThanThreshold',
            Threshold: 80,
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [opts.topic ? opts.topic : cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [opts.topic ? opts.topic : cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: opts.instance ? 'DBInstanceIdentifier' : 'DBClusterIdentifier',
                Value: opts.instance ? opts.instance : opts.cluster
            }]
        }
    };

    Resources[`${opts.prefix}DBFreeStorage`] = {
        Type: 'AWS::CloudWatch::Alarm',
        Properties: {
            AlarmName: cf.join('-', [cf.stackName, 'DBFreeStorage', cf.region]),
            Namespace: 'AWS/RDS',
            MetricName: 'FreeStorageSpace',
            ComparisonOperator: 'LessThanThreshold',
            Threshold: 10737418240, // 10 GB
            EvaluationPeriods: 10,
            Statistic: 'Average',
            Period: 60,
            AlarmActions: [opts.topic ? opts.topic : cf.ref(`${opts.prefix}AlarmTopic`)],
            InsufficientDataActions: [opts.topic ? opts.topic : cf.ref(`${opts.prefix}AlarmTopic`)],
            Dimensions: [{
                Name: opts.instance ? 'DBInstanceIdentifier' : 'DBClusterIdentifier',
                Value: opts.instance ? opts.instance : opts.cluster
            }]
        }
    };

    if (opts.dashboard) {
        Resources[`${opts.prefix}DBDashboard`] = {
            Type: 'AWS::CloudWatch::Dashboard',
            Properties: {
                DashboardName: cf.sub('${AWS::StackName}-${AWS::Region}-db'),
                DashboardBody: cf.sub(JSON.stringify(rdsDashboard(opts)), {
                    Instance: opts.instance,
                    Cluster: opts.cluster
                })
            }
        };
    }

    return { Resources };
}
