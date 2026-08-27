export function zoom(zoomLevel: number, zoomDirection: number,  zoomStep: number = 0.1){
    const maxZoomLevel = 5;
    const minZoomLevel = 0.18
    let newZoomLevel = 1
    
    if (zoomDirection < 0) {
        newZoomLevel = zoomLevel - zoomStep
    } else {
        newZoomLevel = zoomLevel + zoomStep
    }
    switch (true) {
        case newZoomLevel >= maxZoomLevel:
            return maxZoomLevel;
        case newZoomLevel <= minZoomLevel:
            return minZoomLevel;
        default:
            return newZoomLevel;
    }

    
}