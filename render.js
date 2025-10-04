(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
      // AMD
      define('renderGeoJson', factory);
  } else if (typeof module !== 'undefined' && module.exports) {
      // CommonJS/Node.js
      module.exports = factory();
  } else {
      // Browser global
      root.geoJsonModule = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  function renderGeoJson(coordinates,size) {
    /*
    size: {angle, minX, minY, minZ, maxX, maxY, maxZ, scale, scaleX, scaleY, scaleZ, offsetX, offsetY}
    */
    push();
    rotateZ(radians(size.angle));
    let g = max(size.maxX*size.scale+size.offsetX, size.maxY*size.scale+size.offsetY)
    camera(g,g, size.maxZ*size.scaleZ+200,0,0,0,1,1,0);
    background(100, 150, 200);
    let b = 255;
    pointLight(b, b, b - 10, 0, 0, size.maxZ*size.scaleZ+200);
    ambientLight(b / 5, b / 5, b / 5);
    fill(0, 255, 0);
    noFill();
    strokeWeight(1);
    /*
    beginShape();
    vertex(size.minX * size.scale + size.offsetX, size.minY * size.scale + size.offsetY, size.maxZ * size.scaleZ);
    vertex(size.maxX * size.scale + size.offsetX, size.minY * size.scale + size.offsetY, size.maxZ * size.scaleZ);
    vertex(size.maxX * size.scale + size.offsetX, size.maxY * size.scale + size.offsetY, size.maxZ * size.scaleZ);
    vertex(size.minX * size.scale + size.offsetX, size.maxY * size.scale + size.offsetY, size.maxZ * size.scaleZ);
    endShape(CLOSE);
    */
    let count = 0;
    for (let tri of coordinates) {
        fill(10,randomGaussian(122.5,10),10);
        beginShape();
        for (let v of tri) {
            count++;
            vertex(v[0] * size.scale + size.offsetX, v[1] * size.scale + size.offsetY, v[2] * size.scaleZ);
        }
        endShape(CLOSE);
    }
    pop();
  }
  function calcTriangles(geoJsonData, skip) {
    let xyPlane = [];
    let zPlaneMap = new Map(); 
    skip = skip || 1; // Process every feature by default
    // Map to associate xyPlane coordinates with zPlane values

    if (!geoJsonData || !geoJsonData.features) {
      console.error("Data not loaded");
      return;
    }
  
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    let j = 0;
    //Collect coordinates and calculate bounding box
    for (let i = 0; i < geoJsonData.features.length; i+=skip) {
      let feature = geoJsonData.features[i];
      if (feature.geometry != null) {
        if (feature.geometry.type === "MultiLineString") {
          for (let ring of feature.geometry.coordinates) {
            for (let coord of ring) {
              j++;
              let xy = [coord[0], coord[1]];
              xyPlane.push(coord[0], coord[1]);
              zPlaneMap.set(xy.toString(), feature.properties.ContourEle / 10);
              minX = min(minX, coord[0]);
              minY = min(minY, coord[1]);
              maxX = max(maxX, coord[0]);
              maxY = max(maxY, coord[1]);
              minZ = min(minZ, feature.properties.ContourEle / 10);
              maxZ = max(maxZ, feature.properties.ContourEle / 10);
            }
          }
        } else if (feature.geometry.type === "LineString") {
          for (let coord of feature.geometry.coordinates) {
            j++;
            let xy = [coord[0], coord[1] ];
            xyPlane.push(coord[0], coord[1] );
            zPlaneMap.set(xy.toString(), feature.properties.ContourEle / 10);
            minX = min(minX, coord[0]);
            minY = min(minY, coord[1]);
            maxX = max(maxX, coord[0]);
            maxY = max(maxY, coord[1]);
            minZ = min(minZ, feature.properties.ContourEle / 10);
            maxZ = max(maxZ, feature.properties.ContourEle / 10);
          }
        } else {
          console.warn("Unsupported feature type. Only LineString and MultiLineString are currently supported.");
        }
      }
    }
    //console.log("Collected", j, "points");
    let d = new Delaunator(xyPlane);
    let triangles = d.triangles;
  
    // Determine scaling factors
    let scaleX = 1000 / (maxX - minX);
    let scaleY = 1000 / (maxY - minY);
    let scaleZ = 200 / (maxZ - minZ);
    let scale = min(scaleX, scaleY);
    let offsetX = 0 - (minX + maxX) / 2 * scale;
    let offsetY = 0 - (minY + maxY) / 2 * scale;
    let coordinates = [];
    for (let i = 0; i < triangles.length; i += 3) {
      let k = [];
      for (let j = 0; j < 3; j++) {
        let point = [xyPlane[2 * triangles[i + j]], xyPlane[2 * triangles[i + j] + 1]];
        if (!zPlaneMap.has(point.toString())) {
          console.warn("Missing z value for point:", point);
        } else {
          k.push([...point, zPlaneMap.get(point.toString())]);
        }
        coordinates.push(k);
      }
    }
    let calcSize = {minX, minY, minZ, maxX, maxY, maxZ, scale, scaleX, scaleY, scaleZ, offsetX, offsetY, angle:0}
    geoJsonModule.renderGeoJson(coordinates, calcSize);
    return [coordinates, calcSize];
  }
  return {
    renderGeoJson,
    calcTriangles
  };
}));