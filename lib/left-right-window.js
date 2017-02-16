const hashtags = new Map();
const MovingTimeWindowStream = require("./window");

const left = {value: 0, name: ""};
const right = {value: 0, name: ""};

module.exports = class LeftRightWindowStream extends MovingTimeWindowStream.TimeFrameMovingWindow {

    _push(item) {
        let val;

        hashtags.set(item, val = (hashtags.has(item) ? hashtags.get(item) + 1 : 1));

        if (val > left.value && item !== right.name || item === left.name) {
            left.name = item;
            left.value = val;
        } else if (val > right.value || item === right.name) {
            right.name = item;
            right.value = val;
        }
    }

    _shift(items) {
        let change = false;
        for (var item of items) {
            if (item === left.name || item === right.name)
                change = true;

            const cnt = hashtags.get(item);
            if (cnt > 1) {
                hashtags.set(item, cnt - 1);
            } else {
                hashtags.delete(item);
            }
        }

        if (change) {
            for (let entry of hashtags.entries()) {
                if (entry[1] > left.value && entry[0] !== right.name) {
                    left.name = entry[0];
                    left.value = entry[1];
                } else if (entry[1] > right.value) {
                    right.name = entry[0];
                    right.value = entry[1];
                }
            }
        }
    }

    _change(items) {
        return {
            count: items.length,
            left: left,
            right: right
        };
    }
};
