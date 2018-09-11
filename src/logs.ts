import {Color} from 'colors';
import symbols from 'log-symbols';

export type LogType = 'log' | 'error' | 'success' | 'info' | 'warn';


const _log = (type: LogType, object: string, ...rest: any[]) => {
    let icon = symbols.info;
    const obj = object ? `.${object}` : '';
    let color: keyof String = 'magenta';

    switch (type) {
        case 'error':
            icon = symbols.error;
            color = 'red';
            break;
        case 'success':
            if (!process.env.LOG_VERBOSE) return;
            icon = symbols.success;
            color = 'green';
            break;
        case 'info':
            if (!process.env.LOG_VERBOSE) return;
            icon = symbols.info;
            color = 'blue';
            break;
        case 'warn':
            icon = symbols.warning;
            color = 'yellow';
            break;
    }

    console.log(
        icon,
        ` Origami${obj}:`[color],
        ...rest
    );
};


export const success = (object: string, ...message: any[]) => _log('success', object, ...message);
export const info = (object: string, ...message: any[]) => _log('info', object, ...message);
export const log = (object: string, ...message: any[]) => _log('log', object, ...message);
export const warn = (object: string, ...message: any[]) => _log('warn', object, ...message);
export const error = (objOrError: Error | string, error?: Error | string) => {
    if (objOrError instanceof Error) _log('error', objOrError.message.red);
    else if (error instanceof Error) _log('error', objOrError, error.message.red);
    else if (error) _log('error', objOrError, error.red);
};
