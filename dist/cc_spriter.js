/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	/**
	 * Spriter plugin for Cocos2d HTML5
	 * @version 1.0.0
	 * @author Denis Baskovsky (denis@baskovsky.ru)
	 *
	 * Based on Spriter.js by:
	 * - Sean Bohan pixelpicosean@gmail.com
	 * - Jason Andersen jgandersen@gmail.com
	 * - Isaac Burns isaacburns@gmail.com
	 */

	'use strict';

	cc.Spriter = cc.Sprite.extend({
	    /* Loading indicator */
	    _ready: false,

	    /* Resources path */
	    sconLink: '',
	    sconPath: '',

	    _entity: null,
	    _animation: null,

	    data: null,
	    pose: null,

	    /**
	     * Spriter constructor
	     * @param {String} sconLink scon file to use for this animation
	     */
	    ctor: function ctor(sconLink) {
	        var _this = this;

	        this._super();

	        this.sconLink = sconLink;
	        this.preload(function (data) {
	            if (data.error) {
	                throw data.error;
	            }
	            _this._ready = true;
	            _this.setEntity(_this._entity);
	            _this.setAnim(_this._animation);
	            _this.scheduleUpdate();
	        });
	    },

	    /**
	     * Set entity
	     * @param entity
	     */
	    setEntity: function setEntity(entity) {
	        this._entity = entity;

	        if (this._ready) {
	            this.pose.setEntity(entity);
	        }
	    },

	    /**
	     * Set animation
	     * @param animation
	     */
	    setAnim: function setAnim(animation) {
	        this._animation = animation;

	        if (this._ready) {
	            this.pose.setAnim(animation);
	        }
	    },

	    /**
	     * Prealod scon resource
	     * @param {function} callback
	     */
	    preload: function preload(callback) {
	        var _this2 = this;

	        var sconLink = this.sconLink;

	        if (this._ready) {
	            return callback({
	                error: 'уже установлено'
	            });
	        }

	        cc.loader.loadJson(sconLink, function (error, scon) {
	            if (error) {
	                return callback({ error: error });
	            }

	            var sconPath = scon.sconPath = sconLink.replace(/\w+.scon$/, '');
	            var loaderIndex = 0;

	            var data = _this2.data = new spriter.Data().load(scon); // create and load Spriter data from SCON file
	            var pose = _this2.pose = new spriter.Pose(data); // create Spriter pose and attach data

	            /* Getting file count */
	            scon.folder.forEach(function (folder) {
	                return folder.file.forEach(function () {
	                    return ++loaderIndex;
	                });
	            });

	            data.folder_array.forEach(function (folder) {
	                folder.file_array.forEach(function (file) {

	                    switch (file.type) {
	                        case 'image':
	                            var image_key = file.name;
	                            var fileUrl = sconPath + file.name;

	                            cc.loader.loadImg(fileUrl, function (error, img) {
	                                if (error) {
	                                    return callback({ error: error });
	                                }

	                                var texture = new cc.Texture2D();
	                                texture.initWithElement(img);

	                                var spriteFrame = new cc.SpriteFrame();
	                                spriteFrame.setTexture(texture);

	                                var rect = cc.rect(0, 0, file.width, file.height);
	                                spriteFrame.setRect(rect);

	                                cc.spriteFrameCache.addSpriteFrame(spriteFrame, image_key);

	                                if (--loaderIndex === 0) {
	                                    return callback({ error: false });
	                                }
	                            });
	                            break;

	                        case 'sound':
	                            break;

	                        default:
	                            cc.log("TODO: load", file.type, file.name);
	                            break;
	                    }
	                });
	            });
	        });
	    },

	    /**
	     * Update every tick
	     * @param dt
	     */
	    update: function update(dt) {
	        var _this3 = this;

	        dt = 1000 / 60; // time step in milliseconds
	        this.removeAllChildrenWithCleanup(true);
	        this.pose.update(dt); // accumulate time
	        this.pose.strike(); // process time slice
	        this.pose.object_array.forEach(function (object) {
	            switch (object.type) {
	                case 'sprite':
	                    var folder = _this3.pose.data.folder_array[object.folder_index];
	                    if (!folder) {
	                        return;
	                    }
	                    var file = folder.file_array[object.file_index];
	                    if (!file) {
	                        return;
	                    }
	                    var image_key = file.name;

	                    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(image_key);
	                    if (spriteFrame) {
	                        var sprite = new cc.Sprite();
	                        sprite.setSpriteFrame(spriteFrame);
	                        sprite.setOpacity(object.alpha * 255);
	                        sprite.setPositionX(object.world_space.position.x);
	                        sprite.setPositionY(object.world_space.position.y);
	                        sprite.setScaleX(object.world_space.scale.x);
	                        sprite.setScaleY(object.world_space.scale.y);
	                        sprite.setRotation(-object.world_space.rotation.deg);

	                        _this3.addChild(sprite);
	                    }
	                    break;
	                case 'entity':
	                    cc.log('TODO ');
	                    break;
	            }
	        });
	    }
	});

/***/ }
/******/ ]);