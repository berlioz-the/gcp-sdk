const Promise = require('the-promise');
const _ = require('the-lodash');
const ndjson = require('ndjson')

class ResourceWatch
{
    constructor(logger, resourceAccessor, namespace, cb)
    {
        this._logger = logger;
        this._resourceAccessor = resourceAccessor;
        this._namespace = namespace;
        this._cb = cb;
        this._snapshot = {};
        this._recovering = false;
    }

    get logger() {
        return this._logger;
    }

    get name() {
        return this._resourceAccessor.kindName
    }

    start()
    {
        this._logger.info('[start] %s...', this.name);

        return this._runWatch();
    }

    _runWatch()
    {
        var uriParts = this._resourceAccessor._makeUriParts(this._namespace);
        var url = this._resourceAccessor._joinUrls(uriParts);

        var params = {
            watch: true
        }
        var stream = this._resourceAccessor._parent.request('GET', url, params, null, true);
        this._startRecoveryCountdown();

        stream
            .pipe(ndjson.parse())
            .on('data', (data) => {
                this._handleChange(data.type, data.object);
            })
            .on('finish', () => {
                this._logger.info('STREAM ::finish...');
            })
            .on('end', () => {
                this._logger.info('STREAM ::end...');
                this._tryReconnect();
            })
            .on('error', () => {
                this._logger.error('STREAM ::error...');
            })
            ;
        return stream;
    }

    _handleChange(action, data)
    {
        this._logger.info('[_handleChange] %s. %s :: %s...', this.name, action, data.metadata.name);

        if (this._recovering) {
            this._applyToSnapshot(this._newSnapshot, action, data);
            if (action == 'ADDED') {
                this._scheduleRecoveryTimer(100);
            } else {
                this._handleRecovery();
            }
        } else {
            this._applyToSnapshot(this._snapshot, action, data);
            this._cb(action, data);
        }
    }

    _applyToSnapshot(snapshot, action, data)
    {
        if (action == 'ADDED' || action == 'MODIFIED') {
            snapshot[data.metadata.name] = data;
            return;
        }
        if (action == 'DELETED') {
            delete snapshot[data.metadata.name];
            return;
        }
        throw new Error("Unknown action: " + action);
    }

    _tryReconnect()
    {
        this._logger.info('[_tryReconnect] %s...', this.name);
        this._recovering = true;
        this._newSnapshot = {};
        this._runWatch();
    }

    _startRecoveryCountdown()
    {
        if (!this._recovering) {
            return;
        }
        this._logger.info('[_startRecoveryCountdown] %s...', this.name);
        this._scheduleRecoveryTimer(1000);
    }

    _scheduleRecoveryTimer(duration)
    {
        this._logger.silly('[_scheduleRecoveryTimer] %s. timeout: %s...', this.name, duration);
        this._stopTimer();
        this._recoveryTimeout = setTimeout(this._handleRecovery.bind(this), duration);
    }

    _handleRecovery()
    {
        this._logger.info('[_handleRecovery] %s...', this.name);
        this._stopTimer();

        this._logger.silly('[_handleRecovery] %s. Snapshot: ', this.name, this._snapshot);
        this._logger.silly('[_handleRecovery] %s. NewSnapshot: ', this.name, this._newSnapshot);

        var delta = this._produceDelta(this._snapshot, this._newSnapshot);
        this._logger.info('[_handleRecovery] %s. delta: ', this.name, delta);

        for(var x of delta) {
            this._applyToSnapshot(this._snapshot, x.action, x.data);
            this._cb(x.action, x.data);
        }

        var finalDelta = this._produceDelta(this._snapshot, this._newSnapshot);
        if (finalDelta.length > 0) {
            this._logger.info('[_handleRecovery] %s. FINAL delta. should be zero: ', this.name, finalDelta);
            throw new Error("Final Delta After Recover Should Be Empty!");
        }

        this._recovering = false;
        this._newSnapshot = null;
        
        this._logger.info('[_handleRecovery] %s recovery completed.', this.name);
    }

    _stopTimer()
    {
        if (this._recoveryTimeout) {
            clearTimeout(this._recoveryTimeout);
            this._recoveryTimeout = null;
        }
    }

    _produceDelta(current, desired)
    {
        var delta = [];
        for(var x of _.keys(current)) {
            if (x in desired) {
                if (!_.fastDeepEqual(current[x], desired[x])) {
                    delta.push({
                        action: 'MODIFIED',
                        data: _.cloneDeep(desired[x])
                    });
                }
            } else {
                delta.push({
                    action: 'DELETED',
                    data: _.cloneDeep(current[x])
                });
            }
        }
        for(var x of _.keys(desired)) {
            if (!(x in current)) {
                delta.push({
                    action: 'ADDED',
                    data: _.cloneDeep(desired[x])
                });
            }
        }
        return delta;
    }
}

module.exports = ResourceWatch;