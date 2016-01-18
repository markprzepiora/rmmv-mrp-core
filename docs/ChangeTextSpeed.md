# MRP.ChangeTextSpeed

This is installed by default when you include `rmmv-mrp-core.js` or
`rmmv-mrp-core--change-text-speed.js` in your plugins.

You can use escape codes `\S[n]` to alter the speed at which text scrolls in a
message window. The parameter `n` specifies the number of extra frames to wait
in between characters. Try `\S[2]` and higher for a nice effect. `\S[0]` resets
the speed back to the default.

The speed will apply to all text after the escape sequence, and you can alter
the speed multiple times during a message.

Example:

```
\S[2]It was a dark and stormy night\S[20]...\S[0] Just kidding.\|
But for real,\| \S[2]it was pouring that night\S[20]...
```

![](ChangeTextSpeed-example.gif)
