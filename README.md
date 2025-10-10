<h1 style="text-align:center">3D-geoJSON-renderer</h1>

This library is suitable for web use. It leverages an existing [Delaunay triangulation algorithm](https://github.com/mapbox/delaunator) and the [p5.js library](https://p5js.org/) for rendering.

![Three dimensional green hills](https://github.com/devastator111/3D-geoJSON-renderer/blob/main/Demo.png?raw=true "Example three dimensional terrain")
Example three dimensional terrain
# Demo
https://devastator111.github.io/3D-geoJSON-renderer/
# Usage
```
{"type":"FeatureCollection", "features":[
    {"type":"Feature", "geometry":{type:"LineString", "coordinates":[[x,y], [x,y], ]}, "properties":{ContourEle:"z"}},

    {"type":"Feature", "geometry":{type:"MultiLineString", "coordinates":[[[x,y], [x,y], ],[[x,y],[x,y], ], ]}, "properties":{ContourEle:"z"}}
]}

```

The library can currently handle LineString and MultiLineString GeoJSON objects.
```
function setup() {
    const json = loadJSON("path/to/file.url");
    let map = geoJsonModule.calcTriangles(json,1);
    /*
    map = [
        [[[x,y,z],[x,y,z],[x,y,z]],[[x,y,z],[x,y,z],[x,y,z]]],
        {angle, minX, minY, minZ, maxX, maxY, maxZ, scale, scaleX, scaleY, scaleZ, offsetX, offsetY}
    ]
    */
}
```

The second argument describes the resolution to be calculated from the file; a resolution of 1 means that no features will be skipped, a resolution of 3 means that only 1 in 3 features will be used.  The function returns an array of 2 items: the first is the array of triangle to be used in rendering, the other is an object of the properties to determined how it is rendered.
```
function draw() {
    geoJsonModule.renderGeoJson(map[0],map[1]);
}
```

Use the p5.js draw function (or else another function like keyPressed) to render the data from the calcTriangles function.

