export class Transform {
    constructor(...args) {
        if (args[0] instanceof Transform) {
            const [other] = args;
            this.translate = [...other.translate];
            this.scale = [...other.scale];
            this.rotate = other.rotate;
        } else {
            this.translate = [0, 0];
            this.scale = [0, 0];
            this.rotate = 0;
        }
    }
}
