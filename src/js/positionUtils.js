((app) => {
    const position = {
        getPixelPosition: (position, axis) => {

            var pos = position;
            switch(axis){
                case 'x': 
                    if(app.runtimeCache?.basePosition?.x) {
                        pos -= app.runtimeCache.basePosition.x
                    }
                break;
                case 'y': 
                    if(app.runtimeCache?.basePosition?.y) {
                        pos -= app.runtimeCache.basePosition.y
                    }
                    break;
                default: throw "pixel position could not be calculated, unknown axis: " + axis
            }

            return Math.ceil(pos/app.config.pixelSize) * app.config.pixelSize
        }
    }
    
    app.utils = {} || app.utils;
    app.utils.position = position;
})(app);