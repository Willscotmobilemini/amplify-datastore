"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = __importStar(require("@aws-amplify/api"));
var auth_1 = require("@aws-amplify/auth");
var cache_1 = __importDefault(require("@aws-amplify/cache"));
var core_1 = require("@aws-amplify/core");
var pubsub_1 = require("@aws-amplify/pubsub");
var zen_observable_ts_1 = __importDefault(require("zen-observable-ts"));
var types_1 = require("../../types");
var utils_1 = require("../utils");
var predicates_1 = require("../../predicates");
var util_1 = require("../../util");
var errorMaps_1 = require("./errorMaps");
var logger = new core_1.ConsoleLogger('DataStore');
var CONTROL_MSG;
(function (CONTROL_MSG) {
    CONTROL_MSG["CONNECTED"] = "CONNECTED";
})(CONTROL_MSG = exports.CONTROL_MSG || (exports.CONTROL_MSG = {}));
var USER_CREDENTIALS;
(function (USER_CREDENTIALS) {
    USER_CREDENTIALS[USER_CREDENTIALS["none"] = 0] = "none";
    USER_CREDENTIALS[USER_CREDENTIALS["unauth"] = 1] = "unauth";
    USER_CREDENTIALS[USER_CREDENTIALS["auth"] = 2] = "auth";
})(USER_CREDENTIALS = exports.USER_CREDENTIALS || (exports.USER_CREDENTIALS = {}));
var SubscriptionProcessor = /** @class */ (function () {
    function SubscriptionProcessor(schema, syncPredicates, amplifyConfig, authModeStrategy, errorHandler, amplifyContext) {
        if (amplifyConfig === void 0) { amplifyConfig = {}; }
        if (amplifyContext === void 0) { amplifyContext = { Auth: auth_1.Auth, API: api_1.default, Cache: cache_1.default }; }
        this.schema = schema;
        this.syncPredicates = syncPredicates;
        this.amplifyConfig = amplifyConfig;
        this.authModeStrategy = authModeStrategy;
        this.errorHandler = errorHandler;
        this.amplifyContext = amplifyContext;
        this.typeQuery = new WeakMap();
        this.buffer = [];
    }
    SubscriptionProcessor.prototype.buildSubscription = function (namespace, model, transformerMutationType, userCredentials, cognitoTokenPayload, oidcTokenPayload, authMode) {
        var aws_appsync_authenticationType = this.amplifyConfig.aws_appsync_authenticationType;
        var _a = this.getAuthorizationInfo(model, userCredentials, aws_appsync_authenticationType, cognitoTokenPayload, oidcTokenPayload, authMode) || {}, isOwner = _a.isOwner, ownerField = _a.ownerField, ownerValue = _a.ownerValue;
        var _b = __read(utils_1.buildSubscriptionGraphQLOperation(namespace, model, transformerMutationType, isOwner, ownerField), 3), opType = _b[0], opName = _b[1], query = _b[2];
        return { authMode: authMode, opType: opType, opName: opName, query: query, isOwner: isOwner, ownerField: ownerField, ownerValue: ownerValue };
    };
    SubscriptionProcessor.prototype.getAuthorizationInfo = function (model, userCredentials, defaultAuthType, cognitoTokenPayload, oidcTokenPayload, authMode) {
        if (cognitoTokenPayload === void 0) { cognitoTokenPayload = {}; }
        if (oidcTokenPayload === void 0) { oidcTokenPayload = {}; }
        var rules = utils_1.getAuthorizationRules(model);
        // Return null if user doesn't have proper credentials for private API with IAM auth
        var iamPrivateAuth = authMode === api_1.GRAPHQL_AUTH_MODE.AWS_IAM &&
            rules.find(function (rule) { return rule.authStrategy === 'private' && rule.provider === 'iam'; });
        if (iamPrivateAuth && userCredentials === USER_CREDENTIALS.unauth) {
            return null;
        }
        // Group auth should take precedence over owner auth, so we are checking
        // if rule(s) have group authorization as well as if either the Cognito or
        // OIDC token has a groupClaim. If so, we are returning auth info before
        // any further owner-based auth checks.
        var groupAuthRules = rules.filter(function (rule) {
            return rule.authStrategy === 'groups' &&
                ['userPools', 'oidc'].includes(rule.provider);
        });
        var validGroup = (authMode === api_1.GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS ||
            authMode === api_1.GRAPHQL_AUTH_MODE.OPENID_CONNECT) &&
            groupAuthRules.find(function (groupAuthRule) {
                // validate token against groupClaim
                var cognitoUserGroups = utils_1.getUserGroupsFromToken(cognitoTokenPayload, groupAuthRule);
                var oidcUserGroups = utils_1.getUserGroupsFromToken(oidcTokenPayload, groupAuthRule);
                return __spread(cognitoUserGroups, oidcUserGroups).find(function (userGroup) {
                    return groupAuthRule.groups.find(function (group) { return group === userGroup; });
                });
            });
        if (validGroup) {
            return {
                authMode: authMode,
                isOwner: false,
            };
        }
        // Owner auth needs additional values to be returned in order to create the subscription with
        // the correct parameters so we are getting the owner value from the Cognito token via the
        // identityClaim from the auth rule.
        var cognitoOwnerAuthRules = authMode === api_1.GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
            ? rules.filter(function (rule) {
                return rule.authStrategy === 'owner' && rule.provider === 'userPools';
            })
            : [];
        var ownerAuthInfo;
        cognitoOwnerAuthRules.forEach(function (ownerAuthRule) {
            var ownerValue = cognitoTokenPayload[ownerAuthRule.identityClaim];
            if (ownerValue) {
                ownerAuthInfo = {
                    authMode: api_1.GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
                    isOwner: ownerAuthRule.areSubscriptionsPublic ? false : true,
                    ownerField: ownerAuthRule.ownerField,
                    ownerValue: ownerValue,
                };
            }
        });
        if (ownerAuthInfo) {
            return ownerAuthInfo;
        }
        // Owner auth needs additional values to be returned in order to create the subscription with
        // the correct parameters so we are getting the owner value from the OIDC token via the
        // identityClaim from the auth rule.
        var oidcOwnerAuthRules = authMode === api_1.GRAPHQL_AUTH_MODE.OPENID_CONNECT
            ? rules.filter(function (rule) { return rule.authStrategy === 'owner' && rule.provider === 'oidc'; })
            : [];
        oidcOwnerAuthRules.forEach(function (ownerAuthRule) {
            var ownerValue = oidcTokenPayload[ownerAuthRule.identityClaim];
            if (ownerValue) {
                ownerAuthInfo = {
                    authMode: api_1.GRAPHQL_AUTH_MODE.OPENID_CONNECT,
                    isOwner: ownerAuthRule.areSubscriptionsPublic ? false : true,
                    ownerField: ownerAuthRule.ownerField,
                    ownerValue: ownerValue,
                };
            }
        });
        if (ownerAuthInfo) {
            return ownerAuthInfo;
        }
        // Fallback: return authMode or default auth type
        return {
            authMode: authMode || defaultAuthType,
            isOwner: false,
        };
    };
    SubscriptionProcessor.prototype.hubQueryCompletionListener = function (completed, capsule) {
        var event = capsule.payload.event;
        if (event === pubsub_1.CONTROL_MSG.SUBSCRIPTION_ACK) {
            completed();
        }
    };
    SubscriptionProcessor.prototype.start = function () {
        var _this = this;
        var ctlObservable = new zen_observable_ts_1.default(function (observer) {
            var promises = [];
            // Creating subs for each model/operation combo so they can be unsubscribed
            // independently, since the auth retry behavior is asynchronous.
            var subscriptions = {};
            var cognitoTokenPayload, oidcTokenPayload;
            var userCredentials = USER_CREDENTIALS.none;
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var credentials, err_1, session, err_2, _a, aws_cognito_region, AuthConfig, token, federatedInfo, currentUser, payload, err_3;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.amplifyContext.Auth.currentCredentials()];
                        case 1:
                            credentials = _b.sent();
                            userCredentials = credentials.authenticated
                                ? USER_CREDENTIALS.auth
                                : USER_CREDENTIALS.unauth;
                            return [3 /*break*/, 3];
                        case 2:
                            err_1 = _b.sent();
                            return [3 /*break*/, 3];
                        case 3:
                            _b.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, this.amplifyContext.Auth.currentSession()];
                        case 4:
                            session = _b.sent();
                            cognitoTokenPayload = session.getIdToken().decodePayload();
                            return [3 /*break*/, 6];
                        case 5:
                            err_2 = _b.sent();
                            return [3 /*break*/, 6];
                        case 6:
                            _b.trys.push([6, 11, , 12]);
                            _a = this.amplifyConfig, aws_cognito_region = _a.aws_cognito_region, AuthConfig = _a.Auth;
                            if (!aws_cognito_region || (AuthConfig && !AuthConfig.region)) {
                                throw 'Auth is not configured';
                            }
                            token = void 0;
                            return [4 /*yield*/, this.amplifyContext.Cache.getItem('federatedInfo')];
                        case 7:
                            federatedInfo = _b.sent();
                            if (!federatedInfo) return [3 /*break*/, 8];
                            token = federatedInfo.token;
                            return [3 /*break*/, 10];
                        case 8: return [4 /*yield*/, this.amplifyContext.Auth.currentAuthenticatedUser()];
                        case 9:
                            currentUser = _b.sent();
                            if (currentUser) {
                                token = currentUser.token;
                            }
                            _b.label = 10;
                        case 10:
                            if (token) {
                                payload = token.split('.')[1];
                                oidcTokenPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
                            }
                            return [3 /*break*/, 12];
                        case 11:
                            err_3 = _b.sent();
                            logger.debug('error getting OIDC JWT', err_3);
                            return [3 /*break*/, 12];
                        case 12:
                            Object.values(this.schema.namespaces).forEach(function (namespace) {
                                Object.values(namespace.models)
                                    .filter(function (_a) {
                                    var syncable = _a.syncable;
                                    return syncable;
                                })
                                    .forEach(function (modelDefinition) { return __awaiter(_this, void 0, void 0, function () {
                                    var modelAuthModes, readAuthModes, operations, operationAuthModeAttempts, authModeRetry;
                                    var _a, _b, _c;
                                    var _this = this;
                                    return __generator(this, function (_d) {
                                        switch (_d.label) {
                                            case 0: return [4 /*yield*/, utils_1.getModelAuthModes({
                                                    authModeStrategy: this.authModeStrategy,
                                                    defaultAuthMode: this.amplifyConfig.aws_appsync_authenticationType,
                                                    modelName: modelDefinition.name,
                                                    schema: this.schema,
                                                })];
                                            case 1:
                                                modelAuthModes = _d.sent();
                                                readAuthModes = modelAuthModes.READ;
                                                subscriptions = __assign(__assign({}, subscriptions), (_a = {}, _a[modelDefinition.name] = (_b = {},
                                                    _b[utils_1.TransformerMutationType.CREATE] = [],
                                                    _b[utils_1.TransformerMutationType.UPDATE] = [],
                                                    _b[utils_1.TransformerMutationType.DELETE] = [],
                                                    _b), _a));
                                                operations = [
                                                    utils_1.TransformerMutationType.CREATE,
                                                    utils_1.TransformerMutationType.UPDATE,
                                                    utils_1.TransformerMutationType.DELETE,
                                                ];
                                                operationAuthModeAttempts = (_c = {},
                                                    _c[utils_1.TransformerMutationType.CREATE] = 0,
                                                    _c[utils_1.TransformerMutationType.UPDATE] = 0,
                                                    _c[utils_1.TransformerMutationType.DELETE] = 0,
                                                    _c);
                                                authModeRetry = function (operation) { return __awaiter(_this, void 0, void 0, function () {
                                                    var _a, transformerMutationType, opName, query, isOwner, ownerField, ownerValue, authMode, authToken, variables, userAgentSuffix, queryObservable, subscriptionReadyCallback;
                                                    var _this = this;
                                                    return __generator(this, function (_b) {
                                                        switch (_b.label) {
                                                            case 0:
                                                                _a = this.buildSubscription(namespace, modelDefinition, operation, userCredentials, cognitoTokenPayload, oidcTokenPayload, readAuthModes[operationAuthModeAttempts[operation]]), transformerMutationType = _a.opType, opName = _a.opName, query = _a.query, isOwner = _a.isOwner, ownerField = _a.ownerField, ownerValue = _a.ownerValue, authMode = _a.authMode;
                                                                return [4 /*yield*/, utils_1.getTokenForCustomAuth(authMode, this.amplifyConfig)];
                                                            case 1:
                                                                authToken = _b.sent();
                                                                variables = {};
                                                                if (isOwner) {
                                                                    if (!ownerValue) {
                                                                        observer.error('Owner field required, sign in is needed in order to perform this operation');
                                                                        return [2 /*return*/];
                                                                    }
                                                                    variables[ownerField] = ownerValue;
                                                                }
                                                                logger.debug("Attempting " + operation + " subscription with authMode: " + readAuthModes[operationAuthModeAttempts[operation]]);
                                                                userAgentSuffix = util_1.USER_AGENT_SUFFIX_DATASTORE;
                                                                queryObservable = this.amplifyContext.API.graphql(__assign(__assign({ query: query, variables: variables }, { authMode: authMode }), { authToken: authToken, userAgentSuffix: userAgentSuffix }));
                                                                subscriptions[modelDefinition.name][transformerMutationType].push(queryObservable
                                                                    .map(function (_a) {
                                                                    var value = _a.value;
                                                                    return value;
                                                                })
                                                                    .subscribe({
                                                                    next: function (_a) {
                                                                        var data = _a.data, errors = _a.errors;
                                                                        if (Array.isArray(errors) && errors.length > 0) {
                                                                            var messages = errors.map(function (_a) {
                                                                                var message = _a.message;
                                                                                return message;
                                                                            });
                                                                            logger.warn("Skipping incoming subscription. Messages: " + messages.join('\n'));
                                                                            _this.drainBuffer();
                                                                            return;
                                                                        }
                                                                        var predicatesGroup = predicates_1.ModelPredicateCreator.getPredicates(_this.syncPredicates.get(modelDefinition), false);
                                                                        var _b = data, _c = opName, record = _b[_c];
                                                                        // checking incoming subscription against syncPredicate.
                                                                        // once AppSync implements filters on subscriptions, we'll be
                                                                        // able to set these when establishing the subscription instead.
                                                                        // Until then, we'll need to filter inbound
                                                                        if (_this.passesPredicateValidation(record, predicatesGroup)) {
                                                                            _this.pushToBuffer(transformerMutationType, modelDefinition, record);
                                                                        }
                                                                        _this.drainBuffer();
                                                                    },
                                                                    error: function (subscriptionError) { return __awaiter(_this, void 0, void 0, function () {
                                                                        var _a, _b, _c, _d, message, e_1;
                                                                        return __generator(this, function (_e) {
                                                                            switch (_e.label) {
                                                                                case 0:
                                                                                    _a = subscriptionError.error, _b = __read((_a === void 0 ? {
                                                                                        errors: [],
                                                                                    } : _a).errors, 1), _c = _b[0], _d = (_c === void 0 ? {} : _c).message, message = _d === void 0 ? '' : _d;
                                                                                    if (message.includes(pubsub_1.CONTROL_MSG.REALTIME_SUBSCRIPTION_INIT_ERROR) ||
                                                                                        message.includes(pubsub_1.CONTROL_MSG.CONNECTION_FAILED)) {
                                                                                        // Unsubscribe and clear subscription array for model/operation
                                                                                        subscriptions[modelDefinition.name][transformerMutationType].forEach(function (subscription) { return subscription.unsubscribe(); });
                                                                                        subscriptions[modelDefinition.name][transformerMutationType] = [];
                                                                                        operationAuthModeAttempts[operation]++;
                                                                                        if (operationAuthModeAttempts[operation] >=
                                                                                            readAuthModes.length) {
                                                                                            // last auth mode retry. Continue with error
                                                                                            logger.debug(operation + " subscription failed with authMode: " + readAuthModes[operationAuthModeAttempts[operation] - 1]);
                                                                                        }
                                                                                        else {
                                                                                            // retry with different auth mode. Do not trigger
                                                                                            // observer error or error handler
                                                                                            logger.debug(operation + " subscription failed with authMode: " + readAuthModes[operationAuthModeAttempts[operation] - 1] + ". Retrying with authMode: " + readAuthModes[operationAuthModeAttempts[operation]]);
                                                                                            authModeRetry(operation);
                                                                                            return [2 /*return*/];
                                                                                        }
                                                                                    }
                                                                                    logger.warn('subscriptionError', message);
                                                                                    _e.label = 1;
                                                                                case 1:
                                                                                    _e.trys.push([1, 3, , 4]);
                                                                                    return [4 /*yield*/, this.errorHandler({
                                                                                            recoverySuggestion: 'Ensure app code is up to date, auth directives exist and are correct on each model, and that server-side data has not been invalidated by a schema change. If the problem persists, search for or create an issue: https://github.com/aws-amplify/amplify-js/issues',
                                                                                            localModel: null,
                                                                                            message: message,
                                                                                            model: modelDefinition.name,
                                                                                            operation: operation,
                                                                                            errorType: errorMaps_1.getSubscriptionErrorType(subscriptionError),
                                                                                            process: types_1.ProcessName.subscribe,
                                                                                            remoteModel: null,
                                                                                            cause: subscriptionError,
                                                                                        })];
                                                                                case 2:
                                                                                    _e.sent();
                                                                                    return [3 /*break*/, 4];
                                                                                case 3:
                                                                                    e_1 = _e.sent();
                                                                                    logger.error('Subscription error handler failed with:', e_1);
                                                                                    return [3 /*break*/, 4];
                                                                                case 4:
                                                                                    if (typeof subscriptionReadyCallback === 'function') {
                                                                                        subscriptionReadyCallback();
                                                                                    }
                                                                                    if (message.includes('"errorType":"Unauthorized"') ||
                                                                                        message.includes('"errorType":"OperationDisabled"')) {
                                                                                        return [2 /*return*/];
                                                                                    }
                                                                                    observer.error(message);
                                                                                    return [2 /*return*/];
                                                                            }
                                                                        });
                                                                    }); },
                                                                }));
                                                                promises.push((function () { return __awaiter(_this, void 0, void 0, function () {
                                                                    var boundFunction;
                                                                    var _this = this;
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0: return [4 /*yield*/, new Promise(function (res) {
                                                                                    subscriptionReadyCallback = res;
                                                                                    boundFunction = _this.hubQueryCompletionListener.bind(_this, res);
                                                                                    core_1.Hub.listen('api', boundFunction);
                                                                                })];
                                                                            case 1:
                                                                                _a.sent();
                                                                                core_1.Hub.remove('api', boundFunction);
                                                                                return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); })());
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); };
                                                operations.forEach(function (op) { return authModeRetry(op); });
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            });
                            Promise.all(promises).then(function () { return observer.next(CONTROL_MSG.CONNECTED); });
                            return [2 /*return*/];
                    }
                });
            }); })();
            return function () {
                Object.keys(subscriptions).forEach(function (modelName) {
                    subscriptions[modelName][utils_1.TransformerMutationType.CREATE].forEach(function (subscription) { return subscription.unsubscribe(); });
                    subscriptions[modelName][utils_1.TransformerMutationType.UPDATE].forEach(function (subscription) { return subscription.unsubscribe(); });
                    subscriptions[modelName][utils_1.TransformerMutationType.DELETE].forEach(function (subscription) { return subscription.unsubscribe(); });
                });
            };
        });
        var dataObservable = new zen_observable_ts_1.default(function (observer) {
            _this.dataObserver = observer;
            _this.drainBuffer();
            return function () {
                _this.dataObserver = null;
            };
        });
        return [ctlObservable, dataObservable];
    };
    SubscriptionProcessor.prototype.passesPredicateValidation = function (record, predicatesGroup) {
        if (!predicatesGroup) {
            return true;
        }
        var predicates = predicatesGroup.predicates, type = predicatesGroup.type;
        return util_1.validatePredicate(record, type, predicates);
    };
    SubscriptionProcessor.prototype.pushToBuffer = function (transformerMutationType, modelDefinition, data) {
        this.buffer.push([transformerMutationType, modelDefinition, data]);
    };
    SubscriptionProcessor.prototype.drainBuffer = function () {
        var _this = this;
        if (this.dataObserver) {
            this.buffer.forEach(function (data) { return _this.dataObserver.next(data); });
            this.buffer = [];
        }
    };
    return SubscriptionProcessor;
}());
exports.SubscriptionProcessor = SubscriptionProcessor;
//# sourceMappingURL=subscription.js.map