// Converts array of strings into object of symbols
module.exports.symbols = arr =>
    arr.reduce((o, i) => {
        o[i] = Symbol(i);

        return o;
    }, {});


module.exports.requireKeys = (arr, obj) => {
    arr.forEach(i => {
        if (!Object.keys(obj).includes(i)) {
            const e = new Error(`Missing key ${i}`);
            e.key = i;
            throw e;
        }
    });
};

const log = (type, object, ...rest) => {
    let icon = 'ℹ️';
    let obj = object ? `.${object}` : '';
    let color = 'magenta';

    switch (type) {
        case 'error':
            icon = '❌';
            color = 'red';
            break;
        case 'success':
            icon = '✅';
            color = 'green';
            break;
        case 'info':
            icon = 'ℹ️';
            color = 'blue';
            break;
    }

    console.log(
        icon,
        ` Origami${obj}:`[color],
        ...rest
    );
}

module.exports.success = (...message) => log('success', ...message);
module.exports.info = (...message) => log('info', ...message);
module.exports.log = (...message) => log('log', ...message);
module.exports.error = (objOrError, error) => {
    if (objOrError.message) log('error', objOrError.message.red);
    else log('error', objOrError, error.message.red);
}
