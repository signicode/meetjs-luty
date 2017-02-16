#!/usr/bin/env node

const TwitJet = require('../lib/twit-jet');
const push = require("../lib/push-io");
const LeftRightWindowStream = require('../lib/left-right-window');
const MovingTimeWindowStream = require("../lib/window");

const options = require("yargs").argv;

const cfg = {};
if (options._.length) cfg.track = options._;
if (options.loc) cfg.locations =  options.loc;
if (options.follow) cfg.follow =  options.follow;
if (options.lang) cfg.language =  options.lang;

console.log("Crunching tweets for... ", cfg);

new TwitJet(require('../../twitter-config.json'))
    .statuses(cfg, 'tweet')
    .map(
        (tweet) => Object.assign({
            text: options._.filter(
                (a) => tweet.text.toLowerCase().indexOf(a.toLowerCase()) >= 0
            )
        }, tweet.entities)
    )
    .flatMap(
        (a) => {
            const ret = a.hashtags
                .map(a => a.text)
                .filter(a => a)
                .map(a => a.toLowerCase());
            return ret;
        }
    )
    .filter(
        a => !cfg.track || cfg.track.indexOf(a) === -1
    )
    .each(
        a => console.log(a, !cfg.track, cfg.track.indexOf(a))
    )
    .pipe(
        new MovingTimeWindowStream({time: 300e3, WindowClass: LeftRightWindowStream})
    )
    .each(
        push.update
    )
    .on(
        "error", (e) => console.error(e && e.stack)
    )
;

push.start(200);
