export function parseTransform(element, transforms = {translate: [0, 0], scale: [0, 0], rotate: 0}) {
    const transformList = element.transform.baseVal;
    
    for (let i = 0; i < transformList.numberOfItems; ++i) {
        const transform = transformList.getItem(i);
        const matrix = transform.matrix;

        switch (transform.type) {
            case 2:
                transforms.translate[0] += matrix.e;
                transforms.translate[1] += matrix.f;
                break;
            case 3:
                transforms.scale[0] += matrix.a;
                transforms.scale[1] += matrix.d;
                break;
            case 4:
                transforms.rotate += transform.angle;
                break;
            default:
                break;
        }
    }

    return transforms;
}
