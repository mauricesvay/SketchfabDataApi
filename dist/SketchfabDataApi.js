(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SketchfabDataApi", [], factory);
	else if(typeof exports === 'object')
		exports["SketchfabDataApi"] = factory();
	else
		root["SketchfabDataApi"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Swagger = __webpack_require__( 1 );
	var spec = __webpack_require__( 165 );
	
	function SketchfabDataApi() {
	    return new Swagger( null, {
	        spec: spec,
	        usePromise: true
	    } );
	}
	
	module.exports = SketchfabDataApi;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var auth = __webpack_require__(2);
	var helpers = __webpack_require__(3);
	var SwaggerClient = __webpack_require__(52);
	var deprecationWrapper = function (url, options) {
	  helpers.log('This is deprecated, use "new SwaggerClient" instead.');
	
	  return new SwaggerClient(url, options);
	};
	
	/* Here for IE8 Support */
	if (!Array.prototype.indexOf) {
	  Array.prototype.indexOf = function(obj, start) {
	    for (var i = (start || 0), j = this.length; i < j; i++) {
	      if (this[i] === obj) { return i; }
	    }
	    return -1;
	  };
	}
	
	/* Here for IE8 Support */
	if (!String.prototype.trim) {
	  String.prototype.trim = function () {
	    return this.replace(/^\s+|\s+$/g, '');
	  };
	}
	
	/* Here for node 10.x support */
	if (!String.prototype.endsWith) {
	  String.prototype.endsWith = function(suffix) {
	    return this.indexOf(suffix, this.length - suffix.length) !== -1;
	  };
	}
	
	module.exports = SwaggerClient;
	
	SwaggerClient.ApiKeyAuthorization = auth.ApiKeyAuthorization;
	SwaggerClient.PasswordAuthorization = auth.PasswordAuthorization;
	SwaggerClient.CookieAuthorization = auth.CookieAuthorization;
	SwaggerClient.SwaggerApi = deprecationWrapper;
	SwaggerClient.SwaggerClient = deprecationWrapper;
	SwaggerClient.SchemaMarkup = __webpack_require__(117);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var helpers = __webpack_require__(3);
	var btoa = __webpack_require__(33); // jshint ignore:line
	var CookieJar = __webpack_require__(38).CookieJar;
	var _ = {
	  each: __webpack_require__(39),
	  includes: __webpack_require__(48),
	  isObject: __webpack_require__(10),
	  isArray: __webpack_require__(21)
	};
	
	/**
	 * SwaggerAuthorizations applies the correct authorization to an operation being executed
	 */
	var SwaggerAuthorizations = module.exports.SwaggerAuthorizations = function (authz) {
	  this.authz = authz || {};
	};
	
	/**
	 * Add auths to the hash
	 * Will overwrite any existing
	 *
	 */
	SwaggerAuthorizations.prototype.add = function (name, auth) {
	  if(_.isObject(name)) {
	    for (var key in name) {
	      this.authz[key] = name[key];
	    }
	  } else if(typeof name === 'string' ){
	    this.authz[name] = auth;
	  }
	
	  return auth;
	};
	
	SwaggerAuthorizations.prototype.remove = function (name) {
	  return delete this.authz[name];
	};
	
	SwaggerAuthorizations.prototype.apply = function (obj, securities) {
	  var status = true;
	  var applyAll = !securities;
	  var flattenedSecurities = [];
	
	  // favor the object-level authorizations over global
	  var authz = obj.clientAuthorizations || this.authz;
	
	  // Securities could be [ {} ]
	  _.each(securities, function (obj, key) {
	
	    // Make sure we account for securities being [ str ]
	    if(typeof key === 'string') {
	      flattenedSecurities.push(key);
	    }
	
	    // Flatten keys in to our array
	    _.each(obj, function (val, key) {
	      flattenedSecurities.push(key);
	    });
	  });
	
	  _.each(authz, function (auth, authName) {
	    if(applyAll || _.includes(flattenedSecurities, authName)) {
	      var newStatus = auth.apply(obj);
	      status = status && !!newStatus; // logical ORs regarding status
	    }
	  });
	
	  return status;
	};
	
	/**
	 * ApiKeyAuthorization allows a query param or header to be injected
	 */
	var ApiKeyAuthorization = module.exports.ApiKeyAuthorization = function (name, value, type) {
	  this.name = name;
	  this.value = value;
	  this.type = type;
	};
	
	ApiKeyAuthorization.prototype.apply = function (obj) {
	  if (this.type === 'query') {
	    // see if already applied.  If so, don't do it again
	
	    var qp;
	    if (obj.url.indexOf('?') > 0) {
	      qp = obj.url.substring(obj.url.indexOf('?') + 1);
	      var parts = qp.split('&');
	      if(parts && parts.length > 0) {
	        for(var i = 0; i < parts.length; i++) {
	          var kv = parts[i].split('=');
	          if(kv && kv.length > 0) {
	            if (kv[0] === this.name) {
	              // skip it
	              return false;
	            }
	          }
	        }
	      }
	    }
	
	    if (obj.url.indexOf('?') > 0) {
	      obj.url = obj.url + '&' + this.name + '=' + this.value;
	    } else {
	      obj.url = obj.url + '?' + this.name + '=' + this.value;
	    }
	
	    return true;
	  } else if (this.type === 'header') {
	    if(typeof obj.headers[this.name] === 'undefined') {
	      obj.headers[this.name] = this.value;
	    }
	
	    return true;
	  }
	};
	
	var CookieAuthorization = module.exports.CookieAuthorization = function (cookie) {
	  this.cookie = cookie;
	};
	
	CookieAuthorization.prototype.apply = function (obj) {
	  obj.cookieJar = obj.cookieJar || new CookieJar();
	  obj.cookieJar.setCookie(this.cookie);
	
	  return true;
	};
	
	/**
	 * Password Authorization is a basic auth implementation
	 */
	var PasswordAuthorization = module.exports.PasswordAuthorization = function (username, password) {
	  if (arguments.length === 3) {
	    helpers.log('PasswordAuthorization: the \'name\' argument has been removed, pass only username and password');
	    username = arguments[1];
	    password = arguments[2];
	  }
	  this.username = username;
	  this.password = password;
	};
	
	PasswordAuthorization.prototype.apply = function (obj) {
	  if(typeof obj.headers.Authorization === 'undefined') {
	    obj.headers.Authorization = 'Basic ' + btoa(this.username + ':' + this.password);
	  }
	
	  return true;
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var _ = {
	  isPlainObject: __webpack_require__(5),
	  indexOf: __webpack_require__(27)
	};
	
	module.exports.__bind = function (fn, me) {
	  return function(){
	    return fn.apply(me, arguments);
	  };
	};
	
	var log = module.exports.log = function() {
	  // Only log if available and we're not testing
	  if (console && process.env.NODE_ENV !== 'test') {
	    console.log(Array.prototype.slice.call(arguments)[0]);
	  }
	};
	
	module.exports.fail = function (message) {
	  log(message);
	};
	
	module.exports.optionHtml = function (label, value) {
	  return '<tr><td class="optionName">' + label + ':</td><td>' + value + '</td></tr>';
	};
	
	var resolveSchema = module.exports.resolveSchema = function (schema) {
	  if (_.isPlainObject(schema.schema)) {
	    schema = resolveSchema(schema.schema);
	  }
	
	  return schema;
	};
	
	module.exports.simpleRef = function (name) {
	  if (typeof name === 'undefined') {
	    return null;
	  }
	
	  if (name.indexOf('#/definitions/') === 0) {
	    return name.substring('#/definitions/'.length);
	  } else {
	    return name;
	  }
	};
	
	/**
	 * helper to remove extensions and add them to an object
	 *
	 * @param keyname
	 * @param obj
	 */
	module.exports.extractExtensions = function (keyname, obj, value) {
	  if(!keyname || !obj) {
	    return;
	  }
	
	  if (typeof keyname === 'string' && keyname.indexOf('x-') === 0) {
	    obj.vendorExtensions = obj.vendorExtensions || {};
	    if(value) {
	      obj.vendorExtensions[keyname] = value;
	    }
	    else {
	      obj.vendorExtensions[keyname] = obj[keyname];
	    }
	  }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var baseForIn = __webpack_require__(6),
	    isArguments = __webpack_require__(16),
	    isHostObject = __webpack_require__(25),
	    isObjectLike = __webpack_require__(12),
	    support = __webpack_require__(13);
	
	/** `Object#toString` result references. */
	var objectTag = '[object Object]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * **Note:** This method assumes objects created by the `Object` constructor
	 * have no inherited enumerable properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  var Ctor;
	
	  // Exit early for non `Object` objects.
	  if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isHostObject(value) && !isArguments(value)) ||
	      (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
	    return false;
	  }
	  // IE < 9 iterates inherited properties before own properties. If the first
	  // iterated property is an object's own property then there are no inherited
	  // enumerable properties.
	  var result;
	  if (support.ownLast) {
	    baseForIn(value, function(subValue, key, object) {
	      result = hasOwnProperty.call(object, key);
	      return false;
	    });
	    return result !== false;
	  }
	  // In most environments an object's own properties are iterated before
	  // its inherited properties. If the last iterated property is an object's
	  // own property then there are no inherited enumerable properties.
	  baseForIn(value, function(subValue, key) {
	    result = key;
	  });
	  return result === undefined || hasOwnProperty.call(value, result);
	}
	
	module.exports = isPlainObject;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(7),
	    keysIn = __webpack_require__(14);
	
	/**
	 * The base implementation of `_.forIn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForIn(object, iteratee) {
	  return baseFor(object, iteratee, keysIn);
	}
	
	module.exports = baseForIn;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var createBaseFor = __webpack_require__(8);
	
	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iteratee functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	var baseFor = createBaseFor();
	
	module.exports = baseFor;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(9);
	
	/**
	 * Creates a base function for `_.forIn` or `_.forInRight`.
	 *
	 * @private
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseFor(fromRight) {
	  return function(object, iteratee, keysFunc) {
	    var iterable = toObject(object),
	        props = keysFunc(object),
	        length = props.length,
	        index = fromRight ? length : -1;
	
	    while ((fromRight ? index-- : ++index < length)) {
	      var key = props[index];
	      if (iteratee(iterable[key], key, iterable) === false) {
	        break;
	      }
	    }
	    return object;
	  };
	}
	
	module.exports = createBaseFor;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(10),
	    isString = __webpack_require__(11),
	    support = __webpack_require__(13);
	
	/**
	 * Converts `value` to an object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  if (support.unindexedChars && isString(value)) {
	    var index = -1,
	        length = value.length,
	        result = Object(value);
	
	    while (++index < length) {
	      result[index] = value.charAt(index);
	    }
	    return result;
	  }
	  return isObject(value) ? value : Object(value);
	}
	
	module.exports = toObject;


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(12);
	
	/** `Object#toString` result references. */
	var stringTag = '[object String]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
	}
	
	module.exports = isString;


/***/ },
/* 12 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 13 */
/***/ function(module, exports) {

	/** Used for native method references. */
	var arrayProto = Array.prototype,
	    errorProto = Error.prototype,
	    objectProto = Object.prototype;
	
	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice;
	
	/**
	 * An object environment feature flags.
	 *
	 * @static
	 * @memberOf _
	 * @type Object
	 */
	var support = {};
	
	(function(x) {
	  var Ctor = function() { this.x = x; },
	      object = { '0': x, 'length': x },
	      props = [];
	
	  Ctor.prototype = { 'valueOf': x, 'y': x };
	  for (var key in new Ctor) { props.push(key); }
	
	  /**
	   * Detect if `name` or `message` properties of `Error.prototype` are
	   * enumerable by default (IE < 9, Safari < 5.1).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') ||
	    propertyIsEnumerable.call(errorProto, 'name');
	
	  /**
	   * Detect if `prototype` properties are enumerable by default.
	   *
	   * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
	   * (if the prototype or a property on the prototype has been set)
	   * incorrectly set the `[[Enumerable]]` value of a function's `prototype`
	   * property to `true`.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.enumPrototypes = propertyIsEnumerable.call(Ctor, 'prototype');
	
	  /**
	   * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
	   *
	   * In IE < 9 an object's own properties, shadowing non-enumerable ones,
	   * are made non-enumerable as well (a.k.a the JScript `[[DontEnum]]` bug).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.nonEnumShadows = !/valueOf/.test(props);
	
	  /**
	   * Detect if own properties are iterated after inherited properties (IE < 9).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.ownLast = props[0] != 'x';
	
	  /**
	   * Detect if `Array#shift` and `Array#splice` augment array-like objects
	   * correctly.
	   *
	   * Firefox < 10, compatibility modes of IE 8, and IE < 9 have buggy Array
	   * `shift()` and `splice()` functions that fail to remove the last element,
	   * `value[0]`, of array-like objects even though the "length" property is
	   * set to `0`. The `shift()` method is buggy in compatibility modes of IE 8,
	   * while `splice()` is buggy regardless of mode in IE < 9.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.spliceObjects = (splice.call(object, 0, 1), !object[0]);
	
	  /**
	   * Detect lack of support for accessing string characters by index.
	   *
	   * IE < 8 can't access characters by index. IE 8 can only access characters
	   * by index on string literals, not string objects.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';
	}(1, 0));
	
	module.exports = support;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(15),
	    isArguments = __webpack_require__(16),
	    isArray = __webpack_require__(21),
	    isFunction = __webpack_require__(24),
	    isIndex = __webpack_require__(26),
	    isLength = __webpack_require__(20),
	    isObject = __webpack_require__(10),
	    isString = __webpack_require__(11),
	    support = __webpack_require__(13);
	
	/** `Object#toString` result references. */
	var arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';
	
	/** Used to fix the JScript `[[DontEnum]]` bug. */
	var shadowProps = [
	  'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
	  'toLocaleString', 'toString', 'valueOf'
	];
	
	/** Used for native method references. */
	var errorProto = Error.prototype,
	    objectProto = Object.prototype,
	    stringProto = String.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/** Used to avoid iterating over non-enumerable properties in IE < 9. */
	var nonEnumProps = {};
	nonEnumProps[arrayTag] = nonEnumProps[dateTag] = nonEnumProps[numberTag] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
	nonEnumProps[boolTag] = nonEnumProps[stringTag] = { 'constructor': true, 'toString': true, 'valueOf': true };
	nonEnumProps[errorTag] = nonEnumProps[funcTag] = nonEnumProps[regexpTag] = { 'constructor': true, 'toString': true };
	nonEnumProps[objectTag] = { 'constructor': true };
	
	arrayEach(shadowProps, function(key) {
	  for (var tag in nonEnumProps) {
	    if (hasOwnProperty.call(nonEnumProps, tag)) {
	      var props = nonEnumProps[tag];
	      props[key] = hasOwnProperty.call(props, key);
	    }
	  }
	});
	
	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	
	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object) || isString(object)) && length) || 0;
	
	  var Ctor = object.constructor,
	      index = -1,
	      proto = (isFunction(Ctor) && Ctor.prototype) || objectProto,
	      isProto = proto === object,
	      result = Array(length),
	      skipIndexes = length > 0,
	      skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error),
	      skipProto = support.enumPrototypes && isFunction(object);
	
	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  // lodash skips the `constructor` property when it infers it's iterating
	  // over a `prototype` object because IE < 9 can't set the `[[Enumerable]]`
	  // attribute of an existing property and the `constructor` property of a
	  // prototype defaults to non-enumerable.
	  for (var key in object) {
	    if (!(skipProto && key == 'prototype') &&
	        !(skipErrorProps && (key == 'message' || key == 'name')) &&
	        !(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  if (support.nonEnumShadows && object !== objectProto) {
	    var tag = object === stringProto ? stringTag : (object === errorProto ? errorTag : objToString.call(object)),
	        nonEnums = nonEnumProps[tag] || nonEnumProps[objectTag];
	
	    if (tag == objectTag) {
	      proto = objectProto;
	    }
	    length = shadowProps.length;
	    while (length--) {
	      key = shadowProps[length];
	      var nonEnum = nonEnums[key];
	      if (!(isProto && nonEnum) &&
	          (nonEnum ? hasOwnProperty.call(object, key) : object[key] !== proto[key])) {
	        result.push(key);
	      }
	    }
	  }
	  return result;
	}
	
	module.exports = keysIn;


/***/ },
/* 15 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.forEach` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array.length;
	
	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}
	
	module.exports = arrayEach;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(17),
	    isObjectLike = __webpack_require__(12);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}
	
	module.exports = isArguments;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(18),
	    isLength = __webpack_require__(20);
	
	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}
	
	module.exports = isArrayLike;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(19);
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	module.exports = getLength;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(9);
	
	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : toObject(object)[key];
	  };
	}
	
	module.exports = baseProperty;


/***/ },
/* 20 */
/***/ function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(22),
	    isLength = __webpack_require__(20),
	    isObjectLike = __webpack_require__(12);
	
	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};
	
	module.exports = isArray;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(23);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}
	
	module.exports = getNative;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(24),
	    isHostObject = __webpack_require__(25),
	    isObjectLike = __webpack_require__(12);
	
	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
	}
	
	module.exports = isNative;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(10);
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}
	
	module.exports = isFunction;


/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	var isHostObject = (function() {
	  try {
	    Object({ 'toString': 0 } + '');
	  } catch(e) {
	    return function() { return false; };
	  }
	  return function(value) {
	    // IE < 9 presents many host objects as `Object` objects that can coerce
	    // to strings despite having improperly defined `toString` methods.
	    return typeof value.toString != 'function' && typeof (value + '') == 'string';
	  };
	}());
	
	module.exports = isHostObject;


/***/ },
/* 26 */
/***/ function(module, exports) {

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;
	
	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}
	
	module.exports = isIndex;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(28),
	    binaryIndex = __webpack_require__(30);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Gets the index at which the first occurrence of `value` is found in `array`
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons. If `fromIndex` is negative, it's used as the offset
	 * from the end of `array`. If `array` is sorted providing `true` for `fromIndex`
	 * performs a faster binary search.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {Array} array The array to search.
	 * @param {*} value The value to search for.
	 * @param {boolean|number} [fromIndex=0] The index to search from or `true`
	 *  to perform a binary search on a sorted array.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 * @example
	 *
	 * _.indexOf([1, 2, 1, 2], 2);
	 * // => 1
	 *
	 * // using `fromIndex`
	 * _.indexOf([1, 2, 1, 2], 2, 2);
	 * // => 3
	 *
	 * // performing a binary search
	 * _.indexOf([1, 1, 2, 2], 2, true);
	 * // => 2
	 */
	function indexOf(array, value, fromIndex) {
	  var length = array ? array.length : 0;
	  if (!length) {
	    return -1;
	  }
	  if (typeof fromIndex == 'number') {
	    fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
	  } else if (fromIndex) {
	    var index = binaryIndex(array, value);
	    if (index < length &&
	        (value === value ? (value === array[index]) : (array[index] !== array[index]))) {
	      return index;
	    }
	    return -1;
	  }
	  return baseIndexOf(array, value, fromIndex || 0);
	}
	
	module.exports = indexOf;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var indexOfNaN = __webpack_require__(29);
	
	/**
	 * The base implementation of `_.indexOf` without support for binary searches.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {*} value The value to search for.
	 * @param {number} fromIndex The index to search from.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseIndexOf(array, value, fromIndex) {
	  if (value !== value) {
	    return indexOfNaN(array, fromIndex);
	  }
	  var index = fromIndex - 1,
	      length = array.length;
	
	  while (++index < length) {
	    if (array[index] === value) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseIndexOf;


/***/ },
/* 29 */
/***/ function(module, exports) {

	/**
	 * Gets the index at which the first occurrence of `NaN` is found in `array`.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {number} fromIndex The index to search from.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched `NaN`, else `-1`.
	 */
	function indexOfNaN(array, fromIndex, fromRight) {
	  var length = array.length,
	      index = fromIndex + (fromRight ? 0 : -1);
	
	  while ((fromRight ? index-- : ++index < length)) {
	    var other = array[index];
	    if (other !== other) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = indexOfNaN;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var binaryIndexBy = __webpack_require__(31),
	    identity = __webpack_require__(32);
	
	/** Used as references for the maximum length and index of an array. */
	var MAX_ARRAY_LENGTH = 4294967295,
	    HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
	
	/**
	 * Performs a binary search of `array` to determine the index at which `value`
	 * should be inserted into `array` in order to maintain its sort order.
	 *
	 * @private
	 * @param {Array} array The sorted array to inspect.
	 * @param {*} value The value to evaluate.
	 * @param {boolean} [retHighest] Specify returning the highest qualified index.
	 * @returns {number} Returns the index at which `value` should be inserted
	 *  into `array`.
	 */
	function binaryIndex(array, value, retHighest) {
	  var low = 0,
	      high = array ? array.length : low;
	
	  if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
	    while (low < high) {
	      var mid = (low + high) >>> 1,
	          computed = array[mid];
	
	      if ((retHighest ? (computed <= value) : (computed < value)) && computed !== null) {
	        low = mid + 1;
	      } else {
	        high = mid;
	      }
	    }
	    return high;
	  }
	  return binaryIndexBy(array, value, identity, retHighest);
	}
	
	module.exports = binaryIndex;


/***/ },
/* 31 */
/***/ function(module, exports) {

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeFloor = Math.floor,
	    nativeMin = Math.min;
	
	/** Used as references for the maximum length and index of an array. */
	var MAX_ARRAY_LENGTH = 4294967295,
	    MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1;
	
	/**
	 * This function is like `binaryIndex` except that it invokes `iteratee` for
	 * `value` and each element of `array` to compute their sort ranking. The
	 * iteratee is invoked with one argument; (value).
	 *
	 * @private
	 * @param {Array} array The sorted array to inspect.
	 * @param {*} value The value to evaluate.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {boolean} [retHighest] Specify returning the highest qualified index.
	 * @returns {number} Returns the index at which `value` should be inserted
	 *  into `array`.
	 */
	function binaryIndexBy(array, value, iteratee, retHighest) {
	  value = iteratee(value);
	
	  var low = 0,
	      high = array ? array.length : 0,
	      valIsNaN = value !== value,
	      valIsNull = value === null,
	      valIsUndef = value === undefined;
	
	  while (low < high) {
	    var mid = nativeFloor((low + high) / 2),
	        computed = iteratee(array[mid]),
	        isDef = computed !== undefined,
	        isReflexive = computed === computed;
	
	    if (valIsNaN) {
	      var setLow = isReflexive || retHighest;
	    } else if (valIsNull) {
	      setLow = isReflexive && isDef && (retHighest || computed != null);
	    } else if (valIsUndef) {
	      setLow = isReflexive && (retHighest || isDef);
	    } else if (computed == null) {
	      setLow = false;
	    } else {
	      setLow = retHighest ? (computed <= value) : (computed < value);
	    }
	    if (setLow) {
	      low = mid + 1;
	    } else {
	      high = mid;
	    }
	  }
	  return nativeMin(high, MAX_ARRAY_INDEX);
	}
	
	module.exports = binaryIndexBy;


/***/ },
/* 32 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}
	
	module.exports = identity;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {(function () {
	  "use strict";
	
	  function btoa(str) {
	    var buffer
	      ;
	
	    if (str instanceof Buffer) {
	      buffer = str;
	    } else {
	      buffer = new Buffer(str.toString(), 'binary');
	    }
	
	    return buffer.toString('base64');
	  }
	
	  module.exports = btoa;
	}());
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(34).Buffer))

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */
	
	'use strict'
	
	var base64 = __webpack_require__(35)
	var ieee754 = __webpack_require__(36)
	var isArray = __webpack_require__(37)
	
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	
	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.
	
	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()
	
	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()
	
	function typedArraySupport () {
	  try {
	    var arr = new Uint8Array(1)
	    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
	    return arr.foo() === 42 && // typed array instances can be augmented
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}
	
	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}
	
	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length)
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length)
	    }
	    that.length = length
	  }
	
	  return that
	}
	
	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */
	
	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }
	
	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}
	
	Buffer.poolSize = 8192 // not used by this implementation
	
	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype
	  return arr
	}
	
	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }
	
	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }
	
	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }
	
	  return fromObject(that, value)
	}
	
	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	}
	
	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	  if (typeof Symbol !== 'undefined' && Symbol.species &&
	      Buffer[Symbol.species] === Buffer) {
	    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	    Object.defineProperty(Buffer, Symbol.species, {
	      value: null,
	      configurable: true
	    })
	  }
	}
	
	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}
	
	function alloc (that, size, fill, encoding) {
	  assertSize(size)
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}
	
	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	}
	
	function allocUnsafe (that, size) {
	  assertSize(size)
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0
	    }
	  }
	  return that
	}
	
	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	}
	
	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8'
	  }
	
	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }
	
	  var length = byteLength(string, encoding) | 0
	  that = createBuffer(that, length)
	
	  var actual = that.write(string, encoding)
	
	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual)
	  }
	
	  return that
	}
	
	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0
	  that = createBuffer(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}
	
	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength // this throws if `array` is not a valid ArrayBuffer
	
	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }
	
	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }
	
	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array)
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset)
	  } else {
	    array = new Uint8Array(array, byteOffset, length)
	  }
	
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array)
	  }
	  return that
	}
	
	function fromObject (that, obj) {
	  if (Buffer.isBuffer(obj)) {
	    var len = checked(obj.length) | 0
	    that = createBuffer(that, len)
	
	    if (that.length === 0) {
	      return that
	    }
	
	    obj.copy(that, 0, 0, len)
	    return that
	  }
	
	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }
	
	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }
	
	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}
	
	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}
	
	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0
	  }
	  return Buffer.alloc(+length)
	}
	
	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}
	
	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }
	
	  if (a === b) return 0
	
	  var x = a.length
	  var y = b.length
	
	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i]
	      y = b[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}
	
	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }
	
	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }
	
	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length
	    }
	  }
	
	  var buffer = Buffer.allocUnsafe(length)
	  var pos = 0
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i]
	    if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos)
	    pos += buf.length
	  }
	  return buffer
	}
	
	function byteLength (string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string
	  }
	
	  var len = string.length
	  if (len === 0) return 0
	
	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength
	
	function slowToString (encoding, start, end) {
	  var loweredCase = false
	
	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.
	
	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }
	
	  if (end === undefined || end > this.length) {
	    end = this.length
	  }
	
	  if (end <= 0) {
	    return ''
	  }
	
	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0
	  start >>>= 0
	
	  if (end <= start) {
	    return ''
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)
	
	      case 'ascii':
	        return asciiSlice(this, start, end)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)
	
	      case 'base64':
	        return base64Slice(this, start, end)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true
	
	function swap (b, n, m) {
	  var i = b[n]
	  b[n] = b[m]
	  b[m] = i
	}
	
	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1)
	  }
	  return this
	}
	
	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3)
	    swap(this, i + 1, i + 2)
	  }
	  return this
	}
	
	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7)
	    swap(this, i + 1, i + 6)
	    swap(this, i + 2, i + 5)
	    swap(this, i + 3, i + 4)
	  }
	  return this
	}
	
	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}
	
	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}
	
	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}
	
	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }
	
	  if (start === undefined) {
	    start = 0
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0
	  }
	  if (thisStart === undefined) {
	    thisStart = 0
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length
	  }
	
	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }
	
	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }
	
	  start >>>= 0
	  end >>>= 0
	  thisStart >>>= 0
	  thisEnd >>>= 0
	
	  if (this === target) return 0
	
	  var x = thisEnd - thisStart
	  var y = end - start
	  var len = Math.min(x, y)
	
	  var thisCopy = this.slice(thisStart, thisEnd)
	  var targetCopy = target.slice(start, end)
	
	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i]
	      y = targetCopy[i]
	      break
	    }
	  }
	
	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}
	
	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1
	
	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset
	    byteOffset = 0
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000
	  }
	  byteOffset = +byteOffset  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1)
	  }
	
	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0
	    else return -1
	  }
	
	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding)
	  }
	
	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
	  }
	
	  throw new TypeError('val must be string, number or Buffer')
	}
	
	function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1
	  var arrLength = arr.length
	  var valLength = val.length
	
	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase()
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2
	      arrLength /= 2
	      valLength /= 2
	      byteOffset /= 2
	    }
	  }
	
	  function read (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }
	
	  var i
	  if (dir) {
	    var foundIndex = -1
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex
	        foundIndex = -1
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true
	      for (var j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false
	          break
	        }
	      }
	      if (found) return i
	    }
	  }
	
	  return -1
	}
	
	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	}
	
	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	}
	
	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	}
	
	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }
	
	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')
	
	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed
	  }
	  return i
	}
	
	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}
	
	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}
	
	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}
	
	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}
	
	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }
	
	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining
	
	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }
	
	  if (!encoding) encoding = 'utf8'
	
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)
	
	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)
	
	      case 'ascii':
	        return asciiWrite(this, string, offset, length)
	
	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)
	
	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)
	
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)
	
	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	
	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}
	
	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}
	
	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []
	
	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1
	
	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint
	
	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }
	
	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }
	
	    res.push(codePoint)
	    i += bytesPerSequence
	  }
	
	  return decodeCodePointsArray(res)
	}
	
	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000
	
	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }
	
	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}
	
	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}
	
	function latin1Slice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)
	
	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}
	
	function hexSlice (buf, start, end) {
	  var len = buf.length
	
	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len
	
	  var out = ''
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i])
	  }
	  return out
	}
	
	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}
	
	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end
	
	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }
	
	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }
	
	  if (end < start) end = start
	
	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end)
	    newBuf.__proto__ = Buffer.prototype
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start]
	    }
	  }
	
	  return newBuf
	}
	
	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}
	
	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }
	
	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }
	
	  return val
	}
	
	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}
	
	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}
	
	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}
	
	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}
	
	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}
	
	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)
	
	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80
	
	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)
	
	  return val
	}
	
	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}
	
	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}
	
	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}
	
	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	
	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}
	
	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}
	
	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}
	
	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}
	
	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}
	
	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}
	
	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1
	    checkInt(this, value, offset, byteLength, maxBytes, 0)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}
	
	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}
	
	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = 0
	  var mul = 1
	  var sub = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)
	
	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }
	
	  var i = byteLength - 1
	  var mul = 1
	  var sub = 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }
	
	  return offset + byteLength
	}
	
	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}
	
	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}
	
	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}
	
	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}
	
	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}
	
	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}
	
	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}
	
	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}
	
	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}
	
	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}
	
	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start
	
	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0
	
	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')
	
	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }
	
	  var len = end - start
	  var i
	
	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    )
	  }
	
	  return len
	}
	
	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start
	      start = 0
	      end = this.length
	    } else if (typeof end === 'string') {
	      encoding = end
	      end = this.length
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0)
	      if (code < 256) {
	        val = code
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255
	  }
	
	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }
	
	  if (end <= start) {
	    return this
	  }
	
	  start = start >>> 0
	  end = end === undefined ? this.length : end >>> 0
	
	  if (!val) val = 0
	
	  var i
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val
	    }
	  } else {
	    var bytes = Buffer.isBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString())
	    var len = bytes.length
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len]
	    }
	  }
	
	  return this
	}
	
	// HELPER FUNCTIONS
	// ================
	
	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g
	
	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}
	
	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}
	
	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}
	
	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []
	
	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i)
	
	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }
	
	        // valid lead
	        leadSurrogate = codePoint
	
	        continue
	      }
	
	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }
	
	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }
	
	    leadSurrogate = null
	
	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }
	
	  return bytes
	}
	
	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}
	
	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break
	
	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }
	
	  return byteArray
	}
	
	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}
	
	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}
	
	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(34).Buffer, (function() { return this; }())))

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict'
	
	exports.byteLength = byteLength
	exports.toByteArray = toByteArray
	exports.fromByteArray = fromByteArray
	
	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
	
	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i]
	  revLookup[code.charCodeAt(i)] = i
	}
	
	revLookup['-'.charCodeAt(0)] = 62
	revLookup['_'.charCodeAt(0)] = 63
	
	function placeHoldersCount (b64) {
	  var len = b64.length
	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }
	
	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
	}
	
	function byteLength (b64) {
	  // base64 is 4/3 + up to two characters of the original data
	  return b64.length * 3 / 4 - placeHoldersCount(b64)
	}
	
	function toByteArray (b64) {
	  var i, j, l, tmp, placeHolders, arr
	  var len = b64.length
	  placeHolders = placeHoldersCount(b64)
	
	  arr = new Arr(len * 3 / 4 - placeHolders)
	
	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len
	
	  var L = 0
	
	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	    arr[L++] = (tmp >> 16) & 0xFF
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }
	
	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	    arr[L++] = tmp & 0xFF
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	    arr[L++] = (tmp >> 8) & 0xFF
	    arr[L++] = tmp & 0xFF
	  }
	
	  return arr
	}
	
	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}
	
	function encodeChunk (uint8, start, end) {
	  var tmp
	  var output = []
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	    output.push(tripletToBase64(tmp))
	  }
	  return output.join('')
	}
	
	function fromByteArray (uint8) {
	  var tmp
	  var len = uint8.length
	  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	  var output = ''
	  var parts = []
	  var maxChunkLength = 16383 // must be multiple of 3
	
	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	  }
	
	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1]
	    output += lookup[tmp >> 2]
	    output += lookup[(tmp << 4) & 0x3F]
	    output += '=='
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	    output += lookup[tmp >> 10]
	    output += lookup[(tmp >> 4) & 0x3F]
	    output += lookup[(tmp << 2) & 0x3F]
	    output += '='
	  }
	
	  parts.push(output)
	
	  return parts.join('')
	}


/***/ },
/* 36 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]
	
	  i += d
	
	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
	
	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}
	
	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
	
	  value = Math.abs(value)
	
	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }
	
	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }
	
	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
	
	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
	
	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 37 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 38 */
/***/ function(module, exports) {

	/* jshint node: true */
	(function () {
	    "use strict";
	
	    function CookieAccessInfo(domain, path, secure, script) {
	        if (this instanceof CookieAccessInfo) {
	            this.domain = domain || undefined;
	            this.path = path || "/";
	            this.secure = !!secure;
	            this.script = !!script;
	            return this;
	        }
	        return new CookieAccessInfo(domain, path, secure, script);
	    }
	    CookieAccessInfo.All = Object.freeze(Object.create(null));
	    exports.CookieAccessInfo = CookieAccessInfo;
	
	    function Cookie(cookiestr, request_domain, request_path) {
	        if (cookiestr instanceof Cookie) {
	            return cookiestr;
	        }
	        if (this instanceof Cookie) {
	            this.name = null;
	            this.value = null;
	            this.expiration_date = Infinity;
	            this.path = String(request_path || "/");
	            this.explicit_path = false;
	            this.domain = request_domain || null;
	            this.explicit_domain = false;
	            this.secure = false; //how to define default?
	            this.noscript = false; //httponly
	            if (cookiestr) {
	                this.parse(cookiestr, request_domain, request_path);
	            }
	            return this;
	        }
	        return new Cookie(cookiestr, request_domain, request_path);
	    }
	    exports.Cookie = Cookie;
	
	    Cookie.prototype.toString = function toString() {
	        var str = [this.name + "=" + this.value];
	        if (this.expiration_date !== Infinity) {
	            str.push("expires=" + (new Date(this.expiration_date)).toGMTString());
	        }
	        if (this.domain) {
	            str.push("domain=" + this.domain);
	        }
	        if (this.path) {
	            str.push("path=" + this.path);
	        }
	        if (this.secure) {
	            str.push("secure");
	        }
	        if (this.noscript) {
	            str.push("httponly");
	        }
	        return str.join("; ");
	    };
	
	    Cookie.prototype.toValueString = function toValueString() {
	        return this.name + "=" + this.value;
	    };
	
	    var cookie_str_splitter = /[:](?=\s*[a-zA-Z0-9_\-]+\s*[=])/g;
	    Cookie.prototype.parse = function parse(str, request_domain, request_path) {
	        if (this instanceof Cookie) {
	            var parts = str.split(";").filter(function (value) {
	                    return !!value;
	                }),
	                pair = parts[0].match(/([^=]+)=([\s\S]*)/),
	                key = pair[1],
	                value = pair[2],
	                i;
	            this.name = key;
	            this.value = value;
	
	            for (i = 1; i < parts.length; i += 1) {
	                pair = parts[i].match(/([^=]+)(?:=([\s\S]*))?/);
	                key = pair[1].trim().toLowerCase();
	                value = pair[2];
	                switch (key) {
	                case "httponly":
	                    this.noscript = true;
	                    break;
	                case "expires":
	                    this.expiration_date = value ?
	                            Number(Date.parse(value)) :
	                            Infinity;
	                    break;
	                case "path":
	                    this.path = value ?
	                            value.trim() :
	                            "";
	                    this.explicit_path = true;
	                    break;
	                case "domain":
	                    this.domain = value ?
	                            value.trim() :
	                            "";
	                    this.explicit_domain = !!this.domain;
	                    break;
	                case "secure":
	                    this.secure = true;
	                    break;
	                }
	            }
	
	            if (!this.explicit_path) {
	               this.path = request_path || "/";
	            }
	            if (!this.explicit_domain) {
	               this.domain = request_domain;
	            }
	
	            return this;
	        }
	        return new Cookie().parse(str, request_domain, request_path);
	    };
	
	    Cookie.prototype.matches = function matches(access_info) {
	        if (access_info === CookieAccessInfo.All) {
	          return true;
	        }
	        if (this.noscript && access_info.script ||
	                this.secure && !access_info.secure ||
	                !this.collidesWith(access_info)) {
	            return false;
	        }
	        return true;
	    };
	
	    Cookie.prototype.collidesWith = function collidesWith(access_info) {
	        if ((this.path && !access_info.path) || (this.domain && !access_info.domain)) {
	            return false;
	        }
	        if (this.path && access_info.path.indexOf(this.path) !== 0) {
	            return false;
	        }
	        if (this.explicit_path && access_info.path.indexOf( this.path ) !== 0) {
	           return false;
	        }
	        var access_domain = access_info.domain && access_info.domain.replace(/^[\.]/,'');
	        var cookie_domain = this.domain && this.domain.replace(/^[\.]/,'');
	        if (cookie_domain === access_domain) {
	            return true;
	        }
	        if (cookie_domain) {
	            if (!this.explicit_domain) {
	                return false; // we already checked if the domains were exactly the same
	            }
	            var wildcard = access_domain.indexOf(cookie_domain);
	            if (wildcard === -1 || wildcard !== access_domain.length - cookie_domain.length) {
	                return false;
	            }
	            return true;
	        }
	        return true;
	    };
	
	    function CookieJar() {
	        var cookies, cookies_list, collidable_cookie;
	        if (this instanceof CookieJar) {
	            cookies = Object.create(null); //name: [Cookie]
	
	            this.setCookie = function setCookie(cookie, request_domain, request_path) {
	                var remove, i;
	                cookie = new Cookie(cookie, request_domain, request_path);
	                //Delete the cookie if the set is past the current time
	                remove = cookie.expiration_date <= Date.now();
	                if (cookies[cookie.name] !== undefined) {
	                    cookies_list = cookies[cookie.name];
	                    for (i = 0; i < cookies_list.length; i += 1) {
	                        collidable_cookie = cookies_list[i];
	                        if (collidable_cookie.collidesWith(cookie)) {
	                            if (remove) {
	                                cookies_list.splice(i, 1);
	                                if (cookies_list.length === 0) {
	                                    delete cookies[cookie.name];
	                                }
	                                return false;
	                            }
	                            cookies_list[i] = cookie;
	                            return cookie;
	                        }
	                    }
	                    if (remove) {
	                        return false;
	                    }
	                    cookies_list.push(cookie);
	                    return cookie;
	                }
	                if (remove) {
	                    return false;
	                }
	                cookies[cookie.name] = [cookie];
	                return cookies[cookie.name];
	            };
	            //returns a cookie
	            this.getCookie = function getCookie(cookie_name, access_info) {
	                var cookie, i;
	                cookies_list = cookies[cookie_name];
	                if (!cookies_list) {
	                    return;
	                }
	                for (i = 0; i < cookies_list.length; i += 1) {
	                    cookie = cookies_list[i];
	                    if (cookie.expiration_date <= Date.now()) {
	                        if (cookies_list.length === 0) {
	                            delete cookies[cookie.name];
	                        }
	                        continue;
	                    }
	
	                    if (cookie.matches(access_info)) {
	                        return cookie;
	                    }
	                }
	            };
	            //returns a list of cookies
	            this.getCookies = function getCookies(access_info) {
	                var matches = [], cookie_name, cookie;
	                for (cookie_name in cookies) {
	                    cookie = this.getCookie(cookie_name, access_info);
	                    if (cookie) {
	                        matches.push(cookie);
	                    }
	                }
	                matches.toString = function toString() {
	                    return matches.join(":");
	                };
	                matches.toValueString = function toValueString() {
	                    return matches.map(function (c) {
	                        return c.toValueString();
	                    }).join(';');
	                };
	                return matches;
	            };
	
	            return this;
	        }
	        return new CookieJar();
	    }
	    exports.CookieJar = CookieJar;
	
	    //returns list of cookies that were set correctly. Cookies that are expired and removed are not returned.
	    CookieJar.prototype.setCookies = function setCookies(cookies, request_domain, request_path) {
	        cookies = Array.isArray(cookies) ?
	                cookies :
	                cookies.split(cookie_str_splitter);
	        var successful = [],
	            i,
	            cookie;
	        cookies = cookies.map(function(item){
	            return new Cookie(item, request_domain, request_path);
	        });
	        for (i = 0; i < cookies.length; i += 1) {
	            cookie = cookies[i];
	            if (this.setCookie(cookie, request_domain, request_path)) {
	                successful.push(cookie);
	            }
	        }
	        return successful;
	    };
	}());


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(40);


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEach = __webpack_require__(15),
	    baseEach = __webpack_require__(41),
	    createForEach = __webpack_require__(46);
	
	/**
	 * Iterates over elements of `collection` invoking `iteratee` for each element.
	 * The `iteratee` is bound to `thisArg` and invoked with three arguments:
	 * (value, index|key, collection). Iteratee functions may exit iteration early
	 * by explicitly returning `false`.
	 *
	 * **Note:** As with other "Collections" methods, objects with a "length" property
	 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
	 * may be used for object iteration.
	 *
	 * @static
	 * @memberOf _
	 * @alias each
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Array|Object|string} Returns `collection`.
	 * @example
	 *
	 * _([1, 2]).forEach(function(n) {
	 *   console.log(n);
	 * }).value();
	 * // => logs each value from left to right and returns the array
	 *
	 * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
	 *   console.log(n, key);
	 * });
	 * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
	 */
	var forEach = createForEach(arrayEach, baseEach);
	
	module.exports = forEach;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(42),
	    createBaseEach = __webpack_require__(45);
	
	/**
	 * The base implementation of `_.forEach` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object|string} Returns `collection`.
	 */
	var baseEach = createBaseEach(baseForOwn);
	
	module.exports = baseEach;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(7),
	    keys = __webpack_require__(43);
	
	/**
	 * The base implementation of `_.forOwn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return baseFor(object, iteratee, keys);
	}
	
	module.exports = baseForOwn;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(22),
	    isArrayLike = __webpack_require__(17),
	    isObject = __webpack_require__(10),
	    shimKeys = __webpack_require__(44),
	    support = __webpack_require__(13);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object == 'function' ? support.enumPrototypes : isArrayLike(object))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};
	
	module.exports = keys;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(16),
	    isArray = __webpack_require__(21),
	    isIndex = __webpack_require__(26),
	    isLength = __webpack_require__(20),
	    isString = __webpack_require__(11),
	    keysIn = __webpack_require__(14);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;
	
	  var allowIndexes = !!length && isLength(length) &&
	    (isArray(object) || isArguments(object) || isString(object));
	
	  var index = -1,
	      result = [];
	
	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = shimKeys;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(18),
	    isLength = __webpack_require__(20),
	    toObject = __webpack_require__(9);
	
	/**
	 * Creates a `baseEach` or `baseEachRight` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new base function.
	 */
	function createBaseEach(eachFunc, fromRight) {
	  return function(collection, iteratee) {
	    var length = collection ? getLength(collection) : 0;
	    if (!isLength(length)) {
	      return eachFunc(collection, iteratee);
	    }
	    var index = fromRight ? length : -1,
	        iterable = toObject(collection);
	
	    while ((fromRight ? index-- : ++index < length)) {
	      if (iteratee(iterable[index], index, iterable) === false) {
	        break;
	      }
	    }
	    return collection;
	  };
	}
	
	module.exports = createBaseEach;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(47),
	    isArray = __webpack_require__(21);
	
	/**
	 * Creates a function for `_.forEach` or `_.forEachRight`.
	 *
	 * @private
	 * @param {Function} arrayFunc The function to iterate over an array.
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @returns {Function} Returns the new each function.
	 */
	function createForEach(arrayFunc, eachFunc) {
	  return function(collection, iteratee, thisArg) {
	    return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
	      ? arrayFunc(collection, iteratee)
	      : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
	  };
	}
	
	module.exports = createForEach;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(32);
	
	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (thisArg === undefined) {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	    case 5: return function(value, other, key, object, source) {
	      return func.call(thisArg, value, other, key, object, source);
	    };
	  }
	  return function() {
	    return func.apply(thisArg, arguments);
	  };
	}
	
	module.exports = bindCallback;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var baseIndexOf = __webpack_require__(28),
	    getLength = __webpack_require__(18),
	    isArray = __webpack_require__(21),
	    isIterateeCall = __webpack_require__(49),
	    isLength = __webpack_require__(20),
	    isString = __webpack_require__(11),
	    values = __webpack_require__(50);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Checks if `target` is in `collection` using
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
	 * for equality comparisons. If `fromIndex` is negative, it's used as the offset
	 * from the end of `collection`.
	 *
	 * @static
	 * @memberOf _
	 * @alias contains, include
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to search.
	 * @param {*} target The value to search for.
	 * @param {number} [fromIndex=0] The index to search from.
	 * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
	 * @returns {boolean} Returns `true` if a matching element is found, else `false`.
	 * @example
	 *
	 * _.includes([1, 2, 3], 1);
	 * // => true
	 *
	 * _.includes([1, 2, 3], 1, 2);
	 * // => false
	 *
	 * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
	 * // => true
	 *
	 * _.includes('pebbles', 'eb');
	 * // => true
	 */
	function includes(collection, target, fromIndex, guard) {
	  var length = collection ? getLength(collection) : 0;
	  if (!isLength(length)) {
	    collection = values(collection);
	    length = collection.length;
	  }
	  if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
	    fromIndex = 0;
	  } else {
	    fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
	  }
	  return (typeof collection == 'string' || !isArray(collection) && isString(collection))
	    ? (fromIndex <= length && collection.indexOf(target, fromIndex) > -1)
	    : (!!length && baseIndexOf(collection, target, fromIndex) > -1);
	}
	
	module.exports = includes;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(17),
	    isIndex = __webpack_require__(26),
	    isObject = __webpack_require__(10);
	
	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	      ? (isArrayLike(object) && isIndex(index, object.length))
	      : (type == 'string' && index in object)) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}
	
	module.exports = isIterateeCall;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	var baseValues = __webpack_require__(51),
	    keys = __webpack_require__(43);
	
	/**
	 * Creates an array of the own enumerable property values of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property values.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.values(new Foo);
	 * // => [1, 2] (iteration order is not guaranteed)
	 *
	 * _.values('hi');
	 * // => ['h', 'i']
	 */
	function values(object) {
	  return baseValues(object, keys(object));
	}
	
	module.exports = values;


/***/ },
/* 51 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.values` and `_.valuesIn` which creates an
	 * array of `object` property values corresponding to the property names
	 * of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the array of property values.
	 */
	function baseValues(object, props) {
	  var index = -1,
	      length = props.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = object[props[index]];
	  }
	  return result;
	}
	
	module.exports = baseValues;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = {
	  bind: __webpack_require__(53),
	  cloneDeep: __webpack_require__(81),
	  find: __webpack_require__(89),
	  forEach: __webpack_require__(40),
	  indexOf: __webpack_require__(27),
	  isArray: __webpack_require__(21),
	  isObject: __webpack_require__(10),
	  isFunction: __webpack_require__(24),
	  isPlainObject: __webpack_require__(5),
	  isUndefined: __webpack_require__(115)
	};
	var auth = __webpack_require__(2);
	var helpers = __webpack_require__(3);
	var Model = __webpack_require__(116);
	var Operation = __webpack_require__(153);
	var OperationGroup = __webpack_require__(162);
	var Resolver = __webpack_require__(163);
	var SwaggerHttp = __webpack_require__(154);
	var SwaggerSpecConverter = __webpack_require__(164);
	var Q = __webpack_require__(160);
	
	// We have to keep track of the function/property names to avoid collisions for tag names which are used to allow the
	// following usage: 'client.{tagName}'
	var reservedClientTags = [
	  'apis',
	  'authorizationScheme',
	  'authorizations',
	  'basePath',
	  'build',
	  'buildFrom1_1Spec',
	  'buildFrom1_2Spec',
	  'buildFromSpec',
	  'clientAuthorizations',
	  'convertInfo',
	  'debug',
	  'defaultErrorCallback',
	  'defaultSuccessCallback',
	  'enableCookies',
	  'fail',
	  'failure',
	  'finish',
	  'help',
	  'host',
	  'idFromOp',
	  'info',
	  'initialize',
	  'isBuilt',
	  'isValid',
	  'modelPropertyMacro',
	  'models',
	  'modelsArray',
	  'options',
	  'parameterMacro',
	  'parseUri',
	  'progress',
	  'resourceCount',
	  'sampleModels',
	  'selfReflect',
	  'setConsolidatedModels',
	  'spec',
	  'supportedSubmitMethods',
	  'swaggerRequestHeaders',
	  'tagFromLabel',
	  'title',
	  'url',
	  'useJQuery',
	  'jqueryAjaxCache'
	];
	// We have to keep track of the function/property names to avoid collisions for tag names which are used to allow the
	// following usage: 'client.apis.{tagName}'
	var reservedApiTags = [
	  'apis',
	  'asCurl',
	  'description',
	  'externalDocs',
	  'help',
	  'label',
	  'name',
	  'operation',
	  'operations',
	  'operationsArray',
	  'path',
	  'tag'
	];
	var supportedOperationMethods = ['delete', 'get', 'head', 'options', 'patch', 'post', 'put'];
	var SwaggerClient = module.exports = function (url, options) {
	  this.authorizations = null;
	  this.authorizationScheme = null;
	  this.basePath = null;
	  this.debug = false;
	  this.enableCookies = false;
	  this.info = null;
	  this.isBuilt = false;
	  this.isValid = false;
	  this.modelsArray = [];
	  this.resourceCount = 0;
	  this.url = null;
	  this.useJQuery = false;
	  this.jqueryAjaxCache = false;
	  this.swaggerObject = {};
	  this.deferredClient = undefined;
	
	  this.clientAuthorizations = new auth.SwaggerAuthorizations();
	
	  if (typeof url !== 'undefined') {
	    return this.initialize(url, options);
	  } else {
	    return this;
	  }
	};
	
	SwaggerClient.prototype.initialize = function (url, options) {
	  this.models = {};
	  this.sampleModels = {};
	
	  if (typeof url === 'string') {
	    this.url = url;
	  } else if (_.isObject(url)) {
	    options = url;
	    this.url = options.url;
	  }
	
	  if(this.url && this.url.indexOf('http:') === -1 && this.url.indexOf('https:') === -1) {
	    // no protocol, so we can only use window if it exists
	    if(typeof(window) !== 'undefined' && window && window.location) {
	      this.url = window.location.origin + this.url;
	    }
	  }
	
	  options = options || {};
	  this.clientAuthorizations.add(options.authorizations);
	  this.swaggerRequestHeaders = options.swaggerRequestHeaders || 'application/json;charset=utf-8,*/*';
	  this.defaultSuccessCallback = options.defaultSuccessCallback || null;
	  this.defaultErrorCallback = options.defaultErrorCallback || null;
	  this.modelPropertyMacro = options.modelPropertyMacro || null;
	  this.connectionAgent = options.connectionAgent || null;
	  this.parameterMacro = options.parameterMacro || null;
	  this.usePromise = options.usePromise || null;
	
	  // operation request timeout default
	  this.timeout = options.timeout || null;
	  // default to request timeout when not specified
	  this.fetchSpecTimeout = typeof options.fetchSpecTimeout !== 'undefined' ?
	      options.fetchSpecTimeout : options.timeout || null;
	
	  if(this.usePromise) {
	    this.deferredClient = Q.defer();
	  }
	
	  if (typeof options.success === 'function') {
	    this.success = options.success;
	  }
	  if (options.useJQuery) {
	    this.useJQuery = options.useJQuery;
	  }
	
	  if (options.jqueryAjaxCache) {
	    this.jqueryAjaxCache = options.jqueryAjaxCache;
	  }
	
	  if (options.enableCookies) {
	    this.enableCookies = options.enableCookies;
	  }
	
	  this.options = options || {};
	
	  // maybe don't need this?
	  this.options.timeout = this.timeout;
	  this.options.fetchSpecTimeout = this.fetchSpecTimeout;
	
	  this.supportedSubmitMethods = options.supportedSubmitMethods || [];
	  this.failure = options.failure || function (err) { throw err; };
	  this.progress = options.progress || function () {};
	  this.spec = _.cloneDeep(options.spec); // Clone so we do not alter the provided document
	
	  if (options.scheme) {
	    this.scheme = options.scheme;
	  }
	
	  if (this.usePromise || typeof options.success === 'function') {
	    this.ready = true;
	    return this.build();
	  }
	};
	
	SwaggerClient.prototype.build = function (mock) {
	  if (this.isBuilt) {
	    return this;
	  }
	
	  var self = this;
	
	  if (this.spec) {
	    this.progress('fetching resource list; Please wait.');
	  } else {
	    this.progress('fetching resource list: ' + this.url + '; Please wait.');
	  }
	
	  var obj = {
	    useJQuery: this.useJQuery,
	    jqueryAjaxCache: this.jqueryAjaxCache,
	    connectionAgent: this.connectionAgent,
	    url: this.url,
	    method: 'get',
	    headers: {
	      accept: this.swaggerRequestHeaders
	    },
	    on: {
	      error: function (response) {
	        if (self.url.substring(0, 4) !== 'http') {
	          return self.fail('Please specify the protocol for ' + self.url);
	        } else if (response.errObj && (response.errObj.code === 'ECONNABORTED' || response.errObj.message.indexOf('timeout') !== -1)) {
	          return self.fail('Request timed out after ' + self.fetchSpecTimeout + 'ms');
	        } else if (response.status === 0) {
	          return self.fail('Can\'t read from server.  It may not have the appropriate access-control-origin settings.');
	        } else if (response.status === 404) {
	          return self.fail('Can\'t read swagger JSON from ' + self.url);
	        } else {
	          return self.fail(response.status + ' : ' + response.statusText + ' ' + self.url);
	        }
	      },
	      response: function (resp) {
	
	        var responseObj = resp.obj;
	        if(!responseObj) {
	          return self.fail('failed to parse JSON/YAML response');
	        }
	
	        self.swaggerVersion = responseObj.swaggerVersion;
	        self.swaggerObject = responseObj;
	
	        if (responseObj.swagger && parseInt(responseObj.swagger) === 2) {
	          self.swaggerVersion = responseObj.swagger;
	
	          new Resolver().resolve(responseObj, self.url, self.buildFromSpec, self);
	
	          self.isValid = true;
	        } else {
	          var converter = new SwaggerSpecConverter();
	          self.oldSwaggerObject = self.swaggerObject;
	
	          converter.setDocumentationLocation(self.url);
	          converter.convert(responseObj, self.clientAuthorizations, self.options, function(spec) {
	            self.swaggerObject = spec;
	            new Resolver().resolve(spec, self.url, self.buildFromSpec, self);
	            self.isValid = true;
	          });
	        }
	      }
	    }
	  };
	
	  // only set timeout when specified
	  if (this.fetchSpecTimeout) {
	    obj.timeout = this.fetchSpecTimeout;
	  }
	
	  if (this.spec) {
	    self.swaggerObject = this.spec;
	    setTimeout(function () {
	      new Resolver().resolve(self.spec, self.url, self.buildFromSpec, self);
	    }, 10);
	  } else {
	    this.clientAuthorizations.apply(obj);
	
	    if (mock) {
	      return obj;
	    }
	
	    new SwaggerHttp().execute(obj, this.options);
	  }
	
	  return (this.usePromise) ? this.deferredClient.promise : this;
	};
	
	SwaggerClient.prototype.buildFromSpec = function (response) {
	  if (this.isBuilt) {
	    return this;
	  }
	
	  this.apis = {};
	  this.apisArray = [];
	  this.basePath = response.basePath || '';
	  this.consumes = response.consumes;
	  this.host = response.host || '';
	  this.info = response.info || {};
	  this.produces = response.produces;
	  this.schemes = response.schemes || [];
	  this.securityDefinitions = _.cloneDeep(response.securityDefinitions);
	  this.security = response.security;
	  this.title = response.title || '';
	
	  var key, definedTags = {}, k, location, self = this, i;
	
	  if (response.externalDocs) {
	    this.externalDocs = response.externalDocs;
	  }
	
	  // legacy support
	  this.authSchemes = this.securityDefinitions;
	
	  if(this.securityDefinitions) {
	    for(key in this.securityDefinitions) {
	      var securityDefinition = this.securityDefinitions[key];
	      securityDefinition.vendorExtensions = {};
	      for(var ext in securityDefinition) {
	        helpers.extractExtensions(ext, securityDefinition);
	        if (ext === 'scopes') {
	          var scopes = securityDefinition[ext];
	          if(typeof scopes === 'object') {
	            scopes.vendorExtensions = {};
	            for (var s in scopes) {
	              helpers.extractExtensions(s, scopes);
	            }
	          }
	        }
	      }
	    }
	  }
	
	  if (Array.isArray(response.tags)) {
	    definedTags = {};
	
	    for (k = 0; k < response.tags.length; k++) {
	      var t = _.cloneDeep(response.tags[k]);
	      definedTags[t.name] = t;
	      for(i in t) {
	        if(i === 'externalDocs' && typeof t[i] === 'object') {
	          for(var j in t[i]) {
	            helpers.extractExtensions(j, t[i]);
	          }
	        }
	        helpers.extractExtensions(i, t);
	      }
	    }
	  }
	
	
	  if (typeof this.url === 'string') {
	    location = this.parseUri(this.url);
	    if (typeof this.scheme === 'undefined' && typeof this.schemes === 'undefined' || this.schemes.length === 0) {
	      if(typeof window !== 'undefined') {
	        // use the window scheme
	        this.scheme = window.location.protocol.replace(':','');
	      }
	      else {
	        this.scheme = location.scheme || 'http';
	      }
	    } else if (typeof this.scheme === 'undefined') {
	      if(typeof window !== 'undefined') {
	        var scheme = window.location.protocol.replace(':','');
	        if(scheme === 'https' && this.schemes.indexOf(scheme) === -1) {
	          // can't call http from https served page in a browser!
	          helpers.log('Cannot call a http server from https inside a browser!');
	          this.scheme = 'http';
	        }
	        else if(this.schemes.indexOf(scheme) !== -1) {
	          this.scheme = scheme;
	        }
	        else {
	          if(this.schemes.indexOf('https') !== -1) {
	            this.scheme = 'https';
	          }
	          else {
	            this.scheme = 'http';
	          }
	        }
	      }
	      else {
	        this.scheme = this.schemes[0] || location.scheme;
	      }
	    }
	
	    if (typeof this.host === 'undefined' || this.host === '') {
	      this.host = location.host;
	
	      if (location.port) {
	        this.host = this.host + ':' + location.port;
	      }
	    }
	  }
	  else {
	    if (typeof this.schemes === 'undefined' || this.schemes.length === 0) {
	      this.scheme = 'http';
	    }
	    else if (typeof this.scheme === 'undefined') {
	      this.scheme = this.schemes[0];
	    }
	  }
	
	  this.definitions = response.definitions;
	
	  for (key in this.definitions) {
	    var model = new Model(key, this.definitions[key], this.models, this.modelPropertyMacro);
	
	    if (model) {
	      this.models[key] = model;
	    }
	  }
	
	  // get paths, create functions for each operationId
	  
	  // Bind help to 'client.apis'
	  self.apis.help = _.bind(self.help, self);
	
	  _.forEach(response.paths, function (pathObj, path) {
	    // Only process a path if it's an object
	    if (!_.isPlainObject(pathObj)) {
	      return;
	    }
	
	    _.forEach(supportedOperationMethods, function (method) {
	      var operation = pathObj[method];
	
	      if (_.isUndefined(operation)) {
	        // Operation does not exist
	        return;
	      } else if (!_.isPlainObject(operation)) {
	        // Operation exists but it is not an Operation Object.  Since this is invalid, log it.
	        helpers.log('The \'' + method + '\' operation for \'' + path + '\' path is not an Operation Object');
	
	        return;
	      }
	
	      var tags = operation.tags;
	
	      if (_.isUndefined(tags) || !_.isArray(tags) || tags.length === 0) {
	        tags = operation.tags = [ 'default' ];
	      }
	
	      var operationId = self.idFromOp(path, method, operation);
	
	      var operationObject = new Operation(self,
	        operation.scheme,
	        operationId,
	        method,
	        path,
	        operation,
	        self.definitions,
	        self.models,
	        self.clientAuthorizations);
	
	      operationObject.vendorExtensions = {};
	      for(i in operation) {
	        helpers.extractExtensions(i, operationObject, operation[i]);
	      }
	      operationObject.externalDocs = operation.externalDocs;
	      if(operationObject.externalDocs) {
	        operationObject.externalDocs = _.cloneDeep(operationObject.externalDocs);
	        operationObject.externalDocs.vendorExtensions = {};
	        for(i in operationObject.externalDocs) {
	          helpers.extractExtensions(i, operationObject.externalDocs);
	        }
	      }
	
	      // bind self operation's execute command to the api
	      _.forEach(tags, function (tag) {
	        var clientProperty = _.indexOf(reservedClientTags, tag) > -1 ? '_' + tag : tag;
	        var apiProperty = _.indexOf(reservedApiTags, tag) > -1 ? '_' + tag : tag;
	        var operationGroup = self[clientProperty];
	
	        if (clientProperty !== tag) {
	          helpers.log('The \'' + tag + '\' tag conflicts with a SwaggerClient function/property name.  Use \'client.' +
	                      clientProperty + '\' or \'client.apis.' + tag + '\' instead of \'client.' + tag + '\'.');
	        }
	
	        if (apiProperty !== tag) {
	          helpers.log('The \'' + tag + '\' tag conflicts with a SwaggerClient operation function/property name.  Use ' +
	                      '\'client.apis.' + apiProperty + '\' instead of \'client.apis.' + tag + '\'.');
	        }
	
	        if (_.indexOf(reservedApiTags, operationId) > -1) {
	          helpers.log('The \'' + operationId + '\' operationId conflicts with a SwaggerClient operation ' +
	                      'function/property name.  Use \'client.apis.' + apiProperty + '._' + operationId +
	                      '\' instead of \'client.apis.' + apiProperty + '.' + operationId + '\'.');
	
	          operationId = '_' + operationId;
	          operationObject.nickname = operationId; // So 'client.apis.[tag].operationId.help() works properly
	        }
	
	        if (_.isUndefined(operationGroup)) {
	          operationGroup = self[clientProperty] = self.apis[apiProperty] = {};
	
	          operationGroup.operations = {};
	          operationGroup.label = apiProperty;
	          operationGroup.apis = {};
	
	          var tagDef = definedTags[tag];
	
	          if (!_.isUndefined(tagDef)) {
	            operationGroup.description = tagDef.description;
	            operationGroup.externalDocs = tagDef.externalDocs;
	            operationGroup.vendorExtensions = tagDef.vendorExtensions;
	          }
	
	          self[clientProperty].help = _.bind(self.help, operationGroup);
	          self.apisArray.push(new OperationGroup(tag, operationGroup.description, operationGroup.externalDocs, operationObject));
	        }
	
	        operationId = self.makeUniqueOperationId(operationId, self.apis[apiProperty]);
	
	        // Bind tag help
	        if (!_.isFunction(operationGroup.help)) {
	          operationGroup.help = _.bind(self.help, operationGroup);
	        }
	
	        // bind to the apis object
	        self.apis[apiProperty][operationId] = operationGroup[operationId] = _.bind(operationObject.execute,
	                                                                                  operationObject);
	        self.apis[apiProperty][operationId].help = operationGroup[operationId].help = _.bind(operationObject.help,
	                                                                                             operationObject);
	        self.apis[apiProperty][operationId].asCurl = operationGroup[operationId].asCurl = _.bind(operationObject.asCurl,
	                                                                                                 operationObject);
	
	        operationGroup.apis[operationId] = operationGroup.operations[operationId] = operationObject;
	
	        // legacy UI feature
	        var api = _.find(self.apisArray, function (api) {
	          return api.tag === tag;
	        });
	
	        if (api) {
	          api.operationsArray.push(operationObject);
	        }
	      });
	    });
	  });
	
	  // sort the apisArray according to the tags
	  var sortedApis = [];
	  _.forEach(Object.keys(definedTags), function (tag) {
	    var pos;
	    for(pos in self.apisArray) {
	      var _api = self.apisArray[pos];
	      if(_api && tag === _api.name) {
	        sortedApis.push(_api);
	        self.apisArray[pos] = null;
	      }
	    }
	  });
	  // add anything left
	  _.forEach(self.apisArray, function (api) {
	    if(api) {
	      sortedApis.push(api);
	    }
	  });
	  self.apisArray = sortedApis;
	
	  _.forEach(response.definitions, function (definitionObj, definition) {
	    definitionObj.id = definition.toLowerCase();
	    definitionObj.name = definition;
	    self.modelsArray.push(definitionObj);
	  });
	
	  this.isBuilt = true;
	
	  if (this.usePromise) {
	    this.isValid = true;
	    this.isBuilt = true;
	    this.deferredClient.resolve(this);
	
	    return this.deferredClient.promise;
	  }
	
	  if (this.success) {
	    this.success();
	  }
	
	  return this;
	};
	
	SwaggerClient.prototype.makeUniqueOperationId = function(operationId, api) {
	  var count = 0;
	  var name = operationId;
	
	  // make unique across this operation group
	  while(true) {
	    var matched = false;
	    _.forEach(api.operations, function (operation) {
	      if(operation.nickname === name) {
	        matched = true;
	      }
	    });
	    if(!matched) {
	      return name;
	    }
	    name = operationId + '_' + count;
	    count ++;
	  }
	
	  return operationId;
	};
	
	SwaggerClient.prototype.parseUri = function (uri) {
	  var urlParseRE = /^(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
	  var parts = urlParseRE.exec(uri);
	
	  return {
	    scheme: parts[4] ? parts[4].replace(':','') : undefined,
	    host: parts[11],
	    port: parts[12],
	    path: parts[15]
	  };
	};
	
	SwaggerClient.prototype.help = function (dontPrint) {
	  var output = '';
	
	  if (this instanceof SwaggerClient) {
	    _.forEach(this.apis, function (api, name) {
	      if (_.isPlainObject(api)) {
	        output += 'operations for the \'' + name + '\' tag\n';
	
	        _.forEach(api.operations, function (operation, name) {
	          output += '  * ' + name + ': ' + operation.summary + '\n';
	        });
	      }
	    });
	  } else if (this instanceof OperationGroup || _.isPlainObject(this)) {
	    output += 'operations for the \'' + this.label + '\' tag\n';
	
	    _.forEach(this.apis, function (operation, name) {
	      output += '  * ' + name + ': ' + operation.summary + '\n';
	    });
	  }
	
	  if (dontPrint) {
	    return output;
	  } else {
	    helpers.log(output);
	
	    return output;
	  }
	};
	
	SwaggerClient.prototype.tagFromLabel = function (label) {
	  return label;
	};
	
	SwaggerClient.prototype.idFromOp = function (path, httpMethod, op) {
	  if(!op || !op.operationId) {
	    op = op || {};
	    op.operationId = httpMethod + '_' + path;
	  }
	  var opId = op.operationId.replace(/[\s!@#$%^&*()_+=\[{\]};:<>|.\/?,\\'""-]/g, '_') || (path.substring(1) + '_' + httpMethod);
	
	  opId = opId.replace(/((_){2,})/g, '_');
	  opId = opId.replace(/^(_)*/g, '');
	  opId = opId.replace(/([_])*$/g, '');
	
	  return opId;
	};
	
	SwaggerClient.prototype.setHost = function (host) {
	  this.host = host;
	
	  if(this.apis) {
	    _.forEach(this.apis, function(api) {
	      if(api.operations) {
	        _.forEach(api.operations, function(operation) {
	          operation.host = host;
	        });
	      }
	    });
	  }
	};
	
	SwaggerClient.prototype.setBasePath = function (basePath) {
	  this.basePath = basePath;
	
	  if(this.apis) {
	    _.forEach(this.apis, function(api) {
	      if(api.operations) {
	        _.forEach(api.operations, function(operation) {
	          operation.basePath = basePath;
	        });
	      }
	    });
	  }
	};
	
	SwaggerClient.prototype.setSchemes = function (schemes) {
	  this.schemes = schemes;
	
	  if(schemes && schemes.length > 0) {
	    if(this.apis) {
	      _.forEach(this.apis, function (api) {
	        if (api.operations) {
	          _.forEach(api.operations, function (operation) {
	            operation.scheme = schemes[0];
	          });
	        }
	      });
	    }
	  }
	};
	
	SwaggerClient.prototype.fail = function (message) {
	  if (this.usePromise) {
	    this.deferredClient.reject(message);
	    return this.deferredClient.promise;
	  } else {
	    if (this.failure) {
	      this.failure(message);
	    }
	    else {
	      this.failure(message);
	    }
	  }
	};


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var createWrapper = __webpack_require__(54),
	    replaceHolders = __webpack_require__(75),
	    restParam = __webpack_require__(80);
	
	/** Used to compose bitmasks for wrapper metadata. */
	var BIND_FLAG = 1,
	    PARTIAL_FLAG = 32;
	
	/**
	 * Creates a function that invokes `func` with the `this` binding of `thisArg`
	 * and prepends any additional `_.bind` arguments to those provided to the
	 * bound function.
	 *
	 * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
	 * may be used as a placeholder for partially applied arguments.
	 *
	 * **Note:** Unlike native `Function#bind` this method does not set the "length"
	 * property of bound functions.
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {...*} [partials] The arguments to be partially applied.
	 * @returns {Function} Returns the new bound function.
	 * @example
	 *
	 * var greet = function(greeting, punctuation) {
	 *   return greeting + ' ' + this.user + punctuation;
	 * };
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * var bound = _.bind(greet, object, 'hi');
	 * bound('!');
	 * // => 'hi fred!'
	 *
	 * // using placeholders
	 * var bound = _.bind(greet, object, _, '!');
	 * bound('hi');
	 * // => 'hi fred!'
	 */
	var bind = restParam(function(func, thisArg, partials) {
	  var bitmask = BIND_FLAG;
	  if (partials.length) {
	    var holders = replaceHolders(partials, bind.placeholder);
	    bitmask |= PARTIAL_FLAG;
	  }
	  return createWrapper(func, bitmask, thisArg, partials, holders);
	});
	
	// Assign default placeholders.
	bind.placeholder = {};
	
	module.exports = bind;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var baseSetData = __webpack_require__(55),
	    createBindWrapper = __webpack_require__(57),
	    createHybridWrapper = __webpack_require__(60),
	    createPartialWrapper = __webpack_require__(78),
	    getData = __webpack_require__(67),
	    mergeData = __webpack_require__(79),
	    setData = __webpack_require__(76);
	
	/** Used to compose bitmasks for wrapper metadata. */
	var BIND_FLAG = 1,
	    BIND_KEY_FLAG = 2,
	    PARTIAL_FLAG = 32,
	    PARTIAL_RIGHT_FLAG = 64;
	
	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates a function that either curries or invokes `func` with optional
	 * `this` binding and partially applied arguments.
	 *
	 * @private
	 * @param {Function|string} func The function or method name to reference.
	 * @param {number} bitmask The bitmask of flags.
	 *  The bitmask may be composed of the following flags:
	 *     1 - `_.bind`
	 *     2 - `_.bindKey`
	 *     4 - `_.curry` or `_.curryRight` of a bound function
	 *     8 - `_.curry`
	 *    16 - `_.curryRight`
	 *    32 - `_.partial`
	 *    64 - `_.partialRight`
	 *   128 - `_.rearg`
	 *   256 - `_.ary`
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to be partially applied.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
	  var isBindKey = bitmask & BIND_KEY_FLAG;
	  if (!isBindKey && typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  var length = partials ? partials.length : 0;
	  if (!length) {
	    bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
	    partials = holders = undefined;
	  }
	  length -= (holders ? holders.length : 0);
	  if (bitmask & PARTIAL_RIGHT_FLAG) {
	    var partialsRight = partials,
	        holdersRight = holders;
	
	    partials = holders = undefined;
	  }
	  var data = isBindKey ? undefined : getData(func),
	      newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];
	
	  if (data) {
	    mergeData(newData, data);
	    bitmask = newData[1];
	    arity = newData[9];
	  }
	  newData[9] = arity == null
	    ? (isBindKey ? 0 : func.length)
	    : (nativeMax(arity - length, 0) || 0);
	
	  if (bitmask == BIND_FLAG) {
	    var result = createBindWrapper(newData[0], newData[2]);
	  } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
	    result = createPartialWrapper.apply(undefined, newData);
	  } else {
	    result = createHybridWrapper.apply(undefined, newData);
	  }
	  var setter = data ? baseSetData : setData;
	  return setter(result, newData);
	}
	
	module.exports = createWrapper;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(32),
	    metaMap = __webpack_require__(56);
	
	/**
	 * The base implementation of `setData` without support for hot loop detection.
	 *
	 * @private
	 * @param {Function} func The function to associate metadata with.
	 * @param {*} data The metadata.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetData = !metaMap ? identity : function(func, data) {
	  metaMap.set(func, data);
	  return func;
	};
	
	module.exports = baseSetData;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var getNative = __webpack_require__(22);
	
	/** Native method references. */
	var WeakMap = getNative(global, 'WeakMap');
	
	/** Used to store function metadata. */
	var metaMap = WeakMap && new WeakMap;
	
	module.exports = metaMap;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var createCtorWrapper = __webpack_require__(58);
	
	/**
	 * Creates a function that wraps `func` and invokes it with the `this`
	 * binding of `thisArg`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @returns {Function} Returns the new bound function.
	 */
	function createBindWrapper(func, thisArg) {
	  var Ctor = createCtorWrapper(func);
	
	  function wrapper() {
	    var fn = (this && this !== global && this instanceof wrapper) ? Ctor : func;
	    return fn.apply(thisArg, arguments);
	  }
	  return wrapper;
	}
	
	module.exports = createBindWrapper;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(59),
	    isObject = __webpack_require__(10);
	
	/**
	 * Creates a function that produces an instance of `Ctor` regardless of
	 * whether it was invoked as part of a `new` expression or by `call` or `apply`.
	 *
	 * @private
	 * @param {Function} Ctor The constructor to wrap.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createCtorWrapper(Ctor) {
	  return function() {
	    // Use a `switch` statement to work with class constructors.
	    // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
	    // for more details.
	    var args = arguments;
	    switch (args.length) {
	      case 0: return new Ctor;
	      case 1: return new Ctor(args[0]);
	      case 2: return new Ctor(args[0], args[1]);
	      case 3: return new Ctor(args[0], args[1], args[2]);
	      case 4: return new Ctor(args[0], args[1], args[2], args[3]);
	      case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
	      case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
	      case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	    }
	    var thisBinding = baseCreate(Ctor.prototype),
	        result = Ctor.apply(thisBinding, args);
	
	    // Mimic the constructor's `return` behavior.
	    // See https://es5.github.io/#x13.2.2 for more details.
	    return isObject(result) ? result : thisBinding;
	  };
	}
	
	module.exports = createCtorWrapper;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(10);
	
	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	var baseCreate = (function() {
	  function object() {}
	  return function(prototype) {
	    if (isObject(prototype)) {
	      object.prototype = prototype;
	      var result = new object;
	      object.prototype = undefined;
	    }
	    return result || {};
	  };
	}());
	
	module.exports = baseCreate;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var arrayCopy = __webpack_require__(61),
	    composeArgs = __webpack_require__(62),
	    composeArgsRight = __webpack_require__(63),
	    createCtorWrapper = __webpack_require__(58),
	    isLaziable = __webpack_require__(64),
	    reorder = __webpack_require__(74),
	    replaceHolders = __webpack_require__(75),
	    setData = __webpack_require__(76);
	
	/** Used to compose bitmasks for wrapper metadata. */
	var BIND_FLAG = 1,
	    BIND_KEY_FLAG = 2,
	    CURRY_BOUND_FLAG = 4,
	    CURRY_FLAG = 8,
	    CURRY_RIGHT_FLAG = 16,
	    PARTIAL_FLAG = 32,
	    PARTIAL_RIGHT_FLAG = 64,
	    ARY_FLAG = 128;
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates a function that wraps `func` and invokes it with optional `this`
	 * binding of, partial application, and currying.
	 *
	 * @private
	 * @param {Function|string} func The function or method name to reference.
	 * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {Array} [partials] The arguments to prepend to those provided to the new function.
	 * @param {Array} [holders] The `partials` placeholder indexes.
	 * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
	 * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
	 * @param {Array} [argPos] The argument positions of the new function.
	 * @param {number} [ary] The arity cap of `func`.
	 * @param {number} [arity] The arity of `func`.
	 * @returns {Function} Returns the new wrapped function.
	 */
	function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
	  var isAry = bitmask & ARY_FLAG,
	      isBind = bitmask & BIND_FLAG,
	      isBindKey = bitmask & BIND_KEY_FLAG,
	      isCurry = bitmask & CURRY_FLAG,
	      isCurryBound = bitmask & CURRY_BOUND_FLAG,
	      isCurryRight = bitmask & CURRY_RIGHT_FLAG,
	      Ctor = isBindKey ? undefined : createCtorWrapper(func);
	
	  function wrapper() {
	    // Avoid `arguments` object use disqualifying optimizations by
	    // converting it to an array before providing it to other functions.
	    var length = arguments.length,
	        index = length,
	        args = Array(length);
	
	    while (index--) {
	      args[index] = arguments[index];
	    }
	    if (partials) {
	      args = composeArgs(args, partials, holders);
	    }
	    if (partialsRight) {
	      args = composeArgsRight(args, partialsRight, holdersRight);
	    }
	    if (isCurry || isCurryRight) {
	      var placeholder = wrapper.placeholder,
	          argsHolders = replaceHolders(args, placeholder);
	
	      length -= argsHolders.length;
	      if (length < arity) {
	        var newArgPos = argPos ? arrayCopy(argPos) : undefined,
	            newArity = nativeMax(arity - length, 0),
	            newsHolders = isCurry ? argsHolders : undefined,
	            newHoldersRight = isCurry ? undefined : argsHolders,
	            newPartials = isCurry ? args : undefined,
	            newPartialsRight = isCurry ? undefined : args;
	
	        bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
	        bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);
	
	        if (!isCurryBound) {
	          bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
	        }
	        var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],
	            result = createHybridWrapper.apply(undefined, newData);
	
	        if (isLaziable(func)) {
	          setData(result, newData);
	        }
	        result.placeholder = placeholder;
	        return result;
	      }
	    }
	    var thisBinding = isBind ? thisArg : this,
	        fn = isBindKey ? thisBinding[func] : func;
	
	    if (argPos) {
	      args = reorder(args, argPos);
	    }
	    if (isAry && ary < args.length) {
	      args.length = ary;
	    }
	    if (this && this !== global && this instanceof wrapper) {
	      fn = Ctor || createCtorWrapper(func);
	    }
	    return fn.apply(thisBinding, args);
	  }
	  return wrapper;
	}
	
	module.exports = createHybridWrapper;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 61 */
/***/ function(module, exports) {

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function arrayCopy(source, array) {
	  var index = -1,
	      length = source.length;
	
	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}
	
	module.exports = arrayCopy;


/***/ },
/* 62 */
/***/ function(module, exports) {

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates an array that is the composition of partially applied arguments,
	 * placeholders, and provided arguments into a single array of arguments.
	 *
	 * @private
	 * @param {Array|Object} args The provided arguments.
	 * @param {Array} partials The arguments to prepend to those provided.
	 * @param {Array} holders The `partials` placeholder indexes.
	 * @returns {Array} Returns the new array of composed arguments.
	 */
	function composeArgs(args, partials, holders) {
	  var holdersLength = holders.length,
	      argsIndex = -1,
	      argsLength = nativeMax(args.length - holdersLength, 0),
	      leftIndex = -1,
	      leftLength = partials.length,
	      result = Array(leftLength + argsLength);
	
	  while (++leftIndex < leftLength) {
	    result[leftIndex] = partials[leftIndex];
	  }
	  while (++argsIndex < holdersLength) {
	    result[holders[argsIndex]] = args[argsIndex];
	  }
	  while (argsLength--) {
	    result[leftIndex++] = args[argsIndex++];
	  }
	  return result;
	}
	
	module.exports = composeArgs;


/***/ },
/* 63 */
/***/ function(module, exports) {

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * This function is like `composeArgs` except that the arguments composition
	 * is tailored for `_.partialRight`.
	 *
	 * @private
	 * @param {Array|Object} args The provided arguments.
	 * @param {Array} partials The arguments to append to those provided.
	 * @param {Array} holders The `partials` placeholder indexes.
	 * @returns {Array} Returns the new array of composed arguments.
	 */
	function composeArgsRight(args, partials, holders) {
	  var holdersIndex = -1,
	      holdersLength = holders.length,
	      argsIndex = -1,
	      argsLength = nativeMax(args.length - holdersLength, 0),
	      rightIndex = -1,
	      rightLength = partials.length,
	      result = Array(argsLength + rightLength);
	
	  while (++argsIndex < argsLength) {
	    result[argsIndex] = args[argsIndex];
	  }
	  var offset = argsIndex;
	  while (++rightIndex < rightLength) {
	    result[offset + rightIndex] = partials[rightIndex];
	  }
	  while (++holdersIndex < holdersLength) {
	    result[offset + holders[holdersIndex]] = args[argsIndex++];
	  }
	  return result;
	}
	
	module.exports = composeArgsRight;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var LazyWrapper = __webpack_require__(65),
	    getData = __webpack_require__(67),
	    getFuncName = __webpack_require__(69),
	    lodash = __webpack_require__(71);
	
	/**
	 * Checks if `func` has a lazy counterpart.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.
	 */
	function isLaziable(func) {
	  var funcName = getFuncName(func),
	      other = lodash[funcName];
	
	  if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
	    return false;
	  }
	  if (func === other) {
	    return true;
	  }
	  var data = getData(other);
	  return !!data && func === data[0];
	}
	
	module.exports = isLaziable;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(59),
	    baseLodash = __webpack_require__(66);
	
	/** Used as references for `-Infinity` and `Infinity`. */
	var POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
	
	/**
	 * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
	 *
	 * @private
	 * @param {*} value The value to wrap.
	 */
	function LazyWrapper(value) {
	  this.__wrapped__ = value;
	  this.__actions__ = [];
	  this.__dir__ = 1;
	  this.__filtered__ = false;
	  this.__iteratees__ = [];
	  this.__takeCount__ = POSITIVE_INFINITY;
	  this.__views__ = [];
	}
	
	LazyWrapper.prototype = baseCreate(baseLodash.prototype);
	LazyWrapper.prototype.constructor = LazyWrapper;
	
	module.exports = LazyWrapper;


/***/ },
/* 66 */
/***/ function(module, exports) {

	/**
	 * The function whose prototype all chaining wrappers inherit from.
	 *
	 * @private
	 */
	function baseLodash() {
	  // No operation performed.
	}
	
	module.exports = baseLodash;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var metaMap = __webpack_require__(56),
	    noop = __webpack_require__(68);
	
	/**
	 * Gets metadata for `func`.
	 *
	 * @private
	 * @param {Function} func The function to query.
	 * @returns {*} Returns the metadata for `func`.
	 */
	var getData = !metaMap ? noop : function(func) {
	  return metaMap.get(func);
	};
	
	module.exports = getData;


/***/ },
/* 68 */
/***/ function(module, exports) {

	/**
	 * A no-operation function that returns `undefined` regardless of the
	 * arguments it receives.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.noop(object) === undefined;
	 * // => true
	 */
	function noop() {
	  // No operation performed.
	}
	
	module.exports = noop;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var realNames = __webpack_require__(70);
	
	/**
	 * Gets the name of `func`.
	 *
	 * @private
	 * @param {Function} func The function to query.
	 * @returns {string} Returns the function name.
	 */
	function getFuncName(func) {
	  var result = (func.name + ''),
	      array = realNames[result],
	      length = array ? array.length : 0;
	
	  while (length--) {
	    var data = array[length],
	        otherFunc = data.func;
	    if (otherFunc == null || otherFunc == func) {
	      return data.name;
	    }
	  }
	  return result;
	}
	
	module.exports = getFuncName;


/***/ },
/* 70 */
/***/ function(module, exports) {

	/** Used to lookup unminified function names. */
	var realNames = {};
	
	module.exports = realNames;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	var LazyWrapper = __webpack_require__(65),
	    LodashWrapper = __webpack_require__(72),
	    baseLodash = __webpack_require__(66),
	    isArray = __webpack_require__(21),
	    isObjectLike = __webpack_require__(12),
	    wrapperClone = __webpack_require__(73);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Creates a `lodash` object which wraps `value` to enable implicit chaining.
	 * Methods that operate on and return arrays, collections, and functions can
	 * be chained together. Methods that retrieve a single value or may return a
	 * primitive value will automatically end the chain returning the unwrapped
	 * value. Explicit chaining may be enabled using `_.chain`. The execution of
	 * chained methods is lazy, that is, execution is deferred until `_#value`
	 * is implicitly or explicitly called.
	 *
	 * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
	 * fusion is an optimization strategy which merge iteratee calls; this can help
	 * to avoid the creation of intermediate data structures and greatly reduce the
	 * number of iteratee executions.
	 *
	 * Chaining is supported in custom builds as long as the `_#value` method is
	 * directly or indirectly included in the build.
	 *
	 * In addition to lodash methods, wrappers have `Array` and `String` methods.
	 *
	 * The wrapper `Array` methods are:
	 * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,
	 * `splice`, and `unshift`
	 *
	 * The wrapper `String` methods are:
	 * `replace` and `split`
	 *
	 * The wrapper methods that support shortcut fusion are:
	 * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
	 * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
	 * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
	 * and `where`
	 *
	 * The chainable wrapper methods are:
	 * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
	 * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
	 * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defaultsDeep`,
	 * `defer`, `delay`, `difference`, `drop`, `dropRight`, `dropRightWhile`,
	 * `dropWhile`, `fill`, `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`,
	 * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
	 * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
	 * `invoke`, `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`,
	 * `matchesProperty`, `memoize`, `merge`, `method`, `methodOf`, `mixin`,
	 * `modArgs`, `negate`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
	 * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
	 * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `restParam`,
	 * `reverse`, `set`, `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`,
	 * `sortByOrder`, `splice`, `spread`, `take`, `takeRight`, `takeRightWhile`,
	 * `takeWhile`, `tap`, `throttle`, `thru`, `times`, `toArray`, `toPlainObject`,
	 * `transform`, `union`, `uniq`, `unshift`, `unzip`, `unzipWith`, `values`,
	 * `valuesIn`, `where`, `without`, `wrap`, `xor`, `zip`, `zipObject`, `zipWith`
	 *
	 * The wrapper methods that are **not** chainable by default are:
	 * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clone`, `cloneDeep`,
	 * `deburr`, `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`,
	 * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`,
	 * `floor`, `get`, `gt`, `gte`, `has`, `identity`, `includes`, `indexOf`,
	 * `inRange`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
	 * `isEmpty`, `isEqual`, `isError`, `isFinite` `isFunction`, `isMatch`,
	 * `isNative`, `isNaN`, `isNull`, `isNumber`, `isObject`, `isPlainObject`,
	 * `isRegExp`, `isString`, `isUndefined`, `isTypedArray`, `join`, `kebabCase`,
	 * `last`, `lastIndexOf`, `lt`, `lte`, `max`, `min`, `noConflict`, `noop`,
	 * `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`, `random`, `reduce`,
	 * `reduceRight`, `repeat`, `result`, `round`, `runInContext`, `shift`, `size`,
	 * `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`, `startCase`,
	 * `startsWith`, `sum`, `template`, `trim`, `trimLeft`, `trimRight`, `trunc`,
	 * `unescape`, `uniqueId`, `value`, and `words`
	 *
	 * The wrapper method `sample` will return a wrapped value when `n` is provided,
	 * otherwise an unwrapped value is returned.
	 *
	 * @name _
	 * @constructor
	 * @category Chain
	 * @param {*} value The value to wrap in a `lodash` instance.
	 * @returns {Object} Returns the new `lodash` wrapper instance.
	 * @example
	 *
	 * var wrapped = _([1, 2, 3]);
	 *
	 * // returns an unwrapped value
	 * wrapped.reduce(function(total, n) {
	 *   return total + n;
	 * });
	 * // => 6
	 *
	 * // returns a wrapped value
	 * var squares = wrapped.map(function(n) {
	 *   return n * n;
	 * });
	 *
	 * _.isArray(squares);
	 * // => false
	 *
	 * _.isArray(squares.value());
	 * // => true
	 */
	function lodash(value) {
	  if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
	    if (value instanceof LodashWrapper) {
	      return value;
	    }
	    if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {
	      return wrapperClone(value);
	    }
	  }
	  return new LodashWrapper(value);
	}
	
	// Ensure wrappers are instances of `baseLodash`.
	lodash.prototype = baseLodash.prototype;
	
	module.exports = lodash;


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	var baseCreate = __webpack_require__(59),
	    baseLodash = __webpack_require__(66);
	
	/**
	 * The base constructor for creating `lodash` wrapper objects.
	 *
	 * @private
	 * @param {*} value The value to wrap.
	 * @param {boolean} [chainAll] Enable chaining for all wrapper methods.
	 * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.
	 */
	function LodashWrapper(value, chainAll, actions) {
	  this.__wrapped__ = value;
	  this.__actions__ = actions || [];
	  this.__chain__ = !!chainAll;
	}
	
	LodashWrapper.prototype = baseCreate(baseLodash.prototype);
	LodashWrapper.prototype.constructor = LodashWrapper;
	
	module.exports = LodashWrapper;


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	var LazyWrapper = __webpack_require__(65),
	    LodashWrapper = __webpack_require__(72),
	    arrayCopy = __webpack_require__(61);
	
	/**
	 * Creates a clone of `wrapper`.
	 *
	 * @private
	 * @param {Object} wrapper The wrapper to clone.
	 * @returns {Object} Returns the cloned wrapper.
	 */
	function wrapperClone(wrapper) {
	  return wrapper instanceof LazyWrapper
	    ? wrapper.clone()
	    : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
	}
	
	module.exports = wrapperClone;


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	var arrayCopy = __webpack_require__(61),
	    isIndex = __webpack_require__(26);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;
	
	/**
	 * Reorder `array` according to the specified indexes where the element at
	 * the first index is assigned as the first element, the element at
	 * the second index is assigned as the second element, and so on.
	 *
	 * @private
	 * @param {Array} array The array to reorder.
	 * @param {Array} indexes The arranged array indexes.
	 * @returns {Array} Returns `array`.
	 */
	function reorder(array, indexes) {
	  var arrLength = array.length,
	      length = nativeMin(indexes.length, arrLength),
	      oldArray = arrayCopy(array);
	
	  while (length--) {
	    var index = indexes[length];
	    array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
	  }
	  return array;
	}
	
	module.exports = reorder;


/***/ },
/* 75 */
/***/ function(module, exports) {

	/** Used as the internal argument placeholder. */
	var PLACEHOLDER = '__lodash_placeholder__';
	
	/**
	 * Replaces all `placeholder` elements in `array` with an internal placeholder
	 * and returns an array of their indexes.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {*} placeholder The placeholder to replace.
	 * @returns {Array} Returns the new array of placeholder indexes.
	 */
	function replaceHolders(array, placeholder) {
	  var index = -1,
	      length = array.length,
	      resIndex = -1,
	      result = [];
	
	  while (++index < length) {
	    if (array[index] === placeholder) {
	      array[index] = PLACEHOLDER;
	      result[++resIndex] = index;
	    }
	  }
	  return result;
	}
	
	module.exports = replaceHolders;


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var baseSetData = __webpack_require__(55),
	    now = __webpack_require__(77);
	
	/** Used to detect when a function becomes hot. */
	var HOT_COUNT = 150,
	    HOT_SPAN = 16;
	
	/**
	 * Sets metadata for `func`.
	 *
	 * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
	 * period of time, it will trip its breaker and transition to an identity function
	 * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
	 * for more details.
	 *
	 * @private
	 * @param {Function} func The function to associate metadata with.
	 * @param {*} data The metadata.
	 * @returns {Function} Returns `func`.
	 */
	var setData = (function() {
	  var count = 0,
	      lastCalled = 0;
	
	  return function(key, value) {
	    var stamp = now(),
	        remaining = HOT_SPAN - (stamp - lastCalled);
	
	    lastCalled = stamp;
	    if (remaining > 0) {
	      if (++count >= HOT_COUNT) {
	        return key;
	      }
	    } else {
	      count = 0;
	    }
	    return baseSetData(key, value);
	  };
	}());
	
	module.exports = setData;


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(22);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeNow = getNative(Date, 'now');
	
	/**
	 * Gets the number of milliseconds that have elapsed since the Unix epoch
	 * (1 January 1970 00:00:00 UTC).
	 *
	 * @static
	 * @memberOf _
	 * @category Date
	 * @example
	 *
	 * _.defer(function(stamp) {
	 *   console.log(_.now() - stamp);
	 * }, _.now());
	 * // => logs the number of milliseconds it took for the deferred function to be invoked
	 */
	var now = nativeNow || function() {
	  return new Date().getTime();
	};
	
	module.exports = now;


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var createCtorWrapper = __webpack_require__(58);
	
	/** Used to compose bitmasks for wrapper metadata. */
	var BIND_FLAG = 1;
	
	/**
	 * Creates a function that wraps `func` and invokes it with the optional `this`
	 * binding of `thisArg` and the `partials` prepended to those provided to
	 * the wrapper.
	 *
	 * @private
	 * @param {Function} func The function to partially apply arguments to.
	 * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {Array} partials The arguments to prepend to those provided to the new function.
	 * @returns {Function} Returns the new bound function.
	 */
	function createPartialWrapper(func, bitmask, thisArg, partials) {
	  var isBind = bitmask & BIND_FLAG,
	      Ctor = createCtorWrapper(func);
	
	  function wrapper() {
	    // Avoid `arguments` object use disqualifying optimizations by
	    // converting it to an array before providing it `func`.
	    var argsIndex = -1,
	        argsLength = arguments.length,
	        leftIndex = -1,
	        leftLength = partials.length,
	        args = Array(leftLength + argsLength);
	
	    while (++leftIndex < leftLength) {
	      args[leftIndex] = partials[leftIndex];
	    }
	    while (argsLength--) {
	      args[leftIndex++] = arguments[++argsIndex];
	    }
	    var fn = (this && this !== global && this instanceof wrapper) ? Ctor : func;
	    return fn.apply(isBind ? thisArg : this, args);
	  }
	  return wrapper;
	}
	
	module.exports = createPartialWrapper;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	var arrayCopy = __webpack_require__(61),
	    composeArgs = __webpack_require__(62),
	    composeArgsRight = __webpack_require__(63),
	    replaceHolders = __webpack_require__(75);
	
	/** Used to compose bitmasks for wrapper metadata. */
	var BIND_FLAG = 1,
	    CURRY_BOUND_FLAG = 4,
	    CURRY_FLAG = 8,
	    ARY_FLAG = 128,
	    REARG_FLAG = 256;
	
	/** Used as the internal argument placeholder. */
	var PLACEHOLDER = '__lodash_placeholder__';
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;
	
	/**
	 * Merges the function metadata of `source` into `data`.
	 *
	 * Merging metadata reduces the number of wrappers required to invoke a function.
	 * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
	 * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`
	 * augment function arguments, making the order in which they are executed important,
	 * preventing the merging of metadata. However, we make an exception for a safe
	 * common case where curried functions have `_.ary` and or `_.rearg` applied.
	 *
	 * @private
	 * @param {Array} data The destination metadata.
	 * @param {Array} source The source metadata.
	 * @returns {Array} Returns `data`.
	 */
	function mergeData(data, source) {
	  var bitmask = data[1],
	      srcBitmask = source[1],
	      newBitmask = bitmask | srcBitmask,
	      isCommon = newBitmask < ARY_FLAG;
	
	  var isCombo =
	    (srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG) ||
	    (srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8]) ||
	    (srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG);
	
	  // Exit early if metadata can't be merged.
	  if (!(isCommon || isCombo)) {
	    return data;
	  }
	  // Use source `thisArg` if available.
	  if (srcBitmask & BIND_FLAG) {
	    data[2] = source[2];
	    // Set when currying a bound function.
	    newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;
	  }
	  // Compose partial arguments.
	  var value = source[3];
	  if (value) {
	    var partials = data[3];
	    data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);
	    data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
	  }
	  // Compose partial right arguments.
	  value = source[5];
	  if (value) {
	    partials = data[5];
	    data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);
	    data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);
	  }
	  // Use source `argPos` if available.
	  value = source[7];
	  if (value) {
	    data[7] = arrayCopy(value);
	  }
	  // Use source `ary` if it's smaller.
	  if (srcBitmask & ARY_FLAG) {
	    data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
	  }
	  // Use source `arity` if one is not provided.
	  if (data[9] == null) {
	    data[9] = source[9];
	  }
	  // Use source `func` and merge bitmasks.
	  data[0] = source[0];
	  data[1] = newBitmask;
	
	  return data;
	}
	
	module.exports = mergeData;


/***/ },
/* 80 */
/***/ function(module, exports) {

	/** Used as the `TypeError` message for "Functions" methods. */
	var FUNC_ERROR_TEXT = 'Expected a function';
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMax = Math.max;
	
	/**
	 * Creates a function that invokes `func` with the `this` binding of the
	 * created function and arguments from `start` and beyond provided as an array.
	 *
	 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
	 *
	 * @static
	 * @memberOf _
	 * @category Function
	 * @param {Function} func The function to apply a rest parameter to.
	 * @param {number} [start=func.length-1] The start position of the rest parameter.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var say = _.restParam(function(what, names) {
	 *   return what + ' ' + _.initial(names).join(', ') +
	 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
	 * });
	 *
	 * say('hello', 'fred', 'barney', 'pebbles');
	 * // => 'hello fred, barney, & pebbles'
	 */
	function restParam(func, start) {
	  if (typeof func != 'function') {
	    throw new TypeError(FUNC_ERROR_TEXT);
	  }
	  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
	  return function() {
	    var args = arguments,
	        index = -1,
	        length = nativeMax(args.length - start, 0),
	        rest = Array(length);
	
	    while (++index < length) {
	      rest[index] = args[start + index];
	    }
	    switch (start) {
	      case 0: return func.call(this, rest);
	      case 1: return func.call(this, args[0], rest);
	      case 2: return func.call(this, args[0], args[1], rest);
	    }
	    var otherArgs = Array(start + 1);
	    index = -1;
	    while (++index < start) {
	      otherArgs[index] = args[index];
	    }
	    otherArgs[start] = rest;
	    return func.apply(this, otherArgs);
	  };
	}
	
	module.exports = restParam;


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	var baseClone = __webpack_require__(82),
	    bindCallback = __webpack_require__(47);
	
	/**
	 * Creates a deep clone of `value`. If `customizer` is provided it's invoked
	 * to produce the cloned values. If `customizer` returns `undefined` cloning
	 * is handled by the method instead. The `customizer` is bound to `thisArg`
	 * and invoked with up to three argument; (value [, index|key, object]).
	 *
	 * **Note:** This method is loosely based on the
	 * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
	 * The enumerable properties of `arguments` objects and objects created by
	 * constructors other than `Object` are cloned to plain `Object` objects. An
	 * empty object is returned for uncloneable values such as functions, DOM nodes,
	 * Maps, Sets, and WeakMaps.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to deep clone.
	 * @param {Function} [customizer] The function to customize cloning values.
	 * @param {*} [thisArg] The `this` binding of `customizer`.
	 * @returns {*} Returns the deep cloned value.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * var deep = _.cloneDeep(users);
	 * deep[0] === users[0];
	 * // => false
	 *
	 * // using a customizer callback
	 * var el = _.cloneDeep(document.body, function(value) {
	 *   if (_.isElement(value)) {
	 *     return value.cloneNode(true);
	 *   }
	 * });
	 *
	 * el === document.body
	 * // => false
	 * el.nodeName
	 * // => BODY
	 * el.childNodes.length;
	 * // => 20
	 */
	function cloneDeep(value, customizer, thisArg) {
	  return typeof customizer == 'function'
	    ? baseClone(value, true, bindCallback(customizer, thisArg, 3))
	    : baseClone(value, true);
	}
	
	module.exports = cloneDeep;


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var arrayCopy = __webpack_require__(61),
	    arrayEach = __webpack_require__(15),
	    baseAssign = __webpack_require__(83),
	    baseForOwn = __webpack_require__(42),
	    initCloneArray = __webpack_require__(85),
	    initCloneByTag = __webpack_require__(86),
	    initCloneObject = __webpack_require__(88),
	    isArray = __webpack_require__(21),
	    isHostObject = __webpack_require__(25),
	    isObject = __webpack_require__(10);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to identify `toStringTag` values supported by `_.clone`. */
	var cloneableTags = {};
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
	cloneableTags[dateTag] = cloneableTags[float32Tag] =
	cloneableTags[float64Tag] = cloneableTags[int8Tag] =
	cloneableTags[int16Tag] = cloneableTags[int32Tag] =
	cloneableTags[numberTag] = cloneableTags[objectTag] =
	cloneableTags[regexpTag] = cloneableTags[stringTag] =
	cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
	cloneableTags[mapTag] = cloneableTags[setTag] =
	cloneableTags[weakMapTag] = false;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * The base implementation of `_.clone` without support for argument juggling
	 * and `this` binding `customizer` functions.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {Function} [customizer] The function to customize cloning values.
	 * @param {string} [key] The key of `value`.
	 * @param {Object} [object] The object `value` belongs to.
	 * @param {Array} [stackA=[]] Tracks traversed source objects.
	 * @param {Array} [stackB=[]] Associates clones with source counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
	  var result;
	  if (customizer) {
	    result = object ? customizer(value, key, object) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return arrayCopy(value, result);
	    }
	  } else {
	    var tag = objToString.call(value),
	        isFunc = tag == funcTag;
	
	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      if (isHostObject(value)) {
	        return object ? value : {};
	      }
	      result = initCloneObject(isFunc ? {} : value);
	      if (!isDeep) {
	        return baseAssign(result, value);
	      }
	    } else {
	      return cloneableTags[tag]
	        ? initCloneByTag(value, tag, isDeep)
	        : (object ? value : {});
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stackA || (stackA = []);
	  stackB || (stackB = []);
	
	  var length = stackA.length;
	  while (length--) {
	    if (stackA[length] == value) {
	      return stackB[length];
	    }
	  }
	  // Add the source value to the stack of traversed objects and associate it with its clone.
	  stackA.push(value);
	  stackB.push(result);
	
	  // Recursively populate clone (susceptible to call stack limits).
	  (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
	    result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
	  });
	  return result;
	}
	
	module.exports = baseClone;


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var baseCopy = __webpack_require__(84),
	    keys = __webpack_require__(43);
	
	/**
	 * The base implementation of `_.assign` without support for argument juggling,
	 * multiple sources, and `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return source == null
	    ? object
	    : baseCopy(source, keys(source), object);
	}
	
	module.exports = baseAssign;


/***/ },
/* 84 */
/***/ function(module, exports) {

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property names to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @returns {Object} Returns `object`.
	 */
	function baseCopy(source, props, object) {
	  object || (object = {});
	
	  var index = -1,
	      length = props.length;
	
	  while (++index < length) {
	    var key = props[index];
	    object[key] = source[key];
	  }
	  return object;
	}
	
	module.exports = baseCopy;


/***/ },
/* 85 */
/***/ function(module, exports) {

	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = new array.constructor(length);
	
	  // Add array properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}
	
	module.exports = initCloneArray;


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var bufferClone = __webpack_require__(87);
	
	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;
	
	/** Native method references. */
	var Uint8Array = global.Uint8Array;
	
	/** Used to lookup a type array constructors by `toStringTag`. */
	var ctorByTag = {};
	ctorByTag[float32Tag] = global.Float32Array;
	ctorByTag[float64Tag] = global.Float64Array;
	ctorByTag[int8Tag] = global.Int8Array;
	ctorByTag[int16Tag] = global.Int16Array;
	ctorByTag[int32Tag] = global.Int32Array;
	ctorByTag[uint8Tag] = Uint8Array;
	ctorByTag[uint8ClampedTag] = global.Uint8ClampedArray;
	ctorByTag[uint16Tag] = global.Uint16Array;
	ctorByTag[uint32Tag] = global.Uint32Array;
	
	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return bufferClone(object);
	
	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);
	
	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      // Safari 5 mobile incorrectly has `Object` as the constructor of typed arrays.
	      if (Ctor instanceof Ctor) {
	        Ctor = ctorByTag[tag];
	      }
	      var buffer = object.buffer;
	      return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);
	
	    case numberTag:
	    case stringTag:
	      return new Ctor(object);
	
	    case regexpTag:
	      var result = new Ctor(object.source, reFlags.exec(object));
	      result.lastIndex = object.lastIndex;
	  }
	  return result;
	}
	
	module.exports = initCloneByTag;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 87 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/** Native method references. */
	var ArrayBuffer = global.ArrayBuffer,
	    Uint8Array = global.Uint8Array;
	
	/**
	 * Creates a clone of the given array buffer.
	 *
	 * @private
	 * @param {ArrayBuffer} buffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function bufferClone(buffer) {
	  var result = new ArrayBuffer(buffer.byteLength),
	      view = new Uint8Array(result);
	
	  view.set(new Uint8Array(buffer));
	  return result;
	}
	
	module.exports = bufferClone;
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 88 */
/***/ function(module, exports) {

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  var Ctor = object.constructor;
	  if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
	    Ctor = Object;
	  }
	  return new Ctor;
	}
	
	module.exports = initCloneObject;


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(41),
	    createFind = __webpack_require__(90);
	
	/**
	 * Iterates over elements of `collection`, returning the first element
	 * `predicate` returns truthy for. The predicate is bound to `thisArg` and
	 * invoked with three arguments: (value, index|key, collection).
	 *
	 * If a property name is provided for `predicate` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `predicate` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @alias detect
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to search.
	 * @param {Function|Object|string} [predicate=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `predicate`.
	 * @returns {*} Returns the matched element, else `undefined`.
	 * @example
	 *
	 * var users = [
	 *   { 'user': 'barney',  'age': 36, 'active': true },
	 *   { 'user': 'fred',    'age': 40, 'active': false },
	 *   { 'user': 'pebbles', 'age': 1,  'active': true }
	 * ];
	 *
	 * _.result(_.find(users, function(chr) {
	 *   return chr.age < 40;
	 * }), 'user');
	 * // => 'barney'
	 *
	 * // using the `_.matches` callback shorthand
	 * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
	 * // => 'pebbles'
	 *
	 * // using the `_.matchesProperty` callback shorthand
	 * _.result(_.find(users, 'active', false), 'user');
	 * // => 'fred'
	 *
	 * // using the `_.property` callback shorthand
	 * _.result(_.find(users, 'active'), 'user');
	 * // => 'barney'
	 */
	var find = createFind(baseEach);
	
	module.exports = find;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var baseCallback = __webpack_require__(91),
	    baseFind = __webpack_require__(113),
	    baseFindIndex = __webpack_require__(114),
	    isArray = __webpack_require__(21);
	
	/**
	 * Creates a `_.find` or `_.findLast` function.
	 *
	 * @private
	 * @param {Function} eachFunc The function to iterate over a collection.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {Function} Returns the new find function.
	 */
	function createFind(eachFunc, fromRight) {
	  return function(collection, predicate, thisArg) {
	    predicate = baseCallback(predicate, thisArg, 3);
	    if (isArray(collection)) {
	      var index = baseFindIndex(collection, predicate, fromRight);
	      return index > -1 ? collection[index] : undefined;
	    }
	    return baseFind(collection, predicate, eachFunc);
	  };
	}
	
	module.exports = createFind;


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(92),
	    baseMatchesProperty = __webpack_require__(104),
	    bindCallback = __webpack_require__(47),
	    identity = __webpack_require__(32),
	    property = __webpack_require__(111);
	
	/**
	 * The base implementation of `_.callback` which supports specifying the
	 * number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {*} [func=_.identity] The value to convert to a callback.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function baseCallback(func, thisArg, argCount) {
	  var type = typeof func;
	  if (type == 'function') {
	    return thisArg === undefined
	      ? func
	      : bindCallback(func, thisArg, argCount);
	  }
	  if (func == null) {
	    return identity;
	  }
	  if (type == 'object') {
	    return baseMatches(func);
	  }
	  return thisArg === undefined
	    ? property(func)
	    : baseMatchesProperty(func, thisArg);
	}
	
	module.exports = baseCallback;


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(93),
	    getMatchData = __webpack_require__(101),
	    toObject = __webpack_require__(9);
	
	/**
	 * The base implementation of `_.matches` which does not clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatches(source) {
	  var matchData = getMatchData(source);
	  if (matchData.length == 1 && matchData[0][2]) {
	    var key = matchData[0][0],
	        value = matchData[0][1];
	
	    return function(object) {
	      if (object == null) {
	        return false;
	      }
	      object = toObject(object);
	      return object[key] === value && (value !== undefined || (key in object));
	    };
	  }
	  return function(object) {
	    return baseIsMatch(object, matchData);
	  };
	}
	
	module.exports = baseMatches;


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(94),
	    toObject = __webpack_require__(9);
	
	/**
	 * The base implementation of `_.isMatch` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Array} matchData The propery names, values, and compare flags to match.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, matchData, customizer) {
	  var index = matchData.length,
	      length = index,
	      noCustomizer = !customizer;
	
	  if (object == null) {
	    return !length;
	  }
	  object = toObject(object);
	  while (index--) {
	    var data = matchData[index];
	    if ((noCustomizer && data[2])
	          ? data[1] !== object[data[0]]
	          : !(data[0] in object)
	        ) {
	      return false;
	    }
	  }
	  while (++index < length) {
	    data = matchData[index];
	    var key = data[0],
	        objValue = object[key],
	        srcValue = data[1];
	
	    if (noCustomizer && data[2]) {
	      if (objValue === undefined && !(key in object)) {
	        return false;
	      }
	    } else {
	      var result = customizer ? customizer(objValue, srcValue, key) : undefined;
	      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
	        return false;
	      }
	    }
	  }
	  return true;
	}
	
	module.exports = baseIsMatch;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(95),
	    isObject = __webpack_require__(10),
	    isObjectLike = __webpack_require__(12);
	
	/**
	 * The base implementation of `_.isEqual` without support for `this` binding
	 * `customizer` functions.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
	  if (value === other) {
	    return true;
	  }
	  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
	}
	
	module.exports = baseIsEqual;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var equalArrays = __webpack_require__(96),
	    equalByTag = __webpack_require__(98),
	    equalObjects = __webpack_require__(99),
	    isArray = __webpack_require__(21),
	    isHostObject = __webpack_require__(25),
	    isTypedArray = __webpack_require__(100);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;
	
	  if (!objIsArr) {
	    objTag = objToString.call(object);
	    if (objTag == argsTag) {
	      objTag = objectTag;
	    } else if (objTag != objectTag) {
	      objIsArr = isTypedArray(object);
	    }
	  }
	  if (!othIsArr) {
	    othTag = objToString.call(other);
	    if (othTag == argsTag) {
	      othTag = objectTag;
	    } else if (othTag != objectTag) {
	      othIsArr = isTypedArray(other);
	    }
	  }
	  var objIsObj = objTag == objectTag && !isHostObject(object),
	      othIsObj = othTag == objectTag && !isHostObject(other),
	      isSameTag = objTag == othTag;
	
	  if (isSameTag && !(objIsArr || objIsObj)) {
	    return equalByTag(object, other, objTag);
	  }
	  if (!isLoose) {
	    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
	
	    if (objIsWrapped || othIsWrapped) {
	      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
	    }
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  // For more information on detecting circular references see https://es5.github.io/#JO.
	  stackA || (stackA = []);
	  stackB || (stackB = []);
	
	  var length = stackA.length;
	  while (length--) {
	    if (stackA[length] == object) {
	      return stackB[length] == other;
	    }
	  }
	  // Add `object` and `other` to the stack of traversed objects.
	  stackA.push(object);
	  stackB.push(other);
	
	  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
	
	  stackA.pop();
	  stackB.pop();
	
	  return result;
	}
	
	module.exports = baseIsEqualDeep;


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	var arraySome = __webpack_require__(97);
	
	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing arrays.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var index = -1,
	      arrLength = array.length,
	      othLength = other.length;
	
	  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
	    return false;
	  }
	  // Ignore non-index properties.
	  while (++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index],
	        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
	
	    if (result !== undefined) {
	      if (result) {
	        continue;
	      }
	      return false;
	    }
	    // Recursively compare arrays (susceptible to call stack limits).
	    if (isLoose) {
	      if (!arraySome(other, function(othValue) {
	            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
	          })) {
	        return false;
	      }
	    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = equalArrays;


/***/ },
/* 97 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.some` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if any element passes the predicate check,
	 *  else `false`.
	 */
	function arraySome(array, predicate) {
	  var index = -1,
	      length = array.length;
	
	  while (++index < length) {
	    if (predicate(array[index], index, array)) {
	      return true;
	    }
	  }
	  return false;
	}
	
	module.exports = arraySome;


/***/ },
/* 98 */
/***/ function(module, exports) {

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';
	
	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag) {
	  switch (tag) {
	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	      return +object == +other;
	
	    case errorTag:
	      return object.name == other.name && object.message == other.message;
	
	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object)
	        ? other != +other
	        : object == +other;
	
	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings primitives and string
	      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	      return object == (other + '');
	  }
	  return false;
	}
	
	module.exports = equalByTag;


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(43);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isLoose] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
	  var objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;
	
	  if (objLength != othLength && !isLoose) {
	    return false;
	  }
	  var index = objLength;
	  while (index--) {
	    var key = objProps[index];
	    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
	      return false;
	    }
	  }
	  var skipCtor = isLoose;
	  while (++index < objLength) {
	    key = objProps[index];
	    var objValue = object[key],
	        othValue = other[key],
	        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;
	
	    // Recursively compare objects (susceptible to call stack limits).
	    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
	      return false;
	    }
	    skipCtor || (skipCtor = key == 'constructor');
	  }
	  if (!skipCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;
	
	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = equalObjects;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(20),
	    isObjectLike = __webpack_require__(12);
	
	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';
	
	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';
	
	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
	}
	
	module.exports = isTypedArray;


/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	var isStrictComparable = __webpack_require__(102),
	    pairs = __webpack_require__(103);
	
	/**
	 * Gets the propery names, values, and compare flags of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the match data of `object`.
	 */
	function getMatchData(object) {
	  var result = pairs(object),
	      length = result.length;
	
	  while (length--) {
	    result[length][2] = isStrictComparable(result[length][1]);
	  }
	  return result;
	}
	
	module.exports = getMatchData;


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(10);
	
	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && !isObject(value);
	}
	
	module.exports = isStrictComparable;


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(43),
	    toObject = __webpack_require__(9);
	
	/**
	 * Creates a two dimensional array of the key-value pairs for `object`,
	 * e.g. `[[key1, value1], [key2, value2]]`.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the new array of key-value pairs.
	 * @example
	 *
	 * _.pairs({ 'barney': 36, 'fred': 40 });
	 * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
	 */
	function pairs(object) {
	  object = toObject(object);
	
	  var index = -1,
	      props = keys(object),
	      length = props.length,
	      result = Array(length);
	
	  while (++index < length) {
	    var key = props[index];
	    result[index] = [key, object[key]];
	  }
	  return result;
	}
	
	module.exports = pairs;


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(105),
	    baseIsEqual = __webpack_require__(94),
	    baseSlice = __webpack_require__(106),
	    isArray = __webpack_require__(21),
	    isKey = __webpack_require__(107),
	    isStrictComparable = __webpack_require__(102),
	    last = __webpack_require__(108),
	    toObject = __webpack_require__(9),
	    toPath = __webpack_require__(109);
	
	/**
	 * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
	 *
	 * @private
	 * @param {string} path The path of the property to get.
	 * @param {*} srcValue The value to compare.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatchesProperty(path, srcValue) {
	  var isArr = isArray(path),
	      isCommon = isKey(path) && isStrictComparable(srcValue),
	      pathKey = (path + '');
	
	  path = toPath(path);
	  return function(object) {
	    if (object == null) {
	      return false;
	    }
	    var key = pathKey;
	    object = toObject(object);
	    if ((isArr || !isCommon) && !(key in object)) {
	      object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
	      if (object == null) {
	        return false;
	      }
	      key = last(path);
	      object = toObject(object);
	    }
	    return object[key] === srcValue
	      ? (srcValue !== undefined || (key in object))
	      : baseIsEqual(srcValue, object[key], undefined, true);
	  };
	}
	
	module.exports = baseMatchesProperty;


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(9);
	
	/**
	 * The base implementation of `get` without support for string paths
	 * and default values.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} path The path of the property to get.
	 * @param {string} [pathKey] The key representation of path.
	 * @returns {*} Returns the resolved value.
	 */
	function baseGet(object, path, pathKey) {
	  if (object == null) {
	    return;
	  }
	  object = toObject(object);
	  if (pathKey !== undefined && pathKey in object) {
	    path = [pathKey];
	  }
	  var index = 0,
	      length = path.length;
	
	  while (object != null && index < length) {
	    object = toObject(object)[path[index++]];
	  }
	  return (index && index == length) ? object : undefined;
	}
	
	module.exports = baseGet;


/***/ },
/* 106 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.slice` without an iteratee call guard.
	 *
	 * @private
	 * @param {Array} array The array to slice.
	 * @param {number} [start=0] The start position.
	 * @param {number} [end=array.length] The end position.
	 * @returns {Array} Returns the slice of `array`.
	 */
	function baseSlice(array, start, end) {
	  var index = -1,
	      length = array.length;
	
	  start = start == null ? 0 : (+start || 0);
	  if (start < 0) {
	    start = -start > length ? 0 : (length + start);
	  }
	  end = (end === undefined || end > length) ? length : (+end || 0);
	  if (end < 0) {
	    end += length;
	  }
	  length = start > end ? 0 : ((end - start) >>> 0);
	  start >>>= 0;
	
	  var result = Array(length);
	  while (++index < length) {
	    result[index] = array[index + start];
	  }
	  return result;
	}
	
	module.exports = baseSlice;


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var isArray = __webpack_require__(21),
	    toObject = __webpack_require__(9);
	
	/** Used to match property names within property paths. */
	var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
	    reIsPlainProp = /^\w*$/;
	
	/**
	 * Checks if `value` is a property name and not a property path.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {Object} [object] The object to query keys on.
	 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
	 */
	function isKey(value, object) {
	  var type = typeof value;
	  if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
	    return true;
	  }
	  if (isArray(value)) {
	    return false;
	  }
	  var result = !reIsDeepProp.test(value);
	  return result || (object != null && value in toObject(object));
	}
	
	module.exports = isKey;


/***/ },
/* 108 */
/***/ function(module, exports) {

	/**
	 * Gets the last element of `array`.
	 *
	 * @static
	 * @memberOf _
	 * @category Array
	 * @param {Array} array The array to query.
	 * @returns {*} Returns the last element of `array`.
	 * @example
	 *
	 * _.last([1, 2, 3]);
	 * // => 3
	 */
	function last(array) {
	  var length = array ? array.length : 0;
	  return length ? array[length - 1] : undefined;
	}
	
	module.exports = last;


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(110),
	    isArray = __webpack_require__(21);
	
	/** Used to match property names within property paths. */
	var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
	
	/** Used to match backslashes in property paths. */
	var reEscapeChar = /\\(\\)?/g;
	
	/**
	 * Converts `value` to property path array if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Array} Returns the property path array.
	 */
	function toPath(value) {
	  if (isArray(value)) {
	    return value;
	  }
	  var result = [];
	  baseToString(value).replace(rePropName, function(match, number, quote, string) {
	    result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	  });
	  return result;
	}
	
	module.exports = toPath;


/***/ },
/* 110 */
/***/ function(module, exports) {

	/**
	 * Converts `value` to a string if it's not one. An empty string is returned
	 * for `null` or `undefined` values.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  return value == null ? '' : (value + '');
	}
	
	module.exports = baseToString;


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(19),
	    basePropertyDeep = __webpack_require__(112),
	    isKey = __webpack_require__(107);
	
	/**
	 * Creates a function that returns the property value at `path` on a
	 * given object.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var objects = [
	 *   { 'a': { 'b': { 'c': 2 } } },
	 *   { 'a': { 'b': { 'c': 1 } } }
	 * ];
	 *
	 * _.map(objects, _.property('a.b.c'));
	 * // => [2, 1]
	 *
	 * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
	 * // => [1, 2]
	 */
	function property(path) {
	  return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
	}
	
	module.exports = property;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	var baseGet = __webpack_require__(105),
	    toPath = __webpack_require__(109);
	
	/**
	 * A specialized version of `baseProperty` which supports deep paths.
	 *
	 * @private
	 * @param {Array|string} path The path of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function basePropertyDeep(path) {
	  var pathKey = (path + '');
	  path = toPath(path);
	  return function(object) {
	    return baseGet(object, path, pathKey);
	  };
	}
	
	module.exports = basePropertyDeep;


/***/ },
/* 113 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
	 * without support for callback shorthands and `this` binding, which iterates
	 * over `collection` using the provided `eachFunc`.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {Function} eachFunc The function to iterate over `collection`.
	 * @param {boolean} [retKey] Specify returning the key of the found element
	 *  instead of the element itself.
	 * @returns {*} Returns the found element or its key, else `undefined`.
	 */
	function baseFind(collection, predicate, eachFunc, retKey) {
	  var result;
	  eachFunc(collection, function(value, key, collection) {
	    if (predicate(value, key, collection)) {
	      result = retKey ? key : value;
	      return false;
	    }
	  });
	  return result;
	}
	
	module.exports = baseFind;


/***/ },
/* 114 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.findIndex` and `_.findLastIndex` without
	 * support for callback shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to search.
	 * @param {Function} predicate The function invoked per iteration.
	 * @param {boolean} [fromRight] Specify iterating from right to left.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function baseFindIndex(array, predicate, fromRight) {
	  var length = array.length,
	      index = fromRight ? length : -1;
	
	  while ((fromRight ? index-- : ++index < length)) {
	    if (predicate(array[index], index, array)) {
	      return index;
	    }
	  }
	  return -1;
	}
	
	module.exports = baseFindIndex;


/***/ },
/* 115 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is `undefined`.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
	 * @example
	 *
	 * _.isUndefined(void 0);
	 * // => true
	 *
	 * _.isUndefined(null);
	 * // => false
	 */
	function isUndefined(value) {
	  return value === undefined;
	}
	
	module.exports = isUndefined;


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var log = __webpack_require__(3).log;
	var _ = {
	  isPlainObject: __webpack_require__(5),
	  isString: __webpack_require__(11),
	};
	
	var SchemaMarkup = __webpack_require__(117);
	var jsyaml = __webpack_require__(122);
	
	var Model = module.exports = function (name, definition, models, modelPropertyMacro) {
	  this.definition = definition || {};
	  this.isArray = definition.type === 'array';
	  this.models = models || {};
	  this.name = name || definition.title || 'Inline Model';
	  this.modelPropertyMacro = modelPropertyMacro || function (property) {
	    return property.default;
	  };
	
	  return this;
	};
	
	// Note!  This function will be removed in 2.2.x!
	Model.prototype.createJSONSample = Model.prototype.getSampleValue = function (modelsToIgnore) {
	  modelsToIgnore = modelsToIgnore || {};
	
	  modelsToIgnore[this.name] = this;
	
	  // Response support
	  if (this.examples && _.isPlainObject(this.examples) && this.examples['application/json']) {
	    this.definition.example = this.examples['application/json'];
	
	    if (_.isString(this.definition.example)) {
	      this.definition.example = jsyaml.safeLoad(this.definition.example);
	    }
	  } else if (!this.definition.example) {
	    this.definition.example = this.examples;
	  }
	
	  return SchemaMarkup.schemaToJSON(this.definition, this.models, modelsToIgnore, this.modelPropertyMacro);
	};
	
	Model.prototype.getMockSignature = function () {
	  return SchemaMarkup.schemaToHTML(this.name, this.definition, this.models, this.modelPropertyMacro);
	};


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Helpers = __webpack_require__(3);
	
	var _ = {
	  isPlainObject: __webpack_require__(5),
	  isUndefined: __webpack_require__(115),
	  isArray: __webpack_require__(21),
	  isObject: __webpack_require__(10),
	  isEmpty: __webpack_require__(118),
	  map: __webpack_require__(119),
	  indexOf: __webpack_require__(27),
	  cloneDeep: __webpack_require__(81),
	  keys: __webpack_require__(43),
	  forEach: __webpack_require__(40)
	};
	
	var optionHtml = module.exports.optionHtml = function  (label, value) {
	  return '<tr><td class="optionName">' + label + ':</td><td>' + value + '</td></tr>';
	};
	
	module.exports.typeFromJsonSchema = function (type, format) {
	  var str;
	
	  if (type === 'integer' && format === 'int32') {
	    str = 'integer';
	  } else if (type === 'integer' && format === 'int64') {
	    str = 'long';
	  } else if (type === 'integer' && typeof format === 'undefined') {
	    str = 'long';
	  } else if (type === 'string' && format === 'date-time') {
	    str = 'date-time';
	  } else if (type === 'string' && format === 'date') {
	    str = 'date';
	  } else if (type === 'number' && format === 'float') {
	    str = 'float';
	  } else if (type === 'number' && format === 'double') {
	    str = 'double';
	  } else if (type === 'number' && typeof format === 'undefined') {
	    str = 'double';
	  } else if (type === 'boolean') {
	    str = 'boolean';
	  } else if (type === 'string') {
	    str = 'string';
	  }
	
	  return str;
	};
	
	var getStringSignature = module.exports.getStringSignature = function (obj, baseComponent) {
	  var str = '';
	
	  if (typeof obj.$ref !== 'undefined') {
	    str += Helpers.simpleRef(obj.$ref);
	  } else if (typeof obj.type === 'undefined') {
	    str += 'object';
	  } else if (obj.type === 'array') {
	    if (baseComponent) {
	      str += getStringSignature((obj.items || obj.$ref || {}));
	    } else {
	      str += 'Array[';
	      str += getStringSignature((obj.items || obj.$ref || {}));
	      str += ']';
	    }
	  } else if (obj.type === 'integer' && obj.format === 'int32') {
	    str += 'integer';
	  } else if (obj.type === 'integer' && obj.format === 'int64') {
	    str += 'long';
	  } else if (obj.type === 'integer' && typeof obj.format === 'undefined') {
	    str += 'long';
	  } else if (obj.type === 'string' && obj.format === 'date-time') {
	    str += 'date-time';
	  } else if (obj.type === 'string' && obj.format === 'date') {
	    str += 'date';
	  } else if (obj.type === 'string' && typeof obj.format === 'undefined') {
	    str += 'string';
	  } else if (obj.type === 'number' && obj.format === 'float') {
	    str += 'float';
	  } else if (obj.type === 'number' && obj.format === 'double') {
	    str += 'double';
	  } else if (obj.type === 'number' && typeof obj.format === 'undefined') {
	    str += 'double';
	  } else if (obj.type === 'boolean') {
	    str += 'boolean';
	  } else if (obj.$ref) {
	    str += Helpers.simpleRef(obj.$ref);
	  } else {
	    str += obj.type;
	  }
	
	  return str;
	};
	
	var schemaToJSON = module.exports.schemaToJSON = function (schema, models, modelsToIgnore, modelPropertyMacro) {
	  // Resolve the schema (Handle nested schemas)
	  schema = Helpers.resolveSchema(schema);
	
	  if(typeof modelPropertyMacro !== 'function') {
	    modelPropertyMacro = function(prop){
	      return (prop || {}).default;
	    };
	  }
	
	  modelsToIgnore= modelsToIgnore || {};
	
	  var type = schema.type || 'object';
	  var format = schema.format;
	  var model;
	  var output;
	
	  if (!_.isUndefined(schema.example)) {
	    output = schema.example;
	  } else if (_.isUndefined(schema.items) && _.isArray(schema.enum)) {
	    output = schema.enum[0];
	  }
	
	  if (_.isUndefined(output)) {
	    if (schema.$ref) {
	      model = models[Helpers.simpleRef(schema.$ref)];
	
	      if (!_.isUndefined(model)) {
	        if (_.isUndefined(modelsToIgnore[model.name])) {
	          modelsToIgnore[model.name] = model;
	          output = schemaToJSON(model.definition, models, modelsToIgnore, modelPropertyMacro);
	          delete modelsToIgnore[model.name];
	        } else {
	          if (model.type === 'array') {
	            output = [];
	          } else {
	            output = {};
	          }
	        }
	      }
	    } else if (!_.isUndefined(schema.default)) {
	      output = schema.default;
	    } else if (type === 'string') {
	      if (format === 'date-time') {
	        output = new Date().toISOString();
	      } else if (format === 'date') {
	        output = new Date().toISOString().split('T')[0];
	      } else {
	        output = 'string';
	      }
	    } else if (type === 'integer') {
	      output = 0;
	    } else if (type === 'number') {
	      output = 0.0;
	    } else if (type === 'boolean') {
	      output = true;
	    } else if (type === 'object') {
	      output = {};
	
	      _.forEach(schema.properties, function (property, name) {
	        var cProperty = _.cloneDeep(property);
	
	        // Allow macro to set the default value
	        cProperty.default = modelPropertyMacro(property);
	
	        output[name] = schemaToJSON(cProperty, models, modelsToIgnore, modelPropertyMacro);
	      });
	    } else if (type === 'array') {
	      output = [];
	
	      if (_.isArray(schema.items)) {
	        _.forEach(schema.items, function (item) {
	          output.push(schemaToJSON(item, models, modelsToIgnore, modelPropertyMacro));
	        });
	      } else if (_.isPlainObject(schema.items)) {
	        output.push(schemaToJSON(schema.items, models, modelsToIgnore, modelPropertyMacro));
	      } else if (_.isUndefined(schema.items)) {
	        output.push({});
	      } else {
	        Helpers.log('Array type\'s \'items\' property is not an array or an object, cannot process');
	      }
	    }
	  }
	
	  return output;
	};
	
	module.exports.schemaToHTML =function (name, schema, models, modelPropertyMacro) {
	  var strongOpen = '<span class="strong">';
	  var strongClose = '</span>';
	
	  // Allow for ignoring the 'name' argument.... shifting the rest
	  if(_.isObject(arguments[0])) {
	    name = void 0;
	    schema = arguments[0];
	    models = arguments[1];
	    modelPropertyMacro = arguments[2];
	  }
	
	  models = models || {};
	
	  // Resolve the schema (Handle nested schemas)
	  schema = Helpers.resolveSchema(schema);
	
	  // Return for empty object
	  if(_.isEmpty(schema)) {
	    return strongOpen + 'Empty' + strongClose;
	  }
	
	  // Dereference $ref from 'models'
	  if(typeof schema.$ref === 'string') {
	    name = Helpers.simpleRef(schema.$ref);
	    schema = models[name];
	    if(typeof schema === 'undefined')
	    {
	      return strongOpen + name + ' is not defined!' + strongClose;
	    }
	  }
	
	  if(typeof name !== 'string') {
	    name = schema.title || 'Inline Model';
	  }
	
	  // If we are a Model object... adjust accordingly
	  if(schema.definition) {
	    schema = schema.definition;
	  }
	
	  if(typeof modelPropertyMacro !== 'function') {
	    modelPropertyMacro = function(prop){
	      return (prop || {}).default;
	    };
	  }
	
	  var references = {};
	  var seenModels = [];
	  var inlineModels = 0;
	
	
	
	  // Generate current HTML
	  var html = processModel(schema, name);
	
	  // Generate references HTML
	  while (_.keys(references).length > 0) {
	    /* jshint ignore:start */
	    _.forEach(references, function (schema, name) {
	      var seenModel = _.indexOf(seenModels, name) > -1;
	
	      delete references[name];
	
	      if (!seenModel) {
	        seenModels.push(name);
	
	        html += '<br />' + processModel(schema, name);
	      }
	    });
	    /* jshint ignore:end */
	  }
	
	  return html;
	
	  /////////////////////////////////
	
	  function addReference(schema, name, skipRef) {
	    var modelName = name;
	    var model;
	
	    if (schema.$ref) {
	      modelName = schema.title || Helpers.simpleRef(schema.$ref);
	      model = models[modelName];
	    } else if (_.isUndefined(name)) {
	      modelName = schema.title || 'Inline Model ' + (++inlineModels);
	      model = {definition: schema};
	    }
	
	    if (skipRef !== true) {
	      references[modelName] = _.isUndefined(model) ? {} : model.definition;
	    }
	
	    return modelName;
	  }
	
	  function primitiveToHTML(schema) {
	    var html = '<span class="propType">';
	    var type = schema.type || 'object';
	
	    if (schema.$ref) {
	      html += addReference(schema, Helpers.simpleRef(schema.$ref));
	    } else if (type === 'object') {
	      if (!_.isUndefined(schema.properties)) {
	        html += addReference(schema);
	      } else {
	        html += 'object';
	      }
	    } else if (type === 'array') {
	      html += 'Array[';
	
	      if (_.isArray(schema.items)) {
	        html += _.map(schema.items, addReference).join(',');
	      } else if (_.isPlainObject(schema.items)) {
	        if (_.isUndefined(schema.items.$ref)) {
	          if (!_.isUndefined(schema.items.type) && _.indexOf(['array', 'object'], schema.items.type) === -1) {
	            html += schema.items.type;
	          } else {
	            html += addReference(schema.items);
	          }
	        } else {
	          html += addReference(schema.items, Helpers.simpleRef(schema.items.$ref));
	        }
	      } else {
	        Helpers.log('Array type\'s \'items\' schema is not an array or an object, cannot process');
	        html += 'object';
	      }
	
	      html += ']';
	    } else {
	      html += schema.type;
	    }
	
	    html += '</span>';
	
	    return html;
	  }
	
	  function primitiveToOptionsHTML(schema, html) {
	    var options = '';
	    var type = schema.type || 'object';
	    var isArray = type === 'array';
	
	    if (isArray) {
	      if (_.isPlainObject(schema.items) && !_.isUndefined(schema.items.type)) {
	        type = schema.items.type;
	      } else {
	        type = 'object';
	      }
	    }
	
	    if (!_.isUndefined(schema.default)) {
	      options += optionHtml('Default', schema.default);
	    }
	
	    switch (type) {
	    case 'string':
	      if (schema.minLength) {
	        options += optionHtml('Min. Length', schema.minLength);
	      }
	
	      if (schema.maxLength) {
	        options += optionHtml('Max. Length', schema.maxLength);
	      }
	
	      if (schema.pattern) {
	        options += optionHtml('Reg. Exp.', schema.pattern);
	      }
	      break;
	    case 'integer':
	    case 'number':
	      if (schema.minimum) {
	        options += optionHtml('Min. Value', schema.minimum);
	      }
	
	      if (schema.exclusiveMinimum) {
	        options += optionHtml('Exclusive Min.', 'true');
	      }
	
	      if (schema.maximum) {
	        options += optionHtml('Max. Value', schema.maximum);
	      }
	
	      if (schema.exclusiveMaximum) {
	        options += optionHtml('Exclusive Max.', 'true');
	      }
	
	      if (schema.multipleOf) {
	        options += optionHtml('Multiple Of', schema.multipleOf);
	      }
	
	      break;
	    }
	
	    if (isArray) {
	      if (schema.minItems) {
	        options += optionHtml('Min. Items', schema.minItems);
	      }
	
	      if (schema.maxItems) {
	        options += optionHtml('Max. Items', schema.maxItems);
	      }
	
	      if (schema.uniqueItems) {
	        options += optionHtml('Unique Items', 'true');
	      }
	
	      if (schema.collectionFormat) {
	        options += optionHtml('Coll. Format', schema.collectionFormat);
	      }
	    }
	
	    if (_.isUndefined(schema.items)) {
	      if (_.isArray(schema.enum)) {
	        var enumString;
	
	        if (type === 'number' || type === 'integer') {
	          enumString = schema.enum.join(', ');
	        } else {
	          enumString = '"' + schema.enum.join('", "') + '"';
	        }
	
	        options += optionHtml('Enum', enumString);
	      }
	    }
	
	    if (options.length > 0) {
	      html = '<span class="propWrap">' + html + '<table class="optionsWrapper"><tr><th colspan="2">' + type + '</th></tr>' + options + '</table></span>';
	    }
	
	    return html;
	  }
	
	  function processModel(schema, name) {
	    var type = schema.type || 'object';
	    var isArray = schema.type === 'array';
	    var html = strongOpen + name + ' ' + (isArray ? '[' : '{') + strongClose;
	
	    if (name) {
	      seenModels.push(name);
	    }
	
	    if (isArray) {
	      if (_.isArray(schema.items)) {
	        html += '<div>' + _.map(schema.items, function (item) {
	          var type = item.type || 'object';
	
	          if (_.isUndefined(item.$ref)) {
	            if (_.indexOf(['array', 'object'], type) > -1) {
	              if (type === 'object' && _.isUndefined(item.properties)) {
	                return 'object';
	              } else {
	                return addReference(item);
	              }
	            } else {
	              return primitiveToOptionsHTML(item, type);
	            }
	          } else {
	            return addReference(item, Helpers.simpleRef(item.$ref));
	          }
	        }).join(',</div><div>');
	      } else if (_.isPlainObject(schema.items)) {
	        if (_.isUndefined(schema.items.$ref)) {
	          if (_.indexOf(['array', 'object'], schema.items.type || 'object') > -1) {
	            if ((_.isUndefined(schema.items.type) || schema.items.type === 'object') && _.isUndefined(schema.items.properties)) {
	              html += '<div>object</div>';
	            } else {
	              html += '<div>' + addReference(schema.items) + '</div>';
	            }
	          } else {
	            html += '<div>' + primitiveToOptionsHTML(schema.items, schema.items.type) + '</div>';
	          }
	        } else {
	          html += '<div>' + addReference(schema.items, Helpers.simpleRef(schema.items.$ref)) + '</div>';
	        }
	      } else {
	        Helpers.log('Array type\'s \'items\' property is not an array or an object, cannot process');
	        html += '<div>object</div>';
	      }
	    } else {
	      if (schema.$ref) {
	        html += '<div>' + addReference(schema, name) + '</div>';
	      } else if (type === 'object') {
	        if (_.isPlainObject(schema.properties)) {
	          var contents = _.map(schema.properties, function (property, name) {
	            var propertyIsRequired = (_.indexOf(schema.required, name) >= 0);
	            var cProperty = _.cloneDeep(property);
	
	            var requiredClass = propertyIsRequired ? 'required' : '';
	            var html = '<span class="propName ' + requiredClass + '">' + name + '</span> (';
	            var model;
	            var propDescription;
	
	            // Allow macro to set the default value
	            cProperty.default = modelPropertyMacro(cProperty);
	
	            // Resolve the schema (Handle nested schemas)
	            cProperty = Helpers.resolveSchema(cProperty);
	
	            propDescription = property.description || cProperty.description;
	
	            // We need to handle property references to primitives (Issue 339)
	            if (!_.isUndefined(cProperty.$ref)) {
	              model = models[Helpers.simpleRef(cProperty.$ref)];
	
	              if (!_.isUndefined(model) && _.indexOf([undefined, 'array', 'object'], model.definition.type) === -1) {
	                // Use referenced schema
	                cProperty = Helpers.resolveSchema(model.definition);
	              }
	            }
	
	            html += primitiveToHTML(cProperty);
	
	            if(!propertyIsRequired) {
	              html += ', <span class="propOptKey">optional</span>';
	            }
	
	            if(property.readOnly) {
	                html += ', <span class="propReadOnly">read only</span>';
	            }
	
	            html += ')';
	
	            if (!_.isUndefined(propDescription)) {
	              html += ': ' + '<span class="propDesc">' + propDescription + '</span>';
	            }
	
	            if (cProperty.enum) {
	              html += ' = <span class="propVals">[\'' + cProperty.enum.join('\', \'') + '\']</span>';
	            }
	
	            return '<div' + (property.readOnly ? ' class="readOnly"' : '') + '>' + primitiveToOptionsHTML(cProperty, html);
	          }).join(',</div>');
	
	          if (contents) {
	            html += contents + '</div>';
	          }
	        }
	      } else {
	        html += '<div>' + primitiveToOptionsHTML(schema, type) + '</div>';
	      }
	    }
	
	    return html + strongOpen + (isArray ? ']' : '}') + strongClose;
	  }
	};

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(16),
	    isArray = __webpack_require__(21),
	    isArrayLike = __webpack_require__(17),
	    isFunction = __webpack_require__(24),
	    isObjectLike = __webpack_require__(12),
	    isString = __webpack_require__(11),
	    keys = __webpack_require__(43);
	
	/**
	 * Checks if `value` is empty. A value is considered empty unless it's an
	 * `arguments` object, array, string, or jQuery-like collection with a length
	 * greater than `0` or an object with own enumerable properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {Array|Object|string} value The value to inspect.
	 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	 * @example
	 *
	 * _.isEmpty(null);
	 * // => true
	 *
	 * _.isEmpty(true);
	 * // => true
	 *
	 * _.isEmpty(1);
	 * // => true
	 *
	 * _.isEmpty([1, 2, 3]);
	 * // => false
	 *
	 * _.isEmpty({ 'a': 1 });
	 * // => false
	 */
	function isEmpty(value) {
	  if (value == null) {
	    return true;
	  }
	  if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
	      (isObjectLike(value) && isFunction(value.splice)))) {
	    return !value.length;
	  }
	  return !keys(value).length;
	}
	
	module.exports = isEmpty;


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var arrayMap = __webpack_require__(120),
	    baseCallback = __webpack_require__(91),
	    baseMap = __webpack_require__(121),
	    isArray = __webpack_require__(21);
	
	/**
	 * Creates an array of values by running each element in `collection` through
	 * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
	 * arguments: (value, index|key, collection).
	 *
	 * If a property name is provided for `iteratee` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `iteratee` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * Many lodash methods are guarded to work as iteratees for methods like
	 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
	 *
	 * The guarded methods are:
	 * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
	 * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
	 * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
	 * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
	 * `sum`, `uniq`, and `words`
	 *
	 * @static
	 * @memberOf _
	 * @alias collect
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function|Object|string} [iteratee=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `iteratee`.
	 * @returns {Array} Returns the new mapped array.
	 * @example
	 *
	 * function timesThree(n) {
	 *   return n * 3;
	 * }
	 *
	 * _.map([1, 2], timesThree);
	 * // => [3, 6]
	 *
	 * _.map({ 'a': 1, 'b': 2 }, timesThree);
	 * // => [3, 6] (iteration order is not guaranteed)
	 *
	 * var users = [
	 *   { 'user': 'barney' },
	 *   { 'user': 'fred' }
	 * ];
	 *
	 * // using the `_.property` callback shorthand
	 * _.map(users, 'user');
	 * // => ['barney', 'fred']
	 */
	function map(collection, iteratee, thisArg) {
	  var func = isArray(collection) ? arrayMap : baseMap;
	  iteratee = baseCallback(iteratee, thisArg, 3);
	  return func(collection, iteratee);
	}
	
	module.exports = map;


/***/ },
/* 120 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.map` for arrays without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function arrayMap(array, iteratee) {
	  var index = -1,
	      length = array.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = iteratee(array[index], index, array);
	  }
	  return result;
	}
	
	module.exports = arrayMap;


/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(41),
	    isArrayLike = __webpack_require__(17);
	
	/**
	 * The base implementation of `_.map` without support for callback shorthands
	 * and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the new mapped array.
	 */
	function baseMap(collection, iteratee) {
	  var index = -1,
	      result = isArrayLike(collection) ? Array(collection.length) : [];
	
	  baseEach(collection, function(value, key, collection) {
	    result[++index] = iteratee(value, key, collection);
	  });
	  return result;
	}
	
	module.exports = baseMap;


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	
	var yaml = __webpack_require__(123);
	
	
	module.exports = yaml;


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	
	var loader = __webpack_require__(124);
	var dumper = __webpack_require__(152);
	
	
	function deprecated(name) {
	  return function () {
	    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
	  };
	}
	
	
	module.exports.Type                = __webpack_require__(130);
	module.exports.Schema              = __webpack_require__(129);
	module.exports.FAILSAFE_SCHEMA     = __webpack_require__(133);
	module.exports.JSON_SCHEMA         = __webpack_require__(132);
	module.exports.CORE_SCHEMA         = __webpack_require__(131);
	module.exports.DEFAULT_SAFE_SCHEMA = __webpack_require__(128);
	module.exports.DEFAULT_FULL_SCHEMA = __webpack_require__(147);
	module.exports.load                = loader.load;
	module.exports.loadAll             = loader.loadAll;
	module.exports.safeLoad            = loader.safeLoad;
	module.exports.safeLoadAll         = loader.safeLoadAll;
	module.exports.dump                = dumper.dump;
	module.exports.safeDump            = dumper.safeDump;
	module.exports.YAMLException       = __webpack_require__(126);
	
	// Deprecated schema names from JS-YAML 2.0.x
	module.exports.MINIMAL_SCHEMA = __webpack_require__(133);
	module.exports.SAFE_SCHEMA    = __webpack_require__(128);
	module.exports.DEFAULT_SCHEMA = __webpack_require__(147);
	
	// Deprecated functions from JS-YAML 1.x.x
	module.exports.scan           = deprecated('scan');
	module.exports.parse          = deprecated('parse');
	module.exports.compose        = deprecated('compose');
	module.exports.addConstructor = deprecated('addConstructor');


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/*eslint-disable max-len,no-use-before-define*/
	
	var common              = __webpack_require__(125);
	var YAMLException       = __webpack_require__(126);
	var Mark                = __webpack_require__(127);
	var DEFAULT_SAFE_SCHEMA = __webpack_require__(128);
	var DEFAULT_FULL_SCHEMA = __webpack_require__(147);
	
	
	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	
	
	var CONTEXT_FLOW_IN   = 1;
	var CONTEXT_FLOW_OUT  = 2;
	var CONTEXT_BLOCK_IN  = 3;
	var CONTEXT_BLOCK_OUT = 4;
	
	
	var CHOMPING_CLIP  = 1;
	var CHOMPING_STRIP = 2;
	var CHOMPING_KEEP  = 3;
	
	
	var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
	var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
	var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
	var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
	
	
	function is_EOL(c) {
	  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
	}
	
	function is_WHITE_SPACE(c) {
	  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
	}
	
	function is_WS_OR_EOL(c) {
	  return (c === 0x09/* Tab */) ||
	         (c === 0x20/* Space */) ||
	         (c === 0x0A/* LF */) ||
	         (c === 0x0D/* CR */);
	}
	
	function is_FLOW_INDICATOR(c) {
	  return c === 0x2C/* , */ ||
	         c === 0x5B/* [ */ ||
	         c === 0x5D/* ] */ ||
	         c === 0x7B/* { */ ||
	         c === 0x7D/* } */;
	}
	
	function fromHexCode(c) {
	  var lc;
	
	  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
	    return c - 0x30;
	  }
	
	  /*eslint-disable no-bitwise*/
	  lc = c | 0x20;
	
	  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
	    return lc - 0x61 + 10;
	  }
	
	  return -1;
	}
	
	function escapedHexLen(c) {
	  if (c === 0x78/* x */) { return 2; }
	  if (c === 0x75/* u */) { return 4; }
	  if (c === 0x55/* U */) { return 8; }
	  return 0;
	}
	
	function fromDecimalCode(c) {
	  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
	    return c - 0x30;
	  }
	
	  return -1;
	}
	
	function simpleEscapeSequence(c) {
	  return (c === 0x30/* 0 */) ? '\x00' :
	        (c === 0x61/* a */) ? '\x07' :
	        (c === 0x62/* b */) ? '\x08' :
	        (c === 0x74/* t */) ? '\x09' :
	        (c === 0x09/* Tab */) ? '\x09' :
	        (c === 0x6E/* n */) ? '\x0A' :
	        (c === 0x76/* v */) ? '\x0B' :
	        (c === 0x66/* f */) ? '\x0C' :
	        (c === 0x72/* r */) ? '\x0D' :
	        (c === 0x65/* e */) ? '\x1B' :
	        (c === 0x20/* Space */) ? ' ' :
	        (c === 0x22/* " */) ? '\x22' :
	        (c === 0x2F/* / */) ? '/' :
	        (c === 0x5C/* \ */) ? '\x5C' :
	        (c === 0x4E/* N */) ? '\x85' :
	        (c === 0x5F/* _ */) ? '\xA0' :
	        (c === 0x4C/* L */) ? '\u2028' :
	        (c === 0x50/* P */) ? '\u2029' : '';
	}
	
	function charFromCodepoint(c) {
	  if (c <= 0xFFFF) {
	    return String.fromCharCode(c);
	  }
	  // Encode UTF-16 surrogate pair
	  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
	  return String.fromCharCode(((c - 0x010000) >> 10) + 0xD800,
	                             ((c - 0x010000) & 0x03FF) + 0xDC00);
	}
	
	var simpleEscapeCheck = new Array(256); // integer, for fast access
	var simpleEscapeMap = new Array(256);
	for (var i = 0; i < 256; i++) {
	  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
	  simpleEscapeMap[i] = simpleEscapeSequence(i);
	}
	
	
	function State(input, options) {
	  this.input = input;
	
	  this.filename  = options['filename']  || null;
	  this.schema    = options['schema']    || DEFAULT_FULL_SCHEMA;
	  this.onWarning = options['onWarning'] || null;
	  this.legacy    = options['legacy']    || false;
	  this.json      = options['json']      || false;
	  this.listener  = options['listener']  || null;
	
	  this.implicitTypes = this.schema.compiledImplicit;
	  this.typeMap       = this.schema.compiledTypeMap;
	
	  this.length     = input.length;
	  this.position   = 0;
	  this.line       = 0;
	  this.lineStart  = 0;
	  this.lineIndent = 0;
	
	  this.documents = [];
	
	  /*
	  this.version;
	  this.checkLineBreaks;
	  this.tagMap;
	  this.anchorMap;
	  this.tag;
	  this.anchor;
	  this.kind;
	  this.result;*/
	
	}
	
	
	function generateError(state, message) {
	  return new YAMLException(
	    message,
	    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
	}
	
	function throwError(state, message) {
	  throw generateError(state, message);
	}
	
	function throwWarning(state, message) {
	  if (state.onWarning) {
	    state.onWarning.call(null, generateError(state, message));
	  }
	}
	
	
	var directiveHandlers = {
	
	  YAML: function handleYamlDirective(state, name, args) {
	
	    var match, major, minor;
	
	    if (state.version !== null) {
	      throwError(state, 'duplication of %YAML directive');
	    }
	
	    if (args.length !== 1) {
	      throwError(state, 'YAML directive accepts exactly one argument');
	    }
	
	    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
	
	    if (match === null) {
	      throwError(state, 'ill-formed argument of the YAML directive');
	    }
	
	    major = parseInt(match[1], 10);
	    minor = parseInt(match[2], 10);
	
	    if (major !== 1) {
	      throwError(state, 'unacceptable YAML version of the document');
	    }
	
	    state.version = args[0];
	    state.checkLineBreaks = (minor < 2);
	
	    if (minor !== 1 && minor !== 2) {
	      throwWarning(state, 'unsupported YAML version of the document');
	    }
	  },
	
	  TAG: function handleTagDirective(state, name, args) {
	
	    var handle, prefix;
	
	    if (args.length !== 2) {
	      throwError(state, 'TAG directive accepts exactly two arguments');
	    }
	
	    handle = args[0];
	    prefix = args[1];
	
	    if (!PATTERN_TAG_HANDLE.test(handle)) {
	      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
	    }
	
	    if (_hasOwnProperty.call(state.tagMap, handle)) {
	      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
	    }
	
	    if (!PATTERN_TAG_URI.test(prefix)) {
	      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
	    }
	
	    state.tagMap[handle] = prefix;
	  }
	};
	
	
	function captureSegment(state, start, end, checkJson) {
	  var _position, _length, _character, _result;
	
	  if (start < end) {
	    _result = state.input.slice(start, end);
	
	    if (checkJson) {
	      for (_position = 0, _length = _result.length;
	           _position < _length;
	           _position += 1) {
	        _character = _result.charCodeAt(_position);
	        if (!(_character === 0x09 ||
	              (0x20 <= _character && _character <= 0x10FFFF))) {
	          throwError(state, 'expected valid JSON character');
	        }
	      }
	    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
	      throwError(state, 'the stream contains non-printable characters');
	    }
	
	    state.result += _result;
	  }
	}
	
	function mergeMappings(state, destination, source, overridableKeys) {
	  var sourceKeys, key, index, quantity;
	
	  if (!common.isObject(source)) {
	    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
	  }
	
	  sourceKeys = Object.keys(source);
	
	  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
	    key = sourceKeys[index];
	
	    if (!_hasOwnProperty.call(destination, key)) {
	      destination[key] = source[key];
	      overridableKeys[key] = true;
	    }
	  }
	}
	
	function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode) {
	  var index, quantity;
	
	  keyNode = String(keyNode);
	
	  if (_result === null) {
	    _result = {};
	  }
	
	  if (keyTag === 'tag:yaml.org,2002:merge') {
	    if (Array.isArray(valueNode)) {
	      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
	        mergeMappings(state, _result, valueNode[index], overridableKeys);
	      }
	    } else {
	      mergeMappings(state, _result, valueNode, overridableKeys);
	    }
	  } else {
	    if (!state.json &&
	        !_hasOwnProperty.call(overridableKeys, keyNode) &&
	        _hasOwnProperty.call(_result, keyNode)) {
	      throwError(state, 'duplicated mapping key');
	    }
	    _result[keyNode] = valueNode;
	    delete overridableKeys[keyNode];
	  }
	
	  return _result;
	}
	
	function readLineBreak(state) {
	  var ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch === 0x0A/* LF */) {
	    state.position++;
	  } else if (ch === 0x0D/* CR */) {
	    state.position++;
	    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
	      state.position++;
	    }
	  } else {
	    throwError(state, 'a line break is expected');
	  }
	
	  state.line += 1;
	  state.lineStart = state.position;
	}
	
	function skipSeparationSpace(state, allowComments, checkIndent) {
	  var lineBreaks = 0,
	      ch = state.input.charCodeAt(state.position);
	
	  while (ch !== 0) {
	    while (is_WHITE_SPACE(ch)) {
	      ch = state.input.charCodeAt(++state.position);
	    }
	
	    if (allowComments && ch === 0x23/* # */) {
	      do {
	        ch = state.input.charCodeAt(++state.position);
	      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
	    }
	
	    if (is_EOL(ch)) {
	      readLineBreak(state);
	
	      ch = state.input.charCodeAt(state.position);
	      lineBreaks++;
	      state.lineIndent = 0;
	
	      while (ch === 0x20/* Space */) {
	        state.lineIndent++;
	        ch = state.input.charCodeAt(++state.position);
	      }
	    } else {
	      break;
	    }
	  }
	
	  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
	    throwWarning(state, 'deficient indentation');
	  }
	
	  return lineBreaks;
	}
	
	function testDocumentSeparator(state) {
	  var _position = state.position,
	      ch;
	
	  ch = state.input.charCodeAt(_position);
	
	  // Condition state.position === state.lineStart is tested
	  // in parent on each call, for efficiency. No needs to test here again.
	  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
	      ch === state.input.charCodeAt(_position + 1) &&
	      ch === state.input.charCodeAt(_position + 2)) {
	
	    _position += 3;
	
	    ch = state.input.charCodeAt(_position);
	
	    if (ch === 0 || is_WS_OR_EOL(ch)) {
	      return true;
	    }
	  }
	
	  return false;
	}
	
	function writeFoldedLines(state, count) {
	  if (count === 1) {
	    state.result += ' ';
	  } else if (count > 1) {
	    state.result += common.repeat('\n', count - 1);
	  }
	}
	
	
	function readPlainScalar(state, nodeIndent, withinFlowCollection) {
	  var preceding,
	      following,
	      captureStart,
	      captureEnd,
	      hasPendingContent,
	      _line,
	      _lineStart,
	      _lineIndent,
	      _kind = state.kind,
	      _result = state.result,
	      ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (is_WS_OR_EOL(ch)      ||
	      is_FLOW_INDICATOR(ch) ||
	      ch === 0x23/* # */    ||
	      ch === 0x26/* & */    ||
	      ch === 0x2A/* * */    ||
	      ch === 0x21/* ! */    ||
	      ch === 0x7C/* | */    ||
	      ch === 0x3E/* > */    ||
	      ch === 0x27/* ' */    ||
	      ch === 0x22/* " */    ||
	      ch === 0x25/* % */    ||
	      ch === 0x40/* @ */    ||
	      ch === 0x60/* ` */) {
	    return false;
	  }
	
	  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
	    following = state.input.charCodeAt(state.position + 1);
	
	    if (is_WS_OR_EOL(following) ||
	        withinFlowCollection && is_FLOW_INDICATOR(following)) {
	      return false;
	    }
	  }
	
	  state.kind = 'scalar';
	  state.result = '';
	  captureStart = captureEnd = state.position;
	  hasPendingContent = false;
	
	  while (ch !== 0) {
	    if (ch === 0x3A/* : */) {
	      following = state.input.charCodeAt(state.position + 1);
	
	      if (is_WS_OR_EOL(following) ||
	          withinFlowCollection && is_FLOW_INDICATOR(following)) {
	        break;
	      }
	
	    } else if (ch === 0x23/* # */) {
	      preceding = state.input.charCodeAt(state.position - 1);
	
	      if (is_WS_OR_EOL(preceding)) {
	        break;
	      }
	
	    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
	               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
	      break;
	
	    } else if (is_EOL(ch)) {
	      _line = state.line;
	      _lineStart = state.lineStart;
	      _lineIndent = state.lineIndent;
	      skipSeparationSpace(state, false, -1);
	
	      if (state.lineIndent >= nodeIndent) {
	        hasPendingContent = true;
	        ch = state.input.charCodeAt(state.position);
	        continue;
	      } else {
	        state.position = captureEnd;
	        state.line = _line;
	        state.lineStart = _lineStart;
	        state.lineIndent = _lineIndent;
	        break;
	      }
	    }
	
	    if (hasPendingContent) {
	      captureSegment(state, captureStart, captureEnd, false);
	      writeFoldedLines(state, state.line - _line);
	      captureStart = captureEnd = state.position;
	      hasPendingContent = false;
	    }
	
	    if (!is_WHITE_SPACE(ch)) {
	      captureEnd = state.position + 1;
	    }
	
	    ch = state.input.charCodeAt(++state.position);
	  }
	
	  captureSegment(state, captureStart, captureEnd, false);
	
	  if (state.result) {
	    return true;
	  }
	
	  state.kind = _kind;
	  state.result = _result;
	  return false;
	}
	
	function readSingleQuotedScalar(state, nodeIndent) {
	  var ch,
	      captureStart, captureEnd;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch !== 0x27/* ' */) {
	    return false;
	  }
	
	  state.kind = 'scalar';
	  state.result = '';
	  state.position++;
	  captureStart = captureEnd = state.position;
	
	  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	    if (ch === 0x27/* ' */) {
	      captureSegment(state, captureStart, state.position, true);
	      ch = state.input.charCodeAt(++state.position);
	
	      if (ch === 0x27/* ' */) {
	        captureStart = captureEnd = state.position;
	        state.position++;
	      } else {
	        return true;
	      }
	
	    } else if (is_EOL(ch)) {
	      captureSegment(state, captureStart, captureEnd, true);
	      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
	      captureStart = captureEnd = state.position;
	
	    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
	      throwError(state, 'unexpected end of the document within a single quoted scalar');
	
	    } else {
	      state.position++;
	      captureEnd = state.position;
	    }
	  }
	
	  throwError(state, 'unexpected end of the stream within a single quoted scalar');
	}
	
	function readDoubleQuotedScalar(state, nodeIndent) {
	  var captureStart,
	      captureEnd,
	      hexLength,
	      hexResult,
	      tmp,
	      ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch !== 0x22/* " */) {
	    return false;
	  }
	
	  state.kind = 'scalar';
	  state.result = '';
	  state.position++;
	  captureStart = captureEnd = state.position;
	
	  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	    if (ch === 0x22/* " */) {
	      captureSegment(state, captureStart, state.position, true);
	      state.position++;
	      return true;
	
	    } else if (ch === 0x5C/* \ */) {
	      captureSegment(state, captureStart, state.position, true);
	      ch = state.input.charCodeAt(++state.position);
	
	      if (is_EOL(ch)) {
	        skipSeparationSpace(state, false, nodeIndent);
	
	        // TODO: rework to inline fn with no type cast?
	      } else if (ch < 256 && simpleEscapeCheck[ch]) {
	        state.result += simpleEscapeMap[ch];
	        state.position++;
	
	      } else if ((tmp = escapedHexLen(ch)) > 0) {
	        hexLength = tmp;
	        hexResult = 0;
	
	        for (; hexLength > 0; hexLength--) {
	          ch = state.input.charCodeAt(++state.position);
	
	          if ((tmp = fromHexCode(ch)) >= 0) {
	            hexResult = (hexResult << 4) + tmp;
	
	          } else {
	            throwError(state, 'expected hexadecimal character');
	          }
	        }
	
	        state.result += charFromCodepoint(hexResult);
	
	        state.position++;
	
	      } else {
	        throwError(state, 'unknown escape sequence');
	      }
	
	      captureStart = captureEnd = state.position;
	
	    } else if (is_EOL(ch)) {
	      captureSegment(state, captureStart, captureEnd, true);
	      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
	      captureStart = captureEnd = state.position;
	
	    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
	      throwError(state, 'unexpected end of the document within a double quoted scalar');
	
	    } else {
	      state.position++;
	      captureEnd = state.position;
	    }
	  }
	
	  throwError(state, 'unexpected end of the stream within a double quoted scalar');
	}
	
	function readFlowCollection(state, nodeIndent) {
	  var readNext = true,
	      _line,
	      _tag     = state.tag,
	      _result,
	      _anchor  = state.anchor,
	      following,
	      terminator,
	      isPair,
	      isExplicitPair,
	      isMapping,
	      overridableKeys = {},
	      keyNode,
	      keyTag,
	      valueNode,
	      ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch === 0x5B/* [ */) {
	    terminator = 0x5D;/* ] */
	    isMapping = false;
	    _result = [];
	  } else if (ch === 0x7B/* { */) {
	    terminator = 0x7D;/* } */
	    isMapping = true;
	    _result = {};
	  } else {
	    return false;
	  }
	
	  if (state.anchor !== null) {
	    state.anchorMap[state.anchor] = _result;
	  }
	
	  ch = state.input.charCodeAt(++state.position);
	
	  while (ch !== 0) {
	    skipSeparationSpace(state, true, nodeIndent);
	
	    ch = state.input.charCodeAt(state.position);
	
	    if (ch === terminator) {
	      state.position++;
	      state.tag = _tag;
	      state.anchor = _anchor;
	      state.kind = isMapping ? 'mapping' : 'sequence';
	      state.result = _result;
	      return true;
	    } else if (!readNext) {
	      throwError(state, 'missed comma between flow collection entries');
	    }
	
	    keyTag = keyNode = valueNode = null;
	    isPair = isExplicitPair = false;
	
	    if (ch === 0x3F/* ? */) {
	      following = state.input.charCodeAt(state.position + 1);
	
	      if (is_WS_OR_EOL(following)) {
	        isPair = isExplicitPair = true;
	        state.position++;
	        skipSeparationSpace(state, true, nodeIndent);
	      }
	    }
	
	    _line = state.line;
	    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
	    keyTag = state.tag;
	    keyNode = state.result;
	    skipSeparationSpace(state, true, nodeIndent);
	
	    ch = state.input.charCodeAt(state.position);
	
	    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
	      isPair = true;
	      ch = state.input.charCodeAt(++state.position);
	      skipSeparationSpace(state, true, nodeIndent);
	      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
	      valueNode = state.result;
	    }
	
	    if (isMapping) {
	      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
	    } else if (isPair) {
	      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
	    } else {
	      _result.push(keyNode);
	    }
	
	    skipSeparationSpace(state, true, nodeIndent);
	
	    ch = state.input.charCodeAt(state.position);
	
	    if (ch === 0x2C/* , */) {
	      readNext = true;
	      ch = state.input.charCodeAt(++state.position);
	    } else {
	      readNext = false;
	    }
	  }
	
	  throwError(state, 'unexpected end of the stream within a flow collection');
	}
	
	function readBlockScalar(state, nodeIndent) {
	  var captureStart,
	      folding,
	      chomping       = CHOMPING_CLIP,
	      didReadContent = false,
	      detectedIndent = false,
	      textIndent     = nodeIndent,
	      emptyLines     = 0,
	      atMoreIndented = false,
	      tmp,
	      ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch === 0x7C/* | */) {
	    folding = false;
	  } else if (ch === 0x3E/* > */) {
	    folding = true;
	  } else {
	    return false;
	  }
	
	  state.kind = 'scalar';
	  state.result = '';
	
	  while (ch !== 0) {
	    ch = state.input.charCodeAt(++state.position);
	
	    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
	      if (CHOMPING_CLIP === chomping) {
	        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
	      } else {
	        throwError(state, 'repeat of a chomping mode identifier');
	      }
	
	    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
	      if (tmp === 0) {
	        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
	      } else if (!detectedIndent) {
	        textIndent = nodeIndent + tmp - 1;
	        detectedIndent = true;
	      } else {
	        throwError(state, 'repeat of an indentation width identifier');
	      }
	
	    } else {
	      break;
	    }
	  }
	
	  if (is_WHITE_SPACE(ch)) {
	    do { ch = state.input.charCodeAt(++state.position); }
	    while (is_WHITE_SPACE(ch));
	
	    if (ch === 0x23/* # */) {
	      do { ch = state.input.charCodeAt(++state.position); }
	      while (!is_EOL(ch) && (ch !== 0));
	    }
	  }
	
	  while (ch !== 0) {
	    readLineBreak(state);
	    state.lineIndent = 0;
	
	    ch = state.input.charCodeAt(state.position);
	
	    while ((!detectedIndent || state.lineIndent < textIndent) &&
	           (ch === 0x20/* Space */)) {
	      state.lineIndent++;
	      ch = state.input.charCodeAt(++state.position);
	    }
	
	    if (!detectedIndent && state.lineIndent > textIndent) {
	      textIndent = state.lineIndent;
	    }
	
	    if (is_EOL(ch)) {
	      emptyLines++;
	      continue;
	    }
	
	    // End of the scalar.
	    if (state.lineIndent < textIndent) {
	
	      // Perform the chomping.
	      if (chomping === CHOMPING_KEEP) {
	        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
	      } else if (chomping === CHOMPING_CLIP) {
	        if (didReadContent) { // i.e. only if the scalar is not empty.
	          state.result += '\n';
	        }
	      }
	
	      // Break this `while` cycle and go to the funciton's epilogue.
	      break;
	    }
	
	    // Folded style: use fancy rules to handle line breaks.
	    if (folding) {
	
	      // Lines starting with white space characters (more-indented lines) are not folded.
	      if (is_WHITE_SPACE(ch)) {
	        atMoreIndented = true;
	        // except for the first content line (cf. Example 8.1)
	        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
	
	      // End of more-indented block.
	      } else if (atMoreIndented) {
	        atMoreIndented = false;
	        state.result += common.repeat('\n', emptyLines + 1);
	
	      // Just one line break - perceive as the same line.
	      } else if (emptyLines === 0) {
	        if (didReadContent) { // i.e. only if we have already read some scalar content.
	          state.result += ' ';
	        }
	
	      // Several line breaks - perceive as different lines.
	      } else {
	        state.result += common.repeat('\n', emptyLines);
	      }
	
	    // Literal style: just add exact number of line breaks between content lines.
	    } else {
	      // Keep all line breaks except the header line break.
	      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
	    }
	
	    didReadContent = true;
	    detectedIndent = true;
	    emptyLines = 0;
	    captureStart = state.position;
	
	    while (!is_EOL(ch) && (ch !== 0)) {
	      ch = state.input.charCodeAt(++state.position);
	    }
	
	    captureSegment(state, captureStart, state.position, false);
	  }
	
	  return true;
	}
	
	function readBlockSequence(state, nodeIndent) {
	  var _line,
	      _tag      = state.tag,
	      _anchor   = state.anchor,
	      _result   = [],
	      following,
	      detected  = false,
	      ch;
	
	  if (state.anchor !== null) {
	    state.anchorMap[state.anchor] = _result;
	  }
	
	  ch = state.input.charCodeAt(state.position);
	
	  while (ch !== 0) {
	
	    if (ch !== 0x2D/* - */) {
	      break;
	    }
	
	    following = state.input.charCodeAt(state.position + 1);
	
	    if (!is_WS_OR_EOL(following)) {
	      break;
	    }
	
	    detected = true;
	    state.position++;
	
	    if (skipSeparationSpace(state, true, -1)) {
	      if (state.lineIndent <= nodeIndent) {
	        _result.push(null);
	        ch = state.input.charCodeAt(state.position);
	        continue;
	      }
	    }
	
	    _line = state.line;
	    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
	    _result.push(state.result);
	    skipSeparationSpace(state, true, -1);
	
	    ch = state.input.charCodeAt(state.position);
	
	    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
	      throwError(state, 'bad indentation of a sequence entry');
	    } else if (state.lineIndent < nodeIndent) {
	      break;
	    }
	  }
	
	  if (detected) {
	    state.tag = _tag;
	    state.anchor = _anchor;
	    state.kind = 'sequence';
	    state.result = _result;
	    return true;
	  }
	  return false;
	}
	
	function readBlockMapping(state, nodeIndent, flowIndent) {
	  var following,
	      allowCompact,
	      _line,
	      _tag          = state.tag,
	      _anchor       = state.anchor,
	      _result       = {},
	      overridableKeys = {},
	      keyTag        = null,
	      keyNode       = null,
	      valueNode     = null,
	      atExplicitKey = false,
	      detected      = false,
	      ch;
	
	  if (state.anchor !== null) {
	    state.anchorMap[state.anchor] = _result;
	  }
	
	  ch = state.input.charCodeAt(state.position);
	
	  while (ch !== 0) {
	    following = state.input.charCodeAt(state.position + 1);
	    _line = state.line; // Save the current line.
	
	    //
	    // Explicit notation case. There are two separate blocks:
	    // first for the key (denoted by "?") and second for the value (denoted by ":")
	    //
	    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {
	
	      if (ch === 0x3F/* ? */) {
	        if (atExplicitKey) {
	          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
	          keyTag = keyNode = valueNode = null;
	        }
	
	        detected = true;
	        atExplicitKey = true;
	        allowCompact = true;
	
	      } else if (atExplicitKey) {
	        // i.e. 0x3A/* : */ === character after the explicit key.
	        atExplicitKey = false;
	        allowCompact = true;
	
	      } else {
	        throwError(state, 'incomplete explicit mapping pair; a key node is missed');
	      }
	
	      state.position += 1;
	      ch = following;
	
	    //
	    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
	    //
	    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
	
	      if (state.line === _line) {
	        ch = state.input.charCodeAt(state.position);
	
	        while (is_WHITE_SPACE(ch)) {
	          ch = state.input.charCodeAt(++state.position);
	        }
	
	        if (ch === 0x3A/* : */) {
	          ch = state.input.charCodeAt(++state.position);
	
	          if (!is_WS_OR_EOL(ch)) {
	            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
	          }
	
	          if (atExplicitKey) {
	            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
	            keyTag = keyNode = valueNode = null;
	          }
	
	          detected = true;
	          atExplicitKey = false;
	          allowCompact = false;
	          keyTag = state.tag;
	          keyNode = state.result;
	
	        } else if (detected) {
	          throwError(state, 'can not read an implicit mapping pair; a colon is missed');
	
	        } else {
	          state.tag = _tag;
	          state.anchor = _anchor;
	          return true; // Keep the result of `composeNode`.
	        }
	
	      } else if (detected) {
	        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
	
	      } else {
	        state.tag = _tag;
	        state.anchor = _anchor;
	        return true; // Keep the result of `composeNode`.
	      }
	
	    } else {
	      break; // Reading is done. Go to the epilogue.
	    }
	
	    //
	    // Common reading code for both explicit and implicit notations.
	    //
	    if (state.line === _line || state.lineIndent > nodeIndent) {
	      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
	        if (atExplicitKey) {
	          keyNode = state.result;
	        } else {
	          valueNode = state.result;
	        }
	      }
	
	      if (!atExplicitKey) {
	        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
	        keyTag = keyNode = valueNode = null;
	      }
	
	      skipSeparationSpace(state, true, -1);
	      ch = state.input.charCodeAt(state.position);
	    }
	
	    if (state.lineIndent > nodeIndent && (ch !== 0)) {
	      throwError(state, 'bad indentation of a mapping entry');
	    } else if (state.lineIndent < nodeIndent) {
	      break;
	    }
	  }
	
	  //
	  // Epilogue.
	  //
	
	  // Special case: last mapping's node contains only the key in explicit notation.
	  if (atExplicitKey) {
	    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
	  }
	
	  // Expose the resulting mapping.
	  if (detected) {
	    state.tag = _tag;
	    state.anchor = _anchor;
	    state.kind = 'mapping';
	    state.result = _result;
	  }
	
	  return detected;
	}
	
	function readTagProperty(state) {
	  var _position,
	      isVerbatim = false,
	      isNamed    = false,
	      tagHandle,
	      tagName,
	      ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch !== 0x21/* ! */) return false;
	
	  if (state.tag !== null) {
	    throwError(state, 'duplication of a tag property');
	  }
	
	  ch = state.input.charCodeAt(++state.position);
	
	  if (ch === 0x3C/* < */) {
	    isVerbatim = true;
	    ch = state.input.charCodeAt(++state.position);
	
	  } else if (ch === 0x21/* ! */) {
	    isNamed = true;
	    tagHandle = '!!';
	    ch = state.input.charCodeAt(++state.position);
	
	  } else {
	    tagHandle = '!';
	  }
	
	  _position = state.position;
	
	  if (isVerbatim) {
	    do { ch = state.input.charCodeAt(++state.position); }
	    while (ch !== 0 && ch !== 0x3E/* > */);
	
	    if (state.position < state.length) {
	      tagName = state.input.slice(_position, state.position);
	      ch = state.input.charCodeAt(++state.position);
	    } else {
	      throwError(state, 'unexpected end of the stream within a verbatim tag');
	    }
	  } else {
	    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
	
	      if (ch === 0x21/* ! */) {
	        if (!isNamed) {
	          tagHandle = state.input.slice(_position - 1, state.position + 1);
	
	          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
	            throwError(state, 'named tag handle cannot contain such characters');
	          }
	
	          isNamed = true;
	          _position = state.position + 1;
	        } else {
	          throwError(state, 'tag suffix cannot contain exclamation marks');
	        }
	      }
	
	      ch = state.input.charCodeAt(++state.position);
	    }
	
	    tagName = state.input.slice(_position, state.position);
	
	    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
	      throwError(state, 'tag suffix cannot contain flow indicator characters');
	    }
	  }
	
	  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
	    throwError(state, 'tag name cannot contain such characters: ' + tagName);
	  }
	
	  if (isVerbatim) {
	    state.tag = tagName;
	
	  } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
	    state.tag = state.tagMap[tagHandle] + tagName;
	
	  } else if (tagHandle === '!') {
	    state.tag = '!' + tagName;
	
	  } else if (tagHandle === '!!') {
	    state.tag = 'tag:yaml.org,2002:' + tagName;
	
	  } else {
	    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
	  }
	
	  return true;
	}
	
	function readAnchorProperty(state) {
	  var _position,
	      ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch !== 0x26/* & */) return false;
	
	  if (state.anchor !== null) {
	    throwError(state, 'duplication of an anchor property');
	  }
	
	  ch = state.input.charCodeAt(++state.position);
	  _position = state.position;
	
	  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	    ch = state.input.charCodeAt(++state.position);
	  }
	
	  if (state.position === _position) {
	    throwError(state, 'name of an anchor node must contain at least one character');
	  }
	
	  state.anchor = state.input.slice(_position, state.position);
	  return true;
	}
	
	function readAlias(state) {
	  var _position, alias,
	      ch;
	
	  ch = state.input.charCodeAt(state.position);
	
	  if (ch !== 0x2A/* * */) return false;
	
	  ch = state.input.charCodeAt(++state.position);
	  _position = state.position;
	
	  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	    ch = state.input.charCodeAt(++state.position);
	  }
	
	  if (state.position === _position) {
	    throwError(state, 'name of an alias node must contain at least one character');
	  }
	
	  alias = state.input.slice(_position, state.position);
	
	  if (!state.anchorMap.hasOwnProperty(alias)) {
	    throwError(state, 'unidentified alias "' + alias + '"');
	  }
	
	  state.result = state.anchorMap[alias];
	  skipSeparationSpace(state, true, -1);
	  return true;
	}
	
	function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
	  var allowBlockStyles,
	      allowBlockScalars,
	      allowBlockCollections,
	      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
	      atNewLine  = false,
	      hasContent = false,
	      typeIndex,
	      typeQuantity,
	      type,
	      flowIndent,
	      blockIndent;
	
	  if (state.listener !== null) {
	    state.listener('open', state);
	  }
	
	  state.tag    = null;
	  state.anchor = null;
	  state.kind   = null;
	  state.result = null;
	
	  allowBlockStyles = allowBlockScalars = allowBlockCollections =
	    CONTEXT_BLOCK_OUT === nodeContext ||
	    CONTEXT_BLOCK_IN  === nodeContext;
	
	  if (allowToSeek) {
	    if (skipSeparationSpace(state, true, -1)) {
	      atNewLine = true;
	
	      if (state.lineIndent > parentIndent) {
	        indentStatus = 1;
	      } else if (state.lineIndent === parentIndent) {
	        indentStatus = 0;
	      } else if (state.lineIndent < parentIndent) {
	        indentStatus = -1;
	      }
	    }
	  }
	
	  if (indentStatus === 1) {
	    while (readTagProperty(state) || readAnchorProperty(state)) {
	      if (skipSeparationSpace(state, true, -1)) {
	        atNewLine = true;
	        allowBlockCollections = allowBlockStyles;
	
	        if (state.lineIndent > parentIndent) {
	          indentStatus = 1;
	        } else if (state.lineIndent === parentIndent) {
	          indentStatus = 0;
	        } else if (state.lineIndent < parentIndent) {
	          indentStatus = -1;
	        }
	      } else {
	        allowBlockCollections = false;
	      }
	    }
	  }
	
	  if (allowBlockCollections) {
	    allowBlockCollections = atNewLine || allowCompact;
	  }
	
	  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
	    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
	      flowIndent = parentIndent;
	    } else {
	      flowIndent = parentIndent + 1;
	    }
	
	    blockIndent = state.position - state.lineStart;
	
	    if (indentStatus === 1) {
	      if (allowBlockCollections &&
	          (readBlockSequence(state, blockIndent) ||
	           readBlockMapping(state, blockIndent, flowIndent)) ||
	          readFlowCollection(state, flowIndent)) {
	        hasContent = true;
	      } else {
	        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
	            readSingleQuotedScalar(state, flowIndent) ||
	            readDoubleQuotedScalar(state, flowIndent)) {
	          hasContent = true;
	
	        } else if (readAlias(state)) {
	          hasContent = true;
	
	          if (state.tag !== null || state.anchor !== null) {
	            throwError(state, 'alias node should not have any properties');
	          }
	
	        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
	          hasContent = true;
	
	          if (state.tag === null) {
	            state.tag = '?';
	          }
	        }
	
	        if (state.anchor !== null) {
	          state.anchorMap[state.anchor] = state.result;
	        }
	      }
	    } else if (indentStatus === 0) {
	      // Special case: block sequences are allowed to have same indentation level as the parent.
	      // http://www.yaml.org/spec/1.2/spec.html#id2799784
	      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
	    }
	  }
	
	  if (state.tag !== null && state.tag !== '!') {
	    if (state.tag === '?') {
	      for (typeIndex = 0, typeQuantity = state.implicitTypes.length;
	           typeIndex < typeQuantity;
	           typeIndex += 1) {
	        type = state.implicitTypes[typeIndex];
	
	        // Implicit resolving is not allowed for non-scalar types, and '?'
	        // non-specific tag is only assigned to plain scalars. So, it isn't
	        // needed to check for 'kind' conformity.
	
	        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
	          state.result = type.construct(state.result);
	          state.tag = type.tag;
	          if (state.anchor !== null) {
	            state.anchorMap[state.anchor] = state.result;
	          }
	          break;
	        }
	      }
	    } else if (_hasOwnProperty.call(state.typeMap, state.tag)) {
	      type = state.typeMap[state.tag];
	
	      if (state.result !== null && type.kind !== state.kind) {
	        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
	      }
	
	      if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
	        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
	      } else {
	        state.result = type.construct(state.result);
	        if (state.anchor !== null) {
	          state.anchorMap[state.anchor] = state.result;
	        }
	      }
	    } else {
	      throwError(state, 'unknown tag !<' + state.tag + '>');
	    }
	  }
	
	  if (state.listener !== null) {
	    state.listener('close', state);
	  }
	  return state.tag !== null ||  state.anchor !== null || hasContent;
	}
	
	function readDocument(state) {
	  var documentStart = state.position,
	      _position,
	      directiveName,
	      directiveArgs,
	      hasDirectives = false,
	      ch;
	
	  state.version = null;
	  state.checkLineBreaks = state.legacy;
	  state.tagMap = {};
	  state.anchorMap = {};
	
	  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	    skipSeparationSpace(state, true, -1);
	
	    ch = state.input.charCodeAt(state.position);
	
	    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
	      break;
	    }
	
	    hasDirectives = true;
	    ch = state.input.charCodeAt(++state.position);
	    _position = state.position;
	
	    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
	      ch = state.input.charCodeAt(++state.position);
	    }
	
	    directiveName = state.input.slice(_position, state.position);
	    directiveArgs = [];
	
	    if (directiveName.length < 1) {
	      throwError(state, 'directive name must not be less than one character in length');
	    }
	
	    while (ch !== 0) {
	      while (is_WHITE_SPACE(ch)) {
	        ch = state.input.charCodeAt(++state.position);
	      }
	
	      if (ch === 0x23/* # */) {
	        do { ch = state.input.charCodeAt(++state.position); }
	        while (ch !== 0 && !is_EOL(ch));
	        break;
	      }
	
	      if (is_EOL(ch)) break;
	
	      _position = state.position;
	
	      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
	        ch = state.input.charCodeAt(++state.position);
	      }
	
	      directiveArgs.push(state.input.slice(_position, state.position));
	    }
	
	    if (ch !== 0) readLineBreak(state);
	
	    if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
	      directiveHandlers[directiveName](state, directiveName, directiveArgs);
	    } else {
	      throwWarning(state, 'unknown document directive "' + directiveName + '"');
	    }
	  }
	
	  skipSeparationSpace(state, true, -1);
	
	  if (state.lineIndent === 0 &&
	      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
	      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
	      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
	    state.position += 3;
	    skipSeparationSpace(state, true, -1);
	
	  } else if (hasDirectives) {
	    throwError(state, 'directives end mark is expected');
	  }
	
	  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
	  skipSeparationSpace(state, true, -1);
	
	  if (state.checkLineBreaks &&
	      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
	    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
	  }
	
	  state.documents.push(state.result);
	
	  if (state.position === state.lineStart && testDocumentSeparator(state)) {
	
	    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
	      state.position += 3;
	      skipSeparationSpace(state, true, -1);
	    }
	    return;
	  }
	
	  if (state.position < (state.length - 1)) {
	    throwError(state, 'end of the stream or a document separator is expected');
	  } else {
	    return;
	  }
	}
	
	
	function loadDocuments(input, options) {
	  input = String(input);
	  options = options || {};
	
	  if (input.length !== 0) {
	
	    // Add tailing `\n` if not exists
	    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
	        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
	      input += '\n';
	    }
	
	    // Strip BOM
	    if (input.charCodeAt(0) === 0xFEFF) {
	      input = input.slice(1);
	    }
	  }
	
	  var state = new State(input, options);
	
	  // Use 0 as string terminator. That significantly simplifies bounds check.
	  state.input += '\0';
	
	  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
	    state.lineIndent += 1;
	    state.position += 1;
	  }
	
	  while (state.position < (state.length - 1)) {
	    readDocument(state);
	  }
	
	  return state.documents;
	}
	
	
	function loadAll(input, iterator, options) {
	  var documents = loadDocuments(input, options), index, length;
	
	  for (index = 0, length = documents.length; index < length; index += 1) {
	    iterator(documents[index]);
	  }
	}
	
	
	function load(input, options) {
	  var documents = loadDocuments(input, options);
	
	  if (documents.length === 0) {
	    /*eslint-disable no-undefined*/
	    return undefined;
	  } else if (documents.length === 1) {
	    return documents[0];
	  }
	  throw new YAMLException('expected a single document in the stream, but found more');
	}
	
	
	function safeLoadAll(input, output, options) {
	  loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}
	
	
	function safeLoad(input, options) {
	  return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}
	
	
	module.exports.loadAll     = loadAll;
	module.exports.load        = load;
	module.exports.safeLoadAll = safeLoadAll;
	module.exports.safeLoad    = safeLoad;


/***/ },
/* 125 */
/***/ function(module, exports) {

	'use strict';
	
	
	function isNothing(subject) {
	  return (typeof subject === 'undefined') || (subject === null);
	}
	
	
	function isObject(subject) {
	  return (typeof subject === 'object') && (subject !== null);
	}
	
	
	function toArray(sequence) {
	  if (Array.isArray(sequence)) return sequence;
	  else if (isNothing(sequence)) return [];
	
	  return [ sequence ];
	}
	
	
	function extend(target, source) {
	  var index, length, key, sourceKeys;
	
	  if (source) {
	    sourceKeys = Object.keys(source);
	
	    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
	      key = sourceKeys[index];
	      target[key] = source[key];
	    }
	  }
	
	  return target;
	}
	
	
	function repeat(string, count) {
	  var result = '', cycle;
	
	  for (cycle = 0; cycle < count; cycle += 1) {
	    result += string;
	  }
	
	  return result;
	}
	
	
	function isNegativeZero(number) {
	  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
	}
	
	
	module.exports.isNothing      = isNothing;
	module.exports.isObject       = isObject;
	module.exports.toArray        = toArray;
	module.exports.repeat         = repeat;
	module.exports.isNegativeZero = isNegativeZero;
	module.exports.extend         = extend;


/***/ },
/* 126 */
/***/ function(module, exports) {

	// YAML error class. http://stackoverflow.com/questions/8458984
	//
	'use strict';
	
	function YAMLException(reason, mark) {
	  // Super constructor
	  Error.call(this);
	
	  // Include stack trace in error object
	  if (Error.captureStackTrace) {
	    // Chrome and NodeJS
	    Error.captureStackTrace(this, this.constructor);
	  } else {
	    // FF, IE 10+ and Safari 6+. Fallback for others
	    this.stack = (new Error()).stack || '';
	  }
	
	  this.name = 'YAMLException';
	  this.reason = reason;
	  this.mark = mark;
	  this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');
	}
	
	
	// Inherit from Error
	YAMLException.prototype = Object.create(Error.prototype);
	YAMLException.prototype.constructor = YAMLException;
	
	
	YAMLException.prototype.toString = function toString(compact) {
	  var result = this.name + ': ';
	
	  result += this.reason || '(unknown reason)';
	
	  if (!compact && this.mark) {
	    result += ' ' + this.mark.toString();
	  }
	
	  return result;
	};
	
	
	module.exports = YAMLException;


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	
	var common = __webpack_require__(125);
	
	
	function Mark(name, buffer, position, line, column) {
	  this.name     = name;
	  this.buffer   = buffer;
	  this.position = position;
	  this.line     = line;
	  this.column   = column;
	}
	
	
	Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
	  var head, start, tail, end, snippet;
	
	  if (!this.buffer) return null;
	
	  indent = indent || 4;
	  maxLength = maxLength || 75;
	
	  head = '';
	  start = this.position;
	
	  while (start > 0 && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1)) === -1) {
	    start -= 1;
	    if (this.position - start > (maxLength / 2 - 1)) {
	      head = ' ... ';
	      start += 5;
	      break;
	    }
	  }
	
	  tail = '';
	  end = this.position;
	
	  while (end < this.buffer.length && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end)) === -1) {
	    end += 1;
	    if (end - this.position > (maxLength / 2 - 1)) {
	      tail = ' ... ';
	      end -= 5;
	      break;
	    }
	  }
	
	  snippet = this.buffer.slice(start, end);
	
	  return common.repeat(' ', indent) + head + snippet + tail + '\n' +
	         common.repeat(' ', indent + this.position - start + head.length) + '^';
	};
	
	
	Mark.prototype.toString = function toString(compact) {
	  var snippet, where = '';
	
	  if (this.name) {
	    where += 'in "' + this.name + '" ';
	  }
	
	  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);
	
	  if (!compact) {
	    snippet = this.getSnippet();
	
	    if (snippet) {
	      where += ':\n' + snippet;
	    }
	  }
	
	  return where;
	};
	
	
	module.exports = Mark;


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	// JS-YAML's default schema for `safeLoad` function.
	// It is not described in the YAML specification.
	//
	// This schema is based on standard YAML's Core schema and includes most of
	// extra types described at YAML tag repository. (http://yaml.org/type/)
	
	
	'use strict';
	
	
	var Schema = __webpack_require__(129);
	
	
	module.exports = new Schema({
	  include: [
	    __webpack_require__(131)
	  ],
	  implicit: [
	    __webpack_require__(141),
	    __webpack_require__(142)
	  ],
	  explicit: [
	    __webpack_require__(143),
	    __webpack_require__(144),
	    __webpack_require__(145),
	    __webpack_require__(146)
	  ]
	});


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/*eslint-disable max-len*/
	
	var common        = __webpack_require__(125);
	var YAMLException = __webpack_require__(126);
	var Type          = __webpack_require__(130);
	
	
	function compileList(schema, name, result) {
	  var exclude = [];
	
	  schema.include.forEach(function (includedSchema) {
	    result = compileList(includedSchema, name, result);
	  });
	
	  schema[name].forEach(function (currentType) {
	    result.forEach(function (previousType, previousIndex) {
	      if (previousType.tag === currentType.tag) {
	        exclude.push(previousIndex);
	      }
	    });
	
	    result.push(currentType);
	  });
	
	  return result.filter(function (type, index) {
	    return exclude.indexOf(index) === -1;
	  });
	}
	
	
	function compileMap(/* lists... */) {
	  var result = {}, index, length;
	
	  function collectType(type) {
	    result[type.tag] = type;
	  }
	
	  for (index = 0, length = arguments.length; index < length; index += 1) {
	    arguments[index].forEach(collectType);
	  }
	
	  return result;
	}
	
	
	function Schema(definition) {
	  this.include  = definition.include  || [];
	  this.implicit = definition.implicit || [];
	  this.explicit = definition.explicit || [];
	
	  this.implicit.forEach(function (type) {
	    if (type.loadKind && type.loadKind !== 'scalar') {
	      throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
	    }
	  });
	
	  this.compiledImplicit = compileList(this, 'implicit', []);
	  this.compiledExplicit = compileList(this, 'explicit', []);
	  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
	}
	
	
	Schema.DEFAULT = null;
	
	
	Schema.create = function createSchema() {
	  var schemas, types;
	
	  switch (arguments.length) {
	    case 1:
	      schemas = Schema.DEFAULT;
	      types = arguments[0];
	      break;
	
	    case 2:
	      schemas = arguments[0];
	      types = arguments[1];
	      break;
	
	    default:
	      throw new YAMLException('Wrong number of arguments for Schema.create function');
	  }
	
	  schemas = common.toArray(schemas);
	  types = common.toArray(types);
	
	  if (!schemas.every(function (schema) { return schema instanceof Schema; })) {
	    throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
	  }
	
	  if (!types.every(function (type) { return type instanceof Type; })) {
	    throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
	  }
	
	  return new Schema({
	    include: schemas,
	    explicit: types
	  });
	};
	
	
	module.exports = Schema;


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var YAMLException = __webpack_require__(126);
	
	var TYPE_CONSTRUCTOR_OPTIONS = [
	  'kind',
	  'resolve',
	  'construct',
	  'instanceOf',
	  'predicate',
	  'represent',
	  'defaultStyle',
	  'styleAliases'
	];
	
	var YAML_NODE_KINDS = [
	  'scalar',
	  'sequence',
	  'mapping'
	];
	
	function compileStyleAliases(map) {
	  var result = {};
	
	  if (map !== null) {
	    Object.keys(map).forEach(function (style) {
	      map[style].forEach(function (alias) {
	        result[String(alias)] = style;
	      });
	    });
	  }
	
	  return result;
	}
	
	function Type(tag, options) {
	  options = options || {};
	
	  Object.keys(options).forEach(function (name) {
	    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
	      throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
	    }
	  });
	
	  // TODO: Add tag format check.
	  this.tag          = tag;
	  this.kind         = options['kind']         || null;
	  this.resolve      = options['resolve']      || function () { return true; };
	  this.construct    = options['construct']    || function (data) { return data; };
	  this.instanceOf   = options['instanceOf']   || null;
	  this.predicate    = options['predicate']    || null;
	  this.represent    = options['represent']    || null;
	  this.defaultStyle = options['defaultStyle'] || null;
	  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);
	
	  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
	    throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
	  }
	}
	
	module.exports = Type;


/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's Core schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2804923
	//
	// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
	// So, Core schema has no distinctions from JSON schema is JS-YAML.
	
	
	'use strict';
	
	
	var Schema = __webpack_require__(129);
	
	
	module.exports = new Schema({
	  include: [
	    __webpack_require__(132)
	  ]
	});


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's JSON schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2803231
	//
	// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
	// So, this schema is not such strict as defined in the YAML specification.
	// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.
	
	
	'use strict';
	
	
	var Schema = __webpack_require__(129);
	
	
	module.exports = new Schema({
	  include: [
	    __webpack_require__(133)
	  ],
	  implicit: [
	    __webpack_require__(137),
	    __webpack_require__(138),
	    __webpack_require__(139),
	    __webpack_require__(140)
	  ]
	});


/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	// Standard YAML's Failsafe schema.
	// http://www.yaml.org/spec/1.2/spec.html#id2802346
	
	
	'use strict';
	
	
	var Schema = __webpack_require__(129);
	
	
	module.exports = new Schema({
	  explicit: [
	    __webpack_require__(134),
	    __webpack_require__(135),
	    __webpack_require__(136)
	  ]
	});


/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	module.exports = new Type('tag:yaml.org,2002:str', {
	  kind: 'scalar',
	  construct: function (data) { return data !== null ? data : ''; }
	});


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	module.exports = new Type('tag:yaml.org,2002:seq', {
	  kind: 'sequence',
	  construct: function (data) { return data !== null ? data : []; }
	});


/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	module.exports = new Type('tag:yaml.org,2002:map', {
	  kind: 'mapping',
	  construct: function (data) { return data !== null ? data : {}; }
	});


/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	function resolveYamlNull(data) {
	  if (data === null) return true;
	
	  var max = data.length;
	
	  return (max === 1 && data === '~') ||
	         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
	}
	
	function constructYamlNull() {
	  return null;
	}
	
	function isNull(object) {
	  return object === null;
	}
	
	module.exports = new Type('tag:yaml.org,2002:null', {
	  kind: 'scalar',
	  resolve: resolveYamlNull,
	  construct: constructYamlNull,
	  predicate: isNull,
	  represent: {
	    canonical: function () { return '~';    },
	    lowercase: function () { return 'null'; },
	    uppercase: function () { return 'NULL'; },
	    camelcase: function () { return 'Null'; }
	  },
	  defaultStyle: 'lowercase'
	});


/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	function resolveYamlBoolean(data) {
	  if (data === null) return false;
	
	  var max = data.length;
	
	  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
	         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
	}
	
	function constructYamlBoolean(data) {
	  return data === 'true' ||
	         data === 'True' ||
	         data === 'TRUE';
	}
	
	function isBoolean(object) {
	  return Object.prototype.toString.call(object) === '[object Boolean]';
	}
	
	module.exports = new Type('tag:yaml.org,2002:bool', {
	  kind: 'scalar',
	  resolve: resolveYamlBoolean,
	  construct: constructYamlBoolean,
	  predicate: isBoolean,
	  represent: {
	    lowercase: function (object) { return object ? 'true' : 'false'; },
	    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
	    camelcase: function (object) { return object ? 'True' : 'False'; }
	  },
	  defaultStyle: 'lowercase'
	});


/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var common = __webpack_require__(125);
	var Type   = __webpack_require__(130);
	
	function isHexCode(c) {
	  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
	         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
	         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
	}
	
	function isOctCode(c) {
	  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
	}
	
	function isDecCode(c) {
	  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
	}
	
	function resolveYamlInteger(data) {
	  if (data === null) return false;
	
	  var max = data.length,
	      index = 0,
	      hasDigits = false,
	      ch;
	
	  if (!max) return false;
	
	  ch = data[index];
	
	  // sign
	  if (ch === '-' || ch === '+') {
	    ch = data[++index];
	  }
	
	  if (ch === '0') {
	    // 0
	    if (index + 1 === max) return true;
	    ch = data[++index];
	
	    // base 2, base 8, base 16
	
	    if (ch === 'b') {
	      // base 2
	      index++;
	
	      for (; index < max; index++) {
	        ch = data[index];
	        if (ch === '_') continue;
	        if (ch !== '0' && ch !== '1') return false;
	        hasDigits = true;
	      }
	      return hasDigits;
	    }
	
	
	    if (ch === 'x') {
	      // base 16
	      index++;
	
	      for (; index < max; index++) {
	        ch = data[index];
	        if (ch === '_') continue;
	        if (!isHexCode(data.charCodeAt(index))) return false;
	        hasDigits = true;
	      }
	      return hasDigits;
	    }
	
	    // base 8
	    for (; index < max; index++) {
	      ch = data[index];
	      if (ch === '_') continue;
	      if (!isOctCode(data.charCodeAt(index))) return false;
	      hasDigits = true;
	    }
	    return hasDigits;
	  }
	
	  // base 10 (except 0) or base 60
	
	  for (; index < max; index++) {
	    ch = data[index];
	    if (ch === '_') continue;
	    if (ch === ':') break;
	    if (!isDecCode(data.charCodeAt(index))) {
	      return false;
	    }
	    hasDigits = true;
	  }
	
	  if (!hasDigits) return false;
	
	  // if !base60 - done;
	  if (ch !== ':') return true;
	
	  // base60 almost not used, no needs to optimize
	  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
	}
	
	function constructYamlInteger(data) {
	  var value = data, sign = 1, ch, base, digits = [];
	
	  if (value.indexOf('_') !== -1) {
	    value = value.replace(/_/g, '');
	  }
	
	  ch = value[0];
	
	  if (ch === '-' || ch === '+') {
	    if (ch === '-') sign = -1;
	    value = value.slice(1);
	    ch = value[0];
	  }
	
	  if (value === '0') return 0;
	
	  if (ch === '0') {
	    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
	    if (value[1] === 'x') return sign * parseInt(value, 16);
	    return sign * parseInt(value, 8);
	  }
	
	  if (value.indexOf(':') !== -1) {
	    value.split(':').forEach(function (v) {
	      digits.unshift(parseInt(v, 10));
	    });
	
	    value = 0;
	    base = 1;
	
	    digits.forEach(function (d) {
	      value += (d * base);
	      base *= 60;
	    });
	
	    return sign * value;
	
	  }
	
	  return sign * parseInt(value, 10);
	}
	
	function isInteger(object) {
	  return (Object.prototype.toString.call(object)) === '[object Number]' &&
	         (object % 1 === 0 && !common.isNegativeZero(object));
	}
	
	module.exports = new Type('tag:yaml.org,2002:int', {
	  kind: 'scalar',
	  resolve: resolveYamlInteger,
	  construct: constructYamlInteger,
	  predicate: isInteger,
	  represent: {
	    binary:      function (object) { return '0b' + object.toString(2); },
	    octal:       function (object) { return '0'  + object.toString(8); },
	    decimal:     function (object) { return        object.toString(10); },
	    hexadecimal: function (object) { return '0x' + object.toString(16).toUpperCase(); }
	  },
	  defaultStyle: 'decimal',
	  styleAliases: {
	    binary:      [ 2,  'bin' ],
	    octal:       [ 8,  'oct' ],
	    decimal:     [ 10, 'dec' ],
	    hexadecimal: [ 16, 'hex' ]
	  }
	});


/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var common = __webpack_require__(125);
	var Type   = __webpack_require__(130);
	
	var YAML_FLOAT_PATTERN = new RegExp(
	  '^(?:[-+]?(?:[0-9][0-9_]*)\\.[0-9_]*(?:[eE][-+][0-9]+)?' +
	  '|\\.[0-9_]+(?:[eE][-+][0-9]+)?' +
	  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
	  '|[-+]?\\.(?:inf|Inf|INF)' +
	  '|\\.(?:nan|NaN|NAN))$');
	
	function resolveYamlFloat(data) {
	  if (data === null) return false;
	
	  if (!YAML_FLOAT_PATTERN.test(data)) return false;
	
	  return true;
	}
	
	function constructYamlFloat(data) {
	  var value, sign, base, digits;
	
	  value  = data.replace(/_/g, '').toLowerCase();
	  sign   = value[0] === '-' ? -1 : 1;
	  digits = [];
	
	  if ('+-'.indexOf(value[0]) >= 0) {
	    value = value.slice(1);
	  }
	
	  if (value === '.inf') {
	    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
	
	  } else if (value === '.nan') {
	    return NaN;
	
	  } else if (value.indexOf(':') >= 0) {
	    value.split(':').forEach(function (v) {
	      digits.unshift(parseFloat(v, 10));
	    });
	
	    value = 0.0;
	    base = 1;
	
	    digits.forEach(function (d) {
	      value += d * base;
	      base *= 60;
	    });
	
	    return sign * value;
	
	  }
	  return sign * parseFloat(value, 10);
	}
	
	
	var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
	
	function representYamlFloat(object, style) {
	  var res;
	
	  if (isNaN(object)) {
	    switch (style) {
	      case 'lowercase': return '.nan';
	      case 'uppercase': return '.NAN';
	      case 'camelcase': return '.NaN';
	    }
	  } else if (Number.POSITIVE_INFINITY === object) {
	    switch (style) {
	      case 'lowercase': return '.inf';
	      case 'uppercase': return '.INF';
	      case 'camelcase': return '.Inf';
	    }
	  } else if (Number.NEGATIVE_INFINITY === object) {
	    switch (style) {
	      case 'lowercase': return '-.inf';
	      case 'uppercase': return '-.INF';
	      case 'camelcase': return '-.Inf';
	    }
	  } else if (common.isNegativeZero(object)) {
	    return '-0.0';
	  }
	
	  res = object.toString(10);
	
	  // JS stringifier can build scientific format without dots: 5e-100,
	  // while YAML requres dot: 5.e-100. Fix it with simple hack
	
	  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
	}
	
	function isFloat(object) {
	  return (Object.prototype.toString.call(object) === '[object Number]') &&
	         (object % 1 !== 0 || common.isNegativeZero(object));
	}
	
	module.exports = new Type('tag:yaml.org,2002:float', {
	  kind: 'scalar',
	  resolve: resolveYamlFloat,
	  construct: constructYamlFloat,
	  predicate: isFloat,
	  represent: representYamlFloat,
	  defaultStyle: 'lowercase'
	});


/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	var YAML_DATE_REGEXP = new RegExp(
	  '^([0-9][0-9][0-9][0-9])'          + // [1] year
	  '-([0-9][0-9])'                    + // [2] month
	  '-([0-9][0-9])$');                   // [3] day
	
	var YAML_TIMESTAMP_REGEXP = new RegExp(
	  '^([0-9][0-9][0-9][0-9])'          + // [1] year
	  '-([0-9][0-9]?)'                   + // [2] month
	  '-([0-9][0-9]?)'                   + // [3] day
	  '(?:[Tt]|[ \\t]+)'                 + // ...
	  '([0-9][0-9]?)'                    + // [4] hour
	  ':([0-9][0-9])'                    + // [5] minute
	  ':([0-9][0-9])'                    + // [6] second
	  '(?:\\.([0-9]*))?'                 + // [7] fraction
	  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
	  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute
	
	function resolveYamlTimestamp(data) {
	  if (data === null) return false;
	  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
	  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
	  return false;
	}
	
	function constructYamlTimestamp(data) {
	  var match, year, month, day, hour, minute, second, fraction = 0,
	      delta = null, tz_hour, tz_minute, date;
	
	  match = YAML_DATE_REGEXP.exec(data);
	  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
	
	  if (match === null) throw new Error('Date resolve error');
	
	  // match: [1] year [2] month [3] day
	
	  year = +(match[1]);
	  month = +(match[2]) - 1; // JS month starts with 0
	  day = +(match[3]);
	
	  if (!match[4]) { // no hour
	    return new Date(Date.UTC(year, month, day));
	  }
	
	  // match: [4] hour [5] minute [6] second [7] fraction
	
	  hour = +(match[4]);
	  minute = +(match[5]);
	  second = +(match[6]);
	
	  if (match[7]) {
	    fraction = match[7].slice(0, 3);
	    while (fraction.length < 3) { // milli-seconds
	      fraction += '0';
	    }
	    fraction = +fraction;
	  }
	
	  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute
	
	  if (match[9]) {
	    tz_hour = +(match[10]);
	    tz_minute = +(match[11] || 0);
	    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
	    if (match[9] === '-') delta = -delta;
	  }
	
	  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
	
	  if (delta) date.setTime(date.getTime() - delta);
	
	  return date;
	}
	
	function representYamlTimestamp(object /*, style*/) {
	  return object.toISOString();
	}
	
	module.exports = new Type('tag:yaml.org,2002:timestamp', {
	  kind: 'scalar',
	  resolve: resolveYamlTimestamp,
	  construct: constructYamlTimestamp,
	  instanceOf: Date,
	  represent: representYamlTimestamp
	});


/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	function resolveYamlMerge(data) {
	  return data === '<<' || data === null;
	}
	
	module.exports = new Type('tag:yaml.org,2002:merge', {
	  kind: 'scalar',
	  resolve: resolveYamlMerge
	});


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	var require;'use strict';
	
	/*eslint-disable no-bitwise*/
	
	var NodeBuffer;
	
	try {
	  // A trick for browserified version, to not include `Buffer` shim
	  var _require = require;
	  NodeBuffer = __webpack_require__(34).Buffer;
	} catch (__) {}
	
	var Type       = __webpack_require__(130);
	
	
	// [ 64, 65, 66 ] -> [ padding, CR, LF ]
	var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';
	
	
	function resolveYamlBinary(data) {
	  if (data === null) return false;
	
	  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;
	
	  // Convert one by one.
	  for (idx = 0; idx < max; idx++) {
	    code = map.indexOf(data.charAt(idx));
	
	    // Skip CR/LF
	    if (code > 64) continue;
	
	    // Fail on illegal characters
	    if (code < 0) return false;
	
	    bitlen += 6;
	  }
	
	  // If there are any bits left, source was corrupted
	  return (bitlen % 8) === 0;
	}
	
	function constructYamlBinary(data) {
	  var idx, tailbits,
	      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
	      max = input.length,
	      map = BASE64_MAP,
	      bits = 0,
	      result = [];
	
	  // Collect by 6*4 bits (3 bytes)
	
	  for (idx = 0; idx < max; idx++) {
	    if ((idx % 4 === 0) && idx) {
	      result.push((bits >> 16) & 0xFF);
	      result.push((bits >> 8) & 0xFF);
	      result.push(bits & 0xFF);
	    }
	
	    bits = (bits << 6) | map.indexOf(input.charAt(idx));
	  }
	
	  // Dump tail
	
	  tailbits = (max % 4) * 6;
	
	  if (tailbits === 0) {
	    result.push((bits >> 16) & 0xFF);
	    result.push((bits >> 8) & 0xFF);
	    result.push(bits & 0xFF);
	  } else if (tailbits === 18) {
	    result.push((bits >> 10) & 0xFF);
	    result.push((bits >> 2) & 0xFF);
	  } else if (tailbits === 12) {
	    result.push((bits >> 4) & 0xFF);
	  }
	
	  // Wrap into Buffer for NodeJS and leave Array for browser
	  if (NodeBuffer) return new NodeBuffer(result);
	
	  return result;
	}
	
	function representYamlBinary(object /*, style*/) {
	  var result = '', bits = 0, idx, tail,
	      max = object.length,
	      map = BASE64_MAP;
	
	  // Convert every three bytes to 4 ASCII characters.
	
	  for (idx = 0; idx < max; idx++) {
	    if ((idx % 3 === 0) && idx) {
	      result += map[(bits >> 18) & 0x3F];
	      result += map[(bits >> 12) & 0x3F];
	      result += map[(bits >> 6) & 0x3F];
	      result += map[bits & 0x3F];
	    }
	
	    bits = (bits << 8) + object[idx];
	  }
	
	  // Dump tail
	
	  tail = max % 3;
	
	  if (tail === 0) {
	    result += map[(bits >> 18) & 0x3F];
	    result += map[(bits >> 12) & 0x3F];
	    result += map[(bits >> 6) & 0x3F];
	    result += map[bits & 0x3F];
	  } else if (tail === 2) {
	    result += map[(bits >> 10) & 0x3F];
	    result += map[(bits >> 4) & 0x3F];
	    result += map[(bits << 2) & 0x3F];
	    result += map[64];
	  } else if (tail === 1) {
	    result += map[(bits >> 2) & 0x3F];
	    result += map[(bits << 4) & 0x3F];
	    result += map[64];
	    result += map[64];
	  }
	
	  return result;
	}
	
	function isBinary(object) {
	  return NodeBuffer && NodeBuffer.isBuffer(object);
	}
	
	module.exports = new Type('tag:yaml.org,2002:binary', {
	  kind: 'scalar',
	  resolve: resolveYamlBinary,
	  construct: constructYamlBinary,
	  predicate: isBinary,
	  represent: representYamlBinary
	});


/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	var _toString       = Object.prototype.toString;
	
	function resolveYamlOmap(data) {
	  if (data === null) return true;
	
	  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
	      object = data;
	
	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];
	    pairHasKey = false;
	
	    if (_toString.call(pair) !== '[object Object]') return false;
	
	    for (pairKey in pair) {
	      if (_hasOwnProperty.call(pair, pairKey)) {
	        if (!pairHasKey) pairHasKey = true;
	        else return false;
	      }
	    }
	
	    if (!pairHasKey) return false;
	
	    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
	    else return false;
	  }
	
	  return true;
	}
	
	function constructYamlOmap(data) {
	  return data !== null ? data : [];
	}
	
	module.exports = new Type('tag:yaml.org,2002:omap', {
	  kind: 'sequence',
	  resolve: resolveYamlOmap,
	  construct: constructYamlOmap
	});


/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	var _toString = Object.prototype.toString;
	
	function resolveYamlPairs(data) {
	  if (data === null) return true;
	
	  var index, length, pair, keys, result,
	      object = data;
	
	  result = new Array(object.length);
	
	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];
	
	    if (_toString.call(pair) !== '[object Object]') return false;
	
	    keys = Object.keys(pair);
	
	    if (keys.length !== 1) return false;
	
	    result[index] = [ keys[0], pair[keys[0]] ];
	  }
	
	  return true;
	}
	
	function constructYamlPairs(data) {
	  if (data === null) return [];
	
	  var index, length, pair, keys, result,
	      object = data;
	
	  result = new Array(object.length);
	
	  for (index = 0, length = object.length; index < length; index += 1) {
	    pair = object[index];
	
	    keys = Object.keys(pair);
	
	    result[index] = [ keys[0], pair[keys[0]] ];
	  }
	
	  return result;
	}
	
	module.exports = new Type('tag:yaml.org,2002:pairs', {
	  kind: 'sequence',
	  resolve: resolveYamlPairs,
	  construct: constructYamlPairs
	});


/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	
	function resolveYamlSet(data) {
	  if (data === null) return true;
	
	  var key, object = data;
	
	  for (key in object) {
	    if (_hasOwnProperty.call(object, key)) {
	      if (object[key] !== null) return false;
	    }
	  }
	
	  return true;
	}
	
	function constructYamlSet(data) {
	  return data !== null ? data : {};
	}
	
	module.exports = new Type('tag:yaml.org,2002:set', {
	  kind: 'mapping',
	  resolve: resolveYamlSet,
	  construct: constructYamlSet
	});


/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	// JS-YAML's default schema for `load` function.
	// It is not described in the YAML specification.
	//
	// This schema is based on JS-YAML's default safe schema and includes
	// JavaScript-specific types: !!js/undefined, !!js/regexp and !!js/function.
	//
	// Also this schema is used as default base schema at `Schema.create` function.
	
	
	'use strict';
	
	
	var Schema = __webpack_require__(129);
	
	
	module.exports = Schema.DEFAULT = new Schema({
	  include: [
	    __webpack_require__(128)
	  ],
	  explicit: [
	    __webpack_require__(148),
	    __webpack_require__(149),
	    __webpack_require__(150)
	  ]
	});


/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	function resolveJavascriptUndefined() {
	  return true;
	}
	
	function constructJavascriptUndefined() {
	  /*eslint-disable no-undefined*/
	  return undefined;
	}
	
	function representJavascriptUndefined() {
	  return '';
	}
	
	function isUndefined(object) {
	  return typeof object === 'undefined';
	}
	
	module.exports = new Type('tag:yaml.org,2002:js/undefined', {
	  kind: 'scalar',
	  resolve: resolveJavascriptUndefined,
	  construct: constructJavascriptUndefined,
	  predicate: isUndefined,
	  represent: representJavascriptUndefined
	});


/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Type = __webpack_require__(130);
	
	function resolveJavascriptRegExp(data) {
	  if (data === null) return false;
	  if (data.length === 0) return false;
	
	  var regexp = data,
	      tail   = /\/([gim]*)$/.exec(data),
	      modifiers = '';
	
	  // if regexp starts with '/' it can have modifiers and must be properly closed
	  // `/foo/gim` - modifiers tail can be maximum 3 chars
	  if (regexp[0] === '/') {
	    if (tail) modifiers = tail[1];
	
	    if (modifiers.length > 3) return false;
	    // if expression starts with /, is should be properly terminated
	    if (regexp[regexp.length - modifiers.length - 1] !== '/') return false;
	  }
	
	  return true;
	}
	
	function constructJavascriptRegExp(data) {
	  var regexp = data,
	      tail   = /\/([gim]*)$/.exec(data),
	      modifiers = '';
	
	  // `/foo/gim` - tail can be maximum 4 chars
	  if (regexp[0] === '/') {
	    if (tail) modifiers = tail[1];
	    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
	  }
	
	  return new RegExp(regexp, modifiers);
	}
	
	function representJavascriptRegExp(object /*, style*/) {
	  var result = '/' + object.source + '/';
	
	  if (object.global) result += 'g';
	  if (object.multiline) result += 'm';
	  if (object.ignoreCase) result += 'i';
	
	  return result;
	}
	
	function isRegExp(object) {
	  return Object.prototype.toString.call(object) === '[object RegExp]';
	}
	
	module.exports = new Type('tag:yaml.org,2002:js/regexp', {
	  kind: 'scalar',
	  resolve: resolveJavascriptRegExp,
	  construct: constructJavascriptRegExp,
	  predicate: isRegExp,
	  represent: representJavascriptRegExp
	});


/***/ },
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	var require;'use strict';
	
	var esprima;
	
	// Browserified version does not have esprima
	//
	// 1. For node.js just require module as deps
	// 2. For browser try to require mudule via external AMD system.
	//    If not found - try to fallback to window.esprima. If not
	//    found too - then fail to parse.
	//
	try {
	  // workaround to exclude package from browserify list.
	  var _require = require;
	  esprima = __webpack_require__(151);
	} catch (_) {
	  /*global window */
	  if (typeof window !== 'undefined') esprima = window.esprima;
	}
	
	var Type = __webpack_require__(130);
	
	function resolveJavascriptFunction(data) {
	  if (data === null) return false;
	
	  try {
	    var source = '(' + data + ')',
	        ast    = esprima.parse(source, { range: true });
	
	    if (ast.type                    !== 'Program'             ||
	        ast.body.length             !== 1                     ||
	        ast.body[0].type            !== 'ExpressionStatement' ||
	        ast.body[0].expression.type !== 'FunctionExpression') {
	      return false;
	    }
	
	    return true;
	  } catch (err) {
	    return false;
	  }
	}
	
	function constructJavascriptFunction(data) {
	  /*jslint evil:true*/
	
	  var source = '(' + data + ')',
	      ast    = esprima.parse(source, { range: true }),
	      params = [],
	      body;
	
	  if (ast.type                    !== 'Program'             ||
	      ast.body.length             !== 1                     ||
	      ast.body[0].type            !== 'ExpressionStatement' ||
	      ast.body[0].expression.type !== 'FunctionExpression') {
	    throw new Error('Failed to resolve function');
	  }
	
	  ast.body[0].expression.params.forEach(function (param) {
	    params.push(param.name);
	  });
	
	  body = ast.body[0].expression.body.range;
	
	  // Esprima's ranges include the first '{' and the last '}' characters on
	  // function expressions. So cut them out.
	  /*eslint-disable no-new-func*/
	  return new Function(params, source.slice(body[0] + 1, body[1] - 1));
	}
	
	function representJavascriptFunction(object /*, style*/) {
	  return object.toString();
	}
	
	function isFunction(object) {
	  return Object.prototype.toString.call(object) === '[object Function]';
	}
	
	module.exports = new Type('tag:yaml.org,2002:js/function', {
	  kind: 'scalar',
	  resolve: resolveJavascriptFunction,
	  construct: constructJavascriptFunction,
	  predicate: isFunction,
	  represent: representJavascriptFunction
	});


/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	  Copyright (c) jQuery Foundation, Inc. and Contributors, All Rights Reserved.
	
	  Redistribution and use in source and binary forms, with or without
	  modification, are permitted provided that the following conditions are met:
	
	    * Redistributions of source code must retain the above copyright
	      notice, this list of conditions and the following disclaimer.
	    * Redistributions in binary form must reproduce the above copyright
	      notice, this list of conditions and the following disclaimer in the
	      documentation and/or other materials provided with the distribution.
	
	  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
	  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
	  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/
	
	(function (root, factory) {
	    'use strict';
	
	    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
	    // Rhino, and plain browser loading.
	
	    /* istanbul ignore next */
	    if (true) {
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof exports !== 'undefined') {
	        factory(exports);
	    } else {
	        factory((root.esprima = {}));
	    }
	}(this, function (exports) {
	    'use strict';
	
	    var Token,
	        TokenName,
	        FnExprTokens,
	        Syntax,
	        PlaceHolders,
	        Messages,
	        Regex,
	        source,
	        strict,
	        index,
	        lineNumber,
	        lineStart,
	        hasLineTerminator,
	        lastIndex,
	        lastLineNumber,
	        lastLineStart,
	        startIndex,
	        startLineNumber,
	        startLineStart,
	        scanning,
	        length,
	        lookahead,
	        state,
	        extra,
	        isBindingElement,
	        isAssignmentTarget,
	        firstCoverInitializedNameError;
	
	    Token = {
	        BooleanLiteral: 1,
	        EOF: 2,
	        Identifier: 3,
	        Keyword: 4,
	        NullLiteral: 5,
	        NumericLiteral: 6,
	        Punctuator: 7,
	        StringLiteral: 8,
	        RegularExpression: 9,
	        Template: 10
	    };
	
	    TokenName = {};
	    TokenName[Token.BooleanLiteral] = 'Boolean';
	    TokenName[Token.EOF] = '<end>';
	    TokenName[Token.Identifier] = 'Identifier';
	    TokenName[Token.Keyword] = 'Keyword';
	    TokenName[Token.NullLiteral] = 'Null';
	    TokenName[Token.NumericLiteral] = 'Numeric';
	    TokenName[Token.Punctuator] = 'Punctuator';
	    TokenName[Token.StringLiteral] = 'String';
	    TokenName[Token.RegularExpression] = 'RegularExpression';
	    TokenName[Token.Template] = 'Template';
	
	    // A function following one of those tokens is an expression.
	    FnExprTokens = ['(', '{', '[', 'in', 'typeof', 'instanceof', 'new',
	                    'return', 'case', 'delete', 'throw', 'void',
	                    // assignment operators
	                    '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=',
	                    '&=', '|=', '^=', ',',
	                    // binary/unary operators
	                    '+', '-', '*', '/', '%', '++', '--', '<<', '>>', '>>>', '&',
	                    '|', '^', '!', '~', '&&', '||', '?', ':', '===', '==', '>=',
	                    '<=', '<', '>', '!=', '!=='];
	
	    Syntax = {
	        AssignmentExpression: 'AssignmentExpression',
	        AssignmentPattern: 'AssignmentPattern',
	        ArrayExpression: 'ArrayExpression',
	        ArrayPattern: 'ArrayPattern',
	        ArrowFunctionExpression: 'ArrowFunctionExpression',
	        BlockStatement: 'BlockStatement',
	        BinaryExpression: 'BinaryExpression',
	        BreakStatement: 'BreakStatement',
	        CallExpression: 'CallExpression',
	        CatchClause: 'CatchClause',
	        ClassBody: 'ClassBody',
	        ClassDeclaration: 'ClassDeclaration',
	        ClassExpression: 'ClassExpression',
	        ConditionalExpression: 'ConditionalExpression',
	        ContinueStatement: 'ContinueStatement',
	        DoWhileStatement: 'DoWhileStatement',
	        DebuggerStatement: 'DebuggerStatement',
	        EmptyStatement: 'EmptyStatement',
	        ExportAllDeclaration: 'ExportAllDeclaration',
	        ExportDefaultDeclaration: 'ExportDefaultDeclaration',
	        ExportNamedDeclaration: 'ExportNamedDeclaration',
	        ExportSpecifier: 'ExportSpecifier',
	        ExpressionStatement: 'ExpressionStatement',
	        ForStatement: 'ForStatement',
	        ForOfStatement: 'ForOfStatement',
	        ForInStatement: 'ForInStatement',
	        FunctionDeclaration: 'FunctionDeclaration',
	        FunctionExpression: 'FunctionExpression',
	        Identifier: 'Identifier',
	        IfStatement: 'IfStatement',
	        ImportDeclaration: 'ImportDeclaration',
	        ImportDefaultSpecifier: 'ImportDefaultSpecifier',
	        ImportNamespaceSpecifier: 'ImportNamespaceSpecifier',
	        ImportSpecifier: 'ImportSpecifier',
	        Literal: 'Literal',
	        LabeledStatement: 'LabeledStatement',
	        LogicalExpression: 'LogicalExpression',
	        MemberExpression: 'MemberExpression',
	        MetaProperty: 'MetaProperty',
	        MethodDefinition: 'MethodDefinition',
	        NewExpression: 'NewExpression',
	        ObjectExpression: 'ObjectExpression',
	        ObjectPattern: 'ObjectPattern',
	        Program: 'Program',
	        Property: 'Property',
	        RestElement: 'RestElement',
	        ReturnStatement: 'ReturnStatement',
	        SequenceExpression: 'SequenceExpression',
	        SpreadElement: 'SpreadElement',
	        Super: 'Super',
	        SwitchCase: 'SwitchCase',
	        SwitchStatement: 'SwitchStatement',
	        TaggedTemplateExpression: 'TaggedTemplateExpression',
	        TemplateElement: 'TemplateElement',
	        TemplateLiteral: 'TemplateLiteral',
	        ThisExpression: 'ThisExpression',
	        ThrowStatement: 'ThrowStatement',
	        TryStatement: 'TryStatement',
	        UnaryExpression: 'UnaryExpression',
	        UpdateExpression: 'UpdateExpression',
	        VariableDeclaration: 'VariableDeclaration',
	        VariableDeclarator: 'VariableDeclarator',
	        WhileStatement: 'WhileStatement',
	        WithStatement: 'WithStatement',
	        YieldExpression: 'YieldExpression'
	    };
	
	    PlaceHolders = {
	        ArrowParameterPlaceHolder: 'ArrowParameterPlaceHolder'
	    };
	
	    // Error messages should be identical to V8.
	    Messages = {
	        UnexpectedToken: 'Unexpected token %0',
	        UnexpectedNumber: 'Unexpected number',
	        UnexpectedString: 'Unexpected string',
	        UnexpectedIdentifier: 'Unexpected identifier',
	        UnexpectedReserved: 'Unexpected reserved word',
	        UnexpectedTemplate: 'Unexpected quasi %0',
	        UnexpectedEOS: 'Unexpected end of input',
	        NewlineAfterThrow: 'Illegal newline after throw',
	        InvalidRegExp: 'Invalid regular expression',
	        UnterminatedRegExp: 'Invalid regular expression: missing /',
	        InvalidLHSInAssignment: 'Invalid left-hand side in assignment',
	        InvalidLHSInForIn: 'Invalid left-hand side in for-in',
	        InvalidLHSInForLoop: 'Invalid left-hand side in for-loop',
	        MultipleDefaultsInSwitch: 'More than one default clause in switch statement',
	        NoCatchOrFinally: 'Missing catch or finally after try',
	        UnknownLabel: 'Undefined label \'%0\'',
	        Redeclaration: '%0 \'%1\' has already been declared',
	        IllegalContinue: 'Illegal continue statement',
	        IllegalBreak: 'Illegal break statement',
	        IllegalReturn: 'Illegal return statement',
	        StrictModeWith: 'Strict mode code may not include a with statement',
	        StrictCatchVariable: 'Catch variable may not be eval or arguments in strict mode',
	        StrictVarName: 'Variable name may not be eval or arguments in strict mode',
	        StrictParamName: 'Parameter name eval or arguments is not allowed in strict mode',
	        StrictParamDupe: 'Strict mode function may not have duplicate parameter names',
	        StrictFunctionName: 'Function name may not be eval or arguments in strict mode',
	        StrictOctalLiteral: 'Octal literals are not allowed in strict mode.',
	        StrictDelete: 'Delete of an unqualified identifier in strict mode.',
	        StrictLHSAssignment: 'Assignment to eval or arguments is not allowed in strict mode',
	        StrictLHSPostfix: 'Postfix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictLHSPrefix: 'Prefix increment/decrement may not have eval or arguments operand in strict mode',
	        StrictReservedWord: 'Use of future reserved word in strict mode',
	        TemplateOctalLiteral: 'Octal literals are not allowed in template strings.',
	        ParameterAfterRestParameter: 'Rest parameter must be last formal parameter',
	        DefaultRestParameter: 'Unexpected token =',
	        ObjectPatternAsRestParameter: 'Unexpected token {',
	        DuplicateProtoProperty: 'Duplicate __proto__ fields are not allowed in object literals',
	        ConstructorSpecialMethod: 'Class constructor may not be an accessor',
	        DuplicateConstructor: 'A class may only have one constructor',
	        StaticPrototype: 'Classes may not have static property named prototype',
	        MissingFromClause: 'Unexpected token',
	        NoAsAfterImportNamespace: 'Unexpected token',
	        InvalidModuleSpecifier: 'Unexpected token',
	        IllegalImportDeclaration: 'Unexpected token',
	        IllegalExportDeclaration: 'Unexpected token',
	        DuplicateBinding: 'Duplicate binding %0'
	    };
	
	    // See also tools/generate-unicode-regex.js.
	    Regex = {
	        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierStart:
	        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B2\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDE00-\uDE11\uDE13-\uDE2B\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF5D-\uDF61]|\uD805[\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDE00-\uDE2F\uDE44\uDE80-\uDEAA]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]/,
	
	        // ECMAScript 6/Unicode v7.0.0 NonAsciiIdentifierPart:
	        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B2\u08E4-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58\u0C59\u0C60-\u0C63\u0C66-\u0C6F\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D60-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA69D\uA69F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA7AD\uA7B0\uA7B1\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB5F\uAB64\uAB65\uABC0-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2D\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDD0-\uDDDA\uDE00-\uDE11\uDE13-\uDE37\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF01-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF98]|\uD809[\uDC00-\uDC6E]|[\uD80C\uD840-\uD868\uD86A-\uD86C][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
	    };
	
	    // Ensure the condition is true, otherwise throw an error.
	    // This is only to have a better contract semantic, i.e. another safety net
	    // to catch a logic error. The condition shall be fulfilled in normal case.
	    // Do NOT use this to enforce a certain condition on any user input.
	
	    function assert(condition, message) {
	        /* istanbul ignore if */
	        if (!condition) {
	            throw new Error('ASSERT: ' + message);
	        }
	    }
	
	    function isDecimalDigit(ch) {
	        return (ch >= 0x30 && ch <= 0x39);   // 0..9
	    }
	
	    function isHexDigit(ch) {
	        return '0123456789abcdefABCDEF'.indexOf(ch) >= 0;
	    }
	
	    function isOctalDigit(ch) {
	        return '01234567'.indexOf(ch) >= 0;
	    }
	
	    function octalToDecimal(ch) {
	        // \0 is not octal escape sequence
	        var octal = (ch !== '0'), code = '01234567'.indexOf(ch);
	
	        if (index < length && isOctalDigit(source[index])) {
	            octal = true;
	            code = code * 8 + '01234567'.indexOf(source[index++]);
	
	            // 3 digits are only allowed when string starts
	            // with 0, 1, 2, 3
	            if ('0123'.indexOf(ch) >= 0 &&
	                    index < length &&
	                    isOctalDigit(source[index])) {
	                code = code * 8 + '01234567'.indexOf(source[index++]);
	            }
	        }
	
	        return {
	            code: code,
	            octal: octal
	        };
	    }
	
	    // ECMA-262 11.2 White Space
	
	    function isWhiteSpace(ch) {
	        return (ch === 0x20) || (ch === 0x09) || (ch === 0x0B) || (ch === 0x0C) || (ch === 0xA0) ||
	            (ch >= 0x1680 && [0x1680, 0x180E, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000, 0xFEFF].indexOf(ch) >= 0);
	    }
	
	    // ECMA-262 11.3 Line Terminators
	
	    function isLineTerminator(ch) {
	        return (ch === 0x0A) || (ch === 0x0D) || (ch === 0x2028) || (ch === 0x2029);
	    }
	
	    // ECMA-262 11.6 Identifier Names and Identifiers
	
	    function fromCodePoint(cp) {
	        return (cp < 0x10000) ? String.fromCharCode(cp) :
	            String.fromCharCode(0xD800 + ((cp - 0x10000) >> 10)) +
	            String.fromCharCode(0xDC00 + ((cp - 0x10000) & 1023));
	    }
	
	    function isIdentifierStart(ch) {
	        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
	            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
	            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
	            (ch === 0x5C) ||                      // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch)));
	    }
	
	    function isIdentifierPart(ch) {
	        return (ch === 0x24) || (ch === 0x5F) ||  // $ (dollar) and _ (underscore)
	            (ch >= 0x41 && ch <= 0x5A) ||         // A..Z
	            (ch >= 0x61 && ch <= 0x7A) ||         // a..z
	            (ch >= 0x30 && ch <= 0x39) ||         // 0..9
	            (ch === 0x5C) ||                      // \ (backslash)
	            ((ch >= 0x80) && Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch)));
	    }
	
	    // ECMA-262 11.6.2.2 Future Reserved Words
	
	    function isFutureReservedWord(id) {
	        switch (id) {
	        case 'enum':
	        case 'export':
	        case 'import':
	        case 'super':
	            return true;
	        default:
	            return false;
	        }
	    }
	
	    function isStrictModeReservedWord(id) {
	        switch (id) {
	        case 'implements':
	        case 'interface':
	        case 'package':
	        case 'private':
	        case 'protected':
	        case 'public':
	        case 'static':
	        case 'yield':
	        case 'let':
	            return true;
	        default:
	            return false;
	        }
	    }
	
	    function isRestrictedWord(id) {
	        return id === 'eval' || id === 'arguments';
	    }
	
	    // ECMA-262 11.6.2.1 Keywords
	
	    function isKeyword(id) {
	        switch (id.length) {
	        case 2:
	            return (id === 'if') || (id === 'in') || (id === 'do');
	        case 3:
	            return (id === 'var') || (id === 'for') || (id === 'new') ||
	                (id === 'try') || (id === 'let');
	        case 4:
	            return (id === 'this') || (id === 'else') || (id === 'case') ||
	                (id === 'void') || (id === 'with') || (id === 'enum');
	        case 5:
	            return (id === 'while') || (id === 'break') || (id === 'catch') ||
	                (id === 'throw') || (id === 'const') || (id === 'yield') ||
	                (id === 'class') || (id === 'super');
	        case 6:
	            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
	                (id === 'switch') || (id === 'export') || (id === 'import');
	        case 7:
	            return (id === 'default') || (id === 'finally') || (id === 'extends');
	        case 8:
	            return (id === 'function') || (id === 'continue') || (id === 'debugger');
	        case 10:
	            return (id === 'instanceof');
	        default:
	            return false;
	        }
	    }
	
	    // ECMA-262 11.4 Comments
	
	    function addComment(type, value, start, end, loc) {
	        var comment;
	
	        assert(typeof start === 'number', 'Comment must have valid position');
	
	        state.lastCommentStart = start;
	
	        comment = {
	            type: type,
	            value: value
	        };
	        if (extra.range) {
	            comment.range = [start, end];
	        }
	        if (extra.loc) {
	            comment.loc = loc;
	        }
	        extra.comments.push(comment);
	        if (extra.attachComment) {
	            extra.leadingComments.push(comment);
	            extra.trailingComments.push(comment);
	        }
	        if (extra.tokenize) {
	            comment.type = comment.type + 'Comment';
	            if (extra.delegate) {
	                comment = extra.delegate(comment);
	            }
	            extra.tokens.push(comment);
	        }
	    }
	
	    function skipSingleLineComment(offset) {
	        var start, loc, ch, comment;
	
	        start = index - offset;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart - offset
	            }
	        };
	
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            ++index;
	            if (isLineTerminator(ch)) {
	                hasLineTerminator = true;
	                if (extra.comments) {
	                    comment = source.slice(start + offset, index - 1);
	                    loc.end = {
	                        line: lineNumber,
	                        column: index - lineStart - 1
	                    };
	                    addComment('Line', comment, start, index - 1, loc);
	                }
	                if (ch === 13 && source.charCodeAt(index) === 10) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	                return;
	            }
	        }
	
	        if (extra.comments) {
	            comment = source.slice(start + offset, index);
	            loc.end = {
	                line: lineNumber,
	                column: index - lineStart
	            };
	            addComment('Line', comment, start, index, loc);
	        }
	    }
	
	    function skipMultiLineComment() {
	        var start, loc, ch, comment;
	
	        if (extra.comments) {
	            start = index - 2;
	            loc = {
	                start: {
	                    line: lineNumber,
	                    column: index - lineStart - 2
	                }
	            };
	        }
	
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (isLineTerminator(ch)) {
	                if (ch === 0x0D && source.charCodeAt(index + 1) === 0x0A) {
	                    ++index;
	                }
	                hasLineTerminator = true;
	                ++lineNumber;
	                ++index;
	                lineStart = index;
	            } else if (ch === 0x2A) {
	                // Block comment ends with '*/'.
	                if (source.charCodeAt(index + 1) === 0x2F) {
	                    ++index;
	                    ++index;
	                    if (extra.comments) {
	                        comment = source.slice(start + 2, index - 2);
	                        loc.end = {
	                            line: lineNumber,
	                            column: index - lineStart
	                        };
	                        addComment('Block', comment, start, index, loc);
	                    }
	                    return;
	                }
	                ++index;
	            } else {
	                ++index;
	            }
	        }
	
	        // Ran off the end of the file - the whole thing is a comment
	        if (extra.comments) {
	            loc.end = {
	                line: lineNumber,
	                column: index - lineStart
	            };
	            comment = source.slice(start + 2, index);
	            addComment('Block', comment, start, index, loc);
	        }
	        tolerateUnexpectedToken();
	    }
	
	    function skipComment() {
	        var ch, start;
	        hasLineTerminator = false;
	
	        start = (index === 0);
	        while (index < length) {
	            ch = source.charCodeAt(index);
	
	            if (isWhiteSpace(ch)) {
	                ++index;
	            } else if (isLineTerminator(ch)) {
	                hasLineTerminator = true;
	                ++index;
	                if (ch === 0x0D && source.charCodeAt(index) === 0x0A) {
	                    ++index;
	                }
	                ++lineNumber;
	                lineStart = index;
	                start = true;
	            } else if (ch === 0x2F) { // U+002F is '/'
	                ch = source.charCodeAt(index + 1);
	                if (ch === 0x2F) {
	                    ++index;
	                    ++index;
	                    skipSingleLineComment(2);
	                    start = true;
	                } else if (ch === 0x2A) {  // U+002A is '*'
	                    ++index;
	                    ++index;
	                    skipMultiLineComment();
	                } else {
	                    break;
	                }
	            } else if (start && ch === 0x2D) { // U+002D is '-'
	                // U+003E is '>'
	                if ((source.charCodeAt(index + 1) === 0x2D) && (source.charCodeAt(index + 2) === 0x3E)) {
	                    // '-->' is a single-line comment
	                    index += 3;
	                    skipSingleLineComment(3);
	                } else {
	                    break;
	                }
	            } else if (ch === 0x3C) { // U+003C is '<'
	                if (source.slice(index + 1, index + 4) === '!--') {
	                    ++index; // `<`
	                    ++index; // `!`
	                    ++index; // `-`
	                    ++index; // `-`
	                    skipSingleLineComment(4);
	                } else {
	                    break;
	                }
	            } else {
	                break;
	            }
	        }
	    }
	
	    function scanHexEscape(prefix) {
	        var i, len, ch, code = 0;
	
	        len = (prefix === 'u') ? 4 : 2;
	        for (i = 0; i < len; ++i) {
	            if (index < length && isHexDigit(source[index])) {
	                ch = source[index++];
	                code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	            } else {
	                return '';
	            }
	        }
	        return String.fromCharCode(code);
	    }
	
	    function scanUnicodeCodePointEscape() {
	        var ch, code;
	
	        ch = source[index];
	        code = 0;
	
	        // At least, one hex digit is required.
	        if (ch === '}') {
	            throwUnexpectedToken();
	        }
	
	        while (index < length) {
	            ch = source[index++];
	            if (!isHexDigit(ch)) {
	                break;
	            }
	            code = code * 16 + '0123456789abcdef'.indexOf(ch.toLowerCase());
	        }
	
	        if (code > 0x10FFFF || ch !== '}') {
	            throwUnexpectedToken();
	        }
	
	        return fromCodePoint(code);
	    }
	
	    function codePointAt(i) {
	        var cp, first, second;
	
	        cp = source.charCodeAt(i);
	        if (cp >= 0xD800 && cp <= 0xDBFF) {
	            second = source.charCodeAt(i + 1);
	            if (second >= 0xDC00 && second <= 0xDFFF) {
	                first = cp;
	                cp = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
	            }
	        }
	
	        return cp;
	    }
	
	    function getComplexIdentifier() {
	        var cp, ch, id;
	
	        cp = codePointAt(index);
	        id = fromCodePoint(cp);
	        index += id.length;
	
	        // '\u' (U+005C, U+0075) denotes an escaped character.
	        if (cp === 0x5C) {
	            if (source.charCodeAt(index) !== 0x75) {
	                throwUnexpectedToken();
	            }
	            ++index;
	            if (source[index] === '{') {
	                ++index;
	                ch = scanUnicodeCodePointEscape();
	            } else {
	                ch = scanHexEscape('u');
	                cp = ch.charCodeAt(0);
	                if (!ch || ch === '\\' || !isIdentifierStart(cp)) {
	                    throwUnexpectedToken();
	                }
	            }
	            id = ch;
	        }
	
	        while (index < length) {
	            cp = codePointAt(index);
	            if (!isIdentifierPart(cp)) {
	                break;
	            }
	            ch = fromCodePoint(cp);
	            id += ch;
	            index += ch.length;
	
	            // '\u' (U+005C, U+0075) denotes an escaped character.
	            if (cp === 0x5C) {
	                id = id.substr(0, id.length - 1);
	                if (source.charCodeAt(index) !== 0x75) {
	                    throwUnexpectedToken();
	                }
	                ++index;
	                if (source[index] === '{') {
	                    ++index;
	                    ch = scanUnicodeCodePointEscape();
	                } else {
	                    ch = scanHexEscape('u');
	                    cp = ch.charCodeAt(0);
	                    if (!ch || ch === '\\' || !isIdentifierPart(cp)) {
	                        throwUnexpectedToken();
	                    }
	                }
	                id += ch;
	            }
	        }
	
	        return id;
	    }
	
	    function getIdentifier() {
	        var start, ch;
	
	        start = index++;
	        while (index < length) {
	            ch = source.charCodeAt(index);
	            if (ch === 0x5C) {
	                // Blackslash (U+005C) marks Unicode escape sequence.
	                index = start;
	                return getComplexIdentifier();
	            } else if (ch >= 0xD800 && ch < 0xDFFF) {
	                // Need to handle surrogate pairs.
	                index = start;
	                return getComplexIdentifier();
	            }
	            if (isIdentifierPart(ch)) {
	                ++index;
	            } else {
	                break;
	            }
	        }
	
	        return source.slice(start, index);
	    }
	
	    function scanIdentifier() {
	        var start, id, type;
	
	        start = index;
	
	        // Backslash (U+005C) starts an escaped character.
	        id = (source.charCodeAt(index) === 0x5C) ? getComplexIdentifier() : getIdentifier();
	
	        // There is no keyword or literal with only one character.
	        // Thus, it must be an identifier.
	        if (id.length === 1) {
	            type = Token.Identifier;
	        } else if (isKeyword(id)) {
	            type = Token.Keyword;
	        } else if (id === 'null') {
	            type = Token.NullLiteral;
	        } else if (id === 'true' || id === 'false') {
	            type = Token.BooleanLiteral;
	        } else {
	            type = Token.Identifier;
	        }
	
	        return {
	            type: type,
	            value: id,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	
	    // ECMA-262 11.7 Punctuators
	
	    function scanPunctuator() {
	        var token, str;
	
	        token = {
	            type: Token.Punctuator,
	            value: '',
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: index,
	            end: index
	        };
	
	        // Check for most common single-character punctuators.
	        str = source[index];
	        switch (str) {
	
	        case '(':
	            if (extra.tokenize) {
	                extra.openParenToken = extra.tokenValues.length;
	            }
	            ++index;
	            break;
	
	        case '{':
	            if (extra.tokenize) {
	                extra.openCurlyToken = extra.tokenValues.length;
	            }
	            state.curlyStack.push('{');
	            ++index;
	            break;
	
	        case '.':
	            ++index;
	            if (source[index] === '.' && source[index + 1] === '.') {
	                // Spread operator: ...
	                index += 2;
	                str = '...';
	            }
	            break;
	
	        case '}':
	            ++index;
	            state.curlyStack.pop();
	            break;
	        case ')':
	        case ';':
	        case ',':
	        case '[':
	        case ']':
	        case ':':
	        case '?':
	        case '~':
	            ++index;
	            break;
	
	        default:
	            // 4-character punctuator.
	            str = source.substr(index, 4);
	            if (str === '>>>=') {
	                index += 4;
	            } else {
	
	                // 3-character punctuators.
	                str = str.substr(0, 3);
	                if (str === '===' || str === '!==' || str === '>>>' ||
	                    str === '<<=' || str === '>>=') {
	                    index += 3;
	                } else {
	
	                    // 2-character punctuators.
	                    str = str.substr(0, 2);
	                    if (str === '&&' || str === '||' || str === '==' || str === '!=' ||
	                        str === '+=' || str === '-=' || str === '*=' || str === '/=' ||
	                        str === '++' || str === '--' || str === '<<' || str === '>>' ||
	                        str === '&=' || str === '|=' || str === '^=' || str === '%=' ||
	                        str === '<=' || str === '>=' || str === '=>') {
	                        index += 2;
	                    } else {
	
	                        // 1-character punctuators.
	                        str = source[index];
	                        if ('<>=!+-*%&|^/'.indexOf(str) >= 0) {
	                            ++index;
	                        }
	                    }
	                }
	            }
	        }
	
	        if (index === token.start) {
	            throwUnexpectedToken();
	        }
	
	        token.end = index;
	        token.value = str;
	        return token;
	    }
	
	    // ECMA-262 11.8.3 Numeric Literals
	
	    function scanHexLiteral(start) {
	        var number = '';
	
	        while (index < length) {
	            if (!isHexDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }
	
	        if (number.length === 0) {
	            throwUnexpectedToken();
	        }
	
	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseInt('0x' + number, 16),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    function scanBinaryLiteral(start) {
	        var ch, number;
	
	        number = '';
	
	        while (index < length) {
	            ch = source[index];
	            if (ch !== '0' && ch !== '1') {
	                break;
	            }
	            number += source[index++];
	        }
	
	        if (number.length === 0) {
	            // only 0b or 0B
	            throwUnexpectedToken();
	        }
	
	        if (index < length) {
	            ch = source.charCodeAt(index);
	            /* istanbul ignore else */
	            if (isIdentifierStart(ch) || isDecimalDigit(ch)) {
	                throwUnexpectedToken();
	            }
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 2),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    function scanOctalLiteral(prefix, start) {
	        var number, octal;
	
	        if (isOctalDigit(prefix)) {
	            octal = true;
	            number = '0' + source[index++];
	        } else {
	            octal = false;
	            ++index;
	            number = '';
	        }
	
	        while (index < length) {
	            if (!isOctalDigit(source[index])) {
	                break;
	            }
	            number += source[index++];
	        }
	
	        if (!octal && number.length === 0) {
	            // only 0o or 0O
	            throwUnexpectedToken();
	        }
	
	        if (isIdentifierStart(source.charCodeAt(index)) || isDecimalDigit(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseInt(number, 8),
	            octal: octal,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    function isImplicitOctalLiteral() {
	        var i, ch;
	
	        // Implicit octal, unless there is a non-octal digit.
	        // (Annex B.1.1 on Numeric Literals)
	        for (i = index + 1; i < length; ++i) {
	            ch = source[i];
	            if (ch === '8' || ch === '9') {
	                return false;
	            }
	            if (!isOctalDigit(ch)) {
	                return true;
	            }
	        }
	
	        return true;
	    }
	
	    function scanNumericLiteral() {
	        var number, start, ch;
	
	        ch = source[index];
	        assert(isDecimalDigit(ch.charCodeAt(0)) || (ch === '.'),
	            'Numeric literal must start with a decimal digit or a decimal point');
	
	        start = index;
	        number = '';
	        if (ch !== '.') {
	            number = source[index++];
	            ch = source[index];
	
	            // Hex number starts with '0x'.
	            // Octal number starts with '0'.
	            // Octal number in ES6 starts with '0o'.
	            // Binary number in ES6 starts with '0b'.
	            if (number === '0') {
	                if (ch === 'x' || ch === 'X') {
	                    ++index;
	                    return scanHexLiteral(start);
	                }
	                if (ch === 'b' || ch === 'B') {
	                    ++index;
	                    return scanBinaryLiteral(start);
	                }
	                if (ch === 'o' || ch === 'O') {
	                    return scanOctalLiteral(ch, start);
	                }
	
	                if (isOctalDigit(ch)) {
	                    if (isImplicitOctalLiteral()) {
	                        return scanOctalLiteral(ch, start);
	                    }
	                }
	            }
	
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }
	
	        if (ch === '.') {
	            number += source[index++];
	            while (isDecimalDigit(source.charCodeAt(index))) {
	                number += source[index++];
	            }
	            ch = source[index];
	        }
	
	        if (ch === 'e' || ch === 'E') {
	            number += source[index++];
	
	            ch = source[index];
	            if (ch === '+' || ch === '-') {
	                number += source[index++];
	            }
	            if (isDecimalDigit(source.charCodeAt(index))) {
	                while (isDecimalDigit(source.charCodeAt(index))) {
	                    number += source[index++];
	                }
	            } else {
	                throwUnexpectedToken();
	            }
	        }
	
	        if (isIdentifierStart(source.charCodeAt(index))) {
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.NumericLiteral,
	            value: parseFloat(number),
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    // ECMA-262 11.8.4 String Literals
	
	    function scanStringLiteral() {
	        var str = '', quote, start, ch, unescaped, octToDec, octal = false;
	
	        quote = source[index];
	        assert((quote === '\'' || quote === '"'),
	            'String literal must starts with a quote');
	
	        start = index;
	        ++index;
	
	        while (index < length) {
	            ch = source[index++];
	
	            if (ch === quote) {
	                quote = '';
	                break;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!ch || !isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'u':
	                    case 'x':
	                        if (source[index] === '{') {
	                            ++index;
	                            str += scanUnicodeCodePointEscape();
	                        } else {
	                            unescaped = scanHexEscape(ch);
	                            if (!unescaped) {
	                                throw throwUnexpectedToken();
	                            }
	                            str += unescaped;
	                        }
	                        break;
	                    case 'n':
	                        str += '\n';
	                        break;
	                    case 'r':
	                        str += '\r';
	                        break;
	                    case 't':
	                        str += '\t';
	                        break;
	                    case 'b':
	                        str += '\b';
	                        break;
	                    case 'f':
	                        str += '\f';
	                        break;
	                    case 'v':
	                        str += '\x0B';
	                        break;
	                    case '8':
	                    case '9':
	                        str += ch;
	                        tolerateUnexpectedToken();
	                        break;
	
	                    default:
	                        if (isOctalDigit(ch)) {
	                            octToDec = octalToDecimal(ch);
	
	                            octal = octToDec.octal || octal;
	                            str += String.fromCharCode(octToDec.code);
	                        } else {
	                            str += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    lineStart = index;
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                break;
	            } else {
	                str += ch;
	            }
	        }
	
	        if (quote !== '') {
	            index = start;
	            throwUnexpectedToken();
	        }
	
	        return {
	            type: Token.StringLiteral,
	            value: str,
	            octal: octal,
	            lineNumber: startLineNumber,
	            lineStart: startLineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    // ECMA-262 11.8.6 Template Literal Lexical Components
	
	    function scanTemplate() {
	        var cooked = '', ch, start, rawOffset, terminated, head, tail, restore, unescaped;
	
	        terminated = false;
	        tail = false;
	        start = index;
	        head = (source[index] === '`');
	        rawOffset = 2;
	
	        ++index;
	
	        while (index < length) {
	            ch = source[index++];
	            if (ch === '`') {
	                rawOffset = 1;
	                tail = true;
	                terminated = true;
	                break;
	            } else if (ch === '$') {
	                if (source[index] === '{') {
	                    state.curlyStack.push('${');
	                    ++index;
	                    terminated = true;
	                    break;
	                }
	                cooked += ch;
	            } else if (ch === '\\') {
	                ch = source[index++];
	                if (!isLineTerminator(ch.charCodeAt(0))) {
	                    switch (ch) {
	                    case 'n':
	                        cooked += '\n';
	                        break;
	                    case 'r':
	                        cooked += '\r';
	                        break;
	                    case 't':
	                        cooked += '\t';
	                        break;
	                    case 'u':
	                    case 'x':
	                        if (source[index] === '{') {
	                            ++index;
	                            cooked += scanUnicodeCodePointEscape();
	                        } else {
	                            restore = index;
	                            unescaped = scanHexEscape(ch);
	                            if (unescaped) {
	                                cooked += unescaped;
	                            } else {
	                                index = restore;
	                                cooked += ch;
	                            }
	                        }
	                        break;
	                    case 'b':
	                        cooked += '\b';
	                        break;
	                    case 'f':
	                        cooked += '\f';
	                        break;
	                    case 'v':
	                        cooked += '\v';
	                        break;
	
	                    default:
	                        if (ch === '0') {
	                            if (isDecimalDigit(source.charCodeAt(index))) {
	                                // Illegal: \01 \02 and so on
	                                throwError(Messages.TemplateOctalLiteral);
	                            }
	                            cooked += '\0';
	                        } else if (isOctalDigit(ch)) {
	                            // Illegal: \1 \2
	                            throwError(Messages.TemplateOctalLiteral);
	                        } else {
	                            cooked += ch;
	                        }
	                        break;
	                    }
	                } else {
	                    ++lineNumber;
	                    if (ch === '\r' && source[index] === '\n') {
	                        ++index;
	                    }
	                    lineStart = index;
	                }
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                ++lineNumber;
	                if (ch === '\r' && source[index] === '\n') {
	                    ++index;
	                }
	                lineStart = index;
	                cooked += '\n';
	            } else {
	                cooked += ch;
	            }
	        }
	
	        if (!terminated) {
	            throwUnexpectedToken();
	        }
	
	        if (!head) {
	            state.curlyStack.pop();
	        }
	
	        return {
	            type: Token.Template,
	            value: {
	                cooked: cooked,
	                raw: source.slice(start + 1, index - rawOffset)
	            },
	            head: head,
	            tail: tail,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            start: start,
	            end: index
	        };
	    }
	
	    // ECMA-262 11.8.5 Regular Expression Literals
	
	    function testRegExp(pattern, flags) {
	        // The BMP character to use as a replacement for astral symbols when
	        // translating an ES6 "u"-flagged pattern to an ES5-compatible
	        // approximation.
	        // Note: replacing with '\uFFFF' enables false positives in unlikely
	        // scenarios. For example, `[\u{1044f}-\u{10440}]` is an invalid
	        // pattern that would not be detected by this substitution.
	        var astralSubstitute = '\uFFFF',
	            tmp = pattern;
	
	        if (flags.indexOf('u') >= 0) {
	            tmp = tmp
	                // Replace every Unicode escape sequence with the equivalent
	                // BMP character or a constant ASCII code point in the case of
	                // astral symbols. (See the above note on `astralSubstitute`
	                // for more information.)
	                .replace(/\\u\{([0-9a-fA-F]+)\}|\\u([a-fA-F0-9]{4})/g, function ($0, $1, $2) {
	                    var codePoint = parseInt($1 || $2, 16);
	                    if (codePoint > 0x10FFFF) {
	                        throwUnexpectedToken(null, Messages.InvalidRegExp);
	                    }
	                    if (codePoint <= 0xFFFF) {
	                        return String.fromCharCode(codePoint);
	                    }
	                    return astralSubstitute;
	                })
	                // Replace each paired surrogate with a single ASCII symbol to
	                // avoid throwing on regular expressions that are only valid in
	                // combination with the "u" flag.
	                .replace(
	                    /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
	                    astralSubstitute
	                );
	        }
	
	        // First, detect invalid regular expressions.
	        try {
	            RegExp(tmp);
	        } catch (e) {
	            throwUnexpectedToken(null, Messages.InvalidRegExp);
	        }
	
	        // Return a regular expression object for this pattern-flag pair, or
	        // `null` in case the current environment doesn't support the flags it
	        // uses.
	        try {
	            return new RegExp(pattern, flags);
	        } catch (exception) {
	            /* istanbul ignore next */
	            return null;
	        }
	    }
	
	    function scanRegExpBody() {
	        var ch, str, classMarker, terminated, body;
	
	        ch = source[index];
	        assert(ch === '/', 'Regular expression literal must start with a slash');
	        str = source[index++];
	
	        classMarker = false;
	        terminated = false;
	        while (index < length) {
	            ch = source[index++];
	            str += ch;
	            if (ch === '\\') {
	                ch = source[index++];
	                // ECMA-262 7.8.5
	                if (isLineTerminator(ch.charCodeAt(0))) {
	                    throwUnexpectedToken(null, Messages.UnterminatedRegExp);
	                }
	                str += ch;
	            } else if (isLineTerminator(ch.charCodeAt(0))) {
	                throwUnexpectedToken(null, Messages.UnterminatedRegExp);
	            } else if (classMarker) {
	                if (ch === ']') {
	                    classMarker = false;
	                }
	            } else {
	                if (ch === '/') {
	                    terminated = true;
	                    break;
	                } else if (ch === '[') {
	                    classMarker = true;
	                }
	            }
	        }
	
	        if (!terminated) {
	            throwUnexpectedToken(null, Messages.UnterminatedRegExp);
	        }
	
	        // Exclude leading and trailing slash.
	        body = str.substr(1, str.length - 2);
	        return {
	            value: body,
	            literal: str
	        };
	    }
	
	    function scanRegExpFlags() {
	        var ch, str, flags, restore;
	
	        str = '';
	        flags = '';
	        while (index < length) {
	            ch = source[index];
	            if (!isIdentifierPart(ch.charCodeAt(0))) {
	                break;
	            }
	
	            ++index;
	            if (ch === '\\' && index < length) {
	                ch = source[index];
	                if (ch === 'u') {
	                    ++index;
	                    restore = index;
	                    ch = scanHexEscape('u');
	                    if (ch) {
	                        flags += ch;
	                        for (str += '\\u'; restore < index; ++restore) {
	                            str += source[restore];
	                        }
	                    } else {
	                        index = restore;
	                        flags += 'u';
	                        str += '\\u';
	                    }
	                    tolerateUnexpectedToken();
	                } else {
	                    str += '\\';
	                    tolerateUnexpectedToken();
	                }
	            } else {
	                flags += ch;
	                str += ch;
	            }
	        }
	
	        return {
	            value: flags,
	            literal: str
	        };
	    }
	
	    function scanRegExp() {
	        var start, body, flags, value;
	        scanning = true;
	
	        lookahead = null;
	        skipComment();
	        start = index;
	
	        body = scanRegExpBody();
	        flags = scanRegExpFlags();
	        value = testRegExp(body.value, flags.value);
	        scanning = false;
	        if (extra.tokenize) {
	            return {
	                type: Token.RegularExpression,
	                value: value,
	                regex: {
	                    pattern: body.value,
	                    flags: flags.value
	                },
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: start,
	                end: index
	            };
	        }
	
	        return {
	            literal: body.literal + flags.literal,
	            value: value,
	            regex: {
	                pattern: body.value,
	                flags: flags.value
	            },
	            start: start,
	            end: index
	        };
	    }
	
	    function collectRegex() {
	        var pos, loc, regex, token;
	
	        skipComment();
	
	        pos = index;
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        regex = scanRegExp();
	
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        /* istanbul ignore next */
	        if (!extra.tokenize) {
	            // Pop the previous token, which is likely '/' or '/='
	            if (extra.tokens.length > 0) {
	                token = extra.tokens[extra.tokens.length - 1];
	                if (token.range[0] === pos && token.type === 'Punctuator') {
	                    if (token.value === '/' || token.value === '/=') {
	                        extra.tokens.pop();
	                    }
	                }
	            }
	
	            extra.tokens.push({
	                type: 'RegularExpression',
	                value: regex.literal,
	                regex: regex.regex,
	                range: [pos, index],
	                loc: loc
	            });
	        }
	
	        return regex;
	    }
	
	    function isIdentifierName(token) {
	        return token.type === Token.Identifier ||
	            token.type === Token.Keyword ||
	            token.type === Token.BooleanLiteral ||
	            token.type === Token.NullLiteral;
	    }
	
	    // Using the following algorithm:
	    // https://github.com/mozilla/sweet.js/wiki/design
	
	    function advanceSlash() {
	        var regex, previous, check;
	
	        function testKeyword(value) {
	            return value && (value.length > 1) && (value[0] >= 'a') && (value[0] <= 'z');
	        }
	
	        previous = extra.tokenValues[extra.tokenValues.length - 1];
	        regex = (previous !== null);
	
	        switch (previous) {
	        case 'this':
	        case ']':
	            regex = false;
	            break;
	
	        case ')':
	            check = extra.tokenValues[extra.openParenToken - 1];
	            regex = (check === 'if' || check === 'while' || check === 'for' || check === 'with');
	            break;
	
	        case '}':
	            // Dividing a function by anything makes little sense,
	            // but we have to check for that.
	            regex = false;
	            if (testKeyword(extra.tokenValues[extra.openCurlyToken - 3])) {
	                // Anonymous function, e.g. function(){} /42
	                check = extra.tokenValues[extra.openCurlyToken - 4];
	                regex = check ? (FnExprTokens.indexOf(check) < 0) : false;
	            } else if (testKeyword(extra.tokenValues[extra.openCurlyToken - 4])) {
	                // Named function, e.g. function f(){} /42/
	                check = extra.tokenValues[extra.openCurlyToken - 5];
	                regex = check ? (FnExprTokens.indexOf(check) < 0) : true;
	            }
	        }
	
	        return regex ? collectRegex() : scanPunctuator();
	    }
	
	    function advance() {
	        var cp, token;
	
	        if (index >= length) {
	            return {
	                type: Token.EOF,
	                lineNumber: lineNumber,
	                lineStart: lineStart,
	                start: index,
	                end: index
	            };
	        }
	
	        cp = source.charCodeAt(index);
	
	        if (isIdentifierStart(cp)) {
	            token = scanIdentifier();
	            if (strict && isStrictModeReservedWord(token.value)) {
	                token.type = Token.Keyword;
	            }
	            return token;
	        }
	
	        // Very common: ( and ) and ;
	        if (cp === 0x28 || cp === 0x29 || cp === 0x3B) {
	            return scanPunctuator();
	        }
	
	        // String literal starts with single quote (U+0027) or double quote (U+0022).
	        if (cp === 0x27 || cp === 0x22) {
	            return scanStringLiteral();
	        }
	
	        // Dot (.) U+002E can also start a floating-point number, hence the need
	        // to check the next character.
	        if (cp === 0x2E) {
	            if (isDecimalDigit(source.charCodeAt(index + 1))) {
	                return scanNumericLiteral();
	            }
	            return scanPunctuator();
	        }
	
	        if (isDecimalDigit(cp)) {
	            return scanNumericLiteral();
	        }
	
	        // Slash (/) U+002F can also start a regex.
	        if (extra.tokenize && cp === 0x2F) {
	            return advanceSlash();
	        }
	
	        // Template literals start with ` (U+0060) for template head
	        // or } (U+007D) for template middle or template tail.
	        if (cp === 0x60 || (cp === 0x7D && state.curlyStack[state.curlyStack.length - 1] === '${')) {
	            return scanTemplate();
	        }
	
	        // Possible identifier start in a surrogate pair.
	        if (cp >= 0xD800 && cp < 0xDFFF) {
	            cp = codePointAt(index);
	            if (isIdentifierStart(cp)) {
	                return scanIdentifier();
	            }
	        }
	
	        return scanPunctuator();
	    }
	
	    function collectToken() {
	        var loc, token, value, entry;
	
	        loc = {
	            start: {
	                line: lineNumber,
	                column: index - lineStart
	            }
	        };
	
	        token = advance();
	        loc.end = {
	            line: lineNumber,
	            column: index - lineStart
	        };
	
	        if (token.type !== Token.EOF) {
	            value = source.slice(token.start, token.end);
	            entry = {
	                type: TokenName[token.type],
	                value: value,
	                range: [token.start, token.end],
	                loc: loc
	            };
	            if (token.regex) {
	                entry.regex = {
	                    pattern: token.regex.pattern,
	                    flags: token.regex.flags
	                };
	            }
	            if (extra.tokenValues) {
	                extra.tokenValues.push((entry.type === 'Punctuator' || entry.type === 'Keyword') ? entry.value : null);
	            }
	            if (extra.tokenize) {
	                if (!extra.range) {
	                    delete entry.range;
	                }
	                if (!extra.loc) {
	                    delete entry.loc;
	                }
	                if (extra.delegate) {
	                    entry = extra.delegate(entry);
	                }
	            }
	            extra.tokens.push(entry);
	        }
	
	        return token;
	    }
	
	    function lex() {
	        var token;
	        scanning = true;
	
	        lastIndex = index;
	        lastLineNumber = lineNumber;
	        lastLineStart = lineStart;
	
	        skipComment();
	
	        token = lookahead;
	
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	
	        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
	        scanning = false;
	        return token;
	    }
	
	    function peek() {
	        scanning = true;
	
	        skipComment();
	
	        lastIndex = index;
	        lastLineNumber = lineNumber;
	        lastLineStart = lineStart;
	
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	
	        lookahead = (typeof extra.tokens !== 'undefined') ? collectToken() : advance();
	        scanning = false;
	    }
	
	    function Position() {
	        this.line = startLineNumber;
	        this.column = startIndex - startLineStart;
	    }
	
	    function SourceLocation() {
	        this.start = new Position();
	        this.end = null;
	    }
	
	    function WrappingSourceLocation(startToken) {
	        this.start = {
	            line: startToken.lineNumber,
	            column: startToken.start - startToken.lineStart
	        };
	        this.end = null;
	    }
	
	    function Node() {
	        if (extra.range) {
	            this.range = [startIndex, 0];
	        }
	        if (extra.loc) {
	            this.loc = new SourceLocation();
	        }
	    }
	
	    function WrappingNode(startToken) {
	        if (extra.range) {
	            this.range = [startToken.start, 0];
	        }
	        if (extra.loc) {
	            this.loc = new WrappingSourceLocation(startToken);
	        }
	    }
	
	    WrappingNode.prototype = Node.prototype = {
	
	        processComment: function () {
	            var lastChild,
	                innerComments,
	                leadingComments,
	                trailingComments,
	                bottomRight = extra.bottomRightStack,
	                i,
	                comment,
	                last = bottomRight[bottomRight.length - 1];
	
	            if (this.type === Syntax.Program) {
	                if (this.body.length > 0) {
	                    return;
	                }
	            }
	            /**
	             * patch innnerComments for properties empty block
	             * `function a() {/** comments **\/}`
	             */
	
	            if (this.type === Syntax.BlockStatement && this.body.length === 0) {
	                innerComments = [];
	                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
	                    comment = extra.leadingComments[i];
	                    if (this.range[1] >= comment.range[1]) {
	                        innerComments.unshift(comment);
	                        extra.leadingComments.splice(i, 1);
	                        extra.trailingComments.splice(i, 1);
	                    }
	                }
	                if (innerComments.length) {
	                    this.innerComments = innerComments;
	                    //bottomRight.push(this);
	                    return;
	                }
	            }
	
	            if (extra.trailingComments.length > 0) {
	                trailingComments = [];
	                for (i = extra.trailingComments.length - 1; i >= 0; --i) {
	                    comment = extra.trailingComments[i];
	                    if (comment.range[0] >= this.range[1]) {
	                        trailingComments.unshift(comment);
	                        extra.trailingComments.splice(i, 1);
	                    }
	                }
	                extra.trailingComments = [];
	            } else {
	                if (last && last.trailingComments && last.trailingComments[0].range[0] >= this.range[1]) {
	                    trailingComments = last.trailingComments;
	                    delete last.trailingComments;
	                }
	            }
	
	            // Eating the stack.
	            while (last && last.range[0] >= this.range[0]) {
	                lastChild = bottomRight.pop();
	                last = bottomRight[bottomRight.length - 1];
	            }
	
	            if (lastChild) {
	                if (lastChild.leadingComments) {
	                    leadingComments = [];
	                    for (i = lastChild.leadingComments.length - 1; i >= 0; --i) {
	                        comment = lastChild.leadingComments[i];
	                        if (comment.range[1] <= this.range[0]) {
	                            leadingComments.unshift(comment);
	                            lastChild.leadingComments.splice(i, 1);
	                        }
	                    }
	
	                    if (!lastChild.leadingComments.length) {
	                        lastChild.leadingComments = undefined;
	                    }
	                }
	            } else if (extra.leadingComments.length > 0) {
	                leadingComments = [];
	                for (i = extra.leadingComments.length - 1; i >= 0; --i) {
	                    comment = extra.leadingComments[i];
	                    if (comment.range[1] <= this.range[0]) {
	                        leadingComments.unshift(comment);
	                        extra.leadingComments.splice(i, 1);
	                    }
	                }
	            }
	
	
	            if (leadingComments && leadingComments.length > 0) {
	                this.leadingComments = leadingComments;
	            }
	            if (trailingComments && trailingComments.length > 0) {
	                this.trailingComments = trailingComments;
	            }
	
	            bottomRight.push(this);
	        },
	
	        finish: function () {
	            if (extra.range) {
	                this.range[1] = lastIndex;
	            }
	            if (extra.loc) {
	                this.loc.end = {
	                    line: lastLineNumber,
	                    column: lastIndex - lastLineStart
	                };
	                if (extra.source) {
	                    this.loc.source = extra.source;
	                }
	            }
	
	            if (extra.attachComment) {
	                this.processComment();
	            }
	        },
	
	        finishArrayExpression: function (elements) {
	            this.type = Syntax.ArrayExpression;
	            this.elements = elements;
	            this.finish();
	            return this;
	        },
	
	        finishArrayPattern: function (elements) {
	            this.type = Syntax.ArrayPattern;
	            this.elements = elements;
	            this.finish();
	            return this;
	        },
	
	        finishArrowFunctionExpression: function (params, defaults, body, expression) {
	            this.type = Syntax.ArrowFunctionExpression;
	            this.id = null;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.generator = false;
	            this.expression = expression;
	            this.finish();
	            return this;
	        },
	
	        finishAssignmentExpression: function (operator, left, right) {
	            this.type = Syntax.AssignmentExpression;
	            this.operator = operator;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },
	
	        finishAssignmentPattern: function (left, right) {
	            this.type = Syntax.AssignmentPattern;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },
	
	        finishBinaryExpression: function (operator, left, right) {
	            this.type = (operator === '||' || operator === '&&') ? Syntax.LogicalExpression : Syntax.BinaryExpression;
	            this.operator = operator;
	            this.left = left;
	            this.right = right;
	            this.finish();
	            return this;
	        },
	
	        finishBlockStatement: function (body) {
	            this.type = Syntax.BlockStatement;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishBreakStatement: function (label) {
	            this.type = Syntax.BreakStatement;
	            this.label = label;
	            this.finish();
	            return this;
	        },
	
	        finishCallExpression: function (callee, args) {
	            this.type = Syntax.CallExpression;
	            this.callee = callee;
	            this.arguments = args;
	            this.finish();
	            return this;
	        },
	
	        finishCatchClause: function (param, body) {
	            this.type = Syntax.CatchClause;
	            this.param = param;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishClassBody: function (body) {
	            this.type = Syntax.ClassBody;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishClassDeclaration: function (id, superClass, body) {
	            this.type = Syntax.ClassDeclaration;
	            this.id = id;
	            this.superClass = superClass;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishClassExpression: function (id, superClass, body) {
	            this.type = Syntax.ClassExpression;
	            this.id = id;
	            this.superClass = superClass;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishConditionalExpression: function (test, consequent, alternate) {
	            this.type = Syntax.ConditionalExpression;
	            this.test = test;
	            this.consequent = consequent;
	            this.alternate = alternate;
	            this.finish();
	            return this;
	        },
	
	        finishContinueStatement: function (label) {
	            this.type = Syntax.ContinueStatement;
	            this.label = label;
	            this.finish();
	            return this;
	        },
	
	        finishDebuggerStatement: function () {
	            this.type = Syntax.DebuggerStatement;
	            this.finish();
	            return this;
	        },
	
	        finishDoWhileStatement: function (body, test) {
	            this.type = Syntax.DoWhileStatement;
	            this.body = body;
	            this.test = test;
	            this.finish();
	            return this;
	        },
	
	        finishEmptyStatement: function () {
	            this.type = Syntax.EmptyStatement;
	            this.finish();
	            return this;
	        },
	
	        finishExpressionStatement: function (expression) {
	            this.type = Syntax.ExpressionStatement;
	            this.expression = expression;
	            this.finish();
	            return this;
	        },
	
	        finishForStatement: function (init, test, update, body) {
	            this.type = Syntax.ForStatement;
	            this.init = init;
	            this.test = test;
	            this.update = update;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishForOfStatement: function (left, right, body) {
	            this.type = Syntax.ForOfStatement;
	            this.left = left;
	            this.right = right;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishForInStatement: function (left, right, body) {
	            this.type = Syntax.ForInStatement;
	            this.left = left;
	            this.right = right;
	            this.body = body;
	            this.each = false;
	            this.finish();
	            return this;
	        },
	
	        finishFunctionDeclaration: function (id, params, defaults, body, generator) {
	            this.type = Syntax.FunctionDeclaration;
	            this.id = id;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.generator = generator;
	            this.expression = false;
	            this.finish();
	            return this;
	        },
	
	        finishFunctionExpression: function (id, params, defaults, body, generator) {
	            this.type = Syntax.FunctionExpression;
	            this.id = id;
	            this.params = params;
	            this.defaults = defaults;
	            this.body = body;
	            this.generator = generator;
	            this.expression = false;
	            this.finish();
	            return this;
	        },
	
	        finishIdentifier: function (name) {
	            this.type = Syntax.Identifier;
	            this.name = name;
	            this.finish();
	            return this;
	        },
	
	        finishIfStatement: function (test, consequent, alternate) {
	            this.type = Syntax.IfStatement;
	            this.test = test;
	            this.consequent = consequent;
	            this.alternate = alternate;
	            this.finish();
	            return this;
	        },
	
	        finishLabeledStatement: function (label, body) {
	            this.type = Syntax.LabeledStatement;
	            this.label = label;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishLiteral: function (token) {
	            this.type = Syntax.Literal;
	            this.value = token.value;
	            this.raw = source.slice(token.start, token.end);
	            if (token.regex) {
	                this.regex = token.regex;
	            }
	            this.finish();
	            return this;
	        },
	
	        finishMemberExpression: function (accessor, object, property) {
	            this.type = Syntax.MemberExpression;
	            this.computed = accessor === '[';
	            this.object = object;
	            this.property = property;
	            this.finish();
	            return this;
	        },
	
	        finishMetaProperty: function (meta, property) {
	            this.type = Syntax.MetaProperty;
	            this.meta = meta;
	            this.property = property;
	            this.finish();
	            return this;
	        },
	
	        finishNewExpression: function (callee, args) {
	            this.type = Syntax.NewExpression;
	            this.callee = callee;
	            this.arguments = args;
	            this.finish();
	            return this;
	        },
	
	        finishObjectExpression: function (properties) {
	            this.type = Syntax.ObjectExpression;
	            this.properties = properties;
	            this.finish();
	            return this;
	        },
	
	        finishObjectPattern: function (properties) {
	            this.type = Syntax.ObjectPattern;
	            this.properties = properties;
	            this.finish();
	            return this;
	        },
	
	        finishPostfixExpression: function (operator, argument) {
	            this.type = Syntax.UpdateExpression;
	            this.operator = operator;
	            this.argument = argument;
	            this.prefix = false;
	            this.finish();
	            return this;
	        },
	
	        finishProgram: function (body, sourceType) {
	            this.type = Syntax.Program;
	            this.body = body;
	            this.sourceType = sourceType;
	            this.finish();
	            return this;
	        },
	
	        finishProperty: function (kind, key, computed, value, method, shorthand) {
	            this.type = Syntax.Property;
	            this.key = key;
	            this.computed = computed;
	            this.value = value;
	            this.kind = kind;
	            this.method = method;
	            this.shorthand = shorthand;
	            this.finish();
	            return this;
	        },
	
	        finishRestElement: function (argument) {
	            this.type = Syntax.RestElement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishReturnStatement: function (argument) {
	            this.type = Syntax.ReturnStatement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishSequenceExpression: function (expressions) {
	            this.type = Syntax.SequenceExpression;
	            this.expressions = expressions;
	            this.finish();
	            return this;
	        },
	
	        finishSpreadElement: function (argument) {
	            this.type = Syntax.SpreadElement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishSwitchCase: function (test, consequent) {
	            this.type = Syntax.SwitchCase;
	            this.test = test;
	            this.consequent = consequent;
	            this.finish();
	            return this;
	        },
	
	        finishSuper: function () {
	            this.type = Syntax.Super;
	            this.finish();
	            return this;
	        },
	
	        finishSwitchStatement: function (discriminant, cases) {
	            this.type = Syntax.SwitchStatement;
	            this.discriminant = discriminant;
	            this.cases = cases;
	            this.finish();
	            return this;
	        },
	
	        finishTaggedTemplateExpression: function (tag, quasi) {
	            this.type = Syntax.TaggedTemplateExpression;
	            this.tag = tag;
	            this.quasi = quasi;
	            this.finish();
	            return this;
	        },
	
	        finishTemplateElement: function (value, tail) {
	            this.type = Syntax.TemplateElement;
	            this.value = value;
	            this.tail = tail;
	            this.finish();
	            return this;
	        },
	
	        finishTemplateLiteral: function (quasis, expressions) {
	            this.type = Syntax.TemplateLiteral;
	            this.quasis = quasis;
	            this.expressions = expressions;
	            this.finish();
	            return this;
	        },
	
	        finishThisExpression: function () {
	            this.type = Syntax.ThisExpression;
	            this.finish();
	            return this;
	        },
	
	        finishThrowStatement: function (argument) {
	            this.type = Syntax.ThrowStatement;
	            this.argument = argument;
	            this.finish();
	            return this;
	        },
	
	        finishTryStatement: function (block, handler, finalizer) {
	            this.type = Syntax.TryStatement;
	            this.block = block;
	            this.guardedHandlers = [];
	            this.handlers = handler ? [handler] : [];
	            this.handler = handler;
	            this.finalizer = finalizer;
	            this.finish();
	            return this;
	        },
	
	        finishUnaryExpression: function (operator, argument) {
	            this.type = (operator === '++' || operator === '--') ? Syntax.UpdateExpression : Syntax.UnaryExpression;
	            this.operator = operator;
	            this.argument = argument;
	            this.prefix = true;
	            this.finish();
	            return this;
	        },
	
	        finishVariableDeclaration: function (declarations) {
	            this.type = Syntax.VariableDeclaration;
	            this.declarations = declarations;
	            this.kind = 'var';
	            this.finish();
	            return this;
	        },
	
	        finishLexicalDeclaration: function (declarations, kind) {
	            this.type = Syntax.VariableDeclaration;
	            this.declarations = declarations;
	            this.kind = kind;
	            this.finish();
	            return this;
	        },
	
	        finishVariableDeclarator: function (id, init) {
	            this.type = Syntax.VariableDeclarator;
	            this.id = id;
	            this.init = init;
	            this.finish();
	            return this;
	        },
	
	        finishWhileStatement: function (test, body) {
	            this.type = Syntax.WhileStatement;
	            this.test = test;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishWithStatement: function (object, body) {
	            this.type = Syntax.WithStatement;
	            this.object = object;
	            this.body = body;
	            this.finish();
	            return this;
	        },
	
	        finishExportSpecifier: function (local, exported) {
	            this.type = Syntax.ExportSpecifier;
	            this.exported = exported || local;
	            this.local = local;
	            this.finish();
	            return this;
	        },
	
	        finishImportDefaultSpecifier: function (local) {
	            this.type = Syntax.ImportDefaultSpecifier;
	            this.local = local;
	            this.finish();
	            return this;
	        },
	
	        finishImportNamespaceSpecifier: function (local) {
	            this.type = Syntax.ImportNamespaceSpecifier;
	            this.local = local;
	            this.finish();
	            return this;
	        },
	
	        finishExportNamedDeclaration: function (declaration, specifiers, src) {
	            this.type = Syntax.ExportNamedDeclaration;
	            this.declaration = declaration;
	            this.specifiers = specifiers;
	            this.source = src;
	            this.finish();
	            return this;
	        },
	
	        finishExportDefaultDeclaration: function (declaration) {
	            this.type = Syntax.ExportDefaultDeclaration;
	            this.declaration = declaration;
	            this.finish();
	            return this;
	        },
	
	        finishExportAllDeclaration: function (src) {
	            this.type = Syntax.ExportAllDeclaration;
	            this.source = src;
	            this.finish();
	            return this;
	        },
	
	        finishImportSpecifier: function (local, imported) {
	            this.type = Syntax.ImportSpecifier;
	            this.local = local || imported;
	            this.imported = imported;
	            this.finish();
	            return this;
	        },
	
	        finishImportDeclaration: function (specifiers, src) {
	            this.type = Syntax.ImportDeclaration;
	            this.specifiers = specifiers;
	            this.source = src;
	            this.finish();
	            return this;
	        },
	
	        finishYieldExpression: function (argument, delegate) {
	            this.type = Syntax.YieldExpression;
	            this.argument = argument;
	            this.delegate = delegate;
	            this.finish();
	            return this;
	        }
	    };
	
	
	    function recordError(error) {
	        var e, existing;
	
	        for (e = 0; e < extra.errors.length; e++) {
	            existing = extra.errors[e];
	            // Prevent duplicated error.
	            /* istanbul ignore next */
	            if (existing.index === error.index && existing.message === error.message) {
	                return;
	            }
	        }
	
	        extra.errors.push(error);
	    }
	
	    function constructError(msg, column) {
	        var error = new Error(msg);
	        try {
	            throw error;
	        } catch (base) {
	            /* istanbul ignore else */
	            if (Object.create && Object.defineProperty) {
	                error = Object.create(base);
	                Object.defineProperty(error, 'column', { value: column });
	            }
	        } finally {
	            return error;
	        }
	    }
	
	    function createError(line, pos, description) {
	        var msg, column, error;
	
	        msg = 'Line ' + line + ': ' + description;
	        column = pos - (scanning ? lineStart : lastLineStart) + 1;
	        error = constructError(msg, column);
	        error.lineNumber = line;
	        error.description = description;
	        error.index = pos;
	        return error;
	    }
	
	    // Throw an exception
	
	    function throwError(messageFormat) {
	        var args, msg;
	
	        args = Array.prototype.slice.call(arguments, 1);
	        msg = messageFormat.replace(/%(\d)/g,
	            function (whole, idx) {
	                assert(idx < args.length, 'Message reference must be in range');
	                return args[idx];
	            }
	        );
	
	        throw createError(lastLineNumber, lastIndex, msg);
	    }
	
	    function tolerateError(messageFormat) {
	        var args, msg, error;
	
	        args = Array.prototype.slice.call(arguments, 1);
	        /* istanbul ignore next */
	        msg = messageFormat.replace(/%(\d)/g,
	            function (whole, idx) {
	                assert(idx < args.length, 'Message reference must be in range');
	                return args[idx];
	            }
	        );
	
	        error = createError(lineNumber, lastIndex, msg);
	        if (extra.errors) {
	            recordError(error);
	        } else {
	            throw error;
	        }
	    }
	
	    // Throw an exception because of the token.
	
	    function unexpectedTokenError(token, message) {
	        var value, msg = message || Messages.UnexpectedToken;
	
	        if (token) {
	            if (!message) {
	                msg = (token.type === Token.EOF) ? Messages.UnexpectedEOS :
	                    (token.type === Token.Identifier) ? Messages.UnexpectedIdentifier :
	                    (token.type === Token.NumericLiteral) ? Messages.UnexpectedNumber :
	                    (token.type === Token.StringLiteral) ? Messages.UnexpectedString :
	                    (token.type === Token.Template) ? Messages.UnexpectedTemplate :
	                    Messages.UnexpectedToken;
	
	                if (token.type === Token.Keyword) {
	                    if (isFutureReservedWord(token.value)) {
	                        msg = Messages.UnexpectedReserved;
	                    } else if (strict && isStrictModeReservedWord(token.value)) {
	                        msg = Messages.StrictReservedWord;
	                    }
	                }
	            }
	
	            value = (token.type === Token.Template) ? token.value.raw : token.value;
	        } else {
	            value = 'ILLEGAL';
	        }
	
	        msg = msg.replace('%0', value);
	
	        return (token && typeof token.lineNumber === 'number') ?
	            createError(token.lineNumber, token.start, msg) :
	            createError(scanning ? lineNumber : lastLineNumber, scanning ? index : lastIndex, msg);
	    }
	
	    function throwUnexpectedToken(token, message) {
	        throw unexpectedTokenError(token, message);
	    }
	
	    function tolerateUnexpectedToken(token, message) {
	        var error = unexpectedTokenError(token, message);
	        if (extra.errors) {
	            recordError(error);
	        } else {
	            throw error;
	        }
	    }
	
	    // Expect the next token to match the specified punctuator.
	    // If not, an exception will be thrown.
	
	    function expect(value) {
	        var token = lex();
	        if (token.type !== Token.Punctuator || token.value !== value) {
	            throwUnexpectedToken(token);
	        }
	    }
	
	    /**
	     * @name expectCommaSeparator
	     * @description Quietly expect a comma when in tolerant mode, otherwise delegates
	     * to <code>expect(value)</code>
	     * @since 2.0
	     */
	    function expectCommaSeparator() {
	        var token;
	
	        if (extra.errors) {
	            token = lookahead;
	            if (token.type === Token.Punctuator && token.value === ',') {
	                lex();
	            } else if (token.type === Token.Punctuator && token.value === ';') {
	                lex();
	                tolerateUnexpectedToken(token);
	            } else {
	                tolerateUnexpectedToken(token, Messages.UnexpectedToken);
	            }
	        } else {
	            expect(',');
	        }
	    }
	
	    // Expect the next token to match the specified keyword.
	    // If not, an exception will be thrown.
	
	    function expectKeyword(keyword) {
	        var token = lex();
	        if (token.type !== Token.Keyword || token.value !== keyword) {
	            throwUnexpectedToken(token);
	        }
	    }
	
	    // Return true if the next token matches the specified punctuator.
	
	    function match(value) {
	        return lookahead.type === Token.Punctuator && lookahead.value === value;
	    }
	
	    // Return true if the next token matches the specified keyword
	
	    function matchKeyword(keyword) {
	        return lookahead.type === Token.Keyword && lookahead.value === keyword;
	    }
	
	    // Return true if the next token matches the specified contextual keyword
	    // (where an identifier is sometimes a keyword depending on the context)
	
	    function matchContextualKeyword(keyword) {
	        return lookahead.type === Token.Identifier && lookahead.value === keyword;
	    }
	
	    // Return true if the next token is an assignment operator
	
	    function matchAssign() {
	        var op;
	
	        if (lookahead.type !== Token.Punctuator) {
	            return false;
	        }
	        op = lookahead.value;
	        return op === '=' ||
	            op === '*=' ||
	            op === '/=' ||
	            op === '%=' ||
	            op === '+=' ||
	            op === '-=' ||
	            op === '<<=' ||
	            op === '>>=' ||
	            op === '>>>=' ||
	            op === '&=' ||
	            op === '^=' ||
	            op === '|=';
	    }
	
	    function consumeSemicolon() {
	        // Catch the very common case first: immediately a semicolon (U+003B).
	        if (source.charCodeAt(startIndex) === 0x3B || match(';')) {
	            lex();
	            return;
	        }
	
	        if (hasLineTerminator) {
	            return;
	        }
	
	        // FIXME(ikarienator): this is seemingly an issue in the previous location info convention.
	        lastIndex = startIndex;
	        lastLineNumber = startLineNumber;
	        lastLineStart = startLineStart;
	
	        if (lookahead.type !== Token.EOF && !match('}')) {
	            throwUnexpectedToken(lookahead);
	        }
	    }
	
	    // Cover grammar support.
	    //
	    // When an assignment expression position starts with an left parenthesis, the determination of the type
	    // of the syntax is to be deferred arbitrarily long until the end of the parentheses pair (plus a lookahead)
	    // or the first comma. This situation also defers the determination of all the expressions nested in the pair.
	    //
	    // There are three productions that can be parsed in a parentheses pair that needs to be determined
	    // after the outermost pair is closed. They are:
	    //
	    //   1. AssignmentExpression
	    //   2. BindingElements
	    //   3. AssignmentTargets
	    //
	    // In order to avoid exponential backtracking, we use two flags to denote if the production can be
	    // binding element or assignment target.
	    //
	    // The three productions have the relationship:
	    //
	    //   BindingElements ⊆ AssignmentTargets ⊆ AssignmentExpression
	    //
	    // with a single exception that CoverInitializedName when used directly in an Expression, generates
	    // an early error. Therefore, we need the third state, firstCoverInitializedNameError, to track the
	    // first usage of CoverInitializedName and report it when we reached the end of the parentheses pair.
	    //
	    // isolateCoverGrammar function runs the given parser function with a new cover grammar context, and it does not
	    // effect the current flags. This means the production the parser parses is only used as an expression. Therefore
	    // the CoverInitializedName check is conducted.
	    //
	    // inheritCoverGrammar function runs the given parse function with a new cover grammar context, and it propagates
	    // the flags outside of the parser. This means the production the parser parses is used as a part of a potential
	    // pattern. The CoverInitializedName check is deferred.
	    function isolateCoverGrammar(parser) {
	        var oldIsBindingElement = isBindingElement,
	            oldIsAssignmentTarget = isAssignmentTarget,
	            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
	            result;
	        isBindingElement = true;
	        isAssignmentTarget = true;
	        firstCoverInitializedNameError = null;
	        result = parser();
	        if (firstCoverInitializedNameError !== null) {
	            throwUnexpectedToken(firstCoverInitializedNameError);
	        }
	        isBindingElement = oldIsBindingElement;
	        isAssignmentTarget = oldIsAssignmentTarget;
	        firstCoverInitializedNameError = oldFirstCoverInitializedNameError;
	        return result;
	    }
	
	    function inheritCoverGrammar(parser) {
	        var oldIsBindingElement = isBindingElement,
	            oldIsAssignmentTarget = isAssignmentTarget,
	            oldFirstCoverInitializedNameError = firstCoverInitializedNameError,
	            result;
	        isBindingElement = true;
	        isAssignmentTarget = true;
	        firstCoverInitializedNameError = null;
	        result = parser();
	        isBindingElement = isBindingElement && oldIsBindingElement;
	        isAssignmentTarget = isAssignmentTarget && oldIsAssignmentTarget;
	        firstCoverInitializedNameError = oldFirstCoverInitializedNameError || firstCoverInitializedNameError;
	        return result;
	    }
	
	    // ECMA-262 13.3.3 Destructuring Binding Patterns
	
	    function parseArrayPattern(params, kind) {
	        var node = new Node(), elements = [], rest, restNode;
	        expect('[');
	
	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else {
	                if (match('...')) {
	                    restNode = new Node();
	                    lex();
	                    params.push(lookahead);
	                    rest = parseVariableIdentifier(kind);
	                    elements.push(restNode.finishRestElement(rest));
	                    break;
	                } else {
	                    elements.push(parsePatternWithDefault(params, kind));
	                }
	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	
	        }
	
	        expect(']');
	
	        return node.finishArrayPattern(elements);
	    }
	
	    function parsePropertyPattern(params, kind) {
	        var node = new Node(), key, keyToken, computed = match('['), init;
	        if (lookahead.type === Token.Identifier) {
	            keyToken = lookahead;
	            key = parseVariableIdentifier();
	            if (match('=')) {
	                params.push(keyToken);
	                lex();
	                init = parseAssignmentExpression();
	
	                return node.finishProperty(
	                    'init', key, false,
	                    new WrappingNode(keyToken).finishAssignmentPattern(key, init), false, true);
	            } else if (!match(':')) {
	                params.push(keyToken);
	                return node.finishProperty('init', key, false, key, false, true);
	            }
	        } else {
	            key = parseObjectPropertyKey();
	        }
	        expect(':');
	        init = parsePatternWithDefault(params, kind);
	        return node.finishProperty('init', key, computed, init, false, false);
	    }
	
	    function parseObjectPattern(params, kind) {
	        var node = new Node(), properties = [];
	
	        expect('{');
	
	        while (!match('}')) {
	            properties.push(parsePropertyPattern(params, kind));
	            if (!match('}')) {
	                expect(',');
	            }
	        }
	
	        lex();
	
	        return node.finishObjectPattern(properties);
	    }
	
	    function parsePattern(params, kind) {
	        if (match('[')) {
	            return parseArrayPattern(params, kind);
	        } else if (match('{')) {
	            return parseObjectPattern(params, kind);
	        } else if (matchKeyword('let')) {
	            if (kind === 'const' || kind === 'let') {
	                tolerateUnexpectedToken(lookahead, Messages.UnexpectedToken);
	            }
	        }
	
	        params.push(lookahead);
	        return parseVariableIdentifier(kind);
	    }
	
	    function parsePatternWithDefault(params, kind) {
	        var startToken = lookahead, pattern, previousAllowYield, right;
	        pattern = parsePattern(params, kind);
	        if (match('=')) {
	            lex();
	            previousAllowYield = state.allowYield;
	            state.allowYield = true;
	            right = isolateCoverGrammar(parseAssignmentExpression);
	            state.allowYield = previousAllowYield;
	            pattern = new WrappingNode(startToken).finishAssignmentPattern(pattern, right);
	        }
	        return pattern;
	    }
	
	    // ECMA-262 12.2.5 Array Initializer
	
	    function parseArrayInitializer() {
	        var elements = [], node = new Node(), restSpread;
	
	        expect('[');
	
	        while (!match(']')) {
	            if (match(',')) {
	                lex();
	                elements.push(null);
	            } else if (match('...')) {
	                restSpread = new Node();
	                lex();
	                restSpread.finishSpreadElement(inheritCoverGrammar(parseAssignmentExpression));
	
	                if (!match(']')) {
	                    isAssignmentTarget = isBindingElement = false;
	                    expect(',');
	                }
	                elements.push(restSpread);
	            } else {
	                elements.push(inheritCoverGrammar(parseAssignmentExpression));
	
	                if (!match(']')) {
	                    expect(',');
	                }
	            }
	        }
	
	        lex();
	
	        return node.finishArrayExpression(elements);
	    }
	
	    // ECMA-262 12.2.6 Object Initializer
	
	    function parsePropertyFunction(node, paramInfo, isGenerator) {
	        var previousStrict, body;
	
	        isAssignmentTarget = isBindingElement = false;
	
	        previousStrict = strict;
	        body = isolateCoverGrammar(parseFunctionSourceElements);
	
	        if (strict && paramInfo.firstRestricted) {
	            tolerateUnexpectedToken(paramInfo.firstRestricted, paramInfo.message);
	        }
	        if (strict && paramInfo.stricted) {
	            tolerateUnexpectedToken(paramInfo.stricted, paramInfo.message);
	        }
	
	        strict = previousStrict;
	        return node.finishFunctionExpression(null, paramInfo.params, paramInfo.defaults, body, isGenerator);
	    }
	
	    function parsePropertyMethodFunction() {
	        var params, method, node = new Node(),
	            previousAllowYield = state.allowYield;
	
	        state.allowYield = false;
	        params = parseParams();
	        state.allowYield = previousAllowYield;
	
	        state.allowYield = false;
	        method = parsePropertyFunction(node, params, false);
	        state.allowYield = previousAllowYield;
	
	        return method;
	    }
	
	    function parseObjectPropertyKey() {
	        var token, node = new Node(), expr;
	
	        token = lex();
	
	        // Note: This function is called only from parseObjectProperty(), where
	        // EOF and Punctuator tokens are already filtered out.
	
	        switch (token.type) {
	        case Token.StringLiteral:
	        case Token.NumericLiteral:
	            if (strict && token.octal) {
	                tolerateUnexpectedToken(token, Messages.StrictOctalLiteral);
	            }
	            return node.finishLiteral(token);
	        case Token.Identifier:
	        case Token.BooleanLiteral:
	        case Token.NullLiteral:
	        case Token.Keyword:
	            return node.finishIdentifier(token.value);
	        case Token.Punctuator:
	            if (token.value === '[') {
	                expr = isolateCoverGrammar(parseAssignmentExpression);
	                expect(']');
	                return expr;
	            }
	            break;
	        }
	        throwUnexpectedToken(token);
	    }
	
	    function lookaheadPropertyName() {
	        switch (lookahead.type) {
	        case Token.Identifier:
	        case Token.StringLiteral:
	        case Token.BooleanLiteral:
	        case Token.NullLiteral:
	        case Token.NumericLiteral:
	        case Token.Keyword:
	            return true;
	        case Token.Punctuator:
	            return lookahead.value === '[';
	        }
	        return false;
	    }
	
	    // This function is to try to parse a MethodDefinition as defined in 14.3. But in the case of object literals,
	    // it might be called at a position where there is in fact a short hand identifier pattern or a data property.
	    // This can only be determined after we consumed up to the left parentheses.
	    //
	    // In order to avoid back tracking, it returns `null` if the position is not a MethodDefinition and the caller
	    // is responsible to visit other options.
	    function tryParseMethodDefinition(token, key, computed, node) {
	        var value, options, methodNode, params,
	            previousAllowYield = state.allowYield;
	
	        if (token.type === Token.Identifier) {
	            // check for `get` and `set`;
	
	            if (token.value === 'get' && lookaheadPropertyName()) {
	                computed = match('[');
	                key = parseObjectPropertyKey();
	                methodNode = new Node();
	                expect('(');
	                expect(')');
	
	                state.allowYield = false;
	                value = parsePropertyFunction(methodNode, {
	                    params: [],
	                    defaults: [],
	                    stricted: null,
	                    firstRestricted: null,
	                    message: null
	                }, false);
	                state.allowYield = previousAllowYield;
	
	                return node.finishProperty('get', key, computed, value, false, false);
	            } else if (token.value === 'set' && lookaheadPropertyName()) {
	                computed = match('[');
	                key = parseObjectPropertyKey();
	                methodNode = new Node();
	                expect('(');
	
	                options = {
	                    params: [],
	                    defaultCount: 0,
	                    defaults: [],
	                    firstRestricted: null,
	                    paramSet: {}
	                };
	                if (match(')')) {
	                    tolerateUnexpectedToken(lookahead);
	                } else {
	                    state.allowYield = false;
	                    parseParam(options);
	                    state.allowYield = previousAllowYield;
	                    if (options.defaultCount === 0) {
	                        options.defaults = [];
	                    }
	                }
	                expect(')');
	
	                state.allowYield = false;
	                value = parsePropertyFunction(methodNode, options, false);
	                state.allowYield = previousAllowYield;
	
	                return node.finishProperty('set', key, computed, value, false, false);
	            }
	        } else if (token.type === Token.Punctuator && token.value === '*' && lookaheadPropertyName()) {
	            computed = match('[');
	            key = parseObjectPropertyKey();
	            methodNode = new Node();
	
	            state.allowYield = true;
	            params = parseParams();
	            state.allowYield = previousAllowYield;
	
	            state.allowYield = false;
	            value = parsePropertyFunction(methodNode, params, true);
	            state.allowYield = previousAllowYield;
	
	            return node.finishProperty('init', key, computed, value, true, false);
	        }
	
	        if (key && match('(')) {
	            value = parsePropertyMethodFunction();
	            return node.finishProperty('init', key, computed, value, true, false);
	        }
	
	        // Not a MethodDefinition.
	        return null;
	    }
	
	    function parseObjectProperty(hasProto) {
	        var token = lookahead, node = new Node(), computed, key, maybeMethod, proto, value;
	
	        computed = match('[');
	        if (match('*')) {
	            lex();
	        } else {
	            key = parseObjectPropertyKey();
	        }
	        maybeMethod = tryParseMethodDefinition(token, key, computed, node);
	        if (maybeMethod) {
	            return maybeMethod;
	        }
	
	        if (!key) {
	            throwUnexpectedToken(lookahead);
	        }
	
	        // Check for duplicated __proto__
	        if (!computed) {
	            proto = (key.type === Syntax.Identifier && key.name === '__proto__') ||
	                (key.type === Syntax.Literal && key.value === '__proto__');
	            if (hasProto.value && proto) {
	                tolerateError(Messages.DuplicateProtoProperty);
	            }
	            hasProto.value |= proto;
	        }
	
	        if (match(':')) {
	            lex();
	            value = inheritCoverGrammar(parseAssignmentExpression);
	            return node.finishProperty('init', key, computed, value, false, false);
	        }
	
	        if (token.type === Token.Identifier) {
	            if (match('=')) {
	                firstCoverInitializedNameError = lookahead;
	                lex();
	                value = isolateCoverGrammar(parseAssignmentExpression);
	                return node.finishProperty('init', key, computed,
	                    new WrappingNode(token).finishAssignmentPattern(key, value), false, true);
	            }
	            return node.finishProperty('init', key, computed, key, false, true);
	        }
	
	        throwUnexpectedToken(lookahead);
	    }
	
	    function parseObjectInitializer() {
	        var properties = [], hasProto = {value: false}, node = new Node();
	
	        expect('{');
	
	        while (!match('}')) {
	            properties.push(parseObjectProperty(hasProto));
	
	            if (!match('}')) {
	                expectCommaSeparator();
	            }
	        }
	
	        expect('}');
	
	        return node.finishObjectExpression(properties);
	    }
	
	    function reinterpretExpressionAsPattern(expr) {
	        var i;
	        switch (expr.type) {
	        case Syntax.Identifier:
	        case Syntax.MemberExpression:
	        case Syntax.RestElement:
	        case Syntax.AssignmentPattern:
	            break;
	        case Syntax.SpreadElement:
	            expr.type = Syntax.RestElement;
	            reinterpretExpressionAsPattern(expr.argument);
	            break;
	        case Syntax.ArrayExpression:
	            expr.type = Syntax.ArrayPattern;
	            for (i = 0; i < expr.elements.length; i++) {
	                if (expr.elements[i] !== null) {
	                    reinterpretExpressionAsPattern(expr.elements[i]);
	                }
	            }
	            break;
	        case Syntax.ObjectExpression:
	            expr.type = Syntax.ObjectPattern;
	            for (i = 0; i < expr.properties.length; i++) {
	                reinterpretExpressionAsPattern(expr.properties[i].value);
	            }
	            break;
	        case Syntax.AssignmentExpression:
	            expr.type = Syntax.AssignmentPattern;
	            reinterpretExpressionAsPattern(expr.left);
	            break;
	        default:
	            // Allow other node type for tolerant parsing.
	            break;
	        }
	    }
	
	    // ECMA-262 12.2.9 Template Literals
	
	    function parseTemplateElement(option) {
	        var node, token;
	
	        if (lookahead.type !== Token.Template || (option.head && !lookahead.head)) {
	            throwUnexpectedToken();
	        }
	
	        node = new Node();
	        token = lex();
	
	        return node.finishTemplateElement({ raw: token.value.raw, cooked: token.value.cooked }, token.tail);
	    }
	
	    function parseTemplateLiteral() {
	        var quasi, quasis, expressions, node = new Node();
	
	        quasi = parseTemplateElement({ head: true });
	        quasis = [quasi];
	        expressions = [];
	
	        while (!quasi.tail) {
	            expressions.push(parseExpression());
	            quasi = parseTemplateElement({ head: false });
	            quasis.push(quasi);
	        }
	
	        return node.finishTemplateLiteral(quasis, expressions);
	    }
	
	    // ECMA-262 12.2.10 The Grouping Operator
	
	    function parseGroupExpression() {
	        var expr, expressions, startToken, i, params = [];
	
	        expect('(');
	
	        if (match(')')) {
	            lex();
	            if (!match('=>')) {
	                expect('=>');
	            }
	            return {
	                type: PlaceHolders.ArrowParameterPlaceHolder,
	                params: [],
	                rawParams: []
	            };
	        }
	
	        startToken = lookahead;
	        if (match('...')) {
	            expr = parseRestElement(params);
	            expect(')');
	            if (!match('=>')) {
	                expect('=>');
	            }
	            return {
	                type: PlaceHolders.ArrowParameterPlaceHolder,
	                params: [expr]
	            };
	        }
	
	        isBindingElement = true;
	        expr = inheritCoverGrammar(parseAssignmentExpression);
	
	        if (match(',')) {
	            isAssignmentTarget = false;
	            expressions = [expr];
	
	            while (startIndex < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	
	                if (match('...')) {
	                    if (!isBindingElement) {
	                        throwUnexpectedToken(lookahead);
	                    }
	                    expressions.push(parseRestElement(params));
	                    expect(')');
	                    if (!match('=>')) {
	                        expect('=>');
	                    }
	                    isBindingElement = false;
	                    for (i = 0; i < expressions.length; i++) {
	                        reinterpretExpressionAsPattern(expressions[i]);
	                    }
	                    return {
	                        type: PlaceHolders.ArrowParameterPlaceHolder,
	                        params: expressions
	                    };
	                }
	
	                expressions.push(inheritCoverGrammar(parseAssignmentExpression));
	            }
	
	            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
	        }
	
	
	        expect(')');
	
	        if (match('=>')) {
	            if (expr.type === Syntax.Identifier && expr.name === 'yield') {
	                return {
	                    type: PlaceHolders.ArrowParameterPlaceHolder,
	                    params: [expr]
	                };
	            }
	
	            if (!isBindingElement) {
	                throwUnexpectedToken(lookahead);
	            }
	
	            if (expr.type === Syntax.SequenceExpression) {
	                for (i = 0; i < expr.expressions.length; i++) {
	                    reinterpretExpressionAsPattern(expr.expressions[i]);
	                }
	            } else {
	                reinterpretExpressionAsPattern(expr);
	            }
	
	            expr = {
	                type: PlaceHolders.ArrowParameterPlaceHolder,
	                params: expr.type === Syntax.SequenceExpression ? expr.expressions : [expr]
	            };
	        }
	        isBindingElement = false;
	        return expr;
	    }
	
	
	    // ECMA-262 12.2 Primary Expressions
	
	    function parsePrimaryExpression() {
	        var type, token, expr, node;
	
	        if (match('(')) {
	            isBindingElement = false;
	            return inheritCoverGrammar(parseGroupExpression);
	        }
	
	        if (match('[')) {
	            return inheritCoverGrammar(parseArrayInitializer);
	        }
	
	        if (match('{')) {
	            return inheritCoverGrammar(parseObjectInitializer);
	        }
	
	        type = lookahead.type;
	        node = new Node();
	
	        if (type === Token.Identifier) {
	            if (state.sourceType === 'module' && lookahead.value === 'await') {
	                tolerateUnexpectedToken(lookahead);
	            }
	            expr = node.finishIdentifier(lex().value);
	        } else if (type === Token.StringLiteral || type === Token.NumericLiteral) {
	            isAssignmentTarget = isBindingElement = false;
	            if (strict && lookahead.octal) {
	                tolerateUnexpectedToken(lookahead, Messages.StrictOctalLiteral);
	            }
	            expr = node.finishLiteral(lex());
	        } else if (type === Token.Keyword) {
	            if (!strict && state.allowYield && matchKeyword('yield')) {
	                return parseNonComputedProperty();
	            }
	            if (!strict && matchKeyword('let')) {
	                return node.finishIdentifier(lex().value);
	            }
	            isAssignmentTarget = isBindingElement = false;
	            if (matchKeyword('function')) {
	                return parseFunctionExpression();
	            }
	            if (matchKeyword('this')) {
	                lex();
	                return node.finishThisExpression();
	            }
	            if (matchKeyword('class')) {
	                return parseClassExpression();
	            }
	            throwUnexpectedToken(lex());
	        } else if (type === Token.BooleanLiteral) {
	            isAssignmentTarget = isBindingElement = false;
	            token = lex();
	            token.value = (token.value === 'true');
	            expr = node.finishLiteral(token);
	        } else if (type === Token.NullLiteral) {
	            isAssignmentTarget = isBindingElement = false;
	            token = lex();
	            token.value = null;
	            expr = node.finishLiteral(token);
	        } else if (match('/') || match('/=')) {
	            isAssignmentTarget = isBindingElement = false;
	            index = startIndex;
	
	            if (typeof extra.tokens !== 'undefined') {
	                token = collectRegex();
	            } else {
	                token = scanRegExp();
	            }
	            lex();
	            expr = node.finishLiteral(token);
	        } else if (type === Token.Template) {
	            expr = parseTemplateLiteral();
	        } else {
	            throwUnexpectedToken(lex());
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 12.3 Left-Hand-Side Expressions
	
	    function parseArguments() {
	        var args = [], expr;
	
	        expect('(');
	
	        if (!match(')')) {
	            while (startIndex < length) {
	                if (match('...')) {
	                    expr = new Node();
	                    lex();
	                    expr.finishSpreadElement(isolateCoverGrammar(parseAssignmentExpression));
	                } else {
	                    expr = isolateCoverGrammar(parseAssignmentExpression);
	                }
	                args.push(expr);
	                if (match(')')) {
	                    break;
	                }
	                expectCommaSeparator();
	            }
	        }
	
	        expect(')');
	
	        return args;
	    }
	
	    function parseNonComputedProperty() {
	        var token, node = new Node();
	
	        token = lex();
	
	        if (!isIdentifierName(token)) {
	            throwUnexpectedToken(token);
	        }
	
	        return node.finishIdentifier(token.value);
	    }
	
	    function parseNonComputedMember() {
	        expect('.');
	
	        return parseNonComputedProperty();
	    }
	
	    function parseComputedMember() {
	        var expr;
	
	        expect('[');
	
	        expr = isolateCoverGrammar(parseExpression);
	
	        expect(']');
	
	        return expr;
	    }
	
	    // ECMA-262 12.3.3 The new Operator
	
	    function parseNewExpression() {
	        var callee, args, node = new Node();
	
	        expectKeyword('new');
	
	        if (match('.')) {
	            lex();
	            if (lookahead.type === Token.Identifier && lookahead.value === 'target') {
	                if (state.inFunctionBody) {
	                    lex();
	                    return node.finishMetaProperty('new', 'target');
	                }
	            }
	            throwUnexpectedToken(lookahead);
	        }
	
	        callee = isolateCoverGrammar(parseLeftHandSideExpression);
	        args = match('(') ? parseArguments() : [];
	
	        isAssignmentTarget = isBindingElement = false;
	
	        return node.finishNewExpression(callee, args);
	    }
	
	    // ECMA-262 12.3.4 Function Calls
	
	    function parseLeftHandSideExpressionAllowCall() {
	        var quasi, expr, args, property, startToken, previousAllowIn = state.allowIn;
	
	        startToken = lookahead;
	        state.allowIn = true;
	
	        if (matchKeyword('super') && state.inFunctionBody) {
	            expr = new Node();
	            lex();
	            expr = expr.finishSuper();
	            if (!match('(') && !match('.') && !match('[')) {
	                throwUnexpectedToken(lookahead);
	            }
	        } else {
	            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
	        }
	
	        for (;;) {
	            if (match('.')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseNonComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
	            } else if (match('(')) {
	                isBindingElement = false;
	                isAssignmentTarget = false;
	                args = parseArguments();
	                expr = new WrappingNode(startToken).finishCallExpression(expr, args);
	            } else if (match('[')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
	            } else if (lookahead.type === Token.Template && lookahead.head) {
	                quasi = parseTemplateLiteral();
	                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
	            } else {
	                break;
	            }
	        }
	        state.allowIn = previousAllowIn;
	
	        return expr;
	    }
	
	    // ECMA-262 12.3 Left-Hand-Side Expressions
	
	    function parseLeftHandSideExpression() {
	        var quasi, expr, property, startToken;
	        assert(state.allowIn, 'callee of new expression always allow in keyword.');
	
	        startToken = lookahead;
	
	        if (matchKeyword('super') && state.inFunctionBody) {
	            expr = new Node();
	            lex();
	            expr = expr.finishSuper();
	            if (!match('[') && !match('.')) {
	                throwUnexpectedToken(lookahead);
	            }
	        } else {
	            expr = inheritCoverGrammar(matchKeyword('new') ? parseNewExpression : parsePrimaryExpression);
	        }
	
	        for (;;) {
	            if (match('[')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('[', expr, property);
	            } else if (match('.')) {
	                isBindingElement = false;
	                isAssignmentTarget = true;
	                property = parseNonComputedMember();
	                expr = new WrappingNode(startToken).finishMemberExpression('.', expr, property);
	            } else if (lookahead.type === Token.Template && lookahead.head) {
	                quasi = parseTemplateLiteral();
	                expr = new WrappingNode(startToken).finishTaggedTemplateExpression(expr, quasi);
	            } else {
	                break;
	            }
	        }
	        return expr;
	    }
	
	    // ECMA-262 12.4 Postfix Expressions
	
	    function parsePostfixExpression() {
	        var expr, token, startToken = lookahead;
	
	        expr = inheritCoverGrammar(parseLeftHandSideExpressionAllowCall);
	
	        if (!hasLineTerminator && lookahead.type === Token.Punctuator) {
	            if (match('++') || match('--')) {
	                // ECMA-262 11.3.1, 11.3.2
	                if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                    tolerateError(Messages.StrictLHSPostfix);
	                }
	
	                if (!isAssignmentTarget) {
	                    tolerateError(Messages.InvalidLHSInAssignment);
	                }
	
	                isAssignmentTarget = isBindingElement = false;
	
	                token = lex();
	                expr = new WrappingNode(startToken).finishPostfixExpression(token.value, expr);
	            }
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 12.5 Unary Operators
	
	    function parseUnaryExpression() {
	        var token, expr, startToken;
	
	        if (lookahead.type !== Token.Punctuator && lookahead.type !== Token.Keyword) {
	            expr = parsePostfixExpression();
	        } else if (match('++') || match('--')) {
	            startToken = lookahead;
	            token = lex();
	            expr = inheritCoverGrammar(parseUnaryExpression);
	            // ECMA-262 11.4.4, 11.4.5
	            if (strict && expr.type === Syntax.Identifier && isRestrictedWord(expr.name)) {
	                tolerateError(Messages.StrictLHSPrefix);
	            }
	
	            if (!isAssignmentTarget) {
	                tolerateError(Messages.InvalidLHSInAssignment);
	            }
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	            isAssignmentTarget = isBindingElement = false;
	        } else if (match('+') || match('-') || match('~') || match('!')) {
	            startToken = lookahead;
	            token = lex();
	            expr = inheritCoverGrammar(parseUnaryExpression);
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	            isAssignmentTarget = isBindingElement = false;
	        } else if (matchKeyword('delete') || matchKeyword('void') || matchKeyword('typeof')) {
	            startToken = lookahead;
	            token = lex();
	            expr = inheritCoverGrammar(parseUnaryExpression);
	            expr = new WrappingNode(startToken).finishUnaryExpression(token.value, expr);
	            if (strict && expr.operator === 'delete' && expr.argument.type === Syntax.Identifier) {
	                tolerateError(Messages.StrictDelete);
	            }
	            isAssignmentTarget = isBindingElement = false;
	        } else {
	            expr = parsePostfixExpression();
	        }
	
	        return expr;
	    }
	
	    function binaryPrecedence(token, allowIn) {
	        var prec = 0;
	
	        if (token.type !== Token.Punctuator && token.type !== Token.Keyword) {
	            return 0;
	        }
	
	        switch (token.value) {
	        case '||':
	            prec = 1;
	            break;
	
	        case '&&':
	            prec = 2;
	            break;
	
	        case '|':
	            prec = 3;
	            break;
	
	        case '^':
	            prec = 4;
	            break;
	
	        case '&':
	            prec = 5;
	            break;
	
	        case '==':
	        case '!=':
	        case '===':
	        case '!==':
	            prec = 6;
	            break;
	
	        case '<':
	        case '>':
	        case '<=':
	        case '>=':
	        case 'instanceof':
	            prec = 7;
	            break;
	
	        case 'in':
	            prec = allowIn ? 7 : 0;
	            break;
	
	        case '<<':
	        case '>>':
	        case '>>>':
	            prec = 8;
	            break;
	
	        case '+':
	        case '-':
	            prec = 9;
	            break;
	
	        case '*':
	        case '/':
	        case '%':
	            prec = 11;
	            break;
	
	        default:
	            break;
	        }
	
	        return prec;
	    }
	
	    // ECMA-262 12.6 Multiplicative Operators
	    // ECMA-262 12.7 Additive Operators
	    // ECMA-262 12.8 Bitwise Shift Operators
	    // ECMA-262 12.9 Relational Operators
	    // ECMA-262 12.10 Equality Operators
	    // ECMA-262 12.11 Binary Bitwise Operators
	    // ECMA-262 12.12 Binary Logical Operators
	
	    function parseBinaryExpression() {
	        var marker, markers, expr, token, prec, stack, right, operator, left, i;
	
	        marker = lookahead;
	        left = inheritCoverGrammar(parseUnaryExpression);
	
	        token = lookahead;
	        prec = binaryPrecedence(token, state.allowIn);
	        if (prec === 0) {
	            return left;
	        }
	        isAssignmentTarget = isBindingElement = false;
	        token.prec = prec;
	        lex();
	
	        markers = [marker, lookahead];
	        right = isolateCoverGrammar(parseUnaryExpression);
	
	        stack = [left, token, right];
	
	        while ((prec = binaryPrecedence(lookahead, state.allowIn)) > 0) {
	
	            // Reduce: make a binary expression from the three topmost entries.
	            while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
	                right = stack.pop();
	                operator = stack.pop().value;
	                left = stack.pop();
	                markers.pop();
	                expr = new WrappingNode(markers[markers.length - 1]).finishBinaryExpression(operator, left, right);
	                stack.push(expr);
	            }
	
	            // Shift.
	            token = lex();
	            token.prec = prec;
	            stack.push(token);
	            markers.push(lookahead);
	            expr = isolateCoverGrammar(parseUnaryExpression);
	            stack.push(expr);
	        }
	
	        // Final reduce to clean-up the stack.
	        i = stack.length - 1;
	        expr = stack[i];
	        markers.pop();
	        while (i > 1) {
	            expr = new WrappingNode(markers.pop()).finishBinaryExpression(stack[i - 1].value, stack[i - 2], expr);
	            i -= 2;
	        }
	
	        return expr;
	    }
	
	
	    // ECMA-262 12.13 Conditional Operator
	
	    function parseConditionalExpression() {
	        var expr, previousAllowIn, consequent, alternate, startToken;
	
	        startToken = lookahead;
	
	        expr = inheritCoverGrammar(parseBinaryExpression);
	        if (match('?')) {
	            lex();
	            previousAllowIn = state.allowIn;
	            state.allowIn = true;
	            consequent = isolateCoverGrammar(parseAssignmentExpression);
	            state.allowIn = previousAllowIn;
	            expect(':');
	            alternate = isolateCoverGrammar(parseAssignmentExpression);
	
	            expr = new WrappingNode(startToken).finishConditionalExpression(expr, consequent, alternate);
	            isAssignmentTarget = isBindingElement = false;
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 14.2 Arrow Function Definitions
	
	    function parseConciseBody() {
	        if (match('{')) {
	            return parseFunctionSourceElements();
	        }
	        return isolateCoverGrammar(parseAssignmentExpression);
	    }
	
	    function checkPatternParam(options, param) {
	        var i;
	        switch (param.type) {
	        case Syntax.Identifier:
	            validateParam(options, param, param.name);
	            break;
	        case Syntax.RestElement:
	            checkPatternParam(options, param.argument);
	            break;
	        case Syntax.AssignmentPattern:
	            checkPatternParam(options, param.left);
	            break;
	        case Syntax.ArrayPattern:
	            for (i = 0; i < param.elements.length; i++) {
	                if (param.elements[i] !== null) {
	                    checkPatternParam(options, param.elements[i]);
	                }
	            }
	            break;
	        case Syntax.YieldExpression:
	            break;
	        default:
	            assert(param.type === Syntax.ObjectPattern, 'Invalid type');
	            for (i = 0; i < param.properties.length; i++) {
	                checkPatternParam(options, param.properties[i].value);
	            }
	            break;
	        }
	    }
	    function reinterpretAsCoverFormalsList(expr) {
	        var i, len, param, params, defaults, defaultCount, options, token;
	
	        defaults = [];
	        defaultCount = 0;
	        params = [expr];
	
	        switch (expr.type) {
	        case Syntax.Identifier:
	            break;
	        case PlaceHolders.ArrowParameterPlaceHolder:
	            params = expr.params;
	            break;
	        default:
	            return null;
	        }
	
	        options = {
	            paramSet: {}
	        };
	
	        for (i = 0, len = params.length; i < len; i += 1) {
	            param = params[i];
	            switch (param.type) {
	            case Syntax.AssignmentPattern:
	                params[i] = param.left;
	                if (param.right.type === Syntax.YieldExpression) {
	                    if (param.right.argument) {
	                        throwUnexpectedToken(lookahead);
	                    }
	                    param.right.type = Syntax.Identifier;
	                    param.right.name = 'yield';
	                    delete param.right.argument;
	                    delete param.right.delegate;
	                }
	                defaults.push(param.right);
	                ++defaultCount;
	                checkPatternParam(options, param.left);
	                break;
	            default:
	                checkPatternParam(options, param);
	                params[i] = param;
	                defaults.push(null);
	                break;
	            }
	        }
	
	        if (strict || !state.allowYield) {
	            for (i = 0, len = params.length; i < len; i += 1) {
	                param = params[i];
	                if (param.type === Syntax.YieldExpression) {
	                    throwUnexpectedToken(lookahead);
	                }
	            }
	        }
	
	        if (options.message === Messages.StrictParamDupe) {
	            token = strict ? options.stricted : options.firstRestricted;
	            throwUnexpectedToken(token, options.message);
	        }
	
	        if (defaultCount === 0) {
	            defaults = [];
	        }
	
	        return {
	            params: params,
	            defaults: defaults,
	            stricted: options.stricted,
	            firstRestricted: options.firstRestricted,
	            message: options.message
	        };
	    }
	
	    function parseArrowFunctionExpression(options, node) {
	        var previousStrict, previousAllowYield, body;
	
	        if (hasLineTerminator) {
	            tolerateUnexpectedToken(lookahead);
	        }
	        expect('=>');
	
	        previousStrict = strict;
	        previousAllowYield = state.allowYield;
	        state.allowYield = true;
	
	        body = parseConciseBody();
	
	        if (strict && options.firstRestricted) {
	            throwUnexpectedToken(options.firstRestricted, options.message);
	        }
	        if (strict && options.stricted) {
	            tolerateUnexpectedToken(options.stricted, options.message);
	        }
	
	        strict = previousStrict;
	        state.allowYield = previousAllowYield;
	
	        return node.finishArrowFunctionExpression(options.params, options.defaults, body, body.type !== Syntax.BlockStatement);
	    }
	
	    // ECMA-262 14.4 Yield expression
	
	    function parseYieldExpression() {
	        var argument, expr, delegate, previousAllowYield;
	
	        argument = null;
	        expr = new Node();
	        delegate = false;
	
	        expectKeyword('yield');
	
	        if (!hasLineTerminator) {
	            previousAllowYield = state.allowYield;
	            state.allowYield = false;
	            delegate = match('*');
	            if (delegate) {
	                lex();
	                argument = parseAssignmentExpression();
	            } else {
	                if (!match(';') && !match('}') && !match(')') && lookahead.type !== Token.EOF) {
	                    argument = parseAssignmentExpression();
	                }
	            }
	            state.allowYield = previousAllowYield;
	        }
	
	        return expr.finishYieldExpression(argument, delegate);
	    }
	
	    // ECMA-262 12.14 Assignment Operators
	
	    function parseAssignmentExpression() {
	        var token, expr, right, list, startToken;
	
	        startToken = lookahead;
	        token = lookahead;
	
	        if (!state.allowYield && matchKeyword('yield')) {
	            return parseYieldExpression();
	        }
	
	        expr = parseConditionalExpression();
	
	        if (expr.type === PlaceHolders.ArrowParameterPlaceHolder || match('=>')) {
	            isAssignmentTarget = isBindingElement = false;
	            list = reinterpretAsCoverFormalsList(expr);
	
	            if (list) {
	                firstCoverInitializedNameError = null;
	                return parseArrowFunctionExpression(list, new WrappingNode(startToken));
	            }
	
	            return expr;
	        }
	
	        if (matchAssign()) {
	            if (!isAssignmentTarget) {
	                tolerateError(Messages.InvalidLHSInAssignment);
	            }
	
	            // ECMA-262 12.1.1
	            if (strict && expr.type === Syntax.Identifier) {
	                if (isRestrictedWord(expr.name)) {
	                    tolerateUnexpectedToken(token, Messages.StrictLHSAssignment);
	                }
	                if (isStrictModeReservedWord(expr.name)) {
	                    tolerateUnexpectedToken(token, Messages.StrictReservedWord);
	                }
	            }
	
	            if (!match('=')) {
	                isAssignmentTarget = isBindingElement = false;
	            } else {
	                reinterpretExpressionAsPattern(expr);
	            }
	
	            token = lex();
	            right = isolateCoverGrammar(parseAssignmentExpression);
	            expr = new WrappingNode(startToken).finishAssignmentExpression(token.value, expr, right);
	            firstCoverInitializedNameError = null;
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 12.15 Comma Operator
	
	    function parseExpression() {
	        var expr, startToken = lookahead, expressions;
	
	        expr = isolateCoverGrammar(parseAssignmentExpression);
	
	        if (match(',')) {
	            expressions = [expr];
	
	            while (startIndex < length) {
	                if (!match(',')) {
	                    break;
	                }
	                lex();
	                expressions.push(isolateCoverGrammar(parseAssignmentExpression));
	            }
	
	            expr = new WrappingNode(startToken).finishSequenceExpression(expressions);
	        }
	
	        return expr;
	    }
	
	    // ECMA-262 13.2 Block
	
	    function parseStatementListItem() {
	        if (lookahead.type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'export':
	                if (state.sourceType !== 'module') {
	                    tolerateUnexpectedToken(lookahead, Messages.IllegalExportDeclaration);
	                }
	                return parseExportDeclaration();
	            case 'import':
	                if (state.sourceType !== 'module') {
	                    tolerateUnexpectedToken(lookahead, Messages.IllegalImportDeclaration);
	                }
	                return parseImportDeclaration();
	            case 'const':
	                return parseLexicalDeclaration({inFor: false});
	            case 'function':
	                return parseFunctionDeclaration(new Node());
	            case 'class':
	                return parseClassDeclaration();
	            }
	        }
	
	        if (matchKeyword('let') && isLexicalDeclaration()) {
	            return parseLexicalDeclaration({inFor: false});
	        }
	
	        return parseStatement();
	    }
	
	    function parseStatementList() {
	        var list = [];
	        while (startIndex < length) {
	            if (match('}')) {
	                break;
	            }
	            list.push(parseStatementListItem());
	        }
	
	        return list;
	    }
	
	    function parseBlock() {
	        var block, node = new Node();
	
	        expect('{');
	
	        block = parseStatementList();
	
	        expect('}');
	
	        return node.finishBlockStatement(block);
	    }
	
	    // ECMA-262 13.3.2 Variable Statement
	
	    function parseVariableIdentifier(kind) {
	        var token, node = new Node();
	
	        token = lex();
	
	        if (token.type === Token.Keyword && token.value === 'yield') {
	            if (strict) {
	                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
	            } if (!state.allowYield) {
	                throwUnexpectedToken(token);
	            }
	        } else if (token.type !== Token.Identifier) {
	            if (strict && token.type === Token.Keyword && isStrictModeReservedWord(token.value)) {
	                tolerateUnexpectedToken(token, Messages.StrictReservedWord);
	            } else {
	                if (strict || token.value !== 'let' || kind !== 'var') {
	                    throwUnexpectedToken(token);
	                }
	            }
	        } else if (state.sourceType === 'module' && token.type === Token.Identifier && token.value === 'await') {
	            tolerateUnexpectedToken(token);
	        }
	
	        return node.finishIdentifier(token.value);
	    }
	
	    function parseVariableDeclaration(options) {
	        var init = null, id, node = new Node(), params = [];
	
	        id = parsePattern(params, 'var');
	
	        // ECMA-262 12.2.1
	        if (strict && isRestrictedWord(id.name)) {
	            tolerateError(Messages.StrictVarName);
	        }
	
	        if (match('=')) {
	            lex();
	            init = isolateCoverGrammar(parseAssignmentExpression);
	        } else if (id.type !== Syntax.Identifier && !options.inFor) {
	            expect('=');
	        }
	
	        return node.finishVariableDeclarator(id, init);
	    }
	
	    function parseVariableDeclarationList(options) {
	        var opt, list;
	
	        opt = { inFor: options.inFor };
	        list = [parseVariableDeclaration(opt)];
	
	        while (match(',')) {
	            lex();
	            list.push(parseVariableDeclaration(opt));
	        }
	
	        return list;
	    }
	
	    function parseVariableStatement(node) {
	        var declarations;
	
	        expectKeyword('var');
	
	        declarations = parseVariableDeclarationList({ inFor: false });
	
	        consumeSemicolon();
	
	        return node.finishVariableDeclaration(declarations);
	    }
	
	    // ECMA-262 13.3.1 Let and Const Declarations
	
	    function parseLexicalBinding(kind, options) {
	        var init = null, id, node = new Node(), params = [];
	
	        id = parsePattern(params, kind);
	
	        // ECMA-262 12.2.1
	        if (strict && id.type === Syntax.Identifier && isRestrictedWord(id.name)) {
	            tolerateError(Messages.StrictVarName);
	        }
	
	        if (kind === 'const') {
	            if (!matchKeyword('in') && !matchContextualKeyword('of')) {
	                expect('=');
	                init = isolateCoverGrammar(parseAssignmentExpression);
	            }
	        } else if ((!options.inFor && id.type !== Syntax.Identifier) || match('=')) {
	            expect('=');
	            init = isolateCoverGrammar(parseAssignmentExpression);
	        }
	
	        return node.finishVariableDeclarator(id, init);
	    }
	
	    function parseBindingList(kind, options) {
	        var list = [parseLexicalBinding(kind, options)];
	
	        while (match(',')) {
	            lex();
	            list.push(parseLexicalBinding(kind, options));
	        }
	
	        return list;
	    }
	
	
	    function tokenizerState() {
	        return {
	            index: index,
	            lineNumber: lineNumber,
	            lineStart: lineStart,
	            hasLineTerminator: hasLineTerminator,
	            lastIndex: lastIndex,
	            lastLineNumber: lastLineNumber,
	            lastLineStart: lastLineStart,
	            startIndex: startIndex,
	            startLineNumber: startLineNumber,
	            startLineStart: startLineStart,
	            lookahead: lookahead,
	            tokenCount: extra.tokens ? extra.tokens.length : 0
	        };
	    }
	
	    function resetTokenizerState(ts) {
	        index = ts.index;
	        lineNumber = ts.lineNumber;
	        lineStart = ts.lineStart;
	        hasLineTerminator = ts.hasLineTerminator;
	        lastIndex = ts.lastIndex;
	        lastLineNumber = ts.lastLineNumber;
	        lastLineStart = ts.lastLineStart;
	        startIndex = ts.startIndex;
	        startLineNumber = ts.startLineNumber;
	        startLineStart = ts.startLineStart;
	        lookahead = ts.lookahead;
	        if (extra.tokens) {
	            extra.tokens.splice(ts.tokenCount, extra.tokens.length);
	        }
	    }
	
	    function isLexicalDeclaration() {
	        var lexical, ts;
	
	        ts = tokenizerState();
	
	        lex();
	        lexical = (lookahead.type === Token.Identifier) || match('[') || match('{') ||
	            matchKeyword('let') || matchKeyword('yield');
	
	        resetTokenizerState(ts);
	
	        return lexical;
	    }
	
	    function parseLexicalDeclaration(options) {
	        var kind, declarations, node = new Node();
	
	        kind = lex().value;
	        assert(kind === 'let' || kind === 'const', 'Lexical declaration must be either let or const');
	
	        declarations = parseBindingList(kind, options);
	
	        consumeSemicolon();
	
	        return node.finishLexicalDeclaration(declarations, kind);
	    }
	
	    function parseRestElement(params) {
	        var param, node = new Node();
	
	        lex();
	
	        if (match('{')) {
	            throwError(Messages.ObjectPatternAsRestParameter);
	        }
	
	        params.push(lookahead);
	
	        param = parseVariableIdentifier();
	
	        if (match('=')) {
	            throwError(Messages.DefaultRestParameter);
	        }
	
	        if (!match(')')) {
	            throwError(Messages.ParameterAfterRestParameter);
	        }
	
	        return node.finishRestElement(param);
	    }
	
	    // ECMA-262 13.4 Empty Statement
	
	    function parseEmptyStatement(node) {
	        expect(';');
	        return node.finishEmptyStatement();
	    }
	
	    // ECMA-262 12.4 Expression Statement
	
	    function parseExpressionStatement(node) {
	        var expr = parseExpression();
	        consumeSemicolon();
	        return node.finishExpressionStatement(expr);
	    }
	
	    // ECMA-262 13.6 If statement
	
	    function parseIfStatement(node) {
	        var test, consequent, alternate;
	
	        expectKeyword('if');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        consequent = parseStatement();
	
	        if (matchKeyword('else')) {
	            lex();
	            alternate = parseStatement();
	        } else {
	            alternate = null;
	        }
	
	        return node.finishIfStatement(test, consequent, alternate);
	    }
	
	    // ECMA-262 13.7 Iteration Statements
	
	    function parseDoWhileStatement(node) {
	        var body, test, oldInIteration;
	
	        expectKeyword('do');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        if (match(';')) {
	            lex();
	        }
	
	        return node.finishDoWhileStatement(body, test);
	    }
	
	    function parseWhileStatement(node) {
	        var test, body, oldInIteration;
	
	        expectKeyword('while');
	
	        expect('(');
	
	        test = parseExpression();
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = parseStatement();
	
	        state.inIteration = oldInIteration;
	
	        return node.finishWhileStatement(test, body);
	    }
	
	    function parseForStatement(node) {
	        var init, forIn, initSeq, initStartToken, test, update, left, right, kind, declarations,
	            body, oldInIteration, previousAllowIn = state.allowIn;
	
	        init = test = update = null;
	        forIn = true;
	
	        expectKeyword('for');
	
	        expect('(');
	
	        if (match(';')) {
	            lex();
	        } else {
	            if (matchKeyword('var')) {
	                init = new Node();
	                lex();
	
	                state.allowIn = false;
	                declarations = parseVariableDeclarationList({ inFor: true });
	                state.allowIn = previousAllowIn;
	
	                if (declarations.length === 1 && matchKeyword('in')) {
	                    init = init.finishVariableDeclaration(declarations);
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
	                    init = init.finishVariableDeclaration(declarations);
	                    lex();
	                    left = init;
	                    right = parseAssignmentExpression();
	                    init = null;
	                    forIn = false;
	                } else {
	                    init = init.finishVariableDeclaration(declarations);
	                    expect(';');
	                }
	            } else if (matchKeyword('const') || matchKeyword('let')) {
	                init = new Node();
	                kind = lex().value;
	
	                if (!strict && lookahead.value === 'in') {
	                    init = init.finishIdentifier(kind);
	                    lex();
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                } else {
	                    state.allowIn = false;
	                    declarations = parseBindingList(kind, {inFor: true});
	                    state.allowIn = previousAllowIn;
	
	                    if (declarations.length === 1 && declarations[0].init === null && matchKeyword('in')) {
	                        init = init.finishLexicalDeclaration(declarations, kind);
	                        lex();
	                        left = init;
	                        right = parseExpression();
	                        init = null;
	                    } else if (declarations.length === 1 && declarations[0].init === null && matchContextualKeyword('of')) {
	                        init = init.finishLexicalDeclaration(declarations, kind);
	                        lex();
	                        left = init;
	                        right = parseAssignmentExpression();
	                        init = null;
	                        forIn = false;
	                    } else {
	                        consumeSemicolon();
	                        init = init.finishLexicalDeclaration(declarations, kind);
	                    }
	                }
	            } else {
	                initStartToken = lookahead;
	                state.allowIn = false;
	                init = inheritCoverGrammar(parseAssignmentExpression);
	                state.allowIn = previousAllowIn;
	
	                if (matchKeyword('in')) {
	                    if (!isAssignmentTarget) {
	                        tolerateError(Messages.InvalidLHSInForIn);
	                    }
	
	                    lex();
	                    reinterpretExpressionAsPattern(init);
	                    left = init;
	                    right = parseExpression();
	                    init = null;
	                } else if (matchContextualKeyword('of')) {
	                    if (!isAssignmentTarget) {
	                        tolerateError(Messages.InvalidLHSInForLoop);
	                    }
	
	                    lex();
	                    reinterpretExpressionAsPattern(init);
	                    left = init;
	                    right = parseAssignmentExpression();
	                    init = null;
	                    forIn = false;
	                } else {
	                    if (match(',')) {
	                        initSeq = [init];
	                        while (match(',')) {
	                            lex();
	                            initSeq.push(isolateCoverGrammar(parseAssignmentExpression));
	                        }
	                        init = new WrappingNode(initStartToken).finishSequenceExpression(initSeq);
	                    }
	                    expect(';');
	                }
	            }
	        }
	
	        if (typeof left === 'undefined') {
	
	            if (!match(';')) {
	                test = parseExpression();
	            }
	            expect(';');
	
	            if (!match(')')) {
	                update = parseExpression();
	            }
	        }
	
	        expect(')');
	
	        oldInIteration = state.inIteration;
	        state.inIteration = true;
	
	        body = isolateCoverGrammar(parseStatement);
	
	        state.inIteration = oldInIteration;
	
	        return (typeof left === 'undefined') ?
	                node.finishForStatement(init, test, update, body) :
	                forIn ? node.finishForInStatement(left, right, body) :
	                    node.finishForOfStatement(left, right, body);
	    }
	
	    // ECMA-262 13.8 The continue statement
	
	    function parseContinueStatement(node) {
	        var label = null, key;
	
	        expectKeyword('continue');
	
	        // Optimize the most common form: 'continue;'.
	        if (source.charCodeAt(startIndex) === 0x3B) {
	            lex();
	
	            if (!state.inIteration) {
	                throwError(Messages.IllegalContinue);
	            }
	
	            return node.finishContinueStatement(null);
	        }
	
	        if (hasLineTerminator) {
	            if (!state.inIteration) {
	                throwError(Messages.IllegalContinue);
	            }
	
	            return node.finishContinueStatement(null);
	        }
	
	        if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            key = '$' + label.name;
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !state.inIteration) {
	            throwError(Messages.IllegalContinue);
	        }
	
	        return node.finishContinueStatement(label);
	    }
	
	    // ECMA-262 13.9 The break statement
	
	    function parseBreakStatement(node) {
	        var label = null, key;
	
	        expectKeyword('break');
	
	        // Catch the very common case first: immediately a semicolon (U+003B).
	        if (source.charCodeAt(lastIndex) === 0x3B) {
	            lex();
	
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError(Messages.IllegalBreak);
	            }
	
	            return node.finishBreakStatement(null);
	        }
	
	        if (hasLineTerminator) {
	            if (!(state.inIteration || state.inSwitch)) {
	                throwError(Messages.IllegalBreak);
	            }
	        } else if (lookahead.type === Token.Identifier) {
	            label = parseVariableIdentifier();
	
	            key = '$' + label.name;
	            if (!Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.UnknownLabel, label.name);
	            }
	        }
	
	        consumeSemicolon();
	
	        if (label === null && !(state.inIteration || state.inSwitch)) {
	            throwError(Messages.IllegalBreak);
	        }
	
	        return node.finishBreakStatement(label);
	    }
	
	    // ECMA-262 13.10 The return statement
	
	    function parseReturnStatement(node) {
	        var argument = null;
	
	        expectKeyword('return');
	
	        if (!state.inFunctionBody) {
	            tolerateError(Messages.IllegalReturn);
	        }
	
	        // 'return' followed by a space and an identifier is very common.
	        if (source.charCodeAt(lastIndex) === 0x20) {
	            if (isIdentifierStart(source.charCodeAt(lastIndex + 1))) {
	                argument = parseExpression();
	                consumeSemicolon();
	                return node.finishReturnStatement(argument);
	            }
	        }
	
	        if (hasLineTerminator) {
	            // HACK
	            return node.finishReturnStatement(null);
	        }
	
	        if (!match(';')) {
	            if (!match('}') && lookahead.type !== Token.EOF) {
	                argument = parseExpression();
	            }
	        }
	
	        consumeSemicolon();
	
	        return node.finishReturnStatement(argument);
	    }
	
	    // ECMA-262 13.11 The with statement
	
	    function parseWithStatement(node) {
	        var object, body;
	
	        if (strict) {
	            tolerateError(Messages.StrictModeWith);
	        }
	
	        expectKeyword('with');
	
	        expect('(');
	
	        object = parseExpression();
	
	        expect(')');
	
	        body = parseStatement();
	
	        return node.finishWithStatement(object, body);
	    }
	
	    // ECMA-262 13.12 The switch statement
	
	    function parseSwitchCase() {
	        var test, consequent = [], statement, node = new Node();
	
	        if (matchKeyword('default')) {
	            lex();
	            test = null;
	        } else {
	            expectKeyword('case');
	            test = parseExpression();
	        }
	        expect(':');
	
	        while (startIndex < length) {
	            if (match('}') || matchKeyword('default') || matchKeyword('case')) {
	                break;
	            }
	            statement = parseStatementListItem();
	            consequent.push(statement);
	        }
	
	        return node.finishSwitchCase(test, consequent);
	    }
	
	    function parseSwitchStatement(node) {
	        var discriminant, cases, clause, oldInSwitch, defaultFound;
	
	        expectKeyword('switch');
	
	        expect('(');
	
	        discriminant = parseExpression();
	
	        expect(')');
	
	        expect('{');
	
	        cases = [];
	
	        if (match('}')) {
	            lex();
	            return node.finishSwitchStatement(discriminant, cases);
	        }
	
	        oldInSwitch = state.inSwitch;
	        state.inSwitch = true;
	        defaultFound = false;
	
	        while (startIndex < length) {
	            if (match('}')) {
	                break;
	            }
	            clause = parseSwitchCase();
	            if (clause.test === null) {
	                if (defaultFound) {
	                    throwError(Messages.MultipleDefaultsInSwitch);
	                }
	                defaultFound = true;
	            }
	            cases.push(clause);
	        }
	
	        state.inSwitch = oldInSwitch;
	
	        expect('}');
	
	        return node.finishSwitchStatement(discriminant, cases);
	    }
	
	    // ECMA-262 13.14 The throw statement
	
	    function parseThrowStatement(node) {
	        var argument;
	
	        expectKeyword('throw');
	
	        if (hasLineTerminator) {
	            throwError(Messages.NewlineAfterThrow);
	        }
	
	        argument = parseExpression();
	
	        consumeSemicolon();
	
	        return node.finishThrowStatement(argument);
	    }
	
	    // ECMA-262 13.15 The try statement
	
	    function parseCatchClause() {
	        var param, params = [], paramMap = {}, key, i, body, node = new Node();
	
	        expectKeyword('catch');
	
	        expect('(');
	        if (match(')')) {
	            throwUnexpectedToken(lookahead);
	        }
	
	        param = parsePattern(params);
	        for (i = 0; i < params.length; i++) {
	            key = '$' + params[i].value;
	            if (Object.prototype.hasOwnProperty.call(paramMap, key)) {
	                tolerateError(Messages.DuplicateBinding, params[i].value);
	            }
	            paramMap[key] = true;
	        }
	
	        // ECMA-262 12.14.1
	        if (strict && isRestrictedWord(param.name)) {
	            tolerateError(Messages.StrictCatchVariable);
	        }
	
	        expect(')');
	        body = parseBlock();
	        return node.finishCatchClause(param, body);
	    }
	
	    function parseTryStatement(node) {
	        var block, handler = null, finalizer = null;
	
	        expectKeyword('try');
	
	        block = parseBlock();
	
	        if (matchKeyword('catch')) {
	            handler = parseCatchClause();
	        }
	
	        if (matchKeyword('finally')) {
	            lex();
	            finalizer = parseBlock();
	        }
	
	        if (!handler && !finalizer) {
	            throwError(Messages.NoCatchOrFinally);
	        }
	
	        return node.finishTryStatement(block, handler, finalizer);
	    }
	
	    // ECMA-262 13.16 The debugger statement
	
	    function parseDebuggerStatement(node) {
	        expectKeyword('debugger');
	
	        consumeSemicolon();
	
	        return node.finishDebuggerStatement();
	    }
	
	    // 13 Statements
	
	    function parseStatement() {
	        var type = lookahead.type,
	            expr,
	            labeledBody,
	            key,
	            node;
	
	        if (type === Token.EOF) {
	            throwUnexpectedToken(lookahead);
	        }
	
	        if (type === Token.Punctuator && lookahead.value === '{') {
	            return parseBlock();
	        }
	        isAssignmentTarget = isBindingElement = true;
	        node = new Node();
	
	        if (type === Token.Punctuator) {
	            switch (lookahead.value) {
	            case ';':
	                return parseEmptyStatement(node);
	            case '(':
	                return parseExpressionStatement(node);
	            default:
	                break;
	            }
	        } else if (type === Token.Keyword) {
	            switch (lookahead.value) {
	            case 'break':
	                return parseBreakStatement(node);
	            case 'continue':
	                return parseContinueStatement(node);
	            case 'debugger':
	                return parseDebuggerStatement(node);
	            case 'do':
	                return parseDoWhileStatement(node);
	            case 'for':
	                return parseForStatement(node);
	            case 'function':
	                return parseFunctionDeclaration(node);
	            case 'if':
	                return parseIfStatement(node);
	            case 'return':
	                return parseReturnStatement(node);
	            case 'switch':
	                return parseSwitchStatement(node);
	            case 'throw':
	                return parseThrowStatement(node);
	            case 'try':
	                return parseTryStatement(node);
	            case 'var':
	                return parseVariableStatement(node);
	            case 'while':
	                return parseWhileStatement(node);
	            case 'with':
	                return parseWithStatement(node);
	            default:
	                break;
	            }
	        }
	
	        expr = parseExpression();
	
	        // ECMA-262 12.12 Labelled Statements
	        if ((expr.type === Syntax.Identifier) && match(':')) {
	            lex();
	
	            key = '$' + expr.name;
	            if (Object.prototype.hasOwnProperty.call(state.labelSet, key)) {
	                throwError(Messages.Redeclaration, 'Label', expr.name);
	            }
	
	            state.labelSet[key] = true;
	            labeledBody = parseStatement();
	            delete state.labelSet[key];
	            return node.finishLabeledStatement(expr, labeledBody);
	        }
	
	        consumeSemicolon();
	
	        return node.finishExpressionStatement(expr);
	    }
	
	    // ECMA-262 14.1 Function Definition
	
	    function parseFunctionSourceElements() {
	        var statement, body = [], token, directive, firstRestricted,
	            oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody,
	            node = new Node();
	
	        expect('{');
	
	        while (startIndex < length) {
	            if (lookahead.type !== Token.StringLiteral) {
	                break;
	            }
	            token = lookahead;
	
	            statement = parseStatementListItem();
	            body.push(statement);
	            if (statement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.start + 1, token.end - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        oldLabelSet = state.labelSet;
	        oldInIteration = state.inIteration;
	        oldInSwitch = state.inSwitch;
	        oldInFunctionBody = state.inFunctionBody;
	
	        state.labelSet = {};
	        state.inIteration = false;
	        state.inSwitch = false;
	        state.inFunctionBody = true;
	
	        while (startIndex < length) {
	            if (match('}')) {
	                break;
	            }
	            body.push(parseStatementListItem());
	        }
	
	        expect('}');
	
	        state.labelSet = oldLabelSet;
	        state.inIteration = oldInIteration;
	        state.inSwitch = oldInSwitch;
	        state.inFunctionBody = oldInFunctionBody;
	
	        return node.finishBlockStatement(body);
	    }
	
	    function validateParam(options, param, name) {
	        var key = '$' + name;
	        if (strict) {
	            if (isRestrictedWord(name)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamName;
	            }
	            if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        } else if (!options.firstRestricted) {
	            if (isRestrictedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictParamName;
	            } else if (isStrictModeReservedWord(name)) {
	                options.firstRestricted = param;
	                options.message = Messages.StrictReservedWord;
	            } else if (Object.prototype.hasOwnProperty.call(options.paramSet, key)) {
	                options.stricted = param;
	                options.message = Messages.StrictParamDupe;
	            }
	        }
	        options.paramSet[key] = true;
	    }
	
	    function parseParam(options) {
	        var token, param, params = [], i, def;
	
	        token = lookahead;
	        if (token.value === '...') {
	            param = parseRestElement(params);
	            validateParam(options, param.argument, param.argument.name);
	            options.params.push(param);
	            options.defaults.push(null);
	            return false;
	        }
	
	        param = parsePatternWithDefault(params);
	        for (i = 0; i < params.length; i++) {
	            validateParam(options, params[i], params[i].value);
	        }
	
	        if (param.type === Syntax.AssignmentPattern) {
	            def = param.right;
	            param = param.left;
	            ++options.defaultCount;
	        }
	
	        options.params.push(param);
	        options.defaults.push(def);
	
	        return !match(')');
	    }
	
	    function parseParams(firstRestricted) {
	        var options;
	
	        options = {
	            params: [],
	            defaultCount: 0,
	            defaults: [],
	            firstRestricted: firstRestricted
	        };
	
	        expect('(');
	
	        if (!match(')')) {
	            options.paramSet = {};
	            while (startIndex < length) {
	                if (!parseParam(options)) {
	                    break;
	                }
	                expect(',');
	            }
	        }
	
	        expect(')');
	
	        if (options.defaultCount === 0) {
	            options.defaults = [];
	        }
	
	        return {
	            params: options.params,
	            defaults: options.defaults,
	            stricted: options.stricted,
	            firstRestricted: options.firstRestricted,
	            message: options.message
	        };
	    }
	
	    function parseFunctionDeclaration(node, identifierIsOptional) {
	        var id = null, params = [], defaults = [], body, token, stricted, tmp, firstRestricted, message, previousStrict,
	            isGenerator, previousAllowYield;
	
	        previousAllowYield = state.allowYield;
	
	        expectKeyword('function');
	
	        isGenerator = match('*');
	        if (isGenerator) {
	            lex();
	        }
	
	        if (!identifierIsOptional || !match('(')) {
	            token = lookahead;
	            id = parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }
	
	        state.allowYield = !isGenerator;
	        tmp = parseParams(firstRestricted);
	        params = tmp.params;
	        defaults = tmp.defaults;
	        stricted = tmp.stricted;
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }
	
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwUnexpectedToken(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            tolerateUnexpectedToken(stricted, message);
	        }
	
	        strict = previousStrict;
	        state.allowYield = previousAllowYield;
	
	        return node.finishFunctionDeclaration(id, params, defaults, body, isGenerator);
	    }
	
	    function parseFunctionExpression() {
	        var token, id = null, stricted, firstRestricted, message, tmp,
	            params = [], defaults = [], body, previousStrict, node = new Node(),
	            isGenerator, previousAllowYield;
	
	        previousAllowYield = state.allowYield;
	
	        expectKeyword('function');
	
	        isGenerator = match('*');
	        if (isGenerator) {
	            lex();
	        }
	
	        state.allowYield = !isGenerator;
	        if (!match('(')) {
	            token = lookahead;
	            id = (!strict && !isGenerator && matchKeyword('yield')) ? parseNonComputedProperty() : parseVariableIdentifier();
	            if (strict) {
	                if (isRestrictedWord(token.value)) {
	                    tolerateUnexpectedToken(token, Messages.StrictFunctionName);
	                }
	            } else {
	                if (isRestrictedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictFunctionName;
	                } else if (isStrictModeReservedWord(token.value)) {
	                    firstRestricted = token;
	                    message = Messages.StrictReservedWord;
	                }
	            }
	        }
	
	        tmp = parseParams(firstRestricted);
	        params = tmp.params;
	        defaults = tmp.defaults;
	        stricted = tmp.stricted;
	        firstRestricted = tmp.firstRestricted;
	        if (tmp.message) {
	            message = tmp.message;
	        }
	
	        previousStrict = strict;
	        body = parseFunctionSourceElements();
	        if (strict && firstRestricted) {
	            throwUnexpectedToken(firstRestricted, message);
	        }
	        if (strict && stricted) {
	            tolerateUnexpectedToken(stricted, message);
	        }
	        strict = previousStrict;
	        state.allowYield = previousAllowYield;
	
	        return node.finishFunctionExpression(id, params, defaults, body, isGenerator);
	    }
	
	    // ECMA-262 14.5 Class Definitions
	
	    function parseClassBody() {
	        var classBody, token, isStatic, hasConstructor = false, body, method, computed, key;
	
	        classBody = new Node();
	
	        expect('{');
	        body = [];
	        while (!match('}')) {
	            if (match(';')) {
	                lex();
	            } else {
	                method = new Node();
	                token = lookahead;
	                isStatic = false;
	                computed = match('[');
	                if (match('*')) {
	                    lex();
	                } else {
	                    key = parseObjectPropertyKey();
	                    if (key.name === 'static' && (lookaheadPropertyName() || match('*'))) {
	                        token = lookahead;
	                        isStatic = true;
	                        computed = match('[');
	                        if (match('*')) {
	                            lex();
	                        } else {
	                            key = parseObjectPropertyKey();
	                        }
	                    }
	                }
	                method = tryParseMethodDefinition(token, key, computed, method);
	                if (method) {
	                    method['static'] = isStatic; // jscs:ignore requireDotNotation
	                    if (method.kind === 'init') {
	                        method.kind = 'method';
	                    }
	                    if (!isStatic) {
	                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'constructor') {
	                            if (method.kind !== 'method' || !method.method || method.value.generator) {
	                                throwUnexpectedToken(token, Messages.ConstructorSpecialMethod);
	                            }
	                            if (hasConstructor) {
	                                throwUnexpectedToken(token, Messages.DuplicateConstructor);
	                            } else {
	                                hasConstructor = true;
	                            }
	                            method.kind = 'constructor';
	                        }
	                    } else {
	                        if (!method.computed && (method.key.name || method.key.value.toString()) === 'prototype') {
	                            throwUnexpectedToken(token, Messages.StaticPrototype);
	                        }
	                    }
	                    method.type = Syntax.MethodDefinition;
	                    delete method.method;
	                    delete method.shorthand;
	                    body.push(method);
	                } else {
	                    throwUnexpectedToken(lookahead);
	                }
	            }
	        }
	        lex();
	        return classBody.finishClassBody(body);
	    }
	
	    function parseClassDeclaration(identifierIsOptional) {
	        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
	        strict = true;
	
	        expectKeyword('class');
	
	        if (!identifierIsOptional || lookahead.type === Token.Identifier) {
	            id = parseVariableIdentifier();
	        }
	
	        if (matchKeyword('extends')) {
	            lex();
	            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
	        }
	        classBody = parseClassBody();
	        strict = previousStrict;
	
	        return classNode.finishClassDeclaration(id, superClass, classBody);
	    }
	
	    function parseClassExpression() {
	        var id = null, superClass = null, classNode = new Node(), classBody, previousStrict = strict;
	        strict = true;
	
	        expectKeyword('class');
	
	        if (lookahead.type === Token.Identifier) {
	            id = parseVariableIdentifier();
	        }
	
	        if (matchKeyword('extends')) {
	            lex();
	            superClass = isolateCoverGrammar(parseLeftHandSideExpressionAllowCall);
	        }
	        classBody = parseClassBody();
	        strict = previousStrict;
	
	        return classNode.finishClassExpression(id, superClass, classBody);
	    }
	
	    // ECMA-262 15.2 Modules
	
	    function parseModuleSpecifier() {
	        var node = new Node();
	
	        if (lookahead.type !== Token.StringLiteral) {
	            throwError(Messages.InvalidModuleSpecifier);
	        }
	        return node.finishLiteral(lex());
	    }
	
	    // ECMA-262 15.2.3 Exports
	
	    function parseExportSpecifier() {
	        var exported, local, node = new Node(), def;
	        if (matchKeyword('default')) {
	            // export {default} from 'something';
	            def = new Node();
	            lex();
	            local = def.finishIdentifier('default');
	        } else {
	            local = parseVariableIdentifier();
	        }
	        if (matchContextualKeyword('as')) {
	            lex();
	            exported = parseNonComputedProperty();
	        }
	        return node.finishExportSpecifier(local, exported);
	    }
	
	    function parseExportNamedDeclaration(node) {
	        var declaration = null,
	            isExportFromIdentifier,
	            src = null, specifiers = [];
	
	        // non-default export
	        if (lookahead.type === Token.Keyword) {
	            // covers:
	            // export var f = 1;
	            switch (lookahead.value) {
	                case 'let':
	                case 'const':
	                    declaration = parseLexicalDeclaration({inFor: false});
	                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
	                case 'var':
	                case 'class':
	                case 'function':
	                    declaration = parseStatementListItem();
	                    return node.finishExportNamedDeclaration(declaration, specifiers, null);
	            }
	        }
	
	        expect('{');
	        while (!match('}')) {
	            isExportFromIdentifier = isExportFromIdentifier || matchKeyword('default');
	            specifiers.push(parseExportSpecifier());
	            if (!match('}')) {
	                expect(',');
	                if (match('}')) {
	                    break;
	                }
	            }
	        }
	        expect('}');
	
	        if (matchContextualKeyword('from')) {
	            // covering:
	            // export {default} from 'foo';
	            // export {foo} from 'foo';
	            lex();
	            src = parseModuleSpecifier();
	            consumeSemicolon();
	        } else if (isExportFromIdentifier) {
	            // covering:
	            // export {default}; // missing fromClause
	            throwError(lookahead.value ?
	                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	        } else {
	            // cover
	            // export {foo};
	            consumeSemicolon();
	        }
	        return node.finishExportNamedDeclaration(declaration, specifiers, src);
	    }
	
	    function parseExportDefaultDeclaration(node) {
	        var declaration = null,
	            expression = null;
	
	        // covers:
	        // export default ...
	        expectKeyword('default');
	
	        if (matchKeyword('function')) {
	            // covers:
	            // export default function foo () {}
	            // export default function () {}
	            declaration = parseFunctionDeclaration(new Node(), true);
	            return node.finishExportDefaultDeclaration(declaration);
	        }
	        if (matchKeyword('class')) {
	            declaration = parseClassDeclaration(true);
	            return node.finishExportDefaultDeclaration(declaration);
	        }
	
	        if (matchContextualKeyword('from')) {
	            throwError(Messages.UnexpectedToken, lookahead.value);
	        }
	
	        // covers:
	        // export default {};
	        // export default [];
	        // export default (1 + 2);
	        if (match('{')) {
	            expression = parseObjectInitializer();
	        } else if (match('[')) {
	            expression = parseArrayInitializer();
	        } else {
	            expression = parseAssignmentExpression();
	        }
	        consumeSemicolon();
	        return node.finishExportDefaultDeclaration(expression);
	    }
	
	    function parseExportAllDeclaration(node) {
	        var src;
	
	        // covers:
	        // export * from 'foo';
	        expect('*');
	        if (!matchContextualKeyword('from')) {
	            throwError(lookahead.value ?
	                    Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	        }
	        lex();
	        src = parseModuleSpecifier();
	        consumeSemicolon();
	
	        return node.finishExportAllDeclaration(src);
	    }
	
	    function parseExportDeclaration() {
	        var node = new Node();
	        if (state.inFunctionBody) {
	            throwError(Messages.IllegalExportDeclaration);
	        }
	
	        expectKeyword('export');
	
	        if (matchKeyword('default')) {
	            return parseExportDefaultDeclaration(node);
	        }
	        if (match('*')) {
	            return parseExportAllDeclaration(node);
	        }
	        return parseExportNamedDeclaration(node);
	    }
	
	    // ECMA-262 15.2.2 Imports
	
	    function parseImportSpecifier() {
	        // import {<foo as bar>} ...;
	        var local, imported, node = new Node();
	
	        imported = parseNonComputedProperty();
	        if (matchContextualKeyword('as')) {
	            lex();
	            local = parseVariableIdentifier();
	        }
	
	        return node.finishImportSpecifier(local, imported);
	    }
	
	    function parseNamedImports() {
	        var specifiers = [];
	        // {foo, bar as bas}
	        expect('{');
	        while (!match('}')) {
	            specifiers.push(parseImportSpecifier());
	            if (!match('}')) {
	                expect(',');
	                if (match('}')) {
	                    break;
	                }
	            }
	        }
	        expect('}');
	        return specifiers;
	    }
	
	    function parseImportDefaultSpecifier() {
	        // import <foo> ...;
	        var local, node = new Node();
	
	        local = parseNonComputedProperty();
	
	        return node.finishImportDefaultSpecifier(local);
	    }
	
	    function parseImportNamespaceSpecifier() {
	        // import <* as foo> ...;
	        var local, node = new Node();
	
	        expect('*');
	        if (!matchContextualKeyword('as')) {
	            throwError(Messages.NoAsAfterImportNamespace);
	        }
	        lex();
	        local = parseNonComputedProperty();
	
	        return node.finishImportNamespaceSpecifier(local);
	    }
	
	    function parseImportDeclaration() {
	        var specifiers = [], src, node = new Node();
	
	        if (state.inFunctionBody) {
	            throwError(Messages.IllegalImportDeclaration);
	        }
	
	        expectKeyword('import');
	
	        if (lookahead.type === Token.StringLiteral) {
	            // import 'foo';
	            src = parseModuleSpecifier();
	        } else {
	
	            if (match('{')) {
	                // import {bar}
	                specifiers = specifiers.concat(parseNamedImports());
	            } else if (match('*')) {
	                // import * as foo
	                specifiers.push(parseImportNamespaceSpecifier());
	            } else if (isIdentifierName(lookahead) && !matchKeyword('default')) {
	                // import foo
	                specifiers.push(parseImportDefaultSpecifier());
	                if (match(',')) {
	                    lex();
	                    if (match('*')) {
	                        // import foo, * as foo
	                        specifiers.push(parseImportNamespaceSpecifier());
	                    } else if (match('{')) {
	                        // import foo, {bar}
	                        specifiers = specifiers.concat(parseNamedImports());
	                    } else {
	                        throwUnexpectedToken(lookahead);
	                    }
	                }
	            } else {
	                throwUnexpectedToken(lex());
	            }
	
	            if (!matchContextualKeyword('from')) {
	                throwError(lookahead.value ?
	                        Messages.UnexpectedToken : Messages.MissingFromClause, lookahead.value);
	            }
	            lex();
	            src = parseModuleSpecifier();
	        }
	
	        consumeSemicolon();
	        return node.finishImportDeclaration(specifiers, src);
	    }
	
	    // ECMA-262 15.1 Scripts
	
	    function parseScriptBody() {
	        var statement, body = [], token, directive, firstRestricted;
	
	        while (startIndex < length) {
	            token = lookahead;
	            if (token.type !== Token.StringLiteral) {
	                break;
	            }
	
	            statement = parseStatementListItem();
	            body.push(statement);
	            if (statement.expression.type !== Syntax.Literal) {
	                // this is not directive
	                break;
	            }
	            directive = source.slice(token.start + 1, token.end - 1);
	            if (directive === 'use strict') {
	                strict = true;
	                if (firstRestricted) {
	                    tolerateUnexpectedToken(firstRestricted, Messages.StrictOctalLiteral);
	                }
	            } else {
	                if (!firstRestricted && token.octal) {
	                    firstRestricted = token;
	                }
	            }
	        }
	
	        while (startIndex < length) {
	            statement = parseStatementListItem();
	            /* istanbul ignore if */
	            if (typeof statement === 'undefined') {
	                break;
	            }
	            body.push(statement);
	        }
	        return body;
	    }
	
	    function parseProgram() {
	        var body, node;
	
	        peek();
	        node = new Node();
	
	        body = parseScriptBody();
	        return node.finishProgram(body, state.sourceType);
	    }
	
	    function filterTokenLocation() {
	        var i, entry, token, tokens = [];
	
	        for (i = 0; i < extra.tokens.length; ++i) {
	            entry = extra.tokens[i];
	            token = {
	                type: entry.type,
	                value: entry.value
	            };
	            if (entry.regex) {
	                token.regex = {
	                    pattern: entry.regex.pattern,
	                    flags: entry.regex.flags
	                };
	            }
	            if (extra.range) {
	                token.range = entry.range;
	            }
	            if (extra.loc) {
	                token.loc = entry.loc;
	            }
	            tokens.push(token);
	        }
	
	        extra.tokens = tokens;
	    }
	
	    function tokenize(code, options, delegate) {
	        var toString,
	            tokens;
	
	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }
	
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowIn: true,
	            allowYield: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            lastCommentStart: -1,
	            curlyStack: []
	        };
	
	        extra = {};
	
	        // Options matching.
	        options = options || {};
	
	        // Of course we collect tokens here.
	        options.tokens = true;
	        extra.tokens = [];
	        extra.tokenValues = [];
	        extra.tokenize = true;
	        extra.delegate = delegate;
	
	        // The following two fields are necessary to compute the Regex tokens.
	        extra.openParenToken = -1;
	        extra.openCurlyToken = -1;
	
	        extra.range = (typeof options.range === 'boolean') && options.range;
	        extra.loc = (typeof options.loc === 'boolean') && options.loc;
	
	        if (typeof options.comment === 'boolean' && options.comment) {
	            extra.comments = [];
	        }
	        if (typeof options.tolerant === 'boolean' && options.tolerant) {
	            extra.errors = [];
	        }
	
	        try {
	            peek();
	            if (lookahead.type === Token.EOF) {
	                return extra.tokens;
	            }
	
	            lex();
	            while (lookahead.type !== Token.EOF) {
	                try {
	                    lex();
	                } catch (lexError) {
	                    if (extra.errors) {
	                        recordError(lexError);
	                        // We have to break on the first error
	                        // to avoid infinite loops.
	                        break;
	                    } else {
	                        throw lexError;
	                    }
	                }
	            }
	
	            tokens = extra.tokens;
	            if (typeof extra.errors !== 'undefined') {
	                tokens.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            extra = {};
	        }
	        return tokens;
	    }
	
	    function parse(code, options) {
	        var program, toString;
	
	        toString = String;
	        if (typeof code !== 'string' && !(code instanceof String)) {
	            code = toString(code);
	        }
	
	        source = code;
	        index = 0;
	        lineNumber = (source.length > 0) ? 1 : 0;
	        lineStart = 0;
	        startIndex = index;
	        startLineNumber = lineNumber;
	        startLineStart = lineStart;
	        length = source.length;
	        lookahead = null;
	        state = {
	            allowIn: true,
	            allowYield: true,
	            labelSet: {},
	            inFunctionBody: false,
	            inIteration: false,
	            inSwitch: false,
	            lastCommentStart: -1,
	            curlyStack: [],
	            sourceType: 'script'
	        };
	        strict = false;
	
	        extra = {};
	        if (typeof options !== 'undefined') {
	            extra.range = (typeof options.range === 'boolean') && options.range;
	            extra.loc = (typeof options.loc === 'boolean') && options.loc;
	            extra.attachComment = (typeof options.attachComment === 'boolean') && options.attachComment;
	
	            if (extra.loc && options.source !== null && options.source !== undefined) {
	                extra.source = toString(options.source);
	            }
	
	            if (typeof options.tokens === 'boolean' && options.tokens) {
	                extra.tokens = [];
	            }
	            if (typeof options.comment === 'boolean' && options.comment) {
	                extra.comments = [];
	            }
	            if (typeof options.tolerant === 'boolean' && options.tolerant) {
	                extra.errors = [];
	            }
	            if (extra.attachComment) {
	                extra.range = true;
	                extra.comments = [];
	                extra.bottomRightStack = [];
	                extra.trailingComments = [];
	                extra.leadingComments = [];
	            }
	            if (options.sourceType === 'module') {
	                // very restrictive condition for now
	                state.sourceType = options.sourceType;
	                strict = true;
	            }
	        }
	
	        try {
	            program = parseProgram();
	            if (typeof extra.comments !== 'undefined') {
	                program.comments = extra.comments;
	            }
	            if (typeof extra.tokens !== 'undefined') {
	                filterTokenLocation();
	                program.tokens = extra.tokens;
	            }
	            if (typeof extra.errors !== 'undefined') {
	                program.errors = extra.errors;
	            }
	        } catch (e) {
	            throw e;
	        } finally {
	            extra = {};
	        }
	
	        return program;
	    }
	
	    // Sync with *.json manifests.
	    exports.version = '2.7.3';
	
	    exports.tokenize = tokenize;
	
	    exports.parse = parse;
	
	    // Deep copy.
	    /* istanbul ignore next */
	    exports.Syntax = (function () {
	        var name, types = {};
	
	        if (typeof Object.create === 'function') {
	            types = Object.create(null);
	        }
	
	        for (name in Syntax) {
	            if (Syntax.hasOwnProperty(name)) {
	                types[name] = Syntax[name];
	            }
	        }
	
	        if (typeof Object.freeze === 'function') {
	            Object.freeze(types);
	        }
	
	        return types;
	    }());
	
	}));
	/* vim: set sw=4 ts=4 et tw=80 : */


/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/*eslint-disable no-use-before-define*/
	
	var common              = __webpack_require__(125);
	var YAMLException       = __webpack_require__(126);
	var DEFAULT_FULL_SCHEMA = __webpack_require__(147);
	var DEFAULT_SAFE_SCHEMA = __webpack_require__(128);
	
	var _toString       = Object.prototype.toString;
	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	
	var CHAR_TAB                  = 0x09; /* Tab */
	var CHAR_LINE_FEED            = 0x0A; /* LF */
	var CHAR_SPACE                = 0x20; /* Space */
	var CHAR_EXCLAMATION          = 0x21; /* ! */
	var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
	var CHAR_SHARP                = 0x23; /* # */
	var CHAR_PERCENT              = 0x25; /* % */
	var CHAR_AMPERSAND            = 0x26; /* & */
	var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
	var CHAR_ASTERISK             = 0x2A; /* * */
	var CHAR_COMMA                = 0x2C; /* , */
	var CHAR_MINUS                = 0x2D; /* - */
	var CHAR_COLON                = 0x3A; /* : */
	var CHAR_GREATER_THAN         = 0x3E; /* > */
	var CHAR_QUESTION             = 0x3F; /* ? */
	var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
	var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
	var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
	var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
	var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
	var CHAR_VERTICAL_LINE        = 0x7C; /* | */
	var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */
	
	var ESCAPE_SEQUENCES = {};
	
	ESCAPE_SEQUENCES[0x00]   = '\\0';
	ESCAPE_SEQUENCES[0x07]   = '\\a';
	ESCAPE_SEQUENCES[0x08]   = '\\b';
	ESCAPE_SEQUENCES[0x09]   = '\\t';
	ESCAPE_SEQUENCES[0x0A]   = '\\n';
	ESCAPE_SEQUENCES[0x0B]   = '\\v';
	ESCAPE_SEQUENCES[0x0C]   = '\\f';
	ESCAPE_SEQUENCES[0x0D]   = '\\r';
	ESCAPE_SEQUENCES[0x1B]   = '\\e';
	ESCAPE_SEQUENCES[0x22]   = '\\"';
	ESCAPE_SEQUENCES[0x5C]   = '\\\\';
	ESCAPE_SEQUENCES[0x85]   = '\\N';
	ESCAPE_SEQUENCES[0xA0]   = '\\_';
	ESCAPE_SEQUENCES[0x2028] = '\\L';
	ESCAPE_SEQUENCES[0x2029] = '\\P';
	
	var DEPRECATED_BOOLEANS_SYNTAX = [
	  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
	  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
	];
	
	function compileStyleMap(schema, map) {
	  var result, keys, index, length, tag, style, type;
	
	  if (map === null) return {};
	
	  result = {};
	  keys = Object.keys(map);
	
	  for (index = 0, length = keys.length; index < length; index += 1) {
	    tag = keys[index];
	    style = String(map[tag]);
	
	    if (tag.slice(0, 2) === '!!') {
	      tag = 'tag:yaml.org,2002:' + tag.slice(2);
	    }
	
	    type = schema.compiledTypeMap[tag];
	
	    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
	      style = type.styleAliases[style];
	    }
	
	    result[tag] = style;
	  }
	
	  return result;
	}
	
	function encodeHex(character) {
	  var string, handle, length;
	
	  string = character.toString(16).toUpperCase();
	
	  if (character <= 0xFF) {
	    handle = 'x';
	    length = 2;
	  } else if (character <= 0xFFFF) {
	    handle = 'u';
	    length = 4;
	  } else if (character <= 0xFFFFFFFF) {
	    handle = 'U';
	    length = 8;
	  } else {
	    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
	  }
	
	  return '\\' + handle + common.repeat('0', length - string.length) + string;
	}
	
	function State(options) {
	  this.schema       = options['schema'] || DEFAULT_FULL_SCHEMA;
	  this.indent       = Math.max(1, (options['indent'] || 2));
	  this.skipInvalid  = options['skipInvalid'] || false;
	  this.flowLevel    = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
	  this.styleMap     = compileStyleMap(this.schema, options['styles'] || null);
	  this.sortKeys     = options['sortKeys'] || false;
	  this.lineWidth    = options['lineWidth'] || 80;
	  this.noRefs       = options['noRefs'] || false;
	  this.noCompatMode = options['noCompatMode'] || false;
	
	  this.implicitTypes = this.schema.compiledImplicit;
	  this.explicitTypes = this.schema.compiledExplicit;
	
	  this.tag = null;
	  this.result = '';
	
	  this.duplicates = [];
	  this.usedDuplicates = null;
	}
	
	// Indents every line in a string. Empty lines (\n only) are not indented.
	function indentString(string, spaces) {
	  var ind = common.repeat(' ', spaces),
	      position = 0,
	      next = -1,
	      result = '',
	      line,
	      length = string.length;
	
	  while (position < length) {
	    next = string.indexOf('\n', position);
	    if (next === -1) {
	      line = string.slice(position);
	      position = length;
	    } else {
	      line = string.slice(position, next + 1);
	      position = next + 1;
	    }
	
	    if (line.length && line !== '\n') result += ind;
	
	    result += line;
	  }
	
	  return result;
	}
	
	function generateNextLine(state, level) {
	  return '\n' + common.repeat(' ', state.indent * level);
	}
	
	function testImplicitResolving(state, str) {
	  var index, length, type;
	
	  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
	    type = state.implicitTypes[index];
	
	    if (type.resolve(str)) {
	      return true;
	    }
	  }
	
	  return false;
	}
	
	// [33] s-white ::= s-space | s-tab
	function isWhitespace(c) {
	  return c === CHAR_SPACE || c === CHAR_TAB;
	}
	
	// Returns true if the character can be printed without escaping.
	// From YAML 1.2: "any allowed characters known to be non-printable
	// should also be escaped. [However,] This isn’t mandatory"
	// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
	function isPrintable(c) {
	  return  (0x00020 <= c && c <= 0x00007E)
	      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
	      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== 0xFEFF /* BOM */)
	      ||  (0x10000 <= c && c <= 0x10FFFF);
	}
	
	// Simplified test for values allowed after the first character in plain style.
	function isPlainSafe(c) {
	  // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
	  // where nb-char ::= c-printable - b-char - c-byte-order-mark.
	  return isPrintable(c) && c !== 0xFEFF
	    // - c-flow-indicator
	    && c !== CHAR_COMMA
	    && c !== CHAR_LEFT_SQUARE_BRACKET
	    && c !== CHAR_RIGHT_SQUARE_BRACKET
	    && c !== CHAR_LEFT_CURLY_BRACKET
	    && c !== CHAR_RIGHT_CURLY_BRACKET
	    // - ":" - "#"
	    && c !== CHAR_COLON
	    && c !== CHAR_SHARP;
	}
	
	// Simplified test for values allowed as the first character in plain style.
	function isPlainSafeFirst(c) {
	  // Uses a subset of ns-char - c-indicator
	  // where ns-char = nb-char - s-white.
	  return isPrintable(c) && c !== 0xFEFF
	    && !isWhitespace(c) // - s-white
	    // - (c-indicator ::=
	    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
	    && c !== CHAR_MINUS
	    && c !== CHAR_QUESTION
	    && c !== CHAR_COLON
	    && c !== CHAR_COMMA
	    && c !== CHAR_LEFT_SQUARE_BRACKET
	    && c !== CHAR_RIGHT_SQUARE_BRACKET
	    && c !== CHAR_LEFT_CURLY_BRACKET
	    && c !== CHAR_RIGHT_CURLY_BRACKET
	    // | “#” | “&” | “*” | “!” | “|” | “>” | “'” | “"”
	    && c !== CHAR_SHARP
	    && c !== CHAR_AMPERSAND
	    && c !== CHAR_ASTERISK
	    && c !== CHAR_EXCLAMATION
	    && c !== CHAR_VERTICAL_LINE
	    && c !== CHAR_GREATER_THAN
	    && c !== CHAR_SINGLE_QUOTE
	    && c !== CHAR_DOUBLE_QUOTE
	    // | “%” | “@” | “`”)
	    && c !== CHAR_PERCENT
	    && c !== CHAR_COMMERCIAL_AT
	    && c !== CHAR_GRAVE_ACCENT;
	}
	
	var STYLE_PLAIN   = 1,
	    STYLE_SINGLE  = 2,
	    STYLE_LITERAL = 3,
	    STYLE_FOLDED  = 4,
	    STYLE_DOUBLE  = 5;
	
	// Determines which scalar styles are possible and returns the preferred style.
	// lineWidth = -1 => no limit.
	// Pre-conditions: str.length > 0.
	// Post-conditions:
	//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
	//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
	//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
	function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
	  var i;
	  var char;
	  var hasLineBreak = false;
	  var hasFoldableLine = false; // only checked if shouldTrackWidth
	  var shouldTrackWidth = lineWidth !== -1;
	  var previousLineBreak = -1; // count the first line correctly
	  var plain = isPlainSafeFirst(string.charCodeAt(0))
	          && !isWhitespace(string.charCodeAt(string.length - 1));
	
	  if (singleLineOnly) {
	    // Case: no block styles.
	    // Check for disallowed characters to rule out plain and single.
	    for (i = 0; i < string.length; i++) {
	      char = string.charCodeAt(i);
	      if (!isPrintable(char)) {
	        return STYLE_DOUBLE;
	      }
	      plain = plain && isPlainSafe(char);
	    }
	  } else {
	    // Case: block styles permitted.
	    for (i = 0; i < string.length; i++) {
	      char = string.charCodeAt(i);
	      if (char === CHAR_LINE_FEED) {
	        hasLineBreak = true;
	        // Check if any line can be folded.
	        if (shouldTrackWidth) {
	          hasFoldableLine = hasFoldableLine ||
	            // Foldable line = too long, and not more-indented.
	            (i - previousLineBreak - 1 > lineWidth &&
	             string[previousLineBreak + 1] !== ' ');
	          previousLineBreak = i;
	        }
	      } else if (!isPrintable(char)) {
	        return STYLE_DOUBLE;
	      }
	      plain = plain && isPlainSafe(char);
	    }
	    // in case the end is missing a \n
	    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
	      (i - previousLineBreak - 1 > lineWidth &&
	       string[previousLineBreak + 1] !== ' '));
	  }
	  // Although every style can represent \n without escaping, prefer block styles
	  // for multiline, since they're more readable and they don't add empty lines.
	  // Also prefer folding a super-long line.
	  if (!hasLineBreak && !hasFoldableLine) {
	    // Strings interpretable as another type have to be quoted;
	    // e.g. the string 'true' vs. the boolean true.
	    return plain && !testAmbiguousType(string)
	      ? STYLE_PLAIN : STYLE_SINGLE;
	  }
	  // Edge case: block indentation indicator can only have one digit.
	  if (string[0] === ' ' && indentPerLevel > 9) {
	    return STYLE_DOUBLE;
	  }
	  // At this point we know block styles are valid.
	  // Prefer literal style unless we want to fold.
	  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
	}
	
	// Note: line breaking/folding is implemented for only the folded style.
	// NB. We drop the last trailing newline (if any) of a returned block scalar
	//  since the dumper adds its own newline. This always works:
	//    • No ending newline => unaffected; already using strip "-" chomping.
	//    • Ending newline    => removed then restored.
	//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
	function writeScalar(state, string, level, iskey) {
	  state.dump = (function () {
	    if (string.length === 0) {
	      return "''";
	    }
	    if (!state.noCompatMode &&
	        DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
	      return "'" + string + "'";
	    }
	
	    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
	    // As indentation gets deeper, let the width decrease monotonically
	    // to the lower bound min(state.lineWidth, 40).
	    // Note that this implies
	    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
	    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
	    // This behaves better than a constant minimum width which disallows narrower options,
	    // or an indent threshold which causes the width to suddenly increase.
	    var lineWidth = state.lineWidth === -1
	      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
	
	    // Without knowing if keys are implicit/explicit, assume implicit for safety.
	    var singleLineOnly = iskey
	      // No block styles in flow mode.
	      || (state.flowLevel > -1 && level >= state.flowLevel);
	    function testAmbiguity(string) {
	      return testImplicitResolving(state, string);
	    }
	
	    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
	      case STYLE_PLAIN:
	        return string;
	      case STYLE_SINGLE:
	        return "'" + string.replace(/'/g, "''") + "'";
	      case STYLE_LITERAL:
	        return '|' + blockHeader(string, state.indent)
	          + dropEndingNewline(indentString(string, indent));
	      case STYLE_FOLDED:
	        return '>' + blockHeader(string, state.indent)
	          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
	      case STYLE_DOUBLE:
	        return '"' + escapeString(string, lineWidth) + '"';
	      default:
	        throw new YAMLException('impossible error: invalid scalar style');
	    }
	  }());
	}
	
	// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
	function blockHeader(string, indentPerLevel) {
	  var indentIndicator = (string[0] === ' ') ? String(indentPerLevel) : '';
	
	  // note the special case: the string '\n' counts as a "trailing" empty line.
	  var clip =          string[string.length - 1] === '\n';
	  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
	  var chomp = keep ? '+' : (clip ? '' : '-');
	
	  return indentIndicator + chomp + '\n';
	}
	
	// (See the note for writeScalar.)
	function dropEndingNewline(string) {
	  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
	}
	
	// Note: a long line without a suitable break point will exceed the width limit.
	// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
	function foldString(string, width) {
	  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
	  // unless they're before or after a more-indented line, or at the very
	  // beginning or end, in which case $k$ maps to $k$.
	  // Therefore, parse each chunk as newline(s) followed by a content line.
	  var lineRe = /(\n+)([^\n]*)/g;
	
	  // first line (possibly an empty line)
	  var result = (function () {
	    var nextLF = string.indexOf('\n');
	    nextLF = nextLF !== -1 ? nextLF : string.length;
	    lineRe.lastIndex = nextLF;
	    return foldLine(string.slice(0, nextLF), width);
	  }());
	  // If we haven't reached the first content line yet, don't add an extra \n.
	  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
	  var moreIndented;
	
	  // rest of the lines
	  var match;
	  while ((match = lineRe.exec(string))) {
	    var prefix = match[1], line = match[2];
	    moreIndented = (line[0] === ' ');
	    result += prefix
	      + (!prevMoreIndented && !moreIndented && line !== ''
	        ? '\n' : '')
	      + foldLine(line, width);
	    prevMoreIndented = moreIndented;
	  }
	
	  return result;
	}
	
	// Greedy line breaking.
	// Picks the longest line under the limit each time,
	// otherwise settles for the shortest line over the limit.
	// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
	function foldLine(line, width) {
	  if (line === '' || line[0] === ' ') return line;
	
	  // Since a more-indented line adds a \n, breaks can't be followed by a space.
	  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
	  var match;
	  // start is an inclusive index. end, curr, and next are exclusive.
	  var start = 0, end, curr = 0, next = 0;
	  var result = '';
	
	  // Invariants: 0 <= start <= length-1.
	  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
	  // Inside the loop:
	  //   A match implies length >= 2, so curr and next are <= length-2.
	  while ((match = breakRe.exec(line))) {
	    next = match.index;
	    // maintain invariant: curr - start <= width
	    if (next - start > width) {
	      end = (curr > start) ? curr : next; // derive end <= length-2
	      result += '\n' + line.slice(start, end);
	      // skip the space that was output as \n
	      start = end + 1;                    // derive start <= length-1
	    }
	    curr = next;
	  }
	
	  // By the invariants, start <= length-1, so there is something left over.
	  // It is either the whole string or a part starting from non-whitespace.
	  result += '\n';
	  // Insert a break if the remainder is too long and there is a break available.
	  if (line.length - start > width && curr > start) {
	    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
	  } else {
	    result += line.slice(start);
	  }
	
	  return result.slice(1); // drop extra \n joiner
	}
	
	// Escapes a double-quoted string.
	function escapeString(string) {
	  var result = '';
	  var char;
	  var escapeSeq;
	
	  for (var i = 0; i < string.length; i++) {
	    char = string.charCodeAt(i);
	    escapeSeq = ESCAPE_SEQUENCES[char];
	    result += !escapeSeq && isPrintable(char)
	      ? string[i]
	      : escapeSeq || encodeHex(char);
	  }
	
	  return result;
	}
	
	function writeFlowSequence(state, level, object) {
	  var _result = '',
	      _tag    = state.tag,
	      index,
	      length;
	
	  for (index = 0, length = object.length; index < length; index += 1) {
	    // Write only valid elements.
	    if (writeNode(state, level, object[index], false, false)) {
	      if (index !== 0) _result += ', ';
	      _result += state.dump;
	    }
	  }
	
	  state.tag = _tag;
	  state.dump = '[' + _result + ']';
	}
	
	function writeBlockSequence(state, level, object, compact) {
	  var _result = '',
	      _tag    = state.tag,
	      index,
	      length;
	
	  for (index = 0, length = object.length; index < length; index += 1) {
	    // Write only valid elements.
	    if (writeNode(state, level + 1, object[index], true, true)) {
	      if (!compact || index !== 0) {
	        _result += generateNextLine(state, level);
	      }
	      _result += '- ' + state.dump;
	    }
	  }
	
	  state.tag = _tag;
	  state.dump = _result || '[]'; // Empty sequence if no valid values.
	}
	
	function writeFlowMapping(state, level, object) {
	  var _result       = '',
	      _tag          = state.tag,
	      objectKeyList = Object.keys(object),
	      index,
	      length,
	      objectKey,
	      objectValue,
	      pairBuffer;
	
	  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	    pairBuffer = '';
	
	    if (index !== 0) pairBuffer += ', ';
	
	    objectKey = objectKeyList[index];
	    objectValue = object[objectKey];
	
	    if (!writeNode(state, level, objectKey, false, false)) {
	      continue; // Skip this pair because of invalid key;
	    }
	
	    if (state.dump.length > 1024) pairBuffer += '? ';
	
	    pairBuffer += state.dump + ': ';
	
	    if (!writeNode(state, level, objectValue, false, false)) {
	      continue; // Skip this pair because of invalid value.
	    }
	
	    pairBuffer += state.dump;
	
	    // Both key and value are valid.
	    _result += pairBuffer;
	  }
	
	  state.tag = _tag;
	  state.dump = '{' + _result + '}';
	}
	
	function writeBlockMapping(state, level, object, compact) {
	  var _result       = '',
	      _tag          = state.tag,
	      objectKeyList = Object.keys(object),
	      index,
	      length,
	      objectKey,
	      objectValue,
	      explicitPair,
	      pairBuffer;
	
	  // Allow sorting keys so that the output file is deterministic
	  if (state.sortKeys === true) {
	    // Default sorting
	    objectKeyList.sort();
	  } else if (typeof state.sortKeys === 'function') {
	    // Custom sort function
	    objectKeyList.sort(state.sortKeys);
	  } else if (state.sortKeys) {
	    // Something is wrong
	    throw new YAMLException('sortKeys must be a boolean or a function');
	  }
	
	  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	    pairBuffer = '';
	
	    if (!compact || index !== 0) {
	      pairBuffer += generateNextLine(state, level);
	    }
	
	    objectKey = objectKeyList[index];
	    objectValue = object[objectKey];
	
	    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
	      continue; // Skip this pair because of invalid key.
	    }
	
	    explicitPair = (state.tag !== null && state.tag !== '?') ||
	                   (state.dump && state.dump.length > 1024);
	
	    if (explicitPair) {
	      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
	        pairBuffer += '?';
	      } else {
	        pairBuffer += '? ';
	      }
	    }
	
	    pairBuffer += state.dump;
	
	    if (explicitPair) {
	      pairBuffer += generateNextLine(state, level);
	    }
	
	    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
	      continue; // Skip this pair because of invalid value.
	    }
	
	    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
	      pairBuffer += ':';
	    } else {
	      pairBuffer += ': ';
	    }
	
	    pairBuffer += state.dump;
	
	    // Both key and value are valid.
	    _result += pairBuffer;
	  }
	
	  state.tag = _tag;
	  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
	}
	
	function detectType(state, object, explicit) {
	  var _result, typeList, index, length, type, style;
	
	  typeList = explicit ? state.explicitTypes : state.implicitTypes;
	
	  for (index = 0, length = typeList.length; index < length; index += 1) {
	    type = typeList[index];
	
	    if ((type.instanceOf  || type.predicate) &&
	        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
	        (!type.predicate  || type.predicate(object))) {
	
	      state.tag = explicit ? type.tag : '?';
	
	      if (type.represent) {
	        style = state.styleMap[type.tag] || type.defaultStyle;
	
	        if (_toString.call(type.represent) === '[object Function]') {
	          _result = type.represent(object, style);
	        } else if (_hasOwnProperty.call(type.represent, style)) {
	          _result = type.represent[style](object, style);
	        } else {
	          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
	        }
	
	        state.dump = _result;
	      }
	
	      return true;
	    }
	  }
	
	  return false;
	}
	
	// Serializes `object` and writes it to global `result`.
	// Returns true on success, or false on invalid object.
	//
	function writeNode(state, level, object, block, compact, iskey) {
	  state.tag = null;
	  state.dump = object;
	
	  if (!detectType(state, object, false)) {
	    detectType(state, object, true);
	  }
	
	  var type = _toString.call(state.dump);
	
	  if (block) {
	    block = (state.flowLevel < 0 || state.flowLevel > level);
	  }
	
	  var objectOrArray = type === '[object Object]' || type === '[object Array]',
	      duplicateIndex,
	      duplicate;
	
	  if (objectOrArray) {
	    duplicateIndex = state.duplicates.indexOf(object);
	    duplicate = duplicateIndex !== -1;
	  }
	
	  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
	    compact = false;
	  }
	
	  if (duplicate && state.usedDuplicates[duplicateIndex]) {
	    state.dump = '*ref_' + duplicateIndex;
	  } else {
	    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
	      state.usedDuplicates[duplicateIndex] = true;
	    }
	    if (type === '[object Object]') {
	      if (block && (Object.keys(state.dump).length !== 0)) {
	        writeBlockMapping(state, level, state.dump, compact);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + state.dump;
	        }
	      } else {
	        writeFlowMapping(state, level, state.dump);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
	        }
	      }
	    } else if (type === '[object Array]') {
	      if (block && (state.dump.length !== 0)) {
	        writeBlockSequence(state, level, state.dump, compact);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + state.dump;
	        }
	      } else {
	        writeFlowSequence(state, level, state.dump);
	        if (duplicate) {
	          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
	        }
	      }
	    } else if (type === '[object String]') {
	      if (state.tag !== '?') {
	        writeScalar(state, state.dump, level, iskey);
	      }
	    } else {
	      if (state.skipInvalid) return false;
	      throw new YAMLException('unacceptable kind of an object to dump ' + type);
	    }
	
	    if (state.tag !== null && state.tag !== '?') {
	      state.dump = '!<' + state.tag + '> ' + state.dump;
	    }
	  }
	
	  return true;
	}
	
	function getDuplicateReferences(object, state) {
	  var objects = [],
	      duplicatesIndexes = [],
	      index,
	      length;
	
	  inspectNode(object, objects, duplicatesIndexes);
	
	  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
	    state.duplicates.push(objects[duplicatesIndexes[index]]);
	  }
	  state.usedDuplicates = new Array(length);
	}
	
	function inspectNode(object, objects, duplicatesIndexes) {
	  var objectKeyList,
	      index,
	      length;
	
	  if (object !== null && typeof object === 'object') {
	    index = objects.indexOf(object);
	    if (index !== -1) {
	      if (duplicatesIndexes.indexOf(index) === -1) {
	        duplicatesIndexes.push(index);
	      }
	    } else {
	      objects.push(object);
	
	      if (Array.isArray(object)) {
	        for (index = 0, length = object.length; index < length; index += 1) {
	          inspectNode(object[index], objects, duplicatesIndexes);
	        }
	      } else {
	        objectKeyList = Object.keys(object);
	
	        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
	        }
	      }
	    }
	  }
	}
	
	function dump(input, options) {
	  options = options || {};
	
	  var state = new State(options);
	
	  if (!state.noRefs) getDuplicateReferences(input, state);
	
	  if (writeNode(state, 0, input, true, true)) return state.dump + '\n';
	
	  return '';
	}
	
	function safeDump(input, options) {
	  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
	}
	
	module.exports.dump     = dump;
	module.exports.safeDump = safeDump;


/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = {
	  cloneDeep: __webpack_require__(81),
	  isUndefined: __webpack_require__(115),
	  isEmpty: __webpack_require__(118),
	  isObject: __webpack_require__(10)
	};
	var helpers = __webpack_require__(3);
	var Model = __webpack_require__(116);
	var SwaggerHttp = __webpack_require__(154);
	var Q = __webpack_require__(160);
	
	var Operation = module.exports = function (parent, scheme, operationId, httpMethod, path, args, definitions, models, clientAuthorizations) {
	  var errors = [];
	
	  parent = parent || {};
	  args = args || {};
	
	  if(parent && parent.options) {
	    this.client = parent.options.client || null;
	    this.requestInterceptor = parent.options.requestInterceptor || null;
	    this.responseInterceptor = parent.options.responseInterceptor || null;
	  }
	  this.authorizations = args.security;
	  this.basePath = parent.basePath || '/';
	  this.clientAuthorizations = clientAuthorizations;
	  this.consumes = args.consumes || parent.consumes || ['application/json'];
	  this.produces = args.produces || parent.produces || ['application/json'];
	  this.deprecated = args.deprecated;
	  this.description = args.description;
	  this.host = parent.host;
	  this.method = (httpMethod || errors.push('Operation ' + operationId + ' is missing method.'));
	  this.models = models || {};
	  this.nickname = (operationId || errors.push('Operations must have a nickname.'));
	  this.operation = args;
	  this.operations = {};
	  this.parameters = args !== null ? (args.parameters || []) : {};
	  this.parent = parent;
	  this.path = (path || errors.push('Operation ' + this.nickname + ' is missing path.'));
	  this.responses = (args.responses || {});
	  this.scheme = scheme || parent.scheme || 'http';
	  this.schemes = args.schemes || parent.schemes;
	  this.security = args.security || parent.security;
	  this.summary = args.summary || '';
	  this.timeout = parent.timeout;
	  this.type = null;
	  this.useJQuery = parent.useJQuery;
	  this.jqueryAjaxCache = parent.jqueryAjaxCache;
	  this.enableCookies = parent.enableCookies;
	
	  var key;
	
	  if(!this.host) {
	    if(typeof window !== 'undefined') {
	      this.host = window.location.host;
	    }
	    else {
	      this.host = 'localhost';
	    }
	  }
	  this.parameterMacro = parent.parameterMacro || function (operation, parameter) {
	    return parameter.default;
	  };
	
	  this.inlineModels = [];
	
	  if(this.basePath !== '/' && this.basePath.slice(-1) === '/') {
	    this.basePath = this.basePath.slice(0, -1);
	  }
	
	  if (typeof this.deprecated === 'string') {
	    switch(this.deprecated.toLowerCase()) {
	      case 'true': case 'yes': case '1': {
	        this.deprecated = true;
	        break;
	      }
	
	      case 'false': case 'no': case '0': case null: {
	        this.deprecated = false;
	        break;
	      }
	
	      default: this.deprecated = Boolean(this.deprecated);
	    }
	  }
	
	  var i, model;
	
	  if (definitions) {
	    // add to global models
	    for (key in definitions) {
	      model = new Model(key, definitions[key], this.models, parent.modelPropertyMacro);
	
	      if (model) {
	        this.models[key] = model;
	      }
	    }
	  }
	  else {
	    definitions = {};
	  }
	
	  for (i = 0; i < this.parameters.length; i++) {
	    var d, param = this.parameters[i];
	
	    // Allow macro to set the default value
	    param.default = this.parameterMacro(this, param);
	
	    if (param.type === 'array') {
	      param.isList = true;
	      param.allowMultiple = true;
	    }
	
	    var innerType = this.getType(param);
	
	    if (innerType && innerType.toString().toLowerCase() === 'boolean') {
	      param.allowableValues = {};
	      param.isList = true;
	      param['enum'] = [true, false]; // use actual primitives
	    }
	
	    for(key in param) {
	      helpers.extractExtensions(key, param);
	    }
	    if(typeof param['x-example'] !== 'undefined') {
	      d = param['x-example'];
	      param.default = d;
	    }
	    if(param['x-examples']) {
	      d = param['x-examples'].default;
	      if(typeof d !== 'undefined') {
	        param.default = d;
	      }
	    }
	
	    var enumValues = param['enum'] || (param.items && param.items['enum']);
	
	    if (typeof enumValues !== 'undefined') {
	      var id;
	
	      param.allowableValues = {};
	      param.allowableValues.values = [];
	      param.allowableValues.descriptiveValues = [];
	
	      for (id = 0; id < enumValues.length; id++) {
	        var value = enumValues[id];
	        var isDefault = (value === param.default || value+'' === param.default);
	
	        param.allowableValues.values.push(value);
	        // Always have string for descriptive values....
	        param.allowableValues.descriptiveValues.push({value : value+'', isDefault: isDefault});
	      }
	    }
	
	    if (param.type === 'array') {
	      innerType = [innerType];
	
	      if (typeof param.allowableValues === 'undefined') {
	        // can't show as a list if no values to select from
	        delete param.isList;
	        delete param.allowMultiple;
	      }
	    }
	
	    param.modelSignature = {type: innerType, definitions: this.models};
	    param.signature = this.getModelSignature(innerType, this.models).toString();
	    param.sampleJSON = this.getModelSampleJSON(innerType, this.models);
	    param.responseClassSignature = param.signature;
	  }
	
	  var keyname, defaultResponseCode, response, responses = this.responses;
	
	  if (responses['200']) {
	    response = responses['200'];
	    defaultResponseCode = '200';
	  } else if (responses['201']) {
	    response = responses['201'];
	    defaultResponseCode = '201';
	  } else if (responses['202']) {
	    response = responses['202'];
	    defaultResponseCode = '202';
	  } else if (responses['203']) {
	    response = responses['203'];
	    defaultResponseCode = '203';
	  } else if (responses['204']) {
	    response = responses['204'];
	    defaultResponseCode = '204';
	  } else if (responses['205']) {
	    response = responses['205'];
	    defaultResponseCode = '205';
	  } else if (responses['206']) {
	    response = responses['206'];
	    defaultResponseCode = '206';
	  } else if (responses['default']) {
	    response = responses['default'];
	    defaultResponseCode = 'default';
	  }
	
	  for(keyname in responses) {
	    helpers.extractExtensions(keyname, responses);
	    if(typeof keyname === 'string' && keyname.indexOf('x-') === -1) {
	      var responseObject = responses[keyname];
	      if(typeof responseObject === 'object' && typeof responseObject.headers === 'object') {
	        var headers = responseObject.headers;
	        for(var headerName in headers) {
	          var header = headers[headerName];
	          if(typeof header === 'object') {
	            for(var headerKey in header) {
	              helpers.extractExtensions(headerKey, header);
	            }
	          }
	        }
	      }
	    }
	  }
	
	  if (response) {
	    for(keyname in response) {
	      helpers.extractExtensions(keyname, response);
	    }
	  }
	
	  if (response && response.schema) {
	    var resolvedModel = this.resolveModel(response.schema, definitions);
	    var successResponse;
	
	    delete responses[defaultResponseCode];
	
	    if (resolvedModel) {
	      this.successResponse = {};
	      successResponse = this.successResponse[defaultResponseCode] = resolvedModel;
	    } else if (!response.schema.type || response.schema.type === 'object' || response.schema.type === 'array') {
	      // Inline model
	      this.successResponse = {};
	      successResponse = this.successResponse[defaultResponseCode] = new Model(undefined, response.schema || {}, this.models, parent.modelPropertyMacro);
	    } else {
	      // Primitive
	      this.successResponse = {};
	      successResponse = this.successResponse[defaultResponseCode] = response.schema;
	    }
	
	    if (successResponse) {
	      successResponse.vendorExtensions = response.vendorExtensions;
	      // Attach response properties
	      if (response.description) {
	        successResponse.description = response.description;
	      }
	
	      if (response.examples) {
	        successResponse.examples = response.examples;
	      }
	
	      if (response.headers) {
	        successResponse.headers = response.headers;
	      }
	    }
	
	    this.type = response;
	  }
	
	  if (errors.length > 0) {
	    if (this.resource && this.resource.api && this.resource.api.fail) {
	      this.resource.api.fail(errors);
	    }
	  }
	
	  return this;
	};
	
	Operation.prototype.isDefaultArrayItemValue = function(value, param) {
	  if (param.default && Array.isArray(param.default)) {
	    return param.default.indexOf(value) !== -1;
	  }
	  return value === param.default;
	};
	
	Operation.prototype.getType = function (param) {
	  var type = param.type;
	  var format = param.format;
	  var isArray = false;
	  var str;
	
	  if (type === 'integer' && format === 'int32') {
	    str = 'integer';
	  } else if (type === 'integer' && format === 'int64') {
	    str = 'long';
	  } else if (type === 'integer') {
	    str = 'integer';
	  } else if (type === 'string') {
	    if (format === 'date-time') {
	      str = 'date-time';
	    } else if (format === 'date') {
	      str = 'date';
	    } else {
	      str = 'string';
	    }
	  } else if (type === 'number' && format === 'float') {
	    str = 'float';
	  } else if (type === 'number' && format === 'double') {
	    str = 'double';
	  } else if (type === 'number') {
	    str = 'double';
	  } else if (type === 'boolean') {
	    str = 'boolean';
	  } else if (type === 'array') {
	    isArray = true;
	
	    if (param.items) {
	      str = this.getType(param.items);
	    }
	  } else if (type === 'file') {
	    str = 'file';
	  }
	
	  if (param.$ref) {
	    str = helpers.simpleRef(param.$ref);
	  }
	
	  var schema = param.schema;
	
	  if (schema) {
	    var ref = schema.$ref;
	
	    if (ref) {
	      ref = helpers.simpleRef(ref);
	
	      if (isArray) {
	        return [ ref ];
	      } else {
	        return ref;
	      }
	    } else {
	      // If inline schema, we add it our interal hash -> which gives us it's ID (int)
	      if(schema.type === 'object') {
	        return this.addInlineModel(schema);
	      }
	      return this.getType(schema);
	    }
	  }
	  if (isArray) {
	    return [ str ];
	  } else {
	    return str;
	  }
	};
	
	/**
	 * adds an inline schema (model) to a hash, where we can ref it later
	 * @param {object} schema a schema
	 * @return {number} the ID of the schema being added, or null
	 **/
	Operation.prototype.addInlineModel = function (schema) {
	  var len = this.inlineModels.length;
	  var model = this.resolveModel(schema, {});
	  if(model) {
	    this.inlineModels.push(model);
	    return 'Inline Model '+len; // return string ref of the inline model (used with #getInlineModel)
	  }
	  return null; // report errors?
	};
	
	/**
	 * gets the internal ref to an inline model
	 * @param {string} inline_str a string reference to an inline model
	 * @return {Model} the model being referenced. Or null
	 **/
	Operation.prototype.getInlineModel = function(inlineStr) {
	  if(/^Inline Model \d+$/.test(inlineStr)) {
	    var id = parseInt(inlineStr.substr('Inline Model'.length).trim(),10); //
	    var model = this.inlineModels[id];
	    return model;
	  }
	  // I'm returning null here, should I rather throw an error?
	  return null;
	};
	
	Operation.prototype.resolveModel = function (schema, definitions) {
	  if (typeof schema.$ref !== 'undefined') {
	    var ref = schema.$ref;
	
	    if (ref.indexOf('#/definitions/') === 0) {
	      ref = ref.substring('#/definitions/'.length);
	    }
	
	    if (definitions[ref]) {
	      return new Model(ref, definitions[ref], this.models, this.parent.modelPropertyMacro);
	    }
	  // schema must at least be an object to get resolved to an inline Model
	  } else if (schema && typeof schema === 'object' &&
	            (schema.type === 'object' || _.isUndefined(schema.type))) {
	    return new Model(undefined, schema, this.models, this.parent.modelPropertyMacro);
	  }
	
	  return null;
	};
	
	Operation.prototype.help = function (dontPrint) {
	  var out = this.nickname + ': ' + this.summary + '\n';
	
	  for (var i = 0; i < this.parameters.length; i++) {
	    var param = this.parameters[i];
	    var typeInfo = param.signature;
	
	    out += '\n  * ' + param.name + ' (' + typeInfo + '): ' + param.description;
	  }
	
	  if (typeof dontPrint === 'undefined') {
	    helpers.log(out);
	  }
	
	  return out;
	};
	
	Operation.prototype.getModelSignature = function (type, definitions) {
	  var isPrimitive, listType;
	
	  if (type instanceof Array) {
	    listType = true;
	    type = type[0];
	  }
	
	  // Convert undefined to string of 'undefined'
	  if (typeof type === 'undefined') {
	    type = 'undefined';
	    isPrimitive = true;
	
	  } else if (definitions[type]){
	    // a model def exists?
	    type = definitions[type]; /* Model */
	    isPrimitive = false;
	
	  } else if (this.getInlineModel(type)) {
	    type = this.getInlineModel(type); /* Model */
	    isPrimitive = false;
	
	  } else {
	    // We default to primitive
	    isPrimitive = true;
	  }
	
	  if (isPrimitive) {
	    if (listType) {
	      return 'Array[' + type + ']';
	    } else {
	      return type.toString();
	    }
	  } else {
	    if (listType) {
	      return 'Array[' + type.getMockSignature() + ']';
	    } else {
	      return type.getMockSignature();
	    }
	  }
	};
	
	Operation.prototype.supportHeaderParams = function () {
	  return true;
	};
	
	Operation.prototype.supportedSubmitMethods = function () {
	  return this.parent.supportedSubmitMethods;
	};
	
	Operation.prototype.getHeaderParams = function (args) {
	  var headers = this.setContentTypes(args, {});
	  var headerParamsByLowerCase = {};
	
	  for (var i = 0; i < this.parameters.length; i++) {
	    var param = this.parameters[i];
	
	    if (param.in === 'header') {
	      headerParamsByLowerCase[param.name.toLowerCase()] = param;
	    }
	  }
	
	  for (var arg in args) {
	    var headerParam = headerParamsByLowerCase[arg.toLowerCase()];
	    if (typeof headerParam !== 'undefined') {
	      var value = args[arg];
	
	      if (Array.isArray(value)) {
	        value = value.toString();
	      }
	
	      headers[headerParam.name] = value;
	    }
	  }
	
	  return headers;
	};
	
	Operation.prototype.urlify = function (args) {
	  var formParams = {};
	  var requestUrl = this.path.replace(/#.*/, ''); // remove URL fragment
	  var querystring = ''; // grab params from the args, build the querystring along the way
	
	  for (var i = 0; i < this.parameters.length; i++) {
	    var param = this.parameters[i];
	
	    if (typeof args[param.name] !== 'undefined') {
	      if (param.in === 'path') {
	        var reg = new RegExp('\{' + param.name + '\}', 'gi');
	        var value = args[param.name];
	
	        if (Array.isArray(value)) {
	          value = this.encodePathCollection(param.collectionFormat, param.name, value);
	        } else {
	          value = this.encodePathParam(value);
	        }
	
	        requestUrl = requestUrl.replace(reg, value);
	      } else if (param.in === 'query' && typeof args[param.name] !== 'undefined') {
	        if (querystring === '' && requestUrl.indexOf('?') < 0) {
	          querystring += '?';
	        } else {
	          querystring += '&';
	        }
	
	        if (typeof param.collectionFormat !== 'undefined') {
	          var qp = args[param.name];
	
	          if (Array.isArray(qp)) {
	            querystring += this.encodeQueryCollection(param.collectionFormat, param.name, qp);
	          } else {
	            querystring += this.encodeQueryKey(param.name) + '=' + this.encodeQueryParam(args[param.name]);
	          }
	        } else {
	          querystring += this.encodeQueryKey(param.name) + '=' + this.encodeQueryParam(args[param.name]);
	        }
	      } else if (param.in === 'formData') {
	        formParams[param.name] = args[param.name];
	      }
	    }
	  }
	  var url = this.scheme + '://' + this.host;
	
	  if (this.basePath !== '/') {
	    url += this.basePath;
	  }
	  return url + requestUrl + querystring;
	};
	
	Operation.prototype.getMissingParams = function (args) {
	  var missingParams = []; // check required params, track the ones that are missing
	  var i;
	
	  for (i = 0; i < this.parameters.length; i++) {
	    var param = this.parameters[i];
	
	    if (param.required === true) {
	      if (typeof args[param.name] === 'undefined') {
	        missingParams = param.name;
	      }
	    }
	  }
	
	  return missingParams;
	};
	
	Operation.prototype.getBody = function (headers, args) {
	  var formParams = {}, hasFormParams, param, body, key, value, hasBody = false;
	
	  // look at each param and put form params in an object
	  for (var i = 0; i < this.parameters.length; i++) {
	    param = this.parameters[i];
	    if (typeof args[param.name] !== 'undefined') {
	      if (param.in === 'body') {
	        body = args[param.name];
	      } else if (param.in === 'formData') {
	        formParams[param.name] = {
	          param: param,
	          value: args[param.name]
	        };
	        hasFormParams = true;
	      }
	    }
	    else {
	      if(param.in === 'body') {
	        hasBody = true;
	      }
	    }
	  }
	
	  // if body is null and hasBody is true, AND a JSON body is requested, send empty {}
	  if(hasBody && typeof body === 'undefined') {
	    var contentType = headers['Content-Type'];
	    if(contentType && contentType.indexOf('application/json') === 0) {
	      body = '{}';
	    }
	  }
	
	  var isMultiPart = false;
	  if(headers['Content-Type'] && headers['Content-Type'].indexOf('multipart/form-data') >= 0) {
	    isMultiPart = true;
	  }
	
	  // handle form params
	  if (hasFormParams && !isMultiPart) {
	    var encoded = '';
	
	    for (key in formParams) {
	      param = formParams[key].param;
	      value = formParams[key].value;
	
	      if (typeof value !== 'undefined') {
	        if (Array.isArray(value)) {
	          if (encoded !== '') {
	            encoded += '&';
	          }
	          encoded += this.encodeQueryCollection(param.collectionFormat, key, value);
	        }
	        else {
	          if (encoded !== '') {
	            encoded += '&';
	          }
	
	          encoded += encodeURIComponent(key) + '=' + encodeURIComponent(value);
	        }
	      }
	    }
	
	    body = encoded;
	  } else if (isMultiPart) {
	    var bodyParam;
	    if (typeof FormData === 'function') {
	      bodyParam = new FormData();
	
	      bodyParam.type = 'formData';
	
	      for (key in formParams) {
	        param = formParams[key].param;
	        value = args[key];
	
	        if (typeof value !== 'undefined') {
	          if({}.toString.apply(value) === '[object File]') {
	            bodyParam.append(key, value);
	          }
	          else if (value.type === 'file' && value.value) {
	            bodyParam.append(key, value.value);
	          } else {
	            if (Array.isArray(value)) {
	              if(param.collectionFormat === 'multi') {
	                bodyParam.delete(key);
	                for(var v in value) {
	                  bodyParam.append(key, value[v]);
	                }
	              }
	              else {
	                bodyParam.append(key, this.encodeQueryCollection(param.collectionFormat, key, value).split('=').slice(1).join('='));
	              }
	            }
	            else {
	              bodyParam.append(key, value);
	            }
	          }
	        }
	      }
	      body = bodyParam;
	    }
	    else {
	      bodyParam = {};
	      for (key in formParams) {
	        value = args[key];
	        if (Array.isArray(value)) {
	          var delimeter;
	          var format = param.collectionFormat || 'multi';
	          if(format === 'ssv') {
	            delimeter = ' ';
	          }
	          else if(format === 'pipes') {
	            delimeter = '|';
	          }
	          else if(format === 'tsv') {
	            delimeter = '\t';
	          }
	          else if(format === 'multi') {
	            bodyParam[key] = value;
	            break;
	          }
	          else {
	            delimeter = ',';
	          }
	          var data;
	          value.forEach(function(v) {
	            if(data) {
	              data += delimeter;
	            }
	            else {
	              data = '';
	            }
	            data += v;
	          });
	          bodyParam[key] = data;
	        }
	        else {
	          bodyParam[key] = value;
	        }
	      }
	      body = bodyParam;
	    }
	    headers['Content-Type'] = 'multipart/form-data';
	  }
	
	  return body;
	};
	
	/**
	 * gets sample response for a single operation
	 **/
	Operation.prototype.getModelSampleJSON = function (type, models) {
	  var listType, sampleJson, innerType;
	  models = models || {};
	
	  listType = (type instanceof Array);
	  innerType = listType ? type[0] : type;
	
	  if(models[innerType]) {
	    sampleJson = models[innerType].createJSONSample();
	  } else if (this.getInlineModel(innerType)){
	    sampleJson = this.getInlineModel(innerType).createJSONSample(); // may return null, if type isn't correct
	  }
	
	
	  if (sampleJson) {
	    sampleJson = listType ? [sampleJson] : sampleJson;
	
	    if (typeof sampleJson === 'string') {
	      return sampleJson;
	    } else if (_.isObject(sampleJson)) {
	      var t = sampleJson;
	
	      if (sampleJson instanceof Array && sampleJson.length > 0) {
	        t = sampleJson[0];
	      }
	
	      if (t.nodeName && typeof t === 'Node') {
	        var xmlString = new XMLSerializer().serializeToString(t);
	
	        return this.formatXml(xmlString);
	      } else {
	        return JSON.stringify(sampleJson, null, 2);
	      }
	    } else {
	      return sampleJson;
	    }
	  }
	};
	
	/**
	 * legacy binding
	 **/
	Operation.prototype.do = function (args, opts, callback, error, parent) {
	  return this.execute(args, opts, callback, error, parent);
	};
	
	/**
	 * executes an operation
	 **/
	Operation.prototype.execute = function (arg1, arg2, arg3, arg4, parent) {
	  var args = arg1 || {};
	  var opts = {}, success, error, deferred, timeout;
	
	  if (_.isObject(arg2)) {
	    opts = arg2;
	    success = arg3;
	    error = arg4;
	  }
	
	  timeout = typeof opts.timeout !== 'undefined' ? opts.timeout : this.timeout;
	
	  if(this.client) {
	    opts.client = this.client;
	  }
	
	  // add the request interceptor from parent, if none sent from client
	  if(!opts.requestInterceptor && this.requestInterceptor ) {
	    opts.requestInterceptor = this.requestInterceptor ;
	  }
	
	  if(!opts.responseInterceptor && this.responseInterceptor) {
	    opts.responseInterceptor = this.responseInterceptor;
	  }
	
	  if (typeof arg2 === 'function') {
	    success = arg2;
	    error = arg3;
	  }
	
	  if (this.parent.usePromise) {
	    deferred = Q.defer();
	  } else {
	    success = (success || this.parent.defaultSuccessCallback || helpers.log);
	    error = (error || this.parent.defaultErrorCallback || helpers.log);
	  }
	
	  if (typeof opts.useJQuery === 'undefined') {
	    opts.useJQuery = this.useJQuery;
	  }
	
	  if (typeof opts.jqueryAjaxCache === 'undefined') {
	    opts.jqueryAjaxCache = this.jqueryAjaxCache;
	  }
	
	  if (typeof opts.enableCookies === 'undefined') {
	    opts.enableCookies = this.enableCookies;
	  }
	
	  var missingParams = this.getMissingParams(args);
	
	  if (missingParams.length > 0) {
	    var message = 'missing required params: ' + missingParams;
	
	    helpers.fail(message);
	
	    if (this.parent.usePromise) {
	      deferred.reject(message);
	      return deferred.promise;
	    } else {
	      error(message, parent);
	      return {};
	    }
	  }
	
	  var allHeaders = this.getHeaderParams(args);
	  var contentTypeHeaders = this.setContentTypes(args, opts);
	  var headers = {}, attrname;
	
	  for (attrname in allHeaders) { headers[attrname] = allHeaders[attrname]; }
	  for (attrname in contentTypeHeaders) { headers[attrname] = contentTypeHeaders[attrname]; }
	
	  var body = this.getBody(contentTypeHeaders, args, opts);
	  var url = this.urlify(args);
	
	  if(url.indexOf('.{format}') > 0) {
	    if(headers) {
	      var format = headers.Accept || headers.accept;
	      if(format && format.indexOf('json') > 0) {
	        url = url.replace('.{format}', '.json');
	      }
	      else if(format && format.indexOf('xml') > 0) {
	        url = url.replace('.{format}', '.xml');
	      }
	    }
	  }
	
	  var obj = {
	    url: url,
	    method: this.method.toUpperCase(),
	    body: body,
	    enableCookies: opts.enableCookies,
	    useJQuery: opts.useJQuery,
	    jqueryAjaxCache: opts.jqueryAjaxCache,
	    deferred: deferred,
	    headers: headers,
	    clientAuthorizations: opts.clientAuthorizations,
	    on: {
	      response: function (response) {
	        if (deferred) {
	          deferred.resolve(response);
	          return deferred.promise;
	        } else {
	          return success(response, parent);
	        }
	      },
	      error: function (response) {
	        if (deferred) {
	          deferred.reject(response);
	          return deferred.promise;
	        } else {
	          return error(response, parent);
	        }
	      }
	    }
	  };
	
	  if (timeout) {
	    obj.timeout = timeout;
	  }
	
	  this.clientAuthorizations.apply(obj, this.operation.security);
	  if (opts.mock === true) {
	    return obj;
	  } else {
	    return new SwaggerHttp().execute(obj, opts);
	  }
	};
	
	function itemByPriority(col, itemPriority) {
	
	  // No priorities? return first...
	  if(_.isEmpty(itemPriority)) {
	    return col[0];
	  }
	
	  for (var i = 0, len = itemPriority.length; i < len; i++) {
	    if(col.indexOf(itemPriority[i]) > -1) {
	      return itemPriority[i];
	    }
	  }
	
	  // Otherwise return first
	  return col[0];
	}
	
	Operation.prototype.setContentTypes = function (args, opts) {
	  // default type
	  var allDefinedParams = this.parameters;
	  var body;
	  var consumes = args.parameterContentType || itemByPriority(this.consumes, ['application/json', 'application/yaml']);
	  var accepts = opts.responseContentType || itemByPriority(this.produces, ['application/json', 'application/yaml']);
	  var definedFileParams = [];
	  var definedFormParams = [];
	  var headers = {};
	  var i;
	
	  // get params from the operation and set them in definedFileParams, definedFormParams, headers
	  for (i = 0; i < allDefinedParams.length; i++) {
	    var param = allDefinedParams[i];
	
	    if (param.in === 'formData') {
	      if (param.type === 'file') {
	        definedFileParams.push(param);
	      } else {
	        definedFormParams.push(param);
	      }
	    } else if (param.in === 'header' && opts) {
	      var key = param.name;
	      var headerValue = opts[param.name];
	
	      if (typeof opts[param.name] !== 'undefined') {
	        headers[key] = headerValue;
	      }
	    } else if (param.in === 'body' && typeof args[param.name] !== 'undefined') {
	      body = args[param.name];
	    }
	  }
	
	  // if there's a body, need to set the consumes header via requestContentType
	  var hasBody = body || definedFileParams.length || definedFormParams.length;
	  if (this.method === 'post' || this.method === 'put' || this.method === 'patch' ||
	      ((this.method === 'delete' || this.method === 'get') && hasBody)) {
	    if (opts.requestContentType) {
	      consumes = opts.requestContentType;
	    }
	    // if any form params, content type must be set
	    if (definedFormParams.length > 0) {
	      consumes = undefined;
	      if (opts.requestContentType) {             // override if set
	        consumes = opts.requestContentType;
	      } else if (definedFileParams.length > 0) { // if a file, must be multipart/form-data
	        consumes = 'multipart/form-data';
	      } else {
	        if (this.consumes && this.consumes.length > 0) {
	          // use the consumes setting
	          for(var c in this.consumes) {
	            var chk = this.consumes[c];
	            if(chk.indexOf('application/x-www-form-urlencoded') === 0 || chk.indexOf('multipart/form-data') === 0) {
	              consumes = chk;
	            }
	          }
	        }
	      }
	      if(typeof consumes === 'undefined') {
	        // default to x-www-from-urlencoded
	        consumes = 'application/x-www-form-urlencoded';
	      }
	    }
	  }
	  else {
	    consumes = null;
	  }
	
	  if (consumes && this.consumes) {
	    if (this.consumes.indexOf(consumes) === -1) {
	      helpers.log('server doesn\'t consume ' + consumes + ', try ' + JSON.stringify(this.consumes));
	    }
	  }
	
	  if (!this.matchesAccept(accepts)) {
	    helpers.log('server can\'t produce ' + accepts);
	  }
	
	  if ((consumes && body !== '') || (consumes === 'application/x-www-form-urlencoded')) {
	    headers['Content-Type'] = consumes;
	  }
	  else if(this.consumes && this.consumes.length > 0 && this.consumes[0] === 'application/x-www-form-urlencoded') {
	    headers['Content-Type'] = this.consumes[0];
	  }
	
	  if (accepts) {
	    headers.Accept = accepts;
	  }
	
	  return headers;
	};
	
	/**
	 * Returns true if the request accepts header matches anything in this.produces.
	 *  If this.produces contains * / *, ignore the accept header.
	 * @param {string=} accepts The client request accept header.
	 * @return {boolean}
	 */
	Operation.prototype.matchesAccept = function(accepts) {
	  // no accepts or produces, no problem!
	  if (!accepts || !this.produces) {
	    return true;
	  }
	  return this.produces.indexOf(accepts) !== -1 || this.produces.indexOf('*/*') !== -1;
	};
	
	Operation.prototype.asCurl = function (args1, args2) {
	  var opts = {mock: true};
	  if (typeof args2 === 'object') {
	    for (var argKey in args2) {
	      opts[argKey] = args2[argKey];
	    }
	  }
	  var obj = this.execute(args1, opts);
	
	  this.clientAuthorizations.apply(obj, this.operation.security);
	
	  var results = [];
	
	  results.push('-X ' + this.method.toUpperCase());
	
	  if (typeof obj.headers !== 'undefined') {
	    var key;
	
	    for (key in obj.headers) {
	      var value = obj.headers[key];
	      if(typeof value === 'string'){
	        value = value.replace(/\'/g, '\\u0027');
	      }
	      results.push('--header \'' + key + ': ' + value + '\'');
	    }
	  }
	  var isFormData = false;
	  var isMultipart = false;
	
	  var type = obj.headers['Content-Type'];
	  if(type && type.indexOf('application/x-www-form-urlencoded') === 0) {
	    isFormData = true;
	  }
	  else if (type && type.indexOf('multipart/form-data') === 0) {
	    isFormData = true;
	    isMultipart = true;
	  }
	
	  if (obj.body) {
	    var body;
	    if (_.isObject(obj.body)) {
	      if(isMultipart) {
	        isMultipart = true;
	        // add the form data
	        for(var i = 0; i < this.parameters.length; i++) {
	          var parameter = this.parameters[i];
	          if(parameter.in === 'formData') {
	            if (!body) {
	              body = '';
	            }
	
	            var paramValue;
	            if(typeof FormData === 'function' && obj.body instanceof FormData) {
	              paramValue = obj.body.getAll(parameter.name);
	            }
	            else {
	              paramValue = obj.body[parameter.name];
	            }
	            if (paramValue) {
	              if (parameter.type === 'file') {
	                if(paramValue.name) {
	                  body += '-F ' + parameter.name + '=@"' + paramValue.name + '" ';
	                }
	              }
	              else {
	                if (Array.isArray(paramValue)) {
	                  if(parameter.collectionFormat === 'multi') {
	                    for(var v in paramValue) {
	                      body += '-F ' + this.encodeQueryKey(parameter.name) + '=' + paramValue[v] + ' ';
	                    }
	                  }
	                  else {
	                    body += '-F ' + this.encodeQueryCollection(parameter.collectionFormat, parameter.name, paramValue) + ' ';
	                  }
	                } else {
	                  body += '-F ' + this.encodeQueryKey(parameter.name) + '=' + paramValue + ' ';
	                }
	              }
	            }
	          }
	        }
	      }
	      if(!body) {
	        body = JSON.stringify(obj.body);
	      }
	    } else {
	      body = obj.body;
	    }
	    // escape @ => %40, ' => %27
	    body = body.replace(/\'/g, '%27').replace(/\n/g, ' \\ \n ');
	
	    if(!isFormData) {
	      // escape & => %26
	      body = body.replace(/&/g, '%26');
	    }
	    if(isMultipart) {
	      results.push(body);
	    }
	    else {
	      results.push('-d \'' + body.replace(/@/g, '%40') + '\'');
	    }
	  }
	
	  return 'curl ' + (results.join(' ')) + ' \'' + obj.url + '\'';
	};
	
	Operation.prototype.encodePathCollection = function (type, name, value) {
	  var encoded = '';
	  var i;
	  var separator = '';
	
	  if (type === 'ssv') {
	    separator = '%20';
	  } else if (type === 'tsv') {
	    separator = '%09';
	  } else if (type === 'pipes') {
	    separator = '|';
	  } else {
	    separator = ',';
	  }
	
	  for (i = 0; i < value.length; i++) {
	    if (i === 0) {
	      encoded = this.encodeQueryParam(value[i]);
	    } else {
	      encoded += separator + this.encodeQueryParam(value[i]);
	    }
	  }
	
	  return encoded;
	};
	
	Operation.prototype.encodeQueryCollection = function (type, name, value) {
	  var encoded = '';
	  var i;
	
	  type = type || 'default';
	  if (type === 'default' || type === 'multi') {
	    for (i = 0; i < value.length; i++) {
	      if (i > 0) {encoded += '&';}
	
	      encoded += this.encodeQueryKey(name) + '=' + this.encodeQueryParam(value[i]);
	    }
	  } else {
	    var separator = '';
	
	    if (type === 'csv') {
	      separator = ',';
	    } else if (type === 'ssv') {
	      separator = '%20';
	    } else if (type === 'tsv') {
	      separator = '%09';
	    } else if (type === 'pipes') {
	      separator = '|';
	    } else if (type === 'brackets') {
	      for (i = 0; i < value.length; i++) {
	        if (i !== 0) {
	          encoded += '&';
	        }
	
	        encoded += this.encodeQueryKey(name) + '[]=' + this.encodeQueryParam(value[i]);
	      }
	    }
	
	    if (separator !== '') {
	      for (i = 0; i < value.length; i++) {
	        if (i === 0) {
	          encoded = this.encodeQueryKey(name) + '=' + this.encodeQueryParam(value[i]);
	        } else {
	          encoded += separator + this.encodeQueryParam(value[i]);
	        }
	      }
	    }
	  }
	
	  return encoded;
	};
	
	Operation.prototype.encodeQueryKey = function (arg) {
	  return encodeURIComponent(arg)
	      .replace('%5B','[').replace('%5D', ']').replace('%24', '$');
	};
	
	Operation.prototype.encodeQueryParam = function (arg) {
	  return encodeURIComponent(arg);
	};
	
	/**
	 * TODO revisit, might not want to leave '/'
	 **/
	Operation.prototype.encodePathParam = function (pathParam) {
	  return encodeURIComponent(pathParam);
	};


/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {'use strict';
	
	var helpers = __webpack_require__(3);
	var request = __webpack_require__(155);
	var jsyaml = __webpack_require__(122);
	var _ = {
	  isObject: __webpack_require__(10),
	  keys: __webpack_require__(43)
	};
	
	/*
	 * JQueryHttpClient is a light-weight, node or browser HTTP client
	 */
	var JQueryHttpClient = function () {
	  this.type = 'JQueryHttpClient';
	};
	
	/*
	 * SuperagentHttpClient is a light-weight, node or browser HTTP client
	 */
	var SuperagentHttpClient = function () {
	  this.type = 'SuperagentHttpClient';
	};
	
	/**
	 * SwaggerHttp is a wrapper for executing requests
	 */
	var SwaggerHttp = module.exports = function () {};
	
	SwaggerHttp.prototype.execute = function (obj, opts) {
	  var client;
	
	  if(opts && opts.client) {
	    client = opts.client;
	  }
	  else {
	    client = new SuperagentHttpClient(opts);
	  }
	  client.opts = opts || {};
	
	  // legacy support
	  var hasJQuery = false;
	  if(typeof window !== 'undefined') {
	    if(typeof window.jQuery !== 'undefined') {
	      hasJQuery = true;
	    }
	  }
	  // OPTIONS support
	  if(obj.method.toLowerCase() === 'options' && client.type === 'SuperagentHttpClient') {
	    log('forcing jQuery as OPTIONS are not supported by SuperAgent');
	    obj.useJQuery = true;
	  }
	  if(this.isInternetExplorer() && (obj.useJQuery === false || !hasJQuery )) {
	    throw new Error('Unsupported configuration! JQuery is required but not available');
	  }
	  if ((obj && obj.useJQuery === true) || this.isInternetExplorer() && hasJQuery) {
	    client = new JQueryHttpClient(opts);
	  }
	
	  var success = obj.on.response;
	  var error = obj.on.error;
	
	  var requestInterceptor = function(data) {
	    if(opts && opts.requestInterceptor) {
	      data = opts.requestInterceptor.apply(data);
	    }
	    return data;
	  };
	
	  var responseInterceptor = function(data) {
	    if(opts && opts.responseInterceptor) {
	      data = opts.responseInterceptor.apply(data);
	    }
	    return success(data);
	  };
	
	  var errorInterceptor = function(data) {
	    if(opts && opts.responseInterceptor) {
	      data = opts.responseInterceptor.apply(data);
	    }
	    error(data);
	  };
	
	  obj.on.error = function(data) {
	    errorInterceptor(data);
	  };
	
	  obj.on.response = function(data) {
	    responseInterceptor(data);
	  };
	
	  if (_.isObject(obj) && _.isObject(obj.body)) {
	    // special processing for file uploads via jquery
	    if (obj.body.type && obj.body.type === 'formData'){
	      if(opts.useJQuery) {
	        obj.contentType = false;
	        obj.processData = false;
	        delete obj.headers['Content-Type'];
	      }
	    }
	  }
	
	  obj = requestInterceptor(obj) || obj;
	  if (obj.beforeSend) {
	    obj.beforeSend(function(_obj) {
	      client.execute(_obj || obj);
	    });
	  } else {
	    client.execute(obj);
	  }
	
	  return (obj.deferred) ? obj.deferred.promise : obj;
	};
	
	SwaggerHttp.prototype.isInternetExplorer = function () {
	  var detectedIE = false;
	
	  if (typeof navigator !== 'undefined' && navigator.userAgent) {
	    var nav = navigator.userAgent.toLowerCase();
	
	    if (nav.indexOf('msie') !== -1) {
	      var version = parseInt(nav.split('msie')[1]);
	
	      if (version <= 8) {
	        detectedIE = true;
	      }
	    }
	  }
	
	  return detectedIE;
	};
	
	JQueryHttpClient.prototype.execute = function (obj) {
	  var jq = this.jQuery || (typeof window !== 'undefined' && window.jQuery);
	  var cb = obj.on;
	  var request = obj;
	
	  if(typeof jq === 'undefined' || jq === false) {
	    throw new Error('Unsupported configuration! JQuery is required but not available');
	  }
	
	  obj.type = obj.method;
	  obj.cache = obj.jqueryAjaxCache;
	  obj.data = obj.body;
	  delete obj.jqueryAjaxCache;
	  delete obj.useJQuery;
	  delete obj.body;
	
	  obj.complete = function (response) {
	    var headers = {};
	    var headerArray = response.getAllResponseHeaders().split('\n');
	
	    for (var i = 0; i < headerArray.length; i++) {
	      var toSplit = headerArray[i].trim();
	
	      if (toSplit.length === 0) {
	        continue;
	      }
	
	      var separator = toSplit.indexOf(':');
	
	      if (separator === -1) {
	        // Name but no value in the header
	        headers[toSplit] = null;
	
	        continue;
	      }
	
	      var name = toSplit.substring(0, separator).trim();
	      var value = toSplit.substring(separator + 1).trim();
	
	      headers[name] = value;
	    }
	
	    var out = {
	      url: request.url,
	      method: request.method,
	      status: response.status,
	      statusText: response.statusText,
	      data: response.responseText,
	      headers: headers
	    };
	
	    try {
	      var possibleObj =  response.responseJSON || jsyaml.safeLoad(response.responseText);
	      out.obj = (typeof possibleObj === 'string') ? {} : possibleObj;
	    } catch (ex) {
	      // do not set out.obj
	      helpers.log('unable to parse JSON/YAML content');
	    }
	
	    // I can throw, or parse null?
	    out.obj = out.obj || null;
	
	    if (response.status >= 200 && response.status < 300) {
	      cb.response(out);
	    } else if (response.status === 0 || (response.status >= 400 && response.status < 599)) {
	      cb.error(out);
	    } else {
	      return cb.response(out);
	    }
	  };
	
	  jq.support.cors = true;
	
	  return jq.ajax(obj);
	};
	
	SuperagentHttpClient.prototype.execute = function (obj) {
	  var connectionAgent = obj.connectionAgent;
	  var method = obj.method.toLowerCase();
	  var timeout = obj.timeout;
	
	  if (method === 'delete') {
	    method = 'del';
	  }
	  var headers = obj.headers || {};
	  var r = request[method](obj.url);
	
	  if (connectionAgent) {
	    r.agent(connectionAgent);
	  }
	  
	  if (timeout) {
	    r.timeout(timeout);
	  }
	
	  if (obj.enableCookies) {
	    r.withCredentials();
	  }
	
	  var accept = obj.headers.Accept;
	
	  if(this.binaryRequest(accept)) {
	    r.on('request', function () {
	      if(this.xhr) {
	        this.xhr.responseType = 'blob';
	      }
	    });
	  }
	
	  if(obj.body) {
	    if(_.isObject(obj.body)) {
	      var contentType = obj.headers['Content-Type'] || '';
	      if (contentType.indexOf('multipart/form-data') === 0) {
	        delete headers['Content-Type'];
	        if({}.toString.apply(obj.body) === '[object FormData]') {
	          r.send(obj.body);
	        }
	        else {
	          var keyname, value, v;
	          for (keyname in obj.body) {
	            value = obj.body[keyname];
	            if(Array.isArray(value)) {
	              for(v in value) {
	                r.field(keyname, v);
	              }
	            }
	            else {
	              r.field(keyname, value);
	            }
	          }
	        }
	      }
	      else if (_.isObject(obj.body)) {
	        // non multipart/form-data
	        obj.body = JSON.stringify(obj.body);
	        r.send(obj.body);
	      }
	    }
	    else {
	      r.send(obj.body);
	    }
	  }
	
	  var name;
	  for (name in headers) {
	    r.set(name, headers[name]);
	  }
	
	  if(typeof r.buffer === 'function') {
	    r.buffer(); // force superagent to populate res.text with the raw response data
	  }
	
	  r.end(function (err, res) {
	    res = res || {
	      status: 0,
	      headers: {error: 'no response from server'}
	    };
	    var response = {
	      url: obj.url,
	      method: obj.method,
	      headers: res.headers
	    };
	    var cb;
	
	    if (!err && res.error) {
	      err = res.error;
	    }
	
	    if (err && obj.on && obj.on.error) {
	      response.errObj = err;
	      response.status = res ? res.status : 500;
	      response.statusText = res ? res.text : err.message;
	      if (res.headers && res.headers['content-type']) {
	        if (res.headers['content-type'].indexOf('application/json') >= 0) {
	          try {
	            response.obj = JSON.parse(response.statusText);
	          }
	          catch (e) {
	            response.obj = null;
	          }
	        }
	      }
	      cb = obj.on.error;
	    } else if (res && obj.on && obj.on.response) {
	      var possibleObj;
	
	      // Already parsed by by superagent?
	      if (res.body && _.keys(res.body).length > 0) {
	        possibleObj = res.body;
	      } else {
	        try {
	          possibleObj = jsyaml.safeLoad(res.text);
	          // can parse into a string... which we don't need running around in the system
	          possibleObj = (typeof possibleObj === 'string') ? null : possibleObj;
	        } catch (e) {
	          helpers.log('cannot parse JSON/YAML content');
	        }
	      }
	
	      // null means we can't parse into object
	      if(typeof Buffer === 'function' && Buffer.isBuffer(possibleObj)) {
	        response.data = possibleObj;
	      }
	      else {
	        response.obj = (typeof possibleObj === 'object') ? possibleObj : null;
	      }
	
	      response.status = res.status;
	      response.statusText = res.text;
	      cb = obj.on.response;
	    }
	    if (res.xhr && res.xhr.response) {
	      response.data = res.xhr.response;
	    }
	    else if(!response.data) {
	      response.data = response.statusText;
	    }
	
	    if (cb) {
	      cb(response);
	    }
	  });
	};
	
	SuperagentHttpClient.prototype. binaryRequest = function (accept) {
	  if(!accept) {
	    return false;
	  }
	  return (/^image/i).test(accept) || (/^application\/pdf/).test(accept);
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(34).Buffer))

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Root reference for iframes.
	 */
	
	var root;
	if (typeof window !== 'undefined') { // Browser window
	  root = window;
	} else if (typeof self !== 'undefined') { // Web Worker
	  root = self;
	} else { // Other environments
	  console.warn("Using browser-only version of superagent in non-browser environment");
	  root = this;
	}
	
	var Emitter = __webpack_require__(156);
	var requestBase = __webpack_require__(157);
	var isObject = __webpack_require__(158);
	
	/**
	 * Noop.
	 */
	
	function noop(){};
	
	/**
	 * Expose `request`.
	 */
	
	var request = module.exports = __webpack_require__(159).bind(null, Request);
	
	/**
	 * Determine XHR.
	 */
	
	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  throw Error("Browser-only verison of superagent could not find XHR");
	};
	
	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */
	
	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };
	
	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */
	
	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    pushEncodedKeyValuePair(pairs, key, obj[key]);
	  }
	  return pairs.join('&');
	}
	
	/**
	 * Helps 'serialize' with serializing arrays.
	 * Mutates the pairs array.
	 *
	 * @param {Array} pairs
	 * @param {String} key
	 * @param {Mixed} val
	 */
	
	function pushEncodedKeyValuePair(pairs, key, val) {
	  if (val != null) {
	    if (Array.isArray(val)) {
	      val.forEach(function(v) {
	        pushEncodedKeyValuePair(pairs, key, v);
	      });
	    } else if (isObject(val)) {
	      for(var subkey in val) {
	        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
	      }
	    } else {
	      pairs.push(encodeURIComponent(key)
	        + '=' + encodeURIComponent(val));
	    }
	  } else if (val === null) {
	    pairs.push(encodeURIComponent(key));
	  }
	}
	
	/**
	 * Expose serialization method.
	 */
	
	 request.serializeObject = serialize;
	
	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */
	
	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var pair;
	  var pos;
	
	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    pos = pair.indexOf('=');
	    if (pos == -1) {
	      obj[decodeURIComponent(pair)] = '';
	    } else {
	      obj[decodeURIComponent(pair.slice(0, pos))] =
	        decodeURIComponent(pair.slice(pos + 1));
	    }
	  }
	
	  return obj;
	}
	
	/**
	 * Expose parser.
	 */
	
	request.parseString = parseString;
	
	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */
	
	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};
	
	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */
	
	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };
	
	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */
	
	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};
	
	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;
	
	  lines.pop(); // trailing CRLF
	
	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }
	
	  return fields;
	}
	
	/**
	 * Check if `mime` is json or has +json structured syntax suffix.
	 *
	 * @param {String} mime
	 * @return {Boolean}
	 * @api private
	 */
	
	function isJSON(mime) {
	  return /[\/+]json\b/.test(mime);
	}
	
	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */
	
	function type(str){
	  return str.split(/ *; */).shift();
	};
	
	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function params(str){
	  return str.split(/ *; */).reduce(function(obj, str){
	    var parts = str.split(/ *= */),
	        key = parts.shift(),
	        val = parts.shift();
	
	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};
	
	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */
	
	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this._setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this._setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this._parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}
	
	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};
	
	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */
	
	Response.prototype._setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);
	
	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};
	
	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */
	
	Response.prototype._parseBody = function(str){
	  var parse = request.parse[this.type];
	  if (!parse && isJSON(this.type)) {
	    parse = request.parse['application/json'];
	  }
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};
	
	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */
	
	Response.prototype._setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }
	
	  var type = status / 100 | 0;
	
	  // status / class
	  this.status = this.statusCode = status;
	  this.statusType = type;
	
	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;
	
	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};
	
	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */
	
	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;
	
	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;
	
	  return err;
	};
	
	/**
	 * Expose `Response`.
	 */
	
	request.Response = Response;
	
	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */
	
	function Request(method, url) {
	  var self = this;
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {}; // preserves header name case
	  this._header = {}; // coerces header names to lowercase
	  this.on('end', function(){
	    var err = null;
	    var res = null;
	
	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      // issue #675: return the raw response if the response parsing fails
	      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
	      // issue #876: return the http status code if the response parsing fails
	      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
	      return self.callback(err);
	    }
	
	    self.emit('response', res);
	
	    var new_err;
	    try {
	      if (res.status < 200 || res.status >= 300) {
	        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	        new_err.original = err;
	        new_err.response = res;
	        new_err.status = res.status;
	      }
	    } catch(e) {
	      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
	    }
	
	    // #1000 don't catch errors from the callback to avoid double calling it
	    if (new_err) {
	      self.callback(new_err, res);
	    } else {
	      self.callback(null, res);
	    }
	  });
	}
	
	/**
	 * Mixin `Emitter` and `requestBase`.
	 */
	
	Emitter(Request.prototype);
	for (var key in requestBase) {
	  Request.prototype[key] = requestBase[key];
	}
	
	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set responseType to `val`. Presently valid responseTypes are 'blob' and
	 * 'arraybuffer'.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .responseType('blob')
	 *        .end(callback);
	 *
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.responseType = function(val){
	  this._responseType = val;
	  return this;
	};
	
	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.auth = function(user, pass, options){
	  if (!options) {
	    options = {
	      type: 'basic'
	    }
	  }
	
	  switch (options.type) {
	    case 'basic':
	      var str = btoa(user + ':' + pass);
	      this.set('Authorization', 'Basic ' + str);
	    break;
	
	    case 'auto':
	      this.username = user;
	      this.password = pass;
	    break;
	  }
	  return this;
	};
	
	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/
	
	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};
	
	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.attach = function(field, file, filename){
	  this._getFormData().append(field, file, filename || file.name);
	  return this;
	};
	
	Request.prototype._getFormData = function(){
	  if (!this._formData) {
	    this._formData = new root.FormData();
	  }
	  return this._formData;
	};
	
	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */
	
	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};
	
	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */
	
	Request.prototype.crossDomainError = function(){
	  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
	  err.crossDomain = true;
	
	  err.status = this.status;
	  err.method = this.method;
	  err.url = this.url;
	
	  this.callback(err);
	};
	
	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */
	
	Request.prototype._timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};
	
	/**
	 * Compose querystring to append to req.url
	 *
	 * @api private
	 */
	
	Request.prototype._appendQueryString = function(){
	  var query = this._query.join('&');
	  if (query) {
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }
	};
	
	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var timeout = this._timeout;
	  var data = this._formData || this._data;
	
	  // store callback
	  this._callback = fn || noop;
	
	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;
	
	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }
	
	    if (0 == status) {
	      if (self.timedout) return self._timeoutError();
	      if (self._aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };
	
	  // progress
	  var handleProgress = function(direction, e) {
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    e.direction = direction;
	    self.emit('progress', e);
	  }
	  if (this.hasListeners('progress')) {
	    try {
	      xhr.onprogress = handleProgress.bind(null, 'download');
	      if (xhr.upload) {
	        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
	      }
	    } catch(e) {
	      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	      // Reported here:
	      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	    }
	  }
	
	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }
	
	  // querystring
	  this._appendQueryString();
	
	  // initiate request
	  if (this.username && this.password) {
	    xhr.open(this.method, this.url, true, this.username, this.password);
	  } else {
	    xhr.open(this.method, this.url, true);
	  }
	
	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;
	
	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
	    // serialize stuff
	    var contentType = this._header['content-type'];
	    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
	    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
	    if (serialize) data = serialize(data);
	  }
	
	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }
	
	  if (this._responseType) {
	    xhr.responseType = this._responseType;
	  }
	
	  // send stuff
	  this.emit('request', this);
	
	  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
	  // We need null here if data is undefined
	  xhr.send(typeof data !== 'undefined' ? data : null);
	  return this;
	};
	
	
	/**
	 * Expose `Request`.
	 */
	
	request.Request = Request;
	
	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * OPTIONS query to `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.options = function(url, data, fn){
	  var req = request('OPTIONS', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	function del(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};
	
	request['del'] = del;
	request['delete'] = del;
	
	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} [data]
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} [data] or fn
	 * @param {Function} [fn]
	 * @return {Request}
	 * @api public
	 */
	
	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};


/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	if (true) {
	  module.exports = Emitter;
	}
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  function on() {
	    this.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks['$' + event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks['$' + event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks['$' + event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks['$' + event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module of mixed-in functions shared between node and client code
	 */
	var isObject = __webpack_require__(158);
	
	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */
	
	exports.clearTimeout = function _clearTimeout(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};
	
	/**
	 * Override default response body parser
	 *
	 * This function will be called to convert incoming data into request.body
	 *
	 * @param {Function}
	 * @api public
	 */
	
	exports.parse = function parse(fn){
	  this._parser = fn;
	  return this;
	};
	
	/**
	 * Override default request body serializer
	 *
	 * This function will be called to convert data set via .send or .attach into payload to send
	 *
	 * @param {Function}
	 * @api public
	 */
	
	exports.serialize = function serialize(fn){
	  this._serializer = fn;
	  return this;
	};
	
	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */
	
	exports.timeout = function timeout(ms){
	  this._timeout = ms;
	  return this;
	};
	
	/**
	 * Promise support
	 *
	 * @param {Function} resolve
	 * @param {Function} reject
	 * @return {Request}
	 */
	
	exports.then = function then(resolve, reject) {
	  if (!this._fullfilledPromise) {
	    var self = this;
	    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
	      self.end(function(err, res){
	        if (err) innerReject(err); else innerResolve(res);
	      });
	    });
	  }
	  return this._fullfilledPromise.then(resolve, reject);
	}
	
	exports.catch = function(cb) {
	  return this.then(undefined, cb);
	};
	
	/**
	 * Allow for extension
	 */
	
	exports.use = function use(fn) {
	  fn(this);
	  return this;
	}
	
	
	/**
	 * Get request header `field`.
	 * Case-insensitive.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	exports.get = function(field){
	  return this._header[field.toLowerCase()];
	};
	
	/**
	 * Get case-insensitive header `field` value.
	 * This is a deprecated internal API. Use `.get(field)` instead.
	 *
	 * (getHeader is no longer used internally by the superagent code base)
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 * @deprecated
	 */
	
	exports.getHeader = exports.get;
	
	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 * Case-insensitive.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	exports.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};
	
	/**
	 * Remove header `field`.
	 * Case-insensitive.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 */
	exports.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};
	
	/**
	 * Write the field `name` and `val`, or multiple fields with one object
	 * for "multipart/form-data" request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 *
	 * request.post('/upload')
	 *   .field({ foo: 'bar', baz: 'qux' })
	 *   .end(callback);
	 * ```
	 *
	 * @param {String|Object} name
	 * @param {String|Blob|File|Buffer|fs.ReadStream} val
	 * @return {Request} for chaining
	 * @api public
	 */
	exports.field = function(name, val) {
	
	  // name should be either a string or an object.
	  if (null === name ||  undefined === name) {
	    throw new Error('.field(name, val) name can not be empty');
	  }
	
	  if (isObject(name)) {
	    for (var key in name) {
	      this.field(key, name[key]);
	    }
	    return this;
	  }
	
	  // val should be defined now
	  if (null === val || undefined === val) {
	    throw new Error('.field(name, val) val can not be empty');
	  }
	  this._getFormData().append(name, val);
	  return this;
	};
	
	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	exports.abort = function(){
	  if (this._aborted) {
	    return this;
	  }
	  this._aborted = true;
	  this.xhr && this.xhr.abort(); // browser
	  this.req && this.req.abort(); // node
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};
	
	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */
	
	exports.withCredentials = function(){
	  // This is browser-only functionality. Node side is no-op.
	  this._withCredentials = true;
	  return this;
	};
	
	/**
	 * Set the max redirects to `n`. Does noting in browser XHR implementation.
	 *
	 * @param {Number} n
	 * @return {Request} for chaining
	 * @api public
	 */
	
	exports.redirects = function(n){
	  this._maxRedirects = n;
	  return this;
	};
	
	/**
	 * Convert to a plain javascript object (not JSON string) of scalar properties.
	 * Note as this method is designed to return a useful non-this value,
	 * it cannot be chained.
	 *
	 * @return {Object} describing method, url, and data of this request
	 * @api public
	 */
	
	exports.toJSON = function(){
	  return {
	    method: this.method,
	    url: this.url,
	    data: this._data,
	    headers: this._header
	  };
	};
	
	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	exports._isHost = function _isHost(obj) {
	  var str = {}.toString.call(obj);
	
	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}
	
	/**
	 * Send `data` as the request body, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"}')
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	 *      request.post('/user')
	 *        .send('name=tobi')
	 *        .send('species=ferret')
	 *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */
	
	exports.send = function(data){
	  var obj = isObject(data);
	  var type = this._header['content-type'];
	
	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    // default to x-www-form-urlencoded
	    if (!type) this.type('form');
	    type = this._header['content-type'];
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }
	
	  if (!obj || this._isHost(data)) return this;
	
	  // default to json
	  if (!type) this.type('json');
	  return this;
	};


/***/ },
/* 158 */
/***/ function(module, exports) {

	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isObject(obj) {
	  return null !== obj && 'object' === typeof obj;
	}
	
	module.exports = isObject;


/***/ },
/* 159 */
/***/ function(module, exports) {

	// The node and browser modules expose versions of this with the
	// appropriate constructor function bound as first argument
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */
	
	function request(RequestConstructor, method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new RequestConstructor('GET', method).end(url);
	  }
	
	  // url first
	  if (2 == arguments.length) {
	    return new RequestConstructor('GET', method);
	  }
	
	  return new RequestConstructor(method, url);
	}
	
	module.exports = request;


/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// vim:ts=4:sts=4:sw=4:
	/*!
	 *
	 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
	 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
	 *
	 * With parts by Tyler Close
	 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
	 * at http://www.opensource.org/licenses/mit-license.html
	 * Forked at ref_send.js version: 2009-05-11
	 *
	 * With parts by Mark Miller
	 * Copyright (C) 2011 Google Inc.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 */
	
	(function (definition) {
	    "use strict";
	
	    // This file will function properly as a <script> tag, or a module
	    // using CommonJS and NodeJS or RequireJS module formats.  In
	    // Common/Node/RequireJS, the module exports the Q API and when
	    // executed as a simple <script>, it creates a Q global instead.
	
	    // Montage Require
	    if (typeof bootstrap === "function") {
	        bootstrap("promise", definition);
	
	    // CommonJS
	    } else if (true) {
	        module.exports = definition();
	
	    // RequireJS
	    } else if (typeof define === "function" && define.amd) {
	        define(definition);
	
	    // SES (Secure EcmaScript)
	    } else if (typeof ses !== "undefined") {
	        if (!ses.ok()) {
	            return;
	        } else {
	            ses.makeQ = definition;
	        }
	
	    // <script>
	    } else if (typeof window !== "undefined" || typeof self !== "undefined") {
	        // Prefer window over self for add-on scripts. Use self for
	        // non-windowed contexts.
	        var global = typeof window !== "undefined" ? window : self;
	
	        // Get the `window` object, save the previous Q global
	        // and initialize Q as a global.
	        var previousQ = global.Q;
	        global.Q = definition();
	
	        // Add a noConflict function so Q can be removed from the
	        // global namespace.
	        global.Q.noConflict = function () {
	            global.Q = previousQ;
	            return this;
	        };
	
	    } else {
	        throw new Error("This environment was not anticipated by Q. Please file a bug.");
	    }
	
	})(function () {
	"use strict";
	
	var hasStacks = false;
	try {
	    throw new Error();
	} catch (e) {
	    hasStacks = !!e.stack;
	}
	
	// All code after this point will be filtered from stack traces reported
	// by Q.
	var qStartingLine = captureLine();
	var qFileName;
	
	// shims
	
	// used for fallback in "allResolved"
	var noop = function () {};
	
	// Use the fastest possible means to execute a task in a future turn
	// of the event loop.
	var nextTick =(function () {
	    // linked list of tasks (single, with head node)
	    var head = {task: void 0, next: null};
	    var tail = head;
	    var flushing = false;
	    var requestTick = void 0;
	    var isNodeJS = false;
	    // queue for late tasks, used by unhandled rejection tracking
	    var laterQueue = [];
	
	    function flush() {
	        /* jshint loopfunc: true */
	        var task, domain;
	
	        while (head.next) {
	            head = head.next;
	            task = head.task;
	            head.task = void 0;
	            domain = head.domain;
	
	            if (domain) {
	                head.domain = void 0;
	                domain.enter();
	            }
	            runSingle(task, domain);
	
	        }
	        while (laterQueue.length) {
	            task = laterQueue.pop();
	            runSingle(task);
	        }
	        flushing = false;
	    }
	    // runs a single function in the async queue
	    function runSingle(task, domain) {
	        try {
	            task();
	
	        } catch (e) {
	            if (isNodeJS) {
	                // In node, uncaught exceptions are considered fatal errors.
	                // Re-throw them synchronously to interrupt flushing!
	
	                // Ensure continuation if the uncaught exception is suppressed
	                // listening "uncaughtException" events (as domains does).
	                // Continue in next event to avoid tick recursion.
	                if (domain) {
	                    domain.exit();
	                }
	                setTimeout(flush, 0);
	                if (domain) {
	                    domain.enter();
	                }
	
	                throw e;
	
	            } else {
	                // In browsers, uncaught exceptions are not fatal.
	                // Re-throw them asynchronously to avoid slow-downs.
	                setTimeout(function () {
	                    throw e;
	                }, 0);
	            }
	        }
	
	        if (domain) {
	            domain.exit();
	        }
	    }
	
	    nextTick = function (task) {
	        tail = tail.next = {
	            task: task,
	            domain: isNodeJS && process.domain,
	            next: null
	        };
	
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	
	    if (typeof process === "object" &&
	        process.toString() === "[object process]" && process.nextTick) {
	        // Ensure Q is in a real Node environment, with a `process.nextTick`.
	        // To see through fake Node environments:
	        // * Mocha test runner - exposes a `process` global without a `nextTick`
	        // * Browserify - exposes a `process.nexTick` function that uses
	        //   `setTimeout`. In this case `setImmediate` is preferred because
	        //    it is faster. Browserify's `process.toString()` yields
	        //   "[object Object]", while in a real Node environment
	        //   `process.nextTick()` yields "[object process]".
	        isNodeJS = true;
	
	        requestTick = function () {
	            process.nextTick(flush);
	        };
	
	    } else if (typeof setImmediate === "function") {
	        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
	        if (typeof window !== "undefined") {
	            requestTick = setImmediate.bind(window, flush);
	        } else {
	            requestTick = function () {
	                setImmediate(flush);
	            };
	        }
	
	    } else if (typeof MessageChannel !== "undefined") {
	        // modern browsers
	        // http://www.nonblocking.io/2011/06/windownexttick.html
	        var channel = new MessageChannel();
	        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
	        // working message ports the first time a page loads.
	        channel.port1.onmessage = function () {
	            requestTick = requestPortTick;
	            channel.port1.onmessage = flush;
	            flush();
	        };
	        var requestPortTick = function () {
	            // Opera requires us to provide a message payload, regardless of
	            // whether we use it.
	            channel.port2.postMessage(0);
	        };
	        requestTick = function () {
	            setTimeout(flush, 0);
	            requestPortTick();
	        };
	
	    } else {
	        // old browsers
	        requestTick = function () {
	            setTimeout(flush, 0);
	        };
	    }
	    // runs a task after all other tasks have been run
	    // this is useful for unhandled rejection tracking that needs to happen
	    // after all `then`d tasks have been run.
	    nextTick.runAfter = function (task) {
	        laterQueue.push(task);
	        if (!flushing) {
	            flushing = true;
	            requestTick();
	        }
	    };
	    return nextTick;
	})();
	
	// Attempt to make generics safe in the face of downstream
	// modifications.
	// There is no situation where this is necessary.
	// If you need a security guarantee, these primordials need to be
	// deeply frozen anyway, and if you don’t need a security guarantee,
	// this is just plain paranoid.
	// However, this **might** have the nice side-effect of reducing the size of
	// the minified code by reducing x.call() to merely x()
	// See Mark Miller’s explanation of what this does.
	// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
	var call = Function.call;
	function uncurryThis(f) {
	    return function () {
	        return call.apply(f, arguments);
	    };
	}
	// This is equivalent, but slower:
	// uncurryThis = Function_bind.bind(Function_bind.call);
	// http://jsperf.com/uncurrythis
	
	var array_slice = uncurryThis(Array.prototype.slice);
	
	var array_reduce = uncurryThis(
	    Array.prototype.reduce || function (callback, basis) {
	        var index = 0,
	            length = this.length;
	        // concerning the initial value, if one is not provided
	        if (arguments.length === 1) {
	            // seek to the first value in the array, accounting
	            // for the possibility that is is a sparse array
	            do {
	                if (index in this) {
	                    basis = this[index++];
	                    break;
	                }
	                if (++index >= length) {
	                    throw new TypeError();
	                }
	            } while (1);
	        }
	        // reduce
	        for (; index < length; index++) {
	            // account for the possibility that the array is sparse
	            if (index in this) {
	                basis = callback(basis, this[index], index);
	            }
	        }
	        return basis;
	    }
	);
	
	var array_indexOf = uncurryThis(
	    Array.prototype.indexOf || function (value) {
	        // not a very good shim, but good enough for our one use of it
	        for (var i = 0; i < this.length; i++) {
	            if (this[i] === value) {
	                return i;
	            }
	        }
	        return -1;
	    }
	);
	
	var array_map = uncurryThis(
	    Array.prototype.map || function (callback, thisp) {
	        var self = this;
	        var collect = [];
	        array_reduce(self, function (undefined, value, index) {
	            collect.push(callback.call(thisp, value, index, self));
	        }, void 0);
	        return collect;
	    }
	);
	
	var object_create = Object.create || function (prototype) {
	    function Type() { }
	    Type.prototype = prototype;
	    return new Type();
	};
	
	var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
	
	var object_keys = Object.keys || function (object) {
	    var keys = [];
	    for (var key in object) {
	        if (object_hasOwnProperty(object, key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	};
	
	var object_toString = uncurryThis(Object.prototype.toString);
	
	function isObject(value) {
	    return value === Object(value);
	}
	
	// generator related shims
	
	// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
	function isStopIteration(exception) {
	    return (
	        object_toString(exception) === "[object StopIteration]" ||
	        exception instanceof QReturnValue
	    );
	}
	
	// FIXME: Remove this helper and Q.return once ES6 generators are in
	// SpiderMonkey.
	var QReturnValue;
	if (typeof ReturnValue !== "undefined") {
	    QReturnValue = ReturnValue;
	} else {
	    QReturnValue = function (value) {
	        this.value = value;
	    };
	}
	
	// long stack traces
	
	var STACK_JUMP_SEPARATOR = "From previous event:";
	
	function makeStackTraceLong(error, promise) {
	    // If possible, transform the error stack trace by removing Node and Q
	    // cruft, then concatenating with the stack trace of `promise`. See #57.
	    if (hasStacks &&
	        promise.stack &&
	        typeof error === "object" &&
	        error !== null &&
	        error.stack &&
	        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
	    ) {
	        var stacks = [];
	        for (var p = promise; !!p; p = p.source) {
	            if (p.stack) {
	                stacks.unshift(p.stack);
	            }
	        }
	        stacks.unshift(error.stack);
	
	        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
	        error.stack = filterStackString(concatedStacks);
	    }
	}
	
	function filterStackString(stackString) {
	    var lines = stackString.split("\n");
	    var desiredLines = [];
	    for (var i = 0; i < lines.length; ++i) {
	        var line = lines[i];
	
	        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
	            desiredLines.push(line);
	        }
	    }
	    return desiredLines.join("\n");
	}
	
	function isNodeFrame(stackLine) {
	    return stackLine.indexOf("(module.js:") !== -1 ||
	           stackLine.indexOf("(node.js:") !== -1;
	}
	
	function getFileNameAndLineNumber(stackLine) {
	    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
	    // In IE10 function name can have spaces ("Anonymous function") O_o
	    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
	    if (attempt1) {
	        return [attempt1[1], Number(attempt1[2])];
	    }
	
	    // Anonymous functions: "at filename:lineNumber:columnNumber"
	    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
	    if (attempt2) {
	        return [attempt2[1], Number(attempt2[2])];
	    }
	
	    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
	    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
	    if (attempt3) {
	        return [attempt3[1], Number(attempt3[2])];
	    }
	}
	
	function isInternalFrame(stackLine) {
	    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
	
	    if (!fileNameAndLineNumber) {
	        return false;
	    }
	
	    var fileName = fileNameAndLineNumber[0];
	    var lineNumber = fileNameAndLineNumber[1];
	
	    return fileName === qFileName &&
	        lineNumber >= qStartingLine &&
	        lineNumber <= qEndingLine;
	}
	
	// discover own file name and line number range for filtering stack
	// traces
	function captureLine() {
	    if (!hasStacks) {
	        return;
	    }
	
	    try {
	        throw new Error();
	    } catch (e) {
	        var lines = e.stack.split("\n");
	        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
	        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
	        if (!fileNameAndLineNumber) {
	            return;
	        }
	
	        qFileName = fileNameAndLineNumber[0];
	        return fileNameAndLineNumber[1];
	    }
	}
	
	function deprecate(callback, name, alternative) {
	    return function () {
	        if (typeof console !== "undefined" &&
	            typeof console.warn === "function") {
	            console.warn(name + " is deprecated, use " + alternative +
	                         " instead.", new Error("").stack);
	        }
	        return callback.apply(callback, arguments);
	    };
	}
	
	// end of shims
	// beginning of real work
	
	/**
	 * Constructs a promise for an immediate reference, passes promises through, or
	 * coerces promises from different systems.
	 * @param value immediate reference or promise
	 */
	function Q(value) {
	    // If the object is already a Promise, return it directly.  This enables
	    // the resolve function to both be used to created references from objects,
	    // but to tolerably coerce non-promises to promises.
	    if (value instanceof Promise) {
	        return value;
	    }
	
	    // assimilate thenables
	    if (isPromiseAlike(value)) {
	        return coerce(value);
	    } else {
	        return fulfill(value);
	    }
	}
	Q.resolve = Q;
	
	/**
	 * Performs a task in a future turn of the event loop.
	 * @param {Function} task
	 */
	Q.nextTick = nextTick;
	
	/**
	 * Controls whether or not long stack traces will be on
	 */
	Q.longStackSupport = false;
	
	// enable long stacks if Q_DEBUG is set
	if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
	    Q.longStackSupport = true;
	}
	
	/**
	 * Constructs a {promise, resolve, reject} object.
	 *
	 * `resolve` is a callback to invoke with a more resolved value for the
	 * promise. To fulfill the promise, invoke `resolve` with any value that is
	 * not a thenable. To reject the promise, invoke `resolve` with a rejected
	 * thenable, or invoke `reject` with the reason directly. To resolve the
	 * promise to another thenable, thus putting it in the same state, invoke
	 * `resolve` with that other thenable.
	 */
	Q.defer = defer;
	function defer() {
	    // if "messages" is an "Array", that indicates that the promise has not yet
	    // been resolved.  If it is "undefined", it has been resolved.  Each
	    // element of the messages array is itself an array of complete arguments to
	    // forward to the resolved promise.  We coerce the resolution value to a
	    // promise using the `resolve` function because it handles both fully
	    // non-thenable values and other thenables gracefully.
	    var messages = [], progressListeners = [], resolvedPromise;
	
	    var deferred = object_create(defer.prototype);
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, operands) {
	        var args = array_slice(arguments);
	        if (messages) {
	            messages.push(args);
	            if (op === "when" && operands[1]) { // progress operand
	                progressListeners.push(operands[1]);
	            }
	        } else {
	            Q.nextTick(function () {
	                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
	            });
	        }
	    };
	
	    // XXX deprecated
	    promise.valueOf = function () {
	        if (messages) {
	            return promise;
	        }
	        var nearerValue = nearer(resolvedPromise);
	        if (isPromise(nearerValue)) {
	            resolvedPromise = nearerValue; // shorten chain
	        }
	        return nearerValue;
	    };
	
	    promise.inspect = function () {
	        if (!resolvedPromise) {
	            return { state: "pending" };
	        }
	        return resolvedPromise.inspect();
	    };
	
	    if (Q.longStackSupport && hasStacks) {
	        try {
	            throw new Error();
	        } catch (e) {
	            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
	            // accessor around; that causes memory leaks as per GH-111. Just
	            // reify the stack trace as a string ASAP.
	            //
	            // At the same time, cut off the first line; it's always just
	            // "[object Promise]\n", as per the `toString`.
	            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
	        }
	    }
	
	    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
	    // consolidating them into `become`, since otherwise we'd create new
	    // promises with the lines `become(whatever(value))`. See e.g. GH-252.
	
	    function become(newPromise) {
	        resolvedPromise = newPromise;
	        promise.source = newPromise;
	
	        array_reduce(messages, function (undefined, message) {
	            Q.nextTick(function () {
	                newPromise.promiseDispatch.apply(newPromise, message);
	            });
	        }, void 0);
	
	        messages = void 0;
	        progressListeners = void 0;
	    }
	
	    deferred.promise = promise;
	    deferred.resolve = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(Q(value));
	    };
	
	    deferred.fulfill = function (value) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(fulfill(value));
	    };
	    deferred.reject = function (reason) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        become(reject(reason));
	    };
	    deferred.notify = function (progress) {
	        if (resolvedPromise) {
	            return;
	        }
	
	        array_reduce(progressListeners, function (undefined, progressListener) {
	            Q.nextTick(function () {
	                progressListener(progress);
	            });
	        }, void 0);
	    };
	
	    return deferred;
	}
	
	/**
	 * Creates a Node-style callback that will resolve or reject the deferred
	 * promise.
	 * @returns a nodeback
	 */
	defer.prototype.makeNodeResolver = function () {
	    var self = this;
	    return function (error, value) {
	        if (error) {
	            self.reject(error);
	        } else if (arguments.length > 2) {
	            self.resolve(array_slice(arguments, 1));
	        } else {
	            self.resolve(value);
	        }
	    };
	};
	
	/**
	 * @param resolver {Function} a function that returns nothing and accepts
	 * the resolve, reject, and notify functions for a deferred.
	 * @returns a promise that may be resolved with the given resolve and reject
	 * functions, or rejected by a thrown exception in resolver
	 */
	Q.Promise = promise; // ES6
	Q.promise = promise;
	function promise(resolver) {
	    if (typeof resolver !== "function") {
	        throw new TypeError("resolver must be a function.");
	    }
	    var deferred = defer();
	    try {
	        resolver(deferred.resolve, deferred.reject, deferred.notify);
	    } catch (reason) {
	        deferred.reject(reason);
	    }
	    return deferred.promise;
	}
	
	promise.race = race; // ES6
	promise.all = all; // ES6
	promise.reject = reject; // ES6
	promise.resolve = Q; // ES6
	
	// XXX experimental.  This method is a way to denote that a local value is
	// serializable and should be immediately dispatched to a remote upon request,
	// instead of passing a reference.
	Q.passByCopy = function (object) {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return object;
	};
	
	Promise.prototype.passByCopy = function () {
	    //freeze(object);
	    //passByCopies.set(object, true);
	    return this;
	};
	
	/**
	 * If two promises eventually fulfill to the same value, promises that value,
	 * but otherwise rejects.
	 * @param x {Any*}
	 * @param y {Any*}
	 * @returns {Any*} a promise for x and y if they are the same, but a rejection
	 * otherwise.
	 *
	 */
	Q.join = function (x, y) {
	    return Q(x).join(y);
	};
	
	Promise.prototype.join = function (that) {
	    return Q([this, that]).spread(function (x, y) {
	        if (x === y) {
	            // TODO: "===" should be Object.is or equiv
	            return x;
	        } else {
	            throw new Error("Can't join: not the same: " + x + " " + y);
	        }
	    });
	};
	
	/**
	 * Returns a promise for the first of an array of promises to become settled.
	 * @param answers {Array[Any*]} promises to race
	 * @returns {Any*} the first promise to be settled
	 */
	Q.race = race;
	function race(answerPs) {
	    return promise(function (resolve, reject) {
	        // Switch to this once we can assume at least ES5
	        // answerPs.forEach(function (answerP) {
	        //     Q(answerP).then(resolve, reject);
	        // });
	        // Use this in the meantime
	        for (var i = 0, len = answerPs.length; i < len; i++) {
	            Q(answerPs[i]).then(resolve, reject);
	        }
	    });
	}
	
	Promise.prototype.race = function () {
	    return this.then(Q.race);
	};
	
	/**
	 * Constructs a Promise with a promise descriptor object and optional fallback
	 * function.  The descriptor contains methods like when(rejected), get(name),
	 * set(name, value), post(name, args), and delete(name), which all
	 * return either a value, a promise for a value, or a rejection.  The fallback
	 * accepts the operation name, a resolver, and any further arguments that would
	 * have been forwarded to the appropriate method above had a method been
	 * provided with the proper name.  The API makes no guarantees about the nature
	 * of the returned object, apart from that it is usable whereever promises are
	 * bought and sold.
	 */
	Q.makePromise = Promise;
	function Promise(descriptor, fallback, inspect) {
	    if (fallback === void 0) {
	        fallback = function (op) {
	            return reject(new Error(
	                "Promise does not support operation: " + op
	            ));
	        };
	    }
	    if (inspect === void 0) {
	        inspect = function () {
	            return {state: "unknown"};
	        };
	    }
	
	    var promise = object_create(Promise.prototype);
	
	    promise.promiseDispatch = function (resolve, op, args) {
	        var result;
	        try {
	            if (descriptor[op]) {
	                result = descriptor[op].apply(promise, args);
	            } else {
	                result = fallback.call(promise, op, args);
	            }
	        } catch (exception) {
	            result = reject(exception);
	        }
	        if (resolve) {
	            resolve(result);
	        }
	    };
	
	    promise.inspect = inspect;
	
	    // XXX deprecated `valueOf` and `exception` support
	    if (inspect) {
	        var inspected = inspect();
	        if (inspected.state === "rejected") {
	            promise.exception = inspected.reason;
	        }
	
	        promise.valueOf = function () {
	            var inspected = inspect();
	            if (inspected.state === "pending" ||
	                inspected.state === "rejected") {
	                return promise;
	            }
	            return inspected.value;
	        };
	    }
	
	    return promise;
	}
	
	Promise.prototype.toString = function () {
	    return "[object Promise]";
	};
	
	Promise.prototype.then = function (fulfilled, rejected, progressed) {
	    var self = this;
	    var deferred = defer();
	    var done = false;   // ensure the untrusted promise makes at most a
	                        // single call to one of the callbacks
	
	    function _fulfilled(value) {
	        try {
	            return typeof fulfilled === "function" ? fulfilled(value) : value;
	        } catch (exception) {
	            return reject(exception);
	        }
	    }
	
	    function _rejected(exception) {
	        if (typeof rejected === "function") {
	            makeStackTraceLong(exception, self);
	            try {
	                return rejected(exception);
	            } catch (newException) {
	                return reject(newException);
	            }
	        }
	        return reject(exception);
	    }
	
	    function _progressed(value) {
	        return typeof progressed === "function" ? progressed(value) : value;
	    }
	
	    Q.nextTick(function () {
	        self.promiseDispatch(function (value) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_fulfilled(value));
	        }, "when", [function (exception) {
	            if (done) {
	                return;
	            }
	            done = true;
	
	            deferred.resolve(_rejected(exception));
	        }]);
	    });
	
	    // Progress propagator need to be attached in the current tick.
	    self.promiseDispatch(void 0, "when", [void 0, function (value) {
	        var newValue;
	        var threw = false;
	        try {
	            newValue = _progressed(value);
	        } catch (e) {
	            threw = true;
	            if (Q.onerror) {
	                Q.onerror(e);
	            } else {
	                throw e;
	            }
	        }
	
	        if (!threw) {
	            deferred.notify(newValue);
	        }
	    }]);
	
	    return deferred.promise;
	};
	
	Q.tap = function (promise, callback) {
	    return Q(promise).tap(callback);
	};
	
	/**
	 * Works almost like "finally", but not called for rejections.
	 * Original resolution value is passed through callback unaffected.
	 * Callback may return a promise that will be awaited for.
	 * @param {Function} callback
	 * @returns {Q.Promise}
	 * @example
	 * doSomething()
	 *   .then(...)
	 *   .tap(console.log)
	 *   .then(...);
	 */
	Promise.prototype.tap = function (callback) {
	    callback = Q(callback);
	
	    return this.then(function (value) {
	        return callback.fcall(value).thenResolve(value);
	    });
	};
	
	/**
	 * Registers an observer on a promise.
	 *
	 * Guarantees:
	 *
	 * 1. that fulfilled and rejected will be called only once.
	 * 2. that either the fulfilled callback or the rejected callback will be
	 *    called, but not both.
	 * 3. that fulfilled and rejected will not be called in this turn.
	 *
	 * @param value      promise or immediate reference to observe
	 * @param fulfilled  function to be called with the fulfilled value
	 * @param rejected   function to be called with the rejection exception
	 * @param progressed function to be called on any progress notifications
	 * @return promise for the return value from the invoked callback
	 */
	Q.when = when;
	function when(value, fulfilled, rejected, progressed) {
	    return Q(value).then(fulfilled, rejected, progressed);
	}
	
	Promise.prototype.thenResolve = function (value) {
	    return this.then(function () { return value; });
	};
	
	Q.thenResolve = function (promise, value) {
	    return Q(promise).thenResolve(value);
	};
	
	Promise.prototype.thenReject = function (reason) {
	    return this.then(function () { throw reason; });
	};
	
	Q.thenReject = function (promise, reason) {
	    return Q(promise).thenReject(reason);
	};
	
	/**
	 * If an object is not a promise, it is as "near" as possible.
	 * If a promise is rejected, it is as "near" as possible too.
	 * If it’s a fulfilled promise, the fulfillment value is nearer.
	 * If it’s a deferred promise and the deferred has been resolved, the
	 * resolution is "nearer".
	 * @param object
	 * @returns most resolved (nearest) form of the object
	 */
	
	// XXX should we re-do this?
	Q.nearer = nearer;
	function nearer(value) {
	    if (isPromise(value)) {
	        var inspected = value.inspect();
	        if (inspected.state === "fulfilled") {
	            return inspected.value;
	        }
	    }
	    return value;
	}
	
	/**
	 * @returns whether the given object is a promise.
	 * Otherwise it is a fulfilled value.
	 */
	Q.isPromise = isPromise;
	function isPromise(object) {
	    return object instanceof Promise;
	}
	
	Q.isPromiseAlike = isPromiseAlike;
	function isPromiseAlike(object) {
	    return isObject(object) && typeof object.then === "function";
	}
	
	/**
	 * @returns whether the given object is a pending promise, meaning not
	 * fulfilled or rejected.
	 */
	Q.isPending = isPending;
	function isPending(object) {
	    return isPromise(object) && object.inspect().state === "pending";
	}
	
	Promise.prototype.isPending = function () {
	    return this.inspect().state === "pending";
	};
	
	/**
	 * @returns whether the given object is a value or fulfilled
	 * promise.
	 */
	Q.isFulfilled = isFulfilled;
	function isFulfilled(object) {
	    return !isPromise(object) || object.inspect().state === "fulfilled";
	}
	
	Promise.prototype.isFulfilled = function () {
	    return this.inspect().state === "fulfilled";
	};
	
	/**
	 * @returns whether the given object is a rejected promise.
	 */
	Q.isRejected = isRejected;
	function isRejected(object) {
	    return isPromise(object) && object.inspect().state === "rejected";
	}
	
	Promise.prototype.isRejected = function () {
	    return this.inspect().state === "rejected";
	};
	
	//// BEGIN UNHANDLED REJECTION TRACKING
	
	// This promise library consumes exceptions thrown in handlers so they can be
	// handled by a subsequent promise.  The exceptions get added to this array when
	// they are created, and removed when they are handled.  Note that in ES6 or
	// shimmed environments, this would naturally be a `Set`.
	var unhandledReasons = [];
	var unhandledRejections = [];
	var reportedUnhandledRejections = [];
	var trackUnhandledRejections = true;
	
	function resetUnhandledRejections() {
	    unhandledReasons.length = 0;
	    unhandledRejections.length = 0;
	
	    if (!trackUnhandledRejections) {
	        trackUnhandledRejections = true;
	    }
	}
	
	function trackRejection(promise, reason) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	    if (typeof process === "object" && typeof process.emit === "function") {
	        Q.nextTick.runAfter(function () {
	            if (array_indexOf(unhandledRejections, promise) !== -1) {
	                process.emit("unhandledRejection", reason, promise);
	                reportedUnhandledRejections.push(promise);
	            }
	        });
	    }
	
	    unhandledRejections.push(promise);
	    if (reason && typeof reason.stack !== "undefined") {
	        unhandledReasons.push(reason.stack);
	    } else {
	        unhandledReasons.push("(no stack) " + reason);
	    }
	}
	
	function untrackRejection(promise) {
	    if (!trackUnhandledRejections) {
	        return;
	    }
	
	    var at = array_indexOf(unhandledRejections, promise);
	    if (at !== -1) {
	        if (typeof process === "object" && typeof process.emit === "function") {
	            Q.nextTick.runAfter(function () {
	                var atReport = array_indexOf(reportedUnhandledRejections, promise);
	                if (atReport !== -1) {
	                    process.emit("rejectionHandled", unhandledReasons[at], promise);
	                    reportedUnhandledRejections.splice(atReport, 1);
	                }
	            });
	        }
	        unhandledRejections.splice(at, 1);
	        unhandledReasons.splice(at, 1);
	    }
	}
	
	Q.resetUnhandledRejections = resetUnhandledRejections;
	
	Q.getUnhandledReasons = function () {
	    // Make a copy so that consumers can't interfere with our internal state.
	    return unhandledReasons.slice();
	};
	
	Q.stopUnhandledRejectionTracking = function () {
	    resetUnhandledRejections();
	    trackUnhandledRejections = false;
	};
	
	resetUnhandledRejections();
	
	//// END UNHANDLED REJECTION TRACKING
	
	/**
	 * Constructs a rejected promise.
	 * @param reason value describing the failure
	 */
	Q.reject = reject;
	function reject(reason) {
	    var rejection = Promise({
	        "when": function (rejected) {
	            // note that the error has been handled
	            if (rejected) {
	                untrackRejection(this);
	            }
	            return rejected ? rejected(reason) : this;
	        }
	    }, function fallback() {
	        return this;
	    }, function inspect() {
	        return { state: "rejected", reason: reason };
	    });
	
	    // Note that the reason has not been handled.
	    trackRejection(rejection, reason);
	
	    return rejection;
	}
	
	/**
	 * Constructs a fulfilled promise for an immediate reference.
	 * @param value immediate reference
	 */
	Q.fulfill = fulfill;
	function fulfill(value) {
	    return Promise({
	        "when": function () {
	            return value;
	        },
	        "get": function (name) {
	            return value[name];
	        },
	        "set": function (name, rhs) {
	            value[name] = rhs;
	        },
	        "delete": function (name) {
	            delete value[name];
	        },
	        "post": function (name, args) {
	            // Mark Miller proposes that post with no name should apply a
	            // promised function.
	            if (name === null || name === void 0) {
	                return value.apply(void 0, args);
	            } else {
	                return value[name].apply(value, args);
	            }
	        },
	        "apply": function (thisp, args) {
	            return value.apply(thisp, args);
	        },
	        "keys": function () {
	            return object_keys(value);
	        }
	    }, void 0, function inspect() {
	        return { state: "fulfilled", value: value };
	    });
	}
	
	/**
	 * Converts thenables to Q promises.
	 * @param promise thenable promise
	 * @returns a Q promise
	 */
	function coerce(promise) {
	    var deferred = defer();
	    Q.nextTick(function () {
	        try {
	            promise.then(deferred.resolve, deferred.reject, deferred.notify);
	        } catch (exception) {
	            deferred.reject(exception);
	        }
	    });
	    return deferred.promise;
	}
	
	/**
	 * Annotates an object such that it will never be
	 * transferred away from this process over any promise
	 * communication channel.
	 * @param object
	 * @returns promise a wrapping of that object that
	 * additionally responds to the "isDef" message
	 * without a rejection.
	 */
	Q.master = master;
	function master(object) {
	    return Promise({
	        "isDef": function () {}
	    }, function fallback(op, args) {
	        return dispatch(object, op, args);
	    }, function () {
	        return Q(object).inspect();
	    });
	}
	
	/**
	 * Spreads the values of a promised array of arguments into the
	 * fulfillment callback.
	 * @param fulfilled callback that receives variadic arguments from the
	 * promised array
	 * @param rejected callback that receives the exception if the promise
	 * is rejected.
	 * @returns a promise for the return value or thrown exception of
	 * either callback.
	 */
	Q.spread = spread;
	function spread(value, fulfilled, rejected) {
	    return Q(value).spread(fulfilled, rejected);
	}
	
	Promise.prototype.spread = function (fulfilled, rejected) {
	    return this.all().then(function (array) {
	        return fulfilled.apply(void 0, array);
	    }, rejected);
	};
	
	/**
	 * The async function is a decorator for generator functions, turning
	 * them into asynchronous generators.  Although generators are only part
	 * of the newest ECMAScript 6 drafts, this code does not cause syntax
	 * errors in older engines.  This code should continue to work and will
	 * in fact improve over time as the language improves.
	 *
	 * ES6 generators are currently part of V8 version 3.19 with the
	 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
	 * for longer, but under an older Python-inspired form.  This function
	 * works on both kinds of generators.
	 *
	 * Decorates a generator function such that:
	 *  - it may yield promises
	 *  - execution will continue when that promise is fulfilled
	 *  - the value of the yield expression will be the fulfilled value
	 *  - it returns a promise for the return value (when the generator
	 *    stops iterating)
	 *  - the decorated function returns a promise for the return value
	 *    of the generator or the first rejected promise among those
	 *    yielded.
	 *  - if an error is thrown in the generator, it propagates through
	 *    every following yield until it is caught, or until it escapes
	 *    the generator function altogether, and is translated into a
	 *    rejection for the promise returned by the decorated generator.
	 */
	Q.async = async;
	function async(makeGenerator) {
	    return function () {
	        // when verb is "send", arg is a value
	        // when verb is "throw", arg is an exception
	        function continuer(verb, arg) {
	            var result;
	
	            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
	            // engine that has a deployed base of browsers that support generators.
	            // However, SM's generators use the Python-inspired semantics of
	            // outdated ES6 drafts.  We would like to support ES6, but we'd also
	            // like to make it possible to use generators in deployed browsers, so
	            // we also support Python-style generators.  At some point we can remove
	            // this block.
	
	            if (typeof StopIteration === "undefined") {
	                // ES6 Generators
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    return reject(exception);
	                }
	                if (result.done) {
	                    return Q(result.value);
	                } else {
	                    return when(result.value, callback, errback);
	                }
	            } else {
	                // SpiderMonkey Generators
	                // FIXME: Remove this case when SM does ES6 generators.
	                try {
	                    result = generator[verb](arg);
	                } catch (exception) {
	                    if (isStopIteration(exception)) {
	                        return Q(exception.value);
	                    } else {
	                        return reject(exception);
	                    }
	                }
	                return when(result, callback, errback);
	            }
	        }
	        var generator = makeGenerator.apply(this, arguments);
	        var callback = continuer.bind(continuer, "next");
	        var errback = continuer.bind(continuer, "throw");
	        return callback();
	    };
	}
	
	/**
	 * The spawn function is a small wrapper around async that immediately
	 * calls the generator and also ends the promise chain, so that any
	 * unhandled errors are thrown instead of forwarded to the error
	 * handler. This is useful because it's extremely common to run
	 * generators at the top-level to work with libraries.
	 */
	Q.spawn = spawn;
	function spawn(makeGenerator) {
	    Q.done(Q.async(makeGenerator)());
	}
	
	// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
	/**
	 * Throws a ReturnValue exception to stop an asynchronous generator.
	 *
	 * This interface is a stop-gap measure to support generator return
	 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
	 * generators like Chromium 29, just use "return" in your generator
	 * functions.
	 *
	 * @param value the return value for the surrounding generator
	 * @throws ReturnValue exception with the value.
	 * @example
	 * // ES6 style
	 * Q.async(function* () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      return foo + bar;
	 * })
	 * // Older SpiderMonkey style
	 * Q.async(function () {
	 *      var foo = yield getFooPromise();
	 *      var bar = yield getBarPromise();
	 *      Q.return(foo + bar);
	 * })
	 */
	Q["return"] = _return;
	function _return(value) {
	    throw new QReturnValue(value);
	}
	
	/**
	 * The promised function decorator ensures that any promise arguments
	 * are settled and passed as values (`this` is also settled and passed
	 * as a value).  It will also ensure that the result of a function is
	 * always a promise.
	 *
	 * @example
	 * var add = Q.promised(function (a, b) {
	 *     return a + b;
	 * });
	 * add(Q(a), Q(B));
	 *
	 * @param {function} callback The function to decorate
	 * @returns {function} a function that has been decorated.
	 */
	Q.promised = promised;
	function promised(callback) {
	    return function () {
	        return spread([this, all(arguments)], function (self, args) {
	            return callback.apply(self, args);
	        });
	    };
	}
	
	/**
	 * sends a message to a value in a future turn
	 * @param object* the recipient
	 * @param op the name of the message operation, e.g., "when",
	 * @param args further arguments to be forwarded to the operation
	 * @returns result {Promise} a promise for the result of the operation
	 */
	Q.dispatch = dispatch;
	function dispatch(object, op, args) {
	    return Q(object).dispatch(op, args);
	}
	
	Promise.prototype.dispatch = function (op, args) {
	    var self = this;
	    var deferred = defer();
	    Q.nextTick(function () {
	        self.promiseDispatch(deferred.resolve, op, args);
	    });
	    return deferred.promise;
	};
	
	/**
	 * Gets the value of a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to get
	 * @return promise for the property value
	 */
	Q.get = function (object, key) {
	    return Q(object).dispatch("get", [key]);
	};
	
	Promise.prototype.get = function (key) {
	    return this.dispatch("get", [key]);
	};
	
	/**
	 * Sets the value of a property in a future turn.
	 * @param object    promise or immediate reference for object object
	 * @param name      name of property to set
	 * @param value     new value of property
	 * @return promise for the return value
	 */
	Q.set = function (object, key, value) {
	    return Q(object).dispatch("set", [key, value]);
	};
	
	Promise.prototype.set = function (key, value) {
	    return this.dispatch("set", [key, value]);
	};
	
	/**
	 * Deletes a property in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of property to delete
	 * @return promise for the return value
	 */
	Q.del = // XXX legacy
	Q["delete"] = function (object, key) {
	    return Q(object).dispatch("delete", [key]);
	};
	
	Promise.prototype.del = // XXX legacy
	Promise.prototype["delete"] = function (key) {
	    return this.dispatch("delete", [key]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param value     a value to post, typically an array of
	 *                  invocation arguments for promises that
	 *                  are ultimately backed with `resolve` values,
	 *                  as opposed to those backed with URLs
	 *                  wherein the posted value can be any
	 *                  JSON serializable object.
	 * @return promise for the return value
	 */
	// bound locally because it is used by other methods
	Q.mapply = // XXX As proposed by "Redsandro"
	Q.post = function (object, name, args) {
	    return Q(object).dispatch("post", [name, args]);
	};
	
	Promise.prototype.mapply = // XXX As proposed by "Redsandro"
	Promise.prototype.post = function (name, args) {
	    return this.dispatch("post", [name, args]);
	};
	
	/**
	 * Invokes a method in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @param name      name of method to invoke
	 * @param ...args   array of invocation arguments
	 * @return promise for the return value
	 */
	Q.send = // XXX Mark Miller's proposed parlance
	Q.mcall = // XXX As proposed by "Redsandro"
	Q.invoke = function (object, name /*...args*/) {
	    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
	};
	
	Promise.prototype.send = // XXX Mark Miller's proposed parlance
	Promise.prototype.mcall = // XXX As proposed by "Redsandro"
	Promise.prototype.invoke = function (name /*...args*/) {
	    return this.dispatch("post", [name, array_slice(arguments, 1)]);
	};
	
	/**
	 * Applies the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param args      array of application arguments
	 */
	Q.fapply = function (object, args) {
	    return Q(object).dispatch("apply", [void 0, args]);
	};
	
	Promise.prototype.fapply = function (args) {
	    return this.dispatch("apply", [void 0, args]);
	};
	
	/**
	 * Calls the promised function in a future turn.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q["try"] =
	Q.fcall = function (object /* ...args*/) {
	    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
	};
	
	Promise.prototype.fcall = function (/*...args*/) {
	    return this.dispatch("apply", [void 0, array_slice(arguments)]);
	};
	
	/**
	 * Binds the promised function, transforming return values into a fulfilled
	 * promise and thrown errors into a rejected one.
	 * @param object    promise or immediate reference for target function
	 * @param ...args   array of application arguments
	 */
	Q.fbind = function (object /*...args*/) {
	    var promise = Q(object);
	    var args = array_slice(arguments, 1);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	Promise.prototype.fbind = function (/*...args*/) {
	    var promise = this;
	    var args = array_slice(arguments);
	    return function fbound() {
	        return promise.dispatch("apply", [
	            this,
	            args.concat(array_slice(arguments))
	        ]);
	    };
	};
	
	/**
	 * Requests the names of the owned properties of a promised
	 * object in a future turn.
	 * @param object    promise or immediate reference for target object
	 * @return promise for the keys of the eventually settled object
	 */
	Q.keys = function (object) {
	    return Q(object).dispatch("keys", []);
	};
	
	Promise.prototype.keys = function () {
	    return this.dispatch("keys", []);
	};
	
	/**
	 * Turns an array of promises into a promise for an array.  If any of
	 * the promises gets rejected, the whole array is rejected immediately.
	 * @param {Array*} an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns a promise for an array of the corresponding values
	 */
	// By Mark Miller
	// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
	Q.all = all;
	function all(promises) {
	    return when(promises, function (promises) {
	        var pendingCount = 0;
	        var deferred = defer();
	        array_reduce(promises, function (undefined, promise, index) {
	            var snapshot;
	            if (
	                isPromise(promise) &&
	                (snapshot = promise.inspect()).state === "fulfilled"
	            ) {
	                promises[index] = snapshot.value;
	            } else {
	                ++pendingCount;
	                when(
	                    promise,
	                    function (value) {
	                        promises[index] = value;
	                        if (--pendingCount === 0) {
	                            deferred.resolve(promises);
	                        }
	                    },
	                    deferred.reject,
	                    function (progress) {
	                        deferred.notify({ index: index, value: progress });
	                    }
	                );
	            }
	        }, void 0);
	        if (pendingCount === 0) {
	            deferred.resolve(promises);
	        }
	        return deferred.promise;
	    });
	}
	
	Promise.prototype.all = function () {
	    return all(this);
	};
	
	/**
	 * Returns the first resolved promise of an array. Prior rejected promises are
	 * ignored.  Rejects only if all promises are rejected.
	 * @param {Array*} an array containing values or promises for values
	 * @returns a promise fulfilled with the value of the first resolved promise,
	 * or a rejected promise if all promises are rejected.
	 */
	Q.any = any;
	
	function any(promises) {
	    if (promises.length === 0) {
	        return Q.resolve();
	    }
	
	    var deferred = Q.defer();
	    var pendingCount = 0;
	    array_reduce(promises, function (prev, current, index) {
	        var promise = promises[index];
	
	        pendingCount++;
	
	        when(promise, onFulfilled, onRejected, onProgress);
	        function onFulfilled(result) {
	            deferred.resolve(result);
	        }
	        function onRejected() {
	            pendingCount--;
	            if (pendingCount === 0) {
	                deferred.reject(new Error(
	                    "Can't get fulfillment value from any promise, all " +
	                    "promises were rejected."
	                ));
	            }
	        }
	        function onProgress(progress) {
	            deferred.notify({
	                index: index,
	                value: progress
	            });
	        }
	    }, undefined);
	
	    return deferred.promise;
	}
	
	Promise.prototype.any = function () {
	    return any(this);
	};
	
	/**
	 * Waits for all promises to be settled, either fulfilled or
	 * rejected.  This is distinct from `all` since that would stop
	 * waiting at the first rejection.  The promise returned by
	 * `allResolved` will never be rejected.
	 * @param promises a promise for an array (or an array) of promises
	 * (or values)
	 * @return a promise for an array of promises
	 */
	Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
	function allResolved(promises) {
	    return when(promises, function (promises) {
	        promises = array_map(promises, Q);
	        return when(all(array_map(promises, function (promise) {
	            return when(promise, noop, noop);
	        })), function () {
	            return promises;
	        });
	    });
	}
	
	Promise.prototype.allResolved = function () {
	    return allResolved(this);
	};
	
	/**
	 * @see Promise#allSettled
	 */
	Q.allSettled = allSettled;
	function allSettled(promises) {
	    return Q(promises).allSettled();
	}
	
	/**
	 * Turns an array of promises into a promise for an array of their states (as
	 * returned by `inspect`) when they have all settled.
	 * @param {Array[Any*]} values an array (or promise for an array) of values (or
	 * promises for values)
	 * @returns {Array[State]} an array of states for the respective values.
	 */
	Promise.prototype.allSettled = function () {
	    return this.then(function (promises) {
	        return all(array_map(promises, function (promise) {
	            promise = Q(promise);
	            function regardless() {
	                return promise.inspect();
	            }
	            return promise.then(regardless, regardless);
	        }));
	    });
	};
	
	/**
	 * Captures the failure of a promise, giving an oportunity to recover
	 * with a callback.  If the given promise is fulfilled, the returned
	 * promise is fulfilled.
	 * @param {Any*} promise for something
	 * @param {Function} callback to fulfill the returned promise if the
	 * given promise is rejected
	 * @returns a promise for the return value of the callback
	 */
	Q.fail = // XXX legacy
	Q["catch"] = function (object, rejected) {
	    return Q(object).then(void 0, rejected);
	};
	
	Promise.prototype.fail = // XXX legacy
	Promise.prototype["catch"] = function (rejected) {
	    return this.then(void 0, rejected);
	};
	
	/**
	 * Attaches a listener that can respond to progress notifications from a
	 * promise's originating deferred. This listener receives the exact arguments
	 * passed to ``deferred.notify``.
	 * @param {Any*} promise for something
	 * @param {Function} callback to receive any progress notifications
	 * @returns the given promise, unchanged
	 */
	Q.progress = progress;
	function progress(object, progressed) {
	    return Q(object).then(void 0, void 0, progressed);
	}
	
	Promise.prototype.progress = function (progressed) {
	    return this.then(void 0, void 0, progressed);
	};
	
	/**
	 * Provides an opportunity to observe the settling of a promise,
	 * regardless of whether the promise is fulfilled or rejected.  Forwards
	 * the resolution to the returned promise when the callback is done.
	 * The callback can return a promise to defer completion.
	 * @param {Any*} promise
	 * @param {Function} callback to observe the resolution of the given
	 * promise, takes no arguments.
	 * @returns a promise for the resolution of the given promise when
	 * ``fin`` is done.
	 */
	Q.fin = // XXX legacy
	Q["finally"] = function (object, callback) {
	    return Q(object)["finally"](callback);
	};
	
	Promise.prototype.fin = // XXX legacy
	Promise.prototype["finally"] = function (callback) {
	    callback = Q(callback);
	    return this.then(function (value) {
	        return callback.fcall().then(function () {
	            return value;
	        });
	    }, function (reason) {
	        // TODO attempt to recycle the rejection with "this".
	        return callback.fcall().then(function () {
	            throw reason;
	        });
	    });
	};
	
	/**
	 * Terminates a chain of promises, forcing rejections to be
	 * thrown as exceptions.
	 * @param {Any*} promise at the end of a chain of promises
	 * @returns nothing
	 */
	Q.done = function (object, fulfilled, rejected, progress) {
	    return Q(object).done(fulfilled, rejected, progress);
	};
	
	Promise.prototype.done = function (fulfilled, rejected, progress) {
	    var onUnhandledError = function (error) {
	        // forward to a future turn so that ``when``
	        // does not catch it and turn it into a rejection.
	        Q.nextTick(function () {
	            makeStackTraceLong(error, promise);
	            if (Q.onerror) {
	                Q.onerror(error);
	            } else {
	                throw error;
	            }
	        });
	    };
	
	    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
	    var promise = fulfilled || rejected || progress ?
	        this.then(fulfilled, rejected, progress) :
	        this;
	
	    if (typeof process === "object" && process && process.domain) {
	        onUnhandledError = process.domain.bind(onUnhandledError);
	    }
	
	    promise.then(void 0, onUnhandledError);
	};
	
	/**
	 * Causes a promise to be rejected if it does not get fulfilled before
	 * some milliseconds time out.
	 * @param {Any*} promise
	 * @param {Number} milliseconds timeout
	 * @param {Any*} custom error message or Error object (optional)
	 * @returns a promise for the resolution of the given promise if it is
	 * fulfilled before the timeout, otherwise rejected.
	 */
	Q.timeout = function (object, ms, error) {
	    return Q(object).timeout(ms, error);
	};
	
	Promise.prototype.timeout = function (ms, error) {
	    var deferred = defer();
	    var timeoutId = setTimeout(function () {
	        if (!error || "string" === typeof error) {
	            error = new Error(error || "Timed out after " + ms + " ms");
	            error.code = "ETIMEDOUT";
	        }
	        deferred.reject(error);
	    }, ms);
	
	    this.then(function (value) {
	        clearTimeout(timeoutId);
	        deferred.resolve(value);
	    }, function (exception) {
	        clearTimeout(timeoutId);
	        deferred.reject(exception);
	    }, deferred.notify);
	
	    return deferred.promise;
	};
	
	/**
	 * Returns a promise for the given value (or promised value), some
	 * milliseconds after it resolved. Passes rejections immediately.
	 * @param {Any*} promise
	 * @param {Number} milliseconds
	 * @returns a promise for the resolution of the given promise after milliseconds
	 * time has elapsed since the resolution of the given promise.
	 * If the given promise rejects, that is passed immediately.
	 */
	Q.delay = function (object, timeout) {
	    if (timeout === void 0) {
	        timeout = object;
	        object = void 0;
	    }
	    return Q(object).delay(timeout);
	};
	
	Promise.prototype.delay = function (timeout) {
	    return this.then(function (value) {
	        var deferred = defer();
	        setTimeout(function () {
	            deferred.resolve(value);
	        }, timeout);
	        return deferred.promise;
	    });
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided as an array, and returns a promise.
	 *
	 *      Q.nfapply(FS.readFile, [__filename])
	 *      .then(function (content) {
	 *      })
	 *
	 */
	Q.nfapply = function (callback, args) {
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfapply = function (args) {
	    var deferred = defer();
	    var nodeArgs = array_slice(args);
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Passes a continuation to a Node function, which is called with the given
	 * arguments provided individually, and returns a promise.
	 * @example
	 * Q.nfcall(FS.readFile, __filename)
	 * .then(function (content) {
	 * })
	 *
	 */
	Q.nfcall = function (callback /*...args*/) {
	    var args = array_slice(arguments, 1);
	    return Q(callback).nfapply(args);
	};
	
	Promise.prototype.nfcall = function (/*...args*/) {
	    var nodeArgs = array_slice(arguments);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.fapply(nodeArgs).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Wraps a NodeJS continuation passing function and returns an equivalent
	 * version that returns a promise.
	 * @example
	 * Q.nfbind(FS.readFile, __filename)("utf-8")
	 * .then(console.log)
	 * .done()
	 */
	Q.nfbind =
	Q.denodeify = function (callback /*...args*/) {
	    var baseArgs = array_slice(arguments, 1);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        Q(callback).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nfbind =
	Promise.prototype.denodeify = function (/*...args*/) {
	    var args = array_slice(arguments);
	    args.unshift(this);
	    return Q.denodeify.apply(void 0, args);
	};
	
	Q.nbind = function (callback, thisp /*...args*/) {
	    var baseArgs = array_slice(arguments, 2);
	    return function () {
	        var nodeArgs = baseArgs.concat(array_slice(arguments));
	        var deferred = defer();
	        nodeArgs.push(deferred.makeNodeResolver());
	        function bound() {
	            return callback.apply(thisp, arguments);
	        }
	        Q(bound).fapply(nodeArgs).fail(deferred.reject);
	        return deferred.promise;
	    };
	};
	
	Promise.prototype.nbind = function (/*thisp, ...args*/) {
	    var args = array_slice(arguments, 0);
	    args.unshift(this);
	    return Q.nbind.apply(void 0, args);
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback with a given array of arguments, plus a provided callback.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param {Array} args arguments to pass to the method; the callback
	 * will be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nmapply = // XXX As proposed by "Redsandro"
	Q.npost = function (object, name, args) {
	    return Q(object).npost(name, args);
	};
	
	Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
	Promise.prototype.npost = function (name, args) {
	    var nodeArgs = array_slice(args || []);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * Calls a method of a Node-style object that accepts a Node-style
	 * callback, forwarding the given variadic arguments, plus a provided
	 * callback argument.
	 * @param object an object that has the named method
	 * @param {String} name name of the method of object
	 * @param ...args arguments to pass to the method; the callback will
	 * be provided by Q and appended to these arguments.
	 * @returns a promise for the value or error
	 */
	Q.nsend = // XXX Based on Mark Miller's proposed "send"
	Q.nmcall = // XXX Based on "Redsandro's" proposal
	Q.ninvoke = function (object, name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 2);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
	Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
	Promise.prototype.ninvoke = function (name /*...args*/) {
	    var nodeArgs = array_slice(arguments, 1);
	    var deferred = defer();
	    nodeArgs.push(deferred.makeNodeResolver());
	    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
	    return deferred.promise;
	};
	
	/**
	 * If a function would like to support both Node continuation-passing-style and
	 * promise-returning-style, it can end its internal promise chain with
	 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
	 * elects to use a nodeback, the result will be sent there.  If they do not
	 * pass a nodeback, they will receive the result promise.
	 * @param object a result (or a promise for a result)
	 * @param {Function} nodeback a Node.js-style callback
	 * @returns either the promise or nothing
	 */
	Q.nodeify = nodeify;
	function nodeify(object, nodeback) {
	    return Q(object).nodeify(nodeback);
	}
	
	Promise.prototype.nodeify = function (nodeback) {
	    if (nodeback) {
	        this.then(function (value) {
	            Q.nextTick(function () {
	                nodeback(null, value);
	            });
	        }, function (error) {
	            Q.nextTick(function () {
	                nodeback(error);
	            });
	        });
	    } else {
	        return this;
	    }
	};
	
	Q.noConflict = function() {
	    throw new Error("Q.noConflict only works when Q is used as a global");
	};
	
	// All code before this point will be filtered from stack traces.
	var qEndingLine = captureLine();
	
	return Q;
	
	});
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4), __webpack_require__(161).setImmediate))

/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(4).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
	  immediateIds[id] = true;
	
	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });
	
	  return id;
	};
	
	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(161).setImmediate, __webpack_require__(161).clearImmediate))

/***/ },
/* 162 */
/***/ function(module, exports) {

	'use strict';
	
	var OperationGroup = module.exports = function (tag, description, externalDocs, operation) {
	  this.description = description;
	  this.externalDocs = externalDocs;
	  this.name = tag;
	  this.operation = operation;
	  this.operationsArray = [];
	  this.path = tag;
	  this.tag = tag;
	};
	
	OperationGroup.prototype.sort = function () {
	
	};
	


/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var SwaggerHttp = __webpack_require__(154);
	var _ = {
	  isObject: __webpack_require__(10),
	  cloneDeep: __webpack_require__(81),
	  isArray: __webpack_require__(21),
	  isString: __webpack_require__(11)
	};
	
	
	/**
	 * Resolves a spec's remote references
	 */
	var Resolver = module.exports = function () {
	  this.failedUrls = [];
	  this.resolverCache = {};
	  this.pendingUrls = {};
	};
	
	Resolver.prototype.processAllOf = function(root, name, definition, resolutionTable, unresolvedRefs, spec) {
	  var i, location, property;
	
	  definition['x-resolved-from'] = [ '#/definitions/' + name ];
	  var allOf = definition.allOf;
	  // the refs go first
	  allOf.sort(function(a, b) {
	    if(a.$ref && b.$ref) { return 0; }
	    else if(a.$ref) { return -1; }
	    else { return 1; }
	  });
	  for (i = 0; i < allOf.length; i++) {
	    property = allOf[i];
	    location = '/definitions/' + name + '/allOf';
	    this.resolveInline(root, spec, property, resolutionTable, unresolvedRefs, location);
	  }
	};
	
	Resolver.prototype.resolve = function (spec, arg1, arg2, arg3) {
	  this.spec = spec;
	  var root = arg1, callback = arg2, scope = arg3, opts = {}, location, i;
	  if(typeof arg1 === 'function') {
	    root = null;
	    callback = arg1;
	    scope = arg2;
	  }
	  var _root = root, modelName;
	  this.scope = (scope || this);
	  this.iteration = this.iteration || 0;
	
	  if(this.scope.options && this.scope.options.requestInterceptor){
	    opts.requestInterceptor = this.scope.options.requestInterceptor;
	  }
	
	  if(this.scope.options && this.scope.options.responseInterceptor){
	    opts.responseInterceptor = this.scope.options.responseInterceptor;
	  }
	
	  var name, path, property, propertyName, parameter, done, counter;
	  var processedCalls = 0, resolvedRefs = {}, unresolvedRefs = {};
	  var resolutionTable = []; // store objects for dereferencing
	
	  spec.definitions = spec.definitions || {};
	  // definitions
	  for (name in spec.definitions) {
	    var definition = spec.definitions[name];
	    if(definition.$ref) {
	      this.resolveInline(root, spec, definition, resolutionTable, unresolvedRefs, definition);
	    }
	    else {
	      for (propertyName in definition.properties) {
	        property = definition.properties[propertyName];
	        if (_.isArray(property.allOf)) {
	          this.processAllOf(root, name, property, resolutionTable, unresolvedRefs, spec);
	        }
	        else {
	          this.resolveTo(root, property, resolutionTable, '/definitions');
	        }
	      }
	
	      if (definition.allOf) {
	        this.processAllOf(root, name, definition, resolutionTable, unresolvedRefs, spec);
	      }
	    }
	  }
	
	  // shared parameters
	  spec.parameters = spec.parameters || {};
	  for(name in spec.parameters) {
	    parameter = spec.parameters[name];
	    if (parameter.in === 'body' && parameter.schema) {
	      if(_.isArray(parameter.schema.allOf)) {
	        // move to a definition
	        modelName = 'inline_model';
	        var _name = modelName;
	        done = false; counter = 0;
	        while(!done) {
	          if(typeof spec.definitions[_name] === 'undefined') {
	            done = true;
	            break;
	          }
	          _name = modelName + '_' + counter;
	          counter ++;
	        }
	        spec.definitions[_name] = { allOf: parameter.schema.allOf };
	        delete parameter.schema.allOf;
	        parameter.schema.$ref = '#/definitions/' + _name;
	        this.processAllOf(root, _name, spec.definitions[_name], resolutionTable, unresolvedRefs, spec);
	      }
	      else {
	        this.resolveTo(root, parameter.schema, resolutionTable, location);
	      }
	    }
	
	    if (parameter.$ref) {
	      // parameter reference
	      this.resolveInline(root, spec, parameter, resolutionTable, unresolvedRefs, parameter.$ref);
	    }
	  }
	
	  // operations
	  for (name in spec.paths) {
	    var method, operation, responseCode;
	    path = spec.paths[name];
	
	    if(typeof path === 'object') {
	      for (method in path) {
	        // operation reference
	        if (method === '$ref') {
	          // location = path[method];
	          location = '/paths' + name;
	          this.resolveInline(root, spec, path, resolutionTable, unresolvedRefs, location);
	        }
	        else {
	          operation = path[method];
	          var sharedParameters = path.parameters || [];
	          var parameters = operation.parameters || [];
	
	          for (i in sharedParameters) {
	            parameter = sharedParameters[i];
	            parameters.unshift(parameter);
	          }
	          if (method !== 'parameters' && _.isObject(operation)) {
	            operation.parameters = operation.parameters || parameters;
	          }
	
	          for (i in parameters) {
	            parameter = parameters[i];
	            location = '/paths' + name + '/' + method + '/parameters';
	
	            if (parameter.in === 'body' && parameter.schema) {
	              if (_.isArray(parameter.schema.allOf)) {
	                // move to a definition
	                modelName = 'inline_model';
	                name = modelName;
	                done = false;
	                counter = 0;
	                while (!done) {
	                  if (typeof spec.definitions[name] === 'undefined') {
	                    done = true;
	                    break;
	                  }
	                  name = modelName + '_' + counter;
	                  counter++;
	                }
	                spec.definitions[name] = {allOf: parameter.schema.allOf};
	                delete parameter.schema.allOf;
	                parameter.schema.$ref = '#/definitions/' + name;
	                this.processAllOf(root, name, spec.definitions[name], resolutionTable, unresolvedRefs, spec);
	              }
	              else {
	                this.resolveTo(root, parameter.schema, resolutionTable, location);
	              }
	            }
	
	            if (parameter.$ref) {
	              // parameter reference
	              this.resolveInline(root, spec, parameter, resolutionTable, unresolvedRefs, parameter.$ref);
	            }
	          }
	
	          for (responseCode in operation.responses) {
	            var response = operation.responses[responseCode];
	            location = '/paths' + name + '/' + method + '/responses/' + responseCode;
	
	            if (_.isObject(response)) {
	              if (response.$ref) {
	                // response reference
	                this.resolveInline(root, spec, response, resolutionTable, unresolvedRefs, location);
	              }
	              if (response.schema) {
	                var responseObj = response;
	                if (_.isArray(responseObj.schema.allOf)) {
	                  // move to a definition
	                  modelName = 'inline_model';
	                  name = modelName;
	                  done = false;
	                  counter = 0;
	                  while (!done) {
	                    if (typeof spec.definitions[name] === 'undefined') {
	                      done = true;
	                      break;
	                    }
	                    name = modelName + '_' + counter;
	                    counter++;
	                  }
	                  spec.definitions[name] = {allOf: responseObj.schema.allOf};
	                  delete responseObj.schema.allOf;
	                  delete responseObj.schema.type;
	                  responseObj.schema.$ref = '#/definitions/' + name;
	                  this.processAllOf(root, name, spec.definitions[name], resolutionTable, unresolvedRefs, spec);
	                }
	                else if ('array' === responseObj.schema.type) {
	                  if (responseObj.schema.items && responseObj.schema.items.$ref) {
	                    // response reference
	                    this.resolveInline(root, spec, responseObj.schema.items, resolutionTable, unresolvedRefs, location);
	                  }
	                }
	                else {
	                  this.resolveTo(root, response.schema, resolutionTable, location);
	                }
	              }
	            }
	          }
	        }
	      }
	      // clear them out to avoid multiple resolutions
	      path.parameters = [];
	    }
	  }
	
	  var expectedCalls = 0, toResolve = [];
	  // if the root is same as obj[i].root we can resolve locally
	  var all = resolutionTable;
	
	  var parts;
	  for(i = 0; i < all.length; i++) {
	    var a = all[i];
	    if(root === a.root) {
	      if(a.resolveAs === 'ref') {
	        // resolve any path walking
	        var joined = ((a.root || '') + '/' + a.key).split('/');
	        var normalized = [];
	        var url = '';
	        var k;
	
	        if(a.key.indexOf('../') >= 0) {
	          for(var j = 0; j < joined.length; j++) {
	            if(joined[j] === '..') {
	              normalized = normalized.slice(0, normalized.length-1);
	            }
	            else {
	              normalized.push(joined[j]);
	            }
	          }
	          for(k = 0; k < normalized.length; k ++) {
	            if(k > 0) {
	              url += '/';
	            }
	            url += normalized[k];
	          }
	          // we now have to remote resolve this because the path has changed
	          a.root = url;
	          toResolve.push(a);
	        }
	        else {
	          parts = a.key.split('#');
	          if(parts.length === 2) {
	            if(parts[0].indexOf('http:') === 0 || parts[0].indexOf('https:') === 0) {
	              a.root = parts[0];
	            }
	            location = parts[1].split('/');
	            var r;
	            var s = spec;
	            for(k = 0; k < location.length; k++) {
	              var part = location[k];
	              if(part !== '') {
	                s = s[part];
	                if(typeof s !== 'undefined') {
	                  r = s;
	                }
	                else {
	                  r = null;
	                  break;
	                }
	              }
	            }
	            if(r === null) {
	              // must resolve this too
	              toResolve.push(a);
	            }
	          }
	        }
	      }
	      else {
	        if (a.resolveAs === 'inline') {
	          if(a.key && a.key.indexOf('#') === -1 && a.key.charAt(0) !== '/') {
	            // handle relative schema
	            parts = a.root.split('/');
	            location = '';
	            for(i = 0; i < parts.length - 1; i++) {
	              location += parts[i] + '/';
	            }
	            location += a.key;
	            a.root = location;
	            a.location = '';
	          }
	          toResolve.push(a);
	        }
	      }
	    }
	    else {
	      toResolve.push(a);
	    }
	  }
	  expectedCalls = toResolve.length;
	
	  // resolve anything that is local
	
	  var lock = {};
	  for(var ii = 0; ii < toResolve.length; ii++) {
	    (function(item, spec, self, lock, ii) {
	      if(!item.root || item.root === root) {
	        // local resolve
	        self.resolveItem(spec, _root, resolutionTable, resolvedRefs, unresolvedRefs, item);
	        processedCalls += 1;
	
	        if(processedCalls === expectedCalls) {
	          self.finish(spec, root, resolutionTable, resolvedRefs, unresolvedRefs, callback, true);
	        }
	      }
	      else if(self.failedUrls.indexOf(item.root) === -1) {
	        var obj = {
	          useJQuery: false,  // TODO
	          url: item.root,
	          method: 'get',
	          headers: {
	            accept: self.scope.swaggerRequestHeaders || 'application/json'
	          },
	          on: {
	            error: function (error) {
	              processedCalls += 1;
	              console.log('failed url: ' + obj.url);
	              self.failedUrls.push(obj.url);
	              if (lock) {
	                delete lock[item.root];
	              }
	              unresolvedRefs[item.key] = {
	                root: item.root,
	                location: item.location
	              };
	
	              if (processedCalls === expectedCalls) {
	                self.finish(spec, _root, resolutionTable, resolvedRefs, unresolvedRefs, callback);
	              }
	            },  // jshint ignore:line
	            response: function (response) {
	              var swagger = response.obj;
	              if (lock) {
	                delete lock[item.root];
	              }
	              if (self.resolverCache) {
	                self.resolverCache[item.root] = swagger;
	              }
	              self.resolveItem(swagger, item.root, resolutionTable, resolvedRefs, unresolvedRefs, item);
	              processedCalls += 1;
	
	              if (processedCalls === expectedCalls) {
	                self.finish(spec, _root, resolutionTable, resolvedRefs, unresolvedRefs, callback);
	              }
	            }
	          } // jshint ignore:line
	        };
	
	        // apply timeout only when specified
	        if (scope && scope.fetchSpecTimeout) {
	          obj.timeout = scope.fetchSpecTimeout;
	        }
	
	        if (scope && scope.clientAuthorizations) {
	          scope.clientAuthorizations.apply(obj);
	        }
	
	        (function waitForUnlock() {
	          setTimeout(function() {
	            if (lock[obj.url]) {
	              waitForUnlock();
	            }
	            else {
	              var cached = self.resolverCache[obj.url];
	              if (_.isObject(cached)) {
	                obj.on.response({obj: cached});
	              }
	              else {
	                lock[obj.url] = true;
	                new SwaggerHttp().execute(obj, opts);
	              }
	            }
	          }, 0);
	        })();
	      }
	
	      else {
	        processedCalls += 1;
	        unresolvedRefs[item.key] = {
	          root: item.root,
	          location: item.location
	        };
	        if (processedCalls === expectedCalls) {
	          self.finish(spec, _root, resolutionTable, resolvedRefs, unresolvedRefs, callback);
	        }
	      }
	    }(toResolve[ii], spec, this, lock, ii));
	  }
	
	  if (Object.keys(toResolve).length === 0) {
	    this.finish(spec, _root, resolutionTable, resolvedRefs, unresolvedRefs, callback);
	  }
	};
	
	Resolver.prototype.resolveItem = function(spec, root, resolutionTable, resolvedRefs, unresolvedRefs, item) {
	  var path = item.location;
	  var location = spec, parts = path.split('/');
	  if(path !== '') {
	    for (var j = 0; j < parts.length; j++) {
	      var segment = parts[j];
	      if (segment.indexOf('~1') !== -1) {
	        segment = parts[j].replace(/~0/g, '~').replace(/~1/g, '/');
	        if (segment.charAt(0) !== '/') {
	          segment = '/' + segment;
	        }
	      }
	      if (typeof location === 'undefined' || location === null) {
	        break;
	      }
	      if (segment === '' && j === (parts.length - 1) && parts.length > 1) {
	        location = null;
	        break;
	      }
	      if (segment.length > 0) {
	        location = location[segment];
	      }
	    }
	  }
	  var resolved = item.key;
	  parts = item.key.split('/');
	  var resolvedName = parts[parts.length-1];
	
	  if(resolvedName.indexOf('#') >= 0) {
	    resolvedName = resolvedName.split('#')[1];
	  }
	
	  if (location !== null && typeof location !== 'undefined') {
	    resolvedRefs[resolved] = {
	      name: resolvedName,
	      obj: location,
	      key: item.key,
	      root: item.root
	    };
	  } else {
	    unresolvedRefs[resolved] = {
	      root: item.root,
	      location: item.location
	    };
	  }
	};
	
	Resolver.prototype.finish = function (spec, root, resolutionTable, resolvedRefs, unresolvedRefs, callback, localResolve) {
	  // walk resolution table and replace with resolved refs
	  var ref, abs;
	  for (ref in resolutionTable) {
	    var item = resolutionTable[ref];
	
	    var key = item.key;
	    var resolvedTo = resolvedRefs[key];
	    if (resolvedTo) {
	      spec.definitions = spec.definitions || {};
	      if (item.resolveAs === 'ref') {
	        if (localResolve !== true) {
	          // don't retain root for local definitions
	          for (key in resolvedTo.obj) {
	            abs = this.retainRoot(key, resolvedTo.obj[key], item.root);
	            resolvedTo.obj[key] = abs;
	          }
	        }
	        spec.definitions[resolvedTo.name] = resolvedTo.obj;
	        item.obj.$ref = '#/definitions/' + resolvedTo.name;
	      } else if (item.resolveAs === 'inline') {
	        var targetObj = item.obj;
	        targetObj['x-resolved-from'] = [ item.key ];
	        delete targetObj.$ref;
	
	        for (key in resolvedTo.obj) {
	          abs = resolvedTo.obj[key];
	
	          if (localResolve !== true) {
	            // don't retain root for local definitions
	            abs = this.retainRoot(key, resolvedTo.obj[key], item.root);
	          }
	          targetObj[key] = abs;
	        }
	      }
	    }
	  }
	  var existingUnresolved = this.countUnresolvedRefs(spec);
	
	  if(existingUnresolved === 0 || this.iteration > 5) {
	    this.resolveAllOf(spec.definitions);
	    this.resolverCache = null;
	    callback.call(this.scope, spec, unresolvedRefs);
	  }
	  else {
	    this.iteration += 1;
	    this.resolve(spec, root, callback, this.scope);
	  }
	};
	
	Resolver.prototype.countUnresolvedRefs = function(spec) {
	  var i;
	  var refs = this.getRefs(spec);
	  var keys = [];
	  var unresolvedKeys = [];
	  for(i in refs) {
	    if(i.indexOf('#') === 0) {
	      keys.push(i.substring(1));
	    }
	    else {
	      unresolvedKeys.push(i);
	    }
	  }
	
	  // verify possible keys
	  for (i = 0; i < keys.length; i++) {
	    var part = keys[i];
	    var parts = part.split('/');
	    var obj = spec;
	
	    for (var k = 0; k < parts.length; k++) {
	      var key = parts[k];
	      if(key !== '') {
	        obj = obj[key];
	        if(typeof obj === 'undefined') {
	          unresolvedKeys.push(part);
	          break;
	        }
	      }
	    }
	  }
	  return unresolvedKeys.length;
	};
	
	Resolver.prototype.getRefs = function(spec, obj) {
	  obj = obj || spec;
	  var output = {};
	  for(var key in obj) {
	    if (!obj.hasOwnProperty(key)) {
	      continue;
	    }
	    var item = obj[key];
	    if(key === '$ref' && typeof item === 'string') {
	      output[item] = null;
	    }
	    else if(_.isObject(item)) {
	      var o = this.getRefs(item);
	      for(var k in o) {
	        output[k] = null;
	      }
	    }
	  }
	  return output;
	};
	
	function splitUrl(url) {
	  var result = {};
	  var proto = /[a-z]+:\/\//i.exec(url);
	  if (proto) {
	    result.proto = proto[0].slice(0, -3);
	    url = url.slice(result.proto.length + 1);
	  }
	  if (url.slice(0, 2) === '//') {
	    result.domain = url.slice(2).split('/')[0];
	    url = url.slice(2 + result.domain.length);
	  }
	  var p = url.split('#');
	  if (p[0].length) {
	    result.path = p[0];
	  }
	  if (p.length > 1) {
	    result.fragment = p.slice(1).join('#');
	  }
	  return result;
	}
	
	function unsplitUrl(url) {
	  var result = url.path;
	  if (result === undefined) {
	    result = '';
	  }
	  if (url.fragment !== undefined) {
	    result += '#' + url.fragment;
	  }
	  if (url.domain !== undefined) {
	    if (result.slice(0, 1) === '/') {
	      result = result.slice(1);
	    }
	    result = '//' + url.domain + '/' + result;
	    if (url.proto !== undefined) {
	      result = url.proto + ':' + result;
	    }
	  }
	  return result;
	}
	
	function joinUrl(base, rel) {
	  var relsp = splitUrl(rel);
	  if (relsp.domain !== undefined) {
	    return rel;
	  }
	  var result = splitUrl(base);
	  if (relsp.path === undefined) {
	    // change only fragment part
	    result.fragment = relsp.fragment;
	  } else if (relsp.path.slice(0, 1) === '/') {
	    // relative to domain
	    result.path = relsp.path;
	    result.fragment = relsp.fragment;
	  } else {
	    // relative to path
	    var path = result.path === undefined ? [] : result.path.split('/');
	    var relpath = relsp.path.split('/');
	    if (path.length) {
	      path.pop();
	    }
	    while (relpath[0] === '..' || relpath[0] === '.') {
	      if (relpath[0] === '..') {
	        path.pop();
	      }
	      relpath.shift();
	    }
	    result.path = path.concat(relpath).join('/');
	    result.fragment = relsp.fragment;
	  }
	  return unsplitUrl(result);
	}
	
	Resolver.prototype.retainRoot = function(origKey, obj, root) {
	  // walk object and look for relative $refs
	  if(_.isObject(obj)) {
	    for(var key in obj) {
	      var item = obj[key];
	      if (key === '$ref' && typeof item === 'string') {
	        obj[key] = joinUrl(root, item);
	      }
	      else if (_.isObject(item)) {
	        this.retainRoot(key, item, root);
	      }
	    }
	  }
	  else if(_.isString(obj) && origKey === '$ref') {
	    obj = joinUrl(root, obj);
	  }
	  return obj;
	};
	
	/**
	 * immediately in-lines local refs, queues remote refs
	 * for inline resolution
	 */
	Resolver.prototype.resolveInline = function (root, spec, property, resolutionTable, unresolvedRefs, location) {
	  var key = property.$ref, ref = property.$ref, i, p, p2, rs;
	  var rootTrimmed = false;
	
	  root = root || ''; // Guard against .split. @fehguy, you'll need to check if this logic fits
	  // More imporantly is how do we gracefully handle relative urls, when provided just a 'spec', not a 'url' ?
	
	  if (ref) {
	    if(ref.indexOf('../') === 0) {
	      // reset root
	      p = ref.split('../');
	      p2 = root.split('/');
	      ref = '';
	      for(i = 0; i < p.length; i++) {
	        if(p[i] === '') {
	          p2 = p2.slice(0, p2.length-1);
	        }
	        else {
	          ref += p[i];
	        }
	      }
	      root = '';
	      for(i = 0; i < p2.length - 1; i++) {
	        if(i > 0) { root += '/'; }
	        root += p2[i];
	      }
	      rootTrimmed = true;
	    }
	    if(ref.indexOf('#') >= 0) {
	      if(ref.indexOf('/') === 0) {
	        rs = ref.split('#');
	        p  = root.split('//');
	        p2 = p[1].split('/');
	        root = p[0] + '//' + p2[0] + rs[0];
	        location = rs[1];
	      }
	      else {
	        rs = ref.split('#');
	        if(rs[0] !== '') {
	          p2 = root.split('/');
	          p2 = p2.slice(0, p2.length - 1);
	          if(!rootTrimmed) {
	            root = '';
	            for (var k = 0; k < p2.length; k++) {
	              if(k > 0) { root += '/'; }
	              root += p2[k];
	            }
	          }
	          root += '/' + ref.split('#')[0];
	        }
	        location = rs[1];
	      }
	    }
	    if (ref.indexOf('http:') === 0 || ref.indexOf('https:') === 0) {
	      if(ref.indexOf('#') >= 0) {
	        root = ref.split('#')[0];
	        location = ref.split('#')[1];
	      }
	      else {
	        root = ref;
	        location = '';
	      }
	      resolutionTable.push({obj: property, resolveAs: 'inline', root: root, key: key, location: location});
	    } else if (ref.indexOf('#') === 0) {
	      location = ref.split('#')[1];
	      resolutionTable.push({obj: property, resolveAs: 'inline', root: root, key: key, location: location});
	    } else if (ref.indexOf('/') === 0 && ref.indexOf('#') === -1) {
	      location = ref;
	      var matches = root.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
	      if(matches) {
	        root = matches[0] + ref.substring(1);
	        location = '';
	      }
	      resolutionTable.push({obj: property, resolveAs: 'inline', root: root, key: key, location: location});
	    }
	    else {
	      resolutionTable.push({obj: property, resolveAs: 'inline', root: root, key: key, location: location});
	    }
	  }
	  else if (property.type === 'array') {
	    this.resolveTo(root, property.items, resolutionTable, location);
	  }
	};
	
	Resolver.prototype.resolveTo = function (root, property, resolutionTable, location) {
	  var sp, i;
	  var ref = property.$ref;
	  var lroot = root;
	  if ((typeof ref !== 'undefined') && (ref !== null)) {
	    if(ref.indexOf('#') >= 0) {
	      var parts = ref.split('#');
	
	      // #/definitions/foo
	      // foo.json#/bar
	      if(parts[0] && ref.indexOf('/') === 0) {
	
	      }
	      else if(parts[0] && (parts[0].indexOf('http:') === 0 || parts[0].indexOf('https:') === 0)) {
	        lroot = parts[0];
	        ref = parts[1];
	      }
	      else if(parts[0] && parts[0].length > 0) {
	        // relative file
	        sp = root.split('/');
	        lroot = '';
	        for(i = 0; i < sp.length - 1; i++) {
	          lroot += sp[i] + '/';
	        }
	        lroot += parts[0];
	      }
	      else {
	
	      }
	
	      location = parts[1];
	    }
	    else if (ref.indexOf('http:') === 0 || ref.indexOf('https:') === 0) {
	      lroot = ref;
	      location = '';
	    }
	    else {
	      // relative file
	      sp = root.split('/');
	      lroot = '';
	      for(i = 0; i < sp.length - 1; i++) {
	        lroot += sp[i] + '/';
	      }
	      lroot += ref;
	      location = '';
	    }
	    resolutionTable.push({
	      obj: property, resolveAs: 'ref', root: lroot, key: ref, location: location
	    });
	  } else if (property.type === 'array') {
	    var items = property.items;
	    this.resolveTo(root, items, resolutionTable, location);
	  } else {
	    if(property && (property.properties || property.additionalProperties)) {
	      var name = this.uniqueName('inline_model');
	      if (property.title) {
	        name = this.uniqueName(property.title);
	      }
	      delete property.title;
	      this.spec.definitions[name] = _.cloneDeep(property);
	      property.$ref = '#/definitions/' + name;
	      delete property.type;
	      delete property.properties;
	    }
	  }
	};
	
	Resolver.prototype.uniqueName = function(base) {
	  var name = base;
	  var count = 0;
	  while(true) {
	    if(!_.isObject(this.spec.definitions[name])) {
	      return name;
	    }
	    name = base + '_' + count;
	    count++;
	  }
	};
	
	Resolver.prototype.resolveAllOf = function(spec, obj, depth) {
	  depth = depth || 0;
	  obj = obj || spec;
	  var name;
	  for(var key in obj) {
	    if (!obj.hasOwnProperty(key)) {
	      continue;
	    }
	    var item = obj[key];
	    if(item === null) {
	      throw new TypeError('Swagger 2.0 does not support null types (' + obj + ').  See https://github.com/swagger-api/swagger-spec/issues/229.');
	    }
	    if(typeof item === 'object') {
	      this.resolveAllOf(spec, item, depth + 1);
	    }
	    if(item && typeof item.allOf !== 'undefined') {
	      var allOf = item.allOf;
	      if(_.isArray(allOf)) {
	        var output = _.cloneDeep(item);
	        delete output.allOf;
	
	        output['x-composed'] = true;
	        if (typeof item['x-resolved-from'] !== 'undefined') {
	          output['x-resolved-from'] = item['x-resolved-from'];
	        }
	
	        for(var i = 0; i < allOf.length; i++) {
	          var component = allOf[i];
	          var source = 'self';
	          if(typeof component['x-resolved-from'] !== 'undefined') {
	            source = component['x-resolved-from'][0];
	          }
	
	          for(var part in component) {
	            if(!output.hasOwnProperty(part)) {
	              output[part] = _.cloneDeep(component[part]);
	              if(part === 'properties') {
	                for(name in output[part]) {
	                  output[part][name]['x-resolved-from'] = source;
	                }
	              }
	            }
	            else {
	              if(part === 'properties') {
	                var properties = component[part];
	                for(name in properties) {
	                  output.properties[name] = _.cloneDeep(properties[name]);
	                  var resolvedFrom = properties[name]['x-resolved-from'];
	                  if (typeof resolvedFrom === 'undefined' || resolvedFrom === 'self') {
	                    resolvedFrom = source;
	                  }
	                  output.properties[name]['x-resolved-from'] = resolvedFrom;
	                }
	              }
	              else if(part === 'required') {
	                // merge & dedup the required array
	                var a = output.required.concat(component[part]);
	                for(var k = 0; k < a.length; ++k) {
	                  for(var j = k + 1; j < a.length; ++j) {
	                    if(a[k] === a[j]) { a.splice(j--, 1); }
	                  }
	                }
	                output.required = a;
	              }
	              else if(part === 'x-resolved-from') {
	                output['x-resolved-from'].push(source);
	              }
	              else {
	                // TODO: need to merge this property
	                // console.log('what to do with ' + part)
	              }
	            }
	          }
	        }
	        obj[key] = output;
	      }
	    }
	  }
	};


/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var SwaggerHttp = __webpack_require__(154);
	var _ = {
	  isObject: __webpack_require__(10)
	};
	
	var SwaggerSpecConverter = module.exports = function () {
	  this.errors = [];
	  this.warnings = [];
	  this.modelMap = {};
	};
	
	SwaggerSpecConverter.prototype.setDocumentationLocation = function (location) {
	  this.docLocation = location;
	};
	
	/**
	 * converts a resource listing OR api declaration
	 **/
	SwaggerSpecConverter.prototype.convert = function (obj, clientAuthorizations, opts, callback) {
	  // not a valid spec
	  if(!obj || !Array.isArray(obj.apis)) {
	    return this.finish(callback, null);
	  }
	  this.clientAuthorizations = clientAuthorizations;
	
	  // create a new swagger object to return
	  var swagger = { swagger: '2.0' };
	
	  swagger.originalVersion = obj.swaggerVersion;
	
	  // add the info
	  this.apiInfo(obj, swagger);
	
	  // add security definitions
	  this.securityDefinitions(obj, swagger);
	
	  // take basePath into account
	  if (obj.basePath) {
	    this.setDocumentationLocation(obj.basePath);
	  }
	
	  // see if this is a single-file swagger definition
	  var isSingleFileSwagger = false;
	  var i;
	  for(i = 0; i < obj.apis.length; i++) {
	    var api = obj.apis[i];
	    if(Array.isArray(api.operations)) {
	      isSingleFileSwagger = true;
	    }
	  }
	  if(isSingleFileSwagger) {
	    this.declaration(obj, swagger);
	    this.finish(callback, swagger);
	  }
	  else {
	    this.resourceListing(obj, swagger, opts, callback);
	  }
	};
	
	SwaggerSpecConverter.prototype.declaration = function(obj, swagger) {
	  var name, i, p, pos;
	  if(!obj.apis) {
	    return;
	  }
	
	  if (obj.basePath.indexOf('http://') === 0) {
	    p = obj.basePath.substring('http://'.length);
	    pos = p.indexOf('/');
	    if (pos > 0) {
	      swagger.host = p.substring(0, pos);
	      swagger.basePath = p.substring(pos);
	    }
	    else {
	      swagger.host = p;
	      swagger.basePath = '/';
	    }
	  } else if (obj.basePath.indexOf('https://') === 0) {
	    p = obj.basePath.substring('https://'.length);
	    pos = p.indexOf('/');
	    if (pos > 0) {
	      swagger.host = p.substring(0, pos);
	      swagger.basePath = p.substring(pos);
	    }
	    else {
	      swagger.host = p;
	      swagger.basePath = '/';
	    }
	  } else {
	    swagger.basePath = obj.basePath;
	  }
	
	  var resourceLevelAuth;
	  if(obj.authorizations) {
	    resourceLevelAuth = obj.authorizations;
	  }
	  if(obj.consumes) {
	    swagger.consumes = obj.consumes;
	  }
	  if(obj.produces) {
	    swagger.produces = obj.produces;
	  }
	
	  // build a mapping of id to name for 1.0 model resolutions
	  if(_.isObject(obj)) {
	    for(name in obj.models) {
	      var existingModel = obj.models[name];
	      var key = (existingModel.id || name);
	      this.modelMap[key] = name;
	    }
	  }
	
	  for(i = 0; i < obj.apis.length; i++) {
	    var api = obj.apis[i];
	    var path = api.path;
	    var operations = api.operations;
	    this.operations(path, obj.resourcePath, operations, resourceLevelAuth, swagger);
	  }
	
	  var models = obj.models || {};
	  this.models(models, swagger);
	};
	
	SwaggerSpecConverter.prototype.models = function(obj, swagger) {
	  if(!_.isObject(obj)) {
	    return;
	  }
	  var name;
	
	  swagger.definitions = swagger.definitions || {};
	  for(name in obj) {
	    var existingModel = obj[name];
	    var _required = [];
	    var schema = { properties: {}};
	    var propertyName;
	    for(propertyName in existingModel.properties) {
	      var existingProperty = existingModel.properties[propertyName];
	      var property = {};
	      this.dataType(existingProperty, property);
	      if(existingProperty.description) {
	        property.description = existingProperty.description;
	      }
	      if(existingProperty['enum']) {
	        property['enum'] = existingProperty['enum'];
	      }
	      if(typeof existingProperty.required === 'boolean' && existingProperty.required === true) {
	        _required.push(propertyName);
	      }
	      if(typeof existingProperty.required === 'string' && existingProperty.required === 'true') {
	        _required.push(propertyName);
	      }
	      schema.properties[propertyName] = property;
	    }
	    if(_required.length > 0) {
	      schema.required = _required;
	    } else {
	      schema.required = existingModel.required;
	    }
	    swagger.definitions[name] = schema;
	  }
	};
	
	SwaggerSpecConverter.prototype.extractTag = function(resourcePath) {
	  var pathString = resourcePath || 'default';
	  if(pathString.indexOf('http:') === 0 || pathString.indexOf('https:') === 0) {
	    pathString = pathString.split(['/']);
	    pathString = pathString[pathString.length -1].substring();
	  }
	  if(pathString.endsWith('.json')) {
	    pathString = pathString.substring(0, pathString.length - '.json'.length);
	  }
	  return pathString.replace('/','');
	};
	
	SwaggerSpecConverter.prototype.operations = function(path, resourcePath, obj, resourceLevelAuth, swagger) {
	  if(!Array.isArray(obj)) {
	    return;
	  }
	  var i;
	
	  if(!swagger.paths) {
	    swagger.paths = {};
	  }
	
	  var pathObj = swagger.paths[path] || {};
	  var tag = this.extractTag(resourcePath);
	  swagger.tags = swagger.tags || [];
	  var matched = false;
	  for(i = 0; i < swagger.tags.length; i++) {
	    var tagObject = swagger.tags[i];
	    if(tagObject.name === tag) {
	      matched = true;
	    }
	  }
	  if(!matched) {
	    swagger.tags.push({name: tag});
	  }
	
	  for(i = 0; i < obj.length; i++) {
	    var existingOperation = obj[i];
	    var method = (existingOperation.method || existingOperation.httpMethod).toLowerCase();
	    var operation = {tags: [tag]};
	    var existingAuthorizations = existingOperation.authorizations;
	
	    if(existingAuthorizations && Object.keys(existingAuthorizations).length === 0) {
	      existingAuthorizations = resourceLevelAuth;
	    }
	
	    if(typeof existingAuthorizations !== 'undefined') {
	      var scopesObject;
	      for(var key in existingAuthorizations) {
	        operation.security = operation.security || [];
	        var scopes = existingAuthorizations[key];
	        if(scopes) {
	          var securityScopes = [];
	          for(var j in scopes) {
	            securityScopes.push(scopes[j].scope);
	          }
	          scopesObject = {};
	          scopesObject[key] = securityScopes;
	          operation.security.push(scopesObject);
	        }
	        else {
	          scopesObject = {};
	          scopesObject[key] = [];
	          operation.security.push(scopesObject);
	        }
	      }
	    }
	
	    if(existingOperation.consumes) {
	      operation.consumes = existingOperation.consumes;
	    }
	    else if(swagger.consumes) {
	      operation.consumes = swagger.consumes;
	    }
	    if(existingOperation.produces) {
	      operation.produces = existingOperation.produces;
	    }
	    else if(swagger.produces) {
	      operation.produces = swagger.produces;
	    }
	    if(existingOperation.summary) {
	      operation.summary = existingOperation.summary;
	    }
	    if(existingOperation.notes) {
	      operation.description = existingOperation.notes;
	    }
	    if(existingOperation.nickname) {
	      operation.operationId = existingOperation.nickname;
	    }
	    if(existingOperation.deprecated) {
	      operation.deprecated = existingOperation.deprecated;
	    }
	
	    this.authorizations(existingAuthorizations, swagger);
	    this.parameters(operation, existingOperation.parameters, swagger);
	    this.responseMessages(operation, existingOperation, swagger);
	
	    pathObj[method] = operation;
	  }
	
	  swagger.paths[path] = pathObj;
	};
	
	SwaggerSpecConverter.prototype.responseMessages = function(operation, existingOperation) {
	  if(!_.isObject(existingOperation)) {
	    return;
	  }
	  // build default response from the operation (1.x)
	  var defaultResponse = {};
	  this.dataType(existingOperation, defaultResponse);
	  // TODO: look into the real problem of rendering responses in swagger-ui
	  // ....should reponseType have an implicit schema?
	  if(!defaultResponse.schema && defaultResponse.type) {
	    defaultResponse = {schema: defaultResponse};
	  }
	
	  operation.responses = operation.responses || {};
	
	  // grab from responseMessages (1.2)
	  var has200 = false;
	  if(Array.isArray(existingOperation.responseMessages)) {
	    var i;
	    var existingResponses = existingOperation.responseMessages;
	    for(i = 0; i < existingResponses.length; i++) {
	      var existingResponse = existingResponses[i];
	      var response = { description: existingResponse.message };
	      if(existingResponse.code === 200) {
	        has200 = true;
	      }
	      // Convert responseModel -> schema{$ref: responseModel}
	      if(existingResponse.responseModel) {
	        response.schema = {'$ref': '#/definitions/' + existingResponse.responseModel};
	      }
	      operation.responses['' + existingResponse.code] = response;
	    }
	  }
	
	  if(has200) {
	    operation.responses['default'] = defaultResponse;
	  }
	  else {
	    operation.responses['200'] = defaultResponse;
	  }
	};
	
	SwaggerSpecConverter.prototype.authorizations = function(obj) {
	  // TODO
	  if(!_.isObject(obj)) {
	    return;
	  }
	};
	
	SwaggerSpecConverter.prototype.parameters = function(operation, obj) {
	  if(!Array.isArray(obj)) {
	    return;
	  }
	  var i;
	  for(i = 0; i < obj.length; i++) {
	    var existingParameter = obj[i];
	    var parameter = {};
	    parameter.name = existingParameter.name;
	    parameter.description = existingParameter.description;
	    parameter.required = existingParameter.required;
	    parameter.in = existingParameter.paramType;
	
	    // per #168
	    if(parameter.in === 'body') {
	      parameter.name = 'body';
	    }
	    if(parameter.in === 'form') {
	      parameter.in = 'formData';
	    }
	
	    if(existingParameter.enum) {
	      parameter.enum = existingParameter.enum;
	    }
	
	    if(existingParameter.allowMultiple === true || existingParameter.allowMultiple === 'true') {
	      var innerType = {};
	      this.dataType(existingParameter, innerType);
	      parameter.type = 'array';
	      parameter.items = innerType;
	
	      if(existingParameter.allowableValues) {
	        var av = existingParameter.allowableValues;
	        if(av.valueType === 'LIST') {
	          parameter['enum'] = av.values;
	        }
	      }
	    }
	    else {
	      this.dataType(existingParameter, parameter);
	    }
	    if(typeof existingParameter.defaultValue !== 'undefined') {
	      parameter.default = existingParameter.defaultValue;
	    }
	
	    operation.parameters = operation.parameters || [];
	    operation.parameters.push(parameter);
	  }
	};
	
	SwaggerSpecConverter.prototype.dataType = function(source, target) {
	  if(!_.isObject(source)) {
	    return;
	  }
	
	  if(source.minimum) {
	    target.minimum = source.minimum;
	  }
	  if(source.maximum) {
	    target.maximum = source.maximum;
	  }
	  if (source.format) {
	    target.format = source.format;
	  }
	
	  // default can be 'false'
	  if(typeof source.defaultValue !== 'undefined') {
	    target.default = source.defaultValue;
	  }
	
	  var jsonSchemaType = this.toJsonSchema(source);
	  if(jsonSchemaType) {
	    target = target || {};
	    if(jsonSchemaType.type) {
	      target.type = jsonSchemaType.type;
	    }
	    if(jsonSchemaType.format) {
	      target.format = jsonSchemaType.format;
	    }
	    if(jsonSchemaType.$ref) {
	      target.schema = {$ref: jsonSchemaType.$ref};
	    }
	    if(jsonSchemaType.items) {
	      target.items = jsonSchemaType.items;
	    }
	  }
	};
	
	SwaggerSpecConverter.prototype.toJsonSchema = function(source) {
	  if(!source) {
	    return 'object';
	  }
	  var detectedType = (source.type || source.dataType || source.responseClass || '');
	  var lcType = detectedType.toLowerCase();
	  var format = (source.format || '').toLowerCase();
	
	  if(lcType.indexOf('list[') === 0) {
	    var innerType = detectedType.substring(5, detectedType.length - 1);
	    var jsonType = this.toJsonSchema({type: innerType});
	    return {type: 'array', items: jsonType};
	  } else if(lcType === 'int' || (lcType === 'integer' && format === 'int32')) {
	    {return {type: 'integer', format: 'int32'};}
	  } else if(lcType === 'long' || (lcType === 'integer' && format === 'int64')) {
	    {return {type: 'integer', format: 'int64'};}
	  } else if(lcType === 'integer') {
	    {return {type: 'integer', format: 'int64'};}
	  } else if(lcType === 'float' || (lcType === 'number' && format === 'float')) {
	    {return {type: 'number', format: 'float'};}
	  } else if(lcType === 'double' || (lcType === 'number' && format === 'double')) {
	    {return {type: 'number', format: 'double'};}
	  } else if((lcType === 'string' && format === 'date-time') || (lcType === 'date')) {
	    {return {type: 'string', format: 'date-time'};}
	  } else if(lcType === 'string') {
	    {return {type: 'string'};}
	  } else if(lcType === 'file') {
	    {return {type: 'file'};}
	  } else if(lcType === 'boolean') {
	    {return {type: 'boolean'};}
	  } else if(lcType === 'boolean') {
	    {return {type: 'boolean'};}
	  } else if(lcType === 'array' || lcType === 'list') {
	    if(source.items) {
	      var it = this.toJsonSchema(source.items);
	      return {type: 'array', items: it};
	    }
	    else {
	      return {type: 'array', items: {type: 'object'}};
	    }
	  } else if(source.$ref) {
	    return {$ref: this.modelMap[source.$ref] ? '#/definitions/' + this.modelMap[source.$ref] : source.$ref};
	  } else if(lcType === 'void' || lcType === '') {
	    {return {};}
	  } else if (this.modelMap[source.type]) {
	    // If this a model using `type` instead of `$ref`, that's fine.
	    return {$ref: '#/definitions/' + this.modelMap[source.type]};
	  } else {
	    // Unknown model type or 'object', pass it along.
	    return {type: source.type};
	  }
	};
	
	SwaggerSpecConverter.prototype.resourceListing = function(obj, swagger, opts, callback) {
	  var i;
	  var processedCount = 0;   // jshint ignore:line
	  var self = this;          // jshint ignore:line
	  var expectedCount = obj.apis.length;
	  var _swagger = swagger;   // jshint ignore:line
	  var _opts = {};
	
	  if(opts && opts.requestInterceptor){
	    _opts.requestInterceptor = opts.requestInterceptor;
	  }
	
	  if(opts && opts.responseInterceptor){
	    _opts.responseInterceptor = opts.responseInterceptor;
	  }
	
	  var swaggerRequestHeaders = 'application/json';
	
	  if(opts && opts.swaggerRequestHeaders) {
	    swaggerRequestHeaders = opts.swaggerRequestHeaders;
	  }
	
	  if(expectedCount === 0) {
	    this.finish(callback, swagger);
	  }
	
	  for(i = 0; i < expectedCount; i++) {
	    var api = obj.apis[i];
	    var path = api.path;
	    var absolutePath = this.getAbsolutePath(obj.swaggerVersion, this.docLocation, path);
	
	    if(api.description) {
	      swagger.tags = swagger.tags || [];
	      swagger.tags.push({
	        name : this.extractTag(api.path),
	        description : api.description || ''
	      });
	    }
	    var http = {
	      url: absolutePath,
	      headers: { accept: swaggerRequestHeaders },
	      on: {},
	      method: 'get',
	      timeout: opts.timeout
	    };
	    /* jshint ignore:start */
	    http.on.response = function(data) {
	      processedCount += 1;
	      var obj = data.obj;
	      if(obj) {
	        self.declaration(obj, _swagger);
	      }
	      if(processedCount === expectedCount) {
	        self.finish(callback, _swagger);
	      }
	    };
	    http.on.error = function(data) {
	      console.error(data);
	      processedCount += 1;
	      if(processedCount === expectedCount) {
	        self.finish(callback, _swagger);
	      }
	    };
	    /* jshint ignore:end */
	
	    if(this.clientAuthorizations && typeof this.clientAuthorizations.apply === 'function') {
	      this.clientAuthorizations.apply(http);
	    }
	
	    new SwaggerHttp().execute(http, _opts);
	  }
	};
	
	SwaggerSpecConverter.prototype.getAbsolutePath = function(version, docLocation, path)  {
	  if(version === '1.0') {
	    if(docLocation.endsWith('.json')) {
	      // get root path
	      var pos = docLocation.lastIndexOf('/');
	      if(pos > 0) {
	        docLocation = docLocation.substring(0, pos);
	      }
	    }
	  }
	
	  var location = docLocation;
	  if(path.indexOf('http:') === 0 || path.indexOf('https:') === 0) {
	    location = path;
	  }
	  else {
	    if(docLocation.endsWith('/')) {
	      location = docLocation.substring(0, docLocation.length - 1);
	    }
	    location += path;
	  }
	  location = location.replace('{format}', 'json');
	  return location;
	};
	
	SwaggerSpecConverter.prototype.securityDefinitions = function(obj, swagger) {
	  if(obj.authorizations) {
	    var name;
	    for(name in obj.authorizations) {
	      var isValid = false;
	      var securityDefinition = {
	        vendorExtensions: {}
	      };
	      var definition = obj.authorizations[name];
	      if(definition.type === 'apiKey') {
	        securityDefinition.type = 'apiKey';
	        securityDefinition.in = definition.passAs;
	        securityDefinition.name = definition.keyname || name;
	        isValid = true;
	      }
	      else if(definition.type === 'basicAuth') {
	        securityDefinition.type = 'basicAuth';
	        isValid = true;
	      }
	      else if(definition.type === 'oauth2') {
	        var existingScopes = definition.scopes || [];
	        var scopes = {};
	        var i;
	        for(i in existingScopes) {
	          var scope = existingScopes[i];
	          scopes[scope.scope] = scope.description;
	        }
	        securityDefinition.type = 'oauth2';
	        if(i > 0) {
	          securityDefinition.scopes = scopes;
	        }
	        if(definition.grantTypes) {
	          if(definition.grantTypes.implicit) {
	            var implicit = definition.grantTypes.implicit;
	            securityDefinition.flow = 'implicit';
	            securityDefinition.authorizationUrl = implicit.loginEndpoint;
	            isValid = true;
	          }
	          /* jshint ignore:start */
	          if(definition.grantTypes['authorization_code']) {
	            if(!securityDefinition.flow) {
	              // cannot set if flow is already defined
	              var authCode = definition.grantTypes['authorization_code'];
	              securityDefinition.flow = 'accessCode';
	              securityDefinition.authorizationUrl = authCode.tokenRequestEndpoint.url;
	              securityDefinition.tokenUrl = authCode.tokenEndpoint.url;
	              isValid = true;
	            }
	          }
	          /* jshint ignore:end */
	        }
	      }
	      if(isValid) {
	        swagger.securityDefinitions = swagger.securityDefinitions || {};
	        swagger.securityDefinitions[name] = securityDefinition;
	      }
	    }
	  }
	};
	
	SwaggerSpecConverter.prototype.apiInfo = function(obj, swagger) {
	  // info section
	  if(obj.info) {
	    var info = obj.info;
	    swagger.info = {};
	
	    if(info.contact) {
	      swagger.info.contact = {};
	      swagger.info.contact.email = info.contact;
	    }
	    if(info.description) {
	      swagger.info.description = info.description;
	    }
	    if(info.title) {
	      swagger.info.title = info.title;
	    }
	    if(info.termsOfServiceUrl) {
	      swagger.info.termsOfService = info.termsOfServiceUrl;
	    }
	    if(info.license || info.licenseUrl) {
	      swagger.license = {};
	      if(info.license) {
	        swagger.license.name = info.license;
	      }
	      if(info.licenseUrl) {
	        swagger.license.url = info.licenseUrl;
	      }
	    }
	  }
	  else {
	    this.warnings.push('missing info section');
	  }
	};
	
	SwaggerSpecConverter.prototype.finish = function (callback, obj) {
	  callback(obj);
	};


/***/ },
/* 165 */
/***/ function(module, exports) {

	module.exports = {
		"info": {
			"version": "3.0.0",
			"title": "Sketchfab API"
		},
		"paths": {
			"/v3/me/subscriptions/{uid}": {
				"delete": {
					"responses": {
						"204": {
							"description": "Successful delete"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"collections"
					],
					"description": "delete a subscription"
				}
			},
			"/v3/users": {
				"get": {
					"description": "Users endpoint for sketchfab api",
					"tags": [
						"users"
					],
					"responses": {
						"200": {
							"schema": {
								"$ref": "#/definitions/UserResponse"
							},
							"examples": {
								"application/json": {
									"response": {
										"count": 24,
										"next": "api.sketchfab.com/v3/users/cursor=azerty'",
										"results": [
											{
												"website": "http://mightypirate.com",
												"subscriptionCount": 4,
												"followerCount": 2,
												"uid": "a6a996ed17c343c58568984c9aa0eaf8",
												"modelsUrl": "https://api.sketchfab.com/v3/models?user=black.elm",
												"portfolioUrl": null,
												"likeCount": 6,
												"facebookUsername": "migthtypirate",
												"biography": "I am a mighty pirate",
												"city": "Toronto",
												"account": "free",
												"displayName": "black.elm",
												"profileUrl": "https://sketchfab.com/black.elm",
												"followingsUrl": "https://api.sketchfab.com/v3/users/followings/black.elm",
												"skills": [
													{
														"name": "IronCAD",
														"uri": "https://api.sketchfab.com/v3/skills/ironcad"
													},
													{
														"name": "Lightwave 3D",
														"uri": "https://api.sketchfab.com/v3/skills/lightwave-3d"
													}
												],
												"tagline": "I'm a mighty pirate!",
												"uri": "https://api.sketchfab.com/v3/users/a6a996ed17c343c58568984c9aa0eaf8",
												"dateJoined": "2015-08-20T12:23:00.135222",
												"modelCount": 0,
												"username": "black.elm",
												"linkedinUsername": "black.elm",
												"likesUrl": "https://api.sketchfab.com/v3/models?liked_by=black.elm",
												"followersUrl": "https://api.sketchfab.com/v3/users/followers/black.elm",
												"collectionCount": 5,
												"country": "Canada",
												"followingCount": 0,
												"twitterUsername": "black.elm",
												"collectionsUrl": "https://api.sketchfab.com/v3/collections?by=black.elm",
												"avatar": {
													"images": null,
													"updatedAt": "2016-04-05T08:55:27.489627",
													"name": "avatar-gray",
													"createdAt": "2016-04-05T08:55:27.489627",
													"uri": "https://api.sketchfab.com/v3/avatars/3ef1bd11d3eb4b57a0b353e8f2e5fc3e"
												}
											}
										],
										"previous": null
									}
								}
							},
							"description": "Successful response"
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "used for pagination",
							"in": "query",
							"name": "cursor"
						},
						{
							"required": false,
							"type": "integer",
							"description": "pagination size. max 24",
							"in": "query",
							"name": "count"
						},
						{
							"required": false,
							"type": "string",
							"description": "either dateJoined, -dateJoined, followerCount, -followerCount",
							"in": "query",
							"name": "sort_by"
						},
						{
							"required": false,
							"type": "string",
							"description": "search users by location",
							"in": "query",
							"name": "location"
						},
						{
							"required": false,
							"type": "string",
							"description": "search users by account type (free or pro)",
							"in": "query",
							"name": "account"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/search?type=collections": {
				"get": {
					"tags": [
						"search",
						"collections"
					],
					"responses": {
						"200": {
							"description": "Collections matching the search",
							"schema": {
								"$ref": "#/definitions/CollectionSearchResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"name": "q",
							"in": "query"
						},
						{
							"required": false,
							"type": "string",
							"description": "username of the owner",
							"in": "query",
							"name": "user"
						},
						{
							"required": false,
							"type": "string",
							"description": "either createdAt, -createdAt",
							"in": "query",
							"name": "sort_by"
						}
					],
					"description": "Search in collections"
				}
			},
			"/v3/avatars/{uid}": {
				"get": {
					"description": "returns a user avatar",
					"tags": [
						"avatars",
						"users"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/AvatarRelated"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/me/environments/{uid}": {
				"patch": {
					"responses": {
						"204": {
							"description": "Sucessfull update"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": true,
							"type": "string",
							"name": "name",
							"in": "formData"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"environment"
					],
					"description": "Update an environment. You need to have a pro account and you cannot update default environments\n"
				},
				"delete": {
					"responses": {
						"204": {
							"description": "Sucessfull deletion"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"environment"
					],
					"description": "Delete an environment. You need to have a pro account to perform this action. Default environments cannot be deleted\n"
				}
			},
			"/v3/collections": {
				"post": {
					"responses": {
						"201": {
							"description": "Successful create"
						}
					},
					"parameters": [
						{
							"required": true,
							"in": "body",
							"description": "collection definition",
							"name": "collection",
							"schema": {
								"$ref": "#/definitions/CollectionPost"
							}
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"collections"
					],
					"description": "Create a collection"
				},
				"get": {
					"description": "Return list of collections",
					"tags": [
						"collections"
					],
					"responses": {
						"200": {
							"schema": {
								"$ref": "#/definitions/CollectionResponse"
							},
							"examples": {
								"application/json": {
									"response": {
										"count": 24,
										"next": "api.sketchfab.com/v3/collections/count=24&offset=24'",
										"results": [
											{
												"name": "NSFW",
												"description": null,
												"uri": "https://api.sketchfab.com/v3/collections/14f64dc8402d4394bf35f9789be0890d",
												"modelCount": 0,
												"updatedAt": "2016-04-05T08:56:50.724723",
												"uid": "14f64dc8402d4394bf35f9789be0890d",
												"embedUrl": "https://sketchfab.com/playlists/embed?collection=14f64dc8402d4394bf35f9789be0890d",
												"slug": "nsfw",
												"createdAt": "2016-04-05T08:56:50.593513",
												"thumbnails": {
													"images": [
														{
															"url": "https://media.sketchfab.com/thumbnails/2aef175a85994e40b1bd097ba4eb4281/50x50.jpeg",
															"width": 50,
															"height": 50,
															"uid": "fa056d35c8f0472984c08f768bb9ff6e",
															"size": 344
														},
														{
															"url": "https://media.sketchfab.com/thumbnails/2aef175a85994e40b1bd097ba4eb4281/100x100.jpeg",
															"width": 100,
															"height": 100,
															"uid": "889e815c8e7e45b6ae790c9786b102e8",
															"size": 600
														},
														{
															"url": "https://media.sketchfab.com/thumbnails/2aef175a85994e40b1bd097ba4eb4281/200x200.jpeg",
															"width": 200,
															"height": 200,
															"uid": "6d44d308ed6e440f86fd5091f7b239e0",
															"size": 1380
														},
														{
															"url": "https://media.sketchfab.com/thumbnails/2aef175a85994e40b1bd097ba4eb4281/448x252.jpeg",
															"width": 448,
															"height": 252,
															"uid": "d23c2bef322b4f4aaab6cb1762614b0b",
															"size": 2922
														}
													],
													"uri": "https://api.sketchfab.com/v3/thumbnails/2aef175a85994e40b1bd097ba4eb4281"
												}
											}
										],
										"previous": null
									}
								}
							},
							"description": "Successfull result"
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "used for pagination",
							"in": "query",
							"name": "cursor"
						},
						{
							"required": false,
							"type": "string",
							"description": "search for collections created by a particular user (username)",
							"in": "query",
							"name": "user"
						},
						{
							"required": false,
							"type": "string",
							"description": "search for collections matching a list of uuids",
							"in": "query",
							"name": "uuids"
						},
						{
							"required": false,
							"type": "string",
							"description": "search for collections created since a date",
							"in": "query",
							"name": "createdSince"
						},
						{
							"required": false,
							"type": "string",
							"description": "number of objects returned per page. Max 24",
							"in": "query",
							"name": "count"
						},
						{
							"required": false,
							"type": "string",
							"description": "either createdAt -createdAt, subscriberCount or -subscriberCount",
							"in": "query",
							"name": "sort_by"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/skills/{slug}": {
				"get": {
					"tags": [
						"skills"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/SkillDetail"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "slug",
							"in": "path"
						}
					],
					"description": "get details about a skill"
				}
			},
			"/v3/me": {
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"description": "Return detail of the logged in user",
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/MeDetail"
							}
						}
					},
					"tags": [
						"me",
						"users"
					],
					"produces": [
						"application/json"
					]
				},
				"patch": {
					"responses": {
						"204": {
							"description": "Sucessfull update"
						}
					},
					"parameters": [
						{
							"required": true,
							"in": "body",
							"name": "profile",
							"schema": {
								"$ref": "#/definitions/MePatch"
							}
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me"
					],
					"description": "update profile informations"
				}
			},
			"/v3/users/{uid}/followers": {
				"get": {
					"description": "Returns users following a particular user",
					"tags": [
						"users",
						"relationships"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/UserResponse"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": false,
							"type": "string",
							"description": "used for pagination",
							"in": "query",
							"name": "cursor"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/me/followings/{uid}": {
				"delete": {
					"responses": {
						"204": {
							"description": "Sucessfull removal"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"users",
						"relationships"
					],
					"description": "stop following a user"
				}
			},
			"/v3/models/{uid}": {
				"put": {
					"description": "reupload your model",
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": false,
							"type": "string",
							"description": "model name",
							"in": "formData",
							"name": "name"
						},
						{
							"required": false,
							"type": "boolean",
							"description": "this model should be private? (default false)",
							"in": "formData",
							"name": "private"
						},
						{
							"required": false,
							"type": "string",
							"description": "set a password on the model",
							"in": "formData",
							"name": "password"
						},
						{
							"required": false,
							"type": "string",
							"description": "name of an existing license",
							"in": "formData",
							"name": "licence"
						},
						{
							"required": false,
							"type": "string",
							"description": "comma separated list of tag slugs",
							"in": "formData",
							"name": "tags"
						},
						{
							"required": false,
							"type": "string",
							"description": "comma separated list of categories slug",
							"in": "formData",
							"name": "categories"
						},
						{
							"required": true,
							"type": "file",
							"description": "the actual model",
							"in": "formData",
							"name": "modelFile"
						},
						{
							"required": false,
							"type": "string",
							"description": "the model file name",
							"in": "formData",
							"name": "modelFileName"
						},
						{
							"required": false,
							"type": "boolean",
							"description": "weither the model is published or not (default true)",
							"in": "formData",
							"name": "is_published"
						},
						{
							"required": false,
							"type": "string",
							"description": "model description",
							"in": "formData",
							"name": "description"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"models"
					],
					"consumes": [
						"multipart/form-data"
					],
					"responses": {
						"204": {
							"description": "No Content"
						},
						"401": {
							"description": "Authentication credentials were not provided or does not match"
						}
					}
				},
				"get": {
					"description": "Returns details about a model.",
					"tags": [
						"models"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/ModelDetail"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					]
				},
				"patch": {
					"responses": {
						"204": {
							"description": "No Content"
						},
						"401": {
							"description": "Authentication credentials were not provided or does not match"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": true,
							"in": "body",
							"description": "model definition",
							"name": "model",
							"schema": {
								"$ref": "#/definitions/ModelPatch"
							}
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"models"
					],
					"description": "change some aspect of your model"
				}
			},
			"/v3/search?type=models": {
				"get": {
					"tags": [
						"search",
						"models"
					],
					"responses": {
						"200": {
							"description": "Models matching the search",
							"schema": {
								"$ref": "#/definitions/ModelSearchResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"name": "q",
							"in": "query"
						},
						{
							"required": false,
							"type": "string",
							"description": "username of the owner",
							"in": "query",
							"name": "user"
						},
						{
							"required": false,
							"type": "array",
							"description": "tags slugs",
							"in": "query",
							"name": "tags"
						},
						{
							"required": false,
							"type": "array",
							"description": "categories slugs",
							"in": "query",
							"name": "categories"
						},
						{
							"required": false,
							"type": "array",
							"description": "either pending, processing, succeeded, failed",
							"in": "query",
							"name": "processing_status"
						},
						{
							"required": false,
							"type": "boolean",
							"name": "published",
							"in": "query"
						},
						{
							"required": false,
							"type": "integer",
							"description": "number of days since the model was created",
							"in": "query",
							"name": "date"
						},
						{
							"required": false,
							"type": "string",
							"description": "either downloadable, animated",
							"in": "query",
							"name": "features"
						},
						{
							"required": false,
							"type": "string",
							"description": "either staffpicked, brands",
							"in": "query",
							"name": "flag"
						},
						{
							"required": false,
							"type": "integer",
							"description": "filters out models with less faces",
							"in": "query",
							"name": "face_count"
						},
						{
							"required": false,
							"type": "string",
							"description": "uid of a collection",
							"in": "query",
							"name": "collection"
						},
						{
							"required": false,
							"type": "string",
							"description": "either publishedAt, -publishedAt, processedAt or -processedAt",
							"in": "query",
							"name": "sort_by"
						}
					],
					"description": "Search and filters in models"
				}
			},
			"/v3/me/followers": {
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"users",
						"relationships"
					],
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/UserResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "number of objects returned per page. Max 24",
							"in": "query",
							"name": "count"
						},
						{
							"required": false,
							"type": "string",
							"description": "Either dateJoined, -dateJoined, followerCount or -followerCount",
							"in": "query",
							"name": "sortBy"
						},
						{
							"required": false,
							"type": "string",
							"description": "used for pagination",
							"in": "query",
							"name": "cursor"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/search": {
				"get": {
					"tags": [
						"search",
						"models",
						"users",
						"collections"
					],
					"responses": {
						"200": {
							"description": "Models, collections, users matching the search",
							"schema": {
								"$ref": "#/definitions/GlobalSearchResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"name": "q",
							"in": "query"
						}
					],
					"description": "Search in models, collections, users"
				}
			},
			"/v3/users/{uid}": {
				"get": {
					"description": "Returns details about a user",
					"tags": [
						"users"
					],
					"responses": {
						"200": {
							"schema": {
								"$ref": "#/definitions/UserDetail"
							},
							"examples": {
								"application/json": {
									"response": {
										"website": null,
										"subscriptionCount": 0,
										"followerCount": 0,
										"uid": "53bac75dbbde4525b78f11e07e98c267",
										"modelsUrl": "https://api.sketchfab.com/v3/models??user=bot",
										"likeCount": 0,
										"facebookUsername": null,
										"biography": null,
										"dateJoined": "2016-04-20T11:44:11.084906",
										"city": null,
										"account": "pro",
										"displayName": "bot",
										"profileUrl": "https://sketchfab.com/bot",
										"followingsUrl": "https://api.sketchfab.com/v3/users/53bac75dbbde4525b78f11e07e98c267/followings",
										"skills": [],
										"tagline": null,
										"uri": "https://api.sketchfab.com/v3/users/53bac75dbbde4525b78f11e07e98c267",
										"modelCount": 1,
										"username": "bot",
										"linkedinUsername": null,
										"likesUrl": "https://api.sketchfab.com/v3/models??liked_by=bot",
										"followersUrl": "https://api.sketchfab.com/v3/users/53bac75dbbde4525b78f11e07e98c267/followers",
										"collectionCount": 0,
										"country": null,
										"followingCount": 0,
										"twitterUsername": null,
										"collectionsUrl": "https://api.sketchfab.com/v3/collections??by=bot",
										"avatar": {
											"images": [
												{
													"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/0f5f69d691a946df94e46f60ef2933cd.jpeg",
													"width": 100,
													"height": 100,
													"size": 3011
												},
												{
													"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/91587bbdc9f349deab76f26ff440df5f.jpeg",
													"width": 90,
													"height": 90,
													"size": 2657
												},
												{
													"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/f1919a08fcb04cb29cac88d7c052bbab.jpeg",
													"width": 48,
													"height": 48,
													"size": 1243
												},
												{
													"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/3a459d2c418240e1afb9b48614e2b61f.jpeg",
													"width": 32,
													"height": 32,
													"size": 776
												}
											],
											"updatedAt": "2016-04-20T09:42:25.973491",
											"uri": "https://api.sketchfab.com/v3/avatars/7c5b5af6f9174567a0295135a5b8b04f",
											"createdAt": "2016-04-20T09:42:25.973491",
											"name": "avatar-orange.jpg"
										}
									}
								}
							},
							"description": "Successful response"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/licences/{uid}": {
				"get": {
					"produces": [
						"application/json"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/LicencesDetail"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"description": "get the details of a particular licence available on sketchfab"
				}
			},
			"/v3/models": {
				"post": {
					"responses": {
						"201": {
							"description": "Created"
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "model name",
							"in": "formData",
							"name": "name"
						},
						{
							"required": false,
							"type": "boolean",
							"description": "this model should be private? (default false)",
							"in": "formData",
							"name": "private"
						},
						{
							"required": false,
							"type": "string",
							"description": "set a password on the model",
							"in": "formData",
							"name": "password"
						},
						{
							"required": false,
							"type": "string",
							"description": "name of an existing license",
							"in": "formData",
							"name": "licence"
						},
						{
							"required": false,
							"type": "string",
							"description": "comma separated list of tag slugs",
							"in": "formData",
							"name": "tags"
						},
						{
							"required": false,
							"type": "string",
							"description": "comma separated list of categories slug",
							"in": "formData",
							"name": "categories"
						},
						{
							"required": true,
							"type": "file",
							"description": "the actual model",
							"in": "formData",
							"name": "modelFile"
						},
						{
							"required": false,
							"type": "string",
							"description": "the model file name",
							"in": "formData",
							"name": "modelFileName"
						},
						{
							"required": false,
							"type": "boolean",
							"description": "weither the model is published or not (default true)",
							"in": "formData",
							"name": "is_published"
						},
						{
							"required": false,
							"type": "string",
							"description": "model description",
							"in": "formData",
							"name": "description"
						},
						{
							"required": false,
							"type": "string",
							"description": "json describing the options to use for the model. See \"/v3/models/{uid}/options\" endpoint.\n",
							"in": "formData",
							"name": "options"
						}
					],
					"tags": [
						"models"
					],
					"security": [
						{
							"Token": []
						}
					],
					"consumes": [
						"multipart/form-data"
					],
					"description": "Upload a new model to the sketchfab platform. Despite other methods, upload must be issued using multipart/form-data\n"
				},
				"get": {
					"description": "Returns list of model. Private, unpublished,\n  models cannot be retreived with this method.This endpoint is **paginated** by 24 models per pages.\n",
					"tags": [
						"models"
					],
					"responses": {
						"200": {
							"schema": {
								"$ref": "#/definitions/ModelResponse"
							},
							"examples": {
								"application/json": {
									"response": {
										"next": "api.sketchfab.com/v3/models/cursor=azerty",
										"results": [
											{
												"website": null,
												"subscriptionCount": 0,
												"followerCount": 0,
												"uid": "53bac75dbbde4525b78f11e07e98c267",
												"viewCount": 11,
												"modelsUrl": "https://api.sketchfab.com/v3/models??user=bot",
												"likeCount": 0,
												"facebookUsername": null,
												"biography": null,
												"dateJoined": "2016-04-20T11:44:11.084906",
												"city": null,
												"account": "pro",
												"displayName": "bot",
												"profileUrl": "https://sketchfab.com/bot",
												"followingsUrl": "https://api.sketchfab.com/v3/users/53bac75dbbde4525b78f11e07e98c267/followings",
												"skills": [],
												"tagline": null,
												"uri": "https://api.sketchfab.com/v3/users/53bac75dbbde4525b78f11e07e98c267",
												"modelCount": 1,
												"username": "bot",
												"linkedinUsername": null,
												"likesUrl": "https://api.sketchfab.com/v3/models??liked_by=bot",
												"followersUrl": "https://api.sketchfab.com/v3/users/53bac75dbbde4525b78f11e07e98c267/followers",
												"collectionCount": 0,
												"country": null,
												"followingCount": 0,
												"twitterUsername": null,
												"collectionsUrl": "https://api.sketchfab.com/v3/collections??by=bot",
												"avatar": {
													"images": [
														{
															"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/0f5f69d691a946df94e46f60ef2933cd.jpeg",
															"width": 100,
															"height": 100,
															"size": 3011
														},
														{
															"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/91587bbdc9f349deab76f26ff440df5f.jpeg",
															"width": 90,
															"height": 90,
															"size": 2657
														},
														{
															"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/f1919a08fcb04cb29cac88d7c052bbab.jpeg",
															"width": 48,
															"height": 48,
															"size": 1243
														},
														{
															"url": "https://media.sketchfab.com/avatars/7c5b5af6f9174567a0295135a5b8b04f/3a459d2c418240e1afb9b48614e2b61f.jpeg",
															"width": 32,
															"height": 32,
															"size": 776
														}
													],
													"updatedAt": "2016-04-20T09:42:25.973491",
													"uri": "https://api.sketchfab.com/v3/avatars/7c5b5af6f9174567a0295135a5b8b04f",
													"createdAt": "2016-04-20T09:42:25.973491",
													"name": "avatar-orange.jpg"
												}
											}
										],
										"previous": null
									}
								}
							},
							"description": "Successful response"
						},
						"404": {
							"description": "Not Found"
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "used for pagination",
							"in": "query",
							"name": "cursor"
						},
						{
							"required": false,
							"type": "integer",
							"description": "pagination size. max 24",
							"in": "query",
							"name": "count"
						},
						{
							"required": false,
							"type": "string",
							"description": "either createdAt, -createdAt, viewCount or -viewCount",
							"in": "query",
							"name": "sort_by"
						},
						{
							"required": false,
							"type": "string",
							"description": "a `username`. Retreives the models uploaded by `user`",
							"in": "query",
							"name": "user"
						},
						{
							"required": false,
							"type": "string",
							"description": "a tag slug. Retreives the models tagged with the query filter tags. If used multiple time, return models tagged with all the specified tags.",
							"in": "query",
							"name": "tags"
						},
						{
							"required": false,
							"type": "string",
							"description": "array of categories slug. Retreives the models in the specified categories",
							"in": "query",
							"name": "categories"
						},
						{
							"required": false,
							"type": "string",
							"description": "a username retreives the models liked by user",
							"in": "query",
							"name": "likedBy"
						},
						{
							"required": false,
							"type": "integer",
							"name": "maxFaceCount",
							"in": "query"
						},
						{
							"in": "query",
							"description": "Retreives the models published after sinceDate",
							"format": "date",
							"required": false,
							"type": "string",
							"name": "publishedSince"
						},
						{
							"required": false,
							"type": "boolean",
							"description": "Retreives the models staffpicked",
							"in": "query",
							"name": "staffpicked"
						},
						{
							"required": false,
							"type": "boolean",
							"description": "Retreives the models that have a licence. (hence are downloadable)",
							"in": "query",
							"name": "downloadable"
						},
						{
							"required": false,
							"type": "boolean",
							"description": "Retreives the models with an animation_count greater than 0.",
							"in": "query",
							"name": "animated"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/models/{uid}/options": {
				"patch": {
					"description": "Change a model options",
					"tags": [
						"models"
					],
					"responses": {
						"204": {
							"description": "No-Content"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": false,
							"type": "string",
							"description": "define the shadding type either lit or shadeless",
							"in": "formData",
							"name": "shading"
						},
						{
							"required": false,
							"type": "string",
							"description": "define the background used. Either a color, an image, an environment or transparent. ex. {\"color\": \"#ffffff\"} or {\"environment\": \"aeff32435ffabcdd\"}\n",
							"in": "formData",
							"name": "background"
						},
						{
							"required": false,
							"type": "string",
							"description": "either a 4x4 matrix or an angle with an axis.\n",
							"in": "formData",
							"name": "orientation"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/me/followings": {
				"post": {
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"users"
					],
					"responses": {
						"204": {
							"description": "Sucessfull add"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"description": "the user uid you want to follow",
							"in": "formData",
							"name": "toUser"
						}
					],
					"produces": [
						"application/json"
					]
				},
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"users",
						"relationships"
					],
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/UserResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "number of objects returned per page. Max 24",
							"in": "query",
							"name": "count"
						},
						{
							"required": false,
							"type": "string",
							"description": "either dateJoined, -dateJoined, followerCount or -followerCount",
							"in": "query",
							"name": "sort_by"
						},
						{
							"required": false,
							"type": "string",
							"description": "used for pagination",
							"in": "query",
							"name": "cursor"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/tags/{slug}": {
				"get": {
					"tags": [
						"tags"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/TagRelated"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "slug",
							"in": "path"
						}
					],
					"description": "get detail about a tag"
				}
			},
			"/v3/categories": {
				"get": {
					"description": "return the list of available categories",
					"tags": [
						"categories"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/CategoriesResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"name": "cursor",
							"in": "query"
						},
						{
							"required": false,
							"type": "string",
							"description": "number of objects returned per page. Max 24",
							"in": "query",
							"name": "count"
						},
						{
							"required": false,
							"type": "string",
							"description": "either slug or -slug",
							"in": "query",
							"name": "sort_by"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/me/subscriptions": {
				"post": {
					"responses": {
						"201": {
							"description": "Sucessfull add"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"description": "the collection uid you want to subscribe",
							"in": "formData",
							"name": "collection"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"collections"
					],
					"description": "add a collection to your subscriptions"
				},
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"description": "Return collections the user subscribed",
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/CollectionResponse"
							}
						}
					},
					"tags": [
						"me",
						"collections"
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/me/models": {
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"models"
					],
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/ModelResponse"
							}
						}
					},
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/collections/{uid}": {
				"put": {
					"description": "adds/remove models to a collection",
					"tags": [
						"collections"
					],
					"responses": {
						"204": {
							"description": "No Content, Successful update of the collection"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": true,
							"in": "body",
							"description": "list of models uids in the collection.",
							"name": "models"
						}
					],
					"produces": [
						"application/json"
					]
				},
				"get": {
					"description": "Returns details about a collection",
					"tags": [
						"collections"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/CollectionDetail"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					]
				},
				"patch": {
					"description": "adds/remove models to a collection",
					"tags": [
						"collections"
					],
					"responses": {
						"204": {
							"description": "No Content, Successful update of the collection"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": true,
							"in": "body",
							"description": "list of models uids in the collection.",
							"name": "models"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/me/likes": {
				"post": {
					"responses": {
						"201": {
							"description": "Model sucessfully liked"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"description": "the model uid you want to like",
							"in": "formData",
							"name": "model"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"models"
					],
					"description": "like a model"
				},
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"models",
						"likes"
					],
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/UserResponse"
							}
						}
					},
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/collections/{uid}/models": {
				"get": {
					"description": "returns models of a collection",
					"tags": [
						"collections",
						"models"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/CollectionModelResponse"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": false,
							"type": "string",
							"name": "cursor",
							"in": "query"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/me/likes/{uid}": {
				"delete": {
					"responses": {
						"204": {
							"description": "Sucessfull delete"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"users",
						"me",
						"likes"
					],
					"description": "un-like a model"
				}
			},
			"/v3/me/environments": {
				"post": {
					"description": "Create a new environment. You need to have a pro account for doing this",
					"parameters": [
						{
							"required": true,
							"type": "string",
							"description": "the environment name",
							"in": "formData",
							"name": "name"
						},
						{
							"required": true,
							"type": "file",
							"description": "the environment file you wich to upload",
							"in": "formData",
							"name": "environmentFile"
						}
					],
					"produces": [
						"aplication/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"environment"
					],
					"consumes": [
						"multipart/form-data"
					],
					"responses": {
						"201": {
							"description": "Sucessfully Created"
						}
					}
				},
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"description": "list available environments (default environments and yours)",
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/EnvironmentResponse"
							}
						}
					},
					"tags": [
						"me",
						"environment"
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/licenses": {
				"get": {
					"produces": [
						"application/json"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#definitions/LicencesResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "used for pagination",
							"in": "query",
							"name": "cursor"
						},
						{
							"required": false,
							"type": "integer",
							"description": "pagination size. max 24",
							"in": "query",
							"name": "count"
						}
					],
					"description": "get the available licences on sketchfab"
				}
			},
			"/v3/search?type=users": {
				"get": {
					"tags": [
						"search",
						"users"
					],
					"responses": {
						"200": {
							"description": "Users matching the search",
							"schema": {
								"$ref": "#/definitions/UserSearchResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"name": "q",
							"in": "query"
						},
						{
							"required": false,
							"type": "string",
							"name": "username",
							"in": "query"
						},
						{
							"required": false,
							"type": "string",
							"description": "either country or city",
							"in": "query",
							"name": "location"
						},
						{
							"required": false,
							"type": "string",
							"description": "either free, pro, biz",
							"in": "query",
							"name": "account"
						},
						{
							"required": false,
							"type": "array",
							"description": "skills slugs",
							"in": "query",
							"name": "skills"
						},
						{
							"required": false,
							"type": "string",
							"description": "slug of a segment",
							"in": "query",
							"name": "segment"
						},
						{
							"required": false,
							"type": "string",
							"description": "either followerCount, -followerCount, modelCount, -modelCount or username",
							"in": "query",
							"name": "sort_by"
						}
					],
					"description": "Search and filters in users"
				}
			},
			"/v3/categories/{uid}": {
				"get": {
					"description": "return details about a category",
					"tags": [
						"categories"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/CategoriesRelated"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/skills": {
				"get": {
					"description": "return a list of available skills",
					"tags": [
						"skills"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/SkillsResponse"
							}
						}
					},
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/tags": {
				"get": {
					"tags": [
						"tags"
					],
					"responses": {
						"200": {
							"description": "get a list of tags",
							"schema": {
								"$ref": "#/definitions/TagsResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"name": "cursor",
							"in": "query"
						}
					],
					"description": "Successful response"
				}
			},
			"/v3/me/background": {
				"post": {
					"responses": {
						"201": {
							"description": "Create a new background (needs to be have a pro account"
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "file",
							"description": "the image background",
							"in": "formData",
							"name": "image"
						}
					],
					"produces": [
						"application/json"
					],
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"models",
						"me"
					],
					"consumes": [
						"multipart/form-data"
					]
				},
				"get": {
					"security": [
						{
							"Token": []
						}
					],
					"tags": [
						"me",
						"models",
						"backgrounds"
					],
					"responses": {
						"200": {
							"description": "Successfull result",
							"schema": {
								"$ref": "#/definitions/BackgroundResponse"
							}
						}
					},
					"parameters": [
						{
							"required": false,
							"type": "string",
							"description": "either createdAt or -createdAt",
							"in": "query",
							"name": "sort_by"
						},
						{
							"required": false,
							"type": "integer",
							"description": "pagination size. max 24",
							"in": "query",
							"name": "count"
						}
					],
					"produces": [
						"application/json"
					]
				}
			},
			"/v3/collections/thumbnails": {
				"get": {
					"tags": [
						"collection",
						"thumbnails"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/CollectionsThumbnailsResponse"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "array",
							"name": "uids",
							"in": "query"
						}
					],
					"description": "returns the thumbnails of the three most popular model for each collection"
				}
			},
			"/v3/users/{uid}/followings": {
				"get": {
					"description": "Returns users followed by a particular user",
					"tags": [
						"users",
						"relationships"
					],
					"responses": {
						"200": {
							"description": "Successful response",
							"schema": {
								"$ref": "#/definitions/UserResponse"
							}
						}
					},
					"parameters": [
						{
							"required": true,
							"type": "string",
							"name": "uid",
							"in": "path"
						},
						{
							"required": false,
							"type": "string",
							"name": "cursor",
							"in": "query"
						}
					],
					"produces": [
						"application/json"
					]
				}
			}
		},
		"schemes": [
			"https"
		],
		"tags": [
			{
				"name": "models"
			},
			{
				"name": "users"
			},
			{
				"name": "collections"
			},
			{
				"name": "avatars"
			},
			{
				"name": "categories"
			},
			{
				"name": "skills"
			},
			{
				"name": "environments"
			},
			{
				"name": "tags"
			},
			{
				"name": "relationships"
			},
			{
				"name": "backgrounds"
			},
			{
				"name": "thumbnails"
			},
			{
				"name": "likes"
			},
			{
				"name": "search"
			}
		],
		"securityDefinitions": {
			"Token": {
				"type": "apiKey",
				"name": "Authorization",
				"in": "header"
			}
		},
		"host": "api.sketchfab.com",
		"definitions": {
			"CollectionList": {
				"type": "object",
				"properties": {
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"description": {
						"type": [
							"string",
							"null"
						]
					},
					"models": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					},
					"modelCount": {
						"type": "integer"
					},
					"user": {
						"type": "string"
					},
					"updatedAt": {
						"type": "string",
						"format": "date"
					},
					"owner": {
						"$ref": "#/definitions/UserDetail"
					},
					"embedUrl": {
						"type": "string"
					},
					"uid": {
						"type": "string"
					},
					"slug": {
						"type": "string"
					},
					"thumbnails": {
						"items": {
							"$ref": "#/definitions/ThumbnailsRelated"
						},
						"type": "object"
					},
					"name": {
						"type": "string"
					}
				}
			},
			"MeDetail": {
				"type": "object",
				"properties": {
					"website": {
						"type": "string"
					},
					"subscriptionCount": {
						"type": "integer"
					},
					"followerCount": {
						"type": "integer"
					},
					"uid": {
						"type": "string"
					},
					"modelsUrl": {
						"type": "string"
					},
					"likeCount": {
						"type": "integer"
					},
					"billingCycle": {
						"type": "string"
					},
					"facebookUsername": {
						"type": "string"
					},
					"biography": {
						"type": "string"
					},
					"dateJoined": {
						"type": "string",
						"format": "date"
					},
					"city": {
						"type": "string"
					},
					"account": {
						"type": "string"
					},
					"displayName": {
						"type": "string"
					},
					"profileUrl": {
						"type": "string"
					},
					"followingsUrl": {
						"type": "string"
					},
					"skills": {
						"items": {
							"$ref": "#/definitions/SkillDetail"
						},
						"type": "array"
					},
					"tagline": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					},
					"modelCount": {
						"type": "integer"
					},
					"apiToken": {
						"type": "string"
					},
					"username": {
						"type": "string"
					},
					"linkedinUsername": {
						"type": "string"
					},
					"likesUrl": {
						"type": "string"
					},
					"followersUrl": {
						"type": "string"
					},
					"collectionCount": {
						"type": "integer"
					},
					"country": {
						"type": "string"
					},
					"followingCount": {
						"type": "integer"
					},
					"twitterUsername": {
						"type": "string"
					},
					"collectionsUrl": {
						"type": "string"
					},
					"email": {
						"type": "string"
					},
					"avatar": {
						"$ref": "#/definitions/AvatarRelated"
					}
				}
			},
			"AvatarRelated": {
				"type": "object",
				"properties": {
					"image": {
						"type": "string"
					},
					"updatedAt": {
						"type": "string",
						"format": "date"
					},
					"name": {
						"type": "string"
					},
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"uri": {
						"type": "string"
					}
				}
			},
			"UserSearchResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/UserSearchList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"CollectionsThumbnailsResponse": {
				"type": "object",
				"properties": {
					"results": {
						"items": {
							"$ref": "#/definitions/ThumbnailsRelated"
						},
						"type": "array"
					}
				}
			},
			"EnvironmentResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/Environment"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"ModelSearchList": {
				"type": "object",
				"properties": {
					"viewCount": {
						"type": "integer"
					},
					"uid": {
						"type": "string"
					},
					"name": {
						"type": "string"
					},
					"animationCount": {
						"type": "integer"
					},
					"viewerUrl": {
						"type": "string"
					},
					"isPublished": {
						"type": "boolean"
					},
					"publishedAt": {
						"type": "string",
						"format": "date"
					},
					"likeCount": {
						"type": "integer"
					},
					"commentCount": {
						"type": "integer"
					},
					"staffpickedAt": {
						"type": [
							"string",
							"null"
						],
						"format": "date"
					},
					"user": {
						"$ref": "#/definitions/UserRelated"
					},
					"downloadCount": {
						"type": "integer"
					},
					"embedUrl": {
						"type": "string"
					},
					"isDownloadable": {
						"type": "boolean"
					},
					"thumbnails": {
						"$ref": "#/definitions/ThumbnailsRelated"
					}
				}
			},
			"UserRelated": {
				"type": "object",
				"properties": {
					"username": {
						"type": "string"
					},
					"profileUrl": {
						"type": "string"
					},
					"account": {
						"type": "string"
					},
					"displayName": {
						"type": "string"
					},
					"uid": {
						"type": "string"
					},
					"avatars": {
						"items": {
							"$ref": "#/definitions/AvatarRelated"
						},
						"type": "array"
					},
					"uri": {
						"type": "string"
					}
				}
			},
			"UserDetail": {
				"type": "object",
				"properties": {
					"website": {
						"type": [
							"string",
							"null"
						]
					},
					"subscriptionCount": {
						"type": "integer"
					},
					"followerCount": {
						"type": "integer"
					},
					"uid": {
						"type": "string"
					},
					"modelsUrl": {
						"type": "string"
					},
					"portfolioUrl": {
						"type": "string"
					},
					"likeCount": {
						"type": "integer"
					},
					"facebookUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"biography": {
						"type": [
							"string",
							"null"
						]
					},
					"dateJoined": {
						"type": "string",
						"format": "date"
					},
					"city": {
						"type": [
							"string",
							"null"
						]
					},
					"account": {
						"type": "string"
					},
					"displayName": {
						"type": "string"
					},
					"profileUrl": {
						"type": "string"
					},
					"followingsUrl": {
						"type": "string"
					},
					"skills": {
						"items": {
							"$ref": "#/definitions/SkillDetail"
						},
						"type": "array"
					},
					"tagline": {
						"type": [
							"string",
							"null"
						]
					},
					"uri": {
						"type": "string"
					},
					"modelCount": {
						"type": "integer"
					},
					"username": {
						"type": "string"
					},
					"linkedinUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"likesUrl": {
						"type": "string"
					},
					"followersUrl": {
						"type": "string"
					},
					"collectionCount": {
						"type": "integer"
					},
					"country": {
						"type": [
							"string",
							"null"
						]
					},
					"followingCount": {
						"type": "integer"
					},
					"twitterUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"collectionsUrl": {
						"type": "string"
					},
					"avatar": {
						"$ref": "#/definitions/AvatarRelated"
					}
				}
			},
			"ModelResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/ModelList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"BackgroundResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/BackgroundList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"UserList": {
				"type": "object",
				"properties": {
					"website": {
						"type": [
							"string",
							"null"
						]
					},
					"subscriptionCount": {
						"type": "integer"
					},
					"followerCount": {
						"type": "integer"
					},
					"uid": {
						"type": "string"
					},
					"modelsUrl": {
						"type": "string"
					},
					"portfolioUrl": {
						"type": "string"
					},
					"likeCount": {
						"type": "integer"
					},
					"facebookUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"biography": {
						"type": [
							"string",
							"null"
						]
					},
					"dateJoined": {
						"type": "string",
						"format": "date"
					},
					"city": {
						"type": [
							"string",
							"null"
						]
					},
					"account": {
						"type": "string"
					},
					"displayName": {
						"type": "string"
					},
					"profileUrl": {
						"type": "string"
					},
					"followingsUrl": {
						"type": "string"
					},
					"skills": {
						"items": {
							"$ref": "#/definitions/SkillDetail"
						},
						"type": "array"
					},
					"tagline": {
						"type": [
							"string",
							"null"
						]
					},
					"uri": {
						"type": "string"
					},
					"modelCount": {
						"type": "integer"
					},
					"username": {
						"type": "string"
					},
					"linkedinUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"likesUrl": {
						"type": "string"
					},
					"followersUrl": {
						"type": "string"
					},
					"collectionCount": {
						"type": "integer"
					},
					"country": {
						"type": [
							"string",
							"null"
						]
					},
					"followingCount": {
						"type": "integer"
					},
					"twitterUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"collectionsUrl": {
						"type": "string"
					},
					"avatar": {
						"$ref": "#/definitions/AvatarRelated"
					}
				}
			},
			"Licences": {
				"type": "object",
				"properties": {
					"url": {
						"type": "string"
					},
					"fullName": {
						"type": "string"
					},
					"requirements": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					},
					"label": {
						"type": "string"
					}
				}
			},
			"CollectionPost": {
				"type": "object",
				"properties": {
					"models": {
						"items": {
							"type": "string"
						},
						"type": "array"
					},
					"name": {
						"type": "string"
					},
					"description": {
						"type": "string"
					}
				}
			},
			"CollectionSearchResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/CollectionSearchList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"SkillDetail": {
				"type": "object",
				"properties": {
					"name": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					}
				}
			},
			"LicencesResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/Licences"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"CollectionModelResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/ModelList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"ModelList": {
				"type": "object",
				"properties": {
					"description": {
						"type": [
							"string",
							"null"
						]
					},
					"tags": {
						"items": {
							"$ref": "#/definitions/TagRelated"
						},
						"type": "array"
					},
					"publishedAt": {
						"type": "string",
						"format": "date"
					},
					"likeCount": {
						"type": "integer"
					},
					"commentCount": {
						"type": "integer"
					},
					"user": {
						"$ref": "#/definitions/UserRelated"
					},
					"animationCount": {
						"type": "integer"
					},
					"uid": {
						"type": "string"
					},
					"categories": {
						"items": {
							"$ref": "#/definitions/CategoriesRelated"
						},
						"type": "array"
					},
					"name": {
						"type": "string"
					},
					"viewCount": {
						"type": "integer"
					},
					"thumbnails": {
						"$ref": "#/definitions/ThumbnailsRelated"
					},
					"uri": {
						"type": "string"
					},
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"faceCount": {
						"type": "integer"
					},
					"staffpickedAt": {
						"type": [
							"string",
							"null"
						],
						"format": "date"
					},
					"isDownloadable": {
						"type": "boolean"
					},
					"embedUrl": {
						"type": "string"
					}
				}
			},
			"MePatch": {
				"type": "object",
				"properties": {
					"website": {
						"type": [
							"string",
							"null"
						]
					},
					"city": {
						"type": [
							"string",
							"null"
						]
					},
					"displayName": {
						"type": [
							"string",
							"null"
						]
					},
					"skills": {
						"type": [
							"array",
							"null"
						]
					},
					"country": {
						"type": [
							"string",
							"null"
						]
					},
					"password_confirmation": {
						"type": [
							"string",
							"null"
						]
					},
					"linkedinUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"interest": {
						"type": [
							"array",
							"null"
						]
					},
					"tagline": {
						"type": [
							"string",
							"null"
						]
					},
					"twitterUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"password": {
						"type": [
							"string",
							"null"
						]
					},
					"facebookUsername": {
						"type": [
							"string",
							"null"
						]
					},
					"email": {
						"type": [
							"string",
							"null"
						]
					},
					"biography": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"TagsResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/TagRelated"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"UserSearchList": {
				"type": "object",
				"properties": {
					"username": {
						"type": "string"
					},
					"city": {
						"type": [
							"string",
							"null"
						]
					},
					"followerCount": {
						"type": "integer"
					},
					"displayName": {
						"type": "string"
					},
					"uid": {
						"type": "string"
					},
					"skills": {
						"items": {
							"$ref": "#/definitions/SkillDetail"
						},
						"type": "array"
					},
					"country": {
						"type": [
							"string",
							"null"
						]
					},
					"account": {
						"type": "string"
					},
					"modelCount": {
						"type": "integer"
					},
					"avatars": {
						"$ref": "#/definitions/AvatarRelated"
					},
					"profileUrl": {
						"type": "string"
					}
				}
			},
			"ThumbnailsRelated": {
				"type": "object",
				"properties": {
					"images": {
						"items": {
							"type": "object",
							"properties": {
								"url": {
									"type": "string"
								},
								"width": {
									"type": "integer"
								},
								"size": {
									"type": [
										"integer",
										"null"
									]
								},
								"uid": {
									"type": "string"
								},
								"height": {
									"type": "integer"
								}
							}
						},
						"type": "array"
					}
				}
			},
			"CategoriesRelated": {
				"type": "object",
				"properties": {
					"uri": {
						"type": "string"
					},
					"uid": {
						"type": "string"
					},
					"name": {
						"type": "string"
					},
					"slug": {
						"type": "string"
					}
				}
			},
			"ModelDetail": {
				"type": "object",
				"properties": {
					"status": {
						"type": "object"
					},
					"files": {
						"items": {
							"$ref": "#/definitions/File"
						},
						"type": "array"
					},
					"uid": {
						"type": "string"
					},
					"tags": {
						"items": {
							"$ref": "#/definitions/TagRelated"
						},
						"type": "array"
					},
					"viewerUrl": {
						"type": "string"
					},
					"categories": {
						"items": {
							"$ref": "#/definitions/CategoriesRelated"
						},
						"type": "array"
					},
					"publishedAt": {
						"type": "string",
						"format": "date"
					},
					"likeCount": {
						"type": "integer"
					},
					"commentCount": {
						"type": "integer"
					},
					"vertexCount": {
						"type": "integer"
					},
					"user": {
						"$ref": "#/definitions/UserRelated"
					},
					"animationCount": {
						"type": "integer"
					},
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"description": {
						"type": [
							"string",
							"null"
						]
					},
					"viewCount": {
						"type": "integer"
					},
					"thumbnails": {
						"$ref": "#/definitions/ThumbnailsRelated"
					},
					"license": {
						"type": "object"
					},
					"editorUrl": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					},
					"archiveSize": {
						"type": "integer"
					},
					"name": {
						"type": "string"
					},
					"originalFileName": {
						"type": [
							"object",
							"null"
						]
					},
					"faceCount": {
						"type": "integer"
					},
					"ext": {
						"type": [
							"string",
							"null"
						]
					},
					"staffpickedAt": {
						"type": [
							"string",
							"null"
						],
						"format": "date"
					},
					"isDownloadable": {
						"type": "boolean"
					},
					"downloadCount": {
						"type": "integer"
					},
					"embedUrl": {
						"type": "string"
					},
					"options": {
						"type": "object"
					}
				}
			},
			"ModelPatch": {
				"type": "object",
				"properties": {
					"name": {
						"type": "string"
					},
					"tags": {
						"items": {
							"type": "string"
						},
						"type": "array"
					},
					"description": {
						"type": "string"
					},
					"private": {
						"type": "boolean"
					},
					"source": {
						"type": "string"
					},
					"licence": {
						"type": "string"
					},
					"password": {
						"type": "string"
					},
					"options": {
						"type": "string",
						"description": "json describing the options to use for the model. See \"/v3/models/{uid}/options\" endpoint.\n"
					},
					"categories": {
						"items": {
							"type": "string"
						},
						"type": "array"
					},
					"is_published": {
						"type": "boolean"
					}
				}
			},
			"GlobalSearchResponse": {
				"type": "object",
				"properties": {
					"results": {
						"type": "object",
						"properties": {
							"models": {
								"items": {
									"$ref": "#/definitions/ModelSearchList"
								},
								"type": "array"
							},
							"collections": {
								"items": {
									"$ref": "#/definitions/CollectionSearchList"
								},
								"type": "array"
							},
							"users": {
								"items": {
									"$ref": "#/definitions/UserSearchResponse"
								},
								"type": "array"
							}
						}
					}
				}
			},
			"CategoriesResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/CategoriesRelated"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"CollectionSearchList": {
				"type": "object",
				"properties": {
					"description": {
						"type": [
							"string",
							"null"
						]
					},
					"collectionUrl": {
						"type": "string"
					},
					"modelCount": {
						"type": "integer"
					},
					"user": {
						"$ref": "#/definitions/UserRelated"
					},
					"updatedAt": {
						"type": "string",
						"format": "date"
					},
					"uid": {
						"type": "string"
					},
					"embedUrl": {
						"type": "string"
					},
					"slug": {
						"type": "string"
					},
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"name": {
						"type": "string"
					}
				}
			},
			"ModelSearchResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/ModelSearchList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"Environment": {
				"type": "object",
				"properties": {
					"uid": {
						"type": "string"
					},
					"brightness": {
						"type": "integer"
					},
					"processing": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					},
					"isDefault": {
						"type": "boolean"
					},
					"diffuseSPH": {
						"type": "string"
					},
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"name": {
						"type": "string"
					}
				}
			},
			"LicencesDetail": {
				"type": "object",
				"properties": {
					"url": {
						"type": "string"
					},
					"fullName": {
						"type": "string"
					},
					"requirements": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					},
					"label": {
						"type": "string"
					}
				}
			},
			"BackgroundList": {
				"type": "object",
				"properties": {
					"name": {
						"type": "string"
					},
					"updatedAt": {
						"type": "string",
						"format": "date"
					},
					"images": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					},
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"isDefault": {
						"type": "boolean"
					}
				}
			},
			"CollectionResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/CollectionList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"UserResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/UserList"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"CollectionDetail": {
				"type": "object",
				"properties": {
					"description": {
						"type": [
							"string",
							"null"
						]
					},
					"uri": {
						"type": "string"
					},
					"modelCount": {
						"type": "integer"
					},
					"createdAt": {
						"type": "string",
						"format": "date"
					},
					"updatedAt": {
						"type": "string",
						"format": "date"
					},
					"owner": {
						"$ref": "#/definitions/UserDetail"
					},
					"embedUrl": {
						"type": "string"
					},
					"uid": {
						"type": "string"
					},
					"slug": {
						"type": "string"
					},
					"thumbnails": {
						"items": {
							"$ref": "#/definitions/ThumbnailsRelated"
						},
						"type": "object"
					},
					"name": {
						"type": "string"
					}
				}
			},
			"SkillsResponse": {
				"type": "object",
				"properties": {
					"previous": {
						"type": [
							"string",
							"null"
						]
					},
					"results": {
						"items": {
							"$ref": "#/definitions/SkillDetail"
						},
						"type": "array"
					},
					"next": {
						"type": [
							"string",
							"null"
						]
					}
				}
			},
			"TagRelated": {
				"type": "object",
				"properties": {
					"slug": {
						"type": "string"
					},
					"uri": {
						"type": "string"
					}
				}
			},
			"File": {
				"type": "object",
				"properties": {
					"wireframeSize": {
						"type": "integer"
					},
					"flag": {
						"type": "integer"
					},
					"version": {
						"type": "string"
					},
					"modelSize": {
						"type": "integer"
					},
					"uri": {
						"type": "string"
					},
					"osgjsSize": {
						"type": "integer"
					},
					"metadata": {
						"type": "object"
					}
				}
			}
		},
		"swagger": "2.0"
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=SketchfabDataApi.js.map