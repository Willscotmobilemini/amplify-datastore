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
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api-graphql';
import { GraphQLAuthError } from '@aws-amplify/api';
import { Logger } from '@aws-amplify/core';
import { isEnumFieldType, isGraphQLScalarType, isPredicateObj, isSchemaModel, isTargetNameAssociation, isNonModelFieldType, OpType, ModelOperation, } from '../types';
import { exhaustiveCheck } from '../util';
var logger = new Logger('DataStore');
var GraphQLOperationType;
(function (GraphQLOperationType) {
    GraphQLOperationType["LIST"] = "query";
    GraphQLOperationType["CREATE"] = "mutation";
    GraphQLOperationType["UPDATE"] = "mutation";
    GraphQLOperationType["DELETE"] = "mutation";
    GraphQLOperationType["GET"] = "query";
})(GraphQLOperationType || (GraphQLOperationType = {}));
export var TransformerMutationType;
(function (TransformerMutationType) {
    TransformerMutationType["CREATE"] = "Create";
    TransformerMutationType["UPDATE"] = "Update";
    TransformerMutationType["DELETE"] = "Delete";
    TransformerMutationType["GET"] = "Get";
})(TransformerMutationType || (TransformerMutationType = {}));
var dummyMetadata = {
    _version: undefined,
    _lastChangedAt: undefined,
    _deleted: undefined,
};
var metadataFields = (Object.keys(dummyMetadata));
export function getMetadataFields() {
    return metadataFields;
}
export function generateSelectionSet(namespace, modelDefinition) {
    var scalarFields = getScalarFields(modelDefinition);
    var nonModelFields = getNonModelFields(namespace, modelDefinition);
    var implicitOwnerField = getImplicitOwnerField(modelDefinition, scalarFields);
    var scalarAndMetadataFields = Object.values(scalarFields)
        .map(function (_a) {
        var name = _a.name;
        return name;
    })
        .concat(implicitOwnerField)
        .concat(nonModelFields);
    if (isSchemaModel(modelDefinition)) {
        scalarAndMetadataFields = scalarAndMetadataFields
            .concat(getMetadataFields())
            .concat(getConnectionFields(modelDefinition));
    }
    var result = scalarAndMetadataFields.join('\n');
    return result;
}
function getImplicitOwnerField(modelDefinition, scalarFields) {
    var ownerFields = getOwnerFields(modelDefinition);
    if (!scalarFields.owner && ownerFields.includes('owner')) {
        return ['owner'];
    }
    return [];
}
function getOwnerFields(modelDefinition) {
    var ownerFields = [];
    if (isSchemaModel(modelDefinition) && modelDefinition.attributes) {
        modelDefinition.attributes.forEach(function (attr) {
            if (attr.properties && attr.properties.rules) {
                var rule = attr.properties.rules.find(function (rule) { return rule.allow === 'owner'; });
                if (rule && rule.ownerField) {
                    ownerFields.push(rule.ownerField);
                }
            }
        });
    }
    return ownerFields;
}
function getScalarFields(modelDefinition) {
    var fields = modelDefinition.fields;
    var result = Object.values(fields)
        .filter(function (field) {
        if (isGraphQLScalarType(field.type) || isEnumFieldType(field.type)) {
            return true;
        }
        return false;
    })
        .reduce(function (acc, field) {
        acc[field.name] = field;
        return acc;
    }, {});
    return result;
}
function getConnectionFields(modelDefinition) {
    var result = [];
    Object.values(modelDefinition.fields)
        .filter(function (_a) {
        var association = _a.association;
        return association && Object.keys(association).length;
    })
        .forEach(function (_a) {
        var name = _a.name, association = _a.association;
        var connectionType = association.connectionType;
        switch (connectionType) {
            case 'HAS_ONE':
            case 'HAS_MANY':
                // Intentionally blank
                break;
            case 'BELONGS_TO':
                if (isTargetNameAssociation(association)) {
                    result.push(name + " { id _deleted }");
                }
                break;
            default:
                exhaustiveCheck(connectionType);
        }
    });
    return result;
}
function getNonModelFields(namespace, modelDefinition) {
    var result = [];
    Object.values(modelDefinition.fields).forEach(function (_a) {
        var name = _a.name, type = _a.type;
        if (isNonModelFieldType(type)) {
            var typeDefinition = namespace.nonModels[type.nonModel];
            var scalarFields = Object.values(getScalarFields(typeDefinition)).map(function (_a) {
                var name = _a.name;
                return name;
            });
            var nested_1 = [];
            Object.values(typeDefinition.fields).forEach(function (field) {
                var type = field.type, name = field.name;
                if (isNonModelFieldType(type)) {
                    var typeDefinition_1 = namespace.nonModels[type.nonModel];
                    nested_1.push(name + " { " + generateSelectionSet(namespace, typeDefinition_1) + " }");
                }
            });
            result.push(name + " { " + scalarFields.join(' ') + " " + nested_1.join(' ') + " }");
        }
    });
    return result;
}
export function getAuthorizationRules(modelDefinition) {
    // Searching for owner authorization on attributes
    var authConfig = []
        .concat(modelDefinition.attributes)
        .find(function (attr) { return attr && attr.type === 'auth'; });
    var _a = (authConfig || {}).properties, _b = (_a === void 0 ? {} : _a).rules, rules = _b === void 0 ? [] : _b;
    var resultRules = [];
    // Multiple rules can be declared for allow: owner
    rules.forEach(function (rule) {
        // setting defaults for backwards compatibility with old cli
        var _a = rule.identityClaim, identityClaim = _a === void 0 ? 'cognito:username' : _a, _b = rule.ownerField, ownerField = _b === void 0 ? 'owner' : _b, _c = rule.operations, operations = _c === void 0 ? ['create', 'update', 'delete', 'read'] : _c, _d = rule.provider, provider = _d === void 0 ? 'userPools' : _d, _e = rule.groupClaim, groupClaim = _e === void 0 ? 'cognito:groups' : _e, _f = rule.allow, authStrategy = _f === void 0 ? 'iam' : _f, _g = rule.groups, groups = _g === void 0 ? [] : _g;
        var isReadAuthorized = operations.includes('read');
        var isOwnerAuth = authStrategy === 'owner';
        if (!isReadAuthorized && !isOwnerAuth) {
            return;
        }
        var authRule = {
            identityClaim: identityClaim,
            ownerField: ownerField,
            provider: provider,
            groupClaim: groupClaim,
            authStrategy: authStrategy,
            groups: groups,
            areSubscriptionsPublic: false,
        };
        if (isOwnerAuth) {
            // look for the subscription level override
            // only pay attention to the public level
            var modelConfig = []
                .concat(modelDefinition.attributes)
                .find(function (attr) { return attr && attr.type === 'model'; });
            // find the subscriptions level. ON is default
            var _h = (modelConfig || {}).properties, _j = (_h === void 0 ? {} : _h).subscriptions, _k = (_j === void 0 ? {} : _j).level, level = _k === void 0 ? 'on' : _k;
            // treat subscriptions as public for owner auth with unprotected reads
            // when `read` is omitted from `operations`
            authRule.areSubscriptionsPublic =
                !operations.includes('read') || level === 'public';
        }
        if (isOwnerAuth) {
            // owner rules has least priority
            resultRules.push(authRule);
            return;
        }
        resultRules.unshift(authRule);
    });
    return resultRules;
}
export function buildSubscriptionGraphQLOperation(namespace, modelDefinition, transformerMutationType, isOwnerAuthorization, ownerField) {
    var selectionSet = generateSelectionSet(namespace, modelDefinition);
    var typeName = modelDefinition.name, pluralTypeName = modelDefinition.pluralName;
    var opName = "on" + transformerMutationType + typeName;
    var docArgs = '';
    var opArgs = '';
    if (isOwnerAuthorization) {
        docArgs = "($" + ownerField + ": String!)";
        opArgs = "(" + ownerField + ": $" + ownerField + ")";
    }
    return [
        transformerMutationType,
        opName,
        "subscription operation" + docArgs + "{\n\t\t\t" + opName + opArgs + "{\n\t\t\t\t" + selectionSet + "\n\t\t\t}\n\t\t}",
    ];
}
export function buildGraphQLOperation(namespace, modelDefinition, graphQLOpType) {
    var selectionSet = generateSelectionSet(namespace, modelDefinition);
    var typeName = modelDefinition.name, pluralTypeName = modelDefinition.pluralName;
    var operation;
    var documentArgs = ' ';
    var operationArgs = ' ';
    var transformerMutationType;
    switch (graphQLOpType) {
        case 'LIST':
            operation = "sync" + pluralTypeName;
            documentArgs = "($limit: Int, $nextToken: String, $lastSync: AWSTimestamp, $filter: Model" + typeName + "FilterInput)";
            operationArgs =
                '(limit: $limit, nextToken: $nextToken, lastSync: $lastSync, filter: $filter)';
            selectionSet = "items {\n\t\t\t\t\t\t\t" + selectionSet + "\n\t\t\t\t\t\t}\n\t\t\t\t\t\tnextToken\n\t\t\t\t\t\tstartedAt";
            break;
        case 'CREATE':
            operation = "create" + typeName;
            documentArgs = "($input: Create" + typeName + "Input!)";
            operationArgs = '(input: $input)';
            transformerMutationType = TransformerMutationType.CREATE;
            break;
        case 'UPDATE':
            operation = "update" + typeName;
            documentArgs = "($input: Update" + typeName + "Input!, $condition: Model" + typeName + "ConditionInput)";
            operationArgs = '(input: $input, condition: $condition)';
            transformerMutationType = TransformerMutationType.UPDATE;
            break;
        case 'DELETE':
            operation = "delete" + typeName;
            documentArgs = "($input: Delete" + typeName + "Input!, $condition: Model" + typeName + "ConditionInput)";
            operationArgs = '(input: $input, condition: $condition)';
            transformerMutationType = TransformerMutationType.DELETE;
            break;
        case 'GET':
            operation = "get" + typeName;
            documentArgs = "($id: ID!)";
            operationArgs = '(id: $id)';
            transformerMutationType = TransformerMutationType.GET;
            break;
        default:
            exhaustiveCheck(graphQLOpType);
    }
    return [
        [
            transformerMutationType,
            operation,
            GraphQLOperationType[graphQLOpType] + " operation" + documentArgs + "{\n\t\t" + operation + operationArgs + "{\n\t\t\t" + selectionSet + "\n\t\t}\n\t}",
        ],
    ];
}
export function createMutationInstanceFromModelOperation(relationships, modelDefinition, opType, model, element, condition, MutationEventConstructor, modelInstanceCreator, id) {
    var operation;
    switch (opType) {
        case OpType.INSERT:
            operation = TransformerMutationType.CREATE;
            break;
        case OpType.UPDATE:
            operation = TransformerMutationType.UPDATE;
            break;
        case OpType.DELETE:
            operation = TransformerMutationType.DELETE;
            break;
        default:
            exhaustiveCheck(opType);
    }
    // stringify nested objects of type AWSJSON
    // this allows us to return parsed JSON to users (see `castInstanceType()` in datastore.ts),
    // but still send the object correctly over the wire
    var replacer = function (k, v) {
        var isAWSJSON = k &&
            v !== null &&
            typeof v === 'object' &&
            modelDefinition.fields[k] &&
            modelDefinition.fields[k].type === 'AWSJSON';
        if (isAWSJSON) {
            return JSON.stringify(v);
        }
        return v;
    };
    var mutationEvent = modelInstanceCreator(MutationEventConstructor, __assign(__assign({}, (id ? { id: id } : {})), { data: JSON.stringify(element, replacer), modelId: element.id, model: model.name, operation: operation, condition: JSON.stringify(condition) }));
    return mutationEvent;
}
export function predicateToGraphQLCondition(predicate) {
    var result = {};
    if (!predicate || !Array.isArray(predicate.predicates)) {
        return result;
    }
    predicate.predicates.forEach(function (p) {
        var _a;
        if (isPredicateObj(p)) {
            var field = p.field, operator = p.operator, operand = p.operand;
            if (field === 'id') {
                return;
            }
            result[field] = (_a = {}, _a[operator] = operand, _a);
        }
        else {
            result[p.type] = predicateToGraphQLCondition(p);
        }
    });
    return result;
}
export function predicateToGraphQLFilter(predicatesGroup) {
    var result = {};
    if (!predicatesGroup || !Array.isArray(predicatesGroup.predicates)) {
        return result;
    }
    var type = predicatesGroup.type, predicates = predicatesGroup.predicates;
    var isList = type === 'and' || type === 'or';
    result[type] = isList ? [] : {};
    var appendToFilter = function (value) {
        return isList ? result[type].push(value) : (result[type] = value);
    };
    predicates.forEach(function (predicate) {
        var _a, _b;
        if (isPredicateObj(predicate)) {
            var field = predicate.field, operator = predicate.operator, operand = predicate.operand;
            var gqlField = (_a = {},
                _a[field] = (_b = {}, _b[operator] = operand, _b),
                _a);
            appendToFilter(gqlField);
            return;
        }
        appendToFilter(predicateToGraphQLFilter(predicate));
    });
    return result;
}
export function getUserGroupsFromToken(token, rule) {
    // validate token against groupClaim
    var userGroups = token[rule.groupClaim] || [];
    if (typeof userGroups === 'string') {
        var parsedGroups = void 0;
        try {
            parsedGroups = JSON.parse(userGroups);
        }
        catch (e) {
            parsedGroups = userGroups;
        }
        userGroups = [].concat(parsedGroups);
    }
    return userGroups;
}
export function getModelAuthModes(_a) {
    var authModeStrategy = _a.authModeStrategy, defaultAuthMode = _a.defaultAuthMode, modelName = _a.modelName, schema = _a.schema;
    return __awaiter(this, void 0, void 0, function () {
        var operations, modelAuthModes, error_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    operations = Object.values(ModelOperation);
                    modelAuthModes = {
                        CREATE: [],
                        READ: [],
                        UPDATE: [],
                        DELETE: [],
                    };
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all(operations.map(function (operation) { return __awaiter(_this, void 0, void 0, function () {
                            var authModes;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, authModeStrategy({
                                            schema: schema,
                                            modelName: modelName,
                                            operation: operation,
                                        })];
                                    case 1:
                                        authModes = _a.sent();
                                        if (typeof authModes === 'string') {
                                            modelAuthModes[operation] = [authModes];
                                        }
                                        else if (Array.isArray(authModes) && authModes.length) {
                                            modelAuthModes[operation] = authModes;
                                        }
                                        else {
                                            // Use default auth mode if nothing is returned from authModeStrategy
                                            modelAuthModes[operation] = [defaultAuthMode];
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    logger.debug("Error getting auth modes for model: " + modelName, error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, modelAuthModes];
            }
        });
    });
}
export function getForbiddenError(error) {
    var forbiddenErrorMessages = [
        'Request failed with status code 401',
        'Request failed with status code 403',
    ];
    var forbiddenError;
    if (error && error.errors) {
        forbiddenError = error.errors.find(function (err) {
            return forbiddenErrorMessages.includes(err.message);
        });
    }
    else if (error && error.message) {
        forbiddenError = error;
    }
    if (forbiddenError) {
        return forbiddenError.message;
    }
    return null;
}
export function getClientSideAuthError(error) {
    var clientSideAuthErrors = Object.values(GraphQLAuthError);
    var clientSideError = error &&
        error.message &&
        clientSideAuthErrors.find(function (clientError) {
            return error.message.includes(clientError);
        });
    return clientSideError || null;
}
export function getTokenForCustomAuth(authMode, amplifyConfig) {
    if (amplifyConfig === void 0) { amplifyConfig = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var _a, functionAuthProvider, token, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(authMode === GRAPHQL_AUTH_MODE.AWS_LAMBDA)) return [3 /*break*/, 6];
                    _a = amplifyConfig.authProviders, functionAuthProvider = (_a === void 0 ? { functionAuthProvider: null } : _a).functionAuthProvider;
                    if (!(functionAuthProvider && typeof functionAuthProvider === 'function')) return [3 /*break*/, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, functionAuthProvider()];
                case 2:
                    token = (_b.sent()).token;
                    return [2 /*return*/, token];
                case 3:
                    error_2 = _b.sent();
                    throw new Error("Error retrieving token from `functionAuthProvider`: " + error_2);
                case 4: return [3 /*break*/, 6];
                case 5: 
                // TODO: add docs link once available
                throw new Error("You must provide a `functionAuthProvider` function to `DataStore.configure` when using " + GRAPHQL_AUTH_MODE.AWS_LAMBDA);
                case 6: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=utils.js.map