export class Transform {
    constructor(...args) {
        if (args[0] instanceof Transform) {
            const [other] = args;
            this.translate = {...other.translate};
            this.scale = {...other.scale};
            this.rotate = other.rotate;
        } else {
            const [tx, ty, sx, sy, r] = args;
            this.translate = {x: tx || 0, y: ty || 0};
            this.scale = {x: sx || 1, y: sy || 1}
            this.rotate = r || 0;
        }
    }

    getTransform(appendTransform = new Transform()) {
        return 'translate(' + (this.translate.x + appendTransform.translate.x) + ',' +
            (this.translate.y + appendTransform.translate.y) + ') scale(' + 
            (this.scale.x * appendTransform.scale.x) + ',' +
            (this.scale.y * appendTransform.scale.y) + ') rotate(' +
            (this.rotate + appendTransform.rotate) + ')';  
    }
}
