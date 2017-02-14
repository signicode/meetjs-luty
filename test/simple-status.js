#!/usr/bin/env node

const TwitJet = require('../lib/twit-jet');

new TwitJet(require('../twitter-config.json'))
    .stream({
        track: '#walentynki'
    }, 'tweet')
    .map(
        (tweet) => tweet.entities && tweet.entities.hashtags
    )
    .filter(
        Array.isArray
    )
    .flatMap()
    ;
