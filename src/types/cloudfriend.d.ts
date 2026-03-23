declare module '@openaddresses/cloudfriend' {
    type CFValue = string | object;

    interface CloudFriend {
        /** Current AWS Stack Name intrinsic */
        stackName: object;
        /** Current AWS Region pseudo-parameter */
        region: object;
        /** Joins a list of values into a single string with the given delimiter */
        join(delimiter: string, values: CFValue[]): object;
        /** Returns the value of the named resource */
        ref(resource: string): object;
        /** Substitutes variables in a string template */
        sub(template: string, variables?: Record<string, CFValue | undefined>): object;
        /** Merges multiple CloudFormation template fragments */
        merge(...templates: object[]): object;
        [key: string]: unknown;
    }

    const cf: CloudFriend;
    export default cf;
}
