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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = __importDefault(require("@aws-amplify/api"));
var core_1 = require("@aws-amplify/core");
var auth_1 = require("@aws-amplify/auth");
var cache_1 = __importDefault(require("@aws-amplify/cache"));
var immer_1 = require("immer");
var uuid_1 = require("uuid");
var zen_observable_ts_1 = __importDefault(require("zen-observable-ts"));
var authModeStrategies_1 = require("../authModeStrategies");
var predicates_1 = require("../predicates");
var storage_1 = require("../storage/storage");
var sync_1 = require("../sync");
var types_1 = require("../types");
var util_1 = require("../util");
immer_1.setAutoFreeze(true);
immer_1.enablePatches();
var logger = new core_1.ConsoleLogger('DataStore');
var ulid = util_1.monotonicUlidFactory(Date.now());
var isNode = core_1.JS.browserOrNode().isNode;
var SETTING_SCHEMA_VERSION = 'schemaVersion';
var schema;
var modelNamespaceMap = new WeakMap();
// stores data for crafting the correct update mutation input for a model
// Patch[] - array of changed fields and metadata
// PersistentModel - the source model, used for diffing object-type fields
var modelPatchesMap = new WeakMap();
var getModelDefinition = function (modelConstructor) {
    var namespace = modelNamespaceMap.get(modelConstructor);
    return schema.namespaces[namespace].models[modelConstructor.name];
};
var isValidModelConstructor = function (obj) {
    return util_1.isModelConstructor(obj) && modelNamespaceMap.has(obj);
};
var namespaceResolver = function (modelConstructor) {
    return modelNamespaceMap.get(modelConstructor);
};
var userClasses;
var dataStoreClasses;
var storageClasses;
var initSchema = function (userSchema) {
    var _a;
    if (schema !== undefined) {
        console.warn('The schema has already been initialized');
        return userClasses;
    }
    logger.log('validating schema', { schema: userSchema });
    var internalUserNamespace = __assign({ name: util_1.USER }, userSchema);
    logger.log('DataStore', 'Init models');
    userClasses = createTypeClasses(internalUserNamespace);
    logger.log('DataStore', 'Models initialized');
    var dataStoreNamespace = getNamespace();
    var storageNamespace = storage_1.ExclusiveStorage.getNamespace();
    var syncNamespace = sync_1.SyncEngine.getNamespace();
    dataStoreClasses = createTypeClasses(dataStoreNamespace);
    storageClasses = createTypeClasses(storageNamespace);
    exports.syncClasses = createTypeClasses(syncNamespace);
    schema = {
        namespaces: (_a = {},
            _a[dataStoreNamespace.name] = dataStoreNamespace,
            _a[internalUserNamespace.name] = internalUserNamespace,
            _a[storageNamespace.name] = storageNamespace,
            _a[syncNamespace.name] = syncNamespace,
            _a),
        version: userSchema.version,
    };
    Object.keys(schema.namespaces).forEach(function (namespace) {
        var e_1, _a;
        var _b = __read(util_1.establishRelationAndKeys(schema.namespaces[namespace]), 2), relations = _b[0], keys = _b[1];
        schema.namespaces[namespace].relationships = relations;
        schema.namespaces[namespace].keys = keys;
        var modelAssociations = new Map();
        Object.values(schema.namespaces[namespace].models).forEach(function (model) {
            var connectedModels = [];
            Object.values(model.fields)
                .filter(function (field) {
                return field.association &&
                    field.association.connectionType === 'BELONGS_TO' &&
                    field.type.model !== model.name;
            })
                .forEach(function (field) {
                return connectedModels.push(field.type.model);
            });
            modelAssociations.set(model.name, connectedModels);
        });
        var result = new Map();
        var count = 1000;
        while (true && count > 0) {
            if (modelAssociations.size === 0) {
                break;
            }
            count--;
            if (count === 0) {
                throw new Error('Models are not topologically sortable. Please verify your schema.');
            }
            try {
                for (var _c = (e_1 = void 0, __values(Array.from(modelAssociations.keys()))), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var modelName = _d.value;
                    var parents = modelAssociations.get(modelName);
                    if (parents.every(function (x) { return result.has(x); })) {
                        result.set(modelName, parents);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            Array.from(result.keys()).forEach(function (x) { return modelAssociations.delete(x); });
        }
        schema.namespaces[namespace].modelTopologicalOrdering = result;
    });
    return userClasses;
};
exports.initSchema = initSchema;
/* Checks if the schema has been initialized by initSchema().
 *
 * Call this function before accessing schema.
 * Currently this only needs to be called in start() and clear() because all other functions will call start first.
 */
var checkSchemaInitialized = function () {
    if (schema === undefined) {
        var message = 'Schema is not initialized. DataStore will not function as expected. This could happen if you have multiple versions of DataStore installed. Please see https://docs.amplify.aws/lib/troubleshooting/upgrading/q/platform/js/#check-for-duplicate-versions';
        logger.error(message);
        throw new Error(message);
    }
};
var createTypeClasses = function (namespace) {
    var classes = {};
    Object.entries(namespace.models).forEach(function (_a) {
        var _b = __read(_a, 2), modelName = _b[0], modelDefinition = _b[1];
        var clazz = createModelClass(modelDefinition);
        classes[modelName] = clazz;
        modelNamespaceMap.set(clazz, namespace.name);
    });
    Object.entries(namespace.nonModels || {}).forEach(function (_a) {
        var _b = __read(_a, 2), typeName = _b[0], typeDefinition = _b[1];
        var clazz = createNonModelClass(typeDefinition);
        classes[typeName] = clazz;
    });
    return classes;
};
var instancesMetadata = new WeakSet();
function modelInstanceCreator(modelConstructor, init) {
    instancesMetadata.add(init);
    return new modelConstructor(init);
}
var validateModelFields = function (modelDefinition) { return function (k, v) {
    var fieldDefinition = modelDefinition.fields[k];
    if (fieldDefinition !== undefined) {
        var type = fieldDefinition.type, isRequired_1 = fieldDefinition.isRequired, isArrayNullable = fieldDefinition.isArrayNullable, name_1 = fieldDefinition.name, isArray = fieldDefinition.isArray;
        if (((!isArray && isRequired_1) || (isArray && !isArrayNullable)) &&
            (v === null || v === undefined)) {
            throw new Error("Field " + name_1 + " is required");
        }
        if (types_1.isGraphQLScalarType(type)) {
            var jsType_1 = types_1.GraphQLScalarType.getJSType(type);
            var validateScalar_1 = types_1.GraphQLScalarType.getValidationFunction(type);
            if (type === 'AWSJSON') {
                if (typeof v === jsType_1) {
                    return;
                }
                if (typeof v === 'string') {
                    try {
                        JSON.parse(v);
                        return;
                    }
                    catch (error) {
                        throw new Error("Field " + name_1 + " is an invalid JSON object. " + v);
                    }
                }
            }
            if (isArray) {
                var errorTypeText = jsType_1;
                if (!isRequired_1) {
                    errorTypeText = jsType_1 + " | null | undefined";
                }
                if (!Array.isArray(v) && !isArrayNullable) {
                    throw new Error("Field " + name_1 + " should be of type [" + errorTypeText + "], " + typeof v + " received. " + v);
                }
                if (!util_1.isNullOrUndefined(v) &&
                    v.some(function (e) {
                        return util_1.isNullOrUndefined(e) ? isRequired_1 : typeof e !== jsType_1;
                    })) {
                    var elemTypes = v
                        .map(function (e) { return (e === null ? 'null' : typeof e); })
                        .join(',');
                    throw new Error("All elements in the " + name_1 + " array should be of type " + errorTypeText + ", [" + elemTypes + "] received. " + v);
                }
                if (validateScalar_1 && !util_1.isNullOrUndefined(v)) {
                    var validationStatus = v.map(function (e) {
                        if (!util_1.isNullOrUndefined(e)) {
                            return validateScalar_1(e);
                        }
                        else if (util_1.isNullOrUndefined(e) && !isRequired_1) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                    if (!validationStatus.every(function (s) { return s; })) {
                        throw new Error("All elements in the " + name_1 + " array should be of type " + type + ", validation failed for one or more elements. " + v);
                    }
                }
            }
            else if (!isRequired_1 && v === undefined) {
                return;
            }
            else if (typeof v !== jsType_1 && v !== null) {
                throw new Error("Field " + name_1 + " should be of type " + jsType_1 + ", " + typeof v + " received. " + v);
            }
            else if (!util_1.isNullOrUndefined(v) &&
                validateScalar_1 &&
                !validateScalar_1(v)) {
                throw new Error("Field " + name_1 + " should be of type " + type + ", validation failed. " + v);
            }
        }
    }
}; };
var castInstanceType = function (modelDefinition, k, v) {
    var _a = modelDefinition.fields[k] || {}, isArray = _a.isArray, type = _a.type;
    // attempt to parse stringified JSON
    if (typeof v === 'string' &&
        (isArray ||
            type === 'AWSJSON' ||
            types_1.isNonModelFieldType(type) ||
            types_1.isModelFieldType(type))) {
        try {
            return JSON.parse(v);
        }
        catch (_b) {
            // if JSON is invalid, don't throw and let modelValidator handle it
        }
    }
    // cast from numeric representation of boolean to JS boolean
    if (typeof v === 'number' && type === 'Boolean') {
        return Boolean(v);
    }
    return v;
};
var initializeInstance = function (init, modelDefinition, draft) {
    var modelValidator = validateModelFields(modelDefinition);
    Object.entries(init).forEach(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        var parsedValue = castInstanceType(modelDefinition, k, v);
        modelValidator(k, parsedValue);
        draft[k] = parsedValue;
    });
};
var createModelClass = function (modelDefinition) {
    var clazz = /** @class */ (function () {
        function Model(init) {
            var instance = immer_1.produce(this, function (draft) {
                initializeInstance(init, modelDefinition, draft);
                var modelInstanceMetadata = instancesMetadata.has(init)
                    ? init
                    : {};
                var _version = modelInstanceMetadata._version, _lastChangedAt = modelInstanceMetadata._lastChangedAt, _deleted = modelInstanceMetadata._deleted;
                var _id = init.id || modelInstanceMetadata.id;
                // instancesIds are set by modelInstanceCreator, it is accessible only internally
                var isInternal = _id !== null && _id !== undefined;
                var id = isInternal
                    ? _id
                    : modelDefinition.syncable
                        ? uuid_1.v4()
                        : ulid();
                if (!isInternal) {
                    checkReadOnlyPropertyOnCreate(draft, modelDefinition);
                }
                draft.id = id;
                if (modelDefinition.syncable) {
                    draft._version = _version;
                    draft._lastChangedAt = _lastChangedAt;
                    draft._deleted = _deleted;
                }
            });
            return instance;
        }
        Model.copyOf = function (source, fn) {
            var modelConstructor = Object.getPrototypeOf(source || {}).constructor;
            if (!isValidModelConstructor(modelConstructor)) {
                var msg = 'The source object is not a valid model';
                logger.error(msg, { source: source });
                throw new Error(msg);
            }
            var patches;
            var model = immer_1.produce(source, function (draft) {
                fn(draft);
                draft.id = source.id;
                var modelValidator = validateModelFields(modelDefinition);
                Object.entries(draft).forEach(function (_a) {
                    var _b = __read(_a, 2), k = _b[0], v = _b[1];
                    var parsedValue = castInstanceType(modelDefinition, k, v);
                    modelValidator(k, parsedValue);
                });
            }, function (p) { return (patches = p); });
            var hasExistingPatches = modelPatchesMap.has(source);
            if (patches.length || hasExistingPatches) {
                if (hasExistingPatches) {
                    var _a = __read(modelPatchesMap.get(source), 2), existingPatches = _a[0], existingSource = _a[1];
                    var mergedPatches = util_1.mergePatches(existingSource, existingPatches, patches);
                    modelPatchesMap.set(model, [mergedPatches, existingSource]);
                    checkReadOnlyPropertyOnUpdate(mergedPatches, modelDefinition);
                }
                else {
                    modelPatchesMap.set(model, [patches, source]);
                    checkReadOnlyPropertyOnUpdate(patches, modelDefinition);
                }
            }
            return model;
        };
        // "private" method (that's hidden via `Setting`) for `withSSRContext` to use
        // to gain access to `modelInstanceCreator` and `clazz` for persisting IDs from server to client.
        Model.fromJSON = function (json) {
            var _this = this;
            if (Array.isArray(json)) {
                return json.map(function (init) { return _this.fromJSON(init); });
            }
            var instance = modelInstanceCreator(clazz, json);
            var modelValidator = validateModelFields(modelDefinition);
            Object.entries(instance).forEach(function (_a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                modelValidator(k, v);
            });
            return instance;
        };
        return Model;
    }());
    clazz[immer_1.immerable] = true;
    Object.defineProperty(clazz, 'name', { value: modelDefinition.name });
    return clazz;
};
var checkReadOnlyPropertyOnCreate = function (draft, modelDefinition) {
    var modelKeys = Object.keys(draft);
    var fields = modelDefinition.fields;
    modelKeys.forEach(function (key) {
        if (fields[key] && fields[key].isReadOnly) {
            throw new Error(key + " is read-only.");
        }
    });
};
var checkReadOnlyPropertyOnUpdate = function (patches, modelDefinition) {
    var patchArray = patches.map(function (p) { return [p.path[0], p.value]; });
    var fields = modelDefinition.fields;
    patchArray.forEach(function (_a) {
        var _b = __read(_a, 2), key = _b[0], val = _b[1];
        if (!val || !fields[key])
            return;
        if (fields[key].isReadOnly) {
            throw new Error(key + " is read-only.");
        }
    });
};
var createNonModelClass = function (typeDefinition) {
    var clazz = /** @class */ (function () {
        function Model(init) {
            var instance = immer_1.produce(this, function (draft) {
                initializeInstance(init, typeDefinition, draft);
            });
            return instance;
        }
        return Model;
    }());
    clazz[immer_1.immerable] = true;
    Object.defineProperty(clazz, 'name', { value: typeDefinition.name });
    util_1.registerNonModelClass(clazz);
    return clazz;
};
function isQueryOne(obj) {
    return typeof obj === 'string';
}
function defaultConflictHandler(conflictData) {
    var localModel = conflictData.localModel, modelConstructor = conflictData.modelConstructor, remoteModel = conflictData.remoteModel;
    var _version = remoteModel._version;
    return modelInstanceCreator(modelConstructor, __assign(__assign({}, localModel), { _version: _version }));
}
function defaultErrorHandler(error) {
    logger.warn(error);
}
function getModelConstructorByModelName(namespaceName, modelName) {
    var result;
    switch (namespaceName) {
        case util_1.DATASTORE:
            result = dataStoreClasses[modelName];
            break;
        case util_1.USER:
            result = userClasses[modelName];
            break;
        case util_1.SYNC:
            result = exports.syncClasses[modelName];
            break;
        case util_1.STORAGE:
            result = storageClasses[modelName];
            break;
        default:
            util_1.exhaustiveCheck(namespaceName);
            break;
    }
    if (isValidModelConstructor(result)) {
        return result;
    }
    else {
        var msg = "Model name is not valid for namespace. modelName: " + modelName + ", namespace: " + namespaceName;
        logger.error(msg);
        throw new Error(msg);
    }
}
function checkSchemaVersion(storage, version) {
    return __awaiter(this, void 0, void 0, function () {
        var Setting, modelDefinition;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Setting = dataStoreClasses.Setting;
                    modelDefinition = schema.namespaces[util_1.DATASTORE].models.Setting;
                    return [4 /*yield*/, storage.runExclusive(function (s) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, schemaVersionSetting, storedValue;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, s.query(Setting, predicates_1.ModelPredicateCreator.createFromExisting(modelDefinition, function (c) {
                                            // @ts-ignore Argument of type '"eq"' is not assignable to parameter of type 'never'.
                                            return c.key('eq', SETTING_SCHEMA_VERSION);
                                        }), { page: 0, limit: 1 })];
                                    case 1:
                                        _a = __read.apply(void 0, [_b.sent(), 1]), schemaVersionSetting = _a[0];
                                        if (!(schemaVersionSetting !== undefined &&
                                            schemaVersionSetting.value !== undefined)) return [3 /*break*/, 4];
                                        storedValue = JSON.parse(schemaVersionSetting.value);
                                        if (!(storedValue !== version)) return [3 /*break*/, 3];
                                        return [4 /*yield*/, s.clear(false)];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3: return [3 /*break*/, 6];
                                    case 4: return [4 /*yield*/, s.save(modelInstanceCreator(Setting, {
                                            key: SETTING_SCHEMA_VERSION,
                                            value: JSON.stringify(version),
                                        }))];
                                    case 5:
                                        _b.sent();
                                        _b.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
var syncSubscription;
function getNamespace() {
    var namespace = {
        name: util_1.DATASTORE,
        relationships: {},
        enums: {},
        nonModels: {},
        models: {
            Setting: {
                name: 'Setting',
                pluralName: 'Settings',
                syncable: false,
                fields: {
                    id: {
                        name: 'id',
                        type: 'ID',
                        isRequired: true,
                        isArray: false,
                    },
                    key: {
                        name: 'key',
                        type: 'String',
                        isRequired: true,
                        isArray: false,
                    },
                    value: {
                        name: 'value',
                        type: 'String',
                        isRequired: true,
                        isArray: false,
                    },
                },
            },
        },
    };
    return namespace;
}
var DataStore = /** @class */ (function () {
    function DataStore() {
        var _this = this;
        // reference to configured category instances. Used for preserving SSR context
        this.Auth = auth_1.Auth;
        this.API = api_1.default;
        this.Cache = cache_1.default;
        this.amplifyConfig = {};
        this.syncPredicates = new WeakMap();
        // object that gets passed to descendent classes. Allows us to pass these down by reference
        this.amplifyContext = {
            Auth: this.Auth,
            API: this.API,
            Cache: this.Cache,
        };
        this.start = function () { return __awaiter(_this, void 0, void 0, function () {
            var aws_appsync_graphqlEndpoint, _a, fullSyncIntervalInMilliseconds;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.initialized === undefined)) return [3 /*break*/, 1];
                        logger.debug('Starting DataStore');
                        this.initialized = new Promise(function (res, rej) {
                            _this.initResolve = res;
                            _this.initReject = rej;
                        });
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.initialized];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                    case 3:
                        this.storage = new storage_1.ExclusiveStorage(schema, namespaceResolver, getModelConstructorByModelName, modelInstanceCreator, this.storageAdapter, this.sessionId);
                        return [4 /*yield*/, this.storage.init()];
                    case 4:
                        _b.sent();
                        checkSchemaInitialized();
                        return [4 /*yield*/, checkSchemaVersion(this.storage, schema.version)];
                    case 5:
                        _b.sent();
                        aws_appsync_graphqlEndpoint = this.amplifyConfig.aws_appsync_graphqlEndpoint;
                        if (!aws_appsync_graphqlEndpoint) return [3 /*break*/, 7];
                        logger.debug('GraphQL endpoint available', aws_appsync_graphqlEndpoint);
                        _a = this;
                        return [4 /*yield*/, this.processSyncExpressions()];
                    case 6:
                        _a.syncPredicates = _b.sent();
                        this.sync = new sync_1.SyncEngine(schema, namespaceResolver, exports.syncClasses, userClasses, this.storage, modelInstanceCreator, this.conflictHandler, this.errorHandler, this.syncPredicates, this.amplifyConfig, this.authModeStrategy, this.amplifyContext);
                        fullSyncIntervalInMilliseconds = this.fullSyncInterval * 1000 * 60;
                        syncSubscription = this.sync
                            .start({ fullSyncInterval: fullSyncIntervalInMilliseconds })
                            .subscribe({
                            next: function (_a) {
                                var type = _a.type, data = _a.data;
                                // In Node, we need to wait for queries to be synced to prevent returning empty arrays.
                                // In the Browser, we can begin returning data once subscriptions are in place.
                                var readyType = isNode
                                    ? sync_1.ControlMessage.SYNC_ENGINE_SYNC_QUERIES_READY
                                    : sync_1.ControlMessage.SYNC_ENGINE_STORAGE_SUBSCRIBED;
                                if (type === readyType) {
                                    _this.initResolve();
                                }
                                core_1.Hub.dispatch('datastore', {
                                    event: type,
                                    data: data,
                                });
                            },
                            error: function (err) {
                                logger.warn('Sync error', err);
                                _this.initReject();
                            },
                        });
                        return [3 /*break*/, 8];
                    case 7:
                        logger.warn("Data won't be synchronized. No GraphQL endpoint configured. Did you forget `Amplify.configure(awsconfig)`?", {
                            config: this.amplifyConfig,
                        });
                        this.initResolve();
                        _b.label = 8;
                    case 8: return [4 /*yield*/, this.initialized];
                    case 9:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.query = function (modelConstructor, idOrCriteria, paginationProducer) { return __awaiter(_this, void 0, void 0, function () {
            var msg, modelDefinition, predicate, pagination, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.start()];
                    case 1:
                        _a.sent();
                        //#region Input validation
                        if (!isValidModelConstructor(modelConstructor)) {
                            msg = 'Constructor is not for a valid model';
                            logger.error(msg, { modelConstructor: modelConstructor });
                            throw new Error(msg);
                        }
                        if (typeof idOrCriteria === 'string') {
                            if (paginationProducer !== undefined) {
                                logger.warn('Pagination is ignored when querying by id');
                            }
                        }
                        modelDefinition = getModelDefinition(modelConstructor);
                        if (isQueryOne(idOrCriteria)) {
                            predicate = predicates_1.ModelPredicateCreator.createForId(modelDefinition, idOrCriteria);
                        }
                        else {
                            if (predicates_1.isPredicatesAll(idOrCriteria)) {
                                // Predicates.ALL means "all records", so no predicate (undefined)
                                predicate = undefined;
                            }
                            else {
                                predicate = predicates_1.ModelPredicateCreator.createFromExisting(modelDefinition, idOrCriteria);
                            }
                        }
                        pagination = this.processPagination(modelDefinition, paginationProducer);
                        //#endregion
                        logger.debug('params ready', {
                            modelConstructor: modelConstructor,
                            predicate: predicates_1.ModelPredicateCreator.getPredicates(predicate, false),
                            pagination: __assign(__assign({}, pagination), { sort: predicates_1.ModelSortPredicateCreator.getPredicates(pagination && pagination.sort, false) }),
                        });
                        return [4 /*yield*/, this.storage.query(modelConstructor, predicate, pagination)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, isQueryOne(idOrCriteria) ? result[0] : result];
                }
            });
        }); };
        this.save = function (model, condition) { return __awaiter(_this, void 0, void 0, function () {
            var patchesTuple, modelConstructor, msg, modelDefinition, producedCondition, _a, savedModel;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.start()];
                    case 1:
                        _b.sent();
                        patchesTuple = modelPatchesMap.get(model);
                        modelConstructor = model
                            ? model.constructor
                            : undefined;
                        if (!isValidModelConstructor(modelConstructor)) {
                            msg = 'Object is not an instance of a valid model';
                            logger.error(msg, { model: model });
                            throw new Error(msg);
                        }
                        modelDefinition = getModelDefinition(modelConstructor);
                        producedCondition = predicates_1.ModelPredicateCreator.createFromExisting(modelDefinition, condition);
                        return [4 /*yield*/, this.storage.runExclusive(function (s) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, s.save(model, producedCondition, undefined, patchesTuple)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/, s.query(modelConstructor, predicates_1.ModelPredicateCreator.createForId(modelDefinition, model.id))];
                                    }
                                });
                            }); })];
                    case 2:
                        _a = __read.apply(void 0, [_b.sent(), 1]), savedModel = _a[0];
                        return [2 /*return*/, savedModel];
                }
            });
        }); };
        this.setConflictHandler = function (config) {
            var configDataStore = config.DataStore;
            var conflictHandlerIsDefault = function () {
                return _this.conflictHandler === defaultConflictHandler;
            };
            if (configDataStore && configDataStore.conflictHandler) {
                return configDataStore.conflictHandler;
            }
            if (conflictHandlerIsDefault() && config.conflictHandler) {
                return config.conflictHandler;
            }
            return _this.conflictHandler || defaultConflictHandler;
        };
        this.setErrorHandler = function (config) {
            var configDataStore = config.DataStore;
            var errorHandlerIsDefault = function () {
                return _this.errorHandler === defaultErrorHandler;
            };
            if (configDataStore && configDataStore.errorHandler) {
                return configDataStore.errorHandler;
            }
            if (errorHandlerIsDefault() && config.errorHandler) {
                return config.errorHandler;
            }
            return _this.errorHandler || defaultErrorHandler;
        };
        this.delete = function (modelOrConstructor, idOrCriteria) { return __awaiter(_this, void 0, void 0, function () {
            var condition, msg, modelConstructor, msg, msg, _a, deleted, model, modelConstructor, msg, modelDefinition, idPredicate, msg, _b, _c, deleted;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.start()];
                    case 1:
                        _d.sent();
                        if (!modelOrConstructor) {
                            msg = 'Model or Model Constructor required';
                            logger.error(msg, { modelOrConstructor: modelOrConstructor });
                            throw new Error(msg);
                        }
                        if (!isValidModelConstructor(modelOrConstructor)) return [3 /*break*/, 3];
                        modelConstructor = modelOrConstructor;
                        if (!idOrCriteria) {
                            msg = 'Id to delete or criteria required. Do you want to delete all? Pass Predicates.ALL';
                            logger.error(msg, { idOrCriteria: idOrCriteria });
                            throw new Error(msg);
                        }
                        if (typeof idOrCriteria === 'string') {
                            condition = predicates_1.ModelPredicateCreator.createForId(getModelDefinition(modelConstructor), idOrCriteria);
                        }
                        else {
                            condition = predicates_1.ModelPredicateCreator.createFromExisting(getModelDefinition(modelConstructor), 
                            /**
                             * idOrCriteria is always a ProducerModelPredicate<T>, never a symbol.
                             * The symbol is used only for typing purposes. e.g. see Predicates.ALL
                             */
                            idOrCriteria);
                            if (!condition || !predicates_1.ModelPredicateCreator.isValidPredicate(condition)) {
                                msg = 'Criteria required. Do you want to delete all? Pass Predicates.ALL';
                                logger.error(msg, { condition: condition });
                                throw new Error(msg);
                            }
                        }
                        return [4 /*yield*/, this.storage.delete(modelConstructor, condition)];
                    case 2:
                        _a = __read.apply(void 0, [_d.sent(), 1]), deleted = _a[0];
                        return [2 /*return*/, deleted];
                    case 3:
                        model = modelOrConstructor;
                        modelConstructor = Object.getPrototypeOf(model || {})
                            .constructor;
                        if (!isValidModelConstructor(modelConstructor)) {
                            msg = 'Object is not an instance of a valid model';
                            logger.error(msg, { model: model });
                            throw new Error(msg);
                        }
                        modelDefinition = getModelDefinition(modelConstructor);
                        idPredicate = predicates_1.ModelPredicateCreator.createForId(modelDefinition, model.id);
                        if (idOrCriteria) {
                            if (typeof idOrCriteria !== 'function') {
                                msg = 'Invalid criteria';
                                logger.error(msg, { idOrCriteria: idOrCriteria });
                                throw new Error(msg);
                            }
                            condition = idOrCriteria(idPredicate);
                        }
                        else {
                            condition = idPredicate;
                        }
                        return [4 /*yield*/, this.storage.delete(model, condition)];
                    case 4:
                        _b = __read.apply(void 0, [_d.sent(), 1]), _c = __read(_b[0], 1), deleted = _c[0];
                        return [2 /*return*/, deleted];
                }
            });
        }); };
        this.observe = function (modelOrConstructor, idOrCriteria) {
            var predicate;
            var modelConstructor = modelOrConstructor && isValidModelConstructor(modelOrConstructor)
                ? modelOrConstructor
                : undefined;
            if (modelOrConstructor && modelConstructor === undefined) {
                var model = modelOrConstructor;
                var modelConstructor_1 = model && Object.getPrototypeOf(model).constructor;
                if (isValidModelConstructor(modelConstructor_1)) {
                    if (idOrCriteria) {
                        logger.warn('idOrCriteria is ignored when using a model instance', {
                            model: model,
                            idOrCriteria: idOrCriteria,
                        });
                    }
                    return _this.observe(modelConstructor_1, model.id);
                }
                else {
                    var msg = 'The model is not an instance of a PersistentModelConstructor';
                    logger.error(msg, { model: model });
                    throw new Error(msg);
                }
            }
            if (idOrCriteria !== undefined && modelConstructor === undefined) {
                var msg = 'Cannot provide criteria without a modelConstructor';
                logger.error(msg, idOrCriteria);
                throw new Error(msg);
            }
            if (modelConstructor && !isValidModelConstructor(modelConstructor)) {
                var msg = 'Constructor is not for a valid model';
                logger.error(msg, { modelConstructor: modelConstructor });
                throw new Error(msg);
            }
            if (typeof idOrCriteria === 'string') {
                predicate = predicates_1.ModelPredicateCreator.createForId(getModelDefinition(modelConstructor), idOrCriteria);
            }
            else {
                predicate =
                    modelConstructor &&
                        predicates_1.ModelPredicateCreator.createFromExisting(getModelDefinition(modelConstructor), idOrCriteria);
            }
            return new zen_observable_ts_1.default(function (observer) {
                var handle;
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, this.start()];
                            case 1:
                                _a.sent();
                                // Filter the events returned by Storage according to namespace,
                                // append original element data, and subscribe to the observable
                                handle = this.storage
                                    .observe(modelConstructor, predicate)
                                    .filter(function (_a) {
                                    var model = _a.model;
                                    return namespaceResolver(model) === util_1.USER;
                                })
                                    .subscribe({
                                    next: function (item) { return __awaiter(_this, void 0, void 0, function () {
                                        var message, freshElement;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    message = item;
                                                    if (!(item.opType !== 'DELETE')) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, this.query(item.model, item.element.id)];
                                                case 1:
                                                    freshElement = _a.sent();
                                                    message = __assign(__assign({}, message), { element: freshElement });
                                                    _a.label = 2;
                                                case 2:
                                                    observer.next(message);
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); },
                                    error: function (err) { return observer.error(err); },
                                    complete: function () { return observer.complete(); },
                                });
                                return [2 /*return*/];
                        }
                    });
                }); })();
                return function () {
                    if (handle) {
                        handle.unsubscribe();
                    }
                };
            });
        };
        this.observeQuery = function (model, criteria, options) {
            return new zen_observable_ts_1.default(function (observer) {
                var items = new Map();
                var itemsChanged = new Map();
                var deletedItemIds = [];
                var handle;
                var predicate;
                /**
                 * As the name suggests, this geneates a snapshot in the form of
                 * 	`{items: T[], isSynced: boolean}`
                 * and sends it to the observer.
                 *
                 * SIDE EFFECT: The underlying generation and emission methods may touch:
                 * `items`, `itemsChanged`, and `deletedItemIds`.
                 *
                 * Refer to `generateSnapshot` and `emitSnapshot` for more details.
                 */
                var generateAndEmitSnapshot = function () {
                    var snapshot = generateSnapshot();
                    emitSnapshot(snapshot);
                };
                // a mechanism to return data after X amount of seconds OR after the
                // "limit" (itemsChanged >= this.syncPageSize) has been reached, whichever comes first
                var limitTimerRace = new util_1.DeferredCallbackResolver({
                    callback: generateAndEmitSnapshot,
                    errorHandler: observer.error,
                    maxInterval: 2000,
                });
                var sort = (options || {}).sort;
                var sortOptions = sort ? { sort: sort } : undefined;
                var modelDefinition = getModelDefinition(model);
                if (isQueryOne(criteria)) {
                    predicate = predicates_1.ModelPredicateCreator.createForId(modelDefinition, criteria);
                }
                else {
                    if (predicates_1.isPredicatesAll(criteria)) {
                        // Predicates.ALL means "all records", so no predicate (undefined)
                        predicate = undefined;
                    }
                    else {
                        predicate = predicates_1.ModelPredicateCreator.createFromExisting(modelDefinition, criteria);
                    }
                }
                var _a = predicates_1.ModelPredicateCreator.getPredicates(predicate, false) || {}, predicates = _a.predicates, predicateGroupType = _a.type;
                var hasPredicate = !!predicates;
                (function () { return __awaiter(_this, void 0, void 0, function () {
                    var err_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, this.query(model, criteria, sortOptions)];
                            case 1:
                                // first, query and return any locally-available records
                                (_a.sent()).forEach(function (item) {
                                    return items.set(item.id, item);
                                });
                                // Observe the model and send a stream of updates (debounced).
                                // We need to post-filter results instead of passing criteria through
                                // to have visibility into items that move from in-set to out-of-set.
                                // We need to explicitly remove those items from the existing snapshot.
                                handle = this.observe(model).subscribe(function (_a) {
                                    var element = _a.element, model = _a.model, opType = _a.opType;
                                    var _b, _c;
                                    if (hasPredicate &&
                                        !util_1.validatePredicate(element, predicateGroupType, predicates)) {
                                        if (opType === 'UPDATE' &&
                                            (items.has(element.id) || itemsChanged.has(element.id))) {
                                            // tracking as a "deleted item" will include the item in
                                            // page limit calculations and ensure it is removed from the
                                            // final items collection, regardless of which collection(s)
                                            // it is currently in. (I mean, it could be in both, right!?)
                                            deletedItemIds.push(element.id);
                                        }
                                        else {
                                            // ignore updates for irrelevant/filtered items.
                                            return;
                                        }
                                    }
                                    // Flag items which have been recently deleted
                                    // NOTE: Merging of separate operations to the same model instance is handled upstream
                                    // in the `mergePage` method within src/sync/merger.ts. The final state of a model instance
                                    // depends on the LATEST record (for a given id).
                                    if (opType === 'DELETE') {
                                        deletedItemIds.push(element.id);
                                    }
                                    else {
                                        itemsChanged.set(element.id, element);
                                    }
                                    var isSynced = (_c = (_b = _this.sync) === null || _b === void 0 ? void 0 : _b.getModelSyncedStatus(model)) !== null && _c !== void 0 ? _c : false;
                                    var limit = itemsChanged.size - deletedItemIds.length >= _this.syncPageSize;
                                    if (limit || isSynced) {
                                        limitTimerRace.resolve();
                                    }
                                    // kicks off every subsequent race as results sync down
                                    limitTimerRace.start();
                                });
                                // returns a set of initial/locally-available results
                                generateAndEmitSnapshot();
                                return [3 /*break*/, 3];
                            case 2:
                                err_1 = _a.sent();
                                observer.error(err_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); })();
                /**
                 * Combines the `items`, `itemsChanged`, and `deletedItemIds` collections into
                 * a snapshot in the form of `{ items: T[], isSynced: boolean}`.
                 *
                 * SIDE EFFECT: The shared `items` collection is recreated.
                 */
                var generateSnapshot = function () {
                    var _a, _b;
                    var isSynced = (_b = (_a = _this.sync) === null || _a === void 0 ? void 0 : _a.getModelSyncedStatus(model)) !== null && _b !== void 0 ? _b : false;
                    var itemsArray = __spread(Array.from(items.values()), Array.from(itemsChanged.values()));
                    if (options === null || options === void 0 ? void 0 : options.sort) {
                        sortItems(itemsArray);
                    }
                    items.clear();
                    itemsArray.forEach(function (item) { return items.set(item.id, item); });
                    // remove deleted items from the final result set
                    deletedItemIds.forEach(function (id) { return items.delete(id); });
                    return {
                        items: Array.from(items.values()),
                        isSynced: isSynced,
                    };
                };
                /**
                 * Emits the list of items to the observer.
                 *
                 * SIDE EFFECT: `itemsChanged` and `deletedItemIds` are cleared to prepare
                 * for the next snapshot.
                 *
                 * @param snapshot The generated items data to emit.
                 */
                var emitSnapshot = function (snapshot) {
                    // send the generated snapshot to the primary subscription
                    observer.next(snapshot);
                    // reset the changed items sets
                    itemsChanged.clear();
                    deletedItemIds = [];
                };
                /**
                 * Sorts an `Array` of `T` according to the sort instructions given in the
                 * original  `observeQuery()` call.
                 *
                 * @param itemsToSort A array of model type.
                 */
                var sortItems = function (itemsToSort) {
                    var modelDefinition = getModelDefinition(model);
                    var pagination = _this.processPagination(modelDefinition, options);
                    var sortPredicates = predicates_1.ModelSortPredicateCreator.getPredicates(pagination.sort);
                    if (sortPredicates.length) {
                        var compareFn = util_1.sortCompareFunction(sortPredicates);
                        itemsToSort.sort(compareFn);
                    }
                };
                /**
                 * Force one last snapshot when the model is fully synced.
                 *
                 * This reduces latency for that last snapshot, which will otherwise
                 * wait for the configured timeout.
                 *
                 * @param payload The payload from the Hub event.
                 */
                var hubCallback = function (_a) {
                    var payload = _a.payload;
                    var _b;
                    var event = payload.event, data = payload.data;
                    if (event === sync_1.ControlMessage.SYNC_ENGINE_MODEL_SYNCED &&
                        ((_b = data === null || data === void 0 ? void 0 : data.model) === null || _b === void 0 ? void 0 : _b.name) === model.name) {
                        generateAndEmitSnapshot();
                        core_1.Hub.remove('api', hubCallback);
                    }
                };
                core_1.Hub.listen('datastore', hubCallback);
                return function () {
                    if (handle) {
                        handle.unsubscribe();
                    }
                };
            });
        };
        this.configure = function (config) {
            if (config === void 0) { config = {}; }
            _this.amplifyContext.Auth = _this.Auth;
            _this.amplifyContext.API = _this.API;
            _this.amplifyContext.Cache = _this.Cache;
            var configDataStore = config.DataStore, configAuthModeStrategyType = config.authModeStrategyType, configConflictHandler = config.conflictHandler, configErrorHandler = config.errorHandler, configMaxRecordsToSync = config.maxRecordsToSync, configSyncPageSize = config.syncPageSize, configFullSyncInterval = config.fullSyncInterval, configSyncExpressions = config.syncExpressions, configAuthProviders = config.authProviders, configStorageAdapter = config.storageAdapter, configFromAmplify = __rest(config, ["DataStore", "authModeStrategyType", "conflictHandler", "errorHandler", "maxRecordsToSync", "syncPageSize", "fullSyncInterval", "syncExpressions", "authProviders", "storageAdapter"]);
            _this.amplifyConfig = __assign(__assign({}, configFromAmplify), _this.amplifyConfig);
            _this.conflictHandler = _this.setConflictHandler(config);
            _this.errorHandler = _this.setErrorHandler(config);
            var authModeStrategyType = (configDataStore && configDataStore.authModeStrategyType) ||
                configAuthModeStrategyType ||
                types_1.AuthModeStrategyType.DEFAULT;
            switch (authModeStrategyType) {
                case types_1.AuthModeStrategyType.MULTI_AUTH:
                    _this.authModeStrategy = authModeStrategies_1.multiAuthStrategy(_this.amplifyContext);
                    break;
                case types_1.AuthModeStrategyType.DEFAULT:
                    _this.authModeStrategy = authModeStrategies_1.defaultAuthStrategy;
                    break;
                default:
                    _this.authModeStrategy = authModeStrategies_1.defaultAuthStrategy;
                    break;
            }
            // store on config object, so that Sync, Subscription, and Mutation processors can have access
            _this.amplifyConfig.authProviders =
                (configDataStore && configDataStore.authProviders) || configAuthProviders;
            _this.syncExpressions =
                (configDataStore && configDataStore.syncExpressions) ||
                    configSyncExpressions ||
                    _this.syncExpressions;
            _this.maxRecordsToSync =
                (configDataStore && configDataStore.maxRecordsToSync) ||
                    configMaxRecordsToSync ||
                    _this.maxRecordsToSync ||
                    10000;
            // store on config object, so that Sync, Subscription, and Mutation processors can have access
            _this.amplifyConfig.maxRecordsToSync = _this.maxRecordsToSync;
            _this.syncPageSize =
                (configDataStore && configDataStore.syncPageSize) ||
                    configSyncPageSize ||
                    _this.syncPageSize ||
                    1000;
            // store on config object, so that Sync, Subscription, and Mutation processors can have access
            _this.amplifyConfig.syncPageSize = _this.syncPageSize;
            _this.fullSyncInterval =
                (configDataStore && configDataStore.fullSyncInterval) ||
                    configFullSyncInterval ||
                    _this.fullSyncInterval ||
                    24 * 60; // 1 day
            _this.storageAdapter =
                (configDataStore && configDataStore.storageAdapter) ||
                    configStorageAdapter ||
                    _this.storageAdapter ||
                    undefined;
            _this.sessionId = _this.retrieveSessionId();
        };
        this.clear = function clear() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            checkSchemaInitialized();
                            if (!(this.storage === undefined)) return [3 /*break*/, 2];
                            // connect to storage so that it can be cleared without fully starting DataStore
                            this.storage = new storage_1.ExclusiveStorage(schema, namespaceResolver, getModelConstructorByModelName, modelInstanceCreator, this.storageAdapter, this.sessionId);
                            return [4 /*yield*/, this.storage.init()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (syncSubscription && !syncSubscription.closed) {
                                syncSubscription.unsubscribe();
                            }
                            return [4 /*yield*/, this.storage.clear()];
                        case 3:
                            _a.sent();
                            if (this.sync) {
                                this.sync.unsubscribeConnectivity();
                            }
                            this.initialized = undefined; // Should re-initialize when start() is called.
                            this.storage = undefined;
                            this.sync = undefined;
                            this.syncPredicates = new WeakMap();
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.stop = function stop() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(this.initialized !== undefined)) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.start()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (syncSubscription && !syncSubscription.closed) {
                                syncSubscription.unsubscribe();
                            }
                            if (this.sync) {
                                this.sync.unsubscribeConnectivity();
                            }
                            this.initialized = undefined; // Should re-initialize when start() is called.
                            this.sync = undefined;
                            return [2 /*return*/];
                    }
                });
            });
        };
    }
    DataStore.prototype.getModuleName = function () {
        return 'DataStore';
    };
    DataStore.prototype.processPagination = function (modelDefinition, paginationProducer) {
        var sortPredicate;
        var _a = paginationProducer || {}, limit = _a.limit, page = _a.page, sort = _a.sort;
        if (limit === undefined && page === undefined && sort === undefined) {
            return undefined;
        }
        if (page !== undefined && limit === undefined) {
            throw new Error('Limit is required when requesting a page');
        }
        if (page !== undefined) {
            if (typeof page !== 'number') {
                throw new Error('Page should be a number');
            }
            if (page < 0) {
                throw new Error("Page can't be negative");
            }
        }
        if (limit !== undefined) {
            if (typeof limit !== 'number') {
                throw new Error('Limit should be a number');
            }
            if (limit < 0) {
                throw new Error("Limit can't be negative");
            }
        }
        if (sort) {
            sortPredicate = predicates_1.ModelSortPredicateCreator.createFromExisting(modelDefinition, paginationProducer.sort);
        }
        return {
            limit: limit,
            page: page,
            sort: sortPredicate,
        };
    };
    DataStore.prototype.processSyncExpressions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var syncPredicates;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.syncExpressions || !this.syncExpressions.length) {
                            return [2 /*return*/, new WeakMap()];
                        }
                        return [4 /*yield*/, Promise.all(this.syncExpressions.map(function (syncExpression) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, modelConstructor, conditionProducer, modelDefinition, condition, predicate;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, syncExpression];
                                        case 1:
                                            _a = _b.sent(), modelConstructor = _a.modelConstructor, conditionProducer = _a.conditionProducer;
                                            modelDefinition = getModelDefinition(modelConstructor);
                                            return [4 /*yield*/, this.unwrapPromise(conditionProducer)];
                                        case 2:
                                            condition = _b.sent();
                                            if (predicates_1.isPredicatesAll(condition)) {
                                                return [2 /*return*/, [modelDefinition, null]];
                                            }
                                            predicate = this.createFromCondition(modelDefinition, condition);
                                            return [2 /*return*/, [modelDefinition, predicate]];
                                    }
                                });
                            }); }))];
                    case 1:
                        syncPredicates = _a.sent();
                        return [2 /*return*/, this.weakMapFromEntries(syncPredicates)];
                }
            });
        });
    };
    DataStore.prototype.createFromCondition = function (modelDefinition, condition) {
        try {
            return predicates_1.ModelPredicateCreator.createFromExisting(modelDefinition, condition);
        }
        catch (error) {
            logger.error('Error creating Sync Predicate');
            throw error;
        }
    };
    DataStore.prototype.unwrapPromise = function (conditionProducer) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conditionProducer()];
                    case 1:
                        condition = _a.sent();
                        return [2 /*return*/, condition];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1 instanceof TypeError) {
                            return [2 /*return*/, conditionProducer];
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DataStore.prototype.weakMapFromEntries = function (entries) {
        return entries.reduce(function (map, _a) {
            var _b = __read(_a, 2), modelDefinition = _b[0], predicate = _b[1];
            if (map.has(modelDefinition)) {
                var name_2 = modelDefinition.name;
                logger.warn("You can only utilize one Sync Expression per model.\n          Subsequent sync expressions for the " + name_2 + " model will be ignored.");
                return map;
            }
            if (predicate) {
                map.set(modelDefinition, predicate);
            }
            return map;
        }, new WeakMap());
    };
    // database separation for Amplify Console. Not a public API
    DataStore.prototype.retrieveSessionId = function () {
        try {
            var sessionId = sessionStorage.getItem('datastoreSessionId');
            if (sessionId) {
                var aws_appsync_graphqlEndpoint = this.amplifyConfig.aws_appsync_graphqlEndpoint;
                var appSyncUrl = aws_appsync_graphqlEndpoint.split('/')[2];
                var _a = __read(appSyncUrl.split('.'), 1), appSyncId = _a[0];
                return sessionId + "-" + appSyncId;
            }
        }
        catch (_b) {
            return undefined;
        }
    };
    return DataStore;
}());
exports.DataStoreClass = DataStore;
var instance = new DataStore();
exports.DataStore = instance;
core_1.Amplify.register(instance);
//# sourceMappingURL=datastore.js.map