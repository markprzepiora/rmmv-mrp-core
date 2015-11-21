# MRP.MapExporter

Simply call `MRP.MapExporter();` inside your console or through an event to
take and save a screenshot of the entire map, without your character (but all
events) present.

Screenshots are saved to your game folder in a subfolder called `MapExporter`.

This might fail for very large maps, depending on how limited your computer's
resources are. You may either get a blank PNG, or your game may crash. In this
case, you can pass an optional named parameter to `MRP.MapExporter()` like so,

```js
MRP.MapExporter({ pagesPerImage: 3 });
```

Doing this will save a sequence of images, each one at most 3 screen widths
across and down in size. The files will be suffixed with `00`, `01`, `10`,
`11`, and so on, with the first number giving the `x` value, and the second
number giving the `y` value. You can connect these together manually in
Photoshop or Gimp to get a full image.
