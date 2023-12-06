"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = require("express");
var _index = require("../controllers/index.controllers");
var router = (0, _express.Router)();
router.get('/page', _index.sendPage);
router.get('/weight', _index.sendWeight);
var _default = exports["default"] = router;