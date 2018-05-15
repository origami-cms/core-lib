import {Color} from 'colors';


export type LogType = 'log' | 'error' | 'success' | 'info';


const _log = (type: LogType, object: string, ...rest: any[]) => {
    let icon = 'ℹ️';
    const obj = object ? `.${object}` : '';
    let color: keyof String = 'magenta';

    switch (type) {
        case 'error':
            icon = '❌';
            color = 'red';
            break;
        case 'success':
            if (!process.env.LOG_VERBOSE) return;
            icon = '✅';
            color = 'green';
            break;
        case 'info':
            if (!process.env.LOG_VERBOSE) return;
            icon = 'ℹ️';
            color = 'blue';
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
export const error = (objOrError: Error | string, error?: Error | string) => {
    if (objOrError instanceof Error) _log('error', objOrError.message.red);
    else if (error instanceof Error) _log('error', objOrError, error.message.red);
    else if (error) _log('error', objOrError, error.red);
};
