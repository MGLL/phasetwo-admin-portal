import * as React from 'react';

declare const l18nMsg: {[key: string]: string};

export interface MsgProps {
    readonly msgKey: string;
    readonly params?: string[];
    readonly children?: React.ReactNode;
}

export class Msg extends React.Component<MsgProps> {

    public constructor(props: MsgProps) {
        super(props);
    }

    public render(): React.ReactNode {
        if (this.props.children) {
            return Msg.localizeWithChildren(this.props.msgKey, this.props.children);
        }
        return (
            <React.Fragment>{Msg.localize(this.props.msgKey, this.props.params)}</React.Fragment>
        );
    }

    private static localizeWithChildren(msgKey: string, children: React.ReactNode): React.ReactNode {
        const message: string = l18nMsg[this.processKey(msgKey)];
        const parts = message.split(/\{\{param_\d*}}/);
        const count = React.Children.count(children);
        return React.Children.map(children, (child, i) =>
            [parts[i], child, count === i + 1 ? parts[count] : '']
        );
    }

    public static localize(msgKey: string, params?: string[]): string {
        let message: string = l18nMsg[this.processKey(msgKey)];
        if (message === undefined) message = msgKey;

        if ((params !== undefined) && (params.length > 0)) {
            params.forEach((value: string, index: number) => {
                value = this.processParam(value);
                message = message.replace('{{param_'+ index + '}}', value);
            })
        }

        return message;
    }

    // if the message key has Freemarker syntax, remove it
    private static processKey(msgKey: string): string {
        if (!(msgKey.startsWith('${') && msgKey.endsWith('}'))) return msgKey;

        // remove Freemarker syntax
        return msgKey.substring(2, msgKey.length - 1);
    }

    // if the param has Freemarker syntax, try to look up its value
    private static processParam(param: string): string {
        if (!(param.startsWith('${') && param.endsWith('}'))) return param;

        // remove Freemarker syntax
        const key: string = param.substring(2, param.length - 1);

        let value: string = l18nMsg[key];
        if (value === undefined) return param;

        return value;
    }
}