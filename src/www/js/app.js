﻿/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		//app.checkPlugin();
		app.receivedEvent('deviceready');
	},
	// Update DOM on a Received Event
	receivedEvent: function(id) {
		console.log('Received Event: ' + id);
		app.bbuistart();
	},
	bbuistart: function() {
		// 确保只执行一次
		if (webworksreadyFired) return;
		webworksreadyFired = true;
		var config;

		// 主题配置
		if (darkColoring) {
			config = {
				controlsDark: true,
				listsDark: true
			};
		} else {
			config = {
				controlsDark: false,
				listsDark: false,
				coloredTitleBar: true
			};
		}

		// 在DOM显示之前的配置
		config.onscreenready = function(element, id) {
			console.log('Pushing: ' + id);
			if (darkColoring) {
				var screen = element.querySelector('[data-bb-type=screen]');
				if (screen) {
					screen.style['background-color'] = darkScreenColor;
				}
			}

		};

		// 在DOM显示之后的配置
		config.ondomready = function(element, id, params) {
			if (id == 'menu') {
				loadContent(element, id);
			}
		};

		bb.init(config);

		// 因为BBUI 0.9.6本身没有对黑暗主题的支持，这里需要手动将背景设置为黑色。
		if (darkColoring) {
			document.body.style['background-color'] = darkScreenColor;
			document.body.style['color'] = 'white';
		}
		bb.pushScreen('main.html', 'menu');
	}
};

function getJSON(URL) {
	//URL 参数要以 "http://" 开始。
	try {
		return JSON.parse(community.curl.get(URL));
	} catch (e) {
		window.alert('不能连接到服务器，请重试。');
		location.reload(true);
	}
}

function loadContent(element, id) {
	//载入内容，strdate是要显示的日期，此处显示当前日期。
	var d = new Date();
	var strdate = d.format('yyyy-MM-dd');
	
	loadAll(element, strdate);

	//定位到HOME处。
	showTab('home');
}

function g(id) {
	//因为没在用jQuery，这里简化了两个方法。
	return gg(document,id);
}

function gg(doc, id) {
	return doc.getElementById(id);
}

function loadAll(element, strdate) {
	//载入所有内容
	currentdisplaydate = strdate;

	//载入封面
	loadhome(element, strdate);
	
	setTimeout(function(){
		//1秒后载入“内容”部分
		loadOne(element, strdate);
		}, 100);
	setTimeout(function(){
		//1秒后载入“问题”部分
		loadQuestion(element, strdate);
		}, 100);
	
}

function loadhome(element, strdate) {
	//载入封面
	var data;
	if (localStorage[strdate + 'home']) {
		//如果已经缓存，就从缓存中读取
		data = JSON.parse(localStorage[strdate + 'home']);
	} else {
		//否则就要访问官方API获取
		data = one.getHomePage(strdate)["hpEntity"];
		setTimeout(function() {
			//100MS后存入缓存，这里避免内容太大，导致存入缓存的时候时间太长，产生延迟。
			localStorage[strdate + 'home'] = JSON.stringify(data);
		}, 100);
	}

	//向模板中填数据
	gg(element, 'home-title').innerHTML = strdate;
	gg(element, 'home-img').src = data['strOriginalImgUrl'];
	gg(element, 'home-img').lowsrc = data['strThumbnailUrl'];
	gg(element, 'home-vol').innerHTML = data['strHpTitle'];
	gg(element, 'home-img-by').innerHTML = data['strAuthor'].replace(/&/g, '<br/>');
	gg(element, 'home-content').innerHTML = data['strContent'];

	
	console.log('Home Loaded.')
}

function loadOne(e, strdate) {
	var content;
	if (localStorage[strdate + 'one']) {
		content = JSON.parse(localStorage[strdate + 'one']);
	} else {
		content = one.getOneContentInfo(strdate)["contentEntity"];
		setTimeout(function() {
			localStorage[strdate + 'one'] = JSON.stringify(content);
		}, 100);
	}
	gg(e, 'c-brief').innerHTML = content['sGW'];
	gg(e, 'c-title').innerHTML = content['strContTitle'];
	gg(e, 'c-author-intro').innerHTML = content['strContAuthorIntroduce'];
	gg(e, 'c-author').innerHTML = content['strContAuthor'];
	gg(e, 'c-content').innerHTML = "<p>" + content['strContent'].replace(/<br>/g, "</p><p>") + "</p>";
	console.log('Content Loaded.');
}

function loadQuestion(e, strdate) {
	var ask;
	if (localStorage[strdate + 'ask']) {
		ask = JSON.parse(localStorage[strdate + 'ask']);
	} else {
		ask = one.getOneQuestionInfo(strdate)['questionAdEntity'];
		setTimeout(function() {
			localStorage[strdate + 'ask'] = JSON.stringify(ask);
		}, 1000);
	}
	gg(e, 'q-title').innerHTML = ask['strQuestionTitle'];
	gg(e, 'q-content').innerHTML = ask['strQuestionContent'];
	gg(e, 'a-title').innerHTML = ask['strAnswerTitle'];
	gg(e, 'a-content').innerHTML = ask['strAnswerContent'];
	console.log('Question Loaded.')
}

Date.prototype.format = function(format) {
	//对Date对象的扩展，实现日期格式化功能。
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	}
	if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o) if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
	return format;
}

function showTab(id) {
	//显示到指定栏目
	document.location.hash = "";//加这句是为了防止出现在看到一半的时候又点击结果导航失效的问题。
	// switch between tabs.
	if (id == 'home') {
		//g('home').style.display = "block";
		//g('content').style.display = "none";
		//g('ask').style.display = "none";
		document.location.hash = "#h-top";
	} else if (id == 'content') {
		//g('content').style.display = "block";
		//g('home').style.display = "none";
		//g('ask').style.display = "none";
		document.location.hash = "#c-top";
	} else if (id == 'question') {
		//g('ask').style.display = "block";
		//g('home').style.display = "none";
		//g('content').style.display = "none";
		document.location.hash = "#q-top";
	}
}

var currentdisplaydate;//正在显示的《一个》的发布日期。